import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  Compass,
  Megaphone,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function LmsPortal() {
  const { user, college, isModuleEnabled } = useAuth();
  const { section } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  if (!isModuleEnabled('LMS')) {
    // When disabled, the module must not exist in this college's portal: silent redirect
    return <Navigate to={user?.roleName === 'STUDENT' ? '/profile' : '/'} replace />;
  }

  const isStudent = user?.roleName === 'STUDENT';

  // Available sections based on role
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
    { key: 'portfolio', label: 'My Projects', icon: FolderGit2 },
    { key: 'support', label: 'Help & Tickets', icon: HelpCircle },
  ];

  const facultyNav = [
    { key: 'faculty-dashboard', label: 'Overview', icon: LayoutDashboard },
    { key: 'class-advisor', label: 'Class Advisor Hub', icon: Users },
    { key: 'faculty-mappings', label: 'Course & Faculty Permissions', icon: ShieldCheck },
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

  const handleSelectSection = (key) => {
    navigate(`/lms/${key}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  CampusCorp Learning Management System
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                  {user?.roleName?.replace('_', ' ') || 'LMS'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isStudent
                  ? 'Your centralized academic repository, interactive quizzes, assignments, and verified career milestones.'
                  : `Departmental learning governance, curriculum delivery, and student progress tracking (${user?.department_code || 'Institution'}).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-xl border border-border shrink-0 self-start md:self-auto">
            <span>LMS Hub</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-foreground">{currentNav?.label}</span>
          </div>
        </div>

        {/* Horizontal Navigation Pills for Quick Switching */}
        <div className="mt-5 pt-3.5 border-t border-border flex items-center gap-2 overflow-x-auto pb-1 text-sm scrollbar-none">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <motion.button
                key={item.key}
                type="button"
                onClick={() => handleSelectSection(item.key)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-background' : 'text-muted-foreground'}`} />}
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
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
