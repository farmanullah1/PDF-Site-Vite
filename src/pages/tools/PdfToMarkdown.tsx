import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { FileText, Download, X, Copy, Clock } from 'lucide-react';

const tool = toolById('pdf-to-markdown')!;

export default function PdfToMarkdown() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [pageMode, setPageMode] = useState<'all' | 'range'>('all');
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('1');
  const [includePageBreaks, setIncludePageBreaks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ markdown: string; name: string } | null>(null);
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
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setResult(null);
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
    setError(null);
  }, [file]);

  const pagesToExtract = (total: number): number[] => {
    if (pageMode === 'all') return Array.from({ length: total }, (_, i) => i + 1);
    const f = Math.max(1, parseInt(from, 10) || 1);
    const t = Math.min(total, parseInt(to, 10) || total);
    return Array.from({ length: t - f + 1 }, (_, i) => f + i);
  };

  const doExtract = useCallback(async () => {
    if (!file) return;
    if (!pdfJsLib.current) { setError('PDF.js is still loading. Please wait.'); return; }
    const pages = pagesToExtract(file.pages);
    if (pages.length === 0) { setError('No pages to extract.'); return; }
    setLoading(true);
    setError(null);
    try {
      const lib = pdfJsLib.current as any;
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise;

      const parts: string[] = [];
      parts.push(`# ${file.file.name.replace(/\.pdf$/i, '')}`);
      parts.push('');
      parts.push('*Converted from PDF to Markdown — generated entirely in your browser.*');
      parts.push('');

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const text = content.items.map((item: { str: string }) => item.str).join(' ').trim();

        if (text) {
          // Basic heuristics: short lines with caps become headings
          const isLikelyHeading = text.length < 80 && /^[A-Z0-9#\-\*\s]+$/.test(text) && !text.includes('.');
          if (isLikelyHeading) {
            parts.push(`## ${text}`);
          } else {
            parts.push(text);
          }
          parts.push('');
        }

        if (includePageBreaks && i < pages.length - 1) {
          parts.push('---');
          parts.push('');
        }
      }

      const markdown = parts.join('\n').trimEnd() + '\n';
      const name = file.file.name.replace(/\.pdf$/i, '') + '.md';
      setResult({ markdown, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Markdown conversion failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, pageMode, from, to, includePageBreaks]);

  const ready = file !== null && !!pdfJsLib.current && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Markdown ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#47474f]">Preview</h3>
          <div className="rounded border border-[#c4c4cc] bg-[#f5f5fa] p-3 max-h-[320px] overflow-y-auto font-mono text-[11px] leading-relaxed text-[#161616]">
            {result.markdown.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' }), result.name)} className="btn-primary w-full">
            Download Markdown (.md)
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(result.markdown).then(() => setError('Markdown copied to clipboard.')).catch(() => {});
          }} className="flex items-center justify-center rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm text-[#161616] transition-colors hover:border-[#161616]">
            <Copy size={14} /> Copy markdown
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Converted entirely in your browser via PDF.js. Nothing was uploaded. Headings are detected heuristically — review the output before publishing.
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
          label="Select the PDF to convert to Markdown"
          helper="One file at a time. Works best on text-based PDFs (not scanned images)."
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
                <FileText size={16} />
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
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Conversion options</h3>
          <div className="flex flex-col gap-4">
            <Select label="Pages" value={pageMode} onChange={(v) => setPageMode(v as 'all' | 'range')} options={[
              { value: 'all', label: 'All pages' },
              { value: 'range', label: 'Page range' },
            ]} help="Convert every page, or only a range." />
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
            <div className="flex items-start gap-3">
              <input
                id="include-page-breaks"
                type="checkbox"
                checked={includePageBreaks}
                onChange={(e) => setIncludePageBreaks(e.target.checked)}
                className="rounded border-[#c4c4cc] bg-[#f5f5fa] text-[#e5322d] focus:ring-[#e5322d] h-4 w-4"
              />
              <label htmlFor="include-page-breaks" className="text-sm text-[#161616] leading-none cursor-pointer select-none">
                Insert page-break separators (`---`) between pages
              </label>
            </div>
            <p className="text-xs text-[#47474f]">
              Scanned/image-based PDFs contain no embedded text layer, so nothing will be converted. Use OCR PDF for scanned documents.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doExtract}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Clock size={16} className="animate-spin" />
              Converting to Markdown…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileText size={15} />
              Convert to Markdown
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Pulls the embedded text layer from each page and formats it as Markdown. Runs entirely in your browser via PDF.js.
        </p>
      </div>
    </StandardLayout>
  );
}
