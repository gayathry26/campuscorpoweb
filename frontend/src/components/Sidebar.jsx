import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useUI } from '../context/UIContext';
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code2,
  Video,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Building2,
  CalendarDays,
  FileCheck2,
  Award,
  Terminal,
  CalendarCheck,
  FileSearch,
  GitCompare,
  Layers,
  GitBranch,
  MapPin,
  FileText,
  DollarSign,
  AlertCircle,
  Database,
  PieChart,
  HeartHandshake,
} from 'lucide-react';

export function Sidebar() {
  const { user, isModuleEnabled, logout } = useAuth();
  const { canAccessPage } = usePermissions();
  const { mobileSidebarOpen, closeMobileSidebar } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Which head section's right-side submenu panel is currently open
  const [openGroupId, setOpenGroupId] = useState(null);
  // Tooltip label on hover (only when no submenu is open for that item)
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const sidebarRef = useRef(null);

  const role = user?.roleName;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const pathname = location.pathname;

  // Close right-side panel on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenGroupId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenGroupId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close right-side panel on route change
  useEffect(() => {
    setOpenGroupId(null);
  }, [pathname]);

  const studentLmsItems = [
    { to: '/lms/my-learning', label: 'My Learning', icon: GraduationCap },
    { to: '/lms/materials', label: 'Course Materials', icon: BookOpen },
    { to: '/lms/quizzes', label: 'Quizzes & Tests', icon: Award },
    { to: '/lms/assignments', label: 'Assignments', icon: FileCheck2 },
    { to: '/lms/learning-paths', label: 'Learning Paths', icon: Layers },
    { to: '/lms/progress', label: 'My Progress', icon: PieChart },
    { to: '/lms/live-classes', label: 'Live Classes', icon: CalendarDays },
    { to: '/lms/discussions', label: 'Discussions', icon: HeartHandshake },
    { to: '/lms/certificates', label: 'Certificates', icon: Award },
  ];

  const facultyLmsItems = [
    { to: '/lms/faculty-dashboard', label: 'LMS Overview', icon: LayoutDashboard },
    { to: '/lms/manage-courses', label: 'Course Management', icon: BookOpen },
    { to: '/lms/manage-materials', label: 'Study Materials', icon: FileText },
    { to: '/lms/manage-quizzes', label: 'Quiz Builder', icon: Award },
    { to: '/lms/manage-assignments', label: 'Assignments', icon: FileCheck2 },
    { to: '/lms/student-progress', label: 'Student Progress', icon: Users },
    { to: '/lms/reports', label: 'Learning Reports', icon: PieChart },
  ];

  const rawGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      primaryTo: role === 'STUDENT' ? '/dashboard' : '/',
      isActive: pathname === '/' || pathname === '/dashboard' || pathname === '/portal',
      canAccess: canAccessPage(role, '/') || role === 'STUDENT',
      items: [],
    },
    {
      id: 'career',
      moduleKey: 'CAREER_EXPLORER',
      label: 'Career Intelligence',
      icon: Compass,
      primaryTo: '/domains',
      isActive:
        pathname.startsWith('/domains') ||
        pathname.startsWith('/compare') ||
        pathname.startsWith('/skill-analyzer') ||
        pathname.startsWith('/github-scanner') ||
        pathname.startsWith('/role-analyzer') ||
        (pathname.startsWith('/career-explorer') && !pathname.startsWith('/career-explorer/knowledge-hub')),
      canAccess: isModuleEnabled('CAREER_EXPLORER'),
      items: [
        { to: '/domains', label: 'IT Career Domains', icon: Compass },
        { to: '/compare', label: 'Compare Career Roles', icon: GitCompare },
        { to: '/skill-analyzer', label: 'Skill Analyzer', icon: Layers, moduleKey: 'SKILL_ANALYZER' },
        { to: '/github-scanner', label: 'GitHub Repo Scanner', icon: GitBranch },
        { to: '/career-explorer/companies', label: 'IT Companies by Location', icon: MapPin, moduleKey: 'COMPANY_LOCATIONS' },
      ].filter((item) => (!item.moduleKey || isModuleEnabled(item.moduleKey)) && canAccessPage(role, item.to)),
    },
    {
      id: 'knowledge',
      moduleKey: 'CAREER_EXPLORER',
      label: 'Knowledge Hub',
      icon: BookOpen,
      primaryTo: '/career-explorer/knowledge-hub',
      isActive: pathname.startsWith('/career-explorer/knowledge-hub') || pathname.startsWith('/knowledge-hub'),
      canAccess: isModuleEnabled('CAREER_EXPLORER') && canAccessPage(role, '/domains'),
      items: [],
    },
    {
      id: 'lms',
      moduleKey: 'LMS',
      label: 'Learning (LMS)',
      icon: GraduationCap,
      primaryTo: role === 'STUDENT' ? '/lms/my-learning' : '/lms/faculty-dashboard',
      isActive: pathname.startsWith('/lms'),
      canAccess:
        isModuleEnabled('LMS') &&
        (canAccessPage(role, '/lms') ||
          canAccessPage(role, '/lms/my-learning') ||
          canAccessPage(role, '/lms/faculty-dashboard')),
      items: isModuleEnabled('LMS')
        ? (role === 'STUDENT' ? studentLmsItems : facultyLmsItems).filter((item) => canAccessPage(role, item.to))
        : [],
    },
    {
      id: 'placements',
      moduleKey: 'RECRUITMENT',
      label: 'Placements',
      icon: Briefcase,
      primaryTo: '/jobs',
      isActive:
        pathname.startsWith('/companies') ||
        pathname.startsWith('/jobs') ||
        pathname.startsWith('/drives') ||
        pathname.startsWith('/applications') ||
        pathname.startsWith('/my-applications') ||
        pathname.startsWith('/offers'),
      canAccess: isModuleEnabled('RECRUITMENT'),
      items: isModuleEnabled('RECRUITMENT')
        ? [
            { to: '/jobs', label: 'Job Opportunities', icon: Briefcase },
            { to: '/drives', label: 'Placement Drives', icon: CalendarDays },
            { to: '/companies', label: 'Industry Partners', icon: Building2 },
            { to: '/applications', label: role === 'STUDENT' ? 'My Applications' : 'Applications', icon: FileCheck2 },
            { to: '/offers', label: 'Offers & Joining', icon: Award },
          ].filter((item) => canAccessPage(role, item.to))
        : [],
    },
    {
      id: 'assessments',
      moduleKey: 'ASSESSMENTS',
      label: 'Assessment Center',
      icon: Code2,
      primaryTo: '/assessment',
      isActive:
        pathname.startsWith('/assessment') ||
        pathname.startsWith('/compiler') ||
        pathname.startsWith('/sandbox') ||
        pathname.startsWith('/exam') ||
        pathname.startsWith('/resume-analyzer'),
      canAccess: isModuleEnabled('ASSESSMENTS'),
      items: isModuleEnabled('ASSESSMENTS')
        ? [
            { to: '/assessment', label: 'Coding Assessments', icon: Code2 },
            { to: '/compiler', label: 'Online Compiler', icon: Terminal },
            { to: '/resume-analyzer', label: 'AI Resume Analyzer', icon: FileSearch, moduleKey: 'RESUME_AI' },
          ].filter((item) => (!item.moduleKey || isModuleEnabled(item.moduleKey)) && canAccessPage(role, item.to))
        : [],
    },
    {
      id: 'interviews',
      moduleKey: 'ASSESSMENTS',
      label: 'Interview Studio',
      icon: Video,
      primaryTo: '/videocall/interview',
      isActive:
        pathname.startsWith('/interviews') ||
        pathname.startsWith('/videocall') ||
        pathname.startsWith('/interview/room'),
      canAccess: isModuleEnabled('ASSESSMENTS') && isModuleEnabled('INTERVIEWS'),
      items: [
        { to: '/videocall/interview', label: 'Live Video Interview', icon: Video },
        { to: '/interviews', label: 'Interview Schedule', icon: CalendarCheck },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    {
      id: 'students',
      label: 'Student Intelligence',
      icon: Users,
      primaryTo: role === 'STUDENT' ? '/profile' : '/students',
      isActive:
        pathname.startsWith('/students') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/training') ||
        pathname.startsWith('/internships'),
      canAccess: true,
      items: [
        { to: '/profile', label: 'My Profile', icon: Users },
        { to: '/students', label: 'Student Roster', icon: Users },
        { to: '/training', label: 'Training & Readiness', icon: BookOpen },
        { to: '/internships', label: 'Internships & PPO', icon: GraduationCap },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    {
      id: 'governance',
      moduleKey: 'GOVERNANCE',
      label: 'Institutional Reports',
      icon: BarChart3,
      primaryTo: '/reports',
      isActive:
        pathname.startsWith('/policies') ||
        pathname.startsWith('/reports') ||
        pathname.startsWith('/finance') ||
        pathname.startsWith('/grievances'),
      canAccess: isModuleEnabled('GOVERNANCE'),
      items: isModuleEnabled('GOVERNANCE')
        ? [
            { to: '/reports', label: 'NIRF / NAAC Analytics', icon: PieChart },
            { to: '/policies', label: 'Placement Policies', icon: FileText },
            { to: '/finance', label: 'Budget & Finance', icon: DollarSign },
            { to: '/grievances', label: 'Grievance Desk', icon: AlertCircle },
          ].filter((item) => canAccessPage(role, item.to))
        : [],
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Settings,
      primaryTo: '/settings',
      isActive: pathname.startsWith('/admin') || pathname.startsWith('/settings'),
      canAccess: isSuperAdmin || canAccessPage(role, '/admin') || canAccessPage(role, '/settings'),
      items: [
        { to: '/admin', label: 'Admin Management', icon: Database },
        { to: '/admin/domain-knowledge-hub', label: 'Knowledge Hub CMS', icon: BookOpen },
        { to: '/settings', label: 'System Settings', icon: Settings },
      ].filter((item) => canAccessPage(role, item.to)),
    },
  ];

  const visibleGroups = rawGroups.filter(
    (g) => g.canAccess && (g.items.length > 0 || g.id === 'dashboard' || g.id === 'knowledge')
  );

  const handleGroupClick = (group) => {
    if (group.items.length === 0) {
      setOpenGroupId(null);
      closeMobileSidebar();
      navigate(group.primaryTo);
      return;
    }
    // Toggle right-side submenu panel (never drops down vertically)
    setOpenGroupId((prev) => (prev === group.id ? null : group.id));
  };

  const renderIconRail = (isMobile = false) => (
    <div className="flex flex-col items-center w-[68px] h-full bg-sidebar border-r border-sidebar-border py-3 select-none relative z-20">
      {/* Top Brand Logo */}
      <Link
        to={role === 'STUDENT' ? '/dashboard' : '/'}
        onClick={() => {
          setOpenGroupId(null);
          if (isMobile) closeMobileSidebar();
        }}
        title="CampusCorpo"
        className="w-10 h-10 rounded-xl bg-white dark:bg-[#262126] border border-border p-1 flex items-center justify-center shadow-2xs hover:border-[#8B2942]/40 transition-colors mb-5 shrink-0"
      >
        <img src="/logo-light.jpeg" alt="CampusCorpo" className="w-full h-full object-contain dark:hidden" />
        <img src="/logo-dark.jpeg" alt="CampusCorpo" className="w-full h-full object-contain hidden dark:block" />
      </Link>

      {/* Pure Icon-Only Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1.5 w-full px-2">
        {visibleGroups.map((group, idx) => {
          const Icon = group.icon;
          const isSelected = openGroupId === group.id;
          const isHighlighted = group.isActive || isSelected;
          const alignBottom = idx >= visibleGroups.length - 3 && visibleGroups.length > 4;

          return (
            <div
              key={group.id}
              className="relative w-full flex justify-center"
              onMouseEnter={() => setHoveredGroupId(group.id)}
              onMouseLeave={() => setHoveredGroupId(null)}
            >
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                aria-label={group.label}
                aria-expanded={group.items.length > 0 ? isSelected : undefined}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  isHighlighted
                    ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] ring-1 ring-[#8B2942]/20 shadow-2xs'
                    : 'text-[#858087] hover:text-[#29252A] dark:hover:text-white hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Simple Hover Tooltip (only when this icon's submenu isn't open) */}
              {!isSelected && hoveredGroupId === group.id && (
                <div className="pointer-events-none absolute left-[62px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-[#29252A] text-white text-xs font-medium whitespace-nowrap shadow-md">
                  {group.label}
                </div>
              )}

              {/* Compact, Content-Sized Submenu Popover Directly Beside Clicked Icon */}
              <AnimatePresence>
                {isSelected && group.items.length > 0 && (
                  <motion.div
                    key={group.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -6, scale: 0.98 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`absolute left-[64px] ${
                      alignBottom ? 'bottom-0 origin-bottom-left' : 'top-0 origin-top-left'
                    } z-50 w-56 max-h-[75vh] overflow-y-auto bg-popover text-popover-foreground rounded-xl border border-border shadow-lg p-1.5`}
                  >
                    <div className="px-2.5 py-1.5 mb-1 border-b border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const SubIcon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                              setOpenGroupId(null);
                              if (isMobile) closeMobileSidebar();
                            }}
                            className={({ isActive }) =>
                              `group/item flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                  ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-semibold'
                                  : 'text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                              }`
                            }
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.8] text-muted-foreground group-hover/item:text-[#8B2942]" />
                            <span className="flex-1 truncate">{item.label}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                          </NavLink>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom Sign Out Icon */}
      <div className="pt-3 border-t border-sidebar-border flex flex-col items-center w-full px-2 shrink-0">
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          aria-label="Sign Out"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#858087] hover:text-[#8B2942] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </div>
  );

  return (
    <div ref={sidebarRef} className="relative flex shrink-0">
      {/* Desktop: Always 68px Icon-Only Rail with Compact Inline Popover Submenus */}
      <aside aria-label="Primary Navigation" className="hidden lg:block sticky top-0 h-screen z-40">
        {renderIconRail(false)}
      </aside>

      {/* Mobile: Icon-Only Rail Drawer with Compact Inline Popover Submenus */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpenGroupId(null);
                closeMobileSidebar();
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <div className="relative flex h-full z-10">
              {renderIconRail(true)}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Sidebar;
