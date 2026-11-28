import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconCompare_pdf,
  IconCompress_pdf,
  IconConvert_pdf_to_pdfa,
  IconCrop_pdf,
  IconEdit_pdf,
  IconEdit_pdf_forms,
  IconHtml_to_pdf,
  IconIntelligence_pdf_summarize,
  IconJpgToPdf,
  IconMerge_pdf,
  IconOcr_pdf,
  IconOrganize_pdf,
  IconOrganize_scan_pdf,
  IconPageNumbers,
  IconPdf_to_markdown,
  IconPdfToHtml,
  IconPdfToJpg,
  IconPdfToText,
  IconProtect_pdf,
  IconRedact_pdf,
  IconRemove_pages,
  IconRepair_pdf,
  IconScan_pdf,
  IconSign_pdf,
  IconSplit_pdf,
  IconTranslate_pdf,
  IconUnlock,
  IconWatermark,
} from '../components/pdf/icons';
import { ToolConfig, toolsByCategory, allImplementedTools } from '../data/toolsConfig';

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'organize', label: 'Organize PDF' },
  { key: 'optimize', label: 'Optimize PDF' },
  { key: 'convert-to-pdf', label: 'Convert to PDF' },
  { key: 'convert-from-pdf', label: 'Convert from PDF' },
  { key: 'edit', label: 'Edit PDF' },
  { key: 'security', label: 'PDF Security' },
  { key: 'intelligence', label: 'PDF Intelligence' },
];

function getIconColor(id: string): string {
  const coral = ['merge-pdf', 'split-pdf', 'organize-pdf', 'scan-pdf', 'remove-pages', 'extract-pages'];
  const green = ['compress-pdf', 'repair-pdf', 'ocr-pdf'];
  const royal = ['word-to-pdf', 'pdf-to-word'];
  const burnt = ['powerpoint-to-pdf', 'pdf-to-powerpoint'];
  const forest = ['excel-to-pdf', 'pdf-to-excel'];
  const amber = ['jpg-to-pdf', 'html-to-pdf', 'pdf-to-jpg'];
  const plum = ['edit-pdf', 'add-pdf-page-number', 'pdf-add-watermark', 'crop-pdf', 'pdf-forms', 'rotate-pdf'];
  const teal = ['sign-pdf', 'unlock-pdf', 'compare-pdf'];
  const navy = ['protect-pdf', 'pdf-to-pdfa', 'redact-pdf'];

  if (coral.includes(id)) return 'coral';
  if (green.includes(id)) return 'green';
  if (royal.includes(id)) return 'royal';
  if (burnt.includes(id)) return 'burnt';
  if (forest.includes(id)) return 'forest';
  if (amber.includes(id)) return 'amber';
  if (plum.includes(id)) return 'plum';
  if (teal.includes(id)) return 'teal';
  if (navy.includes(id)) return 'navy';
  return 'plum';
}

