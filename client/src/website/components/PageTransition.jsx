import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const TransitionContext = createContext(null);

export const usePageTransition = () => useContext(TransitionContext);

// Dynamic friendly route label mapping for the destination badge
function getRouteLabel(pathname) {
  if (!pathname || pathname === '/') return 'Campus Operating System';
  if (pathname.startsWith('/platform')) return 'Platform Architecture';
  if (pathname.startsWith('/career-explorer')) return 'Career Intelligence';
  if (pathname.startsWith('/company-explorer')) return 'Company Discovery';
  if (pathname.startsWith('/about')) return 'About CampusCorpo';
  if (pathname.startsWith('/contact')) return 'Contact & Academic Relations';
  if (pathname.startsWith('/solutions/placement') || pathname.startsWith('/placement-management')) return 'Placement Operations';
  if (pathname.startsWith('/solutions/student') || pathname.startsWith('/student-management')) return 'Student 360° Management';
  if (pathname.startsWith('/solutions/faculty') || pathname.startsWith('/faculty-management')) return 'Faculty Coordination';
  if (pathname.startsWith('/solutions/admin') || pathname.startsWith('/administration')) return 'Institutional Governance';
  if (pathname.startsWith('/solutions/lms') || pathname.startsWith('/lms')) return 'Semester Classrooms';
  if (pathname.startsWith('/features/programming') || pathname.startsWith('/programming-assessment')) return 'Coding Assessment Sandbox';
  if (pathname.startsWith('/features/mock') || pathname.startsWith('/mock-interviews')) return 'Mock Interview Intelligence';
  return 'CampusCorpo';
}

/**
 * PageTransitionProvider — Global Solid Whole-Black Curtain Page Transition
 * 
 * Choreography:
 * 1. User clicks any link -> Solid Obsidian Black Curtain rises from bottom (yPercent: 100 -> 0)
 * 2. Viewport is 100% WHOLE SOLID BLACK with minimalist CampusCorpo badge
 * 3. Route swaps underneath & scroll position immediately resets to top
 * 4. Solid Black Curtain continues upward (yPercent: 0 -> -100), revealing the new page
 * 5. Destination page content glides in smoothly
 */
export function PageTransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const overlayRef = useRef(null);
  const curtainRef = useRef(null);
  const badgeRef = useRef(null);
  const timelineRef = useRef(null);
  const busyRef = useRef(false);

  const [badgeLabel, setBadgeLabel] = useState('CampusCorpo');

  // Master Whole-Black Transition Sequence
  const transitionTo = useCallback((url) => {
    if (!url || busyRef.current) return;

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      navigate(url);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const overlay = overlayRef.current;
    const curtain = curtainRef.current;
    const badge = badgeRef.current;

    if (!overlay || !curtain) {
      navigate(url);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    busyRef.current = true;
    setBadgeLabel(getRouteLabel(typeof url === 'string' ? url : url.pathname || ''));

    // 1. Immediately make overlay visible and absorb clicks
    overlay.style.visibility = 'visible';
    overlay.style.pointerEvents = 'auto';

    timelineRef.current?.kill();

    // Reset curtain to below the viewport
    gsap.set(curtain, { yPercent: 100 });
    if (badge) gsap.set(badge, { opacity: 0, y: 18 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Reset after reveal finishes
        gsap.set(curtain, { yPercent: 100 });
        if (overlayRef.current) {
          overlayRef.current.style.visibility = 'hidden';
          overlayRef.current.style.pointerEvents = 'none';
        }
        busyRef.current = false;
        timelineRef.current = null;
      },
    });

    timelineRef.current = tl;

    // STEP 1: Solid Whole Black Curtain Rises from Bottom (100% -> 0%)
    tl.to(
      curtain,
      {
        yPercent: 0,
        duration: 0.65,
        ease: 'power3.inOut',
      },
      0
    );

    // Minimalist destination badge illuminates at peak coverage
    if (badge) {
      tl.to(
        badge,
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
        },
        0.38
      );
    }

    // STEP 2: Navigate when screen is 100% WHOLE SOLID BLACK (0.65s)
    tl.add(() => {
      navigate(url);
      if (typeof window !== 'undefined') {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    }, 0.65);

    // STEP 3: Badge fades out as curtain leaves
    if (badge) {
      tl.to(
        badge,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        0.68
      );
    }

    // STEP 4: Solid Whole Black Curtain continues upward to reveal next page (0% -> -100%)
    tl.to(
      curtain,
      {
        yPercent: -100,
        duration: 0.65,
        ease: 'power3.inOut',
      },
      0.72
    );

    // Subtle upward content entrance for incoming page
    const mainEl = document.querySelector('main');
    if (mainEl) {
      tl.fromTo(
        mainEl,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        },
        0.8
      );
    }
  }, [navigate]);

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (busyRef.current) return;
      const overlay = overlayRef.current;
      const curtain = curtainRef.current;
      if (!overlay || !curtain) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) return;

      busyRef.current = true;
      overlay.style.visibility = 'visible';

      timelineRef.current?.kill();

      gsap.set(curtain, { yPercent: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(curtain, { yPercent: 100 });
          overlay.style.visibility = 'hidden';
          busyRef.current = false;
          timelineRef.current = null;
        },
      });

      timelineRef.current = tl;

      tl.to(curtain, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power3.inOut',
      }, 0.1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global delegated link click interceptor on capture phase
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external, new tab, download, mailto, tel, or modifier keys
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Internal route detected
      if (href.startsWith('/')) {
        const currentFull =
          window.location.pathname + window.location.search + window.location.hash;
        if (href === currentFull) return;

        e.preventDefault();
        e.stopPropagation();
        transitionTo(href);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [transitionTo]);

  useLayoutEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      {children}

      {/* Global Solid Whole-Black Curtain Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 w-full h-full z-[999999] pointer-events-none select-none overflow-hidden"
        style={{ visibility: 'hidden' }}
        aria-hidden="true"
      >
        {/* Solid Deep Obsidian Black Curtain (WHOLE BLACK) */}
        <div
          ref={curtainRef}
          className="absolute inset-0 w-full h-full bg-[#050505] text-white flex flex-col items-center justify-center text-center px-4 will-change-transform z-10"
          style={{ transform: 'translateY(100%)' }}
        >
          {/* Subtle Ambient Radial Backlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 80%)',
            }}
          />

          {/* Minimalist CampusCorpo Destination Badge */}
          <div
            ref={badgeRef}
            className="relative z-20 flex flex-col items-center justify-center text-center opacity-0 px-4"
          >
            <div className="flex items-center gap-2.5">
              <img
                src="/campuscorpo-mark-white.png"
                alt="CampusCorpo"
                className="h-8 w-auto object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
              />
              <span className="text-xs font-mono font-bold tracking-[0.28em] text-neutral-400 uppercase">
                CampusCorpo
              </span>
            </div>

            <div className="mt-3.5 h-[1px] w-20 bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />

            <h3 className="mt-3 text-lg sm:text-2xl font-bold tracking-[0.18em] text-white uppercase font-sans">
              {badgeLabel}
            </h3>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
export default PageTransitionProvider;
