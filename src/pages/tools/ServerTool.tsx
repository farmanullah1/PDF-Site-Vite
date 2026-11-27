import { useState, useCallback } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { TextField, Select } from '../../components/pdf/ToolOptionsPanel';
import { toolById, ToolConfig } from '../../data/toolsConfig';
import { downloadBlob } from '../../lib/pdf-helpers';
import { FileText, Download, X, CloudUpload } from 'lucide-react';

export interface ServerToolOption {
  key: string;
  label: string;
  type?: 'text' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

interface ServerToolProps {
  tool: { id: string; name: string; description: string; icon?: string; accent?: string };
  accept: string;
  options?: ServerToolOption[];
  maxSizeMB?: number;
}

export default function ServerTool({ tool, accept, options, maxSizeMB = 100 }: ServerToolProps) {
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  const addFile = useCallback(
    (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const ext = '.' + (f.name.includes('.') ? f.name.split('.').pop()! : '').toLowerCase();
      const ok = accept.split(',').some((a) => a.trim() === ext || f.name.toLowerCase().endsWith(a.trim().toLowerCase()) || f.type.toLowerCase().includes(a.trim().toLowerCase()));
      if (!ok) { setError('Unsupported file type.'); return; }
      if (f.size > maxSizeMB * 1024 * 1024) { setError(`File is too large (limit ${maxSizeMB} MB).`); return; }
      setFile({ file: f, url: URL.createObjectURL(f) });
      setError(null);
      setDone(null);
    },
    [accept, maxSizeMB]
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setValues({});
    setError(null);
    setDone(null);
  }, [file]);

  const doProcess = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const form = new FormData();
      form.append('file', file.file);
      form.append('action', tool.id);
      for (const [k, v] of Object.entries(values)) form.append(k, v);
      const res = await fetch(`/api/process?action=${encodeURIComponent(tool.id)}`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const ct = res.headers.get('content-type') || '';
      const name = res.headers.get('x-output-filename') || `${tool.id}-result`;
      const blob = await res.blob();
      if (ct.startsWith('application/json')) {
        const j = await blob.text();
        throw new Error(j || 'Processing failed.');
      }
      downloadBlob(blob, name);
      setDone({ name, size: blob.size });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Processing failed.') + ' (Your file is deleted from the server after processing.)');
    } finally {
      setLoading(false);
    }
  }, [file, tool.id, values]);

  const ready = file !== null && !loading;

  return (
    <StandardLayout tool={tool as unknown as ToolConfig}>
      <div className="mb-5">
        <Dropzone
          accept={accept}
          maxSizeMB={maxSizeMB}
          multiple={false}
          label={`Select file to ${tool.name.toLowerCase()}`}
          helper="Processed on the server and deleted shortly after."
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
                <span className="text-xs text-[#47474f]">{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      {options && options.length > 0 && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-[card]">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Options</h3>
            <div className="flex flex-col gap-4">
              {options.map((o) => (
                <div key={o.key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#161616]">{o.label}</label>
                  {o.type === 'select' ? (
                    <Select
                      label=""
                      value={values[o.key] ?? o.options?.[0]?.value ?? ''}
                      onChange={(v) => setValues((prev) => ({ ...prev, [o.key]: v }))}
                      options={o.options ?? []}
                    />
                  ) : (
                    <TextField
                      label=""
                      value={values[o.key] ?? ''}
                      onChange={(v) => setValues((prev) => ({ ...prev, [o.key]: v }))}
                      placeholder={o.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={doProcess}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <CloudUpload size={16} className="animate-spin" />
              Processing on server…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CloudUpload size={15} />
              {`${tool.name} (server)`}
            </span>
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        {done && (
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-3 text-xs text-[#47474f]">
            Processed. Result downloaded: {done.name} ({Math.round(done.size / 1024)} KB).
          </div>
        )}
        <p className="text-xs text-[#47474f]">
          Uploaded files are processed on the server and automatically removed after a short retention period.
        </p>
      </div>
    </StandardLayout>
  );
}
