interface ProcessingProgressProps {
  status: string;
  progress: number;
}

export default function ProcessingProgress({ status, progress }: ProcessingProgressProps) {
  return (
    <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#161616]">{status}</span>
        <span className="text-sm text-[#47474f]">{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#e8e8ed]">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: '#e5322d' }}
        />
      </div>
    </div>
  );
}

