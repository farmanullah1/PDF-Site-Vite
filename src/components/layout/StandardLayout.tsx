import { useState, useCallback } from 'react';
import { ToolConfig } from '../../data/toolsConfig';
import Button from '../ui/Button';
import Dropzone from '../ui/Dropzone';
import { TextField, Select, Range } from '../pdf/ToolOptionsPanel';
import PDFPreview from '../pdf/PDFPreview';
import { useNavigate } from 'react-router-dom';

interface FileItem {
  file: File;
  url: string;
  thumb?: string;
  pages?: number;
}

const ACCENT_COLORS: Record<string, string> = {
  primary: '#EE6C4D',
  secondary: '#295795',
  tertiary: '#ab6993',
  quaternary: '#B7A001',
};

export default function StandardLayout({ tool, children }: { tool: ToolConfig; children: React.ReactNode }) {
  const navigate = useNavigate();
  const accent = ACCENT_COLORS[tool.accent] || '#EE6C4D';

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); navigate('/'); }}
        className="mb-4 flex items-center gap-2 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
        aria-label="Back to tools"
      >
        ← Back to tools
        <span className="text-[#c4c4cc]">/</span>
        <span className="text-[#161616] font-medium">{tool.name}</span>
      </a>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
            style={{ background: accent }}
          >
            <ToolIcon name={tool.icon} color="#fff" size={20} />
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#161616]">{tool.name}</h1>
          {tool.status !== 'implemented' && (
            <span
              className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${
                tool.status === 'backend'
                  ? 'bg-[#ab6993]/10 text-[#ab6993]'
                  : 'bg-[#295795]/10 text-[#295795]'
              }`}
            >
              {tool.status === 'backend' ? 'Server-side' : 'Demo'}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-[0.9375rem] leading-normal text-[#47474f]">{tool.description}</p>
      </div>

      <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
        {children}
      </div>

      <p className="mt-6 text-xs text-[#47474f]">
        Your files stay in your browser. Nothing is uploaded to any server.{' '}
        <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="underline hover:text-[#161616]">
          Privacy policy
        </a>
      </p>
    </div>
  );
}

function ToolIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPath(name)}
    </svg>
  );
}

function iconPath(name: string) {
  const paths: Record<string, React.ReactNode> = {
    Merge: (
      <>
        <path d="M11 3.882V19.24a1.76 1.76 0 0 1-3.48 1.44 1.58 1.58 0 0 1-.84-2.64 6.06 6.06 0 0 1 4.08-5.63c1.24-.88 1.8-2.76 1.42-4.16Z" />
        <path d="m22.64 2.12-3.56 3.56a1.76 1.76 0 0 1-1.08.52H16.88a1.76 1.76 0 0 1-1.44-3.28V3.56a2.46 2.46 0 0 0 2.26-1.76 1.58 1.58 0 0 0-2.32 1.4 4.24 4.24 0 0 0 1.32 2c.21.42.34.88.34 1.38a6.06 6.06 0 0 1-2.92 3.92 2.6 2.6 0 0 1-3.28.72 1.56 1.56 0 0 1-.52-1.4v-.01a1.76 1.76 0 0 0 .52-.52 1.76 1.76 0 0 0-.52-1.2 1.76 1.76 0 0 0-1.2-.52Z" />
        <path d="M8.5 21.76v-1.6a4.66 4.66 0 0 1 5.24-5.24V10.5a2.16 2.16 0 0 1 4.08 1.04 1.56 1.56 0 0 1-.52 1.4v.01a1.76 1.76 0 0 1-.52.52 1.76 1.76 0 0 1-1.2-.52V11.2a6.06 6.06 0 0 0-4.08-5.63c-1.24-.88-3.02-.34-3.84.92a2.6 2.6 0 0 1-.72 3.28v5.2a2.36 2.36 0 0 0 2.26 1.76 2.6 2.6 0 0 0 1.76 2" />
      </>
    ),
    Split: <><path d="m21 16-4 4-4-4" /><path d="M17 20v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" /><path d="M7 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2" /></>,
    Remove: <><path d="M3 6h18" /><path d="M19 6v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="m8 10 6 6M14 10l-6 6" /></>,
    Extract: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M15 2v4h4" /><path d="M12 18v2" /><path d="M9 18v2" /><path d="M15 18v2" /></>,
    Organize: <><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3v5h-5" /><path d="M3 3v5h5" /><path d="M21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5" /><path d="M21 17v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5" /></>,
    Scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 11h8" /><path d="M8 15h5" /></>,
    Compress: <><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></>,
    Repair: <><path d="M14.5 2L20 7.5" /><path d="M3.47 20.5 12 12" /><path d="M20.5 3.5l-8.57 8.57a2 2 0 0 1-2.83 0" /><path d="M8.54 17.46a2 2 0 0 1-2.83 0" /><circle cx="12" cy="12" r="3" /></>,
    OCR: <><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 11h8" /><path d="M8 15h5" /></>,
    JpgToPdf: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
    WordToPdf: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6" /><path d="M9 11h6" /></>,
    PowerPointToPdf: <><path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" /><path d="M16 3h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4" /><rect width="12" height="4" x="8" y="10" rx="1" /><path d="M10 14h4" /></>,
    ExcelToPdf: <><path d="M1 10v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10" /><path d="M1 10h18" /><path d="M1 14h18" /><path d="M1 18h18" /></>,
    HtmlToPdf: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    PdfToJpg: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    PdfToWord: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6" /><path d="M9 11h6" /></>,
    PdfToPowerPoint: <><path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" /><path d="M16 3h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4" /><rect width="12" height="4" x="8" y="10" rx="1" /><path d="M10 14h4" /></>,
    PdfToExcel: <><path d="M3 3v18" /><path d="M6 6.5h4v4.5H6z" /><path d="M20 6.5h-4v4.5h4z" /><path d="M8 14h2v7H8z" /><path d="M14 14h2v7h-2z" /></>,
    PdfToPdfA: <><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></>,
    PdfToText: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6" /><path d="M9 11h6" /></>,
    PdfToHtml: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    PdfToMarkdown: <><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /></>,
    Edit: <><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>,
    PageNumbers: <><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /></>,
    Watermark: <><path d="M12 2a2 2 0 0 1 2 2v.5" /><path d="M12 22a2 2 0 0 1-2-2v-.5" /><path d="M2 12h.5" /><path d="M22 12h.5" /><path d="M5.6 5.6 22 22" /><path d="m22 5.6-3.4 3.4" /><path d="m5.6 18.4 16.4-16.4" /><path d="m3.2 12 3.4 3.4" /></>,
    Crop: <><path d="M6 2v12" /><path d="M2 6h12" /><path d="M14 2h8v8" /><path d="M14 2l4 4" /><path d="M13 22h8" /><path d="M21 14v8" /></>,
    Forms: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
    Unlock: <><rect width="18" height="11" x="6" y="11" rx="2" ry="2" /><path d="M10 11V5a4 4 0 0 1 8 0v6" /></>,
    Protect: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    Sign: <><path d="M12 19l-2-4" /><path d="M12 5l4 8" /><path d="M12 5l-4 8" /><path d="M12 19l6-12" /><circle cx="12" cy="12" r="10" /></>,
    Redact: <><path d="M17 12v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /><path d="M15 12a4 4 0 0 1-8 0" /></>,
    Compare: <><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3v5h-5" /><path d="M3 3v5h5" /></>,
    AI: <><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></>,
    Translate: <><path d="M10 2h10" /><path d="M14.5 2v6.5a1 1 0 0 0 2 0V2" /><path d="M12 10v5" /><path d="M8 16h8" /></>,
  };
  return paths[name] ?? <circle cx="12" cy="12" r="10" />;
}
