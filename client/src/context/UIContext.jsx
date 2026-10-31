import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar whenever location changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, location.search]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileSidebarOpen]);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  return (
    <UIContext.Provider
      value={{
        mobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        openMobileSidebar,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    return {
      mobileSidebarOpen: false,
      toggleMobileSidebar: () => {},
      closeMobileSidebar: () => {},
      openMobileSidebar: () => {},
    };
  }
  return context;
}

export default UIContext;
