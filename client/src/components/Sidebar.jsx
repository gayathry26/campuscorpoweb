import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useUI } from '../context/UIContext';
import { drawerLeftVariants, accordionVariants } from '../utils/motion';
import {
  LayoutDashboard,
  Compass,
  GitCompare,
  Layers,
  Cpu,
  ChevronDown,
  Users,
  Building2,
  Briefcase,
  CalendarDays,
  FileCheck2,
  Code2,
  CalendarCheck,
  Video,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  PieChart,
  DollarSign,
  HeartHandshake,
  AlertCircle,
  Database,
  Settings,
  FileText,
  ShieldAlert,
  FileSearch,
  MapPin,
  X,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const { canAccessPage } = usePermissions();
  const { mobileSidebarOpen, closeMobileSidebar } = useUI();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const role = user?.roleName;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  // Active route helpers
  const isCareerExplorerActive =
    location.pathname.startsWith('/domains') ||
    location.pathname.startsWith('/compare') ||
    location.pathname.startsWith('/skill-analyzer') ||
    location.pathname.startsWith('/role-analyzer') ||
    location.pathname.startsWith('/career-explorer');

  const isLmsActive = location.pathname.startsWith('/lms');

  const isRecruitmentActive =
    location.pathname.startsWith('/companies') ||
    location.pathname.startsWith('/jobs') ||
    location.pathname.startsWith('/drives') ||
    location.pathname.startsWith('/applications') ||
    location.pathname.startsWith('/my-applications') ||
    location.pathname.startsWith('/offers');

  const isAssessmentsActive =
    location.pathname.startsWith('/assessment') ||
    location.pathname.startsWith('/exam') ||
    location.pathname.startsWith('/interviews') ||
    location.pathname.startsWith('/videocall') ||
    location.pathname.startsWith('/interview/room') ||
    location.pathname.startsWith('/resume-analyzer');

  const isStudentsActive =
    location.pathname.startsWith('/students') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/training') ||
    location.pathname.startsWith('/internships');

  const isGovernanceActive =
    location.pathname.startsWith('/policies') ||
    location.pathname.startsWith('/reports') ||
    location.pathname.startsWith('/finance') ||
    location.pathname.startsWith('/grievances');

  const isAdminActive =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/settings');

  // Accordion open/collapsed states - auto-expand if route is inside section
  const [lmsOpen, setLmsOpen] = useState(isLmsActive);
  const [careerExplorerOpen, setCareerExplorerOpen] = useState(isCareerExplorerActive);
  const [recruitmentOpen, setRecruitmentOpen] = useState(isRecruitmentActive);
  const [assessmentsOpen, setAssessmentsOpen] = useState(isAssessmentsActive);
  const [studentsOpen, setStudentsOpen] = useState(isStudentsActive);
  const [governanceOpen, setGovernanceOpen] = useState(isGovernanceActive);
  const [adminOpen, setAdminOpen] = useState(isAdminActive);

  // Auto-expand active section on navigation
  useEffect(() => {
    if (isLmsActive) setLmsOpen(true);
    if (isCareerExplorerActive) setCareerExplorerOpen(true);
    if (isRecruitmentActive) setRecruitmentOpen(true);
    if (isAssessmentsActive) setAssessmentsOpen(true);
    if (isStudentsActive) setStudentsOpen(true);
    if (isGovernanceActive) setGovernanceOpen(true);
    if (isAdminActive) setAdminOpen(true);
  }, [
    isLmsActive,
    isCareerExplorerActive,
    isRecruitmentActive,
    isAssessmentsActive,
    isStudentsActive,
    isGovernanceActive,
    isAdminActive,
  ]);

  // Section items definitions
  const studentLmsItems = [
    { to: '/lms/my-learning', label: 'My Learning', icon: GraduationCap },
    { to: '/lms/materials', label: 'Course Materials', icon: BookOpen },
    { to: '/lms/quizzes', label: 'Quizzes & Assessments', icon: Award },
    { to: '/lms/assignments', label: 'Assignments & Projects', icon: FileCheck2 },
    { to: '/lms/learning-paths', label: 'Learning Paths', icon: Layers },
    { to: '/lms/progress', label: 'My Progress', icon: PieChart },
    { to: '/lms/live-classes', label: 'Live Classes & Calendar', icon: CalendarDays },
    { to: '/lms/discussions', label: 'Discussions & Doubts', icon: HeartHandshake },
    { to: '/lms/notes', label: 'My Notes & Bookmarks', icon: FileText },
    { to: '/lms/certificates', label: 'Certificates & Achievements', icon: Award },
    { to: '/lms/notifications', label: 'LMS Notifications', icon: AlertCircle },
    { to: '/lms/portfolio', label: 'My Projects & Portfolio', icon: Code2 },
    { to: '/lms/support', label: 'Help & Support', icon: AlertCircle },
  ];

  const facultyLmsItems = [
    { to: '/lms/faculty-dashboard', label: 'LMS Dashboard', icon: LayoutDashboard },
    { to: '/lms/manage-courses', label: 'My Courses', icon: BookOpen },
    { to: '/lms/manage-materials', label: 'Course Material Management', icon: FileText },
    { to: '/lms/manage-quizzes', label: 'Quiz Builder', icon: Award },
    { to: '/lms/manage-assignments', label: 'Assignment Management', icon: FileCheck2 },
    { to: '/lms/student-progress', label: 'Student Progress', icon: Users },
    { to: '/lms/manage-learning-paths', label: 'Learning Paths', icon: Layers },
    { to: '/lms/manage-live-classes', label: 'Live Classes & Calendar', icon: CalendarDays },
    { to: '/lms/manage-discussions', label: 'Discussions & Doubts', icon: HeartHandshake },
    { to: '/lms/manage-certificates', label: 'Certificates & Achievements', icon: Award },
    { to: '/lms/manage-announcements', label: 'Announcements', icon: AlertCircle },
    { to: '/lms/reports', label: 'LMS Reports & Analytics', icon: PieChart },
  ];

  const careerExplorerItems = [
    { to: '/domains', label: 'IT Career Domains', icon: Compass },
    { to: '/career-explorer/companies', label: 'IT Companies by Location', icon: MapPin },
    { to: '/compare', label: 'Compare Career Roles', icon: GitCompare },
    { to: '/skill-analyzer', label: 'Industry Skill Analyzer', icon: Layers },
    { to: '/role-analyzer', label: 'Role Requirement Engine', icon: Cpu },
  ];

  // Structure navigation sections
  const sections = [
    // 1. LMS Portal
    {
      id: 'lms',
      label: 'LMS Portal',
      icon: GraduationCap,
      isOpen: lmsOpen,
      toggle: () => setLmsOpen(!lmsOpen),
      isActive: isLmsActive,
      badge: 'Portal',
      canAccess:
        canAccessPage(role, '/lms') ||
        canAccessPage(role, '/lms/my-learning') ||
        canAccessPage(role, '/lms/faculty-dashboard'),
      items: (role === 'STUDENT' ? studentLmsItems : facultyLmsItems).filter((item) =>
        canAccessPage(role, item.to)
      ),
    },
    // 2. Career Explorer
    {
      id: 'career-explorer',
      label: 'Career Explorer',
      icon: Compass,
      isOpen: careerExplorerOpen,
      toggle: () => setCareerExplorerOpen(!careerExplorerOpen),
      isActive: isCareerExplorerActive,
      badge: 'New',
      canAccess:
        canAccessPage(role, '/domains') ||
        canAccessPage(role, '/compare') ||
        canAccessPage(role, '/skill-analyzer') ||
        canAccessPage(role, '/career-explorer/companies'),
      items: careerExplorerItems.filter((item) => canAccessPage(role, item.to)),
    },
    // 3. Recruitment & Placement Drives
    {
      id: 'recruitment',
      label: 'Recruitment & Drives',
      icon: Briefcase,
      isOpen: recruitmentOpen,
      toggle: () => setRecruitmentOpen(!recruitmentOpen),
      isActive: isRecruitmentActive,
      items: [
        { to: '/companies', label: 'Placement Companies', icon: Building2 },
        { to: '/jobs', label: 'Jobs & Openings', icon: Briefcase },
        { to: '/drives', label: 'Placement Drives', icon: CalendarDays },
        { to: '/applications', label: role === 'STUDENT' ? 'My Applications' : 'Applications Pipeline', icon: FileCheck2 },
        { to: '/offers', label: 'Offers & Joining', icon: Award },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    // 4. Assessments & Interviews
    {
      id: 'assessments',
      label: 'Assessments & Prep',
      icon: Code2,
      isOpen: assessmentsOpen,
      toggle: () => setAssessmentsOpen(!assessmentsOpen),
      isActive: isAssessmentsActive,
      items: [
        { to: '/assessment', label: 'Programming Assessment', icon: Code2 },
        { to: '/interviews', label: 'Interview Slots', icon: CalendarCheck },
        { to: '/videocall/interview', label: 'Mock Video Interview', icon: Video },
        { to: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    // 5. Students & Career Development
    {
      id: 'students',
      label: 'Students & Training',
      icon: Users,
      isOpen: studentsOpen,
      toggle: () => setStudentsOpen(!studentsOpen),
      isActive: isStudentsActive,
      items: [
        { to: '/students', label: 'Students Roster', icon: Users },
        { to: '/profile', label: 'My Student Profile', icon: Users },
        { to: '/training', label: 'Training & Attendance', icon: BookOpen },
        { to: '/internships', label: 'Internships & PPO', icon: GraduationCap },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    // 6. Institutional Governance & Reports
    {
      id: 'governance',
      label: 'Governance & Reports',
      icon: FileText,
      isOpen: governanceOpen,
      toggle: () => setGovernanceOpen(!governanceOpen),
      isActive: isGovernanceActive,
      items: [
        { to: '/policies', label: 'Placement Policies', icon: FileText },
        { to: '/reports', label: 'NIRF / NAAC Reports', icon: PieChart },
        { to: '/finance', label: 'Budget & Finance', icon: DollarSign },
        { to: '/grievances', label: 'Grievance Desk', icon: AlertCircle },
      ].filter((item) => canAccessPage(role, item.to)),
    },
    // 7. System Administration
    {
      id: 'admin',
      label: 'Admin & Settings',
      icon: Settings,
      isOpen: adminOpen,
      toggle: () => setAdminOpen(!adminOpen),
      isActive: isAdminActive,
      canAccess: isSuperAdmin || canAccessPage(role, '/admin') || canAccessPage(role, '/settings'),
      items: [
        { to: '/admin', label: 'Admin Management', icon: Database },
        { to: '/settings', label: 'System Settings', icon: Settings },
      ].filter((item) => canAccessPage(role, item.to)),
    },
  ];

  const visibleSections = sections.filter(
    (sec) => (sec.canAccess !== undefined ? sec.canAccess : true) && sec.items.length > 0
  );

  const renderNavList = () => (
    <>
      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* User Role Badge Pill */}
        <div className="px-3 py-2.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/80 border border-border text-foreground">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-foreground text-background">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider truncate">
                {role?.replace('_', ' ') || 'Guest'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {isSuperAdmin ? 'Master Placement Control' : user?.departmentCode ? `${user.departmentCode} Department` : 'Authorized User'}
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-3 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>CampusCorp Modules</span>
          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md text-foreground">
            {visibleSections.reduce((acc, s) => acc + s.items.length, 1)} Modules
          </span>
        </div>

        {/* Navigation Accordion List */}
        <nav className="space-y-1.5">
          {/* Main Dashboard Link */}
          {canAccessPage(role, '/') && (
            <NavLink
              to="/"
              end
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden ${
                  isActive
                    ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
                    : 'text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#fafafa] dark:text-[#0a0a0a]' : 'text-foreground'
                    }`}
                  />
                  <span className="flex-1 truncate">Placement Dashboard</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa] dark:bg-[#0a0a0a]" />
                  )}
                </>
              )}
            </NavLink>
          )}

          {/* Grouped Accordion Sections */}
          {visibleSections.map((sec) => {
            const SectionIcon = sec.icon;
            return (
              <div key={sec.id} className="space-y-0.5">
                <motion.button
                  type="button"
                  onClick={sec.toggle}
                  aria-expanded={sec.isOpen}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden ${
                    sec.isActive
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-foreground'
                      : 'text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <SectionIcon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        sec.isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sec.badge && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground">
                        {sec.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                        sec.isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </motion.button>

                <AnimatePresence initial={false}>
                  {sec.isOpen && sec.items && sec.items.length > 0 && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 0 } : accordionVariants.initial}
                      animate={shouldReduceMotion ? { opacity: 1 } : accordionVariants.animate}
                      exit={shouldReduceMotion ? { opacity: 0 } : accordionVariants.exit}
                      className="pl-3.5 space-y-0.5 pt-0.5 border-l-2 border-border/70 ml-3.5 my-0.5"
                    >
                      {sec.items.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            onClick={closeMobileSidebar}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden ${
                                isActive
                                  ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] font-semibold shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <SubIcon
                                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                    isActive
                                      ? 'text-[#fafafa] dark:text-[#0a0a0a]'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                <span className="flex-1 truncate">{sub.label}</span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa] dark:bg-[#0a0a0a]" />
                                )}
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Pill */}
      <div className="p-3 m-3 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-sidebar-border">
        <div className="flex items-center gap-2 text-sidebar-foreground text-xs font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-foreground" />
          <span>CampusCorp Multi-DB Active</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isSuperAdmin
            ? 'Root access active. Managing institutional permissions & clusters.'
            : 'Role-based access active with dynamic page governance.'}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sticky Sidebar (lg and above) */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-sidebar text-sidebar-foreground sticky top-16 h-[calc(100vh-4rem)] flex-col justify-between border-r border-sidebar-border transition-colors z-30">
        {renderNavList()}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer (< lg) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={closeMobileSidebar}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Sidebar"
              initial={shouldReduceMotion ? { opacity: 0 } : drawerLeftVariants.initial}
              animate={shouldReduceMotion ? { opacity: 1 } : drawerLeftVariants.animate}
              exit={shouldReduceMotion ? { opacity: 0 } : drawerLeftVariants.exit}
              className="relative z-50 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground shadow-2xl flex flex-col justify-between border-r border-sidebar-border h-full"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-sidebar-border flex items-center justify-between shrink-0 bg-card/60">
                <Link to="/" onClick={closeMobileSidebar} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-card p-1 border border-border shadow-xs flex items-center justify-center shrink-0">
                    <img src="/logo-light.jpeg" alt="Logo" className="w-full h-full object-contain dark:hidden" />
                    <img src="/logo-dark.jpeg" alt="Logo" className="w-full h-full object-contain hidden dark:block" />
                  </div>
                  <span className="font-extrabold text-foreground text-base tracking-wider">
                    CampusCorp
                  </span>
                </Link>
                <motion.button
                  type="button"
                  onClick={closeMobileSidebar}
                  aria-label="Close navigation sidebar"
                  whileTap={{ scale: 0.92 }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Nav list */}
              {renderNavList()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
