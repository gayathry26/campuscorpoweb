import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export const LIGHT_CHART_COLORS = ['#8B2942', '#702038', '#B5546C', '#26966B', '#E5A13B'];
export const DARK_CHART_COLORS = ['#C25270', '#8B2942', '#D9859B', '#34B383', '#E5A13B'];

const getThemeTokens = (isDark) => ({
  primary: isDark ? '#C25270' : '#8B2942',
  primaryHover: isDark ? '#D46582' : '#702038',
  primaryLight: isDark ? '#312128' : '#F8EDF0',
  primaryText: isDark ? '#F2B8C7' : '#8B2942',
  primaryBorder: isDark ? 'rgba(194, 82, 112, 0.3)' : '#EAE6E8',
  accent: isDark ? '#A69FA8' : '#858087',
  gradientFrom: '#8B2942',
  gradientTo: '#702038',
  glow: isDark ? 'rgba(194, 82, 112, 0.14)' : 'rgba(139, 41, 66, 0.10)',
});

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Clean, palette-free theme mode: strictly Light vs Dark
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscorp_theme_mode');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscorp_notif_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [lmsAlertsEnabled, setLmsAlertsEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscorp_notif_lms');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [placementAlertsEnabled, setPlacementAlertsEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscorp_notif_placement');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const currentTheme = getThemeTokens(isDark);

  // Clean up any legacy palette keys in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('campuscorp_theme');
    } catch (e) {}
  }, []);

  // Immediate DOM Effect for Dark Mode Class and CSS Variables
  useEffect(() => {
    try {
      localStorage.setItem('campuscorp_theme_mode', isDark ? 'dark' : 'light');
    } catch (e) {}

    const root = document.documentElement;
    const p = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    const isMarketing = p === '/' || p.startsWith('/platform') || p.startsWith('/about') || p.startsWith('/contact') || p.startsWith('/company-explorer') || p.startsWith('/career-explorer') || p.startsWith('/solutions') || p.startsWith('/features');

    if (isDark && !isMarketing) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.removeAttribute('data-theme');
    root.style.setProperty('--theme-primary', isDark ? '#C25270' : '#8B2942');
    root.style.setProperty('--theme-primary-hover', isDark ? '#D46582' : '#702038');
    root.style.setProperty('--theme-primary-light', isDark ? '#312128' : '#F8EDF0');
    root.style.setProperty('--theme-primary-text', isDark ? '#F2B8C7' : '#8B2942');
    root.style.setProperty('--theme-primary-border', isDark ? 'rgba(194, 82, 112, 0.3)' : '#EAE6E8');
    root.style.setProperty('--theme-gradient-from', '#8B2942');
    root.style.setProperty('--theme-gradient-to', '#702038');
    root.style.setProperty('--theme-accent', isDark ? '#A69FA8' : '#858087');
    root.style.setProperty('--theme-glow', isDark ? 'rgba(194, 82, 112, 0.14)' : 'rgba(139, 41, 66, 0.10)');
  }, [isDark]);

  // Fetch and Sync Preferences from MySQL Backend
  const syncPreferencesFromBackend = useCallback(async () => {
    const token = localStorage.getItem('placement_token');
    if (!token) return;

    try {
      setLoadingPreferences(true);
      const res = await apiClient.get('/users/preferences');
      if (res.data?.success && res.data?.preferences) {
        const p = res.data.preferences;
        if (p.themeMode) {
          setIsDark(p.themeMode === 'dark');
          localStorage.setItem('campuscorp_theme_mode', p.themeMode);
        }
        if (p.notificationsEnabled !== undefined) {
          setNotificationsEnabledState(Boolean(p.notificationsEnabled));
          localStorage.setItem('campuscorp_notif_enabled', String(p.notificationsEnabled));
        }
        if (p.lmsAlertsEnabled !== undefined) {
          setLmsAlertsEnabledState(Boolean(p.lmsAlertsEnabled));
          localStorage.setItem('campuscorp_notif_lms', String(p.lmsAlertsEnabled));
        }
        if (p.placementAlertsEnabled !== undefined) {
          setPlacementAlertsEnabledState(Boolean(p.placementAlertsEnabled));
          localStorage.setItem('campuscorp_notif_placement', String(p.placementAlertsEnabled));
        }
      }
    } catch (err) {
      console.warn('Backend preferences sync notice:', err.message);
    } finally {
      setLoadingPreferences(false);
    }
  }, []);

  useEffect(() => {
    syncPreferencesFromBackend();
  }, [syncPreferencesFromBackend]);

  // Update and Persist Preferences to Backend & LocalStorage
  const updatePreferences = async (partial) => {
    if (partial.themeMode !== undefined) {
      const dark = partial.themeMode === 'dark';
      setIsDark(dark);
      try {
        localStorage.setItem('campuscorp_theme_mode', partial.themeMode);
      } catch (e) {}
    }
    if (partial.notificationsEnabled !== undefined) {
      setNotificationsEnabledState(Boolean(partial.notificationsEnabled));
      try {
        localStorage.setItem('campuscorp_notif_enabled', String(partial.notificationsEnabled));
      } catch (e) {}
    }
    if (partial.lmsAlertsEnabled !== undefined) {
      setLmsAlertsEnabledState(Boolean(partial.lmsAlertsEnabled));
      try {
        localStorage.setItem('campuscorp_notif_lms', String(partial.lmsAlertsEnabled));
      } catch (e) {}
    }
    if (partial.placementAlertsEnabled !== undefined) {
      setPlacementAlertsEnabledState(Boolean(partial.placementAlertsEnabled));
      try {
        localStorage.setItem('campuscorp_notif_placement', String(partial.placementAlertsEnabled));
      } catch (e) {}
    }

    const token = localStorage.getItem('placement_token');
    if (!token) return { success: true };

    try {
      setSavingPreferences(true);
      await apiClient.put('/users/preferences', partial);
      return { success: true };
    } catch (err) {
      console.error('Failed to save preferences to server:', err);
      return { success: false, error: err.message };
    } finally {
      setSavingPreferences(false);
    }
  };

  const setDarkMode = (val) => {
    updatePreferences({ themeMode: val ? 'dark' : 'light' });
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDark);
  };

  const setNotificationsEnabled = (val) => {
    updatePreferences({ notificationsEnabled: Boolean(val) });
  };

  const setLmsAlertsEnabled = (val) => {
    updatePreferences({ lmsAlertsEnabled: Boolean(val) });
  };

  const setPlacementAlertsEnabled = (val) => {
    updatePreferences({ placementAlertsEnabled: Boolean(val) });
  };

  const chartColors = isDark ? DARK_CHART_COLORS : LIGHT_CHART_COLORS;

  const contextValue = {
    currentTheme,
    isDark,
    darkMode: isDark,
    toggleDarkMode,
    setDarkMode,
    chartColors,
    preferences: {
      themeMode: isDark ? 'dark' : 'light',
      notificationsEnabled,
      lmsAlertsEnabled,
      placementAlertsEnabled,
    },
    notificationsEnabled,
    setNotificationsEnabled,
    lmsAlertsEnabled,
    setLmsAlertsEnabled,
    placementAlertsEnabled,
    setPlacementAlertsEnabled,
    updatePreferences,
    syncPreferencesFromBackend,
    loadingPreferences,
    savingPreferences,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function usePreferences() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('usePreferences must be used within a ThemeProvider');
  }
  return context;
}
