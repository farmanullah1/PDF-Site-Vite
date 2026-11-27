import { X } from 'lucide-react';
import Button from '../ui/Button';

interface SuccessScreenProps {
  title: string;
  subtitle: string;
  fileName: string;
  fileSize?: number;
  pageCount?: number;
  onDownload: () => void;
  onStartOver: () => void;
  downloadLabel?: string;
  note?: string;
}

export default function SuccessScreen({
  title,
  subtitle,
  fileName,
  fileSize,
  pageCount,
  onDownload,
  onStartOver,
  downloadLabel = 'Download result',
  note,
}: SuccessScreenProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
        <h2 className="text-[1.25rem] font-semibold text-[#161616]">{title}</h2>
        <button onClick={onStartOver} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
          <X size={15} /> Start over
        </button>
      </div>

      {subtitle && <p className="mb-4 text-sm text-[#47474f]">{subtitle}</p>}

      {fileSize !== undefined || pageCount !== undefined ? (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-4">
            <span className="text-xs text-[#47474f]">Original</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[1.5rem] font-semibold text-[#161616]">
                {fileSize !== undefined ? (fileSize / 1024 / 1024).toFixed(2) : '—'} MB
              </span>
              {pageCount !== undefined && (
                <span className="text-xs text-[#47474f]">{pageCount} page{pageCount === 1 ? '' : 's'}</span>
              )}
            </div>
          </div>
          <div className="rounded-xl border-2 border-[#e5322d] bg-[#fbeae7] p-4">
            <span className="text-xs font-semibold text-[#c92a24]">Result</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[1.5rem] font-semibold text-[#c92a24]">{fileName}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <Button onClick={onDownload} className="w-full">
          {downloadLabel}
        </Button>
        {note && (
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            {note}
          </div>
        )}
      </div>
    </>
  );
}
