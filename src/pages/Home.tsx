import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Monitor, Smartphone, Building2, RotateCw, Zap, Minimize } from 'lucide-react';
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

const ICON_COMPONENTS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Compare: IconCompare_pdf,
  Compress: IconCompress_pdf,
  Crop: IconCrop_pdf,
  Edit: IconEdit_pdf,
  Extract: () => (<Minimize className="h-5 w-5" strokeWidth={1.5} />),
  Forms: IconEdit_pdf_forms,
  HtmlToPdf: IconHtml_to_pdf,
  JpgToPdf: IconJpgToPdf,
  Merge: IconMerge_pdf,
  OCR: IconOcr_pdf,
  Optimize: () => (<Zap className="h-5 w-5" strokeWidth={1.5} />),
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
  Rotate: () => (<RotateCw className="h-5 w-5" strokeWidth={1.5} />),
  Scan: IconScan_pdf,
  Sign: IconSign_pdf,
  Split: IconSplit_pdf,
  Translate: IconTranslate_pdf,
  PdfToPdfA: IconConvert_pdf_to_pdfa,
  AI: IconIntelligence_pdf_summarize,
  Unlock: IconUnlock,
  Watermark: IconWatermark,
};

export default function Home() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const allTools = useMemo(() => allImplementedTools(), []);

  const filteredTools = useMemo(() => {
    const term = search.toLowerCase().trim();
    return allTools.filter((t) => {
      const matchesCategory = activeFilter === 'all' || t.categoryKey === activeFilter;
      if (!matchesCategory) return false;
      if (!term) return true;
      const haystack = `${t.id} ${t.name} ${t.description} ${(t as any).keywords?.join(' ') || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [allTools, activeFilter, search]);

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <>
      <div className="hero-ribbon" />
      <div className="home-title">
        <h1 className="home-title__title">Every tool you need to work with PDFs in one place</h1>
        <p className="home-title__subtitle">
          Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
        </p>

        <div className="search-wrap">
          <div className="search-field">
            <Search className="search-icon" size={18} strokeWidth={1.5} />
            <input
              className="search-input"
              type="search"
              placeholder="Search for a PDF tool"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search PDF tools"
            />
            {search && (
              <button
                className="search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={activeFilter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tools">
        <div className="tools__container">
          {search === '' && activeFilter === 'all' ? (
            <>
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
                        <ToolCard key={tool.id} tool={tool} navigate={navigate} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <h2 className="tools__heading">
                {filteredTools.length === 0 ? 'No matching tools' : `Results for "${search}"`}
              </h2>
              {filteredTools.length === 0 ? (
                <div className="empty-state">
                  <p>No tools match your search or category. Try a different keyword or select "All".</p>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setSearch('');
                      setActiveFilter('all');
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} navigate={navigate} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <section className="section-bg-white section-py work-your-way">
        <h2 className="work-your-way__heading">Work your way</h2>
        <div className="work-grid">
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">
              <Monitor size={32} strokeWidth={1.5} />
            </span>
            <h3>Work offline with Desktop</h3>
            <p><Link to="/desktop">Explore the desktop app</Link></p>
          </div>
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">
              <Smartphone size={32} strokeWidth={1.5} />
            </span>
            <h3>On-the-go with Mobile</h3>
            <p><Link to="/mobile">Explore the mobile app</Link></p>
          </div>
          <div className="work-card">
            <span className="work-card__img" aria-hidden="true">
              <Building2 size={32} strokeWidth={1.5} />
            </span>
            <h3>Built for business</h3>
            <p><Link to="/business">Explore business plans</Link></p>
          </div>
        </div>
      </section>

      <section className="section-py trust-section">
        <h2 className="trust-section__heading">Designed to make working with documents easier</h2>
        <p className="text-[13px] text-[#6E6E7A] max-w-[600px] mx-auto mb-8">
          Client-side tools process your PDF in the browser where supported, so your documents stay on your device.{' '}
          <Link to="/privacy" className="text-[#E5322D] font-medium hover:underline">
            Read our Privacy Policy
          </Link>
        </p>
      </section>
    </>
  );
}

function ToolCard({ tool, navigate }: { tool: ToolConfig; navigate: any }) {
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
