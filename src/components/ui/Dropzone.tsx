import { useCallback, useState } from 'react';

interface DropzoneProps {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  label?: string;
  helper?: string;
  onFiles: (files: File[]) => void;
  onError?: (errors: string[]) => void;
  fileCount?: number;
  children?: React.ReactNode;
  fileInputRef?: { current: HTMLInputElement | null };
}

export default function Dropzone({
  accept = '.pdf',
  maxSizeMB = 100,
  multiple = true,
  label = 'Select PDF files',
  helper = 'Add files or drag and drop them here',
  onFiles,
  onError,
  fileCount = 0,
  children,
  fileInputRef,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = useCallback(
    (files: File[]): File[] => {
      const valid: File[] = [];
      const errors: string[] = [];
      for (const f of files) {
        const ext = '.' + (f.name.includes('.') ? f.name.split('.').pop()! : '');
        const ac = accept.split(',').map((s) => s.trim());
        const typeOk = ac.some(
          (a) => a === '.' || f.type.toLowerCase().includes(a.toLowerCase()) || f.name.toLowerCase().endsWith(a.toLowerCase())
        );
        if (!typeOk) {
          errors.push(`${f.name} is not supported.`);
          continue;
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${f.name} is too large (max ${maxSizeMB} MB).`);
          continue;
        }
        valid.push(f);
      }
      if (errors.length) {
        setValidationError(errors[0]);
        onError?.(errors);
      } else {
        setValidationError(null);
      }
      return valid;
    },
    [accept, maxSizeMB, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files || []);
      onFiles(validate(files));
    },
    [onFiles, validate]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // only clear when leaving the zone itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      onFiles(validate(files));
      e.target.value = '';
    },
    [onFiles, validate]
  );

  const inputRef = { current: null as HTMLInputElement | null };

  return (
    <div
      className={`dropzone ${dragging ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
      />
      <div className="flex flex-col items-center gap-3">
        <DropzoneIcon dragging={dragging} />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[1.125rem] font-medium text-[#161616]">{label}</span>
          <span className="text-[0.875rem] text-[#47474f]">{helper}</span>
        </div>
        {fileCount > 0 && (
          <span className="rounded-full bg-[#e5322d] px-3 py-1 text-xs font-semibold text-white">
            {fileCount} file{fileCount === 1 ? '' : 's'} selected
          </span>
        )}
        {validationError && (
          <span className="text-xs text-[#c92a24] font-medium mt-1">{validationError}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function DropzoneIcon({ dragging }: { dragging: boolean }) {
  return (
    <svg
      className="h-12 w-12"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ color: dragging ? '#c92a24' : '#c4c4cc' }}
    >
      <path
        d="M8 12v24a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 18v15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="11" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
