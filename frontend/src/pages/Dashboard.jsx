import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { KpiCard, ModuleFeatureCard, SectionHeader } from '../components/common/SaasCards';
import {
  Users,
  Building2,
  CalendarDays,
  Award,
  TrendingUp,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Terminal,
  ArrowRight,
  Compass,
  BookOpen,
  Code2,
  Video,
  FileSearch,
  FileCheck2,
  GitCompare,
  Layers,
  PieChart,
  Settings,
  Database,
  FileText,
  DollarSign,
  AlertCircle,
  Bell,
  GitBranch,
  MapPin,
  CalendarCheck,
  User,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export function Dashboard() {
  const { user, isModuleEnabled } = useAuth();
  const { canAccessPage } = usePermissions();
  const { chartColors, isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [user]);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/dashboard/metrics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading CampusCorpo workspace..." />;

  const COLORS = chartColors;
  const role = user?.roleName;
  const fullName = user ? `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() : 'User';

  // =========================================================================
  // 1. STUDENT PERSONALIZED WORKSPACE (Reference Screenshot 1 + 7 Inspired)
  // =========================================================================
  if (role === 'STUDENT') {
    const prof = data?.studentProfile || {};
    const apps = data?.applications || [];
    const stats = data?.stats || {};
    const readinessScore = stats.readinessScore || 78;

    const recommendedCareers = [
      { id: 'full-stack-enterprise-software', name: 'Full-Stack Engineering', tag: 'PRIMARY', modules: 12 },
      { id: 'artificial-intelligence-machine-learning', name: 'AI & Machine Learning', tag: 'PRIMARY', modules: 12 },
      { id: 'cloud-computing-cloud-engineering', name: 'Cloud & DevOps', tag: 'SECONDARY', modules: 12 },
    ];

    const quickNavCards = [
      { title: 'Career Domains', to: '/domains', icon: Compass, show: isModuleEnabled('CAREER_EXPLORER') },
      { title: 'Knowledge Hub', to: '/career-explorer/knowledge-hub', icon: BookOpen, show: isModuleEnabled('CAREER_EXPLORER') },
      { title: 'Video Interview', to: '/videocall/interview', icon: Video, show: isModuleEnabled('ASSESSMENTS') && isModuleEnabled('INTERVIEWS') },
      { title: 'Resume AI', to: '/resume-analyzer', icon: FileSearch, show: isModuleEnabled('ASSESSMENTS') && isModuleEnabled('RESUME_AI') },
    ].filter((c) => c.show);

    const workspaceDirectory = [
      {
        heading: 'Career Intelligence',
        show: isModuleEnabled('CAREER_EXPLORER'),
        items: [
          { title: 'IT Career Domains', description: 'Explore 38+ domains and 180+ roles', to: '/domains', icon: Compass, meta: '38+' },
          { title: 'Domain Knowledge Hub', description: '456 structured modules & PDF notes', to: '/career-explorer/knowledge-hub', icon: BookOpen, meta: '456' },
          { title: 'Compare Career Roles', description: 'Side-by-side salary & skill benchmarks', to: '/compare', icon: GitCompare },
          { title: 'Industry Skill Analyzer', description: 'Benchmark your technical readiness', to: '/skill-analyzer', icon: Layers },
        ].filter((i) => canAccessPage(role, i.to)),
      },
      {
        heading: 'Placement & Assessments',
        show: isModuleEnabled('RECRUITMENT') || isModuleEnabled('ASSESSMENTS'),
        items: [
          { title: 'Job Opportunities', description: 'Active campus openings & roles', to: '/jobs', icon: Briefcase },
          { title: 'Placement Drives', description: 'Upcoming institutional drives', to: '/drives', icon: CalendarDays },
          { title: 'Coding Assessments', description: 'Timed tests & online compiler', to: '/assessment', icon: Code2 },
          { title: 'Interview Studio', description: 'Live virtual mock interviews', to: '/videocall/interview', icon: Video },
        ].filter((i) => canAccessPage(role, i.to)),
      },
    ].filter((g) => g.show && g.items.length > 0);

    return (
      <div className="space-y-6">
        {/* Compact Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {user.firstName || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {user.registerNumber || 'Student ID'} • {user.departmentCode || 'CSE'} Department • CGPA {prof.cgpa || '8.50'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/career-explorer/knowledge-hub"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Continue Learning</span>
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card hover:bg-[#F8EDF0] text-foreground border border-border transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#8B2942]" />
              <span>My Profile</span>
            </Link>
          </div>
        </div>

        {/* 6 Compact Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KpiCard
            label="Career Readiness"
            value={`${readinessScore}%`}
            subtitle="AI Benchmark"
            icon={TrendingUp}
            accentTop
            to="/skill-analyzer"
          />
          <KpiCard
            label="Learning Modules"
            value="456"
            subtitle="38 IT Domains"
            icon={BookOpen}
            to="/career-explorer/knowledge-hub"
          />
          <KpiCard
            label="Active Applications"
            value={stats.totalApplications ?? apps.length}
            subtitle={`${stats.shortlistedCount || 0} Shortlisted`}
            icon={Briefcase}
            to="/applications"
          />
          <KpiCard
            label="Interviews"
            value={stats.shortlistedCount || 0}
            subtitle="Scheduled rounds"
            icon={Video}
            to="/interviews"
          />
          <KpiCard
            label="Placement Offers"
            value={stats.offersCount || 0}
            subtitle={prof.placement_status || 'Registered'}
            icon={Award}
            to="/offers"
          />
          <KpiCard
            label="Assessments"
            value="Ready"
            subtitle="Code & Aptitude"
            icon={Code2}
            to="/assessment"
          />
        </div>

        {/* 3-Column Reference-Inspired Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Profile Summary + Quick Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] font-bold text-sm flex items-center justify-center border border-[#8B2942]/20 shrink-0">
                  {fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate uppercase">{fullName}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.registerNumber || 'REG2026'} • {user.departmentCode || 'CSE'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-center">
                <p className="text-2xl font-bold text-[#8B2942] dark:text-[#F2B8C7]">{readinessScore}%</p>
                <p className="text-[11px] font-semibold text-[#702038] dark:text-[#F2D0D9] mt-0.5">
                  Career Readiness Index
                </p>
                <Link to="/skill-analyzer" className="text-[11px] font-semibold text-[#8B2942] underline mt-1 inline-block">
                  View skill breakdown
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-[#26966B]/10 text-center">
                <p className="text-xl font-bold text-[#26966B]">{prof.cgpa || '8.50'}</p>
                <p className="text-[11px] font-semibold text-[#26966B] mt-0.5">Verified Academic CGPA</p>
              </div>
            </div>

            {/* Quick Navigation 2x2 Grid */}
            {quickNavCards.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Quick Navigation
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickNavCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="p-3 rounded-xl bg-[#F7F6F7] dark:bg-[#262126] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] border border-border hover:border-[#8B2942]/30 transition-all flex flex-col gap-2"
                      >
                        <div className="w-7 h-7 rounded-lg bg-card text-[#8B2942] flex items-center justify-center shadow-2xs">
                          <Icon className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Recommended Careers + Active Applications */}
          <div className="lg:col-span-6 space-y-5">
            {/* Recommended Careers (Skills & Indicators Style) */}
            {isModuleEnabled('CAREER_EXPLORER') && (
              <div className="bg-card rounded-xl border border-border p-4 shadow-2xs">
                <SectionHeader
                  title="Recommended Career Tracks"
                  actionLabel="All 38 Domains"
                  actionTo="/domains"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedCareers.map((c, idx) => (
                    <Link
                      key={c.id}
                      to={`/career-explorer/domains/${c.id}`}
                      className={`p-3.5 rounded-xl bg-[#F7F6F7]/70 dark:bg-[#262126] border border-border border-t-2 hover:shadow-xs transition-all flex flex-col justify-between gap-2 ${idx === 0
                        ? 'border-t-[#8B2942]'
                        : idx === 1
                          ? 'border-t-[#26966B]'
                          : 'border-t-[#E5A13B]'
                        }`}
                    >
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]">
                          {c.tag}
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-2 leading-snug">
                          {c.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span>{c.modules} Modules</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B2942]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active Applications Table */}
            {isModuleEnabled('RECRUITMENT') && (
              <div className="bg-card rounded-xl border border-border p-4 shadow-2xs">
                <SectionHeader
                  title="Active Applications & Drives"
                  subtitle="Track your live placement pipeline"
                  actionLabel="Explore Jobs"
                  actionTo="/jobs"
                />
                {apps.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-border rounded-xl bg-[#F7F6F7]/50 dark:bg-[#262126]/50">
                    <Briefcase className="w-7 h-7 text-muted-foreground mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-semibold text-foreground">No active applications yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Browse open campus drives and roles to apply.</p>
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8B2942] text-white hover:bg-[#702038]"
                    >
                      <span>View Open Roles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground uppercase tracking-wider border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Company</th>
                          <th className="py-2.5 px-3 font-semibold">Role</th>
                          <th className="py-2.5 px-3 font-semibold">CTC</th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {apps.slice(0, 6).map((app) => (
                          <tr key={app.id} className="hover:bg-[#F7F6F7]/60 dark:hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-foreground">{app.company_name}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{app.job_title}</td>
                            <td className="py-2.5 px-3 font-semibold text-foreground">₹{app.ctc_lpa} LPA</td>
                            <td className="py-2.5 px-3"><StatusBadge status={app.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Notifications + Preparation Tools */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8B2942]" />
                  <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F8EDF0] text-[#8B2942]">2</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border">
                  <p className="text-xs font-semibold text-foreground">Campus Drive Active</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Review eligibility in Placement Drives.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border">
                  <p className="text-xs font-semibold text-foreground">AI Resume Evaluation</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Scan your resume with AI Resume Analyzer.</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Preparation Tools
              </h3>
              <div className="space-y-2">
                {isModuleEnabled('ASSESSMENTS') && (
                  <Link
                    to="/compiler"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] border border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-[#8B2942]" />
                      <span className="text-xs font-semibold text-foreground">Online Compiler</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                )}
                {isModuleEnabled('CAREER_EXPLORER') && (
                  <Link
                    to="/github-scanner"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] border border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GitBranch className="w-4 h-4 text-[#8B2942]" />
                      <span className="text-xs font-semibold text-foreground">GitHub Repo Scanner</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                )}
                {isModuleEnabled('LMS') && (
                  <Link
                    to="/lms/my-learning"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] hover:bg-[#F8EDF0] dark:hover:bg-[#312128] border border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#8B2942]" />
                      <span className="text-xs font-semibold text-foreground">LMS My Learning</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Feature Directory (Reference Screenshot 7 Inspired) */}
        {workspaceDirectory.map((section) => (
          <div key={section.heading}>
            <SectionHeader title={section.heading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {section.items.map((item) => (
                <ModuleFeatureCard key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =========================================================================
  // 2. TPO / MANAGEMENT / ADMIN / SUPER ADMIN VIEW
  // =========================================================================
  if (['TPO_OFFICER', 'MANAGEMENT', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    const ov = data?.overview || {};
    const deptData = data?.departmentAnalytics || [];
    const salaryBins = data?.salaryDistribution || {};

    const salaryChartData = [
      { name: '< 6 LPA', value: parseInt(salaryBins.bracket_below_6 || 0, 10) },
      { name: '6 - 10 LPA', value: parseInt(salaryBins.bracket_6_to_10 || 0, 10) },
      { name: '10 - 20 LPA', value: parseInt(salaryBins.bracket_10_to_20 || 0, 10) },
      { name: '20+ LPA', value: parseInt(salaryBins.bracket_above_20 || 0, 10) },
    ].filter((item) => item.value > 0);

    const adminModules = [
      {
        heading: 'Placement & Industry Connect',
        show: isModuleEnabled('RECRUITMENT'),
        items: [
          { title: 'Placement Drives', description: 'Schedule and monitor campus drives', to: '/drives', icon: CalendarDays },
          { title: 'Job Opportunities', description: 'Manage active job postings', to: '/jobs', icon: Briefcase },
          { title: 'Industry Partners', description: 'Recruiter & company directory', to: '/companies', icon: Building2 },
          { title: 'Offers & Joining', description: 'Track released offers & joining', to: '/offers', icon: Award },
        ].filter((i) => canAccessPage(role, i.to)),
      },
      {
        heading: 'Institutional Intelligence & Administration',
        show: true,
        items: [
          { title: 'NIRF / NAAC Reports', description: 'Accreditation & placement analytics', to: '/reports', icon: PieChart },
          { title: 'Student Roster', description: 'Cohort intelligence & verification', to: '/students', icon: Users },
          { title: 'Admin Management', description: 'Roles, permissions & DB registry', to: '/admin', icon: Database },
          { title: 'System Settings', description: 'Platform configuration & controls', to: '/settings', icon: Settings },
        ].filter((i) => canAccessPage(role, i.to)),
      },
    ].filter((g) => g.show && g.items.length > 0);

    return (
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Institutional Placement & Career Governance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live synchronization across institutional and department databases • Batch 2023–2027
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7] border border-[#8B2942]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#26966B]" />
              Campus Drive 2026–27 Active
            </span>
          </div>
        </div>

        {/* Top KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Students Enrolled"
            value={ov.totalStudents ?? 0}
            subtitle={`${ov.registeredStudents ?? 0} Registered for Drives`}
            icon={Users}
            accentTop
          />
          {isModuleEnabled('RECRUITMENT') && (
            <KpiCard
              label="Placement Rate"
              value={`${ov.placementRate ?? 0}%`}
              subtitle={`${ov.placedStudents ?? 0} Students Placed`}
              icon={GraduationCap}
              trend={+12}
              accentTop
            />
          )}
          {isModuleEnabled('RECRUITMENT') && (
            <KpiCard
              label="Average CTC Package"
              value={`₹${ov.averagePackageLpa ?? 0} LPA`}
              subtitle={`Highest: ₹${ov.highestPackageLpa ?? 0} LPA`}
              icon={TrendingUp}
              accentTop
            />
          )}
          {isModuleEnabled('RECRUITMENT') && (
            <KpiCard
              label="Active Companies"
              value={ov.totalCompanies ?? 0}
              subtitle={`${ov.upcomingDrives ?? 0} Upcoming Drives`}
              icon={Building2}
              accentTop
            />
          )}
        </div>

        {/* Analytics Charts Grid */}
        {isModuleEnabled('RECRUITMENT') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Department Placement Performance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Placement percentage across departments</p>
                </div>
                <span className="text-[11px] font-semibold text-[#8B2942] bg-[#F8EDF0] dark:bg-[#312128] px-2.5 py-1 rounded-md">
                  Live Analytics
                </span>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : '#EAE6E8'} vertical={false} />
                    <XAxis dataKey="department_code" tick={{ fontSize: 12, fill: isDark ? '#A69FA8' : '#858087' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: isDark ? '#A69FA8' : '#858087' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1D191D' : '#FFFFFF',
                        color: isDark ? '#F7F6F7' : '#29252A',
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#EAE6E8',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${val}%`, 'Placement Rate']}
                    />
                    <Bar dataKey="placement_rate" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Salary Band Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Offers grouped by CTC bracket</p>
              </div>
              <div className="h-60 flex items-center justify-center">
                {salaryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={salaryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {salaryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1D191D' : '#FFFFFF',
                          color: isDark ? '#F7F6F7' : '#29252A',
                          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#EAE6E8',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground">No offers issued yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Institutional Module Feature Cards */}
        {adminModules.map((section) => (
          <div key={section.heading}>
            <SectionHeader title={section.heading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {section.items.map((item) => (
                <ModuleFeatureCard key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}

        {/* Assessment Sandbox Compiler Diagnostics */}
        {isModuleEnabled('ASSESSMENTS') && data?.compilersStatus && (
          <div className="bg-card rounded-xl border border-border p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Assessment Sandbox Runtimes</h3>
              </div>
              <span className="text-xs text-muted-foreground">Host diagnostics</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Python 3', info: data.compilersStatus.python },
                { name: 'C (GCC)', info: data.compilersStatus.c },
                { name: 'C++ (G++)', info: data.compilersStatus.cpp },
                { name: 'Java (JDK)', info: data.compilersStatus.java },
              ].map((lang) => (
                <div key={lang.name} className="p-3 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground">{lang.name}</span>
                  <p className={`text-xs font-bold mt-1 ${lang.info?.available ? 'text-[#26966B]' : 'text-muted-foreground'}`}>
                    {lang.info?.available ? 'Available' : 'Not in PATH'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. FACULTY COORDINATOR VIEW
  // =========================================================================
  if (role === 'FACULTY_COORDINATOR') {
    const ov = data?.overview || {};
    const academicRoster = data?.academicRoster || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Department of {data?.departmentCode || user?.departmentCode} — Faculty Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cohort progress, LMS curriculum management, and academic verification
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Department Cohort" value={ov.totalStudents ?? 0} subtitle={`${ov.placedStudents ?? 0} Placed`} icon={Users} accentTop />
          <KpiCard label="Placement Rate" value={`${ov.placementRate ?? 0}%`} subtitle="Class of 2027" icon={GraduationCap} accentTop />
          <KpiCard label="Average CGPA" value={ov.avgCgpa ?? '—'} subtitle="Verified by Mentors" icon={Award} accentTop />
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs">
          <SectionHeader title="Department Academic Roster" subtitle="Verified cohort records" />
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Register No</th>
                  <th className="py-2.5 px-3 font-semibold">CGPA</th>
                  <th className="py-2.5 px-3 font-semibold">Backlogs</th>
                  <th className="py-2.5 px-3 font-semibold">Dept Rank</th>
                  <th className="py-2.5 px-3 font-semibold">Faculty Mentor</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {academicRoster.map((r, i) => (
                  <tr key={i} className="hover:bg-[#F7F6F7]/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground">{r.register_number}</td>
                    <td className="py-2.5 px-3 font-bold text-foreground">{r.current_cgpa}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.active_backlogs}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">#{r.department_rank}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.faculty_mentor_name}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={r.verification_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. RECRUITER / ALUMNI VIEW
  // =========================================================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {data?.companyName || 'Corporate Partner'} Recruitment Portal
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Review candidates, manage interview rounds, and issue campus offers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Postings" value={data?.stats?.jobsCount || 0} icon={Briefcase} accentTop to="/jobs" />
        <KpiCard label="Total Candidates" value={data?.stats?.totalApplicants || 0} icon={Users} accentTop to="/applications" />
        <KpiCard label="Shortlisted" value={data?.stats?.shortlisted || 0} icon={CheckCircle2} accentTop to="/applications" />
        <KpiCard label="Offers Released" value={data?.stats?.offersReleased || 0} icon={Award} accentTop to="/offers" />
      </div>
    </div>
  );
}

export default Dashboard;
