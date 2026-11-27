# PDF-Site-Vite

A client-side PDF tool site (learning clone of an online PDF-tool homepage pattern). The app lives in `PDF Site/`.

## Quick start

```bash
cd PDF-Site-Vite
cd PDF-Site
npm install
npm run dev
```

Then open the URL the dev server prints (the project is configured to serve on `127.0.0.1`). You can also open `PDF Site/index.html` directly from disk for the homepage.

## What it is

A browser-only PDF toolkit demo: a homepage tool directory with category filter pills and individual tool pages. All processing happens in the browser via pdf.js and pdf-lib loaded from CDN; files are never uploaded anywhere.

This is a learning-clone demo of the *layout pattern* of a popular online PDF-tool homepage. The branding, copy, and assets are original placeholders; it is not affiliated with, endorsed by, or derived from any real PDF service.

## Where the details are

Full docs, the tool list, implemented-vs-stubbed status, run instructions, dependencies, and verification notes are in [`PDF Site/README.md`](PDF-Site/README.md).

## Repo notes

- The real application is in `PDF Site/`.
- Large/reverse-engineering artifacts (`apktool_out/`, `rebuild/`, `*.apk`, `*.jar`) and Freebuff workspace metadata (`.freebuff/`) are excluded by `.gitignore`.
