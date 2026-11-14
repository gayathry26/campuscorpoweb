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
  Building2,
  GraduationCap,
  Users,
  Shield,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function Login({ portal = 'student' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // 1. Colleges directory & active college state
  const [collegesList, setCollegesList] = useState([]);
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(() => {
    // Read from URL query param (?college=ABC or ?institution=XYZ)
    const params = new URLSearchParams(window.location.search);
    const paramCollege = params.get('college') || params.get('institution');
    if (paramCollege) return paramCollege.toUpperCase();

    // Check host subdomain (e.g. abc.localhost)
    const host = window.location.hostname || '';
    const parts = host.split('.');
    if (parts.length > 2 && !['www', 'api', 'app', 'localhost', 'platform', 'admin'].includes(parts[0].toLowerCase())) {
      return parts[0].toUpperCase();
    }

    // Stored college preference
    const saved = localStorage.getItem('campuscorp_preferred_college');
    return saved ? saved.toUpperCase() : 'ABC';
  });

  const [collegeInfo, setCollegeInfo] = useState(null);
  const [collegesLoading, setCollegesLoading] = useState(true);

  // 2. Active Portal Role ('student' | 'faculty' | 'admin')
  const [activeRole, setActiveRole] = useState(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/superadmin') || path.includes('/admin')) return 'admin';
    if (path.includes('/staff') || path.includes('/faculty')) return 'faculty';
    return 'student';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available colleges directory on mount
  useEffect(() => {
    async function fetchDirectory() {
      try {
        const res = await fetch('/api/v1/auth/colleges/directory');
        const json = await res.json();
        if (json.success && json.colleges) {
          setCollegesList(json.colleges);
        }
      } catch (e) {
        console.warn('Could not fetch colleges directory:', e);
      }
    }
    fetchDirectory();
  }, []);

  // Fetch institutional branding whenever selected college changes
  useEffect(() => {
    let isCancelled = false;
    setCollegesLoading(true);
    setError('');

    async function fetchBranding() {
      try {
        const res = await fetch(`/api/v1/auth/college-info?college=${encodeURIComponent(selectedCollegeCode)}`);
        const json = await res.json();
        if (!isCancelled) {
          if (json.success && json.college) {
            setCollegeInfo(json.college);
            localStorage.setItem('campuscorp_preferred_college', json.college.code);
          } else {
            setCollegeInfo({
              code: selectedCollegeCode,
              name: `${selectedCollegeCode} Educational Institution`,
              affiliation: 'Autonomous Institutional Campus',
            });
          }
        }
      } catch (e) {
        if (!isCancelled) {
          setCollegeInfo({
            code: selectedCollegeCode,
            name: `${selectedCollegeCode} Educational Institution`,
            affiliation: 'Autonomous Institutional Campus',
          });
        }
      } finally {
        if (!isCancelled) setCollegesLoading(false);
      }
    }

    fetchBranding();
    return () => { isCancelled = true; };
  }, [selectedCollegeCode]);

  // Update default credentials whenever college or role changes
  useEffect(() => {
    const code = (selectedCollegeCode || '').toUpperCase();
    if (code === 'ABC') {
      if (activeRole === 'admin') {
        setUsername('admin@abc.edu');
        setPassword('Password@123');
      } else if (activeRole === 'faculty') {
        setUsername('faculty@abc.edu');
        setPassword('Password@123');
      } else {
        setUsername('student@abc.edu');
        setPassword('Password@123');
      }
    } else if (code === 'XYZ') {
      if (activeRole === 'admin') {
        setUsername('admin@xyz.edu');
        setPassword('Password@123');
      } else if (activeRole === 'faculty') {
        setUsername('faculty@xyz.edu');
        setPassword('Password@123');
      } else {
        setUsername('student@xyz.edu');
        setPassword('Password@123');
      }
    } else if (code === 'KCT') {
      if (activeRole === 'admin') {
        setUsername('admin@kct.ac.in');
        setPassword('Password@123');
      } else if (activeRole === 'faculty') {
        setUsername('admin@kct.ac.in');
        setPassword('Password@123');
      } else {
        setUsername('student.test@kct.ac.in');
        setPassword('Password@123');
      }
    } else {
      if (activeRole === 'admin') {
        setUsername('admin@college.edu');
        setPassword('Password@123');
      } else if (activeRole === 'faculty') {
        setUsername('hod.cse@college.edu');
        setPassword('Password@123');
      } else {
        setUsername('student.cse1@college.edu');
        setPassword('Password@123');
      }
    }
    setError('');
  }, [selectedCollegeCode, activeRole]);

  const handleSelectCollege = (newCode) => {
    setSelectedCollegeCode(newCode);
    const params = new URLSearchParams(window.location.search);
    params.set('college', newCode.toLowerCase());
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await login(username.trim(), password, selectedCollegeCode);
    setLoading(false);

    if (res.success) {
      const defaultDest = activeRole === 'student' ? '/profile' : activeRole === 'admin' ? '/college-admin' : '/students';
      const destination = location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : defaultDest;
      navigate(destination, { replace: true });
    } else {
      setError(res.message || 'Invalid username or password for this institution.');
    }
  };

  if (loading) {
    return (
      <UniserveLoader
        title={collegeInfo?.name || 'CampusCorp'}
        subtitle={`Authenticating with ${selectedCollegeCode} Secure Hub...`}
        status="Connecting to Dedicated Institutional Database..."
      />
    );
  }

  const collegeName = collegeInfo?.name || `College ${selectedCollegeCode}`;
  const collegeCode = collegeInfo?.code || selectedCollegeCode;
  const collegeAffiliation = collegeInfo?.affiliation || `${collegeInfo?.type || 'Autonomous'} Academic Campus`;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row bg-[#080d1a] font-sans antialiased">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Dedicated College Brand & Institutional Identity               */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[50%] lg:h-full relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#080d1a] text-slate-100 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Subtle Ambient Backlight */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Top: Dedicated College Logo & Identity */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/95 p-1.5 shadow-md flex items-center justify-center border border-emerald-500/30 overflow-hidden shrink-0">
            {collegeInfo?.logo_url ? (
              <img
                src={collegeInfo.logo_url}
                alt={`${collegeName} Logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-sm tracking-wider">
                {collegeCode}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[19px] sm:text-[21px] font-black tracking-tight text-white truncate">
                {collegeName}
              </span>
              <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {collegeCode}
              </span>
            </div>
            <p className="text-[12px] font-medium text-slate-400 truncate">
              {collegeAffiliation}
            </p>
          </div>
        </div>

        {/* Center: Hero Institutional Message */}
        <div className="relative z-10 my-auto py-8 sm:py-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dedicated Multi-Tenant Institutional Cluster</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-[28px] sm:text-[34px] lg:text-[36px] font-black tracking-tight text-white leading-tight">
              {collegeName}
            </h1>
            <p className="text-[14.5px] font-normal text-slate-300 leading-relaxed">
              Unified institutional gateway for students, faculty coordinators, and placement leadership with dedicated database isolation.
            </p>
          </div>

          {/* Institutional Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated Tenant Isolation</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>

        {/* Bottom Platform Credit */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Powered by <strong>CampusCorp SaaS Hub</strong></span>
          <Link
            to="/platform-admin/login"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>Platform Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Institutional Login Form & Switcher                          */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[50%] lg:h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto space-y-6">

          {/* College Selector Dropdown Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Current Institution Portal
            </label>
            <div className="relative">
              <select
                value={selectedCollegeCode}
                onChange={(e) => handleSelectCollege(e.target.value)}
                className="w-full h-10 pl-3 pr-8 rounded-xl border border-slate-300 text-[13.5px] font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition cursor-pointer appearance-none"
              >
                {collegesList.length > 0 ? (
                  collegesList.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="ABC">ABC Institute of Technology (ABC)</option>
                    <option value="XYZ">XYZ Engineering College (XYZ)</option>
                    <option value="KCT">Kumaraguru College of Technology (KCT)</option>
                    <option value="PSG">PSG College of Technology (PSG)</option>
                    <option value="CIT">Coimbatore Institute of Technology (CIT)</option>
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Portal Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Portal Experience
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveRole('student')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('faculty')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'faculty'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('admin')}
                className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sign In to {collegeCode} Portal
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Enter your verified institutional credentials to continue.
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
                className="p-3 rounded-xl bg-red-50 text-red-700 text-[13px] border border-red-200 font-medium flex items-center gap-2"
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
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                Institutional Email or Username
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
                  placeholder={`user@${selectedCollegeCode.toLowerCase()}.edu`}
                  autoComplete="username"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1">
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
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-70"
              >
                <span>{loading ? 'Authenticating...' : `Sign In to ${collegeCode} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher Pills */}
          <div className="pt-3 border-t border-slate-100">
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Verified Test Institutions
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectCollege('CAMPUS_MAIN')}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                  selectedCollegeCode === 'CAMPUS_MAIN'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🌐 CampusCorp Main
              </button>

              <button
                type="button"
                onClick={() => handleSelectCollege('ABC')}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                  selectedCollegeCode === 'ABC'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏛️ ABC Institute
              </button>

              <button
                type="button"
                onClick={() => handleSelectCollege('XYZ')}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                  selectedCollegeCode === 'XYZ'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🏫 XYZ College
              </button>

              <button
                type="button"
                onClick={() => handleSelectCollege('KCT')}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                  selectedCollegeCode === 'KCT'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🎓 KCT Tech
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
