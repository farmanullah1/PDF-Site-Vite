import { Link } from 'react-router-dom';
import StandardLayout from '../../components/layout/StandardLayout';
import { ToolConfig } from '../../data/toolsConfig';
import { Clock } from 'lucide-react';

export default function ComingSoon({ tool }: { tool: ToolConfig }) {
  const isBackend = tool.status === 'backend';

  return (
    <StandardLayout tool={tool}>
      <div className="flex flex-col items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7253e2]/10 text-[#7253e2]">
          <Clock size={28} />
        </div>
        <div className="max-w-xl text-center sm:text-left">
          <h2 className="text-[1.5rem] font-semibold text-[#161616]">
            {isBackend ? 'Server-side tool' : 'Coming soon'}
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-normal text-[#47474f]">
            {isBackend
              ? `${tool.name} is a server-side tool. On the live service this runs on a backend with Ghostscript or LibreOffice. This demo site does not include that backend, so the tool is shown here for completeness but is not available yet.`
              : `${tool.name} is on our roadmap. This demo includes the design and layout for the tool, but the full functionality is not implemented yet.`}
          </p>
          <div className="mt-4 rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4">
            <p className="text-sm text-[#47474f]">
              In a full deployment, the following would power this tool:
            </p>
            <ul className="mt-2 space-y-1">
              {isBackend ? (
                <>
                  <li>• Ghostscript (<code>gs</code>) for compression and PDF optimization</li>
                  <li>• qpdf for password-based encryption (Protect PDF)</li>
                  <li>• LibreOffice headless for Office-to-PDF conversions</li>
                </>
              ) : (
                <>
                  <li>• Additional pdf-lib and pdf.js logic for the full feature set</li>
                  <li>• UI polish and edge-case handling for the specific tool</li>
                </>
              )}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              to="/"
              className="inline-flex items-center rounded-lg border border-[#c4c4cc] bg-white px-4 py-2 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]"
            >
              Back to all tools
            </Link>
            {!isBackend && (
              <Link
                to={`/merge_pdf`}
                className="inline-flex items-center rounded-lg bg-[#e5322d] px-4 py-2 text-sm font-medium text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}
              >
                Try Merge PDF
              </Link>
            )}
          </div>
        </div>
      </div>
    </StandardLayout>
  );
}
