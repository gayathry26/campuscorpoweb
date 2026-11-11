import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { UniserveLoader } from '../components/UniserveLoader';
import {
  Lock,
  User,
  Sparkles,
  Briefcase,
  Eye,
  EyeOff,
} from 'lucide-react';

export function Login({ portal = 'student' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Determine portal from prop or pathname
  const currentPortal = (() => {
    if (portal) return portal;
    const path = location.pathname.toLowerCase();
    if (path.includes('/superadmin') || path.includes('/admin')) return 'superadmin';
    if (path.includes('/placement')) return 'placement';
    if (path.includes('/staff')) return 'staff';
    return 'student';
  })();

  // Portal configuration metadata for default credentials & routing
  const portalConfigs = {
    superadmin: {
      defaultUsername: 'admin@college.edu',
      defaultPassword: 'Password123!',
      redirectPath: '/settings',
      label: 'Super Admin',
    },
    student: {
      defaultUsername: 'student.cse1@college.edu',
      defaultPassword: 'Password123!',
      redirectPath: '/profile',
      label: 'Student',
    },
    placement: {
      defaultUsername: 'tpo@college.edu',
      defaultPassword: 'Password123!',
      redirectPath: '/',
      label: 'Placement Officer',
    },
    staff: {
      defaultUsername: 'hod.cse@college.edu',
      defaultPassword: 'Password123!',
      redirectPath: '/students',
      label: 'Faculty',
    },
  };

  const config = portalConfigs[currentPortal] || portalConfigs.student;

  const [username, setUsername] = useState(config.defaultUsername);
  const [password, setPassword] = useState(config.defaultPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Update default credentials whenever portal route changes
  useEffect(() => {
    setUsername(config.defaultUsername);
    setPassword(config.defaultPassword);
    setError('');
  }, [currentPortal]);

  // Brief pre-login loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentPortal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success) {
      const destination = location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : config.redirectPath;
      navigate(destination, { replace: true });
    } else {
      setError(res.message || 'Invalid username or password.');
    }
  };

  if (initialLoading || loading) {
    return (
      <UniserveLoader
        title="CampusCorp"
        subtitle="IT Career Hub"
        status={loading ? 'Authenticating with CampusCorp...' : 'Loading CampusCorp...'}
      />
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row bg-[#0a0f1d] font-sans antialiased">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Clean Dark Brand & Minimal Value Proposition                  */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[54%] lg:h-full relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#0a0f1d] text-slate-100 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/60">
        {/* Subtle Ambient Backlight */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Top: CampusCorp Brand & Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center border border-slate-800 overflow-hidden shrink-0">
            <img
              src="/logo-light.jpeg"
              alt="CampusCorp Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-bold tracking-tight text-white">
              CampusCorp
            </span>
            <span className="w-2 h-2 rounded-full inline-block bg-indigo-500" />
          </div>
        </div>

        {/* Center: Headline, Description & 2 Minimal Feature Highlights */}
        <div className="relative z-10 my-auto py-8 sm:py-12 max-w-lg space-y-6">
          <div className="space-y-3">
            <h1 className="text-[30px] sm:text-[31px] lg:text-[32px] font-bold tracking-tight text-white leading-tight">
              Your Career. Your Future.
            </h1>
            <p className="text-[14.5px] font-normal text-slate-400 leading-relaxed">
              One platform for learning, placements, and career growth.
            </p>
          </div>

          {/* 2 Compact Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-center text-indigo-400 shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-medium text-slate-200">
                AI-Powered Career Insights
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-center text-indigo-400 shrink-0 shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-medium text-slate-200">
                Placement & Application Tracking
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Minimal Portal Switcher & Copyright */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-slate-500 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[12.5px]">
            <span className="text-slate-400 font-medium">Portals:</span>
            <Link
              to="/login"
              className={`px-2.5 py-1 rounded-md text-[12.5px] transition-colors ${
                currentPortal === 'student'
                  ? 'text-white bg-slate-800 font-semibold'
                  : 'text-slate-400 hover:text-white font-normal'
              }`}
            >
              Student
            </Link>
            <Link
              to="/placement"
              className={`px-2.5 py-1 rounded-md text-[12.5px] transition-colors ${
                currentPortal === 'placement'
                  ? 'text-white bg-slate-800 font-semibold'
                  : 'text-slate-400 hover:text-white font-normal'
              }`}
            >
              TPO
            </Link>
            <Link
              to="/staff"
              className={`px-2.5 py-1 rounded-md text-[12.5px] transition-colors ${
                currentPortal === 'staff'
                  ? 'text-white bg-slate-800 font-semibold'
                  : 'text-slate-400 hover:text-white font-normal'
              }`}
            >
              Faculty
            </Link>
            <Link
              to="/superadmin"
              className={`px-2.5 py-1 rounded-md text-[12.5px] transition-colors ${
                currentPortal === 'superadmin'
                  ? 'text-white bg-slate-800 font-semibold'
                  : 'text-slate-400 hover:text-white font-normal'
              }`}
            >
              Admin
            </Link>
          </div>
          <span className="text-[12px] text-slate-500">&copy; {new Date().getFullYear()} CampusCorp</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Focused Clean White Login Form                               */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[46%] lg:h-full bg-white text-slate-900 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-[400px]"
        >
          {/* Header */}
          <div className="mb-6 text-left">
            <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1 text-[13.5px] text-slate-500">
              Sign in to continue to CampusCorp.
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-[13.5px] border border-red-200 font-medium flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Name */}
            <div>
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5">
                User Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or University Email"
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-[14.5px] font-normal text-slate-900 placeholder:text-[13.5px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13.5px] font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 text-[14.5px] font-normal text-slate-900 placeholder:text-[13.5px] placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={shouldReduceMotion ? false : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? false : { scale: 0.98 }}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-70"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
