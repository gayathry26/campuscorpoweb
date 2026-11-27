import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../utils/motion';

/**
 * Enterprise Accessible Animated Modal Dialog Component
 * Powered by Framer Motion (motion/react)
 * - Entrance and exit scale/fade animations
 * - Closes on Escape key press
 * - Prevents backdrop scrolling while open
 * - Prevents accidental closure on inner drag/click
 * - Fully accessible with role="dialog" and aria-modal="true"
 * - Responsive on mobile, tablet, and desktop
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
  showCloseButton = true,
  closeOnBackdropClick = true,
}) {
  const dialogRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is mounted
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Handle overlay click safely (only trigger if clicked directly on overlay)
  const handleOverlayClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleOverlayClick}
          initial={shouldReduceMotion ? { opacity: 0 } : modalBackdropVariants.initial}
          animate={shouldReduceMotion ? { opacity: 1 } : modalBackdropVariants.animate}
          exit={shouldReduceMotion ? { opacity: 0 } : modalBackdropVariants.exit}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
        >
          <motion.div
            ref={dialogRef}
            initial={shouldReduceMotion ? { opacity: 0 } : modalContentVariants.initial}
            animate={shouldReduceMotion ? { opacity: 1 } : modalContentVariants.animate}
            exit={shouldReduceMotion ? { opacity: 0 } : modalContentVariants.exit}
            className={`bg-card text-card-foreground w-full ${maxWidth} rounded-2xl shadow-2xl border border-border overflow-hidden my-auto max-h-[92vh] flex flex-col`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-muted/40 shrink-0">
              <h3 id="modal-title" className="text-base sm:text-lg font-bold text-foreground truncate pr-2">
                {title}
              </h3>
              {showCloseButton && (
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 text-sm overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LoadingSpinner({ text = 'Loading data...', size = 'md' }) {
  const spinnerSize = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-12 h-12 border-3' : 'w-8 h-8 border-3';
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3" role="status" aria-live="polite">
      <div className={`${spinnerSize} border-border border-t-foreground rounded-full animate-spin`} />
      {text && <p className="text-xs sm:text-sm font-medium text-muted-foreground">{text}</p>}
      <span className="sr-only">{text}</span>
    </div>
  );
}

export default Modal;
