import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildScrubPath, buildHiddenBottomPath } from './curtainPaths';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// TUNING CONSTANTS BLOCK
// ============================================================================
export const SECTION_WIPE_CONFIG = {
  SCRUB: 0.6,                        // Scroll damping feel
  CURVE_DESKTOP: 16,                 // Peak curve height on desktop
  CURVE_MOBILE: 8,                   // Peak curve height on mobile
  PIN_DISTANCE_DESKTOP: '+=100%',    // Pinned scroll length desktop
  PIN_DISTANCE_MOBILE: '+=60%',      // Pinned scroll length mobile
};

/**
 * SectionWipe — Pinned, scroll-scrubbed liquid curved black curtain between sections.
 * 
 * Progress breakdown:
 * - 0.00 -> 0.45: Curtain rises with organic curved leading edge (covers current section)
 * - 0.45 -> 0.55: Screen is 100% solid black, section badge illuminates
 * - 0.55 -> 1.00: Curtain exits upward with organic curve (reveals next section)
 */
export default function SectionWipe({
  index = 2,
  title = 'Platform Architecture',
  tagline = 'Integrated Institutional Operations',
}) {
  const wrapperRef = useRef(null);
  const pathRef = useRef(null);
  const badgeRef = useRef(null);

  const formattedIndex = String(index).padStart(2, '0');

  useEffect(() => {
    // Reduced motion accessibility check
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const wrapper = wrapperRef.current;
    const path = pathRef.current;
    const badge = badgeRef.current;

    if (!wrapper || !path) return;

    // Use gsap.matchMedia for responsive pinning & curve intensity
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
      },
      (context) => {
        const { isDesktop } = context.conditions;
        const maxCurve = isDesktop
          ? SECTION_WIPE_CONFIG.CURVE_DESKTOP
          : SECTION_WIPE_CONFIG.CURVE_MOBILE;
        const pinDistance = isDesktop
          ? SECTION_WIPE_CONFIG.PIN_DISTANCE_DESKTOP
          : SECTION_WIPE_CONFIG.PIN_DISTANCE_MOBILE;

        // Path proxy object for ScrollTrigger scrubbing
        const proxy = { progress: 0 };

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top top',
          end: pinDistance,
          pin: true,
          pinSpacing: true,
          scrub: SECTION_WIPE_CONFIG.SCRUB,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            proxy.progress = p;

            // 1. Rebuild SVG path dynamically from scrub progress
            path.setAttribute('d', buildScrubPath(p, maxCurve));

            // 2. Animate Section Badge opacity & scale during 0.40 -> 0.60
            if (badge) {
              if (p >= 0.38 && p <= 0.62) {
                // Peak illumination inside 0.45..0.55
                let opacity = 0;
                if (p < 0.46) {
                  opacity = (p - 0.38) / 0.08;
                } else if (p > 0.54) {
                  opacity = 1 - (p - 0.54) / 0.08;
                } else {
                  opacity = 1;
                }
                const scale = 0.94 + 0.06 * Math.sin(((p - 0.38) / 0.24) * Math.PI);
                badge.style.opacity = Math.max(0, Math.min(1, opacity));
                badge.style.transform = `scale(${scale.toFixed(3)})`;
              } else {
                badge.style.opacity = 0;
              }
            }
          },
        });

        return () => st.kill();
      }
    );

    return () => mm.revert();
  }, [index]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-screen overflow-hidden select-none pointer-events-none z-30"
      aria-hidden="true"
    >
      {/* Liquid Curved SVG Curtain */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <path
          ref={pathRef}
          d={buildHiddenBottomPath()}
          fill="#050505"
        />
      </svg>

      {/* Centered Minimalist Section Badge (Illuminates in the 100% black phase) */}
      <div
        ref={badgeRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 px-4 z-10 transition-none"
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/campuscorpo-mark-white.png"
            alt=""
            className="h-7 w-auto object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
          />
          <span className="text-xs font-mono font-bold tracking-[0.28em] text-neutral-400 uppercase">
            CampusCorpo // {formattedIndex}
          </span>
        </div>

        <div className="mt-3.5 h-[1px] w-20 bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />

        <h2 className="curtain-badge mt-3 text-xl sm:text-3xl font-bold font-mono">
          {formattedIndex} // {title}
        </h2>

        {tagline && (
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-mono tracking-wider font-normal max-w-md">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}

