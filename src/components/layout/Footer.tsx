import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

type FooterLink = { label: string; href: string; external?: boolean };

const FOOTER_LINKS: { label: string; links: FooterLink[] }[] = [
  { label: 'Product', links: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Tools', href: '/help/documentation' },
    { label: 'FAQ', href: '/faq' },
  ]},
  { label: 'Resources', links: [
    { label: 'Desktop app', href: '/desktop' },
    { label: 'Mobile app', href: '/mobile' },
    { label: 'API', href: '/features' },
  ]},
  { label: 'Solutions', links: [
    { label: 'Business', href: '/business' },
    { label: 'Education', href: '/education' },
  ]},
  { label: 'Legal', links: [
    { label: 'Security', href: '/security' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/help/cookies' },
  ]},
  { label: 'Company', links: [
    { label: 'About us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
  ]},
];

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const navigate = useNavigate();

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

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-grid">
          {FOOTER_LINKS.map((col) => (
            <div key={col.label} className="footer-col">
              <h3>{col.label}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="footer-col-link"
                      onClick={(e) => { if (!l.external) { e.preventDefault(); navigate(l.href); } }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-brand">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[24px] font-bold slab text-[#33333B]">I</span>
              <span className="text-[24px] font-bold slab text-[#E5322D]">&#10084;</span>
              <span className="text-[24px] font-bold slab text-[#33333B]">PDF</span>
            </Link>
          </div>
          <div className="footer-copy">© {CURRENT_YEAR} PDF Site</div>
          <div className="footer-lang">
            <span className="mr-2">{currentLang === 'en' ? 'English' : LANGUAGES.find((l) => l.code === currentLang)?.label}</span>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="ml-2"
              aria-expanded={langOpen}
            >
              <DownArrow />
            </button>
            {langOpen && (
              <div className="footer-lang-menu absolute mt-1 left-0 min-w-[180px] rounded-lg border border-[#EBEBF0] bg-white shadow-lg z-50">
                <span className="block px-3 py-2 text-sm font-semibold text-[#33333B] border-b border-[#EBEBF0]/30">
                  <span className="mr-2">English</span><DownArrow style={{ fontSize: '10px', color: '#6E6E7A', marginLeft: '6px' }} />
                </span>
                <ul className="py-1">
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentLang('en'); setLangOpen(false); }}
                      className={`block px-3 py-2 text-sm ${currentLang === 'en' ? 'bg-[#EBEBF2] font-semibold text-[#E5322D]' : 'text-[#33333B]'}`}
                    >
                      English
                    </a>
                  </li>
                  {LANGUAGES.map((l) => (
                    <li key={l.code}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentLang(l.code); setLangOpen(false); }}
                        className={`block px-3 py-2 text-sm ${currentLang === l.code ? 'bg-[#EBEBF2] font-semibold text-[#E5322D]' : 'text-[#33333B]'}`}
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
      </div>
    </footer>
  );
}

function DownArrow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" className={className} style={style} width="10" height="10">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l4 4m0-4L7 3" />
    </svg>
  );
}
