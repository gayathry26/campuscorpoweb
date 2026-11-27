import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { dropdownVariants } from '../utils/motion';
import {
  Search,
  Bell,
  BellOff,
  HelpCircle,
  ChevronDown,
  ChevronRight,
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
  GraduationCap,
  Compass,
  Briefcase,
  Code2,
  Video,
} from 'lucide-react';

const ROUTE_TITLES = {
  '': 'Dashboard',
  dashboard: 'Dashboard',
  portal: 'Dashboard',
  domains: 'Career Domains',
  'career-explorer': 'Career Intelligence',
  'knowledge-hub': 'Knowledge Hub',
  compare: 'Compare Roles',
  'skill-analyzer': 'Skill Analyzer',
  'github-scanner': 'GitHub Scanner',
  companies: 'Companies',
  jobs: 'Job Opportunities',
  drives: 'Placement Drives',
  applications: 'Applications',
  offers: 'Offers & Joining',
  assessment: 'Assessment Center',
  compiler: 'Online Compiler',
  'resume-analyzer': 'AI Resume Analyzer',
  interviews: 'Interview Schedule',
  videocall: 'Interview Studio',
  students: 'Student Roster',
  profile: 'My Profile',
  training: 'Training',
  internships: 'Internships',
  policies: 'Policies',
  reports: 'Institutional Reports',
  finance: 'Finance',
  grievances: 'Grievances',
  lms: 'LMS Portal',
  admin: 'Administration',
  settings: 'Settings',
};

const QUICK_SEARCH_LINKS = [
  { label: 'IT Career Domains (38+ Domains)', to: '/domains', category: 'Career Intelligence', icon: Compass },
  { label: 'Domain Knowledge Hub (456 Modules)', to: '/career-explorer/knowledge-hub', category: 'Learning', icon: BookOpen },
  { label: 'Compare Career Roles', to: '/compare', category: 'Career Intelligence', icon: Compass },
  { label: 'Industry Skill Analyzer', to: '/skill-analyzer', category: 'Career Intelligence', icon: Compass },
  { label: 'Learning Management System (LMS)', to: '/lms/my-learning', category: 'Learning', icon: GraduationCap },
  { label: 'Job Opportunities & Openings', to: '/jobs', category: 'Placements', icon: Briefcase },
  { label: 'Placement Drives', to: '/drives', category: 'Placements', icon: Briefcase },
  { label: 'Coding Assessments', to: '/assessment', category: 'Assessment Center', icon: Code2 },
  { label: 'AI Resume Analyzer (Mistral 7B)', to: '/resume-analyzer', category: 'Assessment Center', icon: Code2 },
  { label: 'Live Video Interview Studio', to: '/videocall/interview', category: 'Interviews', icon: Video },
  { label: 'NIRF / NAAC Institutional Reports', to: '/reports', category: 'Governance', icon: Building2 },
  { label: 'System Settings & Preferences', to: '/settings', category: 'Account', icon: Settings },
];

