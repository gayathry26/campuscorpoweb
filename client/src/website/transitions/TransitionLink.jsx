import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTransitionContext } from './TransitionProvider';

/**
 * TransitionLink — Semantic link component that triggers the liquid curved black curtain transition.
 * Direct drop-in replacement for React Router's <Link>.
 */
export default function TransitionLink({
  to,
  label,
  children,
  className = '',
  onClick,
  target,
  replace = false,
  ...props
}) {
  const { startTransition, isTransitioning } = useTransitionContext();
  const location = useLocation();

  const href = typeof to === 'string' ? to : to?.pathname || '#';

  const handleClick = (e) => {
    onClick?.(e);

    // Standard browser modifier key and special behavior guards
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      target === '_blank' ||
      props.download !== undefined
    ) {
      return;
    }

    // Ignore external links, mailto, tel, or purely on-page hash jump
    if (typeof href === 'string') {
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return;
      }
    }

    // Ignore if target matches the current full path and hash
    const currentFull = location.pathname + location.search + location.hash;
    if (href === currentFull || href === location.pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (!isTransitioning) {
      startTransition(to, label);
    }
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
      {...props}
    >
      {children}
    </a>
  );
}

