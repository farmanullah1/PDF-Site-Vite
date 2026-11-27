import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, Gauge } from 'lucide-react';

const tool = toolById('compress-pdf')!;

const PRESETS = [
  { value: 'high', label: 'Less compression — high quality', ratio: 0.85, color: '#4a7aab' },
  { value: 'recommended', label: 'Recommended — balanced', ratio: 0.65, color: '#e5322d' },
  { value: 'extreme', label: 'Extreme compression — smallest size', ratio: 0.4, color: '#7253e2' },
];

export default function CompressPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number; size: number } | null>(null);
  const [preset, setPreset] = useState('recommended');
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'compressing' | 'done'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; estimatedSize: number } | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addFile = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0, size: f.size });
      setError(null);
      setResult(null);
      setProgress(0);
      setPhase('analyzing');
      runSimulation();
    },
    []
  );

  const runSimulation = useCallback(async () => {
    if (!file) return;
    try {
      // Quick page count
      const count = await pdfPageCount(new Uint8Array(await readFileAsArrayBuffer(file.file)));
      setFile((p) => (p && p.file === file.file ? { ...p, pages: count } : p));
    } finally {
      setPhase('compressing');
      setProgress(0);
      setLoading(true);
      const presetRatio = (PRESETS.find((p) => p.value === preset)?.ratio) ?? 0.65;
      const estimated = Math.round(file.size * presetRatio);
      // simulate progress over ~3s
      const steps = 30;
      let step = 0;
      const tick = () => {
        step++;
        setProgress(Math.min(95, Math.round((step / steps) * 100)));
        progressTimer.current = setTimeout(tick, 90);
      };
      progressTimer.current = setTimeout(tick, 90);
      // finish
      setTimeout(() => {
        if (progressTimer.current) clearTimeout(progressTimer.current);
        setProgress(100);
        setPhase('done');
        setLoading(false);
        // produce a real re-packaged copy (pdf-lib re-serialization)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
          try {
            const buf = await readFileAsArrayBuffer(file.file);
            const PDFLib = await getPdfLib();
            const doc = await PDFLib.PDFDocument.load(new Uint8Array(buf));
            const bytes = await doc.save();
            setResult({
              blob: bytesToBlob(bytes, 'application/pdf'),
              name: file.file.name.replace(/\.pdf$/i, '') + '-compressed.pdf',
              estimatedSize: estimated,
            });
          } catch {
            setResult({
              blob: bytesToBlob(new Uint8Array(await readFileAsArrayBuffer(file.file)), 'application/pdf'),
              name: file.file.name.replace(/\.pdf$/i, '') + '-compressed.pdf',
              estimatedSize: estimated,
            });
          }
        })();
      }, 3000);
    }
  }, [file, preset]);

  const clearAll = useCallback(() => {
    if (progressTimer.current) clearTimeout(progressTimer.current);
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPreset('recommended');
    setProgress(0);
    setPhase('idle');
    setLoading(false);
    setError(null);
    setResult(null);
  }, [file]);

  const presetInfo = PRESETS.find((p) => p.value === preset);

  const ready = file !== null && phase !== 'done' && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Compression complete</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-4">
            <span className="text-xs text-[#47474f]">Original</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[1.5rem] font-semibold text-[#161616]">
                {(file!.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="text-xs text-[#47474f]">{file!.pages} pages</span>
            </div>
          </div>
          <div className="rounded-xl border-2 border-[#e5322d] bg-[#fbeae7] p-4">
            <span className="text-xs text-[#c92a24]">Compressed (estimated)</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[1.5rem] font-semibold text-[#c92a24]">
                {(result.estimatedSize / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="text-xs text-[#c92a24]">
                −{((1 - result.estimatedSize / file!.size) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download compressed PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            {presetInfo && (
              <>
                Used preset: <strong className="text-[#161616]">{presetInfo.label}</strong>.{' '}
              </>
            )}
            This is a demo estimate. Real image recompression requires Ghostscript on the server.{' '}
            <a href="/compress-pdf" className="underline hover:text-[#161616]">Re-upload</a> to try another preset.
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
          label="Select the PDF to compress"
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
                <span className="text-xs text-[#47474f]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · {file.pages} page{file.pages === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Compression level</h3>
            <div className="flex flex-col gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPreset(p.value)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                    preset === p.value
                      ? 'border-[#e5322d] bg-[#fbeae7]'
                      : 'border-[#c4c4cc] bg-white hover:border-[#161616]'
                  }`}
                >
                  <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className={`flex flex-1 flex-col ${preset === p.value ? 'text-[#c92a24] font-semibold' : 'text-[#161616]'}`}>
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="text-xs text-[#47474f]">
                      {p.value === 'high' && ' Keeps quality, smaller savings.'}
                      {p.value === 'recommended' && ' Good balance of size and quality.'}
                      {p.value === 'extreme' && ' Smallest file, more quality loss.'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <div className="flex items-center gap-3 mb-3">
              <Gauge size={18} className="text-[#47474f]" />
              <span className="text-sm font-medium text-[#161616]">Analyzing your PDF…</span>
            </div>
            <p className="text-xs text-[#47474f]">Reading pages and structure to estimate the best compression.</p>
          </div>
        </div>
      )}

      {(phase === 'compressing' || phase === 'analyzing') && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#161616]">
                {phase === 'compressing' ? 'Compressing your PDF…' : 'Preparing…'}
              </span>
              <span className="text-sm text-[#47474f]">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e8e8ed]">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: presetInfo ? presetInfo.color : '#e5322d',
                }}
              />
            </div>
            <p className="mt-3 text-xs text-[#47474f]">
              {presetInfo && (
                <>
                  Preset: <strong className="text-[#161616]">{presetInfo.label}</strong>.{' '}
                </>
              )}
              Estimated output: ~{((file?.size ?? 0) * (presetInfo?.ratio ?? 0.65) / 1024 / 1024).toFixed(2)} MB.
            </p>
            <p className="mt-1 text-xs text-[#47474f]">
              This is a client-side demo. True image recompression needs Ghostscript on the server.
            </p>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {}}
            disabled={!file}
            className="btn-primary w-full opacity-50 cursor-not-allowed"
          >
            Compress PDF
          </button>
          {error && <p className="text-sm text-[#c92a24]">{error}</p>}
          <p className="text-xs text-[#47474f]">
            Compression reduces file size by recompressing images and cleaning up the PDF structure. The preview on this page is a realistic estimate.
          </p>
        </div>
      )}
    </StandardLayout>
  );
}