export function Navbar() {
  const { user, college, switchRole, logout } = useAuth();
  const { isDark, toggleDarkMode, notificationsEnabled, placementAlertsEnabled } = usePreferences();
  const { toggleMobileSidebar, mobileSidebarOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const roleRef = useRef(null);
  const notifRef = useRef(null);
  const helpRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setRoleDropdownOpen(false);
        setNotifDropdownOpen(false);
        setHelpOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Build compact breadcrumb items from current pathname
  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }];
    let acc = '';
    return segments.slice(0, 3).map((seg) => {
      acc += `/${seg}`;
      const mapped = ROUTE_TITLES[seg] || decodeURIComponent(seg).replace(/-/g, ' ');
      return {
        label: mapped.charAt(0).toUpperCase() + mapped.slice(1),
        to: acc,
      };
    });
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return QUICK_SEARCH_LINKS.slice(0, 6);
    return QUICK_SEARCH_LINKS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const portals = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldCheck },
    { role: 'TPO_OFFICER', label: 'Placement Officer (TPO)', icon: Award },
    { role: 'STUDENT', label: 'Student (CSE)', icon: GraduationCap },
    { role: 'STUDENT_EEE', label: 'Student (EEE)', icon: GraduationCap },
    { role: 'FACULTY_COORDINATOR', label: 'Faculty Coordinator', icon: BookOpen },
    { role: 'RECRUITER', label: 'Recruiter (Google)', icon: Building2 },
    { role: 'MANAGEMENT', label: 'Management / HOD', icon: ShieldCheck },
    { role: 'ALUMNI', label: 'Alumni', icon: User },
  ];

  const handleRoleSelect = async (r) => {
    setRoleDropdownOpen(false);
    await switchRole(r);
  };

  const fullName = user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'User' : 'Guest';
  const roleLabel = user?.roleName ? user.roleName.replace(/_/g, ' ') : 'PORTAL';
  const regOrDept = user?.registerNumber || user?.register_number || user?.departmentCode || roleLabel;

  return (
    <header className="sticky top-0 z-30 h-14 bg-card border-b border-border text-card-foreground">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Brand & Inline Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={mobileSidebarOpen ? 'Close Menu' : 'Open Menu'}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to={user?.roleName === 'STUDENT' ? '/dashboard' : '/'}
            className="font-bold text-sm sm:text-base text-foreground tracking-tight shrink-0 flex items-center gap-1.5"
          >
            <span>CampusCorpo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B2942] inline-block" />
          </Link>

          {college?.code && college.code !== 'CAMPUS_MAIN' && (
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7]">
              {college.code}
            </span>
          )}

          {/* Inline Compact Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-xs text-muted-foreground pl-2 border-l border-border min-w-0">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.to}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.to} className="hover:text-[#8B2942] transition-colors truncate max-w-[140px]">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center: Compact Global Search */}
        <div ref={searchRef} className="relative hidden sm:block flex-1 max-w-md mx-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domains, courses, jobs, modules..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-[#8B2942] focus:bg-card transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                className="absolute left-0 right-0 mt-1.5 bg-popover text-popover-foreground rounded-xl border border-border shadow-lg py-1.5 z-50"
              >
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Navigation
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => {
                          navigate(item.to);
                          setSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-[#F8EDF0] dark:hover:bg-[#312128] transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-md bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="flex-1 font-medium text-foreground truncate">{item.label}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">{item.category}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-3 text-xs text-muted-foreground text-center">No matching modules found.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Role Switcher, Help, Notifications, Theme, User Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Compact Portal Role Switcher */}
          <div ref={roleRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-[#F7F6F7] dark:bg-[#262126] hover:border-[#8B2942]/40 text-xs font-medium text-foreground transition-colors cursor-pointer"
              title="Switch Role Portal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B2942]" />
              <span className="max-w-[110px] truncate">{roleLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-1.5 w-60 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border py-1.5 z-50"
                >
                  <div className="px-3 py-1.5 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Switch Portal View</p>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {portals.map((p) => {
                      const Icon = p.icon;
                      const isEEE = user?.departmentCode === 'EEE' || user?.department_code === 'EEE';
                      const isActive =
                        p.role === 'STUDENT_EEE'
                          ? user?.roleName === 'STUDENT' && isEEE
                          : p.role === 'STUDENT'
                          ? user?.roleName === 'STUDENT' && !isEEE
                          : user?.roleName === p.role;
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handleRoleSelect(p.role)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-semibold'
                              : 'text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 truncate">{p.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#8B2942]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              title="Notifications"
              aria-label="Notifications"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors cursor-pointer"
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 stroke-[1.8]" />
              ) : (
                <BellOff className="w-4 h-4 stroke-[1.8] opacity-60" />
              )}
              {notificationsEnabled && placementAlertsEnabled && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B2942]" />
              )}
            </button>

            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-1.5 w-72 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    <span className="text-[11px] font-semibold text-[#8B2942] bg-[#F8EDF0] dark:bg-[#312128] px-1.5 py-0.5 rounded-md">
                      {notificationsEnabled && placementAlertsEnabled ? '2 Active' : 'Muted'}
                    </span>
                  </div>
                  {!notificationsEnabled || !placementAlertsEnabled ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Alerts are muted in Settings.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border">
                        <p className="text-xs font-semibold text-foreground">Campus Recruitment Live</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">SDE applications open in Placement Drives.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border">
                        <p className="text-xs font-semibold text-foreground">Coding Assessment Ready</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Complete your technical benchmark in Assessment Center.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Help Icon */}
          <div ref={helpRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setHelpOpen(!helpOpen)}
              title="Help & Platform Guide"
              aria-label="Help"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 stroke-[1.8]" />
            </button>

            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-1.5 w-64 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border p-3 z-50 space-y-2"
                >
                  <p className="text-xs font-semibold text-foreground">CampusCorpo Quick Guide</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use the left icon rail to switch between Career Intelligence, Knowledge Hub, Placements, Assessments, and Interview Studio.
                  </p>
                  <Link
                    to="/settings"
                    onClick={() => setHelpOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2942] hover:underline"
                  >
                    <span>Open Preferences & Support</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 stroke-[1.8]" /> : <Moon className="w-4 h-4 stroke-[1.8]" />}
          </button>

          {/* User Profile Pill & Dropdown (Reference UI Inspired) */}
          <div ref={profileRef} className="relative pl-1.5 ml-0.5 border-l border-border">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl bg-[#F7F6F7] dark:bg-[#262126] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] border border-border transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#8B2942] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-tight max-w-[130px]">
                <p className="text-[11px] font-medium text-muted-foreground truncate">
                  {regOrDept}
                </p>
                <p className="text-xs font-bold text-foreground truncate uppercase">
                  {fullName}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden lg:block" />
            </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.initial}
                  animate={shouldReduceMotion ? { opacity: 1 } : dropdownVariants.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : dropdownVariants.exit}
                  className="absolute right-0 mt-1.5 w-52 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border py-1.5 z-50"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{roleLabel}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8B2942] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
