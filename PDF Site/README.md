# PDF Site — iLovePDF-style PDF tools

A client-side PDF tool site built as a **design/UX clone** of the [iLovePDF](https://www.ilovepdf.com/) homepage and tool flow, plus an optional Express backend for server-dependent operations. It uses the same layout pattern, color palette, typography scale, card hover behavior, dropzone UX, and grouped tool catalog, with original assets and a clearly-labeled "demo / learning" identity.

**This is a demo/learning project, not affiliated with the real iLovePDF service.** The brand wordmark is used as a text logo to match the reference design; do not deploy this as if it were the genuine iLovePDF website.

## What works

### Client-side tools (100% in browser, files never leave your device)

| Tool | What it does |
|------|-------------|
| Merge PDF | Combine 2+ PDFs into one, reorder by drag |
| Split PDF | Split all pages (one PDF per page) or extract a page range |
| Rotate PDF | Rotate per-page or all pages by 90°/180°/270° with live preview |
| JPG to PDF | Bundle JPG/PNG images into one PDF |
| PDF to JPG | Render every PDF page to downloadable JPG via PDF.js |
| Add Watermark | Text or image watermark (opacity, size, position, angle, tiled) |
| Unlock PDF | Remove restrictions from a copy you own |
| Compress PDF | Real pdf-lib re-serialized download with quality presets |
| Sign PDF | Draw or type a signature, place on a page, download |
| Remove Pages | Drop unwanted pages |
| Extract Pages | Pull pages out into a new file (ranges like `1-5, 8, 10-12`) |
| Organize PDF | Reorder pages with drag-drop + pdf.js thumbnails |
| Add Page Numbers | Stamp page numbers on any PDF |
| Edit PDF | Add text, shapes, and images directly on pages |
| Crop PDF | Trim margins with pdf-lib crop boxes |
| Redact PDF | Permanently black out sensitive content |
| OCR PDF | Turn scanned pages into searchable text via Tesseract.js (WebAssembly) |
| PDF to Text | Extract embedded text layer from PDF pages into a .txt file via PDF.js |

All client tools run entirely in the browser using **pdf-lib** (merge/split/rotate/embed) and **pdf.js** (page previews, loaded from CDN).

### Server-side tools (require the Express backend)

| Tool | What it does | Backend needs |
|------|-------------|---------------|
| Protect PDF | Password-protect PDFs | qpdf (falls back to pdf-lib passthrough) |
| Compress PDF | Ghostscript recompression | Ghostscript (falls back to pdf-lib) |
| Word/Excel/PowerPoint → PDF | Office conversions | LibreOffice headless |
| PDF → Word/Excel/PowerPoint | Office extractions | LibreOffice headless |
| HTML → PDF | Webpage/HTML to PDF | Puppeteer (not available in this deployment) |
| Repair PDF | Fix broken/corrupted PDFs | pdf-lib passthrough |
| PDF to PDF/A / Markdown | Archive / Markdown export | pdf-lib passthrough |

See `server/routes/process.js` for the full action list and fallbacks.

## Tech stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS 3 + custom CSS variables (iLovePDF design tokens)
- **Icons:** Lucide React
- **Routing:** react-router-dom
- **PDF engine:** pdf-lib (bundled) + pdf.js (CDN at runtime)
- **OCR:** tesseract.js (WebAssembly, browser-only)
- **Backend:** Express + multer + pdf-lib (+ optional qpdf / Ghostscript / LibreOffice)

## Install & run

```bash
cd "PDF Site"
npm install
```

### Frontend only (Vite dev server)

```bash
npm run dev        # http://127.0.0.1:5173
```

Client-side tools work immediately. Server-side tools (Protect, Office conversions, etc.) will return an error until the backend is running.

### Backend (Express)

```bash
cd server
npm install        # express, cors, multer, uuid, pdf-lib
npm start          # or: node app.js   -> http://localhost:3001
```

The Vite dev server proxies `/api` to `http://127.0.0.1:3001` (see `vite.config.ts`), so both can run side by side:

- Terminal 1: `npm run dev` (frontend, port 5173)
- Terminal 2: `cd server && npm start` (backend, port 3001)

### Production build

```bash
npm run build      # tsc + vite build -> dist/
npm run preview    # preview the production build
```

`dist/` is static HTML/JS — host it anywhere. The Express backend is separate (`server/`) and only needed for server-side tools.

## Project structure

```
PDF Site/
├── public/                # favicon, static assets
├── server/                # Express backend
│   ├── app.js             # Express app + /api routes + /health
│   ├── package.json       # express, cors, multer, uuid, pdf-lib
│   └── routes/process.js  # POST /api/process?action=<tool>
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer, StandardLayout (tool page shell)
│   │   ├── ui/            # Button, Card, Dropzone
│   │   └── pdf/           # PDFPreview, ToolOptionsPanel, Field
│   ├── pages/
│   │   ├── Home.tsx       # homepage: hero + grouped tool catalog
│   │   ├── ToolPage.tsx   # resolves tool id → component / ServerTool / ComingSoon
│   │   ├── App.tsx        # routes
│   │   └── tools/         # one file per tool (MergePDF, OCRPDF, etc.)
│   ├── lib/pdf-helpers.ts # pdf-lib / pdf.js loaders, file/buffer helpers
│   ├── data/toolsConfig.ts# tool catalog (26 tools, 6 categories)
│   ├── main.tsx
│   └── index.css          # Tailwind + design-system CSS variables
├── index.html
├── package.json
├── vite.config.ts         # /api proxy → http://127.0.0.1:3001
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Known limitations

- The iLovePDF wordmark is reproduced as a text logo. Do not present this as the official iLovePDF site.
- pdf.js must load from CDN; if the CDN is unreachable, preview-based tools (PDF to JPG, thumbnails) will not work.
- Compression is a real pdf-lib re-packaged download; true image recompression needs Ghostscript on the server.
- Office conversions need LibreOffice headless; HTML to PDF needs Puppeteer.
- tesseract.js OCR runs in the browser via WebAssembly and may be slow for multi-page docs.
