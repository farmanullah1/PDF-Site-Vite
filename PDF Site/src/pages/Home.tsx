import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOL_CATEGORIES, toolsByCategory, ToolConfig } from '../data/toolsConfig';
import ToolCard from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCount, setSelectedCount] = useState(0);

  const handleHeroUpload = useCallback(
    (files: File[]) => {
      setSelectedCount((c) => c + files.length);
      if (files.length) {
        navigate('/merge-pdf');
      }
    },
    [navigate]
  );

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-[#f5f5fa] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Hero text */}
            <div className="flex flex-1 flex-col gap-5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c4c4cc]/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#47474f]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#e5322d]" />
                100% free · works in your browser
              </div>
              <h1 className="font-display leading-[4.25rem] text-[3.75rem] font-bold tracking-tight text-[#161616] sm:text-[4.5rem]">
                Every tool you need to work with PDFs in one place
              </h1>
              <p className="text-[1.125rem] leading-relaxed text-[#47474f]">
                Every tool you need to use PDFs, at your fingertips. All are 100% free and easy to use!
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <Dropzone
                  accept=".pdf,application/pdf"
                  maxSizeMB={100}
                  multiple
                  label="Select PDF file"
                  helper="Add files or drag and drop them here"
                  onFiles={handleHeroUpload}
                  fileCount={selectedCount}
                />
                <Button variant="outline" onClick={() => navigate('/merge-pdf')}>
                  Try Merge PDF
                </Button>
              </div>
              <p className="text-xs text-[#47474f]">
                Drag and drop is supported on every tool page. Your files never leave your device.
              </p>
            </div>

            {/* Hero visual: stacked document/UI cards mockup */}
            <div className="relative flex h-72 w-full items-end justify-center overflow-hidden bg-[#eef0f4] sm:h-80 lg:h-96" aria-hidden="true">
              {/* soft dot grid backdrop */}
              <div
                className="absolute inset-0 opacity-[0.5]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c4c4cc 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="relative z-10 flex h-full w-full items-end justify-center px-4">
                {/* Far back card: wide UI panel */}
                <div
                  className="absolute rounded-2xl border border-[#c4c4cc] bg-white/90 shadow-[0_12px_32px_rgba(16,24,32,0.14)]"
                  style={{ width: '280px', height: '170px', top: '6%', left: '8%', transform: 'rotate(-2deg)' }}
                >
                  <div className="flex h-9 items-center justify-between border-b border-[#c4c4cc]/60 px-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#4a7aab]" />
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
                      {[1,2,3,4].map((n) => (
                        <span key={n} className="block h-1.5 rounded bg-[#f0f0f5]" style={{ width: `${70 + n * 5}%` }} />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <span className="h-5 w-5 rounded-full bg-[#e5322d]/70" />
                      <span className="h-2 w-12 rounded bg-[#e5322d]/70" />
                    </div>
                  </div>
                </div>

                {/* Mid stack: two PDF doc cards, varied positions */}
                {[
                  { top: '14%', left: '30%', w: '150px', h: '190px', rot: '-3deg', accent: '#e5322d', label: 'Doc A' },
                  { top: '18%', left: '46%', w: '150px', h: '190px', rot: '2deg', accent: '#4a7aab', label: 'Doc B' },
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
                        {[1,2,3,4,5,6].map((n) => (
                          <span key={n} className="block h-1.5 rounded bg-[#f0f0f5]" style={{ width: `${55 + n * 5}%` }} />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-7 rounded bg-[#e5322d]/70" />
                        <span className="h-1.5 w-10 rounded bg-[#e5322d]/70" />
                      </div>
                    </div>
                    {/* folded corner */}
                    <div className="absolute right-0 top-0 h-4 w-4 overflow-hidden">
                      <div className="flex h-4 w-4"><div className="h-full w-3 bg-white border-l border-t border-[#c4c4cc]" /><div className="h-3 w-3 bg-[#f0f0f5] border-l border-t border-[#c4c4cc]" /></div>
                    </div>
                  </div>
                ))}

                {/* Front card: larger, crisp shadow, slightly rotated */}
                <div
                  className="absolute rounded-xl border border-[#c4c4cc] bg-white shadow-[0_14px_32px_rgba(16,24,32,0.18)]"
                  style={{ width: '180px', height: '220px', top: '30%', left: '58%', transform: 'rotate(4deg)' }}
                >
                  <div className="flex h-8 items-center justify-between border-b border-[#c4c4cc]/60 px-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#7253e2]" />
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
                      {[1,2,3,4].map((n) => (
                        <span key={n} className="block h-2.5 rounded bg-[#f0f0f5]" style={{ width: `${60 + n * 7}%` }} />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-9 rounded bg-[#7253e2]/70" />
                      <span className="h-2 w-12 rounded bg-[#7253e2]/70" />
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
            {/* status legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-[#47474f]">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e5322d]" /> Works now</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4a7aab]" /> Demo</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7253e2]" /> Server-side</span>
            </div>
          </div>

          <div className="space-y-10">
            {TOOL_CATEGORIES.map((cat) => {
              const tools = toolsByCategory(cat.key);
              return (
                <div key={cat.key}>
                  <h3 className="mb-4 text-[1.75rem] font-semibold tracking-tight text-[#161616]">{cat.label}</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                  {/* per-category note for server-only groups */}
                  {tools.length > 0 && tools.every((t) => t.status === 'backend') && (
                    <p className="mt-3 text-xs text-[#47474f]">
                      These tools require a server backend. In this demo they show a placeholder.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Bottom CTA band ===== */}
      <section className="bg-[#161616] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[1280px] text-center">
          <h2 className="font-display leading-[4.25rem] text-[3.75rem] font-bold tracking-tight text-white sm:text-[4.5rem]">
            Ready to get started?
          </h2>
          <p className="mt-4 text-[1.125rem] leading-relaxed text-[#c4c4cc]">
            Combine, convert, and edit your PDFs in seconds — no install, no sign-up required.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Dropzone
              accept=".pdf,application/pdf"
              maxSizeMB={100}
              multiple
              label="Select PDF file"
              helper="Add files or drag and drop them here"
              onFiles={handleHeroUpload}
              fileCount={selectedCount}
            />
            <Button variant="ghost" size="lg" onClick={() => navigate('/merge-pdf')} className="text-white border border-[#c4c4cc]">
              Browse all tools
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
