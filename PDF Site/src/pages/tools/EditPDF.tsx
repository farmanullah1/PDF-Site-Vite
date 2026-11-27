import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField, Select, Range } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs, renderPdfPageToCanvas } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FileText, Download, X, Image, TextCursor, Square, Plus } from 'lucide-react';

const tool = toolById('edit-pdf')!;

export default function EditPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [edits, setEdits] = useState<Array<{ kind: 'text' | 'rect' | 'image'; text: string; x: number; y: number; size: number; opacity: number; imageUrl: string|null; w: number; h: number }>>([]);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imageUrl, setImageUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement|null };
  const imageInputRef = { current: null as HTMLInputElement|null };

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
      setEdits([]);
      setPageIdx(0);
      try {
        const buf = await readFileAsArrayBuffer(f);
        const n = await pdfPageCount(new Uint8Array(buf));
        setFile((p) => (p && p.file === f ? { ...p, pages: n } : p));
        if (n > 0) renderPage(0);
      } catch {
        setError('Could not read the PDF.');
      }
    },
    []
  );

  const renderPage = useCallback(async (idx: number) => {
    if (!file || !pdfJsLib.current || !canvasRef.current) return;
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };
      const page = await pdf.getPage(idx + 1);
      const vp = page.getViewport({ scale: 1.1 });
      const c = canvasRef.current;
      c.width = Math.ceil(vp.width);
      c.height = Math.ceil(vp.height);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      await (page as unknown as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
      setPreviewUrl(c.toDataURL('image/png'));
    } catch {}
  }, [file]);

  useEffect(() => {
    if (file && pdfJsLib.current) renderPage(pageIdx);
  }, [file, pageIdx]);

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setPageIdx(0);
    setPreviewUrl(null);
    setEdits([]);
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
  }, [file, imageUrl]);

  const addImage = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
      if (f.size > 10 * 1024 * 1024) { setError('Image too large (limit 10 MB).'); return; }
      const url = URL.createObjectURL(f);
      setImageFile(f);
      setImageUrl(url);
    },
    []
  );

  const addEdit = useCallback((kind: 'text' | 'rect' | 'image') => {
    setEdits((prev) => [...prev, {
      kind, text: kind === 'text' ? 'New text' : '', x: 100, y: 100, size: 16, opacity: 1,
      imageUrl: kind === 'image' ? imageUrl : null, w: kind === 'image' ? 120 : 0, h: kind === 'image' ? 60 : 0,
    }]);
  }, [imageUrl]);

  const doEdit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const font = await out.embedFont(StandardFonts.Helvetica);
      const total = src.getPageCount();
      const copied = await out.copyPages(src, [...Array(total).keys()]);
      for (const p of copied) out.addPage(p);

      const target = Math.min(pageIdx, total - 1);
      const page = out.getPage(target);
      const images: Record<string, unknown> = {};
      for (const e of edits) {
        if (e.kind === 'text') {
          page.drawText(e.text, { x: e.x, y: e.y, size: e.size, font, color: ({ r: 0, g: 0, b: 0 } as any), opacity: e.opacity });
        } else if (e.kind === 'rect') {
          page.drawRectangle({ x: e.x, y: e.y, width: e.w, height: e.h, borderColor: ({ r: 0, g: 0, b: 0 } as any), borderWidth: 1, opacity: e.opacity });
        } else if (e.kind === 'image' && e.imageUrl) {
          if (!images[e.imageUrl]) {
            const resp = await fetch(e.imageUrl);
            const ab = await resp.arrayBuffer();
            images[e.imageUrl] = await out.embedPng(new Uint8Array(ab));
          }
          const img = images[e.imageUrl] as any;
          const scale = Math.min(e.w / img.width, e.h / img.height, 1);
          page.drawImage(img, { x: e.x, y: e.y, width: img.width * scale, height: img.height * scale, opacity: e.opacity });
        }
      }

      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-edited.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Edit failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, pageIdx, edits, imageUrl]);

  const ready = file !== null && edits.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">PDF edited</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Applied {edits.length} edit{edits.length === 1 ? '' : 's'} to page {pageIdx + 1} of {file!.pages}.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download edited PDF
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
          label="Select the PDF to edit"
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
          <div className="mt-3 rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-3">
            <canvas ref={canvasRef} className="block max-w-full max-h-[420px] rounded-lg border-0 bg-transparent cursor-crosshair" />
            <p className="mt-2 text-[10px] text-[#47474f] text-center">Preview of page {pageIdx + 1}. Edits are drawn on this page.</p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-medium text-[#47474f]">Page</label>
            <Select
              label=""
              value={String(pageIdx + 1)}
              onChange={(v) => setPageIdx(parseInt(v, 10) - 1)}
              options={Array.from({ length: file.pages }, (_, i) => ({ value: String(i + 1), label: `Page ${i + 1}` }))}
            />
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Add content to page</h3>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => addEdit('text')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:border-[#161616]">
              <TextCursor size={14} /> Text
            </button>
            <button onClick={() => addEdit('rect')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:border-[#161616]">
              <Square size={14} /> Rectangle
            </button>
            <button onClick={() => addEdit('image')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:border-[#161616]">
              <Image size={14} /> Image
            </button>
          </div>
          {imageUrl && (
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-[#7253e2]/10 px-3 py-1 text-xs font-semibold text-[#7253e2]">Image ready</span>
              <button onClick={() => { if (imageUrl) URL.revokeObjectURL(imageUrl); setImageFile(null); setImageUrl(null); }} className="text-xs text-[#47474f] underline hover:text:#161616">Remove</button>
            </div>
          )}
          {!imageUrl && (
            <div className="mt-3">
              <Dropzone accept="image/png,image/jpeg,image/webp" maxSizeMB={10} multiple={false} label="Add an image to place" helper="Optional image for image edits" onFiles={addImage} fileInputRef={imageInputRef} />
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {edits.map((e, i) => (
              <div key={i} className="rounded-lg border border-[#c4c4cc] bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${e.kind === 'text' ? 'text-[#e5322d]' : e.kind === 'image' ? 'text-[#7253e2]' : 'text-[#4a7aab]'}`}>{e.kind === 'text' ? 'Text' : e.kind === 'image' ? 'Image' : 'Rectangle'}</span>
                  <button onClick={() => setEdits((prev) => prev.filter((_, j) => j !== i))} className="p-1 text-[#47474f] hover:text-[#c92a24]" aria-label="Remove edit"><X size={14} /></button>
                </div>
                {e.kind === 'text' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#47474f] font-medium">Text</label>
                      <input value={e.text} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], text: ev.target.value }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#47474f] font-medium">Size (pt)</label>
                      <input type="number" value={e.size} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], size: Number(ev.target.value) || 12 }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                    </div>
                  </div>
                )}
                {e.kind === 'rect' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[#47474f] font-medium">Width</label>
                      <input type="number" value={e.w} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], w: Number(ev.target.value) || 100 }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#47474f] font-medium">Height</label>
                      <input type="number" value={e.h} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], h: Number(ev.target.value) || 60 }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">X</label>
                    <input type="number" value={e.x} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], x: Number(ev.target.value) || 0 }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Y</label>
                    <input type="number" value={e.y} onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], y: Number(ev.target.value) || 0 }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Opacity</label>
                    <input type="number" value={e.opacity} step="0.1" onChange={(ev) => setEdits((prev) => { const n = [...prev]; n[i] = { ...n[i], opacity: Math.min(1, Math.max(0, Number(ev.target.value)) || 1) }; return n; })} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doEdit}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Applying edits…
            </span>
          ) : (
            'Apply edits to PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Add text, rectangles, or images to the chosen page, then save a new PDF with your edits applied.
        </p>
      </div>
    </StandardLayout>
  );
}
