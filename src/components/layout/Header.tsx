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
      { label: 'PDF to PDF/A', href: '/pdf_to_pdfa' },
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
      { label: 'Extract pages', href: '/extract_pages' },
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
      { label: 'PDF to PDF/A', href: '/pdf_to_pdfa' },
    ],
  },
  {
    group: 'Edit PDF',
    links: [
      { label: 'Edit PDF', href: '/edit-pdf' },
      { label: 'Add page numbers', href: '/add_pdf_page_number' },
      { label: 'Add watermark', href: '/pdf_add_watermark' },
      { label: 'Crop PDF', href: '/crop-pdf' },
      { label: 'Edit PDF', href: '/edit-pdf' },
      { label: 'PDF Forms', href: '/pdf-forms' },
    ],
  },
  {
    group: 'PDF Security',
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
      { label: 'AI Summarizer', href: '/ai_summarizer' },
      { label: 'Translate PDF', href: '/translate_pdf' },
      { label: 'PDF to Markdown', href: '/pdf_to_markdown' },
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
      <nav className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="brand flex items-center gap-2" aria-label="PDF Site home">
          <span className="text-[24px] font-bold slab text-[#33333B]">I</span>
          <span className="text-[24px] font-bold slab text-[#E5322D]">&#10084;</span>
          <span className="text-[24px] font-bold slab text-[#33333B]">PDF</span>
        </Link>

        <div className="menu hidden sm:flex items-center gap-6 ml-8">
          <NavLink href="/merge_pdf">Merge PDF</NavLink>
          <NavLink href="/split_pdf">Split PDF</NavLink>
          <NavLink href="/compress_pdf">Compress PDF</NavLink>

          <div className="relative" ref={convertRef}>
            <button
              className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-[#222222] transition-colors hover:text-[#E5322D]"
              onClick={() => setConvertOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={convertOpen}
            >
              Convert PDF <DownArrow style={{ fontSize: '10px', marginLeft: '4px', color: '#222222' }} />
            </button>
            {convertOpen && (
              <div className="nav-dropdown absolute left-0 top-full mt-2 min-w-[260px] rounded-[12px] border border-[#EBEBF0] bg-white p-2 shadow-[0_10px_24px_rgba(25,25,40,0.07)] z-50">
                {CONVERT_LINKS.map((group) => (
                  <div key={group.group} className="mb-2 last:mb-0">
                    <div className="nav__title mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
                      {group.group}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {group.links.map((l) => (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            onClick={(e) => { if (!l.external) e.preventDefault(); handleNavLink(l.href, l.external); }}
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]"
                          >
                            <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
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
              className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-[#222222] transition-colors hover:text-[#E5322D]"
              onClick={() => setAllOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={allOpen}
            >
              All PDF tools <DownArrow style={{ fontSize: '10px', marginLeft: '4px', color: '#222222' }} />
            </button>
            {allOpen && (
              <div className="nav-dropdown nav-dropdown--full absolute left-0 top-full mt-2 min-w-[560px] rounded-[12px] border border-[#EBEBF0] bg-white p-4 shadow-[0_10px_24px_rgba(25,25,40,0.07)] z-50">
                <div className="grid grid-cols-2 gap-6">
                  {ALL_TOOLS_LINKS.map((group) => (
                    <div key={group.group} className="flex flex-col gap-2">
                      <div className="nav__title mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
                        {group.group}
                      </div>
                      <ul className="flex flex-col gap-1">
                        {group.links.map((l) => (
                          <li key={l.href}>
                            <a
                              href={l.href}
                              onClick={(e) => { if (!l.external) e.preventDefault(); handleNavLink(l.href, l.external); }}
                              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]"
                            >
                              <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
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
          <Link to="/login" className="link--secondary hidden sm:inline-block text-[14px] font-medium text-[#222222] hover:text-[#E5322D]">
            Login
          </Link>
          <Link
            to="/register"
            className="btn-brand hidden sm:inline-block"
          >
            Sign up
          </Link>

          <div className="relative">
            <button
              className="flex items-center justify-center rounded-[6px] p-2 text-[#222222] transition-colors hover:bg-[#F0F0F5] sm:hidden"
              aria-label="More options"
              onClick={() => setCompanyOpen((v) => !v)}
            >
              <AppSwitcher style={{ fontSize: '20px', color: '#33333B' }} />
            </button>
            {companyOpen && (
              <div className="nav-dropdown nav-dropdown--left nav-dropdown--company absolute right-0 top-full mt-2 min-w-[320px] rounded-[12px] border border-[#EBEBF0] bg-white p-4 shadow-[0_10px_24px_rgba(25,25,40,0.07)] z-50 sm:hidden">
                <div className="menu-comp">
                  {COMPANY_LINKS.map((group) => (
                    <div key={group.group} className="mb-4 last:mb-0">
                      <div className="menu-comp__products mb-2 px-2">
                        <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
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
                                className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]"
                              >
                                <div className="flex items-center gap-2">
                                  <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                                  <div className="navbar__item__content">
                                    <div className="navbar__item__title font-medium">{l.label}</div>
                                  </div>
                                </div>
                                <ArrowRight style={{ fontSize: '10px', color: '#6E6E7A' }} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  <div className="menu-comp__business mt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
                      Solutions
                    </div>
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a href="/business" className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Business</div>
                              <div className="navbar__item__description text-[11px] text-[#6E6E7A]">Streamlined PDF editing and workflows for business teams</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#6E6E7A' }} />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#EBEBF0]/30 pt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
                      Applications
                    </div>
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a href="/desktop" className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Desktop App</div>
                              <div className="navbar__item__description text-[11px] text-[#6E6E7A]">Available for Mac and Windows</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#6E6E7A' }} />
                        </a>
                      </li>
                      <li>
                        <a href="/mobile" className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]">
                          <div className="flex items-center gap-2">
                            <DocIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                            <div className="navbar__item__content">
                              <div className="navbar__item__title font-medium">Mobile App</div>
                              <div className="navbar__item__description text-[11px] text-[#6E6E7A]">Available for iOS and Android</div>
                            </div>
                          </div>
                          <ArrowRight style={{ fontSize: '10px', color: '#6E6E7A' }} />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#EBEBF0]/30 pt-4 px-2">
                    <div className="nav__title mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6E6E7A]">
                      Help
                    </div>
                    <ul className="flex flex-col gap-1">
                      {HELP_LINKS.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} className="rounded-md px-3 py-1.5 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 border-t border-[#EBEBF0]/30 pt-4 px-2">
                    <div className="relative">
                      <button
                        className="flex items-center justify-between w-full rounded-md px-3 py-1.5 text-[13px] text-[#33333B] transition-colors hover:bg-[#EBEBF2]"
                        onClick={() => setLangOpen((v) => !v)}
                      >
                        <span className="flex items-center gap-2">
                          <WorldIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                          <span className="font-medium">{currentLang === 'en' ? 'English' : LANGUAGES.find((l) => l.code === currentLang)?.label}</span>
                          <DownArrow style={{ fontSize: '10px', color: '#6E6E7A' }} />
                        </span>
                      </button>
                      {langOpen && (
                        <div className="nav-dropdown lang absolute left-0 top-full mt-2 min-w-[200px] rounded-[12px] border border-[#EBEBF0] bg-white p-2 shadow-[0_10px_24px_rgba(25,25,40,0.07)] z-50">
                          <span className="lang__current flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-[#33333B] border-b border-[#EBEBF0]/30 mb-2">
                            <WorldIcon style={{ fontSize: '14px', color: '#6E6E7A' }} />
                            English <DownArrow style={{ fontSize: '10px', color: '#6E6E7A' }} />
                          </span>
                          <ul className="lang__menu flex flex-col gap-1">
                            <li>
                              <a
                                href="/"
                                className={`rounded-md px-3 py-1.5 text-[13px] ${currentLang === 'en' ? 'bg-[#EBEBF2] font-semibold' : 'text-[#33333B]'}`}
                              >
                                English
                              </a>
                            </li>
                            {LANGUAGES.map((l) => (
                              <li key={l.code}>
                                <a
                                  href={`/${l.code}`}
                                  className={`rounded-md px-3 py-1.5 text-[13px] ${currentLang === l.code ? 'bg-[#EBEBF2] font-semibold' : 'text-[#33333B]'}`}
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
                  <div className="mt-4 border-t border-[#EBEBF0]/30 pt-4 px-2">
                    <a
                      href="/login"
                      className="btn btn--secondary show--sm inline-flex items-center justify-center rounded-md px-4 py-2 text-[13px] font-medium text-[#222222] border border-[#EBEBF0] hover:bg-[#EBEBF2]"
                    >
                      Login
                    </a>
                    <a
                      href="/register"
                      className="btn-brand show--sm inline-flex items-center justify-center rounded-md px-4 py-2 text-[13px] font-bold text-white mt-2 w-full"
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="flex items-center justify-center rounded-[6px] p-2 text-[#222222] transition-colors hover:bg-[#EBEBF2] sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon style={{ fontSize: '22px', color: '#33333B' }} />
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
            <div className="flex items-center justify-between border-b border-[#EBEBF0]/30 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="brand flex items-center gap-2">
                <span className="text-[24px] font-bold slab text-[#33333B]">I</span>
                <span className="text-[24px] font-bold slab text-[#E5322D]">&#10084;</span>
                <span className="text-[24px] font-bold slab text-[#33333B]">PDF</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-1.5 text-[#222222] transition-colors hover:bg-[#EBEBF2]" aria-label="Close menu">
                <CloseIcon style={{ fontSize: '22px', color: '#33333B' }} />
              </button>
            </div>
            <nav className="overflow-y-auto px-4 py-4" style={{ height: 'calc(100vh - 80px)' }}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#6E6E7A]">Tools</h2>
              <ul className="flex flex-col gap-1">
                {[
                  { label: 'Merge PDF', href: '/merge_pdf' },
                  { label: 'Split PDF', href: '/split_pdf' },
                  { label: 'Compress PDF', href: '/compress_pdf' },
                  { label: 'Sign PDF', href: '/sign-pdf' },
                  { label: 'Unlock PDF', href: '/unlock_pdf' },
                  { label: 'Protect PDF', href: '/protect-pdf' },
                  { label: 'Edit PDF', href: '/edit-pdf' },
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
                      className={`flex items-center px-4 py-3 text-base rounded-md transition-colors ${window.location.pathname === l.href ? 'bg-[#FBE9E8] text-[#C92420] font-bold' : 'text-[#222222] hover:bg-[#F0F0F5]'}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-[#EBEBF0]/30 pt-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-4 py-3 text-base rounded-md text-[#222222]">
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-brand inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-bold text-white mb-3 w-full"
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
function AppSwitcher({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="24" height="24">
      <rect x="6" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="6" width="4" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="14" width="4" height="4" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="4" height="4" stroke="currentColor" strokeWidth="2" />
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
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 1l4 4M7 5l-4-4M7 5l-4 4" />
    </svg>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  const navigate = useNavigate();
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); navigate(href); }}
      className="text-[13px] font-bold uppercase tracking-wider text-[#222222] transition-colors hover:text-[#E5322D] -ml-0.5 px-0.5 py-1 rounded-md"
    >
      {children}
    </a>
  );
}
