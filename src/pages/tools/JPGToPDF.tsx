import { useState, useCallback, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { Image, Download, X, GripVertical } from 'lucide-react';

const tool = toolById('jpg-to-pdf')!;

interface ImageRow {
  file: File;
  url: string;
  width: number;
  height: number;
  loading: boolean;
}

const PAGE_SIZE_OPTIONS = [
  { value: 'auto', label: 'Fit to image (use the image’s own size)' },
  { value: 'a4', label: 'A4 (210 × 297 mm)' },
  { value: 'letter', label: 'Letter (8.5 × 11 in)' },
];

const MM_TO_PT = 72 / 25.4;

export default function JPGToPDF() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [pageSize, setPageSize] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid: File[] = [];
      for (const f of incoming) {
        const ok = f.type.startsWith('image/') && (f.type.includes('jpeg') || f.type.includes('png') || f.type.includes('webp') || f.type.includes('bmp'));
        if (!ok) { setError(`${f.name} is not a supported image.`); continue; }
        if (f.size > 50 * 1024 * 1024) { setError(`${f.name} is too large (limit 50 MB).`); continue; }
        valid.push(f);
      }
      if (valid.length === 0) return;
      setError(null);
      const existing = new Set(images.map((r) => r.file.name));
      const toAdd = valid.filter((f) => !existing.has(f.name));
      if (toAdd.length === 0) return;

      const newRows: ImageRow[] = [];
      for (const f of toAdd) {
        newRows.push({ file: f, url: URL.createObjectURL(f), width: 0, height: 0, loading: true });
      }
      setImages((prev) => [...prev, ...newRows]);

      for (const row of newRows) {
        const img = new (window as any).Image();
        img.onload = () => {
          setImages((prev) =>
            prev.map((r) =>
              r.file === row.file ? { ...r, width: img.naturalWidth, height: img.naturalHeight, loading: false } : r
            )
          );
        };
        img.onerror = () => {
          setImages((prev) =>
            prev.map((r) => (r.file === row.file ? { ...r, loading: false } : r))
          );
          setError(`Could not read ${row.file.name}.`);
        };
        img.src = row.url;
      }
    },
    [images]
  );

  const removeImage = useCallback(
    (idx: number) => {
      const row = images[idx];
      if (row) URL.revokeObjectURL(row.url);
      setImages((prev) => prev.filter((_, i) => i !== idx));
    },
    [images]
  );

  const clearAll = useCallback(() => {
    images.forEach((r) => URL.revokeObjectURL(r.url));
    setImages([]);
    setResult(null);
    setError(null);
  }, [images]);

  // drag reorder
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
  };
  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) { setDraggedIdx(null); return; }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, moved);
      setDraggedIdx(null);
      return next;
    });
  };

  const doBuild = useCallback(async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const out = await PDFLib.PDFDocument.create();
      const imagesSnapshot = images.map((r) => r.file);
      for (const f of imagesSnapshot) {
        const buf = await readFileAsArrayBuffer(f);
        const img = await out.embedPng(new Uint8Array(buf));
        let w: number, h: number;
        const row = images.find((r) => r.file === f);
        if (pageSize === 'a4') {
          w = Math.round(210 * MM_TO_PT);
          h = Math.round(297 * MM_TO_PT);
        } else if (pageSize === 'letter') {
          w = Math.round(8.5 * 72);
          h = Math.round(11 * 72);
        } else {
          w = img.width;
          h = img.height;
        }
        const page = await out.addPage([w, h]);
        // center the image
        const scale = Math.min(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        page.drawImage(img, { x: dx, y: dy, width: dw, height: dh });
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = imagesSnapshot.length === 1
        ? (imagesSnapshot[0].name.replace(/\.[^.]+$/, '') || 'image') + '.pdf'
        : 'images-combined.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Build failed.') + ' (Your files stay private.)');
    } finally {
      setLoading(false);
    }
  }, [images, pageSize]);

  const ready = images.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your PDF is ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Bundled {images.length} image{images.length === 1 ? '' : 's'} into one PDF, in the order you chose.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Your files were processed entirely in your browser. Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Dropzone
          accept="image/png,image/jpeg,image/webp,image/bmp"
          maxSizeMB={50}
          multiple
          label="Add images to convert"
          helper="JPG, PNG, WebP and BMP are supported"
          onFiles={addFiles}
          fileCount={images.length}
          fileInputRef={fileInputRef}
        />
      </div>

      {images.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <h3 className="text-sm font-semibold text-[#161616]">
              Images ({images.length})
            </h3>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
            >
              <X size={15} /> Clear all
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-2" role="list" aria-label="Images to convert">
            {images.map((row, idx) => (
              <li
                key={row.file.name + idx}
                className="relative flex items-center gap-3 rounded-xl border border-[#c4c4cc] bg-white p-3 transition-all"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                role="listitem"
              >
                <button className="cursor-grab active:cursor-grabbing text-[#47474f] hover:text-[#161616]" aria-label="Drag to reorder" draggable={false}>
                  <GripVertical size={18} />
                </button>
                <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#c4c4cc] bg-white">
                  <img src={row.url} alt={row.file.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <span className="truncate text-sm font-medium text-[#161616]">{row.file.name}</span>
                  <span className="text-xs text-[#47474f]">
                    {row.loading ? 'Reading…' : row.width ? `${row.width} × ${row.height} px` : '—'}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className="rounded-lg p-1.5 text-[#47474f] transition-colors hover:bg-[#f0f0f5] hover:text-[#161616]"
                  aria-label={`Remove ${row.file.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#47474f]">Drag the handle on the left to reorder images.</p>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
          <div className="flex flex-col gap-4">
            <Select
              label="Page size"
              value={pageSize}
              onChange={setPageSize}
              options={PAGE_SIZE_OPTIONS}
              help="Each image gets its own page. Choose how the page should be sized."
            />
            <p className="text-xs text-[#47474f]">
              With "Fit to image", each page matches the image exactly. With A4 or Letter, the image is centred and scaled to fit.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={doBuild} disabled={!ready} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Building PDF…
            </span>
          ) : (
            'Convert images to PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Works with JPG, PNG, WebP and BMP. Each image becomes one page in the PDF.
        </p>
      </div>
    </StandardLayout>
  );
}
