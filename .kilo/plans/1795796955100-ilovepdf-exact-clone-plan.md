# Plan: Exact iLovePDF.com Clone — PDF Site

**Plan file:** `C:\Users\farma\Desktop\NEW REA\.kilo\plans\1795796955100-ilovepdf-exact-clone-plan.md`
**Target:** `C:\Users\farma\Desktop\NEW REA\PDF Site`
**Goal:** Rebuild the existing PDF Site as an exact clone of https://www.ilovepdf.com/ — same UI/UX, features, colors, icons, favicon, naming, wording, responsiveness, with all features real and working (not dummy/simulation). Take all images/icons/favicons directly from ilovepdf.com.

---

## Context gathered

### Existing codebase (already in `PDF Site/`)
- Stack: React 18 + TypeScript + Vite + Tailwind CSS + react-router-dom + pdf-lib + pdfjs-dist + tesseract.js
- Express backend on port 3001 with `/api/process` proxy via Vite
- ~28 tool components in `src/pages/tools/`, `StandardLayout`, `Header`, `Footer`, `MobileNav`
- `toolsConfig.ts` registers 35 tools across 6 categories (organize, convert-to-pdf, convert-from-pdf, edit, security, ai)
- Build passes (`tsc --noEmit` clean, `vite build` succeeds)
- Already harvested: `public/logo.svg`, `public/favicon.ico`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`
- Git repo: `https://github.com/farmanullah1/PDF-Site-Vite.git`, branch `main`, tag `v1.0.0`
- Live on Vercel: `https://pdf-site-jw4azkrfz-far-2631.vercel.app/`

### iLovePDF.com observed (via webfetch of homepage + merge_pdf + compress_pdf)

**Homepage:**
- Logo: `/img/ilovepdf.svg`
- Title: `iLovePDF | Online PDF tools for PDF lovers`
- H1: `Every tool you need to work with PDFs in one place`
- Subheadline: `Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.`
- Filter tabs: All, Workflows, Organize PDF, Optimize PDF, Convert PDF, Edit PDF, PDF Security, PDF Intelligence
- Tool cards with name + short description + link
- Premium upsell section ("Get more with Premium")
- iLoveIMG cross-promo banner
- Trust section: ISO27001 certified, Secure connection Https, PDF Association badges
- Footer sections: Product, Resources, Solutions, Legal, Company
- 30+ language selector
- Social: Twitter, Facebook, LinkedIn, Instagram, TikTok, Reddit
- App store badges: Google Play, App Store, Mac Store, Microsoft Store
- Copyright: `© iLovePDF 2026 ® - Your PDF Editor`

**Tool pages (e.g., Merge PDF, Compress PDF):**
- Same header/footer as homepage
- Tool-specific H1 + subheadline
- Dropzone: "Select PDF files" / "Upload from your computer" / "or drop PDFs here"
- Options: "Order files by name", "Show-hide pdf covers"
- Primary action button: "Merge PDF", "Compress PDF", etc.
- File list with upload progress, cloud integration (Google Drive, Dropbox)
- Processing state: "Merging PDFs...", "Compressing PDF..."
- Download result button

**URL structure uses underscores:** `/merge_pdf`, `/split_pdf`, `/compress_pdf`, `/jpg_to_pdf`, `/word_to_pdf`, etc. (NOT hyphens)

**Tools by category:**
- Organize PDF: Merge PDF, Split PDF, Remove pages, Extract pages, Organize PDF, Scan to PDF
- Optimize PDF: Compress PDF, Repair PDF, OCR PDF
- Convert to PDF: JPG to PDF, WORD to PDF, POWERPOINT to PDF, EXCEL to PDF, HTML to PDF
- Convert from PDF: PDF to JPG, PDF to WORD, PDF to POWERPOINT, PDF to EXCEL, PDF to PDF/A
- Edit PDF: Rotate PDF, Add page numbers, Add watermark, Crop PDF, Edit PDF, PDF Forms
- PDF security: Unlock PDF, Protect PDF, Sign PDF, Redact PDF, Compare PDF
- PDF Intelligence: AI Summarizer, Translate PDF, PDF to Markdown

