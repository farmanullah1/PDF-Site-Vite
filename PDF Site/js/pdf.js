/* ===== pdf.js + pdf-lib helpers ===== */

const PDF_LIBS = {
  pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  pdfLib: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
};

/* Load pdf.js + set worker. Returns the pdfjs.PDFDocumentLoadingTask promise shape consumer. */
export function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const pdfScript = document.createElement('script');
    pdfScript.src = PDF_LIBS.pdfjs;
    pdfScript.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_LIBS.pdfWorker;
      const workerScript = document.createElement('script');
      workerScript.src = PDF_LIBS.pdfjsWorker;
      workerScript.onload = resolve;
      workerScript.onerror = () => reject(new Error('pdf.js worker failed to load'));
      document.head.appendChild(workerScript);
    };
    pdfScript.onerror = () => reject(new Error('pdf.js failed to load'));
    document.head.appendChild(pdfScript);
  });
}

export async function ensurePdfJs() {
  await loadPdfJs();
  if (!window.pdfjsLib) throw new Error('pdf.js failed to load');
  return window.pdfjsLib;
}

/* Load pdf-lib. Returns the PDFLib namespace. */
export async function ensurePdfLib() {
  if (window.PDFLib) return window.PDFLib;
  const script = document.createElement('script');
  script.src = PDF_LIBS.pdfLib;
  script.onload = () => { /* PDFLib becomes global */ };
  document.head.appendChild(script);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('pdf-lib failed to load')), 15000);
    const check = () => {
      if (window.PDFLib) { clearTimeout(timer); resolve(window.PDFLib); }
      else requestAnimationFrame(check);
    };
    check();
  });
  return window.PDFLib;
}

/* Read a file into ArrayBuffer. */
export function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}

/* File metadata for the UI. */
export function fileMeta(file) {
  const name = file.name || 'Untitled';
  const size = file.size;
  const sizeText = size >= 1024 * 1024
    ? (size / (1024 * 1024)).toFixed(2) + ' MB'
    : (size / 1024).toFixed(1) + ' KB';
  return { name, size, sizeText };
}

/* Quick page count using pdf.js without downloading full content stream unnecessarily. */
export async function pdfPageCount(buffer) {
  const pdfjs = await ensurePdfJs();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  return doc.numPages;
}

/* Render a single page to a given canvas element. Returns the rendered canvas. */
export async function renderPageToCanvas(buffer, pageNumber, canvas, dpi = 120) {
  const pdfjs = await ensurePdfJs();
  const scale = dpi / 72;
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}

/* Render a page to an offscreen canvas and return a PNG blob. */
export async function renderPageToPngBlob(buffer, pageNumber, dpi = 150) {
  const pdfjs = await ensurePdfJs();
  const scale = dpi / 72;
  const dataCopy = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data: dataCopy.buffer }).promise;
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = new OffscreenCanvas(viewport.width, viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blob;
}

/* Render a page to a JPG blob. */
export async function renderPageToJpgBlob(buffer, pageNumber, dpi = 150, quality = 0.92) {
  const png = await renderPageToPngBlob(buffer, pageNumber, dpi);
  const img = await createImageBitmap(png);
  const c = new OffscreenCanvas(img.width, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const jpg = await c.convertToBlob({ type: 'image/jpeg', quality });
  img.close();
  return jpg;
}

/* Render a page from an already-loaded pdfjs document to a JPG blob.
   Uses the document directly, so the original data buffer is not consumed again. */
export async function renderPageToJpgFromDoc(pdfDoc, pageNumber, dpi = 150, quality = 0.92) {
  const pdfjs = await ensurePdfJs();
  const scale = dpi / 72;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const c = new OffscreenCanvas(viewport.width, viewport.height);
  const ctx = c.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const jpg = await c.convertToBlob({ type: 'image/jpeg', quality });
  return jpg;
}

/* Basic encrypted/permissions inspection using pdf-lib. Returns a readable report object. */
export async function inspectPdfSecurity(buffer) {
  const PDFLib = await ensurePdfLib();
  const doc = await PDFLib.PDFDocument.load(buffer, { ignoreEncryption: false });
  const isEncrypted = doc.encrypted;
  let permissions = null;
  let userPasswordRequired = false;
  try {
    const perms = doc.getPermissions();
    permissions = perms ? Object.keys(perms).filter((k) => perms[k]).join(', ') : 'none reported';
  } catch (e) {
    permissions = 'could not read';
  }
  // pdf-lib throws on password-protected load if we didn't supply a password; treat as encrypted
  return {
    isEncrypted,
    permissions,
    userPasswordRequired,
    note: isEncrypted
      ? 'This PDF is encrypted. This demo reads the encryption flag and any reported permissions but does not remove passwords.'
      : 'This PDF is not encrypted.',
  };
}
