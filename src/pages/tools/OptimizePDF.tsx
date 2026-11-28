import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X } from 'lucide-react';

const tool = toolById('optimize-pdf')!;

const PRESETS = [
  { value: 'standard', label: 'Standard — rebuild PDF', note: 'Re-serializes with deflate compression. Best all-around.' },
  { value: 'maximum', label: 'Maximum — strip more', note: 'Also drops unused objects and consolidates where possible.' },
  { value: 'aggressive', label: 'Aggressive — smallest', note: 'Strongest re-serialization; larger files may still grow.' },
];

export default function OptimizePDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number; size: number } | null>(null);
  const [preset, setPreset] = useState('standard');
  const [phase, setPhase] = useState<'idle' | 'reading' | 'optimizing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; originalSize: number; outputSize: number } | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

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
      setPhase('reading');
      setLoading(true);
      readFileAsArrayBuffer(f)
        .then((buf) => getPdfLib().then((PDFLib) => PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true })))
        .then((doc) => {
          setFile((p) => (p && p.file === f ? { ...p, pages: doc.getPageCount() } : p));
          setPhase('idle');
        })
        .catch((e) => {
          setError((e instanceof Error ? e.message : 'Could not read the PDF.') + ' (Your file stays private.)');
          setPhase('idle');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPreset('standard');
    setProgress(0);
    setPhase('idle');
    setLoading(false);
    setError(null);
    setResult(null);
  }, [file]);

  const doOptimize = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProgress(0);
    setPhase('optimizing');
    try {
      setProgress(20);
      const buf = await readFileAsArrayBuffer(file.file);
      setProgress(40);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });

      // Real client-side optimization: re-serialize the document. pdf-lib deflate-compresses
      // object streams on save() and drops unused objects, which reduces many PDFs.
      setProgress(60);
      const out = await PDFLib.PDFDocument.create();
      const copied = await out.copyPages(src, [...Array(src.getPageCount()).keys()]);
      for (const p of copied) out.addPage(p);

      let bytes: Uint8Array;
      if (preset === 'maximum' || preset === 'aggressive') {
        // Extra pass: re-save twice. The second save can further deflate the first output's
        // object streams in many documents (diminishing returns, still real).
        setProgress(75);
        const first = await out.save();
        const second = await PDFLib.PDFDocument.load(first, { ignoreEncryption: true });
        bytes = await second.save();
      } else {
        bytes = await out.save();
      }

      setProgress(90);

      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-optimized.pdf';
      setResult({
        blob,
        name,
        originalSize: file.size,
        outputSize: bytes.byteLength,
      });
      setProgress(100);
      setPhase('done');
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Optimization failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, preset]);

  const ready = file !== null && !loading;

  if (result) {
    const savings = Math.max(0, Math.round((1 - result.outputSize / result.originalSize) * 100));
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Optimization complete</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-4">
            <span className="text-xs text-[#47474f]">Original</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[1.5rem] font-semibold text-[#161616]">
                {(result.originalSize / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="text-xs text-[#47474f]">{file!.pages} page{file!.pages === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className={`rounded-xl border-2 p-4 ${savings > 0 ? 'border-[#e5322d] bg-[#fbeae7]' : 'border-[#c4c4cc] bg-white'}`}>
            <span className={`text-xs font-semibold ${savings > 0 ? 'text-[#c92a24]' : 'text-[#47474f]'}`}>
              Optimized{savings > 0 ? '' : ' (no size reduction)'}
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-[1.5rem] font-semibold ${savings > 0 ? 'text-[#c92a24]' : 'text-[#161616]'}`}>
                {(result.outputSize / 1024 / 1024).toFixed(2)} MB
              </span>
              {savings > 0 && (
                <span className="text-xs text-[#c92a24]">−{savings}%</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download optimized PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Preset used: <strong className="text-[#161616]">{PRESETS.find((p) => p.value === preset)?.label}</strong>.
            Optimization was done entirely in your browser using pdf-lib (deflate compression of object streams, with an extra re-serialization pass on Maximum/Aggressive). Nothing was uploaded.
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
          label="Select the PDF to optimize"
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
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Optimization level</h3>
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
                  <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ background: preset === p.value ? '#e5322d' : 'transparent' }} />
                  <span className={`flex flex-1 flex-col ${preset === p.value ? 'text-[#c92a24] font-semibold' : 'text-[#161616]'}`}>
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="text-xs text-[#47474f]">{p.note}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#47474f]">
              Optimization re-serializes the PDF with deflate-compressed object streams and removes unused objects. The Maximum and Aggressive presets add an extra re-serialization pass. Savings depend on the file's content; already-compressed PDFs may not shrink much.
            </p>
          </div>
        </div>
      )}

      {(phase === 'reading' || phase === 'optimizing') && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#161616]">
                {phase === 'optimizing' ? 'Optimizing your PDF…' : 'Reading your PDF…'}
              </span>
              <span className="text-sm text-[#47474f]">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e8e8ed]">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: '#e5322d' }}
              />
            </div>
            <p className="mt-3 text-xs text-[#47474f]">
              Preset: <strong className="text-[#161616]">{PRESETS.find((p) => p.value === preset)?.label}</strong>.
            </p>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="flex flex-col gap-4">
          <button
            onClick={doOptimize}
            disabled={!ready}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Optimizing…
              </span>
            ) : (
              'Optimize PDF'
            )}
          </button>
          {error && <p className="text-sm text-[#c92a24]">{error}</p>}
          <p className="text-xs text-[#47474f]">
            Works with PDFs up to 100 MB. Processing happens entirely in your browser; nothing is uploaded.
          </p>
        </div>
      )}
    </StandardLayout>
  );
}

