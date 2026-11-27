import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField, Select } from '../../components/pdf/ToolOptionsPanel';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FileText, Download, X, FileText as FileIcon, CheckSquare, List, Clock } from 'lucide-react';

const tool = toolById('pdf-forms')!;

type FormFieldInfo = {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'other';
  value: string;
  options: string[];
};
export default function PdfForms() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 100 * 1024 * 1024) { setError('File is too large (limit 100 MB).'); return; }
      setFile({ file: f, url: URL.createObjectURL(f), pages: 0 });
      setError(null);
      setResult(null);
      setFields([]);
      setValues({});
      try {
        const buf = await readFileAsArrayBuffer(f);
        const n = await pdfPageCount(new Uint8Array(buf));
        setFile((p) => (p && p.file === f ? { ...p, pages: n } : p));

        // inspect form fields
        const PDFLib = await getPdfLib();
        const doc = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
        const form = doc.getForm();
        const pdfFields = form.getFields();
        const infos: FormFieldInfo[] = [];
        for (const fld of pdfFields) {
          const name = fld.getName();
          const type = fld.constructor.name;
          if (type === 'PDFTextField') {
            const tf = fld as unknown as { getText: () => string | undefined };
            infos.push({ name, type: 'text', value: tf.getText() ?? '', options: [] });
          } else if (type === 'PDFCheckBox') {
            const cb = fld as unknown as { isChecked: () => boolean };
            infos.push({ name, type: 'checkbox', value: cb.isChecked() ? 'true' : 'false', options: [] });
          } else if (type === 'PDFDropdown') {
            const dd = fld as unknown as { getOptions: () => string[]; getSelected: () => string | undefined };
            const opts = dd.getOptions();
            const sel = dd.getSelected() ?? '';
            infos.push({ name, type: 'dropdown', value: sel, options: opts });
          } else {
            infos.push({ name, type: 'other', value: '', options: [] });
          }
        }
        setFields(infos);
        const initial: Record<string, string> = {};
        for (const info of infos) initial[info.name] = info.value;
        setValues(initial);
      } catch (e) {
        setError((e instanceof Error ? e.message : 'Could not read form fields.') + ' (Your file stays private.)');
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setFields([]);
    setValues({});
    setResult(null);
    setError(null);
  }, [file]);

  const doFill = useCallback(async () => {
    if (!file) return;
    if (fields.length === 0) { setError('This PDF has no fillable form fields.'); return; }
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const doc = await PDFLib.PDFDocument.load(new Uint8Array(buf), { ignoreEncryption: true });
      const form = doc.getForm();

      for (const info of fields) {
        const val = values[info.name] ?? '';
        if (info.type === 'text') {
          const tf = form.getTextField(info.name);
          tf.setText(val);
        } else if (info.type === 'checkbox') {
          const cb = form.getCheckBox(info.name);
          if (val === 'true') cb.check(); else cb.uncheck();
        } else if (info.type === 'dropdown') {
          const dd = form.getDropdown(info.name);
          if (val && info.options.includes(val)) {
            dd.select(val);
          }
        }
      }
      form.updateFieldAppearances();

      const bytes = await doc.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-filled.pdf';
      setResult({ blob, name });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Form filling failed.') + ' (Your file stays private.)');
    } finally {
      setLoading(false);
    }
  }, [file, fields, values]);

  const ready = file !== null && fields.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Form filled</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          Filled {fields.length} form field{fields.length === 1 ? '' : 's'} and saved as a new PDF.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download filled PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Processed entirely in your browser via pdf-lib AcroForm. Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Dropzone
          accept=".pdf,application/pdf"
          maxSizeMB={100}
          multiple={false}
          label="Select a fillable PDF form"
          helper="One file at a time. Works best on PDFs with AcroForm fields."
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        />
      </div>

      {file && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5322d]/10 text-[#e5322d]">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-[#161616]">{file.file.name}</span>
                <span className="text-xs text-[#47474f]">{file.pages} page{file.pages === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      {fields.length > 0 && (
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
          <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Fill form fields ({fields.length})</h3>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="rounded border border-[#c4c4cc]/50 p-3 bg-[#f5f5fa]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#161616]">{field.name}</label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e8e8ed] text-[#47474f] capitalize">
                    {field.type}
                  </span>
                </div>
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={values[field.name] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder="Enter text"
                    className="w-full rounded-lg border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]"
                  />
                )}
                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values[field.name] === 'true'}
                      onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.checked ? 'true' : 'false' }))}
                      className="rounded border-[#c4c4cc] bg-[#f5f5fa] text-[#e5322d] focus:ring-[#e5322d] h-4 w-4"
                    />
                    <span className="text-sm text-[#161616]">Checked</span>
                  </div>
                )}
                {field.type === 'dropdown' && (
                  <Select
                    label=""
                    value={values[field.name] ?? ''}
                    onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                    options={field.options.map((o) => ({ value: o, label: o }))}
                  />
                )}
                {field.type === 'other' && (
                  <span className="text-xs text-[#47474f] italic">Unsupported field type — skipped.</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {fields.length === 0 && file && (
        <div className="mb-5 rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-5 text-center">
          <p className="text-sm text-[#47474f]">This PDF has no fillable AcroForm fields.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doFill}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Clock size={16} className="animate-spin" />
              Filling form…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileIcon size={15} />
              Fill & Download
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Fills AcroForm text fields, checkboxes, and dropdowns in your browser via pdf-lib. Scanned or non-interactive PDFs have no form fields to fill.
        </p>
      </div>
    </StandardLayout>
  );
}
