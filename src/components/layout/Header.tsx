import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, User, Plus } from 'lucide-react';
import MobileNav from './MobileNav';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'nl', label: 'Nederlands', short: 'NL' },
  { code: 'pl', label: 'Polski', short: 'PL' },
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'ru', label: 'Русский', short: 'RU' },
];

const NAV_LINKS = [
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
];

const CONVERT_LINKS = [
  { label: 'Word to PDF', href: '/word-to-pdf' },
  { label: 'Excel to PDF', href: '/excel-to-pdf' },
  { label: 'PowerPoint to PDF', href: '/powerpoint-to-pdf' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf' },
  { label: 'PDF to Word', href: '/pdf-to-word' },
  { label: 'PDF to JPG', href: '/pdf-to-jpg' },
];

const ALL_TOOLS_LINKS = [
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'Rotate PDF', href: '/rotate-pdf' },
  { label: 'Watermark PDF', href: '/add-watermark' },
  { label: 'Unlock PDF', href: '/unlock-pdf' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'OCR PDF', href: '/ocr-pdf' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Keep <html lang> in sync (client-only; no server call).
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const convertRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (convertRef.current && !convertRef.current.contains(e.target as Node)) setConvertOpen(false);
      if (allRef.current && !allRef.current.contains(e.target as Node)) setAllOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavLink = (href: string) => {
    setMobileOpen(false);
    setConvertOpen(false);
    setAllOpen(false);
    navigate(href);
  };

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-1.5 text-[#161616] transition-colors hover:opacity-80" aria-label="iLovePDF home">
          <LogoMark />
          <span className="text-[1.25rem] font-bold tracking-tight">iLovePDF</span>
        </Link>

        {/* Center primary nav (desktop) */}
        <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} onClick={() => handleNavLink(l.href)}>
              {l.label}
            </NavLink>
          ))}
          <Dropdown ref={convertRef} label="Convert PDF" open={convertOpen} onToggle={() => setConvertOpen((v) => !v)} links={CONVERT_LINKS} />
          <Dropdown ref={allRef} label="All PDF Tools" open={allOpen} onToggle={() => setAllOpen((v) => !v)} links={ALL_TOOLS_LINKS} />
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <LangSelector currentLang={currentLang} ref={langRef} open={langOpen} onToggle={() => setLangOpen((v) => !v)} onSelect={(code) => { setLangOpen(false); setCurrentLang(code); }} />

          {/* Auth */}
          <Link to="/login" className="hidden items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#f0f0f5] sm:flex">
            <User size={15} className="mr-1.5" />
            Login
          </Link>
          <Link to="/signup" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5 sm:inline-flex" style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}>
            <Plus size={15} className="mr-1.5" />
            Sign Up
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-[#161616] sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="#e5322d"/>
      <rect x="6" y="9" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.6"/>
      <path d="M7 11h4v10H7z" fill="#fff" opacity=".95"/>
      <path d="M14 9h4v12h-4z" fill="#fff" opacity=".95"/>
      <path d="M21 13h4v8h-4z" fill="#fff" opacity=".95"/>
    </svg>
  );
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className="text-sm font-medium text-[#161616] transition-colors hover:text-[#161616] hover:bg-[#f5f5fa] -ml-0.5 px-0.5 py-1 rounded"
    >
      {children}
    </Link>
  );
}

function Dropdown({
  label,
  links,
  ref,
  open,
  onToggle,
}: {
  label: string;
  links: { label: string; href: string }[];
  ref: React.RefObject<HTMLDivElement>;
  open: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    }
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [onToggle, ref]);

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1 text-sm font-medium text-[#161616] transition-colors hover:text-[#161616] rounded py-1 pr-5"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onToggle}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-[#c4c4cc] bg-white p-1.5 shadow-[0_10px_24px_rgba(16,24,32,0.14)]">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => { onToggle(); navigate(l.href); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LangSelector({ currentLang, ref, open, onToggle, onSelect }: { currentLang: string; ref?: React.RefObject<HTMLDivElement>; open: boolean; onToggle: () => void; onSelect: (code: string) => void }) {
  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#f0f0f5]"
        aria-label="Choose language"
        aria-expanded={open}
      >
        <Globe size={15} />
        <span className="font-medium">{current.short}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[170px] rounded-xl border border-[#c4c4cc] bg-white p-1.5 shadow-[0_10px_24px_rgba(16,24,32,0.14)]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#f5f5fa]${l.code === currentLang ? ' bg-[#f5f5fa] font-semibold' : ''}`}
            >
              <span>{l.label}</span>
              <span className={`float-right ${l.code === currentLang ? 'text-[#e5322d]' : 'text-[#47474f]'}`}>{l.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
