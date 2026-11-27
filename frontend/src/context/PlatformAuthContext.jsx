import React, { createContext, useContext, useState, useEffect } from 'react';

const PlatformAuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'campuscorp_platform_token';
const STORAGE_KEY_USER = 'campuscorp_platform_user';

export function PlatformAuthProvider({ children }) {
  const [platformUser, setPlatformUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
  });

  const [loading, setLoading] = useState(true);

  // Verify platform token validity on initial mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/platform/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setPlatformUser(data.user);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[PlatformAuth] Verification offline or failed:', err);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/v1/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Platform administrator login failed.');
    }

    setToken(data.token);
    setPlatformUser(data.user);
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/v1/platform/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      } catch (e) {}
    }
    setToken(null);
    setPlatformUser(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  /**
   * Helper for authenticated platform API requests
   */
  const platformFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout();
      window.location.href = '/platform-admin/login';
      throw new Error('Platform session expired. Please sign in again.');
    }

    return res;
  };

  return (
    <PlatformAuthContext.Provider
      value={{
        platformUser,
        token,
        loading,
        isAuthenticated: Boolean(token && platformUser),
        login,
        logout,
        platformFetch,
      }}
    >
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth() {
  const context = useContext(PlatformAuthContext);
  if (!context) {
    throw new Error('usePlatformAuth must be used within a PlatformAuthProvider');
  }
  return context;
}

