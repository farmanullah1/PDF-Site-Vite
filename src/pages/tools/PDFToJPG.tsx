import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { Button } from '../../components/pdf/ToolOptionsPanel';
import { readFileAsArrayBuffer, downloadBlob, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { FileText, Download, X, Image, Grid3X3 } from 'lucide-react';

const tool = toolById('pdf-to-jpg')!;

const DPI_OPTIONS = [
  { value: '72', label: '72 DPI — small, fast (web preview)' },
  { value: '150', label: '150 DPI — balanced (recommended)' },
  { value: '300', label: '300 DPI — high quality (large files)' },
];

export default function PDFToJPG() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [dpi, setDpi] = useState('150');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<Array<{ index: number; imageUrl: string; width: number; height: number }>>([]);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    ensurePdfJs().then((lib) => { pdfJsLib.current = lib; }).catch(() => {});
  }, []);

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      const url = URL.createObjectURL(f);
      setFile({ file: f, url, pages: 0 });
      setError(null);
      setPages([]);
      try {
        const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } } | null;
        if (!lib) { setError('PDF.js is still loading. Please wait.'); return; }
        const r = await fetch(url);
        const buf = await r.arrayBuffer();
        const pdf = await lib.getDocument({ data: buf }).promise as { numPages: number };
        setFile((p) => (p && p.file === f ? { ...p, pages: pdf.numPages } : p));
      } catch (e) {
        setError('Could not read the PDF. ' + (e instanceof Error ? e.message : ''));
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPages([]);
    setError(null);
  }, [file]);

  const doConvert = useCallback(async () => {
    if (!file) return;
    if (!pdfJsLib.current) { setError('PDF.js is still loading. Please wait.'); return; }
    setLoading(true);
    setError(null);
    setPages([]);
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { numPages: number; getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number; rotation?: number }) => { width: number; height: number } }> };
      const total = pdf.numPages;
      const scale = parseInt(dpi, 10) / 72;
      const out: Array<{ index: number; imageUrl: string; width: number; height: number }> = [];
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const rot = (page as { rotate?: number }).rotate ?? 0;
        const vp = page.getViewport({ scale, rotation: rot });
        const c = document.createElement('canvas');
        c.width = Math.ceil(vp.width);
        c.height = Math.ceil(vp.height);
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        await (page as unknown as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
        const dataUrl = c.toDataURL('image/jpeg', 0.92);
        out.push({ index: i, imageUrl: dataUrl, width: Math.ceil(vp.width), height: Math.ceil(vp.height) });
      }
      setPages(out);
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Could not render the PDF.') + ' (Make sure PDF.js loaded from CDN.)');
    } finally {
      setLoading(false);
    }
  }, [file, dpi]);

  const ready = file !== null && !loading;

  const downloadImage = useCallback((dataUrl: string, filename: string) => {
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => downloadBlob(blob, filename))
      .catch(() => {});
  }, []);

  if (pages.length > 0) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">
            {pages.length} page{pages.length === 1 ? '' : 's'} rendered to JPG
          </h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Rendered {file!.pages} page{file!.pages === 1 ? '' : 's'} at {dpi} DPI. Click each image to download it as a JPG.
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <div
                key={p.index}
                className="group flex items-start gap-4 rounded-xl border border-[#c4c4cc] bg-white p-3 transition-all hover:border-[#161616]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7253e2]/10 text-[#7253e2] shrink-0">
                  <Grid3X3 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm font-medium text-[#161616]">Page {p.index}</span>
                  <span className="text-xs text-[#47474f]">{p.width} × {p.height} px</span>
                </div>
                <img src={p.imageUrl} alt={`Page ${p.index}`} className="h-16 w-12 rounded-lg border border-[#c4c4cc] object-cover shrink-0" />
                <button
                  onClick={() => downloadImage(p.imageUrl, `page-${p.index}.jpg`)}
                  className="flex items-center justify-center rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] px-3 py-1.5 text-sm text-[#161616] transition-colors hover:border-[#161616] hover:bg-white"
                  aria-label={`Download page ${p.index}`}
                >
                  <Download size={15} className="inline mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
          Your file was processed entirely in your browser. Nothing was uploaded.
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
          label="Select the PDF to convert"
          helper="One file at a time"
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        >
          {file === null && (
            <p className="mt-2 text-xs text-[#47474f]">Drag & drop or click to browse.</p>
          )}
        </Dropzone>
      </div>

      {file && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7253e2]/10 text-[#7253e2]">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-[#161616]">{file.file.name}</span>
                <span className="text-xs text-[#47474f]">{file.pages} page{file.pages === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
            >
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Image size={18} className="text-[#7253e2]" />
            <h3 className="text-[1.125rem] font-semibold text-[#161616]">Conversion options</h3>
          </div>
          <div className="flex flex-col gap-4">
            <Select
              label="Resolution"
              value={dpi}
              onChange={setDpi}
              options={DPI_OPTIONS}
              help="Higher DPI gives sharper images but larger files."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button onClick={doConvert} disabled={!ready} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Rendering pages…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Image size={15} />
              Convert to JPG
            </span>
          )}
        </Button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Each PDF page becomes a downloadable JPG. PDF.js renders the pages to images in your browser.
        </p>
      </div>
    </StandardLayout>
  );
}

