import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField, Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X } from 'lucide-react';

const tool = toolById('split-pdf')!;

export default function SplitPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [mode, setMode] = useState<'all' | 'range'>('all');
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ name: string; blob: Blob }>>([]);
  const fileInputRef = { current: null as HTMLInputElement | null };

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({
        file: f,
        url: URL.createObjectURL(f),
        pages: 0,
      });
      setError(null);
      try {
        const buf = await requireUnsafe(f);
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
    setResults([]);
    setError(null);
  }, [file]);

  const doSplit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const total = src.getPageCount();
      const fromNum = Math.max(1, parseInt(from, 10) || 1);
      const toNum = Math.min(total, parseInt(to, 10) || total);

      if (mode === 'range') {
        if (fromNum > toNum) {
          setError('From page must be less than or equal to To page.');
          setLoading(false);
          return;
        }
        if (fromNum > total) {
          setError(`The PDF only has ${total} page${total === 1 ? '' : 's'}.`);
          setLoading(false);
          return;
        }
        const out = await PDFLib.PDFDocument.create();
        const copied = await out.copyPages(src, [...Array(toNum - fromNum + 1).keys()].map((i) => fromNum - 1 + i));
        for (const p of copied) out.addPage(p);
        const bytes = await out.save();
        const name = file.file.name.replace(/\.pdf$/i, '') + `-pages-${fromNum}-to-${toNum}.pdf`;
        setResults([{ name, blob: bytesToBlob(bytes, 'application/pdf') }]);
      } else {
        // split all pages into individual PDFs
        const outFiles: Array<{ name: string; blob: Blob }> = [];
        for (let i = 0; i < total; i++) {
          const out = await PDFLib.PDFDocument.create();
          const copied = await out.copyPages(src, [i]);
          for (const p of copied) out.addPage(p);
          const bytes = await out.save();
          const base = file.file.name.replace(/\.pdf$/i, '') || 'page';
          outFiles.push({ name: `${base}-page-${i + 1}.pdf`, blob: bytesToBlob(bytes, 'application/pdf') });
        }
        setResults(outFiles);
      }
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Split failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, mode, from, to]);

  const ready = file !== null && !loading;

  if (results.length > 0) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">
            {mode === 'all' ? `Split into ${results.length} file${results.length === 1 ? '' : 's'}` : 'Your extracted pages are ready'}
          </h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="mb-4 text-sm text-[#47474f]">
          {mode === 'all'
            ? `Split ${file!.pages} pages into ${results.length} separate PDF${results.length === 1 ? '' : 's'}.`
            : `Extracted pages ${from} to ${to} into one PDF.`}
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <button
                key={r.name}
                onClick={() => downloadBlob(r.blob, r.name)}
                className="flex items-center gap-3 rounded-xl border border-[#c4c4cc] bg-white p-4 text-left transition-all hover:border-[#161616] hover:shadow-[card-hover]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5322d]/10 text-[#e5322d]">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <span className="truncate text-sm font-medium text-[#161616]">{r.name}</span>
                  <span className="text-xs text-[#47474f]">{r.blob.size > 1024 ? `${(r.blob.size / 1024).toFixed(1)} KB` : `${r.blob.size} B`}</span>
                </div>
                <Download size={16} className="shrink-0 text-[#161616]" />
              </button>
            ))}
          </div>
          {mode === 'all' && results.length > 1 && (
            <button
              onClick={() => {
                results.forEach((r, i) => setTimeout(() => downloadBlob(r.blob, r.name), i * 250));
              }}
              className="btn-primary w-full"
            >
              Download all {results.length} files
            </button>
          )}
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
          label="Select the PDF to split"
          helper="Only one file at a time"
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
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
            >
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
          <div className="flex flex-col gap-4">
            <Select
              label="Split type"
              value={mode}
              onChange={(v) => setMode(v as 'all' | 'range')}
              options={[
                { value: 'all', label: 'Split all pages — each page becomes its own PDF' },
                { value: 'range', label: 'Extract a page range into one PDF' },
              ]}
            />
            {mode === 'range' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <TextField
                  label="From page"
                  value={from}
                  onChange={setFrom}
                  placeholder="1"
                  help="First page to extract (1-based)."
                />
                <TextField
                  label="To page"
                  value={to}
                  onChange={setTo}
                  placeholder={`${file?.pages ?? '1'}`}
                  help={`Last page to extract. The PDF has ${file?.pages ?? '—'} pages.`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doSplit}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Splitting…
            </span>
          ) : mode === 'all' ? (
            `Split all pages`
          ) : (
            `Extract pages`
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Split all pages creates one PDF per page. Use the download buttons to save them.
        </p>
      </div>
    </StandardLayout>
  );
}

async function requireUnsafe(file: File): Promise<ArrayBuffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (file as any).arrayBuffer ? await (file as any).arrayBuffer() : await (file as any).arrayBuffer();
}
