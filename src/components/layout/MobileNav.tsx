import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const MOBILE_LINKS = [
  { label: 'All tools', href: '/' },
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'Unlock PDF', href: '/unlock-pdf' },
  { label: 'Protect PDF', href: '/protect-pdf' },
  { label: 'Rotate PDF', href: '/rotate-pdf' },
  { label: 'Watermark PDF', href: '/add-watermark' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf' },
  { label: 'PDF to JPG', href: '/pdf-to-jpg' },
  { label: 'Compare PDF', href: '/compare-pdf' },
  { label: 'OCR PDF', href: '/ocr-pdf' },
];

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();

  useEffect(() => {
    const handler = () => { if (open) onClose(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={onClose} aria-hidden="true">
      <div
        className="absolute left-0 top-0 h-full w-72 bg-white shadow-[0_0_0_100vw_inset_black]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c4c4cc]/30 px-5 py-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 text-[#161616]">
            <img src="/img/ilovepdf.svg" alt="iLovePDF" width="26" height="26" aria-hidden="true" />
            <span className="text-[1.25rem] font-bold">iLovePDF</span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#161616] transition-colors hover:bg-[#f0f0f5]" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable links */}
        <nav className="overflow-y-auto px-4 py-4" style={{ height: 'calc(100vh - 80px)' }}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#47474f]">Tools</h2>
          <ul className="flex flex-col gap-1">
            {MOBILE_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  onClick={onClose}
                  className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                    location.pathname === l.href
                      ? 'bg-[#fbeae7] text-[#c92a24] font-semibold'
                      : 'text-[#161616] hover:bg-[#f0f0f5]'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-[#c4c4cc]/30 pt-4">
            <Link to="/login" onClick={onClose} className="flex items-center justify-between px-4 py-3 text-base rounded-lg text-[#161616]">
              Login
            </Link>
            <Link to="/signup" onClick={onClose} className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all mb-3" style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}>
              Create account
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
