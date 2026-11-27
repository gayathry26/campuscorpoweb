import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformAuthProvider, usePlatformAuth } from './context/PlatformAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionProvider, usePermissions } from './context/PermissionContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UniserveLoader } from './components/UniserveLoader';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Profile } from './pages/Profile';
import { Companies } from './pages/Companies';
import { Jobs } from './pages/Jobs';
import { Drives } from './pages/Drives';
import { Applications } from './pages/Applications';
import { Assessment } from './pages/Assessment';
import { CompilerSandbox } from './pages/CompilerSandbox';
import { Interviews } from './pages/Interviews';
import { Training } from './pages/Training';
import { Internships } from './pages/Internships';
import { Offers } from './pages/Offers';
import { Policies } from './pages/Policies';
import { Reports } from './pages/Reports';
import { Finance } from './pages/Finance';
import { Grievances } from './pages/Grievances';
import { Admin } from './pages/Admin';
import { CollegeAdminDashboard } from './pages/CollegeAdminDashboard';
import { Settings } from './pages/Settings';
import { Domains } from './pages/Domains';
import { DomainDetail } from './pages/DomainDetail';
import { RoleDetailPage } from './pages/RoleDetailPage';
import { CompareRoles } from './pages/CompareRoles';
import { SkillAnalyzer } from './pages/SkillAnalyzer';
import ExamScreen from './pages/LMS/ExamScreen';
import { LmsPortal } from './pages/LMS/LmsPortal';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { InterviewRoomPage } from './pages/videocall/interview';
import { GithubRepoScanner } from './pages/career/GithubRepoScanner';
import { DepartmentAcademicManagement } from './pages/DepartmentAcademicManagement';
import { CompanyLocationExplorer } from './pages/career/CompanyLocationExplorer';
import { CompanyLocationDetail } from './pages/career/CompanyLocationDetail';
import { DomainKnowledgeHub } from './pages/career/DomainKnowledgeHub';
import { DomainLearningWorkspace } from './pages/career/DomainLearningWorkspace';
import { AdminDomainKnowledgeManagement } from './pages/admin/AdminDomainKnowledgeManagement';


// Platform Super Admin (SaaS Governance) Pages
import { PlatformLogin } from './pages/platform/PlatformLogin';
import { PlatformAdminLayout } from './pages/platform/PlatformAdminLayout';
import { PlatformOverview } from './pages/platform/PlatformOverview';
import { CollegeManagement } from './pages/platform/CollegeManagement';
import { CollegeProvisionWizard } from './pages/platform/CollegeProvisionWizard';
import { DatabaseRegistry } from './pages/platform/DatabaseRegistry';
import { ModuleEntitlements } from './pages/platform/ModuleEntitlements';
import { SubscriptionManagement } from './pages/platform/SubscriptionManagement';
import { PlatformAuditLogs } from './pages/platform/PlatformAuditLogs';
import { PlatformSettings } from './pages/platform/PlatformSettings';
import { UserAccessManagement } from './pages/platform/UserAccessManagement';
import { SystemMonitoring } from './pages/platform/SystemMonitoring';

import { UIProvider } from './context/UIContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Breadcrumbs } from './components/Breadcrumbs';
import { PageMotion } from './components/motion/PageMotion';

function Layout({ children }) {
  const location = useLocation();
  const isExam = location.pathname.startsWith('/exam');
  const isVideoCall = location.pathname.startsWith('/videocall') || location.pathname.startsWith('/interview/room');
  const isPlacementPortal = location.pathname.startsWith('/jobs') || location.pathname.startsWith('/placement');

  if (isExam || isVideoCall || isPlacementPortal) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-foreground font-sans w-full p-0 m-0 overflow-x-hidden transition-colors duration-200">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] mx-auto w-full min-w-0">
          <PageMotion locationKey={location.pathname}>
            {children}
          </PageMotion>
        </main>
      </div>
    </div>
  );
}