export default function Home() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getFilteredTools = (): ToolConfig[] => {
    if (activeFilter === 'all') return allImplementedTools();
    return toolsByCategory(activeFilter as any).filter((t) => t.status === 'implemented');
  };

  const filteredTools = getFilteredTools();

  const ICON_COMPONENTS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    Compare: IconCompare_pdf,
    Compress: IconCompress_pdf,
    Crop: IconCrop_pdf,
    Edit: IconEdit_pdf,
    Forms: IconEdit_pdf_forms,
    HtmlToPdf: IconHtml_to_pdf,
    JpgToPdf: IconJpgToPdf,
    Merge: IconMerge_pdf,
    OCR: IconOcr_pdf,
    Organize: IconOrganize_pdf,
    PageNumbers: IconPageNumbers,
    PdfToHtml: IconPdfToHtml,
    PdfToJpg: IconPdfToJpg,
    PdfToMarkdown: IconPdf_to_markdown,
    PdfToText: IconPdfToText,
    Protect: IconProtect_pdf,
    Redact: IconRedact_pdf,
    Remove: IconRemove_pages,
    Repair: IconRepair_pdf,
    Scan: IconScan_pdf,
    Sign: IconSign_pdf,
    Split: IconSplit_pdf,
    Translate: IconTranslate_pdf,
    PdfToPdfA: IconConvert_pdf_to_pdfa,
    AI: IconIntelligence_pdf_summarize,
    Unlock: IconUnlock,
    Watermark: IconWatermark,
  };

  return (
    <>
      <div className="hero-ribbon" />
      <div className="home-title">
        <h1 className="home-title__title">Every tool you need to work with PDFs in one place</h1>
        <p className="home-title__subtitle">Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.</p>
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="tools">
        <div className="tools__container">
          {[
            { key: 'organize', label: 'Organize PDF' },
            { key: 'optimize', label: 'Optimize PDF' },
            { key: 'convert-to-pdf', label: 'Convert to PDF' },
            { key: 'convert-from-pdf', label: 'Convert from PDF' },
            { key: 'edit', label: 'Edit PDF' },
            { key: 'security', label: 'PDF Security' },
            { key: 'intelligence', label: 'PDF Intelligence' },
          ].map((cat) => {
            const tools = filteredTools.filter((t) => t.categoryKey === cat.key);
            if (tools.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="mb-4 text-[1.75rem] font-semibold tracking-tight text-[#161616]">{cat.label}</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} navigate={navigate} ICON_COMPONENTS={ICON_COMPONENTS} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="section-bg-white section-py work-your-way">
        <h2 className="work-your-way__heading">Work your way</h2>
        <div className="work-grid">
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">💻</span>
            <h3>Work offline with Desktop</h3>
            <p>Batch edit and manage documents locally, with no internet and no limits.</p>
          </div>
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">📱</span>
            <h3>On-the-go with Mobile</h3>
            <p>Your favorite tools, right in your pocket. Keep working on your projects anytime, anywhere.</p>
          </div>
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">🏢</span>
            <h3>Built for business</h3>
            <p>Automate document management, onboard teams easily, and scale with flexible plans.</p>
          </div>
        </div>
      </section>

      <section className="section-bg-canvas section-py">
        <div className="premium-banner">
          <span className="crown-badge" aria-hidden="true">👑</span>
          <h2>Get more with Premium</h2>
          <p>Unlock offline desktop processing, OCR, e‑Signatures, custom workflows, and priority support.</p>
          <div className="premium-checklist">
            <div className="check-item"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" /></svg> Offline Desktop app</div>
            <div className="check-item"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" /></svg> OCR & text recognition</div>
            <div className="check-item"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" /></svg> e‑Signatures</div>
            <div className="check-item"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" /></svg> Custom workflows</div>
          </div>
          <a href="/pricing" className="btn-brand">Get Premium</a>
        </div>
      </section>

      <section className="section-py trust-section">
        <h2 className="trust-section__heading">The PDF software trusted by millions of users</h2>
        <p className="text-[13px] text-[#6E6E7A] max-w-[600px] mx-auto mb-8">Your files are encrypted and automatically deleted after processing. Secure, private, and reliable.</p>
        <div className="trust-badges">
          <div className="trust-badge"><svg viewBox="0 0 24 24" fill="none"><rect width="18" height="12" x="3" y="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" rx="2" ry="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 18H3" /></svg> ISO 27001</div>
          <div className="trust-badge"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5L12 2z" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /></svg> PDF Association</div>
          <div className="trust-badge"><svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 2 8 8 8 10z" /></svg> SSL Secure</div>
        </div>
      </section>
    </>
  );
}

function ToolCard({ tool, navigate, ICON_COMPONENTS }: { tool: ToolConfig; navigate: any; ICON_COMPONENTS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> }) {
  const iconColor = getIconColor(tool.id);

  const Component = ICON_COMPONENTS[tool.icon];
  const FallbackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
  const IconComp = Component || FallbackIcon;

  return (
    <a
      href={tool.route}
      onClick={(e) => { e.preventDefault(); navigate(tool.route); }}
      title={tool.name}
      className="block"
    >
      <div className="tool-card">
        <div className={`tool-icon ${iconColor}`}>
          <IconComp className="h-5 w-5" />
        </div>
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
        {tool.new && <span className="new-tag mt-3 inline-block">New!</span>}
      </div>
    </a>
  );
}
