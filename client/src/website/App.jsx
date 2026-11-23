import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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

// 6 Core Destinations
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import CareerExplorerPage from './pages/CareerExplorerPage';
import CompanyExplorerPage from './pages/CompanyExplorerPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Dedicated Platform & Technical Module Pages
import PlacementManagementPage from './pages/PlacementManagementPage';
import StudentManagementPage from './pages/StudentManagementPage';
import FacultyManagementPage from './pages/FacultyManagementPage';
import AdministrationPage from './pages/AdministrationPage';
import LmsPage from './pages/LmsPage';
import ProgrammingAssessmentPage from './pages/ProgrammingAssessmentPage';
import MockInterviewsPage from './pages/MockInterviewsPage';

export default function App() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate('/contact');
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

          {/* 2. Routes Flow with Douglus SVG Path Page Transitions */}
          <main className="flex-1 page-content" key={location.pathname}>
            <Routes>
              {/* 6 Main Destinations */}
              <Route path="/" element={<HomePage onOpenDemo={handleOpenDemo} />} />
              <Route path="/platform" element={<PlatformPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/career-explorer" element={<CareerExplorerPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/company-explorer" element={<CompanyExplorerPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/about" element={<AboutPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/contact" element={<ContactPage onOpenDemo={handleOpenDemo} />} />

              {/* Dedicated Platform & Technical Module Pages */}
              <Route path="/solutions/placement-management" element={<PlacementManagementPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/placement-management" element={<PlacementManagementPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/solutions/student-management" element={<StudentManagementPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/student-management" element={<StudentManagementPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/solutions/faculty-management" element={<FacultyManagementPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/faculty-management" element={<FacultyManagementPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/solutions/administration" element={<AdministrationPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/administration" element={<AdministrationPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/solutions/lms" element={<LmsPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/lms" element={<LmsPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/features/programming-assessment" element={<ProgrammingAssessmentPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/programming-assessment" element={<ProgrammingAssessmentPage onOpenDemo={handleOpenDemo} />} />

              <Route path="/features/mock-interviews" element={<MockInterviewsPage onOpenDemo={handleOpenDemo} />} />
              <Route path="/mock-interviews" element={<MockInterviewsPage onOpenDemo={handleOpenDemo} />} />

              {/* 404 Not Found Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
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
