import { useState, useCallback, useEffect, useRef } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, pdfPageCount, inspectPdfSecurity } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument } from 'pdf-lib';
import { LockOpen, Lock, Download, X, EyeOff } from 'lucide-react';

const tool = toolById('unlock-pdf')!;

export default function UnlockPDF() {
  const [file, setFile] = useState<{ file: File; url: string; pages: number } | null>(null);
  const [encrypted, setEncrypted] = useState<boolean | null>(null);
  const [userProtected, setUserProtected] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
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
      setEncrypted(null);
      setUserProtected(null);
      setPassword('');
      setShowPasswordInput(false);
      setResult(null);
      setError(null);
      try {
        const count = await pdfPageCount(new Uint8Array(await readFileAsArrayBuffer(f)));
        setFile((p) => (p && p.file === f ? { ...p, pages: count } : p));
        const sec = await inspectPdfSecurity(new Uint8Array(await readFileAsArrayBuffer(f)));
        setEncrypted(sec.encrypted);
        setUserProtected(sec.userProtected);
        if (sec.encrypted) {
          setShowPasswordInput(true);
        }
      } catch (e) {
        setError(`Could not read ${f.name}.`);
      }
    },
    []
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setEncrypted(null);
    setUserProtected(null);
    setPassword('');
    setShowPasswordInput(false);
    setResult(null);
    setError(null);
  }, [file]);

  const doUnlock = useCallback(async () => {
    if (!file) return;
    if (showPasswordInput && !password) {
      setError('Please enter the PDF password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const buf = await readFileAsArrayBuffer(file.file);
      const PDFLib = await getPdfLib();
      const loadOpts: { ignoreEncryption: boolean } & { password?: string } = { ignoreEncryption: true };
      if (showPasswordInput && password) {
        loadOpts.password = password;
      }
      const doc = await PDFLib.PDFDocument.load(new Uint8Array(buf), loadOpts);
      // re-saving removes encryption / permissions (pdf-lib does not preserve encryption on save)
      const bytes = await doc.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      const name = file.file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf';
      setResult({ blob, name });
    } catch (e) {
      if ((e instanceof Error) && (e.message.includes('password') || e.message.includes('wrong') || e.message.includes('Invalid'))) {
        setError('That password didn\'t work. Please try again.');
      } else {
        setError((e instanceof Error ? e.message : 'Unlock failed.') + ' (Your file stays private.)');
      }
    } finally {
      setLoading(false);
    }
  }, [file, password, showPasswordInput]);

  const ready = file !== null && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Your PDF is now unrestricted</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          {file!.pages} page{file!.pages === 1 ? '' : 's'} saved without encryption or restrictions.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download unrestricted PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Processed entirely in your browser. Nothing was uploaded. Only remove restrictions from documents you own.
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
          label="Select the PDF to unlock"
          helper="Upload a PDF you have the right to modify"
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
                <LockOpen size={16} />
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

          {encrypted === null ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] px-3 py-2 text-sm text-[#47474f]">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#c4c4cc] border-t-[#e5322d]" />
              Checking security…
            </div>
          ) : encrypted ? (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#e5322d] bg-[#fbeae7] px-3 py-2 text-sm">
              <Lock size={18} className="text-[#c92a24]" />
              <span className="text-[#c92a24]">This PDF is encrypted.</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#4a7aab] bg-[#eef4fb] px-3 py-2 text-sm">
              <EyeOff size={18} className="text-[#4a7aab]" />
              <span className="text-[#4a7aab]">This PDF is not encrypted.</span>
            </div>
          )}
        </div>
      )}

      {showPasswordInput && encrypted && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Enter the PDF password</h3>
            <p className="mb-4 text-sm text-[#47474f]">
              To remove the restrictions, we need to open the PDF with its password.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#161616]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF password"
                  className="rounded-lg border border-[#c4c4cc] bg-white px-3 py-2 text-sm text-[#161616] placeholder-[#9a9aa0] outline-none focus:border-[#e5322d] focus:ring-1 focus:ring-[#e5322d]"
                  autoFocus
                />
              </div>
              <button
                onClick={doUnlock}
                disabled={!password.trim()}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Removing restrictions…
                  </span>
                ) : (
                  'Remove restrictions'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {encrypted === false && file && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">This file is already unrestricted</h3>
            <p className="mb-4 text-sm text-[#47474f]">
              This PDF has no password or restrictions. You can still download a fresh copy below.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={async () => {
                  try {
                    const buf = await readFileAsArrayBuffer(file.file);
                    const bytes = bytesToBlob(new Uint8Array(buf), 'application/pdf');
                    downloadBlob(bytes, file.file.name);
                  } catch {}
                }}
                className="btn-primary w-full"
              >
                Download a copy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Unlock only works on PDFs that are encrypted with a user password. It does not recover lost passwords.
        </p>
      </div>
    </StandardLayout>
  );
}
