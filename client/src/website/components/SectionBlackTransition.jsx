import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SectionBlackTransition — Scroll-Triggered Whole Black Curtain Wipe Between Sections
 * 
 * Animation Specifications:
 * - When scrolling down, a solid deep obsidian black panel rises from the bottom (yPercent: 100 -> 0)
 * - At peak coverage, the whole screen is solid black with the minimalist CampusCorpo section badge
 * - As scrolling continues, the black panel continues upward (yPercent: 0 -> -100), smoothly revealing the next section
 * - When scrolling upward, the transition reverses naturally with 100% scroll synchronization
 * - autoAlpha ensures zero z-index interference when out of view
 */
export default function SectionBlackTransition({
  step = '02',
  title = 'Platform Architecture',
  tagline = 'Integrated Institutional Operations',
}) {
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const trigger = triggerRef.current;
    const panel = panelRef.current;
    const badge = badgeRef.current;

    if (!trigger || !panel) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.6,
        },
      });

      // 1. Solid black panel rises up and covers the entire screen (100% -> 0%)
      tl.fromTo(
        panel,
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, ease: 'power2.inOut', duration: 1 }
      );

      // 2. Minimalist section badge illuminates at peak black coverage
      if (badge) {
        tl.fromTo(
          badge,
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, ease: 'power1.out', duration: 0.35 },
          0.65
        );

        tl.to(
          badge,
          { opacity: 0, scale: 1.04, ease: 'power1.in', duration: 0.35 },
          1.0
        );
      }

      // 3. Solid black panel continues upward to reveal next section (0% -> -100%)
      tl.to(
        panel,
        { yPercent: -100, autoAlpha: 0, ease: 'power2.inOut', duration: 1 },
        1.0
      );
    }, trigger);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative w-full h-[65vh] pointer-events-none select-none z-30"
      aria-hidden="true"
    >
      {/* Full-Screen Solid Obsidian Black Curtain */}
      <div
        ref={panelRef}
        className="fixed inset-0 w-full h-full bg-[#050505] text-white flex flex-col items-center justify-center text-center px-4 will-change-transform z-40 pointer-events-none"
      >
        {/* Subtle Ambient Radial Backlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 80%)',
          }}
        />

        {/* Minimalist Section Transition Badge */}
        <div
          ref={badgeRef}
          className="relative z-10 flex flex-col items-center justify-center text-center opacity-0 px-4"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/campuscorpo-mark-white.png"
              alt="CampusCorpo"
              className="h-7 w-auto object-contain drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
            />
            <span className="text-xs font-mono font-bold tracking-[0.28em] text-neutral-400 uppercase">
              CampusCorpo // {step}
            </span>
          </div>

          <div className="mt-3 h-[1px] w-20 bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />

          <h3 className="mt-3 text-xl sm:text-3xl font-bold tracking-[0.16em] text-white uppercase font-sans">
            {title}
          </h3>

          {tagline && (
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-normal tracking-wider font-mono max-w-md">
              {tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

