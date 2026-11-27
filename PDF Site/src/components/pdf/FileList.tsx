import { useCallback } from 'react';

interface FileListItem {
  file: File;
  url: string;
  pages?: number;
}

interface FileListProps {
  items: FileListItem[];
  onRemove: (file: File) => void;
}

export default function FileList({ items, onRemove }: FileListProps) {
  const handleRemove = useCallback(
    (f: File) => {
      const item = items.find((i) => i.file === f);
      if (item) URL.revokeObjectURL(item.url);
      onRemove(f);
    },
    [items, onRemove]
  );

  if (items.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-[#c4c4cc] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.file.name}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-[#c4c4cc]/50 bg-[#f5f5fa]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="truncate text-sm font-medium text-[#161616]">{item.file.name}</span>
              <span className="text-[0.75rem] text-[#47474f]">
                {(item.file.size / 1024 / 1024).toFixed(2)} MB{item.pages ? ` · ${item.pages} page${item.pages === 1 ? '' : 's'}` : ''}
              </span>
            </div>
            <button
              onClick={() => handleRemove(item.file)}
              className="rounded-lg p-1 text-[#47474f] hover:bg-[#e5322d]/10 hover:text-[#c92a24] transition-colors"
              aria-label={`Remove ${item.file.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
