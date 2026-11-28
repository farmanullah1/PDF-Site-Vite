import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, SignupPage } from './pages/AccountPages';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import InfoPage from './pages/InfoPage';
import ToolPage from './pages/ToolPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<InfoPage pathname="/features" />} />
          <Route path="/pricing" element={<InfoPage pathname="/pricing" />} />
          <Route path="/privacy" element={<InfoPage pathname="/privacy" />} />
          <Route path="/terms" element={<InfoPage pathname="/terms" />} />
          <Route path="/security" element={<InfoPage pathname="/security" />} />
          <Route path="/about" element={<InfoPage pathname="/about" />} />
          <Route path="/contact" element={<InfoPage pathname="/contact" />} />
          <Route path="/faq" element={<InfoPage pathname="/faq" />} />
          <Route path="/blog" element={<InfoPage pathname="/blog" />} />
          <Route path="/desktop" element={<InfoPage pathname="/desktop" />} />
          <Route path="/mobile" element={<InfoPage pathname="/mobile" />} />
          <Route path="/business" element={<InfoPage pathname="/business" />} />
          <Route path="/education" element={<InfoPage pathname="/education" />} />
          <Route path="/press" element={<InfoPage pathname="/press" />} />
          <Route path="/help/faq" element={<InfoPage pathname="/help/faq" />} />
          <Route path="/help/documentation" element={<InfoPage pathname="/help/documentation" />} />
          <Route path="/help/legal" element={<InfoPage pathname="/help/legal" />} />
          <Route path="/help/security" element={<InfoPage pathname="/help/security" />} />
          <Route path="/help/privacy" element={<InfoPage pathname="/help/privacy" />} />
          <Route path="/help/terms" element={<InfoPage pathname="/help/terms" />} />
          <Route path="/help/cookies" element={<InfoPage pathname="/help/cookies" />} />
          <Route path="/help/about" element={<InfoPage pathname="/help/about" />} />
          {/* Client-side (real) processing tools */}
          <Route path="/merge_pdf" element={<ToolPage />} />
          <Route path="/split_pdf" element={<ToolPage />} />
          <Route path="/jpg_to_pdf" element={<ToolPage />} />
          <Route path="/pdf_to_jpg" element={<ToolPage />} />
          <Route path="/pdf_add_watermark" element={<ToolPage />} />
          <Route path="/unlock_pdf" element={<ToolPage />} />
          <Route path="/compress_pdf" element={<ToolPage />} />
          <Route path="/sign-pdf" element={<ToolPage />} />
          <Route path="/remove-pages" element={<ToolPage />} />
          <Route path="/extract_pages" element={<ToolPage />} />
          <Route path="/organize-pdf" element={<ToolPage />} />
          <Route path="/add_pdf_page_number" element={<ToolPage />} />
          <Route path="/edit-pdf" element={<ToolPage />} />
          <Route path="/crop-pdf" element={<ToolPage />} />
          <Route path="/redact-pdf" element={<ToolPage />} />
          <Route path="/ocr-pdf" element={<ToolPage />} />
          {/* Server-side tools (require backend binaries) */}
          <Route path="/protect-pdf" element={<ToolPage />} />
          <Route path="/word_to_pdf" element={<ToolPage />} />
          <Route path="/excel_to_pdf" element={<ToolPage />} />
          <Route path="/powerpoint_to_pdf" element={<ToolPage />} />
          <Route path="/pdf_to_word" element={<ToolPage />} />
          <Route path="/pdf_to_excel" element={<ToolPage />} />
          <Route path="/pdf_to_powerpoint" element={<ToolPage />} />
          <Route path="/html-to-pdf" element={<ToolPage />} />
          <Route path="/pdf_to_pdfa" element={<ToolPage />} />
          <Route path="/pdf_to_markdown" element={<ToolPage />} />
          <Route path="/pdf_to_text" element={<ToolPage />} />
          <Route path="/pdf_to_html" element={<ToolPage />} />
          <Route path="/scan-pdf" element={<ToolPage />} />
          <Route path="/repair-pdf" element={<ToolPage />} />
          <Route path="/pdf-forms" element={<ToolPage />} />
          <Route path="/ai_summarizer" element={<ToolPage />} />
          <Route path="/translate_pdf" element={<ToolPage />} />
          <Route path="/compare-pdf" element={<ToolPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
