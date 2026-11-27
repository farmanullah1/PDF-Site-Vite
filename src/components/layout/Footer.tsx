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
  { label: 'Twitter', href: 'https://twitter.com/ilovepdf_com', icon: 'twitter' },
  { label: 'Facebook', href: 'https://www.facebook.com/ilovepdfcom-238648522858564/', icon: 'facebook' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ilovepdf/', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/ilovepdf_official/', icon: 'instagram' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@ilovepdf_official/', icon: 'tiktok' },
  { label: 'Reddit', href: 'https://www.reddit.com/r/ilovepdf/', icon: 'reddit' },
];

const APP_STORE_LINKS = [
  { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.ilovepdf.www', icon: 'google-play' },
  { label: 'App Store', href: 'https://itunes.apple.com/app/ilovepdf/id1207332399?mt=8', icon: 'app-store' },
  { label: 'Mac Store', href: 'https://apps.apple.com/app/ilovepdf-pdf-editor-scan/id1207332399?mt=8', icon: 'mac-store' },
  { label: 'Microsoft Store', href: 'ms-windows-store://pdp/?productid=9NLVZBZ2WZ28', icon: 'microsoft-store' },
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

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <footer className="bg-[#161616] text-[#c4c4cc]">
      {/* Top links */}
      <div className="px-6 py-4 sm:px-10 lg:px-14 border-b border-[#2a2a30]">
        <div className="mx-auto max-w-[1280px] flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/features" className="text-[#c4c4cc] hover:text-white">Features</Link>
            <Link to="/pricing" className="text-[#c4c4cc] hover:text-white">Pricing</Link>
            <Link to="/business" className="text-[#c4c4cc] hover:text-white">Business</Link>
            <Link to="/education" className="text-[#c4c4cc] hover:text-white">Education</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#c4c4cc]">Language</span>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2a2a30] text-[#c4c4cc]"
              aria-expanded={langOpen}
            >
              <span className="font-medium">{currentLang === 'en' ? 'English' : currentLang}</span>
              <DownArrow style={{ fontSize: '10px', color: '#c4c4cc' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-[1280px] grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
          {FOOTER_LINKS.map((col) => (
            <div key={col.label}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#c4c4cc]">{col.label}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-[#c4c4cc] transition-colors hover:text-white"
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

      {/* Bottom bar */}
      <div className="border-t border-[#2a2a30] px-6 py-4 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-[1280px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7a7a82]">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-white">
              <img src="/img/ilovepdf.svg" alt="iLovePDF" width="24" height="24" />
              <span className="text-[1.125rem] font-bold tracking-tight">iLovePDF</span>
            </Link>
            <span className="text-[#c4c4cc]">© iLovePDF 2026 ® - Your PDF Editor</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
                  {SOCIAL_LINKS.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-[#c4c4cc] transition-colors hover:text-white" aria-label={s.label}>
                      <SocialIcon name={s.icon} style={{ fontSize: '16px', color: '#c4c4cc' }} />
                    </a>
                  ))}
            </div>
            <div className="flex items-center gap-4">
              {APP_STORE_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-[#c4c4cc] transition-colors hover:text-white" aria-label={s.label}>
                  <SocialIcon name={s.icon} style={{ fontSize: '16px', color: '#c4c4cc' }} />
                </a>
              ))}
            </div>
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

function SocialIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c4 12 20 12 20 0a6.2 6.2 0 0 0 2-4 20 20 0 0 0-1-3" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <rect width="20" height="20" x="2" y="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" rx="5" ry="5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5L12 2z" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    reddit: (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12l2 4 2-4M22 12l-2 4-2-4M12 2v8m0 8V22M4 12h16" />
      </svg>
    ),
    'google-play': (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'app-store': (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <rect width="18" height="18" x="3" y="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" rx="4" ry="4" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" />
      </svg>
    ),
    'mac-store': (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <rect width="18" height="18" x="3" y="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" rx="4" ry="4" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" />
      </svg>
    ),
    'microsoft-store': (
      <svg viewBox="0 0 24 24" fill="none" className={className} style={style} width="16" height="16">
        <rect width="16" height="16" x="4" y="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path stroke="currentColor" strokeWidth="2" d="M4 12h16M12 4v16" />
      </svg>
    ),
  };
  return icons[name] || <span>{name}</span>;
}
