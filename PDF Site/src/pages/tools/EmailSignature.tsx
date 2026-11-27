import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import { Field } from '../../components/pdf/Field';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileText, Download, X, Smile } from 'lucide-react';

const tool = toolById('email-signature')!;

export default function EmailSignature() {
  const [file, setFile] = useState<{ file: File; name: string } | null>(null);
  const [fields, setFields] = useState({ name: '', title: '', company: '', phone: '', email: '', color: '#161616' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const handleChange = (key: keyof typeof fields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = useCallback(() => {
    setFile(null);
    setFields({ name: '', title: '', company: '', phone: '', email: '', color: '#161616' });
    setError(null);
    setResult(null);
  }, []);

  const build = useCallback(async () => {
    if (!file) return;
    if (!fields.name.trim()) { setError('Please enter at least your name.'); return; }
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const out = await PDFLib.PDFDocument.create();
      const page = out.addPage([360, 120]);
      const font = await out.embedFont(StandardFonts.Helvetica);
      const colorRgb = rgb(
        parseInt(fields.color.slice(1, 3), 16) / 255,
        parseInt(fields.color.slice(3, 5), 16) / 255,
        parseInt(fields.color.slice(5, 7), 16) / 255,
      );
      let y = 92;
      const line = (text: string, size = 12, bold = false) => {
        if (!text) return;
        const embedded = bold ? font : font;
        page.drawText(text, { x: 36, y, size, font: embedded, color: colorRgb });
        y -= size + 4;
      };
      line(fields.name, 14, true);
      if (fields.title || fields.company) line(`${fields.title}${fields.title && fields.company ? ' · ' : ''}${fields.company}`, 11);
      if (fields.email || fields.phone) line(`${fields.email}${fields.email && fields.phone ? ' · ' : ''}${fields.phone}`, 10);
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      setResult({ blob, name: (file.name.replace(/\.pdf$/i, '') || 'signature') + '-email-signature.pdf' });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Could not build the signature.') + ' (Please try again in your browser.)');
    } finally {
      setLoading(false);
    }
  }, [file, fields]);

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Email signature ready</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Saved {file?.name && `\`${file.name}\` → `}a one-page PDF you can paste into your email client or save as a note.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download signature PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Your details stay on this device. Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Field
          label="Your PDF card (optional)"
          accept=".pdf,application/pdf"
          maxSizeMB={50}
          multiple={false}
          onChange={(pdf: File | null) => {
            if (!pdf) { clearAll(); return; }
            setFile({ file: pdf, name: pdf.name });
          }}
          helper="Upload a company logo or letterhead, or leave empty for a plain signature."
          fileCount={file ? 1 : 0}
        />
      </div>

      <div className="mb-5">
        <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Signature details</h3>
          <div className="flex flex-col gap-4">
            <Field label="Your name" value={fields.name} onChange={handleChange('name')} placeholder="Sam Rivera" />
            <Field label="Job title" value={fields.title} onChange={handleChange('title')} placeholder="Head of Design" />
            <Field label="Company" value={fields.company} onChange={handleChange('company')} placeholder="Brightside Studio" />
            <Field label="Phone" value={fields.phone} onChange={handleChange('phone')} placeholder="+1 555 0123" />
            <Field label="Email" value={fields.email} onChange={handleChange('email')} placeholder="sam@brightside.studio" />
            <Field label="Accent color" value={fields.color} onChange={handleChange('color')} placeholder="#161616" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={build} disabled={!file || loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Building signature…
            </span>
          ) : (
            'Build signature PDF'
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
      </div>
    </StandardLayout>
  );
}
