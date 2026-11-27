import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { dropdownVariants } from '../utils/motion';
import { 
  GraduationCap, 
  Bell, 
  BellOff,
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User, 
  Building2, 
  BookOpen, 
  Award,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const { user, college, switchRole, logout } = useAuth();
  const { isDark, toggleDarkMode, notificationsEnabled, placementAlertsEnabled } = usePreferences();
  const { toggleMobileSidebar, mobileSidebarOpen } = useUI();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const roleRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setRoleDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const portals = [
    { role: 'SUPER_ADMIN', label: 'Master Super Administrator', icon: ShieldCheck },
    { role: 'TPO_OFFICER', label: 'Placement Officer / TPO Portal', icon: Award },
    { role: 'STUDENT', label: 'Student Portal (Aditya - CSE)', icon: GraduationCap },
    { role: 'STUDENT_EEE', label: 'Student Portal (Pooja - EEE)', icon: GraduationCap },
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
    if (!user) return 'CampusCorp Portal';
    if (user.roleName === 'STUDENT') {
      const name = user.firstName || user.first_name || 'Student';
      const dept = user.departmentCode || user.department_code || 'CSE';
      return `Student Portal (${name} - ${dept})`;
    }
    const found = portals.find(p => p.role === user.roleName);
    return found ? found.label : `${user.roleName} Portal`;
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md border-border text-card-foreground transition-colors shadow-2xs">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Menu Toggle + CampusCorp Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Sidebar Hamburger Button */}
          <motion.button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={mobileSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            whileTap={{ scale: 0.92 }}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors cursor-pointer"
          >
            {mobileSidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </motion.button>

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group focus-visible:ring-2 focus-visible:ring-ring rounded-xl outline-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card p-1 border border-border shadow-xs flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                src="/logo-light.jpeg"
                alt="CampusCorp Logo"
                className="w-full h-full object-contain dark:hidden"
              />
              <img
                src="/logo-dark.jpeg"
                alt="CampusCorp Logo"
                className="w-full h-full object-contain hidden dark:block"
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-foreground tracking-wider text-base sm:text-xl flex items-center">
                  CampusCorp
                  <span className="w-1.5 h-1.5 rounded-full inline-block ml-1 bg-foreground" />
                </span>
                {college?.code && college.code !== 'CAMPUS_MAIN' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="w-3 h-3" />
                    <span>{college.code}</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    IT Career Hub
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden md:block">
                {college?.name && college.code !== 'CAMPUS_MAIN'
                  ? `${college.name}`
                  : 'Placement & Career Governance Platform'}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Instant Portal Role Switcher */}
        <div ref={roleRef} className="relative">
          <motion.button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            aria-expanded={roleDropdownOpen}
            aria-haspopup="true"
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-border bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-foreground shrink-0" />
            <span className="hidden xl:inline text-muted-foreground font-medium">Active Portal:</span>
            <span className="text-foreground font-bold truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">{getPortalLabel()}</span>
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {roleDropdownOpen && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border py-2 z-50 origin-top-right"
              >
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Switch Connected Portal</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Live role testing with instant permission sync</p>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {portals.map((p) => {
                    const Icon = p.icon;
                    const isEEE = user?.departmentCode === 'EEE' || user?.department_code === 'EEE';
                    const isActive = p.role === 'STUDENT_EEE'
                      ? user?.roleName === 'STUDENT' && isEEE
                      : p.role === 'STUDENT'
                      ? user?.roleName === 'STUDENT' && !isEEE
                      : user?.roleName === p.role;
                    return (
                      <motion.button
                        key={p.role}
                        type="button"
                        onClick={() => handleRoleSelect(p.role)}
                        whileHover={{ x: 2 }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-neutral-200 dark:bg-neutral-800 font-semibold text-foreground'
                            : 'text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-foreground shrink-0" />
                        <span className="flex-1 truncate">{p.label}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-foreground shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Theme Toggle, Notifications, Profile & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Light / Dark Mode Toggle Button */}
          <motion.button
            type="button"
            onClick={toggleDarkMode}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme mode"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </motion.button>

          {/* Quick Settings Shortcut */}
          <Link
            to="/settings"
            title="Settings & Preferences"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Notifications button */}
          <div ref={notifRef} className="relative">
            <motion.button
              type="button"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              title={notificationsEnabled ? "Notifications" : "Notifications Muted"}
              aria-label="View notifications"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl relative transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              ) : (
                <BellOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-60" />
              )}
              {notificationsEnabled && placementAlertsEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-card bg-foreground" />
              )}
            </motion.button>

            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-2 w-80 sm:w-84 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border p-3.5 z-50 origin-top-right"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2.5">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">CampusCorp Career Alerts</span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {!notificationsEnabled
                        ? 'Muted'
                        : !placementAlertsEnabled
                        ? 'Muted'
                        : '2 Active'}
                    </span>
                  </div>
                  {!notificationsEnabled ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground space-y-1">
                      <BellOff className="w-5 h-5 mx-auto opacity-50" />
                      <p className="font-semibold text-foreground">Notifications Muted</p>
                      <p className="text-[11px]">Turn on in Settings & Preferences to receive career alerts.</p>
                    </div>
                  ) : !placementAlertsEnabled ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">Placement Alerts Muted</p>
                      <p className="text-[11px]">Placement and drive notifications are muted in Settings.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="p-3 rounded-xl border border-border bg-secondary/50 text-foreground">
                        <p className="font-bold text-xs sm:text-sm text-foreground">
                          Google Campus Recruitment Live
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">SDE applications deadline is Nov 30.</p>
                      </div>
                      <div className="p-3 rounded-xl border border-border bg-secondary/50 text-foreground">
                        <p className="font-semibold text-xs sm:text-sm text-foreground">Coding Assessment Saturday 10AM</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">National CodeSprint mock challenge.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-2.5 border-l border-border">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shrink-0">
              {user ? user.firstName?.[0] || 'U' : 'U'}
            </div>
            <div className="hidden lg:block text-left max-w-[140px]">
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-none mt-0.5 truncate">
                {user?.departmentCode ? `${user.departmentCode} • ` : ''}{user?.roleName}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
