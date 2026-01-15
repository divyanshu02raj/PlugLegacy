//frontend\src\App.tsx
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import GameShowcase from './components/GameShowcase';
import Stats from './components/Stats';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0e27] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <GameShowcase />
      <Stats />
      <Footer />
    </div>
  );
}

export default App;
