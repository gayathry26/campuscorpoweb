import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/ThemeContext';
import { usePermissions } from '../context/PermissionContext';
import { dropdownVariants } from '../utils/motion';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  CalendarDays,
  FileCheck2,
  Award,
  Send,
  MessageSquare,
  ClipboardList,
  Calendar,
  ShieldCheck,
  User,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Bell,
  BellOff,
  Compass,
  BookOpen,
  Code2,
  Settings,
  ShieldAlert,
  Users,
  PieChart,
  FileText,
  SlidersHorizontal,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const { user, college, switchRole, logout } = useAuth();
  const { isDark, toggleDarkMode, notificationsEnabled, placementAlertsEnabled } = usePreferences();
  const { canAccessPage } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleRef = useRef(null);
  const notifRef = useRef(null);
  const moreRef = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setRoleDropdownOpen(false);
        setNotifDropdownOpen(false);
        setMoreDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const portals = [
    { role: 'SUPER_ADMIN', label: 'Master Super Administrator', icon: ShieldCheck },
    { role: 'TPO_OFFICER', label: 'Placement Officer / TPO Portal', icon: Award },
    { role: 'STUDENT', label: 'Student Portal (Aditya - CSE)', icon: User },
    { role: 'FACULTY_COORDINATOR', label: 'Dept Coordinator (Prof. Suresh)', icon: BookOpen },
    { role: 'RECRUITER', label: 'Company Recruiter (Google)', icon: Building2 },
    { role: 'MANAGEMENT', label: 'Management / Principal Portal', icon: ShieldCheck },
    { role: 'ALUMNI', label: 'Alumni Portal (Alex - AWS)', icon: User },
  ];

  const handleRoleSelect = async (r) => {
    setRoleDropdownOpen(false);
    await switchRole(r);
  };

  const getPortalLabel = () => {
    if (!user) return 'CampusCorp';
    const found = portals.find(p => p.role === user.roleName);
    return found ? found.label : `${user.roleName}`;
  };

  // Current route and tab active checking
  const currentPath = location.pathname;
  const currentTab = new URLSearchParams(location.search).get('tab');

  const checkIsActive = (path, tab) => {
    if (tab) {
      return currentPath.startsWith('/jobs') && currentTab === tab;
    }
    if (path === '/jobs') {
      return currentPath.startsWith('/jobs') && (!currentTab || currentTab === 'jobs');
    }
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  // Primary horizontal navigation links as requested
  const primaryNavItems = [
    {
      name: 'Home',
      path: user?.roleName === 'STUDENT' ? '/dashboard' : '/dashboard',
      icon: LayoutDashboard,
      isActive: checkIsActive('/dashboard')
    },
    {
      name: 'Companies',
      path: '/companies',
      icon: Building2,
      isActive: checkIsActive('/companies')
    },
    {
      name: 'Jobs',
      path: '/jobs',
      icon: Briefcase,
      isActive: checkIsActive('/jobs')
    },
    {
      name: 'Drives',
      path: '/drives',
      icon: CalendarDays,
      isActive: checkIsActive('/drives')
    },
    {
      name: 'Tracker',
      path: '/applications',
      icon: FileCheck2,
      isActive: checkIsActive('/applications')
    },
    {
      name: 'Offers',
      path: '/offers',
      icon: Award,
      isActive: checkIsActive('/offers')
    },
    {
      name: 'Requests',
      path: '/jobs?tab=requests',
      icon: Send,
      isActive: checkIsActive('/jobs', 'requests')
    },
    {
      name: 'Chat',
      path: '/jobs?tab=chat',
      icon: MessageSquare,
      isActive: checkIsActive('/jobs', 'chat')
    },
    {
      name: 'Survey',
      path: '/jobs?tab=survey',
      icon: ClipboardList,
      isActive: checkIsActive('/jobs', 'survey')
    },
    {
      name: 'Calendar',
      path: '/jobs?tab=calendar',
      icon: Calendar,
      isActive: checkIsActive('/jobs', 'calendar')
    },
    {
      name: 'Policy',
      path: '/policies',
      icon: ShieldCheck,
      isActive: checkIsActive('/policies')
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      isActive: checkIsActive('/profile')
    }
  ];

  // Secondary platform modules in 'More' dropdown
  const secondaryNavItems = [
    {
      name: 'Career Explorer',
      path: '/domains',
      icon: Compass,
      description: '16 IT Domains, Role Matrices & Skills'
    },
    {
      name: 'LMS Portal',
      path: '/lms',
      icon: BookOpen,
      description: 'Semester Classroom, Assignments & Exams'
    },
    {
      name: 'Coding & Mock Assessments',
      path: '/assessment',
      icon: Code2,
      description: 'Live Code Sandbox & Proctored Tests'
    },
    {
      name: 'Department Students',
      path: '/students',
      icon: Users,
      description: 'Student Roster, Academic Records & 360°',
      show: ['SUPER_ADMIN', 'TPO_OFFICER', 'ADMIN', 'FACULTY_COORDINATOR'].includes(user?.roleName)
    },
    {
      name: 'Governance & Reports',
      path: '/reports',
      icon: PieChart,
      description: 'Placement Analytics, Audit & NAAC Logs',
      show: ['SUPER_ADMIN', 'TPO_OFFICER', 'ADMIN', 'MANAGEMENT'].includes(user?.roleName)
    },
    {
      name: 'Institution Admin Console',
      path: '/admin',
      icon: ShieldAlert,
      description: 'RBAC, Department Config & Entitlements',
      show: ['SUPER_ADMIN', 'ADMIN'].includes(user?.roleName)
    },
    {
      name: 'Settings & Appearance',
      path: '/settings',
      icon: Settings,
      description: 'Personal Preferences, Theme & Password'
    }
  ].filter(item => item.show === undefined || item.show === true);

  const isMoreActive = secondaryNavItems.some(item => checkIsActive(item.path));

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 transition-colors shadow-2xs">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-7 h-15 sm:h-16 flex items-center justify-between gap-3">
        
        {/* ========================================================
            LEFT: Brand Logo ('h' lettermark / CampusCorp)
        ======================================================== */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 group outline-hidden"
            title="CampusCorp Placement & Career Platform"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-serif italic font-bold text-lg shadow-2xs group-hover:scale-105 transition-transform">
              h
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-neutral-950 dark:text-white tracking-tight text-base flex items-center">
                CampusCorp
                <span className="w-1.5 h-1.5 rounded-full inline-block ml-1 bg-emerald-600" />
              </span>
            </div>
          </Link>
        </div>


        {/* ========================================================
            CENTER: Single Horizontal Top Navigation Bar
        ======================================================== */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 text-xs sm:text-[13px] font-medium overflow-x-auto no-scrollbar">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.isActive
                    ? 'border border-neutral-300 dark:border-neutral-700 bg-neutral-100/90 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${item.isActive ? 'text-neutral-950 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* More Platform Modules Dropdown */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                isMoreActive || moreDropdownOpen
                  ? 'border border-neutral-300 dark:border-neutral-700 bg-neutral-100/90 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {moreDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 origin-top-left"
                >
                  <div className="px-3.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Extended Platform Modules</p>
                  </div>
                  <div className="py-1">
                    {secondaryNavItems.map((mod) => {
                      const Icon = mod.icon;
                      const isActive = checkIsActive(mod.path);
                      return (
                        <Link
                          key={mod.name}
                          to={mod.path}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-start gap-2.5 px-3.5 py-2 transition-colors ${
                            isActive
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 mt-0.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-tight">{mod.name}</p>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate leading-snug mt-0.5">{mod.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>


        {/* ========================================================
            RIGHT: Role Switcher, Theme, Alerts, User Avatar
        ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Active Portal Role Switcher */}
          <div ref={roleRef} className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
              title="Switch Active Persona"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="max-w-[130px] truncate">{getPortalLabel()}</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 origin-top-right"
                >
                  <div className="px-3.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Switch Persona</p>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {portals.map((p) => {
                      const Icon = p.icon;
                      const isActive = user?.roleName === p.role;
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handleRoleSelect(p.role)}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-950 dark:text-white'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="flex-1 truncate">{p.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle (Moon / Sun) */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 sm:p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              title="Career Alerts & Drive Notifications"
              className="p-1.5 sm:p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer relative"
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4 opacity-50" />
              )}
              {notificationsEnabled && placementAlertsEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-emerald-600" />
              )}
            </button>

            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-3.5 z-50 origin-top-right"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                    <span className="text-xs font-bold">Placement Alerts</span>
                    <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                      <p className="font-bold text-neutral-950 dark:text-white">Dentsu Global Services Live</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Application deadline tomorrow at 09:00 AM.</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                      <p className="font-bold text-neutral-950 dark:text-white">Venue Attendance Open</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Mark attendance via QR scan in Requests.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-900 dark:text-neutral-100 hover:border-neutral-400 transition-colors cursor-pointer"
              title={user ? `${user.firstName || user.name}` : 'Profile'}
            >
              {user ? (user.firstName?.[0] || user.name?.[0] || 'U') : 'U'}
            </Link>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================
          MOBILE / TABLET DROPDOWN DRAWER
      ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 shadow-lg max-h-[80vh] overflow-y-auto"
          >
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Primary Navigation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              {primaryNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      item.isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-950 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-3 mb-2">
              All Modules
            </div>
            <div className="space-y-1">
              {secondaryNavItems.map(mod => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.name}
                    to={mod.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  >
                    <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="font-medium">{mod.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