---

## Key gaps vs iLovePDF.com

| Area | Current state | Required state |
|------|-------------|----------------|
| URL structure | Hyphens (`/merge-pdf`) | Underscores (`/merge_pdf`) |
| Homepage H1/subheadline | Custom wording | Exact iLovePDF wording |
| Filter tabs | None | All, Workflows, Organize, Optimize, Convert, Edit, Security, Intelligence |
| Tool pages | Client sim + ServerTool placeholders | Real upload + processing + download UI per tool |
| Premium upsell | None | "Get more with Premium" section |
| iLoveIMG promo | Present (custom wording) | Exact iLovePDF wording + link |
| Trust section | Custom (no badges) | ISO27001 + SSL + PDF Association badges from ilovepdf.com |
| Language selector | 12 languages, custom UI | 30+ languages, exact iLovePDF UI |
| Social links | Twitter, YouTube, LinkedIn | Twitter, Facebook, LinkedIn, Instagram, TikTok, Reddit |
| App store badges | None | Google Play, App Store, Mac Store, Microsoft Store |
| Scan to PDF | Missing | Add tool |
| Workflows | Missing | Add category + feature |
| PDF Intelligence | "AI & Advanced" | Rename to "PDF Intelligence" |
| Assets | Partial (logo, favicons) | All images/icons from ilovepdf.com |
| Real processing | Partial (some client sim) | All client tools must process real PDFs |
| Backend tools | Placeholder | Real server-side processing or clear error |

---

## Implementation plan (ordered tasks)

### Phase 1: REA deep-dive & asset harvesting
1. Run REA (`npx rea-agents@6.10.1 analyze-javascript-application`) on ilovepdf.com tool pages to extract exact CSS classes, component structure, and interaction patterns
2. Harvest all images/icons/SVGs from ilovepdf.com: `/img/ilovepdf.svg`, trust badges (`/img/trust/iso.svg`, `/img/trust/ssl.svg`, `/img/trust/pdf.svg`), app store badges, social icons, preload SVGs
3. Harvest exact CSS design tokens from ilovepdf.com stylesheets (colors, spacing, typography, breakpoints)
4. Document all URL routes (underscore format) and tool metadata (exact names, descriptions, categories)

### Phase 2: Design system & layout alignment
5. Update `tailwind.config.ts` with exact iLovePDF color palette, typography scale, breakpoints
6. Update `src/index.css` with exact CSS variables matching iLovePDF
7. Rebuild `Header.tsx` to match iLovePDF header exactly (logo, nav, convert dropdown, all tools dropdown, language selector, auth, mobile drawer)
8. Rebuild `Footer.tsx` to match iLovePDF footer exactly (all sections, links, badges, social, app stores, copyright)
9. Add `StandardLayout` per-tool wrapper matching iLovePDF tool page layout (H1, subheadline, dropzone, options, action button, file list, download)

### Phase 3: Homepage rebuild
10. Rewrite `Home.tsx` with exact iLovePDF homepage:
    - Hero section with exact H1/subheadline wording
    - Filter tabs (All, Workflows, Organize PDF, Optimize PDF, Convert PDF, Edit PDF, PDF Security, PDF Intelligence)
    - Tool grid with exact tool cards (name, description, category badge, "New!" tags)
    - Premium upsell section
    - iLoveIMG cross-promo banner (exact wording)
    - Trust section with ISO27001/SSL/PDF Association badges from ilovepdf.com
    - Desktop/Mobile/Business app promotion cards

