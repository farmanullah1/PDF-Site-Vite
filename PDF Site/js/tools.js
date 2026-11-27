/* ===== tool catalog + homepage ===== */

import { renderCategoryNav, renderToolGrid, renderFilterRow, wireFilterPills } from './app.js';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'organize', label: 'Organize PDF' },
  { id: 'optimize', label: 'Optimize PDF' },
  { id: 'convert', label: 'Convert PDF' },
  { id: 'edit', label: 'Edit PDF' },
  { id: 'security', label: 'PDF Security' },
];

/* Original placeholder catalog. Pattern mirrors a tool-directory homepage; copy is ours. */
const TOOLS = [
  { id: 'merge', category: 'organize', title: 'Merge PDF', summary: 'Combine several PDFs in the order you choose, then download the result.', mark: 'M' },
  { id: 'split', category: 'organize', title: 'Split PDF', summary: 'Pull out specific pages or page ranges into their own files.', mark: 'S' },
  { id: 'organize', category: 'organize', title: 'Organize pages', summary: 'Sort, rotate, or drop individual pages in a PDF.', mark: 'O' },
  { id: 'compress', category: 'optimize', title: 'Compress PDF', summary: 'Shrink file size. Real compression is server-side — this demo explains the limit.', mark: 'C' },
  { id: 'rotate', category: 'edit', title: 'Rotate PDF', summary: 'Spin selected pages the way you need them.', mark: 'R' },
  { id: 'numbers', category: 'edit', title: 'Add page numbers', summary: 'Stamp page numbers onto your pages with simple position choices.', mark: '#' },
  { id: 'watermark', category: 'edit', title: 'Add watermark', summary: 'Stamp text across pages so documents carry a visible mark.', mark: 'W' },
  { id: 'unlock', category: 'security', title: 'Unlock PDF', summary: 'Read-only check: see whether a PDF is encrypted and what permissions it reports.', mark: 'U' },
  { id: 'pdf-to-jpg', category: 'convert', title: 'PDF to JPG', summary: 'Turn each PDF page into a downloadable JPG image.', mark: 'J' },
  { id: 'jpg-to-pdf', category: 'convert', title: 'JPG to PDF', summary: 'Bundle images into a single PDF. Placeholder page for this demo.', mark: '>' },
  { id: 'pdf-to-word', category: 'convert', title: 'PDF to Word', summary: 'Convert PDF to an editable document. Labeled stub — server-side feature, not implemented here.', mark: 'W' },
  { id: 'word-to-pdf', category: 'convert', title: 'Word to PDF', summary: 'Turn Word documents into PDF. Placeholder page for this demo.', mark: '>' },
];

const TOOL_URLS = {
  merge: 'tools/merge.html',
  split: 'tools/split.html',
  organize: 'tools/organize.html',
  compress: 'tools/compress.html',
  rotate: 'tools/rotate.html',
  numbers: 'tools/numbers.html',
  watermark: 'tools/watermark.html',
  unlock: 'tools/unlock.html',
  'pdf-to-jpg': 'tools/pdf-to-jpg.html',
  'jpg-to-pdf': 'tools/jpg-to-pdf.html',
  'pdf-to-word': 'tools/pdf-to-word.html',
  'word-to-pdf': 'tools/word-to-pdf.html',
};

function renderHomepage() {
  renderCategoryNav(CATEGORIES);
  renderFilterRow(CATEGORIES, (id) => {
    renderToolGrid(TOOLS, TOOL_URLS, id === 'all' ? null : id);
  });
  wireFilterPills(CATEGORIES, (active) => {
    renderToolGrid(TOOLS, TOOL_URLS, active === 'all' ? null : active);
  });
}

document.addEventListener('DOMContentLoaded', renderHomepage);
