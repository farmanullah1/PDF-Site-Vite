import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOL_CATEGORIES, toolsByCategory, ToolConfig } from '../../data/toolsConfig';
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
                <InputFilePicker
                  accept=".pdf"
                  label="Select PDF file"
                  onFile={handleHeroUpload}
                  selectedCount={selectedCount}
                />
                <Button variant="outline" onClick={() => navigate('/merge-pdf')}>
                  Try Merge PDF
                </Button>
              </div>
              <p className="text-xs text-[#47474f]">
                Drag and drop is supported on every tool page. Your files never leave your device.
              </p>
            </div>

            {/* Hero visual: stacked PDF pages mockup */}
            <div className="flex h-64 w-full flex-1 items-end justify-center overflow-hidden sm:h-72 lg:h-96" aria-hidden="true">
              <div className="relative flex h-full w-full items-end justify-center px-6">
                {[
                  { top: '2%', left: '10%', w: '160px', h: '200px', shade: 0 },
                  { top: '6%', left: '22%', w: '160px', h: '200px', shade: 1 },
                  { top: '10%', left: '34%', w: '160px', h: '200px', shade: 2 },
                  { top: '14%', left: '46%', w: '160px', h: '200px', shade: 3 },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl border border-[#c4c4cc] bg-white shadow-[0_8px_24px_rgba(16,24,32,0.12)]"
                    style={{
                      position: 'absolute',
                      top: p.top,
                      left: p.left,
                      width: p.w,
                      height: p.h,
                      transform: i === 0 ? 'rotate(-3deg)' : i === 1 ? 'rotate(0deg)' : i === 2 ? 'rotate(3deg)' : 'rotate(-1deg)',
                      boxShadow: i === 0 ? '0 12px 28px rgba(16,24,32,0.14)' : '0 6px 16px rgba(16,24,32,0.10)',
                    }}
                  >
                    {/* Page header strip */}
                    <div className="flex h-8 items-center justify-between border-b border-[#c4c4cc]/60 px-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#e5322d]" />
                        PDF
                      </span>
                      <span className="text-[10px] font-medium text-[#47474f]">{['Doc A','Doc B','Doc C','Doc D'][i]}</span>
                    </div>
                    {/* Page body */}
                    <div className="ml-3 flex h-[calc(100%-2rem)] flex-col justify-between gap-2 p-3">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-8 rounded bg-[#c4c4cc]" />
                        <span className="h-2.5 w-12 rounded bg-[#e8e8ed]" />
                      </div>
                      <div className="space-y-2">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className="block h-2 rounded bg-[#f0f0f5]" style={{ width: `${60 + n * 6}%` }} />
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <span className="h-2 w-10 rounded bg-[#e5322d]/70" />
                        <span className="h-2 w-14 rounded bg-[#e5322d]/70" />
                      </div>
                    </div>
                  </div>
                ))}
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
            <InputFilePicker
              accept=".pdf"
              label="Select PDF file"
              onFile={handleHeroUpload}
              selectedCount={selectedCount}
              className="w-full sm:w-auto"
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

function InputFilePicker({
  accept,
  label,
  onFile,
  selectedCount,
  className,
}: {
  accept: string;
  label: string;
  onFile: (files: File[]) => void;
  selectedCount: number;
  className?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = { current: null as HTMLInputElement | null };

  const pick = useCallback(() => inputRef.current?.click(), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files || []);
      const pdfs = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      onFile(pdfs);
    },
    [onFile]
  );

  return (
    <div
      className={`dropzone group ${className ?? ''} ${dragOver ? 'drag-over' : ''}`}
      onClick={pick}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onFile(files);
          e.target.value = '';
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <svg className="h-12 w-12 transition-colors group-hover:bg-[#fbeae7] sm:h-12 sm:w-12" viewBox="0 0 48 48" fill="none" aria-hidden="true" style={{ color: dragOver ? '#c92a24' : '#c4c4cc' }}>
          <path d="M8 12v24a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M24 18v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="11" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-medium text-[#161616]">{label}</span>
          <span className="text-xs text-[#47474f]">Add files or drag and drop them here</span>
        </div>
        {selectedCount > 0 && (
          <span className="rounded-full bg-[#e5322d] px-3 py-1 text-xs font-semibold text-white">
            {selectedCount} file{selectedCount === 1 ? '' : 's'} selected
          </span>
        )}
      </div>
    </div>
  );
}
