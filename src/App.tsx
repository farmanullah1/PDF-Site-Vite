import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, SignupPage, PrivacyPage } from './pages/AccountPages';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <MobileNav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge-pdf" element={<ToolPage />} />
          <Route path="/split-pdf" element={<ToolPage />} />
          <Route path="/rotate-pdf" element={<ToolPage />} />
          <Route path="/jpg-to-pdf" element={<ToolPage />} />
          <Route path="/pdf-to-jpg" element={<ToolPage />} />
          <Route path="/add-watermark" element={<ToolPage />} />
          <Route path="/unlock-pdf" element={<ToolPage />} />
          <Route path="/compress-pdf" element={<ToolPage />} />
          <Route path="/sign-pdf" element={<ToolPage />} />
          <Route path="*" element={<ToolPage />} />
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
