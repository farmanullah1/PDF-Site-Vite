import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Pусский' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-cn', label: '中文 (简体)' },
  { code: 'zh-tw', label: '中文 (繁體)' },
  { code: 'ar', label: 'العربية' },
  { code: 'bg', label: 'Български' },
  { code: 'ca', label: 'Català' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'th', label: 'ภาษาไทย' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uk', label: 'Українська' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'sw', label: 'Kiswahili' },
];

type NavLink = { label: string; href: string; external?: boolean };
type NavGroup = { group: string; links: NavLink[] };

const CONVERT_LINKS: NavGroup[] = [
  {
    group: 'Convert to PDF',
    links: [
      { label: 'JPG to PDF', href: '/jpg_to_pdf' },
      { label: 'WORD to PDF', href: '/word_to_pdf' },
      { label: 'POWERPOINT to PDF', href: '/powerpoint_to_pdf' },
      { label: 'EXCEL to PDF', href: '/excel_to_pdf' },
      { label: 'HTML to PDF', href: '/html-to-pdf' },
    ],
  },
  {
    group: 'Convert from PDF',
    links: [
      { label: 'PDF to JPG', href: '/pdf_to_jpg' },
      { label: 'PDF to WORD', href: '/pdf_to_word' },
      { label: 'PDF to POWERPOINT', href: '/pdf_to_powerpoint' },
      { label: 'PDF to EXCEL', href: '/pdf_to_excel' },
      { label: 'PDF to PDF/A', href: '/convert-pdf-to-pdfa' },
    ],
  },
];

const ALL_TOOLS_LINKS: NavGroup[] = [
  {
    group: 'Organize PDF',
    links: [
      { label: 'Merge PDF', href: '/merge_pdf' },
      { label: 'Split PDF', href: '/split_pdf' },
      { label: 'Remove pages', href: '/remove-pages' },
      { label: 'Extract pages', href: '/split_pdf#split,extract' },
      { label: 'Organize PDF', href: '/organize-pdf' },
      { label: 'Scan to PDF', href: '/scan-pdf' },
    ],
  },
  {
    group: 'Optimize PDF',
    links: [
      { label: 'Compress PDF', href: '/compress_pdf' },
      { label: 'Repair PDF', href: '/repair-pdf' },
      { label: 'OCR PDF', href: '/ocr-pdf' },
    ],
  },
  {
    group: 'Convert to PDF',
    links: [
      { label: 'JPG to PDF', href: '/jpg_to_pdf' },
      { label: 'WORD to PDF', href: '/word_to_pdf' },
      { label: 'POWERPOINT to PDF', href: '/powerpoint_to_pdf' },
      { label: 'EXCEL to PDF', href: '/excel_to_pdf' },
      { label: 'HTML to PDF', href: '/html-to-pdf' },
    ],
  },
  {
    group: 'Convert from PDF',
    links: [
      { label: 'PDF to JPG', href: '/pdf_to_jpg' },
      { label: 'PDF to WORD', href: '/pdf_to_word' },
      { label: 'PDF to POWERPOINT', href: '/pdf_to_powerpoint' },
      { label: 'PDF to EXCEL', href: '/pdf_to_excel' },
      { label: 'PDF to PDF/A', href: '/convert-pdf-to-pdfa' },
    ],
  },
  {
    group: 'Edit PDF',
    links: [
      { label: 'Rotate PDF', href: '/rotate_pdf' },
      { label: 'Add page numbers', href: '/add_pdf_page_number' },
      { label: 'Add watermark', href: '/pdf_add_watermark' },
      { label: 'Crop PDF', href: '/crop-pdf' },
      { label: 'Edit PDF', href: '/edit-pdf' },
      { label: 'PDF Forms', href: '/pdf-forms' },
    ],
  },
  {
    group: 'PDF security',
    links: [
      { label: 'Unlock PDF', href: '/unlock_pdf' },
      { label: 'Protect PDF', href: '/protect-pdf' },
      { label: 'Sign PDF', href: '/sign-pdf' },
      { label: 'Redact PDF', href: '/redact-pdf' },
      { label: 'Compare PDF', href: '/compare-pdf' },
    ],
  },
  {
    group: 'PDF Intelligence',
    links: [
      { label: 'AI Summarizer', href: '/pdf-summarize' },
      { label: 'Translate PDF', href: '/translate-pdf' },
      { label: 'PDF to Markdown', href: '/pdf-to-markdown' },
    ],
  },
];

