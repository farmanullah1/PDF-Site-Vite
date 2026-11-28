import { useState, useRef, useCallback, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { ArrowUp, ArrowDown, GripHorizontal, X, FileText } from 'lucide-react';

const tool = toolById('merge-pdf')!;

type FileRow = {
  file: File;
  url: string;
  pages: number;
  loading: boolean;
};

export default function MergePDF() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [reorderingIdx, setReorderingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const valid: File[] = [];
      for (const f of incoming) {
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) continue;
        if (f.size > 100 * 1024 * 1024) {
          setError(`${f.name} is too large (limit 100 MB).`);
          continue;
        }
        valid.push(f);
      }
      if (valid.length === 0) return;
      setError(null);
      const existing = files.map((r) => r.file);
      const toAdd = valid.filter((f) => !existing.includes(f));
      if (toAdd.length === 0) return;

      const newRows: FileRow[] = [];
      for (const f of toAdd) {
        newRows.push({
          file: f,
          url: URL.createObjectURL(f),
          pages: 0,
          loading: true,
        });
      }
      setFiles((prev) => [...prev, ...newRows]);

      // load page counts
      for (const row of newRows) {
        try {
          const buf = await readFileAsArrayBuffer(row.file);
          const count = await pdfPageCount(new Uint8Array(buf));
          setFiles((prev) =>
            prev.map((r) => (r.file === row.file ? { ...r, pages: count, loading: false } : r))
          );
        } catch (e) {
          setFiles((prev) =>
            prev.map((r) => (r.file === row.file ? { ...r, loading: false } : r))
          );
          setError(`Could not read ${row.file.name}.`);
        }
      }
    },
    [files]
  );

  const removeFile = useCallback(
    (idx: number) => {
      const row = files[idx];
      if (row) URL.revokeObjectURL(row.url);
      setFiles((prev) => prev.filter((_, i) => i !== idx));
    },
    [files]
  );

  const clearAll = useCallback(() => {
    files.forEach((r) => URL.revokeObjectURL(r.url));
    setFiles([]);
    setResult(null);
    setError(null);
  }, [files]);

  // drag-and-drop reorder
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setReorderingIdx(idx);
  };
  const handleDragLeave = () => setReorderingIdx(null);
  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setReorderingIdx(null);
      return;
    }
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, moved);
      setDraggedIdx(null);
      setReorderingIdx(null);
      return next;
    });
  };

  const doMerge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const out = await PDFLib.PDFDocument.create();
      // We need a fresh copy of each file's bytes because load consumes/detaches.
      const filesSnapshot = files.map((r) => r.file);
      for (const f of filesSnapshot) {
        const buf = await readFileAsArrayBuffer(f);
        const src = await PDFLib.PDFDocument.load(new Uint8Array(buf));
        const indices = [...Array(src.getPageCount()).keys()];
        const copied = await out.copyPages(src, indices);
        for (const p of copied) out.addPage(p);
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name =
        filesSnapshot.length === 1
          ? (filesSnapshot[0].name.replace(/\.[^.]+$/, '') || 'document') + '-merged.pdf'
          : 'merged-document.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Merge failed.') + ' (Your files stay private.)');
    } finally {
      setLoading(false);
    }
  }, [files]);

  const ready = files.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your merged PDF is ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Combined {files.reduce((n, r) => n + r.pages, 0)} pages from {files.length} file{files.length === 1 ? '' : 's'}.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => downloadBlob(result.blob, result.name)}
            className="btn-primary w-full"
          >
            Download merged PDF
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
      {/* Dropzone */}
      <div className="mb-5">
        <Dropzone
          accept=".pdf,application/pdf"
          maxSizeMB={100}
          multiple
          label="Add PDF files to merge"
          helper="You can add more files at any time"
          onFiles={addFiles}
          fileCount={files.length}
        >
          {files.length === 0 && (
            <p className="mt-2 text-xs text-[#47474f]">Drag & drop or click to browse.</p>
          )}
        </Dropzone>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <h3 className="text-sm font-semibold text-[#161616]">
              Files ({files.reduce((n, r) => n + r.pages, 0)} pages)
            </h3>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
            >
              <X size={15} /> Clear all
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-2" role="list" aria-label="Files to merge">
            {files.map((row, idx) => (
              <li
                key={row.file.name + idx}
                className={`relative flex items-center gap-3 rounded-xl border border-[#c4c4cc] bg-white p-3 transition-all ${
                  dragging === idx || reorderingIdx === idx ? 'border-[#e5322d] bg-[#fbeae7]' : ''
                }`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                role="listitem"
              >
                <button
                  className="cursor-grab active:cursor-grabbing text-[#47474f] hover:text-[#161616]"
                  aria-label="Drag to reorder"
                  draggable={false}
                >
                  <GripHorizontal size={18} />
                </button>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <span className="truncate text-sm font-medium text-[#161616]">{row.file.name}</span>
                  <span className="text-xs text-[#47474f]">
                    {row.loading ? 'Reading…' : row.pages === 0 ? '—' : `${row.pages} page${row.pages === 1 ? '' : 's'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFile(idx)}
                    className="rounded-lg p-1.5 text-[#47474f] transition-colors hover:bg-[#f0f0f5] hover:text-[#161616]"
                    aria-label={`Remove ${row.file.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#47474f]">Drag the handle on the left to reorder files.</p>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col gap-4">
        <button
          onClick={doMerge}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Processing your PDF…
            </span>
          ) : (
            `Merge PDF`
          )}
        </button>
        {error && (
          <p className="text-sm text-[#c92a24]">{error}</p>
        )}
        <p className="text-xs text-[#47474f]">
          Works with up to 100 MB per file. For best results, use PDFs with the same page size.
        </p>
      </div>
    </StandardLayout>
  );
}

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
);

let dragging = -1;
