import React from 'react';

/**
 * AnimatedPageWrapper — Clean semantic layout container for page contents.
 * Global two-layer panel wipe transitions are handled seamlessly by PageTransition at the application routing level.
 */
export default function AnimatedPageWrapper({ children, className = '' }) {
  return <div className={`w-full ${className}`}>{children}</div>;
}
