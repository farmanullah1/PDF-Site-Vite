import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toolById } from '../data/toolsConfig';
import MergePDF from './tools/MergePDF';
import SplitPDF from './tools/SplitPDF';
import RotatePDF from './tools/RotatePDF';
import JPGToPDF from './tools/JPGToPDF';
import PDFToJPG from './tools/PDFToJPG';
import AddWatermark from './tools/AddWatermark';
import UnlockPDF from './tools/UnlockPDF';
import CompressPDF from './tools/CompressPDF';
import SignPDF from './tools/SignPDF';
import ComingSoon from './tools/ComingSoon';

const IMPLEMENTED_COMPONENTS: Record<string, React.ComponentType> = {
  'merge-pdf': MergePDF,
  'split-pdf': SplitPDF,
  'rotate-pdf': RotatePDF,
  'jpg-to-pdf': JPGToPDF,
  'pdf-to-jpg': PDFToJPG,
  'add-watermark': AddWatermark,
  'unlock-pdf': UnlockPDF,
  'compress-pdf': CompressPDF,
  'sign-pdf': SignPDF,
};

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = useMemo(() => (toolId ? toolById(toolId) : undefined), [toolId]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-[1.75rem] font-semibold text-[#161616]">Tool not found</h1>
        <p className="mt-3 text-[#47474f]">This tool page doesn't exist yet.</p>
        <a href="/" className="mt-4 inline-flex items-center rounded-lg bg-[#e5322d] px-5 py-2.5 text-sm font-medium text-white shadow-[0_2px_6px_rgba(229,50,45,0.25)] transition-all hover:shadow-[0_6px_14px_rgba(229,50,45,0.32)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(128deg, #ff6a58 0%, #e5322d 100%)' }}>
          Back to home
        </a>
      </div>
    );
  }

  const Component = IMPLEMENTED_COMPONENTS[tool.id];
  if (Component) {
    return <Component />;
  }

  return <ComingSoon tool={tool} />;
}
