import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * IntroAnimation — Premium Cinematic Logo-to-Website Transformation
 * 
 * Clean, perfectly centered composition:
 * - Logo Emblem horizontally centered
 * - CAMPUSCORPO brand name directly below logo with clean spacing
 * - Hairline silver accent and "Connecting Campus. Creating Careers." tagline directly below brand name
 * - Vertically centered flex layout with responsive spacing and zero collisions
 * - Smooth transition from center into navbar position upon reveal
 */
export default function IntroAnimation({ onComplete, onReveal }) {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState('initial'); // 'initial' | 'brand' | 'zoom' | 'reveal' | 'complete'
  const [coordsDelta, setCoordsDelta] = useState({ x: 0, y: 0, scale: 0.35 });
  const logoRef = useRef(null);
  const hasTriggeredReveal = useRef(false);

  // Measure delta between intro center logo and destination navbar logo
  const measureAndCalculateDelta = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 1. Target: Navbar logo element
    const navbarLogoEl =
      document.querySelector('header a[aria-label="CampusCorpo Home"] img') ||
      document.querySelector('header a img');

    let targetX = 44;
    let targetY = 38;
    let targetScale = 0.35;

    if (navbarLogoEl) {
      const rect = navbarLogoEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
      targetScale = Math.max(0.28, Math.min(0.42, rect.width / 112));
    } else {
      const isMobile = window.innerWidth < 640;
      targetX = isMobile ? 36 : Math.max(28, (window.innerWidth - 1280) / 2 + 36);
      targetY = isMobile ? 30 : 38;
      targetScale = isMobile ? 0.32 : 0.36;
    }

    // 2. Origin: Center of the intro logo
    if (logoRef.current) {
      const logoRect = logoRef.current.getBoundingClientRect();
      const originX = logoRect.left + logoRect.width / 2;
      const originY = logoRect.top + logoRect.height / 2;

      setCoordsDelta({
        x: targetX - originX,
        y: targetY - originY,
        scale: targetScale,
      });
    } else {
      // Fallback relative to screen center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setCoordsDelta({
        x: targetX - centerX,
        y: targetY - (centerY - 40),
        scale: targetScale,
      });
    }
  }, []);

  // Update target coordinates on mount and resize
  useEffect(() => {
    measureAndCalculateDelta();
    window.addEventListener('resize', measureAndCalculateDelta);
    return () => window.removeEventListener('resize', measureAndCalculateDelta);
  }, [measureAndCalculateDelta]);

  // Unified exit/skip handler
  const handleSkipOrComplete = useCallback(() => {
    if (stage === 'reveal' || stage === 'complete') return;
    measureAndCalculateDelta();
    setStage('reveal');
    if (!hasTriggeredReveal.current) {
      hasTriggeredReveal.current = true;
      onReveal?.();
    }
    try {
      sessionStorage.setItem('campuscorpo_intro_seen', 'true');
    } catch {}

    setTimeout(() => {
      setStage('complete');
      onComplete?.();
    }, 1150);
  }, [stage, onReveal, onComplete, measureAndCalculateDelta]);

  // Reduced motion support: skip immediately
  useEffect(() => {
    if (shouldReduceMotion) {
      try {
        sessionStorage.setItem('campuscorpo_intro_seen', 'true');
      } catch {}
      onComplete?.();
    }
  }, [shouldReduceMotion, onComplete]);

  // Lock body scroll while intro is playing
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard shortcut: Press Escape to advance to reveal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkipOrComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkipOrComplete]);

  // Master timeline progression
  useEffect(() => {
    if (shouldReduceMotion) return;

    // Stage 1 -> 2: Reveal Brand Name & Tagline at 1.1s
    const t1 = setTimeout(() => {
      setStage('brand');
    }, 1100);

    // Stage 2 -> 3: Begin Cinematic Zoom at 2.6s
    const t2 = setTimeout(() => {
      setStage('zoom');
    }, 2600);

    // Stage 3 -> 4: Expanding Iris Mask & Logo Navbar Docking at 3.4s
    const t3 = setTimeout(() => {
      measureAndCalculateDelta();
      setStage('reveal');
      if (!hasTriggeredReveal.current) {
        hasTriggeredReveal.current = true;
        onReveal?.();
      }
      try {
        sessionStorage.setItem('campuscorpo_intro_seen', 'true');
      } catch {}
    }, 3400);

    // Stage 4 -> 5: Complete and unmount overlay at 4.6s
    const t4 = setTimeout(() => {
      setStage('complete');
      onComplete?.();
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [shouldReduceMotion, measureAndCalculateDelta, onReveal, onComplete]);

  if (stage === 'complete') return null;

  const isRevealing = stage === 'reveal';
  const isZooming = stage === 'zoom' || isRevealing;

  return (
    <div
      aria-label="CampusCorpo Cinematic Opening"
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden"
    >
      {/* =================================================================== */}
      {/* 1. SVG IRIS MASK DEFINITION (Expanding Circular Aperture)           */}
      {/* =================================================================== */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <defs>
          <mask id="campuscorpo-iris-mask">
            {/* Solid white = overlay background is visible */}
            <rect width="100%" height="100%" fill="white" />
            {/* Expanding black circle = transparent aperture uncovering homepage */}
            <motion.circle
              cx="50%"
              cy="50%"
              initial={{ r: 0 }}
              animate={{
                r: isRevealing ? '160vmax' : 0,
              }}
              transition={{
                duration: 1.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              fill="black"
            />
          </mask>
        </defs>
      </svg>

      {/* =================================================================== */}
      {/* 2. DARK CANVAS WITH IRIS CUTOUT                                    */}
      {/* =================================================================== */}
      <div
        style={{
          mask: 'url(#campuscorpo-iris-mask)',
          WebkitMask: 'url(#campuscorpo-iris-mask)',
        }}
        className="absolute inset-0 bg-[#050505] text-white pointer-events-auto"
      >
        {/* Cinematic Ambient Silver Backlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 48%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(5, 5, 5, 0.95) 80%, #050505 100%)',
          }}
        />

        {/* Architectural Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Bottom Platform Status Pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'initial' || stage === 'brand' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-neutral-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 animate-pulse" />
          <span>Enterprise Platform</span>
        </motion.div>
      </div>

      {/* =================================================================== */}
      {/* 3. TOP-RIGHT SKIP CONTROL                                          */}
      {/* =================================================================== */}
      {!isRevealing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 pointer-events-auto"
        >
          <button
            type="button"
            onClick={handleSkipOrComplete}
            className="group flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-4 py-1.5 text-xs font-medium text-neutral-400 backdrop-blur-md transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/80 hover:text-white cursor-pointer"
            aria-label="Skip cinematic intro"
          >
            <span>Skip</span>
            <span className="hidden sm:inline-block rounded border border-neutral-700/70 bg-neutral-800/60 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200">
              ESC
            </span>
          </button>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* 4. LUMINOUS SILVER APERTURE RING (Follows the expanding iris edge)  */}
      {/* =================================================================== */}
      {isRevealing && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" aria-hidden="true">
          <motion.circle
            cx="50%"
            cy="50%"
            initial={{ r: 0, opacity: 0.9 }}
            animate={{
              r: '160vmax',
              opacity: [0.9, 0.4, 0],
            }}
            transition={{
              duration: 1.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3"
          />
        </svg>
      )}

      {/* =================================================================== */}
      {/* 5. UNIFIED VERTICALLY CENTERED FLEX COMPOSITION                     */}
      {/*    Logo + Brand Name + Tagline sit in ONE aligned column            */}
      {/* =================================================================== */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen w-full px-4 text-center pointer-events-none">
        
        {/* --- 5A. ORIGINAL CAMPUSCORPO LOGO EMBLEM --- */}
        <motion.div
          ref={logoRef}
          className="relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{
            x: isRevealing ? coordsDelta.x : 0,
            y: isRevealing ? coordsDelta.y : 0,
            scale: isRevealing ? coordsDelta.scale : stage === 'zoom' ? 2.0 : 1,
            opacity: isRevealing ? [1, 0.7, 0] : 1,
          }}
          transition={{
            duration: isRevealing ? 0.95 : stage === 'zoom' ? 0.75 : 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Soft Radial Backlight behind the Emblem during intro */}
          {!isRevealing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0, 0.45, 0.35],
                scale: [0.7, 1.25, 1.05],
              }}
              transition={{
                duration: 2.0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pointer-events-none absolute h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-white/15 via-neutral-300/15 to-transparent blur-3xl"
            />
          )}

          {/* Interlocking 'CC' Emblem Container */}
          <div className="relative flex items-center justify-center p-2 rounded-2xl">
            <img
              src="/campuscorpo-mark-white.png"
              alt="CampusCorpo Logo Emblem"
              width="140"
              height="124"
              className="h-20 w-auto sm:h-24 md:h-28 object-contain drop-shadow-[0_12px_28px_rgba(255,255,255,0.12)] transition-all duration-300"
              loading="eager"
            />

            {/* Specular Diagonal Light Sweep over the Emblem */}
            {!isZooming && (
              <motion.div
                initial={{ x: '-120%', opacity: 0 }}
                animate={{
                  x: ['-120%', '160%'],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  delay: 0.8,
                  duration: 1.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-none absolute inset-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-overlay"
              />
            )}
          </div>
        </motion.div>

        {/* --- 5B. BRAND NAME & TAGLINE (Directly Below Logo with Clean Spacing) --- */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: stage === 'brand' ? 1 : 0,
            y: stage === 'brand' ? 0 : isZooming ? -12 : 14,
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 sm:mt-8 flex flex-col items-center pointer-events-none select-none"
        >
          {/* CAMPUSCORPO Brand Name */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.24em] sm:tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 uppercase">
            CAMPUSCORPO
          </h1>

          {/* Precision Silver Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: stage === 'brand' ? 1 : 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3.5 h-[1px] w-20 sm:w-28 bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent"
          />

          {/* Tagline */}
          <p className="mt-3 text-xs sm:text-sm md:text-base font-light italic tracking-wider text-neutral-300/90">
            Connecting Campus. Creating Careers.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
