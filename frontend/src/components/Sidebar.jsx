import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useUI } from '../context/UIContext';
import { drawerLeftVariants } from '../utils/motion';
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
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
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
  const { mobileSidebarOpen, closeMobileSidebar, sidebarExpanded, toggleSidebarExpanded } = useUI();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const hoverTimeoutRef = useRef(null);

  const role = user?.roleName;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const pathname = location.pathname;

  // Build role- & entitlement-aware navigation groups
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

  // Auto-open active group in expanded mode
  useEffect(() => {
    const active = visibleGroups.find((g) => g.isActive);
    if (active) {
      setExpandedGroups((prev) => ({ ...prev, [active.id]: true }));
    }
  }, [pathname]);

  const handleMouseEnterGroup = (groupId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredGroup(groupId);
  };

  const handleMouseLeaveGroup = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredGroup(null);
    }, 140);
  };

  const toggleGroupAccordion = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Collapsed 68px Icon-Only Rail (Reference UI Inspired)
  const renderCollapsedRail = () => (
    <aside
      aria-label="Primary Navigation"
      className="hidden lg:flex flex-col items-center w-[68px] shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen py-3 z-40 select-none"
    >
      {/* Top Brand Logo */}
      <Link
        to={role === 'STUDENT' ? '/dashboard' : '/'}
        title="CampusCorpo"
        className="w-10 h-10 rounded-xl bg-white dark:bg-[#262126] border border-border p-1 flex items-center justify-center shadow-2xs hover:border-[#8B2942]/40 transition-colors mb-5 shrink-0"
      >
        <img src="/logo-light.jpeg" alt="CampusCorpo" className="w-full h-full object-contain dark:hidden" />
        <img src="/logo-dark.jpeg" alt="CampusCorpo" className="w-full h-full object-contain hidden dark:block" />
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-1.5 w-full px-2 overflow-visible">
        {visibleGroups.map((group) => {
          const Icon = group.icon;
          const isHovered = hoveredGroup === group.id;
          const targetRoute = group.items.length > 0 ? group.items[0].to : group.primaryTo;

          return (
            <div
              key={group.id}
              className="relative w-full flex justify-center"
              onMouseEnter={() => handleMouseEnterGroup(group.id)}
              onMouseLeave={handleMouseLeaveGroup}
            >
              <Link
                to={targetRoute}
                aria-label={group.label}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
                  group.isActive
                    ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] shadow-2xs ring-1 ring-[#8B2942]/20'
                    : 'text-[#858087] hover:text-[#29252A] dark:hover:text-white hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </Link>

              {/* Hover Tooltip / Flyout Submenu */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -4 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                    onMouseEnter={() => handleMouseEnterGroup(group.id)}
                    onMouseLeave={handleMouseLeaveGroup}
                    className="absolute left-[58px] top-0 z-50 pl-2"
                  >
                    {group.items.length > 0 ? (
                      <div className="w-56 bg-popover text-popover-foreground rounded-xl border border-border shadow-lg py-2 px-1.5">
                        <div className="px-2.5 py-1.5 mb-1 border-b border-border">
                          <p className="text-xs font-bold text-foreground">{group.label}</p>
                        </div>
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const SubIcon = item.icon;
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setHoveredGroup(null)}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    isActive
                                      ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-semibold'
                                      : 'text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                                  }`
                                }
                              >
                                <SubIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
                                <span className="truncate">{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-[#29252A] text-white text-xs font-semibold whitespace-nowrap shadow-md">
                        {group.label}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom Controls: Expand Sidebar + Sign Out */}
      <div className="pt-3 border-t border-sidebar-border flex flex-col items-center gap-1.5 w-full px-2 shrink-0">
        <button
          type="button"
          onClick={toggleSidebarExpanded}
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#858087] hover:text-[#29252A] dark:hover:text-white hover:bg-[#F7F6F7] dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="w-4 h-4 stroke-[1.8]" />
        </button>
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          aria-label="Sign Out"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#858087] hover:text-[#8B2942] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.8]" />
        </button>
      </div>
    </aside>
  );

  // Expanded 248px Sidebar (and Mobile Drawer Content)
  const renderExpandedContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header with Logo & Collapse Toggle */}
      <div className="h-14 px-4 border-b border-sidebar-border flex items-center justify-between gap-2 shrink-0">
        <Link
          to={role === 'STUDENT' ? '/dashboard' : '/'}
          onClick={isMobile ? closeMobileSidebar : undefined}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#262126] border border-border p-1 flex items-center justify-center shrink-0">
            <img src="/logo-light.jpeg" alt="CampusCorpo" className="w-full h-full object-contain dark:hidden" />
            <img src="/logo-dark.jpeg" alt="CampusCorpo" className="w-full h-full object-contain hidden dark:block" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground truncate">
            CampusCorpo
          </span>
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSidebarExpanded}
            title="Collapse to Icon Rail"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {visibleGroups.map((group) => {
          const Icon = group.icon;
          const hasChildren = group.items.length > 0;
          const isOpen = !!expandedGroups[group.id];

          if (!hasChildren) {
            return (
              <NavLink
                key={group.id}
                to={group.primaryTo}
                end={group.primaryTo === '/'}
                onClick={isMobile ? closeMobileSidebar : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive || group.isActive
                      ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-semibold'
                      : 'text-[#858087] hover:text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                <span className="truncate">{group.label}</span>
              </NavLink>
            );
          }

          return (
            <div key={group.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleGroupAccordion(group.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  group.isActive
                    ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-semibold'
                    : 'text-[#858087] hover:text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                <span className="flex-1 text-left truncate">{group.label}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
              </button>

              {isOpen && (
                <div className="pl-5 pr-1 py-1 space-y-0.5">
                  {group.items.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={isMobile ? closeMobileSidebar : undefined}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'text-[#8B2942] dark:text-[#F2B8C7] bg-[#F8EDF0]/70 dark:bg-[#312128]/70 font-semibold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-[#F7F6F7] dark:hover:bg-white/5 font-medium'
                          }`
                        }
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-2.5 border-t border-sidebar-border shrink-0">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-[#8B2942] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.8]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: 68px Icon Rail by default, expandable to 248px */}
      {sidebarExpanded ? (
        <aside className="hidden lg:block w-[248px] shrink-0 border-r border-sidebar-border sticky top-0 h-screen z-40">
          {renderExpandedContent(false)}
        </aside>
      ) : (
        renderCollapsedRail()
      )}

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={shouldReduceMotion ? { opacity: 0 } : drawerLeftVariants.initial}
              animate={shouldReduceMotion ? { opacity: 1 } : drawerLeftVariants.animate}
              exit={shouldReduceMotion ? { opacity: 0 } : drawerLeftVariants.exit}
              className="relative w-64 max-w-[82vw] h-full shadow-2xl z-10"
            >
              {renderExpandedContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
