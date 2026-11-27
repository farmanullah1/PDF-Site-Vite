const PDFLIB_VERSION = '1.17.1';
const PDFJS_VERSION = '3.11.174';

let pdfLibPromise: Promise<typeof import('pdf-lib')> | null = null;
let pdfjsLibPromise: Promise<unknown> | null = null;

export async function getPdfLib(): Promise<typeof import('pdf-lib')> {
  if (!pdfLibPromise) {
    pdfLibPromise = import('pdf-lib').catch((err) => {
      throw new Error(`Failed to load pdf-lib: ${err.message}`);
    });
  }
  return pdfLibPromise;
}

export async function ensurePdfJs(): Promise<unknown> {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      if ((window as unknown as { pdfjsLib?: unknown }).pdfjsLib) {
        return (window as unknown as { pdfjsLib: unknown }).pdfjsLib;
      }
      // Load pdf.js from CDN
      const loadScript = (src: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`Failed to load script ${src}`));
          document.head.appendChild(s);
        });
      await loadScript(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`);
      const pdfjsLib = (window as unknown as { pdfjsLib?: unknown }).pdfjsLib as unknown;
      if (!pdfjsLib) throw new Error('pdf.js did not expose window.pdfjsLib');
      (pdfjsLib as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
      return pdfjsLib;
    })();
  }
  return pdfjsLibPromise;
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsArrayBuffer(file);
  });
}

export function arrayBufferToBytes(buffer: ArrayBuffer | Uint8Array): Uint8Array {
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

export function bytesToBlob(bytes: Uint8Array | ArrayBuffer, type = 'application/pdf'): Blob {
  const buf = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  return new Blob([buf], { type });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function pdfPageCount(bytes: Uint8Array): Promise<number> {
  const PDFLib = await getPdfLib();
  const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

export async function inspectPdfSecurity(bytes: Uint8Array): Promise<{ encrypted: boolean; userProtected: boolean }> {
  const PDFLib = await getPdfLib();
  let encrypted = false;
  let userProtected = false;
  try {
    const doc = await PDFLib.PDFDocument.load(bytes);
    // pdf-lib v1.x: doc.isEncrypted is not always reliable; attempt load without ignoreEncryption
    const doc2 = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: false });
    encrypted = doc2.isEncrypted;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('password') || msg.includes('encrypted') || msg.includes('Encrypted')) {
      encrypted = true;
      userProtected = true;
    } else {
      throw e;
    }
  }
  return { encrypted, userProtected };
}

export async function renderPdfPageToCanvas(
  pdfjsLib: unknown,
  arrayBuffer: ArrayBuffer,
  pageNumber: number,
  scale = 1.4
): Promise<HTMLCanvasElement> {
  const lib = pdfjsLib as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<unknown> } };
  const data = new Uint8Array(arrayBuffer);
  const pdf = await lib.getDocument({ data }).promise as { getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number } }> };
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  await (page as { render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => Promise<unknown> }).render({ canvasContext: ctx, viewport });
  return canvas;
}
