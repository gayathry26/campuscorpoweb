import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

export default function AnimatedCounter({ value, suffix = '', duration = 1.4 }) {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!isInView || !nodeRef.current) return;

    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      nodeRef.current.textContent = `${value}${suffix}`;
      return;
    }

    const controls = animate(0, numericValue, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (nodeRef.current) {
          nodeRef.current.textContent = `${Math.floor(latest)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, value, suffix, duration]);

  return (
    <span ref={nodeRef} className="tabular-nums font-mono font-bold text-neutral-950">
      0{suffix}
    </span>
  );
}
