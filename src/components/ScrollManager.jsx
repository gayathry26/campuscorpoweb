import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollManager:
 * 1. Resets scroll position to top on page route transition (when no hash is present)
 * 2. Accurately scrolls to target element with sticky navbar offset when a hash anchor exists
 * 3. Handles hash navigation smoothly without abrupt jumping
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash exists (e.g. /platform#placement)
    if (hash) {
      const elementId = hash.replace('#', '');
      
      const scrollToHashElement = () => {
        const target = document.getElementById(elementId);
        if (target) {
          const headerOffset = 84; // Sticky navbar height + comfortable padding
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      // Try immediately, or after a brief tick if page is still mounting
      if (!scrollToHashElement()) {
        const timer = setTimeout(scrollToHashElement, 150);
        return () => clearTimeout(timer);
      }
    } else {
      // Normal page navigation without anchor: scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, hash]);

  return null;
}

