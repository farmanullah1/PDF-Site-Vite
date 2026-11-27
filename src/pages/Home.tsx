import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconCompare_pdf,
  IconCompress_pdf,
  IconCrop_pdf,
  IconEdit_pdf,
  IconHtml_to_pdf,
  IconMerge_pdf,
  IconOcr_pdf,
  IconOrganize_pdf,
  IconPdf_to_markdown,
  IconProtect_pdf,
  IconRedact_pdf,
  IconRemove_pages,
  IconRepair_pdf,
  IconScan_pdf,
  IconSign_pdf,
  IconSplit_pdf,
  IconTranslate_pdf,
  IconPdf_forms,
} from '../components/pdf/icons';
import { TOOL_CATEGORIES, toolsByCategory, ToolConfig, allImplementedTools } from '../data/toolsConfig';

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'workflows', label: 'Workflows' },
  { key: 'organize', label: 'Organize PDF' },
  { key: 'optimize', label: 'Optimize PDF' },
  { key: 'convert', label: 'Convert PDF' },
  { key: 'edit', label: 'Edit PDF' },
  { key: 'security', label: 'PDF Security' },
  { key: 'intelligence', label: 'PDF Intelligence' },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getFilteredTools = (): ToolConfig[] => {
    if (activeFilter === 'all') return allImplementedTools();
    if (activeFilter === 'workflows') return [];
    return toolsByCategory(activeFilter as any).filter((t) => t.status === 'implemented');
  };

  const filteredTools = getFilteredTools();

  return (
    <>
      <div className="pattern-bg" />
      <div className="home-title">
        <h1 className="home-title__title">Every tool you need to work with PDFs in one place</h1>
        <h2 className="home-title__subtitle">Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.</h2>
      </div>
      <div className="tools">
        <div className="tools__filter">
          {FILTERS.map((f) => (
            <div
              key={f.key}
              className={`tag ${activeFilter === f.key ? 'active' : ''} ${f.key === 'workflows' ? 'workflows' : ''}`}
              data-filter={f.key}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </div>
          ))}
        </div>
        <div className="tools__container">
          {TOOL_CATEGORIES.map((cat) => {
            const tools = filteredTools.filter((t) => t.categoryKey === cat.key);
            if (tools.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="mb-4 text-[1.75rem] font-semibold tracking-tight text-[#161616]">{cat.label}</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ToolCard({ tool }: { tool: ToolConfig }) {
  const navigate = useNavigate();

  return (
    <div className="tools__item" data-category={tool.categoryKey}>
      <a
        href={tool.route}
        onClick={(e) => { e.preventDefault(); navigate(tool.route); }}
        title={tool.name}
        className="block"
      >
        <div className="tools__item__icon">
          {toolIcon(tool.icon)}
        </div>
        <h3 className="text-sm font-semibold text-[#161616] mb-1 leading-snug">{tool.name}</h3>
        <div className="tools__item__content">
          <p className="text-[12px] leading-relaxed text-[#47474f]">{tool.description}</p>
        </div>
      </a>
    </div>
  );
}

const ICON_COMPONENTS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Compare: IconCompare_pdf,
  Compress: IconCompress_pdf,
  Crop: IconCrop_pdf,
  Edit: IconEdit_pdf,
  Forms: IconPdf_forms,
  HtmlToPdf: IconHtml_to_pdf,
  Merge: IconMerge_pdf,
  OCR: IconOcr_pdf,
  Organize: IconOrganize_pdf,
  PdfToMarkdown: IconPdf_to_markdown,
  Protect: IconProtect_pdf,
  Redact: IconRedact_pdf,
  Remove: IconRemove_pages,
  Repair: IconRepair_pdf,
  Scan: IconScan_pdf,
  Sign: IconSign_pdf,
  Split: IconSplit_pdf,
  Translate: IconTranslate_pdf,
};

function toolIcon(name: string): React.ReactNode {
  const Component = ICON_COMPONENTS[name];
  if (!Component) return null;
  return <Component className="h-6 w-6" />;
}
