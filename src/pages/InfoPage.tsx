import { Link } from 'react-router-dom';

type InfoPageConfig = {
  title: string;
  description: string;
  content: React.ReactNode;
};

const INFO_PAGES: Record<string, InfoPageConfig> = {
  '/features': {
    title: 'Features',
    description: 'Everything you can do with our PDF tools.',
    content: (
      <ul className="list-disc pl-6 space-y-3 text-[#6E6E7A]">
        <li>Merge multiple PDFs into a single document.</li>
        <li>Split PDFs by page or page range.</li>
        <li>Compress PDFs to reduce file size.</li>
        <li>Convert PDFs to and from JPG, Word, PowerPoint, Excel, HTML, Markdown, and text.</li>
        <li>Add text, images, watermarks, page numbers, and annotations.</li>
        <li>Unlock, protect, sign, redact, and compare PDFs.</li>
        <li>Organize, rotate, crop, and repair PDF pages.</li>
      </ul>
    ),
  },
  '/pricing': {
    title: 'Pricing',
    description: 'Simple, transparent pricing for individuals and teams.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Client-side PDF tools are free to use in the browser.</p>
        <p>Server-side conversions and premium features require a paid plan. Visit the pricing page for current plans.</p>
        <p className="mt-4"><Link to="/contact">Contact us</Link> for volume and business licensing.</p>
      </div>
    ),
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How we handle your documents and personal data.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Client-side tools process your PDF entirely in the browser. Your documents are not uploaded to a server for those operations.</p>
        <p>Server-side tools (such as Word, Excel, PowerPoint, and PDF/A conversion) upload your file to our servers for processing. Files are retained only for the duration of processing and are deleted afterward.</p>
        <p>We do not sell your documents or use them to train models.</p>
        <p><Link to="/terms">Read our Terms of Service</Link></p>
      </div>
    ),
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'Terms governing use of this site and its tools.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>By using this site you agree to our Terms of Service.</p>
        <p>You may use the PDF tools for lawful purposes only. You retain all rights to your documents.</p>
        <p>The service is provided "as is" without warranty of conversion fidelity or availability.</p>
        <p><Link to="/privacy">Read our Privacy Policy</Link></p>
      </div>
    ),
  },
  '/security': {
    title: 'Security',
    description: 'How we keep your documents secure.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>The site is served over HTTPS.</p>
        <p>Client-side processing keeps your documents in the browser; nothing is transmitted for those tools.</p>
        <p>Server-side uploads are encrypted in transit using TLS and deleted after processing.</p>
        <p>We do not hold independent security certifications such as ISO 27001.</p>
      </div>
    ),
  },
  '/about': {
    title: 'About us',
    description: 'Who we are and what we build.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>We build simple, browser-first tools for working with PDF documents.</p>
        <p>Our goal is to make everyday PDF tasks fast, private, and accessible without installing software.</p>
      </div>
    ),
  },
  '/contact': {
    title: 'Contact',
    description: 'Get in touch with our team.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Have a question or need help? Reach us at <a href="mailto:support@example.com" className="text-[#E5322D] underline">support@example.com</a>.</p>
        <p>For business and volume licensing, visit <Link to="/business">Business</Link>.</p>
      </div>
    ),
  },
  '/faq': {
    title: 'FAQ',
    description: 'Frequently asked questions about our PDF tools.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><strong>Are the tools free?</strong> Client-side browser tools are free. Server-side conversions may require a plan.</p>
        <p><strong>Are my files private?</strong> Client-side tools never upload your file. See <Link to="/privacy">Privacy Policy</Link>.</p>
        <p><strong>Do I need to install anything?</strong> No. All tools run in the browser.</p>
      </div>
    ),
  },
  '/blog': {
    title: 'Blog',
    description: 'Tips, tutorials, and updates for working with PDFs.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>No articles published yet. Check back soon for PDF tips and tutorials.</p>
      </div>
    ),
  },
  '/desktop': {
    title: 'Desktop App',
    description: 'Work offline with our desktop application.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>The desktop app lets you process PDFs locally without an internet connection.</p>
        <p>Available for Mac and Windows.</p>
      </div>
    ),
  },
  '/mobile': {
    title: 'Mobile App',
    description: 'Your PDF tools on the go.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Use your favorite PDF tools from your phone or tablet.</p>
        <p>Available for iOS and Android.</p>
      </div>
    ),
  },
  '/business': {
    title: 'Business',
    description: 'PDF tools for your business and team workflows.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Centralized billing, team administration, and volume discounts for organizations.</p>
        <p><Link to="/contact">Contact us</Link> to learn about business plans.</p>
      </div>
    ),
  },
  '/education': {
    title: 'Education',
    description: 'PDF tools for students and educators.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Special pricing and resources for schools, students, and teachers.</p>
        <p><Link to="/contact">Contact us</Link> for education discounts.</p>
      </div>
    ),
  },
  '/press': {
    title: 'Press',
    description: 'Press materials and announcements.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>No press materials published yet. Check back soon.</p>
        <p><Link to="/contact">Contact us</Link> for press inquiries.</p>
      </div>
    ),
  },
  '/help/faq': {
    title: 'FAQ',
    description: 'Frequently asked questions.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><strong>Are the tools free?</strong> Client-side browser tools are free. Server-side conversions may require a plan.</p>
        <p><strong>Do I need to install anything?</strong> No. All tools run in the browser.</p>
      </div>
    ),
  },
  '/help/documentation': {
    title: 'Tools Documentation',
    description: 'How to use each PDF tool.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>Visit the homepage to open any tool. Each tool page includes instructions specific to that operation.</p>
      </div>
    ),
  },
  '/help/legal': {
    title: 'Legal',
    description: 'Legal policies and terms.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><Link to="/terms">Terms of Service</Link></p>
        <p><Link to="/privacy">Privacy Policy</Link></p>
      </div>
    ),
  },
  '/help/security': {
    title: 'Security',
    description: 'Security practices for document handling.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>The site is served over HTTPS. Client-side tools process files in the browser without uploading them.</p>
      </div>
    ),
  },
  '/help/privacy': {
    title: 'Privacy',
    description: 'Privacy practices for document handling.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><Link to="/privacy">Read the full Privacy Policy</Link>.</p>
      </div>
    ),
  },
  '/help/terms': {
    title: 'Terms',
    description: 'Terms of Service.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><Link to="/terms">Read the Terms of Service</Link>.</p>
      </div>
    ),
  },
  '/help/cookies': {
    title: 'Cookies',
    description: 'Cookie usage on this site.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p>We use essential cookies only to keep the site functioning. No tracking or advertising cookies are set.</p>
      </div>
    ),
  },
  '/help/about': {
    title: 'About',
    description: 'About this project.',
    content: (
      <div className="space-y-4 text-[#6E6E7A]">
        <p><Link to="/about">Visit the About page</Link>.</p>
      </div>
    ),
  },
};

export default function InfoPage({ pathname }: { pathname: string }) {
  const page = INFO_PAGES[pathname];
  if (!page) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-[1.75rem] font-semibold text-[#161616]">Page not found</h1>
        <p className="mt-3 text-[#47474f]">This page doesn't exist yet.</p>
        <Link to="/" className="mt-4 inline-flex items-center rounded-lg bg-[#E5322D] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#C92420]">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#161616]">{page.title}</h1>
      <p className="mt-3 text-[#6E6E7A]">{page.description}</p>
      <div className="mt-8 text-[#6E6E7A] leading-relaxed">{page.content}</div>
    </div>
  );
}
