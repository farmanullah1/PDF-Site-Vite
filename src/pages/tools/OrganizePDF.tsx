import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, GripVertical } from 'lucide-react';

const tool = toolById('organize-pdf')!;

const THUMB_SCALE = 0.45;

export default function OrganizePDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [thumbsReady, setThumbsReady] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement|null };

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
      setOrder([]);
      setThumbs([]);
      setThumbsReady([]);
      setError(null);
      setResult(null);
      try {
        const buf = await readFileAsArrayBuffer(f);
        const n = await pdfPageCount(new Uint8Array(buf));
        setFile((p) => (p && p.file === f ? { ...p, pages: n } : p));
        setOrder(Array.from({ length: n }, (_, i) => i));
        setThumbs(Array(n).fill(''));
        setThumbsReady(Array(n).fill(false));
        renderThumbnails(f, n);
      } catch {
        setError('Could not read the PDF.');
      }
    },
    []
  );

  const renderThumbnails = useCallback(async (f: File, n: number) => {
    if (!pdfJsLib.current) return;
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const fileUrl = URL.createObjectURL(f);
      const r = await fetch(fileUrl);
      const buf = await r.arrayBuffer();
      URL.revokeObjectURL(fileUrl);
      const pdf = await lib.getDocument({ data: buf }).promise as { numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };
      for (let i = 1; i <= n; i++) {
        try {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: THUMB_SCALE });
          const c = document.createElement('canvas');
          c.width = Math.ceil(vp.width);
          c.height = Math.ceil(vp.height);
          const ctx = c.getContext('2d');
          if (!ctx) continue;
          await (page as unknown as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
          setThumbs((prev) => { const next = [...prev]; next[i - 1] = c.toDataURL('image/png'); return next; });
          setThumbsReady((prev) => { const next = [...prev]; next[i - 1] = true; return next; });
        } catch {}
      }
    } catch {}
  }, []);

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setOrder([]);
    setThumbs([]);
    setThumbsReady([]);
    setResult(null);
    setError(null);
  }, [file]);

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setHoverIdx(idx);
  };
  const handleDragLeave = () => setHoverIdx(null);
  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) { setDraggedIdx(null); setHoverIdx(null); return; }
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx!, 1);
      next.splice(targetIdx, 0, moved);
      setDraggedIdx(null);
      setHoverIdx(null);
      return next;
    });
  };

  const doOrganize = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const copied = await out.copyPages(src, order);
      for (const p of copied) out.addPage(p);
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-organized.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Organize failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, order]);

  const ready = file !== null && order.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">PDF organized</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Reordered {order.length} page{order.length === 1 ? '' : 's'}. Download the result below.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download organized PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Processed entirely in your browser. Nothing was uploaded.
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
          label="Select the PDF to organize"
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
          <p className="mt-3 text-xs text-[#47474f]">
            Drag page thumbnails to reorder them. {thumbsReady.filter(Boolean).length}/{file.pages} pages loaded.
          </p>
        </div>
      )}

      {file && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {order.map((pageIdx, pos) => {
                const ready = thumbsReady[pageIdx];
                const src = thumbs[pageIdx];
                const isDragging = draggedIdx === pos;
                return (
                  <div
                    key={pageIdx}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${isDragging ? 'border-[#e5322d] bg-[#fbeae7]' : hoverIdx === pos ? 'border-[#e5322d]/50 bg-[#fbeae7]/30' : 'border-[#c4c4cc] hover:border-[#161616]'}`}
                    draggable
                    onDragStart={() => handleDragStart(pos)}
                    onDragOver={(e) => handleDragOver(e, pos)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, pos)}
                    role="listitem"
                    aria-label={`Page ${pageIdx + 1} at position ${pos + 1}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">Position {pos + 1}</span>
                    <div className="relative flex h-48 w-36 items-center justify-center rounded-lg border border-[#c4c4cc] bg-[#f0f0f5] overflow-hidden shrink-0">
                      {!ready && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#c4c4cc] border-t-[#e5322d]" />
                        </div>
                      )}
                      {ready && src && <img src={src} alt={`Page ${pageIdx + 1}`} className="h-full w-full object-cover" />}
                      {!ready && !src && (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-[#c4c4cc] text-[#c4c4cc] text-[10px]">
                          Page {pageIdx + 1}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#161616]">Page {pageIdx + 1}</span>
                    <button className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-[#47474f] shadow-sm hover:bg-[#e5322d] hover:text-white transition-colors" aria-label="Drag handle" style={{ display:'none' }}>
                      <GripVertical size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doOrganize}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Organizing pages…
            </span>
          ) : (
            'Organize PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Drag thumbnails to change the page order, then save a new PDF with the pages in that order.
        </p>
      </div>
    </StandardLayout>
  );
}
