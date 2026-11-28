import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select, Range } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FileText, Download, X } from 'lucide-react';

const tool = toolById('add-page-numbers')!;

const POSITIONS = [
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
];

const FORMATS = [
  { value: 'page', label: 'Page X', example: 'Page 3' },
  { value: 'pageOf', label: 'Page X of Y', example: 'Page 3 of 12' },
  { value: 'number', label: 'X', example: '3' },
];

export default function AddPageNumbers() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [format, setFormat] = useState('pageOf');
  const [position, setPosition] = useState('bottom-center');
  const [fontSize, setFontSize] = useState(14);
  const [opacity, setOpacity] = useState(0.85);
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
    setResult(null);
    setError(null);
  }, [file]);

  const doNumbers = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const font = await out.embedFont(StandardFonts.Helvetica);
      const total = src.getPageCount();
      const copied = await out.copyPages(src, [...Array(total).keys()]);
      for (const p of copied) out.addPage(p);

      for (let i = 0; i < total; i++) {
        const page = out.getPage(i);
        const [w, h] = [page.getWidth(), page.getHeight()];
        const label = format === 'page' ? `Page ${i + 1}` : format === 'pageOf' ? `Page ${i + 1} of ${total}` : String(i + 1);
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const margin = fontSize * 1.2;
        let x = 0, y = 0;
        if (position === 'bottom-center') { x = (w - textWidth) / 2; y = margin; }
        else if (position === 'bottom-right') { x = w - textWidth - margin; y = margin; }
        else if (position === 'bottom-left') { x = margin; y = margin; }
        else if (position === 'top-center') { x = (w - textWidth) / 2; y = h - margin; }
        else if (position === 'top-right') { x = w - textWidth - margin; y = h - margin; }
        else { x = margin; y = h - margin; }
        page.drawText(label, { x, y, size: fontSize, font, color: { r: 0, g: 0, b: 0 } as any, opacity });
      }

      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Page numbers failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, format, position, fontSize, opacity]);

  const ready = file !== null && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Page numbers added</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Numbered {file!.pages} page{file!.pages === 1 ? '' : 's'} ({format} format, {position}).
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download numbered PDF
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
          label="Select the PDF to number"
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
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Numbering options</h3>
          <div className="flex flex-col gap-4">
            <Select
              label="Format"
              value={format}
              onChange={setFormat}
              options={FORMATS.map((o) => ({ value: o.value, label: o.label }))}
              help="How each page number should appear."
            />
            <Select
              label="Position"
              value={position}
              onChange={setPosition}
              options={POSITIONS.map((o) => ({ value: o.value, label: o.label }))}
              help="Where to stamp the number on each page."
            />
            <Range label="Font size" value={fontSize} min={6} max={72} step={1} unit="pt" onChange={setFontSize} />
            <Range label="Opacity" value={Math.round(opacity * 100)} min={10} max={100} step={5} unit="%" onChange={(v) => setOpacity(v / 100)} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={doNumbers}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Adding page numbers…
            </span>
          ) : (
            'Add page numbers'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          A page number is stamped on every page of the document.
        </p>
      </div>
    </StandardLayout>
  );
}

