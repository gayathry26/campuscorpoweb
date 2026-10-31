import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageVariants } from '../../utils/motion';

/**
 * Universal Page Wrapper for Smooth Framer Motion Page Transitions
 * - Automatically respects prefers-reduced-motion
 * - Gentle fade-in and small vertical movement (150-200ms)
 * - GPU accelerated with transform and opacity
 */
export function PageMotion({ children, className = '', locationKey }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      key={locationKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default PageMotion;
