import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X } from 'lucide-react';

const tool = toolById('crop-pdf')!;

export default function CropPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [crop, setCrop] = useState<{ top: number; right: number; bottom: number; left: number }>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [applyTo, setApplyTo] = useState<'all' | 'first'>('all');
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
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setResult(null);
      setCrop({ top: 0, right: 0, bottom: 0, left: 0 });
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
    setCrop({ top: 0, right: 0, bottom: 0, left: 0 });
  }, [file]);

  const doCrop = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const total = src.getPageCount();
      const copied = await out.copyPages(src, [...Array(total).keys()]);
      const targets = applyTo === 'all' ? [...Array(total).keys()] : [0];
      for (const p of copied) out.addPage(p);
      const { top, right, bottom, left } = crop;
      for (const i of targets) {
        const page = out.getPage(i);
        const [w, h] = [page.getWidth(), page.getHeight()];
        page.setCropBox(left, bottom, right - left, h - top - bottom);
        page.setMediaBox(left, bottom, right - left, h - top - bottom);
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-cropped.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Crop failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, crop, applyTo]);

  const ready = file !== null && (crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0) && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">PDF cropped</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Cropped {applyTo === 'all' ? 'all pages' : 'the first page'} of {file!.pages}.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download cropped PDF
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
          label="Select the PDF to crop"
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
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Crop margins</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#161616]">Top</label>
              <input type="number" value={crop.top} onChange={(e) => setCrop((c) => ({ ...c, top: Number(e.target.value) || 0 }))} className="rounded border border-[#c4c4cc] px-2 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#161616]">Bottom</label>
              <input type="number" value={crop.bottom} onChange={(e) => setCrop((c) => ({ ...c, bottom: Number(e.target.value) || 0 }))} className="rounded border border-[#c4c4cc] px-2 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#161616]">Left</label>
              <input type="number" value={crop.left} onChange={(e) => setCrop((c) => ({ ...c, left: Number(e.target.value) || 0 }))} className="rounded border border-[#c4c4cc] px-2 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#161616]">Right</label>
              <input type="number" value={crop.right} onChange={(e) => setCrop((c) => ({ ...c, right: Number(e.target.value) || 0 }))} className="rounded border border-[#c4c4cc] px-2 py-1.5 text-sm" />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#47474f]">Values in points (1/72 inch). Cropping sets the visible page box.</p>
          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs font-medium text-[#161616]">Apply to</label>
            <select value={applyTo} onChange={(e) => setApplyTo(e.target.value as 'all' | 'first')} className="rounded border border-[#c4c4cc] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]">
              <option value="all">All pages</option>
              <option value="first">First page only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doCrop}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Cropping pages…
            </span>
          ) : (
            'Crop PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Enter the margin to trim from each side (in points), then save the cropped PDF.
        </p>
      </div>
    </StandardLayout>
  );
}

