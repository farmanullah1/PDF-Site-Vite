import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField, Select, Range } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, ensurePdfJs } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FileText, Image, Download, X } from 'lucide-react';

const tool = toolById('add-watermark')!;

export default function AddWatermark() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.2);
  const [size, setSize] = useState(24);
  const [position, setPosition] = useState('center');
  const [angle, setAngle] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const pdfJsLib = useRef<unknown>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };
  const imageInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    ensurePdfJs().then((lib) => (pdfJsLib.current = lib)).catch(() => {});
  }, []);

  const addFile = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      if (pdfJsLib.current) renderPreview();
    },
    []
  );

  const addImage = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
      if (f.size > 10 * 1024 * 1024) { setError('Image is too large (limit 10 MB).'); return; }
      const url = URL.createObjectURL(f);
      setImageFile(f);
      setImageUrl(url);
      setError(null);
      if (canvasRef.current) {
        const img = new (window as any).Image();
        img.onload = () => {
          if (canvasRef.current) {
            canvasRef.current.width = Math.min(img.naturalWidth, 240);
            canvasRef.current.height = Math.min(img.naturalHeight, 240);
          }
        };
        img.src = url;
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
  }, [file, imageUrl]);

  const renderPreview = useCallback(async () => {
    if (!file || !pdfJsLib.current || !canvasRef.current) return;
    try {
      const lib = pdfJsLib.current as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
      const r = await fetch(file.url);
      const buf = await r.arrayBuffer();
      const pdf = await lib.getDocument({ data: buf }).promise as { getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number } }> };
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 1.2 });
      const c = canvasRef.current;
      c.width = Math.ceil(vp.width);
      c.height = Math.ceil(vp.height);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      await (page as any).render({ canvasContext: ctx, viewport: vp });
    } catch {}
  }, [file]);

  useEffect(() => {
    if (file && pdfJsLib.current) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, mode]);

  const doWatermark = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const buf = await readFileAsArrayBuffer(file.file);
      const src = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const font = await out.embedFont(StandardFonts.Helvetica);

      const useImage = mode === 'image' && imageUrl;
      let tileImage: any = null;
      if (useImage) {
        const imgBuf = await readFileAsArrayBuffer(imageFile!);
        tileImage = await out.embedPng(new Uint8Array(imgBuf));
      }

      for (let i = 0; i < src.getPageCount(); i++) {
        const page = await src.getPage(i);
        const [w, h] = [page.getWidth(), page.getHeight()];
        const targetW = w;
        const targetH = h;

        if (useImage && tileImage) {
          // draw image centered
          let iw = tileImage.width;
          let ih = tileImage.height;
          const scale = Math.min(targetW / iw, targetH / ih) * 0.5;
          iw *= scale;
          ih *= scale;
          const dx = (targetW - iw) / 2;
          const dy = (targetH - ih) / 2;
          page.drawImage(tileImage, { x: dx, y: dy, width: iw, height: ih, opacity });
        } else {
          const drawn = text || 'WATERMARK';
          const fontSize = size;
          if (position === 'tiled') {
            // tile across the page
            const spacing = fontSize * 4.5;
            for (let tx = -targetW; tx < targetW * 2; tx += spacing) {
              for (let ty = -targetH; ty < targetH * 2; ty += spacing) {
                page.drawText(drawn, {
                  x: tx,
                  y: ty,
                  size: fontSize,
                  font,
                  opacity,
                  rotate: ((angle * Math.PI) / 180) as any,
                });
              }
            }
            continue;
          }

          let x: number, y: number;
          if (position === 'center') {
            x = (targetW - font.widthOfTextAtSize(drawn, fontSize)) / 2;
            y = targetH / 2;
          } else if (position === 'top-left') {
            x = fontSize;
            y = targetH - fontSize;
          } else if (position === 'top-right') {
            x = targetW - font.widthOfTextAtSize(drawn, fontSize) - fontSize;
            y = targetH - fontSize;
          } else if (position === 'bottom-left') {
            x = fontSize;
            y = fontSize;
          } else if (position === 'bottom-right') {
            x = targetW - font.widthOfTextAtSize(drawn, fontSize) - fontSize;
            y = fontSize;
          } else {
            x = targetW / 2 - font.widthOfTextAtSize(drawn, fontSize) / 2;
            y = targetH / 2;
          }
          page.drawText(drawn, { x, y, size: fontSize, font, opacity, rotate: ((angle * Math.PI) / 180) as any });
        }

        out.addPage(page);
      }

      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Watermark failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, mode, text, opacity, size, position, angle, imageUrl, imageFile]);

  const ready = file !== null && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your watermarked PDF is ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Added {mode === 'text' ? 'a text watermark' : 'an image watermark'} to {file!.pages} page{file!.pages === 1 ? '' : 's'}.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download watermarked PDF
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
          label="Select the PDF to watermark"
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
          <canvas ref={canvasRef} className="mt-3 h-auto max-h-48 w-full rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] opacity-80" />
        </div>
      )}

      {/* watermark type toggle */}
      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Watermark type</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-all ${
                mode === 'text' ? 'border-[#e5322d] bg-[#fbeae7] text-[#c92a24] font-semibold' : 'border-[#c4c4cc] bg-white text-[#161616] hover:border-[#161616]'
              }`}
            >
              <span className="block text-sm font-medium">Text watermark</span>
              <span className="block text-xs">A text phrase repeated across the page</span>
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 rounded-lg border px-4 py-3 text-left transition-all ${
                mode === 'image' ? 'border-[#7253e2] bg-[#edeafb] text-[#7253e2] font-semibold' : 'border-[#c4c4cc] bg-white text-[#161616] hover:border-[#161616]'
              }`}
            >
              <span className="block text-sm font-medium">Image watermark</span>
              <span className="block text-xs">An image or logo stamped on every page</span>
            </button>
          </div>
        </div>
      </div>

      {/* image upload (shown only in image mode) */}
      {mode === 'image' && (
        <div className="mb-5">
          <Dropzone
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            maxSizeMB={10}
            multiple={false}
            label="Add a watermark image (optional)"
            helper="PNG, JPG or SVG recommended. Transparent backgrounds work best."
            onFiles={addImage}
            fileCount={imageFile ? 1 : 0}
            fileInputRef={imageInputRef}
          />
          {imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <span className="rounded-full bg-[#7253e2]/10 px-3 py-1 text-xs font-semibold text-[#7253e2]">Image selected</span>
              <button
                onClick={() => { if (imageUrl) URL.revokeObjectURL(imageUrl); setImageFile(null); setImageUrl(null); }}
                className="text-xs text-[#47474f] underline hover:text-[#161616]"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* text options (shown only in text mode) */}
      {mode === 'text' && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Text options</h3>
            <div className="flex flex-col gap-4">
              <TextField label="Watermark text" value={text} onChange={setText} placeholder="CONFIDENTIAL" help="The text that will be stamped on every page." />
              <Range label="Opacity" value={Math.round(opacity * 100)} min={5} max={100} step={1} onChange={(v) => setOpacity(v / 100)} unit="%" help="Lower opacity makes the watermark more subtle." />
              <Range label="Font size" value={size} min={8} max={120} step={1} unit="pt" onChange={setSize} help="Size of the watermark text." />
              <Select
                label="Position"
                value={position}
                onChange={setPosition}
                options={[
                  { value: 'center', label: 'Center of each page' },
                  { value: 'top-left', label: 'Top-left corner' },
                  { value: 'top-right', label: 'Top-right corner' },
                  { value: 'bottom-left', label: 'Bottom-left corner' },
                  { value: 'bottom-right', label: 'Bottom-right corner' },
                  { value: 'tiled', label: 'Tiled across the whole page' },
                ]}
              />
              <Range label="Angle" value={angle} min={-90} max={90} step={5} unit="°" onChange={setAngle} help="Tilt of the text. 45° is the classic diagonal look." />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button onClick={doWatermark} disabled={!ready} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Adding watermark…
            </span>
          ) : (
            'Add watermark'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          The watermark is applied to every page. Use a subtle opacity so the document stays readable.
        </p>
      </div>
    </StandardLayout>
  );
}
