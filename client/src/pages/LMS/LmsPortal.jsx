import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const { user } = useAuth();
  const { section } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
    { key: 'manage-courses', label: 'My Courses', icon: BookOpen },
    { key: 'manage-materials', label: 'Materials', icon: FileUp },
    { key: 'manage-quizzes', label: 'Quiz Builder', icon: Sliders },
    { key: 'manage-assignments', label: 'Grading Queue', icon: FileCheck2 },
    { key: 'student-progress', label: 'Student Progress', icon: Users },
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
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  CampusCorp Learning Management System
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                  {user?.roleName?.replace('_', ' ') || 'LMS'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isStudent
                  ? 'Your centralized academic repository, interactive quizzes, assignments, and verified career milestones.'
                  : `Departmental learning governance, curriculum delivery, and student progress tracking (${user?.department_code || 'Institution'}).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border shrink-0 self-start md:self-auto">
            <span>LMS Hub</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-bold text-foreground">{currentNav?.label}</span>
          </div>
        </div>

        {/* Horizontal Navigation Pills for Quick Switching */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelectSection(item.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      <div>
        {isStudent ? (
          <StudentViews activeSection={activeSection} onSelectSection={handleSelectSection} />
        ) : (
          <FacultyViews activeSection={activeSection} onSelectSection={handleSelectSection} />
        )}
      </div>
    </div>
  );
}
export default LmsPortal;
