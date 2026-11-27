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
  'compare-pdf': '/assets/icons/compare-pdf.svg',
  'compress-pdf': '/assets/icons/compress_pdf.svg',
  'crop-pdf': '/assets/icons/crop-pdf.svg',
  'edit-pdf': '/assets/icons/edit-pdf.svg',
  'html-to-pdf': '/assets/icons/html-to-pdf.svg',
  'merge-pdf': '/assets/icons/merge_pdf.svg',
  'ocr-pdf': '/assets/icons/ocr-pdf.svg',
  'organize-pdf': '/assets/icons/organize-pdf.svg',
  'pdf-forms': '/assets/icons/pdf-forms.svg',
  'pdf-to-markdown': '/assets/icons/pdf-to-markdown.svg',
  'pdf-to-pdfa': '/assets/icons/convert-pdf-to-pdfa.svg',
  'protect-pdf': '/assets/icons/protect-pdf.svg',
  'redact-pdf': '/assets/icons/redact-pdf.svg',
  'remove-pages': '/assets/icons/remove-pages.svg',
  'repair-pdf': '/assets/icons/repair-pdf.svg',
  'scan-pdf': '/assets/icons/scan-pdf.svg',
  'sign-pdf': '/assets/icons/sign-pdf.svg',
  'split-pdf': '/assets/icons/split_pdf.svg',
  'translate-pdf': '/assets/icons/translate-pdf.svg',
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
