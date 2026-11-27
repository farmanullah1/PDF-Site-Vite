# PDF Site

A learning clone / demo of a modern online PDF tool site, built as a client-side-only static web app.

## What this is

This is a client-side demo that mirrors the general layout pattern of a popular online PDF tool homepage: a header with brand area and category nav, a hero section, a row of category filter pills, and a grid of tool cards. Each tool has its own page with an upload zone, file list, action buttons, and download output.

The site is **not** affiliated with, endorsed by, or derived from the real site it resembles. All branding, copy, and layout are original placeholder content. The resemblance is to the *pattern* of the page (tool directory and tool page shell), not to any copyrighted text, logo, or asset.

## Implemented tools

- **Merge PDF** — upload multiple PDFs, reorder, merge into one downloadable PDF (pdf-lib).
- **Split PDF** — extract selected pages or page ranges into a new PDF (pdf-lib).
- **Rotate PDF** — rotate selected pages (pdf-lib).
- **Add page numbers** — stamp page numbers onto selected pages (pdf-lib).
- **Add watermark** — stamp text or a simple tiled pattern onto pages (pdf-lib).
- **Organize pages** — list pages, reorder by drag/drop, drop pages, rotate individual pages, save (pdf-lib + pdf.js for previews).
- **PDF to JPG** — render each PDF page to a downloadable JPG via pdf.js canvas.
- **JPG to PDF** — bundle JPG/PNG images into a single downloadable PDF, in the order you choose (pdf-lib).
- **Unlock / permissions** — read-only inspection: report whether a PDF is encrypted and what permissions it declares (pdf-lib). This does **not** crack or remove passwords.

## Clearly-labeled stubs

These are shown as "not available in this demo" because they need a server, commercial backend, or capabilities this client-side demo does not implement:

- **Compress PDF** — labeled stub. Explanation that real compression is server-side/limited client-side. The demo shows the upload zone and explains the limitation; it does not fake a working compress.
- **PDF to Word** — labeled stub. Document conversion to DOCX is server-side; the page explains that and does not pretend to convert.

## Out of scope (intentionally left out)

OCR, repair corrupted PDFs, redact, form fill/signing, AI summarization/translation, digital signatures, password protection/encryption, PDF/A conversion, document comparison, scan-to-PDF, mobile/desktop downloadable apps, premium/upgrade marketing flows, and any server-side backend. Where a tool page would normally point to one of these, this site shows an explicit "not available in this demo" message.

## Run

From the `PDF Site/` folder:

```bash
npm install
npm run dev
```

Then open the URL the dev server prints. You can also open `index.html` directly from disk for the homepage, but tool pages that rely on fetch for a page shell may be simpler to run via the dev server.

If you do not have Node, serve the folder with any static server (Python, PHP, etc.) or open the homepage HTML file directly.

## Dependencies

No install step downloads runtime assets locally. The app loads the following from CDN at runtime:

- pdf.js (Mozilla) — rendering PDF pages to canvas for previews and PDF-to-JPG.
- pdf-lib — creating, loading, and manipulating PDFs in the browser.

Exact CDN URLs are referenced in the app and listed in the README so the site is transparent about what it loads.

## Verification (results from this build)

The dev server was started with `npx vite` on 127.0.0.1:3000 and the following was confirmed in the browser:

1. Homepage loads with all 12 tool cards, category nav, filter pills, hero, and footer.
2. Filter pills work: clicking "Organize PDF" shows only the 3 organize-category cards; clicking "All" restores all cards.
3. Merge PDF: drop 2 PDFs, click "Do it", produces a downloadable merged PDF (verified by fetching the result blob — valid %PDF-1.7).
4. Split PDF: drop a 4-page PDF, select pages 2-3, produces a downloadable extracted PDF.
5. Rotate PDF: drop a PDF, click "Do it", produces a downloadable rotated PDF.
6. Add page numbers: drop a PDF, click "Do it", produces a downloadable PDF with page numbers.
7. Add watermark: drop a PDF, click "Do it", produces a downloadable watermarked PDF.
8. Organize pages: drop a PDF, shows page thumbnails, click "Do it", saves a downloadable PDF in the shown order.
9. PDF to JPG: drop a 2-page PDF, click "Do it", renders and downloads 2 JPGs (one per page).
10. Unlock PDF: drop a PDF, shows an encryption report (encrypted / not encrypted, reported permissions).
11. Compress PDF and PDF to Word pages render as labeled stubs ("Not available in this demo").

Known limitations observed:
- Organize pages renders page thumbnails via pdf.js canvas; in some browser contexts the thumbnails fall back to page-number text only. The save/sort/drop/rotate functionality still works.
- All tools load pdf.js and pdf-lib from CDN at runtime. If offline, the tools that need rendering (PDF to JPG, organize thumbnails) will not work.
- Test PDFs used during verification were generated with pdf-lib's `addPage([width, height])` (a 2-element array). A 4-element MediaBox array `[llx, lly, urx, ury]` does not set the MediaBox correctly in the pdf-lib version used here.

## Files

- `index.html` — homepage.
- `vite.config.js` — Vite config (dev server on 127.0.0.1).
- `package.json` + `package-lock.json` — dev dependency on Vite.
- `js/app.js` — shared homepage UI helpers (category nav, filter pills, tool grid).
- `js/tools.js` — tool card catalog and homepage rendering.
- `js/tool-shell.js` — shared tool-page shell (header, dropzone, file list, action row, result, stub page).
- `js/pdf.js` — pdf.js + pdf-lib loading and integration helpers (loadPdfJs, ensurePdfJs, ensurePdfLib, readFileAsBuffer, pdfPageCount, renderPageToCanvas, renderPageToPngBlob, renderPageToJpgBlob, renderPageToJpgFromDoc, inspectPdfSecurity).
- `tools/*.html` — individual tool pages (merge, split, rotate, numbers, watermark, organize, pdf-to-jpg, unlock, compress, pdf-to-word, jpg-to-pdf, word-to-pdf).
- `styles/global.css` — shared styles (header, filter pills, tool grid, dropzone, file list, action row, result, stub, footer).
- `styles/tool.css` — tool-page-specific styles.
- `styles/home.css` — homepage styles (currently empty; shared styles live in global.css).
- `README.md` — this file.
