import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOL_CATEGORIES, toolsByCategory, ToolConfig, allImplementedTools } from '../data/toolsConfig';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';

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
  const [selectedCount, setSelectedCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleHeroUpload = useCallback(
    (files: File[]) => {
      setSelectedCount((c) => c + files.length);
      if (files.length) {
        navigate('/merge_pdf');
      }
    },
    [navigate]
  );

  // Filter tools by category
  const getFilteredTools = (): ToolConfig[] => {
    if (activeFilter === 'all') return allImplementedTools();
    if (activeFilter === 'workflows') return []; // Workflows is a separate feature
    return toolsByCategory(activeFilter as any).filter((t) => t.status === 'implemented');
  };

  const filteredTools = getFilteredTools();

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-[#f5f5fa] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Hero text */}
            <div className="flex flex-1 flex-col gap-5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c4c4cc]/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#47474f]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#EE6C4D]" />
                100% free - works in your browser
              </div>
              <h1 className="font-display leading-[4.25rem] text-[3.75rem] font-bold tracking-tight text-[#161616] sm:text-[4.5rem]">

                PDF tools to work with PDF files

              </h1>
              <p className="max-w-[45rem] text-[1.125rem] leading-relaxed text-[#47474f]">

                Edit, convert, compress, organize, and sign your PDF files easily and for free. All tools to work with PDF files in one place.

              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <Dropzone
                  accept=".pdf,application/pdf"
                  maxSizeMB={100}
                  multiple
                  label="Select PDF files"
                  helper="or drop PDFs here"
                  onFiles={handleHeroUpload}
                  fileCount={selectedCount}
                />
                <Button variant="outline" onClick={() => navigate('/merge_pdf')}>
                  Merge PDF
                </Button>
              </div>
              <p className="text-xs text-[#47474f]">
                Drag and drop is supported on every tool page. Your files never leave your device.
              </p>
            </div>

            {/* Hero visual: stacked document/UI cards mockup */}
            <div className="relative flex h-72 w-full items-end justify-center overflow-hidden bg-[#eef0f4] sm:h-80 lg:h-96" aria-hidden="true">
              <div
                className="absolute inset-0 opacity-[0.5]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c4c4cc 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="relative z-10 flex h-full w-full items-end justify-center px-4">
                <div
                  className="absolute rounded-2xl border border-[#c4c4cc] bg-white/90 shadow-[0_12px_32px_rgba(16,24,32,0.14)]"
                  style={{ width: '280px', height: '170px', top: '6%', left: '8%', transform: 'rotate(-2deg)' }}
                >
                  <div className="flex h-9 items-center justify-between border-b border-[#c4c4cc]/60 px-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#295795]" />
                      Convert PDF
                    </span>
                    <span className="text-[10px] font-medium text-[#47474f]">File</span>
                  </div>
                  <div className="ml-3 flex h-[calc(100%-2.25rem)] flex-col justify-between gap-2 p-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-8 rounded bg-[#c4c4cc]" />
                      <span className="h-2 w-full rounded bg-[#e8e8ed]" />
                    </div>
                    <div className="space-y-1.5">
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} className="block h-1.5 rounded bg-[#f0f0f5]" style={{ width: `${70 + n * 5}%` }} />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <span className="h-5 w-5 rounded-full bg-[#EE6C4D]/70" />
                      <span className="h-2 w-12 rounded bg-[#EE6C4D]/70" />
                    </div>
                  </div>
                </div>

                {[
                  { top: '14%', left: '30%', w: '150px', h: '190px', rot: '-3deg', accent: '#EE6C4D', label: 'Doc A' },
                  { top: '18%', left: '46%', w: '150px', h: '190px', rot: '2deg', accent: '#295795', label: 'Doc B' },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl border border-[#c4c4cc] bg-white shadow-[0_10px_24px_rgba(16,24,32,0.14)]"
                    style={{ position: 'absolute', top: p.top, left: p.left, width: p.w, height: p.h, transform: `rotate(${p.rot})` }}
                  >
                    <div className="flex h-7 items-center justify-between border-b border-[#c4c4cc]/60 px-2.5">
                      <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#47474f]">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.accent }} />
                        PDF
                      </span>
                      <span className="text-[9px] font-medium text-[#47474f]">{p.label}</span>
                    </div>
                    <div className="ml-2.5 flex h-[calc(100%-1.75rem)] flex-col justify-between gap-2 p-2.5">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-6 rounded bg-[#c4c4cc]" />
                        <span className="h-1.5 w-9 rounded bg-[#e8e8ed]" />
                      </div>
                      <div className="space-y-1.5">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <span key={n} className="block h-1.5 rounded bg-[#f0f0f5]" style={{ width: `${55 + n * 5}%` }} />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-7 rounded bg-[#EE6C4D]/70" />
                        <span className="h-1.5 w-10 rounded bg-[#EE6C4D]/70" />
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 h-4 w-4 overflow-hidden">
                      <div className="flex h-4 w-4">
                        <div className="h-full w-3 bg-white border-l border-t border-[#c4c4cc]" />
                        <div className="h-3 w-3 bg-[#f0f0f5] border-l border-t border-[#c4c4cc]" />
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="absolute rounded-xl border border-[#c4c4cc] bg-white shadow-[0_14px_32px_rgba(16,24,32,0.18)]"
                  style={{ width: '180px', height: '220px', top: '30%', left: '58%', transform: 'rotate(4deg)' }}
                >
                  <div className="flex h-8 items-center justify-between border-b border-[#c4c4cc]/60 px-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#ab6993]" />
                      Sign PDF
                    </span>
                    <span className="text-[10px] font-medium text-[#47474f]">Page 1</span>
                  </div>
                  <div className="ml-3 flex h-[calc(100%-2rem)] flex-col justify-between gap-2 p-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-7 rounded bg-[#c4c4cc]" />
                      <span className="h-2 w-10 rounded bg-[#e8e8ed]" />
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((n) => (
                        <span key={n} className="block h-2.5 rounded bg-[#f0f0f5]" style={{ width: `${60 + n * 7}%` }} />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-9 rounded bg-[#ab6993]/70" />
                      <span className="h-2 w-12 rounded bg-[#ab6993]/70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tools catalog ===== */}
      <section className="border-t border-[#c4c4cc]/50 bg-[#f5f5fa] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <h2 className="font-display leading-[4.25rem] text-[3.75rem] font-bold tracking-tight text-[#161616] sm:text-[4.5rem]">
                All PDF tools
              </h2>
              <p className="mt-2 text-[1rem] text-[#47474f]">
                Merge, convert, edit, sign, protect, and more — all free, all in your browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#47474f]">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`filter-tag ${activeFilter === f.key ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-10">
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
      </section>

      {/* ===== Premium upsell ===== */}
      <section className="border-t border-[#c4c4cc]/50 bg-[#f5f5fa] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="rounded-2xl border border-[#EE6C4D]/30 bg-[#fbeae7] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 sm:text-left text-center">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <img src="/app-premium.png" alt="Premium" width="32" height="32" />
                <span className="text-sm font-medium text-[#D0452D]">Get more with Premium</span>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[#161616]">Work offline with iLovePDF Desktop</h3>
              <p className="text-sm text-[#47474f]">Batch edit and manage documents locally, with no internet and no limits.</p>
              <p className="text-xs text-[#47474f] mt-2">Get full access to iLovePDF and work offline with Desktop.</p>
            </div>
            <Button
              onClick={() => { window.open('/desktop', '_blank', 'noopener'); }}
              className="hidden sm:inline-flex"
            >
              Get Premium
            </Button>
          </div>
        </div>
      </section>

      {/* ===== iLoveIMG cross-promo ===== */}
      <section className="border-t border-[#c4c4cc]/50 bg-[#f5f5fa] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="rounded-2xl border border-[#EE6C4D]/30 bg-[#fbeae7] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 sm:text-left text-center">
              <h3 className="text-[1.125rem] font-semibold text-[#161616]">Image editing made simple with iLoveIMG</h3>
              <p className="text-sm text-[#47474f]">Experience the speed, simplicity, and security you expect from iLovePDF tailored for image editing. Compress, resize, and enhance your images with AI.</p>
            </div>
            <Button
              onClick={() => { window.open('https://www.iloveimg.com/', '_blank', 'noopener'); }}
              className="hidden sm:inline-flex"
            >
              Go to iLoveIMG
            </Button>
          </div>
        </div>
      </section>

      {/* ===== App promotion ===== */}
      <section className="border-t border-[#c4c4cc]/50 bg-[#f5f5fa] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            {[
              { img: '/app-desktop.png', title: 'Work offline with Desktop', desc: 'Batch edit and manage documents locally, with no internet and no limits.', href: '/desktop' },
              { img: '/app-mobile.png', title: 'On-the-go with Mobile', desc: 'Your favorite tools, right in your pocket. Keep working on your projects anytime, anywhere.', href: '/mobile' },
              { img: '/app-business.png', title: 'Built for business', desc: 'Automate document management, onboard teams easily, and scale with flexible plans.', href: '/business' },
            ].map((app) => (
              <div key={app.title} className="group">
                <a href={app.href} className="block">
                  <img src={app.img} alt={app.title} className="mx-auto mb-4 w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform" />
                  <h3 className="text-sm font-semibold text-[#161616] mb-1">{app.title}</h3>
                  <p className="text-xs text-[#47474f]">{app.desc}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trust section ===== */}
      <section className="border-t border-[#c4c4cc]/50 bg-[#f5f5fa] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 text-center">
            <h2 className="text-[1.25rem] font-semibold tracking-tight text-[#161616]">The PDF software trusted by millions of users</h2>
            <p className="mt-2 text-sm text-[#47474f]">iLovePDF is your number one web app for editing PDF with ease. Enjoy all the tools you need to work efficiently with your digital documents while keeping your data safe and secure.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="trust-badge">
              <img src="/trust-iso.svg" alt="ISO27001 certified" width="24" height="24" />
              <span className="text-sm text-[#161616] font-medium">ISO27001 certified</span>
            </div>
            <div className="trust-badge">
              <img src="/trust-ssl.svg" alt="Secure connection" width="24" height="24" />
              <span className="text-sm text-[#161616] font-medium">Secure connection Https</span>
            </div>
            <div className="trust-badge">
              <img src="/trust-pdf.svg" alt="PDF Association" width="24" height="24" />
              <span className="text-sm text-[#161616] font-medium">PDF Association</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ToolCard({ tool }: { tool: ToolConfig }) {

  const navigate = useNavigate();

  const isNew = tool.new;

  return (

    <a

      href={tool.route}

      onClick={(e) => { e.preventDefault(); navigate(tool.route); }}

      className="tools-item block"

      title={tool.name}

    >

      <div className="tool-card p-5 flex flex-col h-full">

        <div className="tools__item__icon mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f5f5fa]">

          {toolIcon(tool.icon)}

        </div>

        <h3 className="text-sm font-semibold text-[#161616] mb-1 leading-snug">{tool.name}</h3>

        <div className="tools__item__content flex-1">

          <p className="text-[12px] leading-relaxed text-[#47474f]">{tool.description}</p>

        </div>

        {isNew && (

          <span className="mt-2 new-badge">New!</span>

        )}

      </div>

    </a>

  );

}

function toolIcon(name: string): React.ReactNode {

  const svgMap: Record<string, string> = {

    'Compare': '/assets/icons/compare-pdf.svg',

    'Compress': '/assets/icons/compress_pdf.svg',

    'Crop': '/assets/icons/crop-pdf.svg',

    'Edit': '/assets/icons/edit-pdf.svg',

    'Forms': '/assets/icons/pdf-forms.svg',

    'HtmlToPdf': '/assets/icons/html-to-pdf.svg',

    'Merge': '/assets/icons/merge_pdf.svg',

    'OCR': '/assets/icons/ocr-pdf.svg',

    'Organize': '/assets/icons/organize-pdf.svg',

    'PdfToMarkdown': '/assets/icons/pdf-to-markdown.svg',

    'PdfToPdfA': '/assets/icons/convert-pdf-to-pdfa.svg',

    'Protect': '/assets/icons/protect-pdf.svg',

    'Redact': '/assets/icons/redact-pdf.svg',

    'Remove': '/assets/icons/remove-pages.svg',

    'Repair': '/assets/icons/repair-pdf.svg',

    'Scan': '/assets/icons/scan-pdf.svg',

    'Sign': '/assets/icons/sign-pdf.svg',

    'Split': '/assets/icons/split_pdf.svg',

    'Translate': '/assets/icons/translate-pdf.svg',

  };

  const path = svgMap[name];

  if (path) {

    return (<img

      key={path}

      src={path}

      className="h-full w-full max-w-full max-h-full object-contain"

      alt=""

      aria-hidden="true"

    />);

  }

  return null;

}

