import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { StudentViews } from './components/StudentViews';
import { FacultyViews } from './components/FacultyViews';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  CalendarCheck,
  Award,
  Layers,
  LineChart,
  Video,
  MessageSquare,
  Bookmark,
  Bell,
  FolderGit2,
  HelpCircle,
  LayoutDashboard,
  FileUp,
  Sliders,
  Users,
  Megaphone,
  FileSpreadsheet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function LmsPortal() {
  const { user, isModuleEnabled } = useAuth();
  const { section } = useParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  if (!isModuleEnabled('LMS')) {
    return <Navigate to={user?.roleName === 'STUDENT' ? '/profile' : '/'} replace />;
  }

  const isStudent = user?.roleName === 'STUDENT';

  const studentNav = [
    { key: 'my-learning', label: 'My Learning', icon: GraduationCap },
    { key: 'materials', label: 'Course Materials', icon: BookOpen },
    { key: 'quizzes', label: 'Quizzes & Tests', icon: Sliders },
    { key: 'assignments', label: 'Assignments', icon: FileCheck2 },
    { key: 'learning-paths', label: 'Learning Paths', icon: Layers },
    { key: 'progress', label: 'My Progress', icon: LineChart },
    { key: 'live-classes', label: 'Live Calendar', icon: CalendarCheck },
    { key: 'discussions', label: 'Discussions', icon: MessageSquare },
    { key: 'notes', label: 'Notes & Bookmarks', icon: Bookmark },
    { key: 'certificates', label: 'Certificates', icon: Award },
    { key: 'notifications', label: 'LMS Alerts', icon: Bell },
    { key: 'portfolio', label: 'Projects & Portfolio', icon: FolderGit2 },
    { key: 'support', label: 'Help & Tickets', icon: HelpCircle },
  ];

  const facultyNav = [
    { key: 'faculty-dashboard', label: 'Overview', icon: LayoutDashboard },
    { key: 'class-advisor', label: 'Class Advisor Hub', icon: Users },
    { key: 'faculty-mappings', label: 'Course Permissions', icon: ShieldCheck },
    { key: 'manage-courses', label: 'My Courses', icon: BookOpen },
    { key: 'manage-materials', label: 'Materials', icon: FileUp },
    { key: 'manage-quizzes', label: 'Quiz Builder', icon: Sliders },
    { key: 'manage-assignments', label: 'Grading Queue', icon: FileCheck2 },
    { key: 'student-progress', label: 'Student Progress', icon: LineChart },
    { key: 'manage-learning-paths', label: 'Learning Paths', icon: Layers },
    { key: 'manage-live-classes', label: 'Live Sessions', icon: Video },
    { key: 'manage-discussions', label: 'Discussions', icon: MessageSquare },
    { key: 'manage-certificates', label: 'Certificates', icon: Award },
    { key: 'manage-announcements', label: 'Announcements', icon: Megaphone },
    { key: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
  ];

  const navList = isStudent ? studentNav : facultyNav;
  const defaultSection = isStudent ? 'my-learning' : 'faculty-dashboard';
  const activeSection = section || defaultSection;
  const currentNav = navList.find((n) => n.key === activeSection) || navList[0];

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons, navList.length]);

  // Smoothly scroll the active tab into view when section changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    const timer = setTimeout(updateScrollButtons, 250);
    return () => clearTimeout(timer);
  }, [activeSection, updateScrollButtons]);

  const scrollTabsBy = (amount) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Convert vertical mouse wheel into horizontal scroll over the tab bar
  const handleWheelScroll = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  const handleSelectSection = (key) => {
    navigate(`/lms/${key}`);
  };

  return (
    <div className="space-y-5">
      {/* Compact LMS Header Card with Proper Scrollable Navigation */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[1.9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Learning Management System
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7]">
                  {user?.roleName?.replace(/_/g, ' ') || 'LMS'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isStudent
                  ? 'Courses, study materials, quizzes, assignments, and learning progress.'
                  : `Curriculum delivery, grading queue, and cohort tracking (${user?.department_code || 'Institution'}).`}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-[#F7F6F7] dark:bg-[#262126] px-3 py-1.5 rounded-lg border border-border shrink-0 self-start sm:self-auto">
            <span>LMS</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{currentNav?.label}</span>
          </div>
        </div>

        {/* Scrollable Horizontal Tab Bar with Left/Right Scroll Arrows & Visible Thin Scrollbar */}
        <div className="mt-4 pt-3 border-t border-border relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollTabsBy(-260)}
            disabled={!canScrollLeft}
            aria-label="Scroll tabs left"
            className={`w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              canScrollLeft
                ? 'text-foreground hover:border-[#8B2942] hover:text-[#8B2942] shadow-2xs'
                : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={updateScrollButtons}
            onWheel={handleWheelScroll}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 scroll-smooth lms-tab-scroll"
          >
            {navList.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  ref={isActive ? activeTabRef : null}
                  type="button"
                  onClick={() => handleSelectSection(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#8B2942] text-white font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#F8EDF0] dark:hover:bg-[#312128]'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-muted-foreground'
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollTabsBy(260)}
            disabled={!canScrollRight}
            aria-label="Scroll tabs right"
            className={`w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              canScrollRight
                ? 'text-foreground hover:border-[#8B2942] hover:text-[#8B2942] shadow-2xs'
                : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          {isStudent ? (
            <StudentViews activeSection={activeSection} onSelectSection={handleSelectSection} />
          ) : (
            <FacultyViews activeSection={activeSection} onSelectSection={handleSelectSection} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default LmsPortal;
