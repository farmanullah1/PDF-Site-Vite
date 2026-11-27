import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toolById } from '../data/toolsConfig';
import MergePDF from './tools/MergePDF';
import SplitPDF from './tools/SplitPDF';
import RotatePDF from './tools/RotatePDF';
import JPGToPDF from './tools/JPGToPDF';
import PDFToJPG from './tools/PDFToJPG';
import AddWatermark from './tools/AddWatermark';
import UnlockPDF from './tools/UnlockPDF';
import CompressPDF from './tools/CompressPDF';
import OptimizePDF from './tools/OptimizePDF';
import SignPDF from './tools/SignPDF';
import RemovePages from './tools/RemovePages';
import ExtractPages from './tools/ExtractPages';
import OrganizePDF from './tools/OrganizePDF';
import AddPageNumbers from './tools/AddPageNumbers';
import EditPDF from './tools/EditPDF';
import CropPDF from './tools/CropPDF';
import RedactPDF from './tools/RedactPDF';
import OCRPDF from './tools/OCRPDF';
import PdfToText from './tools/PdfToText';
import PdfToMarkdown from './tools/PdfToMarkdown';
import PdfToHtml from './tools/PdfToHtml';
import HtmlToPdf from './tools/HtmlToPdf';
import PdfForms from './tools/PdfForms';
import ComparePDF from './tools/ComparePDF';
import RepairPDF from './tools/RepairPDF';
import ServerTool from './tools/ServerTool';
import ComingSoon from './tools/ComingSoon';
import ScanPDF from './tools/ScanPDF';
import type { ServerToolOption } from './tools/ServerTool';

const CLIENT_COMPONENTS: Record<string, React.ComponentType> = {
  'merge-pdf': MergePDF,
  'split-pdf': SplitPDF,
  'rotate-pdf': RotatePDF,
  'jpg-to-pdf': JPGToPDF,
  'pdf-to-jpg': PDFToJPG,
  'add-watermark': AddWatermark,
  'unlock-pdf': UnlockPDF,
  'compress-pdf': CompressPDF,
  'sign-pdf': SignPDF,
  'remove-pages': RemovePages,
  'extract-pages': ExtractPages,
  'organize-pdf': OrganizePDF,
  'add-page-numbers': AddPageNumbers,
  'edit-pdf': EditPDF,
  'crop-pdf': CropPDF,
  'redact-pdf': RedactPDF,
  'ocr-pdf': OCRPDF,
  'pdf-to-text': PdfToText,
  'pdf-to-markdown': PdfToMarkdown,
  'pdf-to-html': PdfToHtml,
  'pdf-forms': PdfForms,
  'optimize-pdf': OptimizePDF,
  'compare-pdf': ComparePDF,
  'repair-pdf': RepairPDF,
  'html-to-pdf': HtmlToPdf,
  'scan-pdf': ScanPDF,
};

// Backend-dependent tools rendered via ServerTool. Requires the Express server (see server/).
const BACKEND_TOOL_IDS = new Set([
  'protect-pdf',
  'word-to-pdf',
  'excel-to-pdf',
  'powerpoint-to-pdf',
  'pdf-to-word',
  'pdf-to-excel',
  'pdf-to-powerpoint',
  'pdf-to-pdfa',
  'ai-summarizer',
  'translate-pdf',
]);

export default function ToolPage() {
  const { pathname } = useLocation();
  // Convert underscore route to hyphenated tool ID (e.g., /merge_pdf -> merge-pdf)
  const routeId = pathname.replace(/^\//, '').replace(/_/g, '-');
  const tool = useMemo(() => (routeId ? toolById(routeId) : undefined), [routeId]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-[1.75rem] font-semibold text-[#161616]">Tool not found</h1>
        <p className="mt-3 text-[#47474f]">This tool page doesn't exist yet.</p>
        <a href="/" className="mt-4 inline-flex items-center rounded-lg bg-[#EE6C4D] px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_6px_rgba(238,108,77,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(238,108,77,0.32)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(128deg, #FF7651 0%, #EE6C4D 100%)' }}>
          Back to home
        </a>
      </div>
    );
  }

  const Component = CLIENT_COMPONENTS[tool.id];
  if (Component) return <Component />;

  if (BACKEND_TOOL_IDS.has(tool.id)) {
    const accept = '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.html,.htm';
    let opts: ServerToolOption[] | undefined;
    if (tool.id === 'protect-pdf') {
      opts = [{ key: 'password', label: 'Password', type: 'text', placeholder: 'Enter the PDF password' }];
    }
    return <ServerTool tool={tool} accept={accept} options={opts} />;
  }

  return <ComingSoon tool={tool} />;
}