### Phase 4: Tool page rebuild (all tools real and working)
11. Change all routes from hyphens to underscores (`/merge-pdf` → `/merge_pdf`, etc.)
12. Update `toolsConfig.ts` with exact iLovePDF tool names, descriptions, categories, statuses
13. Add missing tools: Scan to PDF
14. Rename category "AI & Advanced" → "PDF Intelligence"
15. Rewrite each tool component with real upload → process → download UI:
    - Dropzone with "Select PDF files" / "or drop PDFs here"
    - File list with thumbnails, reorder, remove
    - Tool-specific options panel
    - Primary action button (e.g., "Merge PDF", "Compress PDF")
    - Progress indicator during processing
    - Download result button
16. Client tools (use pdf-lib/pdf.js/tesseract.js locally): Merge, Split, Rotate, Compress, Optimize, Repair, OCR, JPG→PDF, PDF→JPG, PDF→Text, PDF→Markdown, PDF→HTML, Edit, Add Page Numbers, Add Watermark, Crop, Redact, Sign, Unlock, Compare, PDF Forms
17. Backend tools (Express + pdf-lib passthrough with clear errors when binaries missing): Word→PDF, Excel→PDF, PowerPoint→PDF, HTML→PDF, PDF→Word, PDF→PowerPoint, PDF→Excel, PDF→PDF/A, Protect, AI Summarizer, Translate

### Phase 5: Additional pages & features
18. Workflows feature page (Create workflow, custom workflows)
19. Language selector with 30+ languages matching iLovePDF
20. Login/Signup pages matching iLovePDF design
21. Premium pricing page
22. About, Features, Pricing, FAQ, Contact pages

### Phase 6: Assets from ilovepdf.com (no new creations)
23. Replace all inline SVG icons with harvested iLovePDF SVG assets
24. Replace favicon.ico, favicon-32x32.png, apple-touch-icon.png with harvested versions
25. Add trust badges (ISO27001, SSL, PDF Association) from `/img/trust/`
26. Add app store badges from `/img/logos/`

### Phase 7: Testing, build, commit, deploy
27. Run `npx tsc --noEmit` — must be clean
28. Run `npm run build` — must succeed
29. Manually verify each tool processes a real PDF end-to-end
30. Git add, commit, push to `origin/main`
31. Tag release (e.g., `v2.0.0-exact-clone`)
32. Trigger Vercel redeploy via GitHub push

---

## Constraints & rules
- **Do not create new favicons, icons, or images** — take all from https://www.ilovepdf.com/
- Every feature must be real and working — no dummy/simulation features
- Client-side PDF processing must use pdf-lib/pdf.js/tesseract.js (already installed)
- Backend tools must use Express server (already configured)
- Routes must use underscore format to match iLovePDF.com
- All text/wording must match iLovePDF.com exactly
- Must be responsive (mobile + desktop)
- Must git commit properly
- Must deploy to Vercel

---

## Validation criteria
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run build` succeeds with output in `dist/`
- [ ] Homepage matches iLovePDF.com visually (hero, filter tabs, tool grid, premium, trust, footer)
- [ ] Each client tool processes a real PDF and produces a downloadable result
- [ ] Each backend tool returns a clear error or processes via server
- [ ] All images/icons/favicons sourced from ilovepdf.com (no new assets created)
- [ ] Git commit created on `main` branch
- [ ] Tag created and pushed
- [ ] Vercel live URL reflects changes

---

## Open questions (to resolve before implementation)
1. Should routes use underscores (`/merge_pdf`) to exactly match iLovePDF.com, or keep hyphens for SEO? (Recommended: underscores for exact clone)
2. Should backend tools return clear errors when qpdf/LibreOffice/Ghostscript not installed, or attempt pdf-lib passthrough? (Recommended: clear error message)
3. Should the Scan to PDF tool be implemented client-side (camera access) or as backend placeholder? (Recommended: client-side camera capture + pdf-lib)
4. Should the Workflows feature be a full-featured page or a landing placeholder? (Recommended: landing page matching iLovePDF UI)

---

**Next step:** Implementation agent should start with Phase 1 (REA deep-dive + asset harvesting), then proceed through phases in order. After each phase, run `npx tsc --noEmit` to verify no type errors.