import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, Trash2, Check, CheckSquare, Square } from 'lucide-react';

const tool = toolById('remove-pages')!;

export default function RemovePages() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [remove, setRemove] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const fileInputRef = { current: null as HTMLInputElement|null };

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setRemove(new Set());
      setResult(null);
      setAllSelected(false);
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
    setRemove(new Set());
    setResult(null);
    setError(null);
    setAllSelected(false);
  }, [file]);

  const togglePage = useCallback((p: number) => {
    setRemove((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!file) return;
    const total = file.pages;
    if (allSelected) {
      setRemove(new Set());
      setAllSelected(false);
    } else {
      setRemove(new Set(Array.from({ length: total }, (_, i) => i + 1)));
      setAllSelected(true);
    }
  }, [file, allSelected]);

  const doRemove = useCallback(async () => {
    if (!file) return;
    if (remove.size === 0) { setError('Select at least one page to remove.'); return; }
    if (remove.size >= file.pages) { setError('Cannot remove all pages.'); return; }
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const total = src.getPageCount();
      const keep = [...Array(total).keys()].map((i) => i + 1).filter((p) => !remove.has(p));
      const out = await PDFLib.PDFDocument.create();
      const copied = await out.copyPages(src, keep.map((p) => p - 1));
      for (const p of copied) out.addPage(p);
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-pages-removed.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Remove failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, remove]);

  const ready = file !== null && remove.size > 0 && remove.size < file.pages && !loading;
  const removedCount = remove.size;
  const remaining = file ? file.pages - removedCount : 0;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Pages removed</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Removed {removedCount} page{removedCount === 1 ? '' : 's'}. {remaining} page{remaining === 1 ? '' : 's'} remain.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download PDF without selected pages
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

          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#47474f]">Pages to remove</label>
            <button onClick={toggleAll} className="rounded-lg border border-[#c4c4cc] px-3 py-1 text-xs text-[#161616] transition-colors hover:bg-[#f5f5fa]">
              {allSelected ? 'Select none' : 'Select all'}
            </button>
            <span className="text-xs text-[#47474f]">{removedCount} selected</span>
          </div>

          <div className="mt-3 max-h-[340px] overflow-y-auto rounded-xl border border-[#c4c4cc] bg-white">
            <div className="flex flex-col sm:hidden divide-y divide-[#c4c4cc]/40">
              {Array.from({ length: file.pages }, (_, i) => i + 1).map((p) => {
                const isRemoved = remove.has(p);
                return (
                  <div key={p} className="flex items-center justify-between px-3 py-3 border-b border-[#c4c4cc]/40 hover:bg-[#f0f0f5]">
                    <span className="text-sm text-[#161616]">Page {p}</span>
                    <button
                      onClick={() => togglePage(p)}
                      className={`rounded-lg p-1.5 transition-colors ${isRemoved ? 'bg-[#fbeae7] text-[#c92a24]' : 'text-[#47474f] hover:bg-[#f0f0f5]'}`}
                      aria-label={`Toggle page ${p}`}
                    >
                      {isRemoved ? <Check size={14} /> : <Square size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="hidden sm:block">
              <div className="grid grid-cols-12">
                <div className="col-span-11 border-b border-[#c4c4cc]/40 px-3 py-2 text-xs font-medium text-[#161616]">Page</div>
                <div className="col-span-1 border-b border-[#c4c4cc]/40 px-3 py-2 text-xs font-medium text-[#161616] text-right">Remove</div>
              </div>
              <div className="divide-y divide-[#c4c4cc]/40">
                {Array.from({ length: file.pages }, (_, i) => i + 1).map((p) => {
                  const isRemoved = remove.has(p);
                  return (
                    <div key={p} className="grid grid-cols-12 items-center border-b border-[#c4c4cc]/40 px-3 py-2.5 hover:bg-[#f0f0f5]">
                      <div className="col-span-11 text-sm text-[#161616]">Page {p}</div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => togglePage(p)}
                          className={`rounded-lg p-1.5 transition-colors ${isRemoved ? 'bg-[#fbeae7] text-[#c92a24]' : 'text-[#47474f] hover:bg-[#f0f0f5]'}`}
                          aria-label={`Toggle page ${p}`}
                        >
                          {isRemoved ? <Check size={14} /> : <Square size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {file.pages === 0 && (
            <p className="mt-3 text-xs text-[#47474f]">Reading pages…</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doRemove}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Removing pages…
            </span>
          ) : (
            'Remove selected pages'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Select the pages you want to delete. The remaining pages are saved into a new PDF. You cannot remove every page.
        </p>
      </div>
    </StandardLayout>
  );
}
