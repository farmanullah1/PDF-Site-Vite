import { useEffect, useRef, useState } from 'react';

interface PDFPreviewProps {
  url: string;            // object URL (blob) to the PDF
  maxPages?: number;      // how many page thumbnails to render (default: first 6)
  height?: number;        // thumbnail height in px
}

export default function PDFPreview({ url, maxPages = 6, height = 120 }: PDFPreviewProps) {
  const [pages, setPages] = useState<Array<{ index: number; src: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pdfjsLib: typeof window as unknown as { pdfjsLib?: typeof import('pdfjs-dist') } | undefined;

    async function load() {
      try {
        // Dynamically load pdf.js worker + library if not already present
        if (!(window as unknown as { pdfjsLib?: unknown }).pdfjsLib) {
          const pdfJsScript = document.createElement('script');
          pdfJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          pdfJsScript.onload = () => {
            (window as unknown as { pdfjsLib?: unknown }).pdfjsLib = window.pdfjsLib;
            setPdfjsWorker();
          };
          pdfJsScript.onerror = () => {
            setError('PDF.js failed to load from CDN. This tool needs an internet connection.');
            setLoading(false);
          };
          document.head.appendChild(pdfJsScript);
          return;
        }
        setPdfjsWorker();
      } catch (err) {
        setError('Could not load the PDF.');
        setLoading(false);
      }

      async function setPdfjsWorker() {
        const pdfjsLib = (window as unknown as { pdfjsLib?: import('pdfjs-dist').pdfjsLib }).pdfjsLib;
        if (!pdfjsLib) return;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const data = await (fetch(url).then((r) => r.arrayBuffer()));
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const total = Math.min(pdf.numPages, maxPages);
        const rendered: Array<{ index: number; src: string }> = [];

        for (let i = 1; i <= total && !cancelled; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          rendered.push({ index: i, src: canvas.toDataURL('image/png') });
        }
        if (!cancelled) {
          setPages(rendered);
          setLoading(false);
        }
      }

      setPdfjsWorker();
    }

    load();
    return () => { cancelled = true; };
  }, [url, maxPages, height]);

  if (error) {
    return (
      <div className="rounded-xl border border-[#c4c4cc] bg-[#fbeae7] p-4 text-sm text-[#c92a24]">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4c4cc] border-t-[#e5322d]" />
        <span className="ml-3 text-sm text-[#47474f]">Generating previews…</span>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-6 text-center text-sm text-[#47474f]">
        No pages to preview.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {pages.map(({ index, src }) => (
        <div key={index} className="overflow-hidden rounded-lg border border-[#c4c4cc] bg-white">
          <img
            src={src}
            alt={`Page ${index}`}
            className="h-auto w-full object-contain bg-[#f5f5fa]"
            style={{ maxHeight: height * 1.4 }}
          />
          <div className="flex items-center justify-between border-t border-[#c4c4cc] px-3 py-1.5 text-xs text-[#47474f]">
           Page {index}
          </div>
        </div>
      ))}
      {pages.length === 0 && <div />}
    </div>
  );
}
