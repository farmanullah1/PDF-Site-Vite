import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X } from 'lucide-react';

const tool = toolById('extract-pages')!;

function parsePages(input: string, total: number): number[] | null {
  const pages: number[] = [];
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) return null;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    if (a < 1 || b < 1 || a > total || b > total || a > b) return null;
    for (let p = a; p <= b; p++) pages.push(p);
  }
  // dedupe, keep order
  const seen = new Set<number>();
  const out: number[] = [];
  for (const p of pages) if (!seen.has(p)) { seen.add(p); out.push(p); }
  return out;
}

export default function ExtractPages() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [ranges, setRanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
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
      setRanges('');
      setResult(null);
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
    setRanges('');
    setResult(null);
    setError(null);
  }, [file]);

  const doExtract = useCallback(async () => {
    if (!file) return;
    const pages = parsePages(ranges, file.pages);
    if (!pages || pages.length === 0) { setError('Enter page ranges, e.g. 1-5, 8, 10-12.'); return; }
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p - 1));
      for (const p of copied) out.addPage(p);
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-extracted.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Extract failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, ranges]);

  const pages = file ? parsePages(ranges, file.pages) : null;
  const ready = pages ? pages.length > 0 : false;
  const parsed = pages ?? [];

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Pages extracted</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Extracted {parsed?.length ?? 0} page{parsed?.length === 1 ? '' : 's'} into a new PDF.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download extracted PDF
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
          label="Select the PDF to extract from"
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
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Pages to extract</h3>
          <TextField
            label="Page ranges"
            value={ranges}
            onChange={setRanges}
            placeholder="1-5, 8, 10-12"
            help="Comma-separated pages or ranges. Uses the PDF's 1-based page numbers. Example: 1-3, 7, 9-11"
          />
          {parsed && (
            <p className="mt-2 text-xs text-[#47474f]">
              {parsed.length} page{parsed.length === 1 ? '' : 's'} will be extracted: {parsed.slice(0, 12).join(', ')}{parsed.length > 12 ? '…' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doExtract}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Extracting pages…
            </span>
          ) : (
            'Extract pages'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          The selected pages are saved into a new PDF file, in the order you specify.
        </p>
      </div>
    </StandardLayout>
  );
}
