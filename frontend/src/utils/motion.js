/**
 * CampusCorp Enterprise Motion Design System
 * Built on motion/react (Framer Motion)
 *
 * Rules:
 * - Micro-interactions (150ms-250ms)
 * - GPU-friendly transforms (transform, opacity)
 * - Automatic prefers-reduced-motion fallback
 * - High-frame-rate easings
 */

export const easings = {
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  springFast: { type: 'spring', damping: 26, stiffness: 340 },
  springGentle: { type: 'spring', damping: 30, stiffness: 280 },
};

// Global Page Transition
export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.14,
      ease: 'easeIn',
    },
  },
};

// Simple Fade
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// Modal Backdrop
export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// Modal Content Dialog
export const modalContentVariants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

// Dropdowns & Popovers
export const dropdownVariants = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// Mobile Navigation Drawer (Left)
export const drawerLeftVariants = {
  initial: { x: '-100%' },
  animate: {
    x: 0,
    transition: { type: 'spring', damping: 28, stiffness: 320 },
  },
  exit: {
    x: '-100%',
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
};

// Accordion Submenu Expanding
export const accordionVariants = {
  initial: { opacity: 0, height: 0, overflow: 'hidden' },
  animate: {
    opacity: 1,
    height: 'auto',
    overflow: 'visible',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// Toast Notifications
export const toastVariants = {
  initial: { opacity: 0, y: 16, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.94,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

// Tab Content Switcher
export const tabContentVariants = {
  initial: { opacity: 0, x: 8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// Card Hover Elevation
export const cardHoverProps = {
  whileHover: { y: -2, transition: { duration: 0.15, ease: 'easeOut' } },
};

// Button Interaction Props
export const buttonTapProps = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 },
};

// Sequential Reveal Stagger
export const staggerContainer = (staggerChildren = 0.04, delayChildren = 0) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};
