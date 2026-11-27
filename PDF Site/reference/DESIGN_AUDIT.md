# PDF Site — Design Audit

Reverse-engineered design tokens and UX decisions for the iLovePDF-style PDF tools clone.

## Source
- Reference site: https://www.ilovepdf.com/ (design/UX inspiration only)
- This is a demo/learning clone, not affiliated with iLovePDF.

## Design tokens (exact hex values)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Brand Red | `#E5322D` | Primary CTAs, active states, logo accent, NEW! badges, hover borders |
| Primary Container | `#FF6A58` | Gradient start, pill badges |
| Background / Surface | `#F5F5FA` | Main body background |
| Surface Bright | `#FFFFFF` | Cards, modals, dropdowns |
| Text On-Surface | `#161616` | Primary body & heading text |
| Text Variant | `#47474F` | Secondary text, descriptions |
| Teal Accent | `#26AEBA` | Occasional secondary accents (not currently used) |
| Border / Divider | `#E8E8EF` | Card borders, section dividers |
| Outline (legacy) | `#C4C4CC` | Dropzone borders, input borders, dropdown borders |

## Typography (Inter + Poppins from Google Fonts)

| Scale | Size | Weight | Line-height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | 60px (3.75rem) | 700 | 68px (4.25rem) | -0.02em | Hero H1 |
| Headline Large | 42px (2.625rem) | 600 | 50px (3.125rem) | normal | Section headings |
| Headline Small | 22px (1.375rem) | 600 | 30px (1.875rem) | normal | Tool names |
| Title Large | 20px (1.25rem) | 600 | 28px (1.75rem) | normal | Card names, tool page H1 |
| Body Large | 18px (1.125rem) | 400 | 28px (1.75rem) | normal | Hero subheadline |
| Body Regular | 16px (1rem) | 400 | 24px (1.5rem) | normal | Body text |
| Label / Button | 14px (0.875rem) | 600 | 20px (1.25rem) | normal | Labels, buttons |

Font stack: `Graphik`, `Inter`, `Poppins`, `system-ui`, `sans-serif`
- Graphik is proprietary; Inter + Poppins loaded from Google Fonts as fallback.

## Card specifications (ToolCard)

- Icon: 48×48 or 56×56 colored SVG (lucide-react registry; per-category accent color)
- Tool name: 22px / 600 weight
- Description: 14px / 400 weight, `#47474F`
- Badge: Red `NEW!` pill on newest tools
- Container: White card, 12px border-radius, 1px solid `#E8E8EF` border
- Hover: `translateY(-4px)`, `box-shadow: 0 12px 24px rgba(0,0,0,0.08)`, border becomes `#E5322D`, `transition: all 0.2s ease`
- Entire card is a link → navigates to tool page

## Homepage structure

1. **Sticky Navigation Bar**
   - Left: Logo (wordmark + document/heart icon mark), links to `/`
   - Center/Right (desktop): Merge PDF · Split PDF · Compress PDF · Convert PDF ▾ · All PDF Tools ▾
   - Far right: Log in (ghost) + Sign up (solid red #E5322D)
   - Mobile: Hamburger → full-screen slide-out drawer
   - Behavior: Transparent on top, white with subtle shadow after 40px scroll

2. **Hero Section**
   - H1 (60px/700/68px/-0.02em): "Every tool you need to work with PDFs in one place"
   - Subheadline (18px/400, max 720px, #47474F): center-aligned, 80px vertical padding
   - Dropzone + red CTA button

3. **Tools Grid**
   - Desktop: 4 columns · Tablet: 2 columns · Mobile: 1 column
   - Gap: 16px
   - Category-grouped: Organize PDF, Convert to PDF, Convert from PDF, Edit PDF, PDF Security, AI & Advanced

4. **Additional Sections**
   - iLoveIMG cross-promo banner: "Want to edit images? Try iLoveIMG" + CTA
   - Trust section: "The PDF software trusted by millions of users" with platform rows
   - Footer: 4-column link grid (Tools · Company · Support) + copyright

## Color usage rules

- Primary red `#E5322D`: All primary CTAs (gradient `#FF6A58` → `#E5322D`), active states, logo accent, NEW! badges, hover borders
- Card hover border: `#E5322D` (not `#161616`)
- Card hover shadow: `0 12px 24px rgba(0,0,0,0.08)`
- Card hover transform: `translateY(-4px)`
- Card transition: `all 0.2s ease`

## Assets

| File | Location | Source |
|------|----------|--------|
| favicon.ico | public/favicon.ico | Reverse-engineered from original |
| favicon.svg | public/favicon.svg | Document/heart icon mark |
| logo.svg | public/logo.svg | Copied from favicon.svg (icon mark) |
| favicon-32x32.png | public/favicon-32x32.png | Missing — generate from favicon.svg |
| apple-touch-icon.png | public/apple-touch-icon.png | Present |

## Notes

- Lucide React icons used as placeholders where original SVGs not yet downloaded. Mission requires exact original SVGs.
- Backend tools (Protect PDF, Office conversions, HTML→PDF) require qpdf/gs/soffice/puppeteer binaries not installed on host; they return clear server-required errors.
- Client-side tools run entirely in browser via pdf-lib + pdf.js + tesseract.js.
- Uploaded files auto-deleted after 1 hour (server-side retention in Express).
- Lint: `npm run lint` runs `tsc --noEmit`.
