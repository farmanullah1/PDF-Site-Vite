import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto h-16 w-16 rounded-full bg-[#fbeae7] p-4">
        <svg className="h-8 w-8 text-[#c92a24]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="m5 12 4 4 10-10" />
        </svg>
      </div>
      <h1 className="mt-6 text-[1.75rem] font-semibold text-[#161616]">Page not found</h1>
      <p className="mt-3 text-[#47474f]">The page you're looking for doesn't exist on this demo site.</p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-[#e5322d] px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}
        >
          Back to home
        </Link>
        <Link
          to="/merge-pdf"
          className="inline-flex items-center rounded-lg border border-[#c4c4cc] bg-white px-5 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]"
        >
          Try Merge PDF
        </Link>
      </div>
    </div>
  );
}
