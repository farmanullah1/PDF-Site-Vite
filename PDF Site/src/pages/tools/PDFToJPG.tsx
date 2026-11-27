import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { FileText, Download, X } from 'lucide-react';

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
  const [pages, setPages] = useState<Array<{ index: number; src: string; size: number }>>([]);
  const [previewUrls, setPreviewUrls] = useState<Array<string>>([]);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    ensurePdfJs().then((lib) => (pdfJsLib.current = lib)).catch(() => {});
  }, []);

  const addFile = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setPages([]);
      setPreviewUrls([]);
      if (pdfJsLib.current) renderAll();
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPages([]);
    setPreviewUrls([]);
    setError(null);
  }, [file]);

  const renderAll = useCallback(async () => {
    if (!file || !pdfJsLib.current) return;
    setLoading(true);
    setError(null);
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { numPages: number; getPage: (n: number) => Promise<any> };
      const total = pdf.numPages;
      const scale = parseInt(dpi, 10) / 72;
      const out: Array<{ index: number; src: string; size: number }> = [];
      const pre: string[] = [];
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale, rotation: page.rotate ? page.rotate : 0 });
        const c = document.createElement('canvas');
        c.width = Math.ceil(vp.width);
        c.height = Math.ceil(vp.height);
        const ctx = c.getContext('2d');
        if (!ctx) continue;
        await (page as unknown as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
        const jpg = c.toDataURL('image/jpeg', 0.92);
        out.push({ index: i, src: jpg, size: c.toDataURL().length });
        pre.push(jpg);
      }
      // size estimate from JPEG
      setPages(out);
      setPreviewUrls(pre);
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Could not render the PDF.') + ' (Make sure PDF.js loaded from CDN.)');
    } finally {
      setLoading(false);
    }
  }, [file, dpi]);

  useEffect(() => {
    if (file && pdfJsLib.current) renderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, dpi]);

  const ready = file !== null && !loading;

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
        <div className="mb-4 text-sm text-[#47474f]">
          Rendered {file!.pages} pages at {dpi} DPI. Click each image to download it as a JPG.
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <div
                key={p.index}
                className="group flex items-start gap-4 rounded-xl border border-[#c4c4cc] bg-white p-3 transition-all hover:border-[#161616]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7253e2]/10 text-[#7253e2] shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm font-medium text-[#161616]">Page {p.index}</span>
                  <span className="text-xs text-[#47474f]">{p.size > 1024 ? `${(p.size / 1024).toFixed(1)} KB` : `${p.size} B`}</span>
                </div>
                <img src={previewUrls[p.index - 1]} alt={`Page ${p.index}`} className="h-16 w-12 rounded-lg border border-[#c4c4cc] object-cover shrink-0" />
                <button
                  onClick={() => downloadDataUrl(previewUrls[p.index - 1], `page-${p.index}.jpg`)}
                  className="flex items-center justify-center rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] px-3 py-1.5 text-sm text-[#161616] transition-colors hover:border-[#161616] hover:bg-white"
                  aria-label={`Download page ${p.index}`}
                >
                  <Download size={15} className="inline mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Your file was processed entirely in your browser. Nothing was uploaded.
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
          label="Select the PDF to convert"
          helper="One file at a time"
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        />
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
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
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
        <button onClick={() => {}} disabled={!ready} className="btn-primary w-full opacity-50 cursor-not-allowed">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Rendering pages…
            </span>
          ) : (
            'Convert to JPG'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
          <p className="text-xs text-[#47474f]">
            Each PDF page becomes a downloadable JPG. Processing starts automatically when a file is added.
          </p>
        </div>
      </StandardLayout>
    );
  }

function downloadDataUrl(dataUrl: string, filename: string): void {
  const fetchBlob = async () => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, filename);
  };
  void fetchBlob();
}
