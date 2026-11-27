import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, Rotation } from 'pdf-lib';
import { FileText, Download, X, RefreshCw } from 'lucide-react';
import { useRef, useEffect } from 'react';

const tool = toolById('rotate-pdf')!;

interface FileRow {
  file: File;
  url: string;
  pages: number;
  rotations: number[]; // degrees per page, 0/90/180/270
  loading: boolean;
}

const DEG_OPTIONS = [
  { value: '0', label: 'No rotation (0°)' },
  { value: '90', label: 'Rotate 90° clockwise' },
  { value: '180', label: 'Rotate 180°' },
  { value: '270', label: 'Rotate 270° clockwise' },
];

export default function RotatePDF() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [allDegrees, setAllDegrees] = useState('90');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  // load pdf.js once
  useEffect(() => {
    ensurePdfJs().then((lib) => (pdfJsLib.current = lib)).catch(() => {});
  }, []);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const valid: File[] = [];
      for (const f of incoming) {
        const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) continue;
        if (f.size > 100 * 1024 * 1024) { setError(`${f.name} is too large.`); continue; }
        valid.push(f);
      }
      if (valid.length === 0) return;
      setError(null);
      const existingNames = new Set(files.map((r) => r.file.name));
      const toAdd = valid.filter((f) => !existingNames.has(f.name));
      if (toAdd.length === 0) return;

      const newRows: FileRow[] = [];
      for (const f of toAdd) {
        newRows.push({ file: f, url: URL.createObjectURL(f), pages: 0, rotations: [], loading: true });
      }
      setFiles((prev) => [...prev, ...newRows]);

      for (const row of newRows) {
        try {
          const buf = await readFileAsArrayBuffer(row.file);
          const count = await pdfPageCount(new Uint8Array(buf));
          setFiles((prev) =>
            prev.map((r) =>
              r.file === row.file
                ? { ...r, pages: count, rotations: Array(count).fill(0), loading: false }
                : r
            )
          );
        } catch {
          setFiles((prev) =>
            prev.map((r) => (r.file === row.file ? { ...r, loading: false, rotations: [] } : r))
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
    setPreviewUrl(null);
  }, [files]);

  const updatePageRotation = useCallback(
    (fileIdx: number, pageIdx: number, deg: number) => {
      setFiles((prev) =>
        prev.map((r, ri) => {
          if (ri !== fileIdx) return r;
          const next = [...r.rotations];
          const target = deg === 0 ? 0 : (next[pageIdx] + deg) % 360;
          next[pageIdx] = target;
          return { ...r, rotations: next };
        })
      );
    },
    [files]
  );

  const applyAll = useCallback(
    (deg: number) => {
      setFiles((prev) =>
        prev.map((r) => ({ ...r, rotations: r.rotations.map(() => deg) }))
      );
    },
    []
  );

  const doRotate = useCallback(async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const out = await PDFLib.PDFDocument.create();
      const filesSnapshot = files.map((r) => r.file);
      for (const f of filesSnapshot) {
        const buf = await readFileAsArrayBuffer(f);
        const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
        const rows = files.filter((r) => r.file === f);
        if (rows.length === 0) continue;
        const rotations = rows[0].rotations;
        for (let i = 0; i < src.getPageCount(); i++) {
          const page = await src.getPage(i);
          const deg = rotations[i] ?? 0;
          if (deg !== 0) {
            page.setRotation(
              deg === 90
                ? PDFLib.Rotation.DEG_90
                : deg === 180
                ? PDFLib.Rotation.DEG_180
                : deg === 270
                ? PDFLib.Rotation.DEG_270
                : PDFLib.Rotation.T0
            );
          }
          out.addPage(page);
        }
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = filesSnapshot.length === 1
        ? (filesSnapshot[0].name.replace(/\.pdf$/i, '') || 'document') + '-rotated.pdf'
        : 'rotated-document.pdf';
      setResult({ blob, name });

      // update preview to show rotated first page of first file
      if (files[0]) {
        try {
          const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
          const r = await fetch(files[0].url);
          const buf = await r.arrayBuffer();
          const pdf = await lib.getDocument({ data: buf }).promise as { getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };
          const page = await pdf.getPage(1);
          const vp = page.getViewport({ scale: 1.3 });
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          const ctx = c.getContext('2d');
          if (ctx) {
            await (page as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
            setPreviewUrl(c.toDataURL('image/png'));
          }
        } catch {}
      }
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Rotation failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [files]);

  const ready = files.length > 0 && files.every((r) => r.rotations.length > 0) && !loading;

  const renderPreview = useCallback(async () => {
    if (!files[0] || !pdfJsLib.current) return;
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(files[0].url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };
      const page = await pdf.getPage(previewIdx + 1);
      const vp = page.getViewport({ scale: 1.3 });
      const c = document.createElement('canvas');
      c.width = vp.width;
      c.height = vp.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      await (page as { render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport: vp });
      setPreviewUrl(c.toDataURL('image/png'));
    } catch {}
  }, [files, previewIdx]);

  useEffect(() => {
    if (files.length > 0 && pdfJsLib.current) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, previewIdx]);

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your rotated PDF is ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Rotated pages in {files.length} file{files.length === 1 ? '' : 's'}. Download the result below.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download rotated PDF
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
          accept=".pdf,application/pdf"
          maxSizeMB={100}
          multiple
          label="Add PDF files to rotate"
          helper="You can rotate pages in multiple files"
          onFiles={addFiles}
          fileCount={files.length}
        />
      </div>

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
          <ul className="mt-3 flex flex-col gap-3" role="list">
            {files.map((row, fi) => (
              <li key={row.file.name + fi} className="rounded-xl border border-[#c4c4cc] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5322d]/10 text-[#e5322d]">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="truncate text-sm font-medium text-[#161616]">{row.file.name}</span>
                      <span className="text-xs text-[#47474f]">{row.loading ? 'Reading…' : `${row.pages} page${row.pages === 1 ? '' : 's'}`}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(fi)}
                    className="rounded-lg p-1.5 text-[#47474f] transition-colors hover:bg-[#f0f0f5] hover:text-[#161616]"
                    aria-label={`Remove ${row.file.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
                {row.loading ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#c4c4cc] border-t-[#e5322d]" />
                    <span className="ml-2 text-sm text-[#47474f]">Reading pages…</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => applyAll(parseInt(allDegrees, 10) || 0)}
                      className="flex items-center gap-2 rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] px-3 py-2 text-sm text-[#161616] transition-colors hover:border-[#161616]"
                    >
                      <RefreshCw size={14} />
                      Apply {allDegrees}° to all pages
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {row.pages > 0 &&
                        row.rotations.map((deg, pi) => (
                          <button
                            key={pi}
                            onClick={() => updatePageRotation(fi, pi, parseInt(allDegrees, 10) || 0)}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                              deg === 0
                                ? 'border-[#c4c4cc] bg-white text-[#47474f] hover:border-[#161616]'
                                : 'border-[#e5322d] bg-[#fbeae7] text-[#c92a24] font-semibold'
                            }`}
                          >
                            Page {pi + 1}
                            {deg ? ` · ${deg}°` : ''}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#161616]">Apply this rotation to all pages</label>
              <div className="flex items-center gap-2">
                <Select
                  value={allDegrees}
                  onChange={setAllDegrees}
                  options={DEG_OPTIONS}
                />
              </div>
            </div>
            <p className="text-xs text-[#47474f]">
              You can also set each page individually above. Rotation is applied when you click "Rotate PDF".
            </p>
          </div>
        </div>
      </div>

      {/* preview */}
      {previewUrl && (
        <div className="mb-5">
          <h3 className="mb-3 text-sm font-semibold text-[#161616]">Preview — page {previewIdx + 1}</h3>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-3">
            <img src={previewUrl} alt={`Preview of page ${previewIdx + 1}`} className="mx-auto max-w-full rounded-lg" />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button onClick={doRotate} disabled={!ready} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Rotating pages…
            </span>
          ) : (
            'Rotate PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Rotating a page changes its orientation. The original file is not modified.
        </p>
      </div>
    </StandardLayout>
  );
}
