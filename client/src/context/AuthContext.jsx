import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [college, setCollege] = useState(() => {
    try {
      const saved = localStorage.getItem('placement_college');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on initial mount
    const savedToken = localStorage.getItem('placement_token');
    const savedUser = localStorage.getItem('placement_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        // Verify token with backend & synchronize fresh module entitlements
        apiClient.get('/auth/me').then((res) => {
          if (res.data?.college) {
            localStorage.setItem('placement_college', JSON.stringify(res.data.college));
            setCollege(res.data.college);
          }
          if (res.data?.user) {
            localStorage.setItem('placement_user', JSON.stringify(res.data.user));
            setUser(res.data.user);
          }
        }).catch(async (err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            try {
              const res = await apiClient.post('/auth/switch-role', {
                targetRole: parsed.roleName || 'SUPER_ADMIN',
              });
              if (res.data?.token) {
                localStorage.setItem('placement_token', res.data.token);
                localStorage.setItem('placement_user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                if (res.data?.college) {
                  localStorage.setItem('placement_college', JSON.stringify(res.data.college));
                  setCollege(res.data.college);
                }
              }
            } catch (e) {
              if (!savedToken.startsWith('offline_demo_token_')) {
                localStorage.removeItem('placement_token');
                localStorage.removeItem('placement_user');
                localStorage.removeItem('placement_college');
                setUser(null);
                setCollege(null);
              }
            }
          }
        });
      } catch (e) {
        localStorage.removeItem('placement_user');
        localStorage.removeItem('placement_token');
        localStorage.removeItem('placement_college');
        setUser(null);
        setCollege(null);
      }
    } else {
      setUser(null);
    }
    // Small timeout for smooth initial load transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Immediate Configuration Synchronization (sync on focus, custom event, or interval)
  const refreshEntitlements = async () => {
    const token = localStorage.getItem('placement_token');
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data?.college) {
        localStorage.setItem('placement_college', JSON.stringify(res.data.college));
        setCollege(res.data.college);
      }
      if (res.data?.user) {
        localStorage.setItem('placement_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const handleSync = () => refreshEntitlements();
    window.addEventListener('focus', handleSync);
    window.addEventListener('campuscorp:sync_entitlements', handleSync);
    const interval = setInterval(refreshEntitlements, 8000); // 8-second background entitlement polling

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('campuscorp:sync_entitlements', handleSync);
      clearInterval(interval);
    };
  }, []);

  const login = async (emailOrUsername, password, collegeCode = null) => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: emailOrUsername,
        password,
        collegeCode: collegeCode || undefined,
      });
      const { token, user: userData, college: collegeData } = res.data;
      localStorage.setItem('placement_token', token);
      localStorage.setItem('placement_user', JSON.stringify(userData));
      setUser(userData);
      if (collegeData) {
        localStorage.setItem('placement_college', JSON.stringify(collegeData));
        setCollege(collegeData);
      }
      return { success: true, user: userData, college: collegeData };
    } catch (err) {
      // Fallback for demo users in case of network or offline server conditions
      if (!err.response || err.response.status >= 500) {
        const norm = (emailOrUsername || '').trim().toLowerCase();
        const demoAccounts = {
          'superadmin': {
            id: 13,
            email: 'superadmin@uniserve.edu',
            firstName: 'Super',
            lastName: 'Administrator',
            roleName: 'SUPER_ADMIN',
            departmentCode: null,
            academicYear: '2026-2027',
          },
          'student.cse1@college.edu': {
            id: 8,
            email: 'student.cse1@college.edu',
            firstName: 'Aditya',
            lastName: 'Varma',
            roleName: 'STUDENT',
            departmentCode: 'CSE',
            studentId: 1,
            registerNumber: '2023CSE001',
            cgpa: '9.35',
            placementStatus: 'PLACED',
            batch: '2023-2027',
            graduationYear: 2027,
            academicYear: '2026-2027',
          },
          'tpo@college.edu': {
            id: 2,
            email: 'tpo@college.edu',
            firstName: 'Vikram',
            lastName: 'Rathore',
            roleName: 'TPO_OFFICER',
            departmentCode: null,
            academicYear: '2026-2027',
          },
          'hod.cse@college.edu': {
            id: 4,
            email: 'hod.cse@college.edu',
            firstName: 'Dr. Ramesh',
            lastName: 'Sundaram',
            roleName: 'FACULTY_COORDINATOR',
            departmentCode: 'CSE',
            academicYear: '2026-2027',
          },
        };

        if (demoAccounts[norm] && (password === 'Password@123' || !password)) {
          const fallbackUser = demoAccounts[norm];
          const demoToken = 'offline_demo_token_' + Date.now();
          localStorage.setItem('placement_token', demoToken);
          localStorage.setItem('placement_user', JSON.stringify(fallbackUser));
          setUser(fallbackUser);
          return { success: true, user: fallbackUser };
        }
      }

      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    }
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await apiClient.post('/auth/switch-role', { targetRole });
      const { token, user: userData, college: collegeData } = res.data;
      localStorage.setItem('placement_token', token);
      localStorage.setItem('placement_user', JSON.stringify(userData));
      setUser(userData);
      if (collegeData) {
        localStorage.setItem('placement_college', JSON.stringify(collegeData));
        setCollege(collegeData);
      }
      return { success: true, user: userData, college: collegeData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to switch portal.',
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('placement_token');
      localStorage.removeItem('placement_user');
      localStorage.removeItem('placement_college');
      setUser(null);
      setCollege(null);
    }
  };

  const isModuleEnabled = (moduleKey) => {
    if (!college || !college.modules) return true;
    const key = String(moduleKey).toUpperCase();
    return college.modules[key] !== false;
  };

  return (
    <AuthContext.Provider value={{ user, college, loading, login, switchRole, logout, isModuleEnabled, refreshEntitlements }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
