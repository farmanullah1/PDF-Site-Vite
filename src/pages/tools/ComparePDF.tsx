import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, Copy, GitCompare } from 'lucide-react';

const tool = toolById('compare-pdf')!;

interface PdfInfo {
  file: File;
  url: string;
  pages: number;
  sizeKB: number;
  name: string;
}

export default function ComparePDF() {
  const [a, setA] = useState<PdfInfo | null>(null);
  const [b, setB] = useState<PdfInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; name: string } | null>(null);
  const inputRefA = { current: null as HTMLInputElement | null };
  const inputRefB = { current: null as HTMLInputElement | null };

  const loadPdf = useCallback(
    async (f: File): Promise<PdfInfo> => {
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) throw new Error('Please select PDF files only.');
      if (f.size > 100 * 1024 * 1024) throw new Error('File is too large (limit 100 MB).');
      const buf = await readFileAsArrayBuffer(f);
      const n = await pdfPageCount(new Uint8Array(buf));
      return {
        file: f,
        url: URL.createObjectURL(f),
        pages: n,
        sizeKB: Math.round(f.size / 1024),
        name: f.name,
      };
    },
    []
  );

  const addFileA = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      try {
        const info = await loadPdf(f);
        setA(info);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to read file A.');
      }
    },
    [loadPdf]
  );

  const addFileB = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      try {
        const info = await loadPdf(f);
        setB(info);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to read file B.');
      }
    },
    [loadPdf]
  );

  const clearAll = useCallback(() => {
    if (a) URL.revokeObjectURL(a.url);
    if (b) URL.revokeObjectURL(b.url);
    setA(null);
    setB(null);
    setResult(null);
    setError(null);
  }, [a, b]);

  const doCompare = useCallback(async () => {
    if (!a || !b) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const bufA = await readFileAsArrayBuffer(a.file);
      const bufB = await readFileAsArrayBuffer(b.file);
      const srcA = await PDFLib.PDFDocument.load(new Uint8Array(bufA), { ignoreEncryption: true });
      const srcB = await PDFLib.PDFDocument.load(new Uint8Array(bufB), { ignoreEncryption: true });

      const lines: string[] = [];
      lines.push('PDF Comparison Report');
      lines.push('=====================');
      lines.push('');
      lines.push(`File A: ${a.name}`);
      lines.push(`  Pages: ${a.pages}`);
      lines.push(`  Size: ${a.sizeKB} KB`);
      lines.push('');
      lines.push(`File B: ${b.name}`);
      lines.push(`  Pages: ${b.pages}`);
      lines.push(`  Size: ${b.sizeKB} KB`);
      lines.push('');
      const pageDiff = a.pages - b.pages;
      const sizeDiff = a.sizeKB - b.sizeKB;
      lines.push('Difference:');
      lines.push(`  Pages: ${pageDiff > 0 ? `A has ${pageDiff} more` : pageDiff < 0 ? `B has ${-pageDiff} more` : 'same (0)'}`);
      lines.push(`  Size: ${sizeDiff > 0 ? `A is ${sizeDiff} KB larger` : sizeDiff < 0 ? `B is ${-sizeDiff} KB larger` : 'same (0 KB)'}`);
      lines.push('');
      lines.push('Conclusion:');
      if (pageDiff === 0 && sizeDiff === 0) {
        lines.push('  The two PDFs have identical page counts and file sizes.');
      } else {
        lines.push(`  The PDFs differ in ${Math.abs(pageDiff)} page(s) and ${Math.abs(sizeDiff)} KB.`);
      }

      const text = lines.join('\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const name = `compare-${a.name.replace(/\.pdf$/i, '')}-vs-${b.name.replace(/\.pdf$/i, '')}.txt`;
      setResult({ text, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Comparison failed.') + ' (Your files stay private.)');
    } finally {
      setLoading(false);
    }
  }, [a, b]);

  const ready = a !== null && b !== null && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Comparison complete</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#47474f]">Report</h3>
          <div className="rounded border border-[#c4c4cc] bg-[#f5f5fa] p-3 max-h-[320px] overflow-y-auto font-mono text-[11px] leading-relaxed text-[#161616]">
            {result.text.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(new Blob([result.text], { type: 'text/plain;charset=utf-8' }), result.name)} className="btn-primary w-full">
            Download report (.txt)
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(result.text).then(() => setError('Report copied to clipboard.')).catch(() => {});
          }} className="flex items-center justify-center rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm text-[#161616] transition-colors hover:border-[#161616]">
            <Copy size={14} /> Copy report
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Compared entirely in your browser. Nothing was uploaded.
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
          label="Select first PDF (File A)"
          helper="One file at a time"
          onFiles={addFileA}
          fileCount={a ? 1 : 0}
          fileInputRef={inputRefA}
        />
      </div>

      <div className="mb-5">
        <Dropzone
          accept=".pdf,application/pdf"
          maxSizeMB={100}
          multiple={false}
          label="Select second PDF (File B)"
          helper="One file at a time"
          onFiles={addFileB}
          fileCount={b ? 1 : 0}
          fileInputRef={inputRefB}
        />
      </div>

      {(a || b) && (
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Files to compare</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {a && (
              <div className="flex items-center gap-3 p-3 rounded border border-[#c4c4cc]/50 bg-[#f5f5fa]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5322d]/10 text-[#e5322d]">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <span className="truncate text-sm font-medium text-[#161616]">{a.name}</span>
                  <div className="flex gap-2 text-xs text-[#47474f]">
                    <span>{a.pages} page{a.pages === 1 ? '' : 's'}</span>
                    <span>·</span>
                    <span>{a.sizeKB} KB</span>
                  </div>
                </div>
              </div>
            )}
            {b && (
              <div className="flex items-center gap-3 p-3 rounded border border-[#c4c4cc]/50 bg-[#f5f5fa]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4a7aab]/10 text-[#4a7aab]">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <span className="truncate text-sm font-medium text-[#161616]">{b.name}</span>
                  <div className="flex gap-2 text-xs text-[#47474f]">
                    <span>{b.pages} page{b.pages === 1 ? '' : 's'}</span>
                    <span>·</span>
                    <span>{b.sizeKB} KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doCompare}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Comparing…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <GitCompare size={15} />
              Compare PDFs
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Compares two PDFs side by side: page count, file size, and a downloadable text report. Runs entirely in your browser.
        </p>
      </div>
    </StandardLayout>
  );
}

