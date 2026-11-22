import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTransitionContext, getRouteLabel } from './TransitionProvider';
import {
  buildCoverPath,
  buildRevealPath,
  buildFullScreenPath,
  buildHiddenBottomPath,
} from './curtainPaths';

// Register ScrollTrigger once
gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TUNING CONSTANTS BLOCK
// Adjust these values to calibrate speed, curve intensity, and easing
// ============================================================================
export const PAGE_TRANSITION_CONFIG = {
  COVER_DURATION: 0.7,     // Phase 1 duration in seconds
  HOLD_DURATION: 0.25,     // Phase 2 hold duration at 100% black
  REVEAL_DURATION: 0.7,    // Phase 3 reveal duration in seconds
  CURVE_AMOUNT: 18,        // Peak wave height in SVG coordinate units
  EASE: 'power3.inOut',     // GSAP curve easing
};

export default function PageTransition() {
  const { registerRunner, activeLabel, startTransition } = useTransitionContext();

  const overlayRef = useRef(null);
  const pathRef = useRef(null);
  const badgeRef = useRef(null);
  const timelineRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const [displayLabel, setDisplayLabel] = useState(activeLabel);

  useEffect(() => {
    setDisplayLabel(activeLabel);
  }, [activeLabel]);

  // Master Route Change Animation Runner
  useEffect(() => {
    const runTransition = ({ to, label, onRouteSwap, onComplete }) => {
      const overlay = overlayRef.current;
      const path = pathRef.current;
      const badge = badgeRef.current;

      if (!overlay || !path) {
        onRouteSwap?.();
        onComplete?.();
        return;
      }

      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      setDisplayLabel(label || getRouteLabel(to));

      // Make overlay interactive during wipe to absorb clicks
      overlay.style.pointerEvents = 'auto';

      timelineRef.current?.kill();

      const {
        COVER_DURATION,
        HOLD_DURATION,
        REVEAL_DURATION,
        CURVE_AMOUNT,
        EASE,
      } = PAGE_TRANSITION_CONFIG;

      // Tween object for Phase 1 COVER (y goes 100 -> 0)
      const coverState = { y: 100 };
      // Tween object for Phase 3 REVEAL (y goes 100 -> 0)
      const revealState = { y: 100 };

      // Initialize path to flat bottom
      path.setAttribute('d', buildHiddenBottomPath());
      if (badge) {
        gsap.set(badge, { opacity: 0, y: 18, letterSpacing: '0.15em' });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          path.setAttribute('d', buildHiddenBottomPath());
          overlay.style.pointerEvents = 'none';
          isAnimatingRef.current = false;
          timelineRef.current = null;
          onComplete?.();
        },
      });

      timelineRef.current = tl;

      // =====================================================================
      // PHASE 1: COVER (0.7s, power3.inOut)
      // y goes 100 -> 0 while curve goes 0 -> 18 -> 0
      // =====================================================================
      tl.to(coverState, {
        y: 0,
        duration: COVER_DURATION,
        ease: EASE,
        onUpdate: () => {
          const progress = 1 - coverState.y / 100; // 0 -> 1
          const curve = Math.sin(progress * Math.PI) * CURVE_AMOUNT;
          path.setAttribute('d', buildCoverPath(coverState.y, curve));
        },
      }, 0);

      // =====================================================================
      // PHASE 2: HOLD (0.25s) — Fully covered in pure obsidian black #050505
      // =====================================================================
      tl.add(() => {
        path.setAttribute('d', buildFullScreenPath());

        // Perform React Router client navigation
        onRouteSwap?.();

        // Refresh and realign GSAP ScrollTriggers after route swap
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
      }, COVER_DURATION);

      // Badge entrance at peak coverage (DM Mono with letter-spacing tween)
      if (badge) {
        tl.to(badge, {
          opacity: 1,
          y: 0,
          letterSpacing: '0.28em',
          duration: HOLD_DURATION * 0.9,
          ease: 'power2.out',
        }, COVER_DURATION);

        tl.to(badge, {
          opacity: 0,
          y: -12,
          duration: 0.18,
          ease: 'power2.in',
        }, COVER_DURATION + HOLD_DURATION);
      }

      // =====================================================================
      // PHASE 3: REVEAL (0.7s, power3.inOut)
      // Bottom edge scoops upward toward top (100 -> 0)
      // =====================================================================
      const revealStartTime = COVER_DURATION + HOLD_DURATION;

      tl.to(revealState, {
        y: 0,
        duration: REVEAL_DURATION,
        ease: EASE,
        onUpdate: () => {
          const progress = revealState.y / 100; // 1 -> 0
          const curve = Math.sin((1 - progress) * Math.PI) * CURVE_AMOUNT;
          path.setAttribute('d', buildRevealPath(revealState.y, curve));
        },
      }, revealStartTime);

      // Smooth subtle content entrance on the destination page
      tl.add(() => {
        const main = document.querySelector('main');
        if (main) {
          gsap.fromTo(
            main,
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
            }
          );
        }
      }, revealStartTime + 0.1);
    };

    // Register with provider
    registerRunner(runTransition);

    return () => {
      registerRunner(null);
      timelineRef.current?.kill();
    };
  }, [registerRunner]);

  // Support browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      if (isAnimatingRef.current) return;
      // Trigger smooth transition to the popstate location
      startTransition(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [startTransition]);

  return (
    <div
      ref={overlayRef}
      className="curtain-overlay"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="curtain-svg"
      >
        <path
          ref={pathRef}
          d={buildHiddenBottomPath()}
          className="curtain-path"
        />
      </svg>

      {/* Minimalist Destination Badge (Fades in during Phase 2 HOLD) */}
      <div
        ref={badgeRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 pointer-events-none px-4 z-10"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/campuscorpo-mark-white.png"
            alt=""
            className="h-7 w-auto object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
          />
          <span className="text-xs font-mono font-bold tracking-[0.28em] text-neutral-400 uppercase">
            CampusCorpo
          </span>
        </div>

        <div className="mt-3.5 h-[1px] w-20 bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />

        <h2 className="curtain-badge mt-3 text-lg sm:text-2xl font-bold font-mono">
          {displayLabel}
        </h2>
      </div>
    </div>
  );
}

