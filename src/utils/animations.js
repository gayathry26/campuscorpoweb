/**
 * CampusCorpo Design System — Reusable Framer Motion Animation Variants & Tokens
 * Adheres strictly to the premium black-and-white institutional aesthetic:
 * - Subtle, smooth, GPU-accelerated (opacity & translate only)
 * - Viewport trigger once ({ once: true, margin: '-60px' })
 * - Professional cubic bezier easing: [0.16, 1, 0.3, 1]
 */

// Premium easing curve (smooth deceleration, zero bounce)
export const PREMIUM_EASE = [0.16, 1, 0.3, 1];

// Standard Viewport Trigger Setting (prevents repeated replay while scrolling up/down)
export const standardViewport = {
  once: true,
  margin: '-60px',
};

// 1. Stagger Container (Parent)
export const staggerContainer = (staggerDelay = 0.09, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// 2. Fade Up Item (Children or standalone elements)
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: PREMIUM_EASE,
    },
  },
};

// 3. Gentle Fade In (No translate)
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: PREMIUM_EASE,
    },
  },
};

// 4. Staggered Card Reveal
export const cardReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: PREMIUM_EASE,
    },
  },
};

// 5. Interactive Card Hover & Tap
export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
    transition: {
      duration: 0.22,
      ease: PREMIUM_EASE,
    },
  },
};

// 6. Interactive Button Tap & Hover
export const buttonInteraction = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

// 7. Route / Page Transition
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: PREMIUM_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// 8. Progress Fill Animation (for metric bars)
export const progressFillVariants = (targetPercent) => ({
  hidden: { width: '0%' },
  visible: {
    width: `${targetPercent}%`,
    transition: {
      duration: 1.2,
      delay: 0.2,
      ease: PREMIUM_EASE,
    },
  },
});

