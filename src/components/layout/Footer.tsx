import { useState } from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'Product', links: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Tools', href: '/help/documentation' },
    { label: 'FAQ', href: '/help/faq' },
  ]},
  { label: 'Resources', links: [
    { label: 'iLovePDF Desktop', href: '/desktop' },
    { label: 'iLovePDF Mobile', href: '/mobile' },
    { label: 'iLoveSign', href: 'https://www.ilovesign.com', external: true },
    { label: 'iLoveAPI', href: 'https://www.iloveapi.com', external: true },
    { label: 'iLoveIMG', href: 'https://www.iloveimg.com', external: true },
  ]},
  { label: 'Solutions', links: [
    { label: 'Business', href: '/business' },
    { label: 'Education', href: '/education' },
  ]},
  { label: 'Legal', links: [
    { label: 'Security', href: '/help/security' },
    { label: 'Privacy policy', href: '/help/privacy' },
    { label: 'Terms & conditions', href: '/help/terms' },
    { label: 'Cookies', href: '/help/cookies' },
  ]},
  { label: 'Company', links: [
    { label: 'About us', href: '/help/about' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
  ]},
];

const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com/ilovepdf_com' },
  { label: 'Facebook', href: 'https://www.facebook.com/ilovepdfcom-238648522858564/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ilovepdf/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ilovepdf_official/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@ilovepdf_official/' },
  { label: 'Reddit', href: 'https://www.reddit.com/r/ilovepdf/' },
];

const APP_STORE_LINKS = [
  { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.ilovepdf.www' },
  { label: 'App Store', href: 'https://itunes.apple.com/app/ilovepdf/id1207332399?mt=8' },
  { label: 'Mac Store', href: 'https://apps.apple.com/app/ilovepdf-pdf-editor-scan/id1207332399?mt=8' },
  { label: 'Microsoft Store', href: 'ms-windows-store://pdp/?productid=9NLVZBZ2WZ28' },
];

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

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

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
                      onClick={(e) => { if (!l.external) e.preventDefault(); }}
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

      <div className="footer-apps">
        <div className="app-badges">
          {APP_STORE_LINKS.map((a) => (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="app-badge" aria-label={a.label}>
              <span className="app-badge-icon" aria-hidden="true">📱</span>
              <span>{a.label}</span>
            </a>
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
          <div className="footer-copy">© PDF Site 2026 ® - Your PDF Editor</div>
          <div className="footer-social">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label={s.label}>
                <SocialIcon name={s.label.toLowerCase()} />
              </a>
            ))}
          </div>
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
                      href="/"
                      className={`block px-3 py-2 text-sm ${currentLang === 'en' ? 'bg-[#EBEBF2] font-semibold text-[#E5322D]' : 'text-[#33333B]'}`}
                      onClick={() => { setCurrentLang('en'); setLangOpen(false); }}
                    >
                      English
                    </a>
                  </li>
                  {LANGUAGES.map((l) => (
                    <li key={l.code}>
                      <a
                        href={`/${l.code}`}
                        className={`block px-3 py-2 text-sm ${currentLang === l.code ? 'bg-[#EBEBF2] font-semibold text-[#E5322D]' : 'text-[#33333B]'}`}
                        onClick={() => { setCurrentLang(l.code); setLangOpen(false); }}
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

type IconProps = { className?: string; style?: React.CSSProperties };

function DownArrow({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" fill="none" className={className} style={style} width="10" height="10">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l4 4m0-4L7 3" />
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c4 12 20 12 20 0a6.2 6.2 0 0 0 2-4 20 20 0 0 0-1-3" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <rect width="20" height="20" x="2" y="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" rx="5" ry="5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5L12 2z" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    reddit: (
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12l2 4 2-4M22 12l-2 4-2-4M12 2v8m0 8V22M4 12h16" />
      </svg>
    ),
  };
  return icons[name] || <span>{name}</span>;
}