const COMPANY_LINKS: NavGroup[] = [
  {
    group: 'Other products',
    links: [
      { label: 'iLoveIMG', href: 'https://www.iloveimg.com', external: true },
      { label: 'iLoveSign', href: 'https://www.ilovesign.com', external: true },
      { label: 'iLoveAPI', href: 'https://www.iloveapi.com', external: true },
      { label: 'Integrations', href: 'https://www.iloveapi.com/integrations', external: true },
    ],
  },
  {
    group: 'Solutions',
    links: [{ label: 'Business', href: '/business' }],
  },
  {
    group: 'Applications',
    links: [
      { label: 'Desktop App', href: '/desktop' },
      { label: 'Mobile App', href: '/mobile' },
    ],
  },
  {
    group: 'General',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/help/security' },
      { label: 'Features', href: '/features' },
      { label: 'About us', href: '/help/about' },
    ],
  },
];

const HELP_LINKS = [
  { label: 'FAQ', href: '/help/faq' },
  { label: 'Tools', href: '/help/documentation' },
  { label: 'Legal & Privacy', href: '/help/legal' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const convertRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (convertRef.current && !convertRef.current.contains(e.target as Node)) setConvertOpen(false);
      if (allRef.current && !allRef.current.contains(e.target as Node)) setAllOpen(false);
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setCompanyOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavLink = (href: string, external?: boolean) => {
    setMobileOpen(false);
    setConvertOpen(false);
    setAllOpen(false);
    setCompanyOpen(false);
    setLangOpen(false);
    if (external) {
      window.open(href, '_blank', 'noopener');
    } else {
      navigate(href);
    }
  };

  return (
    <header className="site-header">
      <nav className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="brand flex items-center" aria-label="iLovePDF home">
          <img src="/img/ilovepdf.svg" alt="iLovePDF" />
        </Link>

        <div className="menu hidden sm:flex items-center gap-4 ml-8">
          <div className="flex items-center gap-2">
            <NavLink href="/merge_pdf">Merge PDF</NavLink>
            <NavLink href="/split_pdf">Split PDF</NavLink>
            <NavLink href="/compress_pdf">Compress PDF</NavLink>
          </div>

          <div className="relative" ref={convertRef}>
            <button
              className="flex items-center gap-1 text-sm font-medium text-[#161616] transition-colors hover:text-[#161616]"
              onClick={() => setConvertOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={convertOpen}
            >
              Convert PDF <DownArrow style={{ fontSize: '10px', marginLeft: '4px', color: '#161616' }} />
            </button>
            {convertOpen && (
              <div className="nav-dropdown absolute left-0 top-full mt-2 min-w-[260px] rounded-lg border border-[#c4c4cc] bg-white p-2 shadow-[0_10px_24px_rgba(16,24,32,0.14)] z-50">
                {CONVERT_LINKS.map((group) => (
                  <div key={group.group} className="mb-2 last:mb-0">
                    <div className="nav__title mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      {group.group}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {group.links.map((l) => (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            onClick={(e) => { if (!l.external) e.preventDefault(); handleNavLink(l.href, l.external); }}
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]"
                          >
                            <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={allRef}>
            <button
              className="flex items-center gap-1 text-sm font-medium text-[#161616] transition-colors hover:text-[#161616]"
              onClick={() => setAllOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={allOpen}
            >
              All PDF tools <DownArrow style={{ fontSize: '10px', marginLeft: '4px', color: '#161616' }} />
            </button>
            {allOpen && (
              <div className="nav-dropdown nav-dropdown--full absolute left-0 top-full mt-2 min-w-[560px] rounded-lg border border-[#c4c4cc] bg-white p-4 shadow-[0_10px_24px_rgba(16,24,32,0.14)] z-50">
                <div className="grid grid-cols-2 gap-6">
                  {ALL_TOOLS_LINKS.map((group) => (
                    <div key={group.group} className="flex flex-col gap-2">
                      <div className="nav__title mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                        {group.group}
                      </div>
                      <ul className="flex flex-col gap-1">
                        {group.links.map((l) => (
                          <li key={l.href}>
                            <a
                              href={l.href}
                              onClick={(e) => { if (!l.external) e.preventDefault(); handleNavLink(l.href, l.external); }}
                              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]"
                            >
                              <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                              {l.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions flex items-center gap-3">
          <Link to="/login" className="link--secondary hidden sm:inline-block text-sm font-medium text-[#161616] hover:text-[#EE6C4D]">
            Login
          </Link>
          <Link
            to="/register"
            className="btn btn--sm hidden sm:inline-block inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(238,108,77,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(238,108,77,0.32)] hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(128deg, #FF7651 0%, #EE6C4D 100%)' }}
          >
            Sign up
          </Link>

          <div className="relative">
            <button
              className="flex items-center justify-center rounded-md p-2 text-[#161616] transition-colors hover:bg-[#f0f0f5] sm:hidden"
              aria-label="More options"
              onClick={() => setCompanyOpen((v) => !v)}
            >
              <MoreIcon style={{ fontSize: '20px', color: '#161616' }} />
            </button>
            {companyOpen && (
              <div className="nav-dropdown nav-dropdown--left nav-dropdown--company absolute right-0 top-full mt-2 min-w-[320px] rounded-lg border border-[#c4c4cc] bg-white p-4 shadow-[0_10px_24px_rgba(16,24,32,0.14)] z-50 sm:hidden">
                <div className="menu-comp">
                  {COMPANY_LINKS.map((group) => (
                    <div key={group.group} className="mb-4 last:mb-0">
                      <div className="menu-comp__products mb-2 px-2">
                        <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                          {group.group}
                        </div>
                        <ul className="flex flex-col gap-1">
                          {group.links.map((l) => (
                            <li key={l.href}>
                              <a
                                href={l.href}
                                target={l.external ? '_blank' : undefined}
                                rel={l.external ? 'noopener' : undefined}
                                onClick={(e) => { if (!l.external) e.preventDefault(); handleNavLink(l.href, l.external); }}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]"
                              >
                                <div className="flex items-center gap-2">
                                  <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                                  <div className="navbar__item__content">
                                    <div className="navbar__item__title font-medium">{l.label}</div>
                                  </div>
                                </div>
                                <ArrowRight style={{ fontSize: '10px', color: '#47474f' }} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  <div className="menu-comp__business mt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      Solutions
                    </div>
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a href="/business" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Business</div>
                              <div className="navbar__item__description text-[11px] text-[#47474f]">Streamlined PDF editing and workflows for business teams</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#47474f' }} />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#c4c4cc]/30 pt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      Applications
                    </div>
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a href="/desktop" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Desktop App</div>
                              <div className="navbar__item__description text-[11px] text-[#47474f]">Available for Mac and Windows</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#47474f' }} />
                        </a>
                      </li>
                      <li>
                        <a href="/mobile" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#161616' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Mobile App</div>
                              <div className="navbar__item__description text-[11px] text-[#47474f]">Available for iOS and Android</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#47474f' }} />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#c4c4cc]/30 pt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#47474f]">
                      Help
                    </div>
                    <ul className="flex flex-col gap-1">
                      {HELP_LINKS.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} className="rounded-lg px-3 py-1.5 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#c4c4cc]/30 pt-4 px-2">
                    <div className="relative">
                      <button
                        className="flex items-center justify-between w-full rounded-lg px-3 py-1.5 text-sm text-[#161616] transition-colors hover:bg-[#f5f5fa]"
                        onClick={() => setLangOpen((v) => !v)}
                      >
                        <span className="flex items-center gap-2">
                          <WorldIcon style={{ fontSize: '14px', color: '#161616' }} />
                          <span className="font-medium">{currentLang === 'en' ? 'English' : LANGUAGES.find((l) => l.code === currentLang)?.label}</span>
                          <DownArrow style={{ fontSize: '10px', color: '#161616' }} />
                        </span>
                      </button>
                      {langOpen && (
                        <div className="nav-dropdown lang absolute left-0 top-full mt-2 min-w-[200px] rounded-lg border border-[#c4c4cc] bg-white p-2 shadow-[0_10px_24px_rgba(16,24,32,0.14)] z-50">
                          <span className="lang__current flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#161616] border-b border-[#c4c4cc]/30 mb-2">
                            <WorldIcon style={{ fontSize: '14px', color: '#161616' }} />
                            English <DownArrow style={{ fontSize: '10px', color: '#161616' }} />
                          </span>
                          <ul className="lang__menu flex flex-col gap-1">
                            <li>
                              <a
                                href="/"
                                className={`rounded-lg px-3 py-1.5 text-sm ${currentLang === 'en' ? 'bg-[#f5f5fa] font-semibold' : 'text-[#161616]'}`}
                              >
                                English
                              </a>
                            </li>
                            {LANGUAGES.map((l) => (
                              <li key={l.code}>
                                <a
                                  href={`/${l.code}`}
                                  className={`rounded-lg px-3 py-1.5 text-sm ${currentLang === l.code ? 'bg-[#f5f5fa] font-semibold' : 'text-[#161616]'}`}
                                >
                                  {l.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[#c4c4cc]/30 pt-4 px-2">
                    <a
                      href="/login"
                      className="btn btn--secondary show--sm inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-[#161616] border border-[#c4c4cc] hover:bg-[#f0f0f5]"
                    >
                      Login
                    </a>
                    <a
                      href="/register"
                      className="btn show--sm inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(238,108,77,0.25)] transition-all mt-2"
                      style={{ background: 'linear-gradient(128deg, #FF7651 0%, #EE6C4D 100%)' }}
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="flex items-center justify-center rounded-md p-2 text-[#161616] transition-colors hover:bg-[#f0f0f5] sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon style={{ fontSize: '22px', color: '#161616' }} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={setMobileOpen.bind(null, false)} aria-hidden="true">
          <div
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-[0_0_0_100vw_inset_black]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            style={{
              transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.25s ease',
            }}
          >
            <div className="flex items-center justify-between border-b border-[#c4c4cc]/30 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="brand flex items-center">
                <img src="/img/ilovepdf.svg" alt="iLovePDF" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1.5 text-[#161616] transition-colors hover:bg-[#f0f0f5]" aria-label="Close menu">
                <CloseIcon style={{ fontSize: '22px', color: '#161616' }} />
              </button>
            </div>
            <nav className="overflow-y-auto px-4 py-4" style={{ height: 'calc(100vh - 80px)' }}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#47474f]">Tools</h2>
              <ul className="flex flex-col gap-1">
                {[
                  { label: 'Merge PDF', href: '/merge_pdf' },
                  { label: 'Split PDF', href: '/split_pdf' },
                  { label: 'Compress PDF', href: '/compress_pdf' },
                  { label: 'Sign PDF', href: '/sign-pdf' },
                  { label: 'Unlock PDF', href: '/unlock_pdf' },
                  { label: 'Protect PDF', href: '/protect-pdf' },
                  { label: 'Rotate PDF', href: '/rotate_pdf' },
                  { label: 'Watermark', href: '/pdf_add_watermark' },
                  { label: 'JPG to PDF', href: '/jpg_to_pdf' },
                  { label: 'PDF to JPG', href: '/pdf_to_jpg' },
                  { label: 'Compare PDF', href: '/compare-pdf' },
                  { label: 'OCR PDF', href: '/ocr-pdf' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${window.location.pathname === l.href ? 'bg-[#fbeae7] text-[#c92a24] font-semibold' : 'text-[#161616] hover:bg-[#f0f0f5]'}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-[#c4c4cc]/30 pt-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-4 py-3 text-base rounded-lg text-[#161616]">
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-semibold text-white shadow-[0_2px_6px_rgba(238,108,77,0.25)] transition-all mb-3 w-full"
                  style={{ background: 'linear-gradient(128deg, #FF7651 0%, #EE6C4D 100%)' }}
                >
                  Create account
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

type IconProps = { className?: string; style?: React.CSSProperties };
function DownArrow({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" fill="none" className={className} style={style} width="10" height="10">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l4 4m0-4L7 3" />
    </svg>
  );
}
function DocIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
    </svg>
  );
}
function CloseIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 12" />
    </svg>
  );
}
function HamburgerIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function MoreIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}
function WorldIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><path stroke="currentColor" strokeWidth="1.5" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2ZM2 12c0 5.523 4.477 10 10 10s10-4.477 10-10" />
    </svg>
  );
}
function ArrowRight({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" fill="none" className={className} style={style} width="10" height="10">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 1l4 4M3 1l4 4M7 5l-4-4M7 5l-4 4" />
    </svg>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  const navigate = useNavigate();
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); navigate(href); }}
      className="text-sm font-medium text-[#161616] transition-colors hover:text-[#161616] hover:bg-[#f5f5fa] -ml-0.5 px-0.5 py-1 rounded"
    >
      {children}
    </a>
  );
}
