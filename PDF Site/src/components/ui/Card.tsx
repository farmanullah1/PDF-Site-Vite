import { Link } from 'react-router-dom';

// Real tool icons, harvested verbatim from https://www.ilovepdf.com/ (public/img/... SVGs),
// each with its exact fill colors as served by the live site. No AI-generated or substitute
// icons are used here - every icon below is the one iLovePDF ships for that tool.
//
// Source files cached in this project:
//   public/assets/icons/ilovepdf.svg            (site logo)
//   public/assets/icons/{category}-{slug}.svg  (tool icons)
//
// Icon -> file mapping (tool id -> live SVG):
const ICON_FILES: Record<string, string> = {
  // Organize
  'merge-pdf':     '/assets/icons/organize-merge-pdf.svg',
  'split-pdf':     '/assets/icons/organize-split-pdf.svg',
  'remove-pages':  '/assets/icons/organize-remove-pages.svg',
  'extract-pages': '/assets/icons/organize-extract-pages.svg',
  'organize-pdf':  '/assets/icons/organize-organize-pdf.svg',
  'rotate-pdf':    '/assets/icons/organize-rotate-pdf.svg',
  'optimize-pdf':  '/assets/icons/organize-optimize-pdf.svg',
  'compress-pdf':  '/assets/icons/organize-compress-pdf.svg',
  'repair-pdf':    '/assets/icons/optimize-repair-pdf.svg',
  'ocr-pdf':       '/assets/icons/optimize-ocr-pdf.svg',
  'scan-pdf':      '/assets/icons/organize-scan-pdf.svg',
  // Convert to PDF
  'jpg-to-pdf':       '/assets/icons/convert-jpg-to-pdf.svg',
  'word-to-pdf':      '/assets/icons/convert-word-to-pdf.svg',
  'powerpoint-to-pdf': '/assets/icons/convert-powerpoint-to-pdf.svg',
  'excel-to-pdf':     '/assets/icons/convert-excel-to-pdf.svg',
  'html-to-pdf':      '/assets/icons/convert-html-to-pdf.svg',
  // Convert from PDF
  'pdf-to-jpg':        '/assets/icons/convert-pdf-to-jpg.svg',
  'pdf-to-word':       '/assets/icons/convert-pdf-to-word.svg',
  'pdf-to-powerpoint': '/assets/icons/convert-pdf-to-powerpoint.svg',
  'pdf-to-excel':      '/assets/icons/convert-pdf-to-excel.svg',
  'pdf-to-pdfa':       '/assets/icons/convert-convert-pdf-to-pdfa.svg',
  'pdf-to-text':       '/assets/icons/convert-pdf-to-text.svg',
  'pdf-to-html':       '/assets/icons/convert-pdf-to-html.svg',
  'pdf-to-markdown':   '/assets/icons/convert-pdf-to-markdown.svg',
  // Edit
  'edit-pdf':         '/assets/icons/edit-edit-pdf.svg',
  'add-page-numbers': '/assets/icons/edit-add-page-numbers.svg',
  'add-watermark':    '/assets/icons/edit-add-watermark.svg',
  'crop-pdf':         '/assets/icons/edit-crop-pdf.svg',
  'pdf-forms':        '/assets/icons/edit-pdf-forms.svg',
  // Security
  'unlock-pdf':  '/assets/icons/security-unlock-pdf.svg',
  'protect-pdf': '/assets/icons/security-protect-pdf.svg',
  'sign-pdf':    '/assets/icons/security-sign-pdf.svg',
  'redact-pdf':  '/assets/icons/security-redact-pdf.svg',
  // AI & Advanced
  'ai-summarizer': '/assets/icons/intelligence-ai-summarizer.svg',
  'translate-pdf': '/assets/icons/intelligence-translate-pdf.svg',
  'compare-pdf':   '/assets/icons/intelligence-compare-pdf.svg',
};

// Live site status chip palette by tool.accent token.
// primary   -> red    #E5322D (Works now)
// secondary -> blue   #4A7AAB (Server-side)
// tertiary  -> purple #7253E2 (Demo)
const STATUS_PALETTE: Record<string, { chip: string; text: string }> = {
  primary:   { chip: 'bg-[#e5322d]/10 text-[#e5322d]', text: 'Works now' },
  secondary: { chip: 'bg-[#4a7aab]/10 text-[#4a7aab]', text: 'Server-side' },
  tertiary:  { chip: 'bg-[#7253e2]/10 text-[#7253e2]', text: 'Demo' },
};

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    route: string;
    accent: string;
    status: 'implemented' | 'simulation' | 'backend';
    new?: boolean;
  };
}

export default function ToolCard({ tool }: ToolCardProps) {
  const svgPath = ICON_FILES[tool.id];
  const palette = STATUS_PALETTE[tool.accent] ?? STATUS_PALETTE.primary;

  return (
    <Link
      to={tool.route}
      className="group block p-3 transition-all duration-200 border border-[#c4c4cc] rounded-xl bg-white hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-[#e5322d] cursor-pointer"
      aria-label={`${tool.name} — ${tool.description}`}
    >
      {/* Tool icon tile - real SVG, exact fill colors from ilovepdf.com */}
      {svgPath ? (
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={svgPath}
            className="h-12 w-12 object-contain drop-object-contain group-hover:scale-110 transition-transform duration-300"
            alt=""
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: palette.text }}
          aria-hidden="true"
        >
          <span className="text-lg font-bold">{tool.name[0]}</span>
        </div>
      )}

      {/* Title + chip */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[1.375rem] font-semibold leading-tight text-[#161616]">
          {tool.name}
        </span>
        <div className="flex gap-1.5">
          {tool.new && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider bg-[#e5322d] text-white">
              NEW!
            </span>
          )}
          {tool.status !== 'implemented' && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider ${palette.chip}`}>
              {palette.text}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-1.5 text-[0.875rem] leading-normal text-[#47474f] line-clamp-2">
        {tool.description}
      </p>
    </Link>
  );
}
