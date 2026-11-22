import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin once
gsap.registerPlugin(ScrollTrigger);

/**
 * useLenis — Initializes smooth scrolling with Lenis and synchronizes it with GSAP ScrollTrigger.
 * Exposes methods to pause/resume during page transitions and handle instant scroll reset.
 */
export function useLenis(enabled = true) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Do not enable on reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // 1. Sync Lenis scroll updates with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 2. Drive Lenis with GSAP's central ticker
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, [enabled]);

  return lenisRef;
}

export default useLenis;

