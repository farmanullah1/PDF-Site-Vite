import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-16 text-center sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-[#161616] transition-colors hover:opacity-80">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#e5322d"/>
          <rect x="6" y="9" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.6"/>
          <path d="M7 11h4v10H7z" fill="#fff" opacity=".95"/>
          <path d="M14 9h4v12h-4z" fill="#fff" opacity=".95"/>
          <path d="M21 13h4v8h-4z" fill="#fff" opacity=".95"/>
        </svg>
        <span className="text-[1.25rem] font-bold tracking-tight">PDF Site</span>
      </Link>
      <h1 className="mt-8 text-[1.75rem] font-semibold text-[#161616]">Sign in</h1>
      <p className="mt-2 text-[#47474f]">Sign in to your PDF Site account.</p>
      <div className="mt-6 space-y-3">
        <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
          Continue with Google
        </button>
        <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
          Continue with Apple
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-full w-full bg-[#c4c4cc]/20" />
          </div>
          <div className="relative">
            <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
              Sign in with email
            </button>
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-[#47474f]">
        This is a demo. No credentials are stored or transmitted.
      </p>
      <Link to="/signup" className="mt-4 inline-block rounded-lg border border-[#c4c4cc] bg-white px-4 py-2 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
        Create account
      </Link>
    </div>
  );
}

export function SignupPage() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-16 text-center sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-[#161616] transition-colors hover:opacity-80">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#e5322d"/>
          <rect x="6" y="9" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.6"/>
          <path d="M7 11h4v10H7z" fill="#fff" opacity=".95"/>
          <path d="M14 9h4v12h-4z" fill="#fff" opacity=".95"/>
          <path d="M21 13h4v8h-4z" fill="#fff" opacity=".95"/>
        </svg>
        <span className="text-[1.25rem] font-bold tracking-tight">PDF Site</span>
      </Link>
      <h1 className="mt-8 text-[1.75rem] font-semibold text-[#161616]">Create account</h1>
      <p className="mt-2 text-[#47474f]">Create your free PDF Site account.</p>
      <div className="mt-6 space-y-3">
        <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
          Continue with Google
        </button>
        <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
          Continue with Apple
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="h-full w-full bg-[#c4c4cc]/20" />
          </div>
          <div className="relative">
            <button className="w-full rounded-lg border border-[#c4c4cc] bg-white px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
              Sign up with email
            </button>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-[#47474f]">
        By creating an account you agree to our{' '}
        <Link to="/terms" className="underline hover:text-[#161616]">Terms of use</Link>
        {' '}and{' '}
        <Link to="/privacy" className="underline hover:text-[#161616]">Privacy policy</Link>.
      </p>
      <Link to="/login" className="mt-6 inline-block rounded-lg border border-[#c4c4cc] bg-white px-4 py-2 text-sm font-medium text-[#161616] transition-colors hover:border-[#161616]">
        Already have an account? Sign in
      </Link>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 text-left sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-[#161616] transition-colors hover:opacity-80">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="6" fill="#e5322d"/>
          <rect x="6" y="9" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.6"/>
          <path d="M7 11h4v10H7z" fill="#fff" opacity=".95"/>
          <path d="M14 9h4v12h-4z" fill="#fff" opacity=".95"/>
          <path d="M21 13h4v8h-4z" fill="#fff" opacity=".95"/>
        </svg>
        <span className="text-[1.25rem] font-bold tracking-tight">PDF Site</span>
      </Link>
      <h1 className="mt-8 text-[1.75rem] font-semibold text-[#161616]">Privacy policy</h1>
      <p className="mt-2 text-[#47474f]">Last updated: today.</p>
      <div className="mt-6 space-y-4 text-[#47474f] leading-relaxed">
        <p>
          This is a demo project for learning purposes. It is not affiliated with, endorsed by, or connected to the real iLovePDF service.
        </p>
        <p>
          When you use the tools on this site, your files are processed entirely in your browser using JavaScript libraries (pdf-lib and pdf.js). Your files are never uploaded to any server.
        </p>
        <p>
          No personal data is collected. No files are stored on this site's servers. Once you close or refresh the page, any in-memory data is gone.
        </p>
        <p>
          Because this is a static client-side demo running from your own machine, the only network requests it makes are to load the JavaScript libraries (pdf.js and pdf-lib) from a public CDN. If you prefer not to reach out to those CDNs, run the site from a fully offline copy of the libraries.
        </p>
      </div>
      <Link to="/" className="mt-8 inline-block rounded-lg bg-[#e5322d] px-4 py-2 text-sm font-medium text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}>
        Back to home
      </Link>
    </div>
  );
}
