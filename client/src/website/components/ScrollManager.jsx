import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollManager:
 * 1. Global Lenis momentum smooth scroll initialized and synced with GSAP ScrollTrigger ticker.
 * 2. Delivers buttery-smooth, frictionless, inertia-glide scrolling (Hokaido / Awwwards standard).
 * 3. Handles hash anchor and page route transitions smoothly.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  // 1. Initialize Lenis Smooth Scroll and sync with GSAP Ticker
  useEffect(() => {
    // Respect user's reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Initialize Lenis for luxurious Hokaido-style momentum smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Update GSAP ScrollTrigger on every Lenis scroll tick
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF from GSAP's central ticker for 100% framerate synchronization
    const handleTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(handleTicker);
    gsap.ticker.lagSmoothing(0);

    // Attach to window for global programmatic navigation
    window.lenis = lenis;

    return () => {
      gsap.ticker.remove(handleTicker);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  // 2. Handle route changes and hash navigation
  useEffect(() => {
    if (hash) {
      const elementId = hash.replace('#', '');
      const scrollToHashElement = () => {
        const target = document.getElementById(elementId);
        if (target) {
          if (window.lenis) {
            window.lenis.scrollTo(target, { offset: -84, duration: 1.2 });
          } else {
            const headerOffset = 84;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
          return true;
        }
        return false;
      };

      if (!scrollToHashElement()) {
        const timer = setTimeout(scrollToHashElement, 200);
        return () => clearTimeout(timer);
      }
    } else {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
  }, [pathname, hash]);

  return null;
}