// Route-to-Module Mapping for Institutional Entitlement Enforcement
function getRequiredModuleForPath(pathname) {
  const p = (pathname || '').toLowerCase();
  if (p.startsWith('/lms')) return 'LMS';
  if (
    p.startsWith('/domains') ||
    p.startsWith('/compare') ||
    p.startsWith('/skill-analyzer') ||
    p.startsWith('/career-explorer') ||
    p.startsWith('/github-scanner') ||
    p.startsWith('/role-analyzer')
  ) {
    return 'CAREER_EXPLORER';
  }
  if (
    p.startsWith('/companies') ||
    p.startsWith('/jobs') ||
    p.startsWith('/drives') ||
    p.startsWith('/applications') ||
    p.startsWith('/my-applications') ||
    p.startsWith('/offers')
  ) {
    return 'RECRUITMENT';
  }
  if (
    p.startsWith('/assessment') ||
    p.startsWith('/exam') ||
    p.startsWith('/interviews') ||
    p.startsWith('/videocall') ||
    p.startsWith('/resume-analyzer')
  ) {
    return 'ASSESSMENTS';
  }
  if (
    p.startsWith('/policies') ||
    p.startsWith('/reports') ||
    p.startsWith('/finance') ||
    p.startsWith('/grievances')
  ) {
    return 'GOVERNANCE';
  }
  return null;
}

// Global Protected Route with Modular SaaS Entitlement & RBAC Enforcement
function ProtectedRoute({ children, path }) {
  const { user, loading, isModuleEnabled } = useAuth();
  const { canAccessPage } = usePermissions();
  const location = useLocation();
  const currentPath = path || location.pathname;

  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Verifying Security Gate..." />;
  }
  if (!user) return <Navigate to="/login" replace />;

  // 1. INSTITUTIONAL MODULE ENTITLEMENT CHECK
  // If a module is disabled by Platform Super Admin for this college, it MUST NOT exist
  const requiredModule = getRequiredModuleForPath(currentPath);
  if (requiredModule && isModuleEnabled && !isModuleEnabled(requiredModule)) {
    // Silent redirection: Never show disabled badges or deactivated screens
    return <Navigate to={user.roleName === 'STUDENT' ? '/profile' : '/dashboard'} replace />;
  }

  // 2. ROLE-BASED ACCESS CONTROL (RBAC) CHECK
  // Super Admin & Admin ALWAYS have master access to all pages!
  // For other users, only ticked checkbox pages are allowed!
  if (user.roleName !== 'SUPER_ADMIN' && user.roleName !== 'ADMIN' && !canAccessPage(user.roleName, currentPath)) {
    return (
      <Layout>
        <div className="bg-card text-card-foreground rounded-2xl p-8 border border-border text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 border border-border">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Page Access Restricted</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            The page <strong className="font-mono text-foreground">{currentPath}</strong> is currently not ticked in the Super Admin Page Permissions Matrix for your role (<strong>{user.roleName}</strong>).
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to={user.roleName === 'STUDENT' ? '/profile' : '/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-transform active:scale-95 bg-primary text-primary-foreground hover:opacity-90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Accessible Modules</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
}

// Global Platform Super Admin Route Guard
function ProtectedPlatformRoute({ children }) {
  const { isAuthenticated, loading } = usePlatformAuth();

  if (loading) {
    return <UniserveLoader title="CampusCorp SaaS Hub" subtitle="Platform Super Admin Gateway" status="Connecting to Central Cluster..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/platform-admin/login" replace />;
  }

  return <PlatformAdminLayout>{children}</PlatformAdminLayout>;
}

// Dedicated Portal Route Handlers:
function PortalRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Student Career Gateway" status="Connecting to student database..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

// /superadmin route handler
function SuperAdminRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Super Administrator Console" status="Connecting to root cluster..." />;
  }
  if (!user) {
    return <Login portal="superadmin" />;
  }
  if (user.roleName !== 'SUPER_ADMIN' && user.roleName !== 'ADMIN') {
    return <Navigate to={user.roleName === 'STUDENT' ? '/profile' : '/dashboard'} replace />;
  }
  return (
    <Layout>
      <Settings />
    </Layout>
  );
}

