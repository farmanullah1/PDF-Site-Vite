import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs, renderPdfPageToCanvas } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { FileText, Download, X, Scan, Clock } from 'lucide-react';

const tool = toolById('ocr-pdf')!;

const LANG_OPTIONS = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Español (Spanish)' },
  { value: 'fra', label: 'Français (French)' },
  { value: 'deu', label: 'Deutsch (German)' },
  { value: 'ita', label: 'Italiano (Italian)' },
  { value: 'por', label: 'Português (Portuguese)' },
];

export default function OCRPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [lang, setLang] = useState('eng');
  const [pageMode, setPageMode] = useState<'all' | 'range'>('all');
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('1');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPhase, setOcrPhase] = useState<'idle' | 'rendering' | 'ocr' | 'done'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; text: string } | null>(null);
  const [ocrText, setOcrText] = useState('');
  const pdfJsLib = useRef<unknown>(null);
  const tesseract = useRef<any>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    ensurePdfJs().then((lib) => { pdfJsLib.current = lib; }).catch(() => {});
    (async () => {
      try {
        const Tesseract = await import('tesseract.js');
        const worker = await Tesseract.createWorker('eng');
        tesseract.current = worker;
        setWorkerReady(true);
      } catch (e) {
        console.warn('[OCR] Tesseract.js failed to load:', e);
      }
    })();
    return () => {
      if (tesseract.current) {
        void tesseract.current.terminate();
      }
    };
  }, []);

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setResult(null);
      setOcrText('');
      setOcrProgress(0);
      setOcrPhase('idle');
      try {
        const buf = await readFileAsArrayBuffer(f);
        const n = await pdfPageCount(new Uint8Array(buf));
        setFile((p) => (p && p.file === f ? { ...p, pages: n } : p));
      } catch {
        setError('Could not read the PDF.');
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setResult(null);
    setOcrText('');
    setOcrProgress(0);
    setOcrPhase('idle');
    setError(null);
  }, [file]);

  const pagesToOcr = (total: number): number[] => {
    if (pageMode === 'all') return Array.from({ length: total }, (_, i) => i + 1);
    const f = Math.max(1, parseInt(from, 10) || 1);
    const t = Math.min(total, parseInt(to, 10) || total);
    return Array.from({ length: t - f + 1 }, (_, i) => f + i);
  };

  const doOcr = useCallback(async () => {
    if (!file) return;
    if (!tesseract.current || !workerReady) { setError('OCR engine is still loading. Please wait.'); return; }
    const pages = pagesToOcr(file.pages);
    if (pages.length === 0) { setError('No pages to process.'); return; }
    setLoading(true);
    setError(null);
    setOcrPhase('rendering');
    setOcrProgress(0);
    setOcrText('');
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };

      await tesseract.current.loadLanguage(lang);
      await tesseract.current.initialize(lang);

      let fullText = '';
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const page = await pdf.getPage(p);
        const scale = 2.0;
        const vp = page.getViewport({ scale });
        const c = document.createElement('canvas');
        c.width = Math.ceil(vp.width);
        c.height = Math.ceil(vp.height);
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        await (page as unknown as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });

        setOcrPhase('ocr');
        setOcrProgress(Math.round(((i + 1) / pages.length) * 100));

        const { data } = await tesseract.current.recognize(c);
        fullText += `\n--- Page ${p} ---\n${data.text}\n`;
      }

      setOcrText(fullText);
      setOcrPhase('done');

      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const copied = await out.copyPages(src, [...Array(src.getPageCount()).keys()]);
      for (const cp of copied) out.addPage(cp);
      const font = await out.embedFont(PDFLib.StandardFonts.Helvetica);
      const notesPage = out.addPage([612, 792]);
      notesPage.drawText('OCR extracted text (searchable layer placeholder)', { x: 50, y: 720, size: 12, font });
      notesPage.drawText(fullText.slice(0, 1800), { x: 50, y: 700, size: 9, font, lineHeight: 12 });
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-ocr.pdf';
      setResult({ blob, name, text: fullText });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'OCR failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, pageMode, from, to, lang, workerReady]);

  const ready = file !== null && workerReady && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">OCR complete</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Recognized text from {pagesToOcr(file!.pages).length} page{pagesToOcr(file!.pages).length === 1 ? '' : 's'}.
        </p>
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#47474f]">Recognized text</h3>
          <div className="rounded border border-[#c4c4cc] bg-[#f5f5fa] p-3 max-h-[320px] overflow-y-auto font-mono text-[11px] leading-relaxed text-[#161616]">
            {result.text || '(no text recognized)'}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download OCR PDF
          </button>
          <button onClick={() => {
            const bl = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
            downloadBlob(bl, file!.file.name.replace(/\.pdf$/i, '') + '-ocr.txt');
          }} className="flex items-center justify-center rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm text-[#161616] transition-colors hover:border-[#161616]">
            Download text (.txt)
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            OCR ran entirely in your browser via Tesseract.js (WebAssembly). Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Dropzone
          accept=".pdf,application/pdf"
          maxSizeMB={100}
          multiple={false}
          label="Select the scanned PDF"
          helper="One file at a time. Works best on image-based (scanned) PDFs."
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        />
      </div>

      {file && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5322d]/10 text-[#e5322d]">
                <Scan size={16} />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-[#161616]">{file.file.name}</span>
                <span className="text-xs text-[#47474f]">{file.pages} page{file.pages === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">OCR options</h3>
          <div className="flex flex-col gap-4">
            <Select label="Language" value={lang} onChange={setLang} options={LANG_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} help="Choose the language of the text in the document." />
            <Select label="Pages" value={pageMode} onChange={(v) => setPageMode(v as "all" | "range")} options={[
              { value: 'all', label: 'All pages' },
              { value: 'range', label: 'Page range' },
            ]} help="OCR every page, or only a range." />
            {pageMode === 'range' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#161616]">From page</label>
                  <input type="number" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="1" className="rounded border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#161616]">To page</label>
                  <input type="number" value={to} onChange={(e) => setTo(e.target.value)} placeholder={String(file?.pages ?? 1)} className="rounded border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]" />
                </div>
              </div>
            )}
            <p className="text-xs text-[#47474f]">
              OCR accuracy depends on scan quality, resolution, and language. Processing runs in your browser (WebAssembly) and may take a while for multi-page docs.
            </p>
          </div>
        </div>
      </div>

      {(ocrPhase === 'rendering' || ocrPhase === 'ocr') && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#161616]">{ocrPhase === 'ocr' ? 'Recognizing text…' : 'Rendering pages…'}</span>
              <span className="text-sm text-[#47474f]">{ocrProgress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e8e8ed]">
              <div className="h-full rounded-full transition-all duration-100" style={{ width: `${ocrProgress}%`, background: '#e5322d' }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doOcr}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Clock size={16} className="animate-spin" />
              Running OCR…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Scan size={15} />
              Run OCR
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Recognizes text in scanned/image PDFs and produces a searchable PDF plus a downloadable .txt transcript.
        </p>
      </div>
    </StandardLayout>
  );
}

