import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select, TextField } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { FileText, Download, X, PenLine, Trash2 } from 'lucide-react';

const tool = toolById('sign-pdf')!;

export default function SignPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const fileInputRef = { current: null as HTMLInputElement | null };
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#161616';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const drawDot = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || drawing.current === false) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawDot(e);
  };

  const onPointerUp = () => { drawing.current = false; };

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
      const count = await pdfPageCount(new Uint8Array(await readFileAsArrayBuffer(f)));
      setFile((p) => (p && p.file === f ? { ...p, pages: count } : p));
    },
    [pageIdx]
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setPageIdx(0);
    setResult(null);
    setError(null);
    resetSignature();
  }, [file]);

  const resetSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getSignatureBlob = useCallback((): Blob | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (signatureType === 'type' && typedName.trim()) {
      const c = document.createElement('canvas');
      c.width = 400;
      c.height = 80;
      const ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#161616';
      ctx.font = 'italic 44px Inter, Georgia, serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName.trim(), c.width - 24, c.height / 2);
      return new Blob([c.toDataURL('image/png').split(',')[1], ''], { type: 'image/png' });
    }
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    const bin = atob(base64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return new Blob([buf], { type: 'image/png' });
  }, [signatureType, typedName]);

  const doSign = useCallback(async () => {
    if (!file) return;
    const sigBlob = getSignatureBlob();
    if (!sigBlob) { setError('Please create a signature first.'); return; }
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const buf = await readFileAsArrayBuffer(file.file);
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      // copy all pages
      const indices = [...Array(src.getPageCount()).keys()];
      const copied = await out.copyPages(src, indices);
      for (const p of copied) out.addPage(p);

      const sigImg = await out.embedPng(new Uint8Array(await sigBlob.arrayBuffer()));
      const totalPages = out.getPageCount();
      const targetIdx = Math.min(pageIdx, totalPages - 1);
      const page = out.getPage(targetIdx);
      const pageW = page.getWidth();
      const pageH = page.getHeight();
      const sigW = Math.min(sigImg.width, pageW * 0.28);
      const sigH = sigImg.height * (sigW / sigImg.width);
      const x = pageW - sigW - pageW * 0.04;
      const y = pageH * 0.04;
      page.drawImage(sigImg, { x, y, width: sigW, height: sigH });

      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-signed.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Signing failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, pageIdx, signatureType, typedName, getSignatureBlob]);

  const ready = file !== null && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your signed PDF is ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Signature placed on page {pageIdx + 1} of {file!.pages}.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download signed PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Your file was processed entirely in your browser. Nothing was uploaded.
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
          label="Select the PDF to sign"
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
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Create your signature</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => { setSignatureType('draw'); resetSignature(); }}
                  className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                    signatureType === 'draw' ? 'border-[#e5322d] bg-[#fbeae7] text-[#c92a24] font-semibold' : 'border-[#c4c4cc] bg-white text-[#161616] hover:border-[#161616]'
                  }`}
                >
                  Draw
                </button>
                <button
                  onClick={() => { setSignatureType('type'); }}
                  className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                    signatureType === 'type' ? 'border-[#7253e2] bg-[#edeafb] text-[#7253e2] font-semibold' : 'border-[#c4c4cc] bg-white text-[#161616] hover:border-[#161616]'
                  }`}
                >
                  Type name
                </button>
              </div>
              {signatureType === 'draw' ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={140}
                    className="block rounded-lg border-2 border-[#c4c4cc] bg-white cursor-crosshair touch-none"
                    onMouseDown={onPointerDown}
                    onMouseMove={drawDot}
                    onMouseUp={onPointerUp}
                    onMouseLeave={onPointerUp}
                    onTouchStart={onPointerDown}
                    onTouchMove={drawDot}
                    onTouchEnd={onPointerUp}
                  />
                  <button
                    onClick={resetSignature}
                    className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs text-[#161616] shadow-sm transition-colors hover:bg-white"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <TextField
                    label="Type your name"
                    value={typedName}
                    onChange={setTypedName}
                    placeholder="Type your full name"
                    help="We'll render it as an italic signature."
                  />
                  {typedName.trim() && (
                    <div className="rounded-lg border border-[#c4c4cc] bg-white p-2 text-center text-xl italic text-[#161616]">
                      {typedName}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Signature placement</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#161616]">Page to sign</label>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageIdx + 1)}
                    onChange={(v) => setPageIdx(parseInt(v, 10) - 1)}
                    options={Array.from({ length: file.pages }, (_, i) => ({ value: String(i + 1), label: `Page ${i + 1}` }))}
                  />
                </div>
              </div>
              <p className="text-xs text-[#47474f]">
                The signature is placed in the bottom-right corner of the chosen page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button onClick={doSign} disabled={!ready} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing PDF…
            </span>
          ) : (
            'Add signature to PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Draw your signature with your mouse, trackpad, or finger, or type your name and we'll render it as a signature.
        </p>
      </div>
    </StandardLayout>
  );
}