// /admin route handler
function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Super Administrator Console" status="Verifying security permissions..." />;
  }
  if (!user) {
    return <Login portal="superadmin" />;
  }
  return (
    <Layout>
      {user.roleName === 'SUPER_ADMIN' || user.roleName === 'ADMIN' ? (
        <Admin />
      ) : (
        <Navigate to={user.roleName === 'STUDENT' ? '/profile' : '/dashboard'} replace />
      )}
    </Layout>
  );
}

// /placement route handler
function PlacementRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Training & Placement Office" status="Loading recruitment drives..." />;
  }
  if (!user) {
    return <Login portal="placement" />;
  }
  return (
    <Layout>
      <Jobs />
    </Layout>
  );
}

// /staff route handler
function StaffRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <UniserveLoader title="CampusCorp" subtitle="Faculty & Staff Portal" status="Accessing departmental roster..." />;
  }
  if (!user) {
    return <Login portal="staff" />;
  }
  return (
    <Layout>
      <Students />
    </Layout>
  );
}


export default function App() {
  return (
    <PlatformAuthProvider>
      <AuthProvider>
        <ThemeProvider>
          <PermissionProvider>
            <ToastProvider>
              <BrowserRouter>
                <UIProvider>
                  <ScrollToTop />
                  <Routes>
                    {/* Primary Portal Route (Authenticated -> Dashboard/Profile, Unauthenticated -> /login) */}
                    <Route path="/" element={<PortalRoute />} />
                    <Route path="/career-explorer" element={<Navigate to="/domains" replace />} />
                    <Route path="/company-explorer" element={<Navigate to="/career-explorer/companies" replace />} />
                    <Route path="/platform" element={<Navigate to="/login" replace />} />
                    <Route path="/about" element={<Navigate to="/login" replace />} />
                    <Route path="/contact" element={<Navigate to="/login" replace />} />
                    <Route path="/solutions/*" element={<Navigate to="/login" replace />} />
                    <Route path="/features/*" element={<Navigate to="/login" replace />} />
                    <Route path="/placement-management" element={<Navigate to="/jobs" replace />} />
                    <Route path="/student-management" element={<Navigate to="/students" replace />} />
                    <Route path="/faculty-management" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/programming-assessment" element={<Navigate to="/assessment" replace />} />
                    <Route path="/mock-interviews" element={<Navigate to="/interview/room" replace />} />

                    {/* Level 1: Global Platform Super Admin Routes */}
                    <Route path="/platform-admin/login" element={<PlatformLogin />} />
                    <Route path="/platform-admin" element={<ProtectedPlatformRoute><PlatformOverview /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/colleges" element={<ProtectedPlatformRoute><CollegeManagement /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/provision" element={<ProtectedPlatformRoute><CollegeProvisionWizard /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/databases" element={<ProtectedPlatformRoute><DatabaseRegistry /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/modules" element={<ProtectedPlatformRoute><ModuleEntitlements /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/subscriptions" element={<ProtectedPlatformRoute><SubscriptionManagement /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/users" element={<ProtectedPlatformRoute><UserAccessManagement /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/monitoring" element={<ProtectedPlatformRoute><SystemMonitoring /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/audit-logs" element={<ProtectedPlatformRoute><PlatformAuditLogs /></ProtectedPlatformRoute>} />
                    <Route path="/platform-admin/settings" element={<ProtectedPlatformRoute><PlatformSettings /></ProtectedPlatformRoute>} />

                    {/* Level 2: Institutional Portal Gateway & Direct Logins */}
                    <Route path="/login" element={<Login portal="student" />} />
                    <Route path="/dashboard" element={<PortalRoute />} />
                    <Route path="/portal" element={<PortalRoute />} />
                    <Route path="/superadmin" element={<SuperAdminRoute />} />
                    <Route path="/admin" element={<AdminRoute />} />
                    <Route path="/placement" element={<PlacementRoute />} />
                    <Route path="/staff" element={<StaffRoute />} />

                    {/* Settings & Appearance */}
                    <Route path="/settings" element={<ProtectedRoute path="/settings"><Settings /></ProtectedRoute>} />

                    {/* Career Explorer & Role Comparison & Skill Analyzer */}
                    <Route path="/domains" element={<ProtectedRoute path="/domains"><Domains /></ProtectedRoute>} />
                    <Route path="/domains/:slug" element={<ProtectedRoute path="/domains"><DomainDetail /></ProtectedRoute>} />
                    <Route path="/career-explorer/domains" element={<Navigate to="/domains" replace />} />
                    <Route path="/career-explorer/domains/:slug" element={<ProtectedRoute path="/domains"><DomainDetail /></ProtectedRoute>} />
                    <Route path="/domains/:domainSlug/:roleSlug" element={<ProtectedRoute path="/domains"><RoleDetailPage /></ProtectedRoute>} />
                    <Route path="/career-explorer/roles/:roleSlug" element={<ProtectedRoute path="/domains"><RoleDetailPage /></ProtectedRoute>} />
                    <Route path="/roles/:roleSlug" element={<ProtectedRoute path="/domains"><RoleDetailPage /></ProtectedRoute>} />
                    <Route path="/compare" element={<ProtectedRoute path="/compare"><CompareRoles /></ProtectedRoute>} />
                    <Route path="/skill-analyzer" element={<ProtectedRoute path="/skill-analyzer"><SkillAnalyzer /></ProtectedRoute>} />
                    <Route path="/role-analyzer" element={<Navigate to="/skill-analyzer" replace />} />
                    <Route path="/career-explorer/compare" element={<Navigate to="/compare" replace />} />
                    <Route path="/career-explorer/skill-analyzer" element={<Navigate to="/skill-analyzer" replace />} />
                    <Route path="/github-scanner" element={<ProtectedRoute path="/skill-analyzer"><GithubRepoScanner /></ProtectedRoute>} />
                    <Route path="/career-explorer/github-scanner" element={<ProtectedRoute path="/skill-analyzer"><GithubRepoScanner /></ProtectedRoute>} />
                    <Route path="/career-explorer/companies" element={<ProtectedRoute path="/career-explorer"><CompanyLocationExplorer /></ProtectedRoute>} />
                    <Route path="/career-explorer/companies/:id" element={<ProtectedRoute path="/career-explorer"><CompanyLocationDetail /></ProtectedRoute>} />
                    <Route path="/companies-by-location" element={<Navigate to="/career-explorer/companies" replace />} />

                    {/* Domain Knowledge Hub & Technical Learning Library */}
                    <Route path="/career-explorer/knowledge-hub" element={<ProtectedRoute path="/domains"><DomainKnowledgeHub /></ProtectedRoute>} />
                    <Route path="/career-explorer/knowledge-hub/:domainSlug" element={<ProtectedRoute path="/domains"><DomainLearningWorkspace /></ProtectedRoute>} />
                    <Route path="/career-explorer/knowledge-hub/:domainSlug/:moduleNumber" element={<ProtectedRoute path="/domains"><DomainLearningWorkspace /></ProtectedRoute>} />
                    <Route path="/knowledge-hub" element={<Navigate to="/career-explorer/knowledge-hub" replace />} />
                    <Route path="/knowledge-hub/:domainSlug" element={<Navigate to="/career-explorer/knowledge-hub/:domainSlug" replace />} />
                  <Route path="/admin/domain-knowledge-hub" element={<ProtectedRoute path="/admin"><AdminDomainKnowledgeManagement /></ProtectedRoute>} />

                  {/* LMS - Role-Based Learning Management System */}
                  <Route path="/lms" element={<ProtectedRoute path="/lms"><LmsPortal /></ProtectedRoute>} />
                  <Route path="/lms/:section" element={<ProtectedRoute path="/lms"><LmsPortal /></ProtectedRoute>} />

                  {/* Portal Modules with Permission Enforcement */}
                  <Route path="/students" element={<ProtectedRoute path="/students"><Students /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute path="/profile"><Profile /></ProtectedRoute>} />
                  <Route path="/companies" element={<ProtectedRoute path="/companies"><Companies /></ProtectedRoute>} />
                  <Route path="/jobs" element={<ProtectedRoute path="/jobs"><Jobs /></ProtectedRoute>} />
                  <Route path="/drives" element={<ProtectedRoute path="/drives"><Drives /></ProtectedRoute>} />
                  <Route path="/applications" element={<ProtectedRoute path="/applications"><Applications /></ProtectedRoute>} />
                  <Route path="/my-applications" element={<ProtectedRoute path="/applications"><Applications /></ProtectedRoute>} />
                  <Route path="/assessment" element={<ProtectedRoute path="/assessment"><Assessment /></ProtectedRoute>} />
                  <Route path="/compiler" element={<ProtectedRoute path="/assessment"><CompilerSandbox /></ProtectedRoute>} />
                  <Route path="/compiler-sandbox" element={<Navigate to="/compiler" replace />} />
                  <Route path="/sandbox" element={<Navigate to="/compiler" replace />} />
                  <Route path="/student/compiler" element={<Navigate to="/compiler" replace />} />
                  <Route path="/exam" element={<Layout><ExamScreen /></Layout>} />
                  <Route path="/exam/:testId" element={<Layout><ExamScreen /></Layout>} />
                  <Route path="/exam/share/:testId" element={<Layout><ExamScreen /></Layout>} />
                  <Route path="/interviews" element={<ProtectedRoute path="/interviews"><Interviews /></ProtectedRoute>} />
                  <Route path="/videocall/interview" element={<ProtectedRoute path="/videocall/interview"><InterviewRoomPage /></ProtectedRoute>} />
                  <Route path="/videocall/interview/:roomCode" element={<Layout><InterviewRoomPage /></Layout>} />
                  <Route path="/interview/room/:roomCode" element={<Layout><InterviewRoomPage /></Layout>} />
                  <Route path="/resume-analyzer" element={<ProtectedRoute path="/resume-analyzer"><ResumeAnalyzer /></ProtectedRoute>} />
                  <Route path="/training" element={<ProtectedRoute path="/training"><Training /></ProtectedRoute>} />
                  <Route path="/internships" element={<ProtectedRoute path="/internships"><Internships /></ProtectedRoute>} />
                  <Route path="/offers" element={<ProtectedRoute path="/offers"><Offers /></ProtectedRoute>} />
                  <Route path="/policies" element={<ProtectedRoute path="/policies"><Policies /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute path="/reports"><Reports /></ProtectedRoute>} />
                  <Route path="/finance" element={<ProtectedRoute path="/finance"><Finance /></ProtectedRoute>} />
                  <Route path="/alumni" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/grievances" element={<ProtectedRoute path="/grievances"><Grievances /></ProtectedRoute>} />
                  <Route path="/ai-assistant" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin/academics" element={<ProtectedRoute path="/admin/academics"><DepartmentAcademicManagement /></ProtectedRoute>} />
                  <Route path="/admin/departments" element={<ProtectedRoute path="/admin/academics"><DepartmentAcademicManagement /></ProtectedRoute>} />
                  <Route path="/college-admin" element={<ProtectedRoute path="/admin"><CollegeAdminDashboard /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </UIProvider>
            </BrowserRouter>
          </ToastProvider>
        </PermissionProvider>
      </ThemeProvider>
    </AuthProvider>
  </PlatformAuthProvider>
  );
}
