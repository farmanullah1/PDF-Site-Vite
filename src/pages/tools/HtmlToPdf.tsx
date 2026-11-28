import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { FileText, Download, X, Code, Image } from 'lucide-react';
import { toPng } from 'html-to-image';

const tool = toolById('html-to-pdf')!;

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Document</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
    h1 { color: #EE6C4D; border-bottom: 2px solid #EE6C4D; padding-bottom: 10px; }
    p { margin: 1em 0; }
    .highlight { background: #fbeae7; padding: 10px; border-left: 4px solid #EE6C4D; }
  </style>
</head>
<body>
  <h1>Converted from HTML</h1>
  <p>This PDF was generated directly from your HTML code in the browser.</p>
  <div class="highlight">Your content stays private — nothing is uploaded to any server.</div>
</body>
</html>`;

export default function HtmlToPdf() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtml(e.target?.result as string);
      };
      reader.readAsText(file.file);
    }
  }, [file]);

  const addFile = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isHtml = f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm') || f.type.includes('html');
      if (!isHtml) { setError('Please select an HTML file.'); return; }
      setFile({ file: f, url: URL.createObjectURL(f) });
      setError(null);
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setHtml(DEFAULT_HTML);
    setResult(null);
    setError(null);
  }, [file]);

  const doConvert = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!containerRef.current) {
        setError('Render container not available.');
        return;
      }

      containerRef.current.innerHTML = html;
      containerRef.current.style.display = 'block';
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.left = '-9999px';
      containerRef.current.style.top = '0';
      containerRef.current.style.width = '800px';
      containerRef.current.style.background = '#ffffff';
      containerRef.current.style.padding = '40px';
      containerRef.current.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(containerRef.current);

      try {
        const dataUrl = await toPng(containerRef.current, {
          width: 800,
          height: 1100,
          cacheBust: true,
          style: {
            width: '800px',
            background: '#ffffff',
          },
        });

        const imgBlob = await (await fetch(dataUrl)).blob();
        const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());

        const PDFLib = await getPdfLib();
        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]);
        const img = await pdfDoc.embedPng(imgBytes);
        const { width, height } = img;
        const pageW = page.getWidth();
        const pageH = page.getHeight();
        const fitW = pageW - 80;
        const fitH = pageH - 80;
        const scale = Math.min(fitW / width, fitH / height);
        const drawW = width * scale;
        const drawH = height * scale;
        page.drawImage(img, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });

        const bytes = await pdfDoc.save();
        const blob = bytesToBlob(bytes, 'application/pdf');
        const name = (file ? file.file.name.replace(/\.(html|htm)$/i, '') : 'document') + '.pdf';
        setResult({ blob, name });
      } finally {
        if (containerRef.current && containerRef.current.parentNode) {
          containerRef.current.parentNode.removeChild(containerRef.current);
        }
      }
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Conversion failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [html, file]);

  const ready = html.trim().length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your HTML is now a PDF</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Converted entirely in your browser via html-to-image and pdf-lib. Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Dropzone
          accept=".html,.htm,text/html"
          maxSizeMB={10}
          multiple={false}
          label="Or upload an HTML file"
          helper="HTML file will replace the code below"
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        />
      </div>

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">HTML code</h3>
          <div className="relative">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] p-4 font-mono text-sm text-[#161616] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d] resize-y"
              placeholder="Paste your HTML here..."
              spellCheck={false}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-[#47474f]">
              <Code size={14} />
              <span>{html.length} characters</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Preview</h3>
          <div ref={containerRef} style={{ display: 'none' }} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={doConvert} disabled={!ready} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Converting to PDF…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Image size={15} />
              Convert HTML to PDF
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Your HTML is rendered to an image and embedded in a PDF using pdf-lib. Everything runs in your browser — nothing is uploaded.
        </p>
      </div>
    </StandardLayout>
  );
}

