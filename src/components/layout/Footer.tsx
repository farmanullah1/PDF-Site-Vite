import { Link } from 'react-router-dom';
import { Twitter, Youtube, Linkedin } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'PDF tools', links: [
    { label: 'Merge PDF', href: '/merge-pdf' },
    { label: 'Split PDF', href: '/split-pdf' },
    { label: 'Compress PDF', href: '/compress-pdf' },
    { label: 'Sign PDF', href: '/sign-pdf' },
    { label: 'Unlock PDF', href: '/unlock-pdf' },
    { label: 'Protect PDF', href: '/protect-pdf' },
    { label: 'Rotate PDF', href: '/rotate-pdf' },
    { label: 'Watermark PDF', href: '/add-watermark' },
    { label: 'Crop PDF', href: '/crop-pdf' },
    { label: 'JPG to PDF', href: '/jpg-to-pdf' },
    { label: 'PDF to JPG', href: '/pdf-to-jpg' },
    { label: 'PDF to Word', href: '/pdf-to-word' },
    { label: 'PDF to PowerPoint', href: '/pdf-to-powerpoint' },
    { label: 'PDF to Excel', href: '/pdf-to-excel' },
    { label: 'Compare PDF', href: '/compare-pdf' },
    { label: 'OCR PDF', href: '/ocr-pdf' },
  ]},
  { label: 'Company', links: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Jobs', href: '/jobs' },
  ]},
  { label: 'Support', links: [
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Terms of use', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
  ]},
];

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-[#c4c4cc]">
      {/* Brand bar */}
      <div className="border-b border-[#2a2a30] px-6 py-6 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <LogoMark />
            <span className="text-[1.25rem] font-bold">iLovePDF</span>
          </Link>
          <div className="flex items-center gap-4">
            <SocialIcon icon={Twitter} label="Twitter" />
            <SocialIcon icon={Youtube} label="YouTube" />
            <SocialIcon icon={Linkedin} label="LinkedIn" />
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_LINKS.map((col) => (
            <div key={col.label}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#c4c4cc]">{col.label}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="text-sm text-[#c4c4cc] transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2a2a30] px-6 py-4 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 text-xs text-[#7a7a82] sm:flex-row">
          <span>© iLovePDF. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>iLovePDF is a demo project for learning purposes.</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e5322d]" />
              Client tools run locally in your browser. Nothing is uploaded.
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#7253e2]" />
              Server tools require a backend and are placeholders in this demo.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LogoMark() {
  return (
    <img src="/logo.svg" alt="iLovePDF logo" width="24" height="24" aria-hidden="true" />
  );
}

function SocialIcon({ icon: Icon, label }: { icon: React.ComponentType<any>; label: string }) {
  return (
    <a href={`#${label.toLowerCase()}`} aria-label={label} className="text-[#c4c4cc] transition-colors hover:text-white">
      <Icon size={18} />
    </a>
  );
}
