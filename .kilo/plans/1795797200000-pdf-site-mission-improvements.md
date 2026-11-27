# PDF Site — Mission Completion Plan

**Goal:** Make every homepage card a real, working PDF tool (no simulations/fake downloads), reach iLovePDF visual fidelity, and prepare for Vercel deployment — keeping the existing **Vite + Express** stack (per user decision).

## Current state (assessed from codebase)

- Stack: React 18 + Vite + Tailwind + TypeScript + Express backend (`server/app.js`, `server/routes/process.js`)
- `toolsConfig.ts`: 27 tools; many `implemented`, two `simulation` (`optimize-pdf`, `compare-pdf`), several `backend` (`protect-pdf`, `word-to-pdf`, `powerpoint-to-pdf`, `excel-to-pdf`, `html-to-pdf`, `pdf-to-word`, `pdf-to-excel`, `pdf-to-powerpoint`, `pdf-to-pdfa`, `ai-summarizer`, `translate-pdf`)
- Header: logo, nav, Convert PDF / All PDF Tools dropdowns, lang selector, Login/Sign Up (good foundation)
- ToolCard + StandardLayout exist; `index.css` has iLovePDF design tokens (#e5322d red, #f5f5fa bg, #161616 text, etc.)
- Client tools real via pdf-lib/pdf.js/tesseract.js; backend tools require qpdf/gs/soffice/puppeteer binaries **not installed** on host → will fail at runtime unless a sidecar server provides them
- `simulation` tools violate mission ("no simulated downloads")

## Decisions

1. **Architecture:** Keep Vite + Express (user confirmed). Do NOT migrate to Next.js.
2. **Simulation → real:** Convert `optimize-pdf` and `compare-pdf` from `simulation` to real client-side implementations (`implemented`). `compare-pdf.tsx` already exists client-side (just flip status); `optimize-pdf.tsx` exists but is a client re-serialization — make it genuinely real and flip status.
3. **Backend tools without binaries:** Keep as `backend` but add explicit server-requirement messaging + document the sidecar requirement (Render/Railway with qpdf/gs/soffice/puppeteer). Do not fake them. Where a partial client fallback exists (compress already falls back to pdf-lib save in `process.js`), keep it but label honestly.
4. **Real processing flow on every client tool:** drag-drop dropzone → file list (name, size, remove) → options panel → big red CTA → real progress → success screen (Download + "Process another file") → error state. Files auto-deleted after 1 hour (already in Express; mirror notice in UI).
5. **Visual fidelity pass:** Homepage hero (60px H1, subheadline, CTA), tool card hover (translateY -4px, red border, shadow), Footer, trust/cross-promo sections, language selector, sticky nav scroll behavior.
6. **Vercel:** `dist/` is static; document that Express backend must run on a separate sidecar (Vercel alone cannot host child_process binaries). Add `vercel.json` + deploy instructions.

## Ordered task list (implementation)

### Phase 1 — Simulation tools → real client tools
1.1 `src/pages/tools/OptimizePDF.tsx`: make genuinely real (pdf-lib re-save + real size estimate), wire progress. Flip `toolsConfig.ts` status `simulation` → `implemented`.
1.2 `toolsConfig.ts`: `compare-pdf` status `simulation` → `implemented` (component already real client-side).
1.3 `tsc --noEmit` + `npm run build` must pass.

### Phase 2 — Real processing flow (shared)
2.1 Create/reuse a shared `FileList` component (filename, size, remove button, revoke URL) used by all client tool pages.
2.2 Create shared `ProcessingProgress` component tied to actual work (not setTimeout).
2.3 Create shared `SuccessScreen` (Download button + "Process another file" link).
2.4 Update every `implemented` client tool page to: dropzone → file list → options → CTA → progress → success/error. Remove any fake progress bars or `alert()` downloads.
2.5 Add visible "Files auto-deleted after 1 hour" note near upload zone on client tools.
2.6 `tsc --noEmit` + `npm run build` must pass.

### Phase 3 — Backend tool honesty
3.1 `server/routes/process.js`: keep existing fallbacks; ensure every backend action returns a clear error when its binary is missing (do not silently pdf-lib passthrough for protect-pdf encryption).
3.2 `ComingSoon.tsx` / `ServerTool.tsx`: show explicit "This tool requires a server with qpdf/gs/soffice/puppeteer" message for `backend` tools; link to deploy docs.
3.3 `tsc --noEmit` + `npm run build` must pass.

### Phase 4 — Visual fidelity pass (iLovePDF match)
4.1 `Home.tsx`: hero H1 60px/700, subheadline #47474F max 720px, centered, CTA dropzone + "Try Merge PDF"; tools grid 4/2/1 cols with 16px gap; card hover translateY(-4px) + red border + shadow.
4.2 `Footer.tsx`: 4-column link grid (Tools/Company/Legal/Social), language selector, copyright.
4.3 `Header.tsx`: sticky, transparent→white shadow after 40px scroll, mobile drawer.
4.4 Add iLoveIMG cross-promo banner + trust section (Desktop/iOS/Android/integration logos placeholders).
4.5 Verify against tokens in `index.css` (#e5322d, #f5f5fa, #161616, #47474f, #c4c4cc).

### Phase 5 — Vercel deployment prep
5.1 Add `vercel.json` (static `dist` output, routes for SPA fallback).
5.2 Update `README.md`: local setup (vite dev + express server), env vars, Vercel deploy steps, server sidecar requirement for backend tools.
5.3 `npm run build` produces `dist/`; `npm run preview` works locally.

### Phase 6 — Git + tag
6.1 Commit after each logical milestone with descriptive messages.
6.2 Tag final `v1.0.0`.

## Validation steps
- `npx tsc --noEmit` exits 0 (no type errors)
- `npm run build` exits 0 → `dist/`
- `npm run preview` serves `dist/` successfully
- Each client tool: upload real PDF → process → real file downloads (not a blob URL trick without content)
- Backend tools show clear server-required error when no binary available
- Responsive: check 375 / 768 / 1280 / 1920 layouts

## Open questions (resolve before/during implementation)
- Install server binaries (qpdf, gs, soffice, puppeteer) on the host or rely on a separate sidecar? Recommendation: sidecar (documented), since host has none and Vercel can't run child_process binaries serverless.
- `protect-pdf` encryption: pdf-lib cannot encrypt. Keep backend-only with qpdf requirement; document clearly.

## Plan file
Saved to `.kilo/plans/<timestamp>-pdf-site-mission-improvements.md`. Call `plan_exit` when ready to hand off to an implementation-capable agent.
