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
              <span className="ico ico--down" style={{ fontSize: '10px' }} />
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
                  <span className={`ico ico--${s.icon}`} style={{ fontSize: '16px' }} />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {APP_STORE_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-[#c4c4cc] transition-colors hover:text-white" aria-label={s.label}>
                  <span className={`ico ico--${s.icon}`} style={{ fontSize: '16px' }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
