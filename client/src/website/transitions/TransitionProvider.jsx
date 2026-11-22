import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useReducedMotion from '../hooks/useReducedMotion';

// Tuning constants block
export const TRANSITION_CONFIG = {
  COVER_DURATION: 0.7,      // Phase 1 duration in seconds
  HOLD_DURATION: 0.25,      // Phase 2 duration at 100% black
  REVEAL_DURATION: 0.7,     // Phase 3 duration in seconds
  CURVE_AMOUNT: 18,         // Max curve displacement
  EASE: 'power3.inOut',      // GSAP easing
};

const TransitionContext = createContext(null);

export const useTransitionContext = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransitionContext must be used within a TransitionProvider');
  }
  return context;
};

// Friendly route label mapping
export function getRouteLabel(to) {
  const path = typeof to === 'string' ? to.split(/[?#]/)[0] : to?.pathname || '';
  if (!path || path === '/') return 'CAMPUS OPERATING SYSTEM';
  if (path.startsWith('/login')) return 'PORTAL SIGN IN';
  if (path.startsWith('/profile') || path.startsWith('/dashboard') || path.startsWith('/portal')) return 'PORTAL DASHBOARD';
  if (path.startsWith('/platform')) return 'PLATFORM ARCHITECTURE';
  if (path.startsWith('/career-explorer')) return 'CAREER INTELLIGENCE';
  if (path.startsWith('/company-explorer')) return 'COMPANY DISCOVERY';
  if (path.startsWith('/about')) return 'ABOUT CAMPUSCORPO';
  if (path.startsWith('/contact')) return 'ACADEMIC RELATIONS & CONTACT';
  if (path.startsWith('/solutions/placement') || path.startsWith('/placement-management')) return 'PLACEMENT OPERATIONS';
  if (path.startsWith('/solutions/student') || path.startsWith('/student-management')) return 'STUDENT 360° MANAGEMENT';
  if (path.startsWith('/solutions/faculty') || path.startsWith('/faculty-management')) return 'FACULTY COORDINATION';
  if (path.startsWith('/solutions/admin') || path.startsWith('/administration')) return 'INSTITUTIONAL GOVERNANCE';
  if (path.startsWith('/solutions/lms') || path.startsWith('/lms')) return 'SEMESTER CLASSROOMS';
  if (path.startsWith('/features/programming') || path.startsWith('/programming-assessment')) return 'CODING ASSESSMENT SANDBOX';
  if (path.startsWith('/features/mock') || path.startsWith('/mock-interviews')) return 'MOCK INTERVIEW INTELLIGENCE';

  // Fallback: uppercased last segment with dashes replaced by spaces
  const segments = path.replace(/^\/|\/$/g, '').split('/');
  return segments[segments.length - 1].replace(/-/g, ' ').toUpperCase();
}

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeLabel, setActiveLabel] = useState('CAMPUSCORPO');
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // Internal trigger registered by PageTransition component
  const triggerPageTransitionRef = useRef(null);
  const isNavigatingRef = useRef(false);

  /**
   * Register the actual GSAP animation runner from PageTransition.jsx
   */
  const registerRunner = useCallback((runner) => {
    triggerPageTransitionRef.current = runner;
  }, []);

  /**
   * Public navigation method called by TransitionLink or programmatic code
   */
  const startTransition = useCallback(
    (to, customLabel) => {
      if (!to || isNavigatingRef.current) return;

      const targetPath = typeof to === 'string' ? to : to.pathname || '';
      const currentFull = location.pathname + location.search + location.hash;

      // Ignore if clicking the exact current URL
      if (targetPath === currentFull || targetPath === location.pathname) {
        return;
      }

      const label = customLabel || getRouteLabel(targetPath);
      setActiveLabel(label);

      // Handle prefers-reduced-motion: instant transition without animation
      if (prefersReducedMotion) {
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
        setScreenReaderAnnouncement(`Navigated to ${label}`);
        return;
      }

      isNavigatingRef.current = true;
      setIsTransitioning(true);

      // Pause Lenis smooth scroll while curtain is moving
      if (window.lenis) {
        window.lenis.stop();
      }

      // Execute runner if available
      if (triggerPageTransitionRef.current) {
        triggerPageTransitionRef.current({
          to,
          label,
          onRouteSwap: () => {
            navigate(to);
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (window.lenis) {
              window.lenis.scrollTo(0, { immediate: true });
            }
            setScreenReaderAnnouncement(`Navigated to ${label}`);
          },
          onComplete: () => {
            isNavigatingRef.current = false;
            setIsTransitioning(false);
            if (window.lenis) {
              window.lenis.start();
            }

            // Move focus to primary <h1> of the incoming page for accessibility
            setTimeout(() => {
              const h1 = document.querySelector('h1');
              if (h1) {
                h1.setAttribute('tabindex', '-1');
                h1.focus({ preventScroll: true });
              }
            }, 50);
          },
        });
      } else {
        // Fallback if runner not mounted
        navigate(to);
        window.scrollTo({ top: 0, behavior: 'instant' });
        isNavigatingRef.current = false;
        setIsTransitioning(false);
      }
    },
    [navigate, location.pathname, location.search, location.hash, prefersReducedMotion]
  );

  return (
    <TransitionContext.Provider
      value={{
        startTransition,
        isTransitioning,
        activeLabel,
        registerRunner,
        prefersReducedMotion,
      }}
    >
      {children}

      {/* Screen Reader Route Announcement Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-live-region"
      >
        {screenReaderAnnouncement}
      </div>
    </TransitionContext.Provider>
  );
}

export default TransitionProvider;

