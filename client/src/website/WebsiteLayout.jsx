import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';
import ScrollManager from './components/ScrollManager';
import IntroAnimation from './components/IntroAnimation';
import { TransitionProvider } from './transitions/TransitionProvider';
import PageTransition from './transitions/PageTransition';
import useLenis from './hooks/useLenis';
import './styles/transitions.css';
import './page-transition.css';
import './index.css';

export default function WebsiteLayout({ children }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const location = useLocation();

  // Initialize Lenis smooth scroll synchronized with GSAP ScrollTrigger
  useLenis();

  // Show cinematic intro only on initial visit in a session, unless requested via query parameter (?intro=true)
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('intro') === 'true' || params.get('replay') === 'true') {
        return true;
      }
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
      return sessionStorage.getItem('campuscorpo_intro_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const handleOpenDemo = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseDemo = () => {
    setIsDemoModalOpen(false);
  };

  const handleReplayIntro = () => {
    try {
      sessionStorage.removeItem('campuscorpo_intro_seen');
    } catch {}
    setShowIntro(true);
  };

  return (
    <TransitionProvider>
      {/* Global Liquid Curved Black Curtain Page Transition */}
      <PageTransition />

      <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-neutral-950 selection:text-white flex flex-col justify-between relative">
        {/* 0. Cinematic Logo-to-Website Intro Transformation */}
        <AnimatePresence mode="wait">
          {showIntro && (
            <IntroAnimation
              key="campuscorpo-cinematic-intro"
              onComplete={() => setShowIntro(false)}
            />
          )}
        </AnimatePresence>

        {/* Scroll restoration and hash anchor offset alignment */}
        <ScrollManager />

        {/* Main Website Shell */}
        <div className="flex-1 flex flex-col justify-between min-h-screen">
          {/* 1. Global Navigation */}
          <Navbar onOpenDemo={handleOpenDemo} />

          {/* 2. Routes Flow with Page Transitions */}
          <main className="flex-1 page-content" key={location.pathname}>
            {children || <Outlet context={{ onOpenDemo: handleOpenDemo }} />}
          </main>

          {/* 3. Global Footer */}
          <Footer onReplayIntro={handleReplayIntro} />
        </div>

        {/* 4. Interactive Institutional Demo Modal */}
        <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemo} />
      </div>
    </TransitionProvider>
  );
}
