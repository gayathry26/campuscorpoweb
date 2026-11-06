import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';
import ScrollManager from './components/ScrollManager';
import IntroAnimation from './components/IntroAnimation';

// 6 Core Destinations
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import CareerExplorerPage from './pages/CareerExplorerPage';
import CompanyExplorerPage from './pages/CompanyExplorerPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const location = useLocation();

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

        {/* 2. Routes Flow with Smooth Page Transitions */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* 6 Main Destinations */}
              <Route path="/" element={<HomePage onOpenDemo={handleOpenDemo} />} />
              <Route path="/platform" element={<PlatformPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/career-explorer" element={<CareerExplorerPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/company-explorer" element={<CompanyExplorerPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/about" element={<AboutPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/contact" element={<ContactPage onOpenDemo={handleOpenDemo} />} />

              {/* Seamless Redirects for Consolidated Platform Modules */}
              <Route path="/solutions/placement-management" element={<Navigate to="/platform#placement" replace />} />
              <Route path="/solutions/student-management" element={<Navigate to="/platform#student-management" replace />} />
              <Route path="/solutions/faculty-management" element={<Navigate to="/platform#faculty-management" replace />} />
              <Route path="/solutions/administration" element={<Navigate to="/platform#administration" replace />} />
              <Route path="/solutions/lms" element={<Navigate to="/platform#lms" replace />} />
              <Route path="/features/programming-assessment" element={<Navigate to="/platform#coding-assessment" replace />} />
              <Route path="/features/mock-interviews" element={<Navigate to="/platform#mock-interviews" replace />} />

              {/* 404 Not Found Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* 3. Global Footer */}
        <Footer onReplayIntro={handleReplayIntro} />
      </div>

      {/* 4. Interactive Institutional Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseDemo} />
    </div>
  );
}
