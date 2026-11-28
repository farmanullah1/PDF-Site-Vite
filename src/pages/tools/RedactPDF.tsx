import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, EyeOff, Plus } from 'lucide-react';

const tool = toolById('redact-pdf')!;

type RedactBox = { id: number; left: number; bottom: number; right: number; top: number };

export default function RedactPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number; width: number; height: number } | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [boxes, setBoxes] = useState<RedactBox[]>([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile(null);
      setBoxes([]);
      setNextId(1);
      setResult(null);
      setError(null);
      try {
        const buf = await readFileAsArrayBuffer(f);
        const PDFLib = await getPdfLib();
        const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
        const page = src.getPage(0);
        setFile({ file: f, url: URL.createObjectURL(f), pages: src.getPageCount(), width: page.getWidth(), height: page.getHeight() });
      } catch {
        setError('Could not read the PDF.');
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPageIdx(0);
    setBoxes([]);
    setNextId(1);
    setResult(null);
    setError(null);
  }, [file]);

  const addBox = useCallback(() => {
    setBoxes((prev) => [...prev, { id: nextId, left: 0, bottom: 0, right: 100, top: 100 }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const updateBox = useCallback((id: number, field: keyof RedactBox, value: number) => {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }, []);

  const removeBox = useCallback((id: number) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const doRedact = useCallback(async () => {
    if (!file) return;
    if (boxes.length === 0) { setError('Add at least one redaction box.'); return; }
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const total = src.getPageCount();
      const copied = await out.copyPages(src, [...Array(total).keys()]);
      for (const p of copied) out.addPage(p);

      const target = Math.min(pageIdx, total - 1);
      const page = out.getPage(target);
      for (const b of boxes) {
        page.drawRectangle({ x: b.left, y: b.bottom, width: b.right - b.left, height: b.top - b.bottom, color: ({ r: 0, g: 0, b: 0 } as any) });
      }

      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-redacted.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Redact failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, pageIdx, boxes]);

  const ready = file !== null && boxes.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">PDF redacted</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Applied {boxes.length} redaction box{boxes.length === 1 ? '' : 'es'} to page {pageIdx + 1} of {file!.pages}.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download redacted PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Redaction boxes are drawn as solid black rectangles over the content. This is permanent.
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
          label="Select the PDF to redact"
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
                <EyeOff size={16} />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-[#161616]">{file.file.name}</span>
                <span className="text-xs text-[#47474f]">{file.pages} page{file.pages === 1 ? '' : 's'} · {Math.round(file.width)} × {Math.round(file.height)} pt</span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs font-medium text-[#161616]">Page to redact</label>
            <select value={String(pageIdx + 1)} onChange={(e) => setPageIdx(parseInt(e.target.value, 10) - 1)} className="rounded border border-[#c4c4cc] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]">
              {Array.from({ length: file.pages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={String(p)}>Page {p}</option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-[#47474f]">Coordinates are in PDF points (origin bottom-left). Page is {Math.round(file.width)} × {Math.round(file.height)} pt.</p>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Redaction boxes</h3>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={addBox} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:border-[#161616]">
              <Plus size={14} /> Add box
            </button>
          </div>
          <div className="space-y-2">
            {boxes.map((b) => (
              <div key={b.id} className="rounded-lg border border-[#c4c4cc] bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#c92a24]">Box {b.id}</span>
                  <button onClick={() => removeBox(b.id)} className="p-1 text-[#47474f] hover:text-[#c92a24]" aria-label={`Remove box ${b.id}`}><X size={14} /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Left</label>
                    <input type="number" value={b.left} onChange={(e) => updateBox(b.id, 'left', Number(e.target.value) || 0)} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Bottom</label>
                    <input type="number" value={b.bottom} onChange={(e) => updateBox(b.id, 'bottom', Number(e.target.value) || 0)} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Right</label>
                    <input type="number" value={b.right} onChange={(e) => updateBox(b.id, 'right', Number(e.target.value) || 100)} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#47474f] font-medium">Top</label>
                    <input type="number" value={b.top} onChange={(e) => updateBox(b.id, 'top', Number(e.target.value) || 100)} className="rounded border border-[#c4c4cc] px-2 py-1 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doRedact}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Redacting page…
            </span>
          ) : (
            'Redact page'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Redaction draws solid black rectangles over selected regions on the chosen page. The result is permanent.
        </p>
      </div>
    </StandardLayout>
  );
}

