# PDF Site — iLovePDF-style PDF tools (web demo)

A client-side, browser-based PDF tool site built as a **design/UX clone** of the [iLovePDF](https://www.ilovepdf.com/) homepage and tool flow. It uses the same layout pattern, color palette, typography scale, card hover behavior, dropzone UX and grouped tool catalog, but with original assets and a clearly-labeled "demo / learning" identity.

**This is a demo/learning project, not affiliated with the real iLovePDF service.** The brand wordmark is used as a text logo to match the reference design; do not deploy this as if it were the genuine iLovePDF website.

## What's in here

```
PDF Site/
├── public/
│   ├── favicon.svg
│   └── old-index.html        # backup of the previous vanilla-JS homepage
├── src/
│   ├── components/
│   │   ├── layout/           # Header, Footer, MobileNav, StandardLayout (tool page shell)
│   │   ├── ui/               # Button, Card (tool cards), Dropzone
│   │   └── pdf/              # PDFPreview (pdf.js thumbnails), ToolOptionsPanel (controls)
│   ├── pages/
│   │   ├── Home.tsx          # homepage: hero + 26-tool grouped catalog
│   │   ├── ToolPage.tsx      # resolves a tool id to its component or a "coming soon" stub
│   │   ├── NotFound.tsx
│   │   ├── AccountPages.tsx  # /login, /signup, /privacy stubs
│   │   └── tools/
│   │       ├── MergePDF.tsx
│   │       ├── SplitPDF.tsx
│   │       ├── RotatePDF.tsx
│   │       ├── JPGToPDF.tsx
│   │       ├── PDFToJPG.tsx
│   │       ├── AddWatermark.tsx
│   │       ├── UnlockPDF.tsx
│   │       ├── CompressPDF.tsx
│   │       ├── SignPDF.tsx
│   │       └── ComingSoon.tsx
│   ├── lib/
│   │   └── pdf-helpers.ts    # pdf-lib / pdf.js loaders, file/buffer helpers, page count, security
│   ├── data/
│   │   └── toolsConfig.ts    # full tool catalog (26 tools grouped into 6 categories)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css             # Tailwind + design-system CSS variables (iLovePDF tokens)
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── tsconfig.node.json
└── README.md
```

## Tech stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS 3 + custom CSS variables for the iLovePDF design tokens (colors, typography scale, shadows)
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)
- **PDF engine (client-side):** [pdf-lib](https://github.com/Hopding/pdf-lib) for merge/split/rotate/embed-watermark/sign; [PDF.js](https://github.com/mozilla/pdf.js) for page previews/thumbnails
- **Icons, UI:** Lucide React
- **Routing:** react-router-dom

## What works (client-side, end-to-end)

- **Merge PDF** — add 2+ PDFs, reorder by drag, merge into one downloadable PDF.
- **Split PDF** — split all pages (one PDF per page) or extract a page range into one PDF.
- **Rotate PDF** — rotate per-page or all pages by 90°/180°/270°, with a live preview.
- **JPG to PDF** — bundle JPG/PNG/WebP/BMP images into one PDF, one image per page, fit-to-image/A4/Letter.
- **PDF to JPG** — render every PDF page to a downloadable JPG via PDF.js.
- **Add Watermark** — text watermark (opacity, size, position, angle, tiled) or an image watermark per page.
- **Unlock PDF** — inspect encryption; if user-password-protected, open with the password and save an unrestricted copy.
- **Compress PDF** — UI simulation with quality presets (high/recommended/extreme), a progress bar and an estimated output size, plus a real pdf-lib re-serialized download. **Note:** true image recompression needs Ghostscript on the server.
- **Sign PDF** — draw a signature on a canvas or type a name, place it on a chosen page, download.

Tools shown but **not implemented client-side** (ComingSoon / simulation / backend):

- Remove Pages, Extract Pages, Organize PDF, Optimize PDF, Repair PDF, OCR PDF, Word→PDF, PowerPoint→PDF, Excel→PDF, HTML→PDF, PDF→Word, PDF→PowerPoint, PDF→Excel, PDF→PDF/A, PDF→Markdown, Edit PDF, Add Page Numbers, Crop PDF, PDF Forms, Protect PDF, Redact PDF, AI Summarizer, Translate PDF, Compare PDF.

These are present in the catalog and render a "coming soon / server-side" page, per the spec.

## Visual fidelity

The homepage mirrors the iLovePDF pattern:

- Sticky header with the brand wordmark, "All tools" / "Features" dropdown nav, login/ghost + sign-up/primary-red buttons, and a language selector.
- Mobile hamburger drawer with all tool links.
- Hero: Display-size headline ("Every tool you need to work with PDFs in one place"), the spec subtitle, a "Select PDF file" dropzone CTA (also opens a file picker), a "Try Merge PDF" secondary CTA, and a stacked-PDF-pages visual mockup on the right.
- Tools catalog grouped into the 6 categories (Organize PDF, Convert to PDF, Convert from PDF, Edit PDF, PDF Security, AI & Advanced), each with a Headline-MD header and a 4-col (desktop) / 2-col (tablet) / 1-col (mobile) grid of tool cards.
- Tool cards: colored accent badge, tool name (Title-LG), one-line description, hover scale(1.02) + shadow + border.
- Footer with brand bar + link columns + legal note.
- Tool pages: header + dropzone + file list + options panel + action button + loading/result states, matching the spec's common tool page layout.

## Colors & typography (extracted from the spec)

See `src/index.css` and `tailwind.config.ts` for the tokens. Highlights:

- Primary (action red): `#e5322d`
- Primary container: `#ff6a58`
- Surface / background: `#f5f5fa`
- Surface container: `#e8e8ed`
- On-surface: `#161616`; on-surface variant: `#47474f`
- Secondary (blue): `#4a7aab`; tertiary (purple): `#7253e2`
- Outline: `#c4c4cc`
- Typography scale: Display 60px/700, Headline LG 42px/600, Headline MD 28px/600, Title LG 20px/600, Body LG 18px, Body MD 16px, Label MD 14px/600.

## Install & run

```bash
cd PDF Site
npm install
npm run dev
```

Then open the URL printed by Vite (default `http://127.0.0.1:3000`).

To build for production:

```bash
npm run build   # tsc + vite build -> dist/
npm run preview  # preview the production build locally
```

## Compression backend (Ghostscript) — not included

True PDF compression/recompression of images requires a server-side tool such as Ghostscript (`gs`). This repo does **not** include Ghostscript, and the development environment it was built in did not have `gs`/`qpdf`/LibreOffice installed, so the compression tool is a realistic UI simulation with a clearly-labeled estimate and a real pdf-lib re-packaged download.

To enable real compression, add a backend with Ghostscript, e.g.:

```bash
# example: compress with Ghostscript (ebook preset)
gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile=out.pdf in.pdf
```

The `CompressPDF.tsx` component is written so that, on a real deployment, you could POST the file to `/api/compress` and return the Ghostscript output. The backend is **outside the scope** of this client-side demo.

Similarly, the following would need a backend on a real site: Protect PDF (qpdf encryption), Office→PDF conversions (LibreOffice headless), Repair PDF, OCR PDF, and the AI/translation tools.

## Dependencies

- `pdf-lib` (bundled) — merge, split, rotate, embed images/text, sign.
- `pdf.js` (loaded from CDN at runtime) — page previews and PDF→JPG rendering.
- `lucide-react`, `react`, `react-dom`, `react-router-dom`, `tailwindcss`, `@vitejs/plugin-react`, `typescript`, `vite`.

The site needs an internet connection at runtime to load pdf.js + pdf.js worker from the CDN. If offline, the preview-based tools (PDF to JPG, per-page thumbnails) will not work; the pdf-lib-only tools (merge, split, rotate, jpg-to-pdf, unlock, watermark, sign) can still work if pdf-lib is bundled (it is).

## Known limitations

- The iLovePDF **wordmark** is reproduced as a text logo (text "iLovePDF") to match the reference design. Do not present this as the official iLovePDF site.
- Tool cards use Lucide icons mapped by tool; if an icon name is missing, a fallback is rendered and a console warning is emitted.
- PDF.js must load from CDN; if the CDN is unreachable, preview-based tools show an error.
- Organize-pdf reorder, page-specific drag-and-drop thumbnails, and some advanced options are stubs covered by ComingSoon.
- The compression estimate is an approximation, not a measured recompressed file size.
- Mobile drawer closes on route change; body scroll is locked while open.

## README state

- This file is `PDF Site/README.md` (the project's primary docs).
- A short root-level `README.md` at the repo root points into `PDF Site/`.

## Credits / references

Built by inspecting the live iLovePDF homepage (pattern, layout, color palette, typography, tool catalog, UX) and reproducing it as a learning/demo site. Not derived from iLovePDF's copyrighted copy, logos, or assets beyond the functional/structural design pattern.
