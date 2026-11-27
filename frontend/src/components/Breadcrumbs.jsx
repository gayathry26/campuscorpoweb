import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';

const ROUTE_LABELS = {
  '': 'Placement Dashboard',
  'domains': 'Career Domains',
  'compare': 'Compare Roles',
  'skill-analyzer': 'Skill Analyzer',
  'github-scanner': 'GitHub Repository Scanner',
  'career-explorer': 'Career Explorer',
  'companies': 'Hiring Companies',
  'jobs': 'Jobs & Openings',
  'drives': 'Placement Drives',
  'applications': 'Applications Pipeline',
  'my-applications': 'My Applications',
  'assessment': 'Programming Assessment',
  'exam': 'CodeSprint Assessment Sandbox',
  'interviews': 'Interview Slots',
  'videocall': 'Video Call Meets',
  'resume-analyzer': 'AI Resume Analyzer',
  'students': 'Students Roster',
  'profile': 'My Student Profile',
  'training': 'Training & Attendance',
  'internships': 'Internships & PPO',
  'offers': 'Offers & Joining',
  'policies': 'Placement Policies',
  'reports': 'Reports & Analytics',
  'finance': 'Budget & Finance',
  'grievances': 'Grievance Desk',
  'admin': 'Admin & DB Registry',
  'academics': 'Department & Academic Data',
  'settings': 'Settings & Preferences',
  'lms': 'Learning Management System',
  // LMS Sections
  'my-learning': 'My Learning',
  'materials': 'Course Materials',
  'quizzes': 'Quizzes & Tests',
  'assignments': 'Assignments',
  'learning-paths': 'Learning Paths',
  'progress': 'Student Progress',
  'live-classes': 'Live Calendar',
  'discussions': 'Discussions & Doubts',
  'notes': 'Notes & Bookmarks',
  'certificates': 'Certificates',
  'notifications': 'LMS Alerts',
  'portfolio': 'Projects & Portfolio',
  'support': 'Help & Support',
  'faculty-dashboard': 'Faculty Overview',
  'class-advisor': 'Class Advisor Hub',
  'faculty-mappings': 'Course & Faculty Permissions',
  'manage-courses': 'My Courses',
  'manage-materials': 'Materials Management',
  'manage-quizzes': 'Quiz Builder',
  'manage-assignments': 'Grading Queue',
  'student-progress': 'Cohort Progress',
  'manage-learning-paths': 'Learning Paths',
  'manage-live-classes': 'Live Sessions',
  'manage-discussions': 'Discussions',
  'manage-certificates': 'Certificates',
  'manage-announcements': 'Announcements',
};

export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Do not render breadcrumbs on root dashboard or video call/exam screens
  if (pathname === '/' || pathname.startsWith('/videocall') || pathname.startsWith('/exam') || pathname.startsWith('/interview/room')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // Build breadcrumb items
  const breadcrumbItems = [];
  let accumulatedPath = '';

  segments.forEach((seg, index) => {
    accumulatedPath += `/${seg}`;
    const isLast = index === segments.length - 1;
    const label = ROUTE_LABELS[seg] || decodeURIComponent(seg).replace(/-/g, ' ');

    breadcrumbItems.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      path: accumulatedPath,
      isLast,
    });
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center justify-between gap-3 mb-5 py-2 px-3 rounded-xl bg-card/60 border border-border/80 text-xs text-muted-foreground backdrop-blur-xs transition-all shadow-2xs"
    >
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-foreground font-medium transition-colors"
          title="Back to Placement Dashboard"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {breadcrumbItems.map((item, idx) => (
          <React.Fragment key={item.path}>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            {item.isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors font-medium truncate max-w-[150px] sm:max-w-[220px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Quick Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all active:scale-95 shrink-0 cursor-pointer"
        title="Go Back to Previous Page"
      >
        <ArrowLeft className="w-3 h-3" />
        <span className="hidden sm:inline">Back</span>
      </button>
    </nav>
  );
}

export default Breadcrumbs;
