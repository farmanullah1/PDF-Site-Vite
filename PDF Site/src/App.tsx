import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import Home from './pages/Home';

export default function App() {
  return (
    <>
      <Header />
      <MobileNav />
      <main>
        <Home />
      </main>
      <Footer />
    </>
  );
}
