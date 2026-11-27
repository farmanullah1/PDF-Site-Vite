import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, SignupPage, PrivacyPage } from './pages/AccountPages';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Client-side (real) processing tools */}
          <Route path="/merge-pdf" element={<ToolPage />} />
          <Route path="/split-pdf" element={<ToolPage />} />
          <Route path="/rotate-pdf" element={<ToolPage />} />
          <Route path="/jpg-to-pdf" element={<ToolPage />} />
          <Route path="/pdf-to-jpg" element={<ToolPage />} />
          <Route path="/add-watermark" element={<ToolPage />} />
          <Route path="/unlock-pdf" element={<ToolPage />} />
          <Route path="/compress-pdf" element={<ToolPage />} />
          <Route path="/sign-pdf" element={<ToolPage />} />
          <Route path="/remove-pages" element={<ToolPage />} />
          <Route path="/extract-pages" element={<ToolPage />} />
          <Route path="/organize-pdf" element={<ToolPage />} />
          <Route path="/add-page-numbers" element={<ToolPage />} />
          <Route path="/edit-pdf" element={<ToolPage />} />
          <Route path="/crop-pdf" element={<ToolPage />} />
          <Route path="/redact-pdf" element={<ToolPage />} />
          <Route path="/ocr-pdf" element={<ToolPage />} />
          <Route path="/optimize-pdf" element={<ToolPage />} />
          {/* Server-side tools (require backend binaries) */}
          <Route path="/protect-pdf" element={<ToolPage />} />
          <Route path="/word-to-pdf" element={<ToolPage />} />
          <Route path="/excel-to-pdf" element={<ToolPage />} />
          <Route path="/powerpoint-to-pdf" element={<ToolPage />} />
          <Route path="/pdf-to-word" element={<ToolPage />} />
          <Route path="/pdf-to-excel" element={<ToolPage />} />
          <Route path="/pdf-to-powerpoint" element={<ToolPage />} />
          <Route path="/html-to-pdf" element={<ToolPage />} />
          <Route path="/pdf-to-pdfa" element={<ToolPage />} />
          <Route path="/pdf-to-markdown" element={<ToolPage />} />
          <Route path="/repair-pdf" element={<ToolPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
