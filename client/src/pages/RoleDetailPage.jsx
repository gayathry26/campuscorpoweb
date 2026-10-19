import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  TrendingUp,
  Compass,
  Cpu,
  Wrench,
  CheckCircle2,
  FolderGit2,
  Award,
  Sparkles,
  GitCompare,
  FileSearch,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  Building2,
  ShieldCheck,
  Check,
  Plus,
  AlertCircle,
  X,
  Code2,
  Video,
  GraduationCap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import careerService from '../services/careerService';
import { DOMAIN_ICONS } from '../components/career/InteractiveDomainGrid';
import { Badge } from '../components/Badge';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';
import PersonalizedCareerFitModal from '../components/career/PersonalizedCareerFitModal';

export function RoleDetailPage() {
  const { domainSlug, roleSlug } = useParams();
  const navigate = useNavigate();

  // 1. Data States
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  // 2. Modals & Compare States
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [fitModalOpen, setFitModalOpen] = useState(false);
  const [activeRoadmapStage, setActiveRoadmapStage] = useState(0);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  const [comparedRoleIds, setComparedRoleIds] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscorp_compare_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 4);
      }
    } catch (e) {}
    return [];
  });

  const [toast, setToast] = useState(null);

  // Fetch Role Details by domainSlug & roleSlug
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);
    setError(null);

    careerService
      .getRoleByDomainAndSlug(domainSlug, roleSlug)
      .then((res) => {
        if (!isMounted) return;
        if (!res) {
          setNotFound(true);
        } else {
          setRole(res);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load role specifications.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [domainSlug, roleSlug]);

  // Sync Compare Roles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('campuscorp_compare_roles', JSON.stringify(comparedRoleIds));
    } catch (e) {}
  }, [comparedRoleIds]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Compare Handler
  const handleToggleCompare = () => {
    if (!role) return;
    setComparedRoleIds((prev) => {
      if (prev.includes(role.id)) {
        setToast({
          type: 'removed',
          message: `${role.title} removed from comparison queue`,
        });
        return prev.filter((id) => id !== role.id);
      }
      if (prev.length >= 4) {
        setToast({
          type: 'warning',
          message: 'Comparison limit reached (maximum 4 roles)',
        });
        return prev;
      }
      setToast({
        type: 'added',
        message: `${role.title} added to comparison (${prev.length + 1} of 4)`,
      });
      return [...prev, role.id];
    });
  };

  const handleGoToCompare = () => {
    const param = comparedRoleIds.join(',');
    navigate(`/compare${param ? `?roles=${param}` : ''}`);
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-6 w-64 bg-secondary rounded-lg" />
        <div className="h-44 bg-secondary rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-secondary rounded-2xl" />
            <div className="h-72 bg-secondary rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-48 bg-secondary rounded-2xl" />
            <div className="h-48 bg-secondary rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (notFound || !role) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Career Role Not Found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn't locate role specifications for{' '}
            <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">
              "{roleSlug}"
            </code>{' '}
            in domain{' '}
            <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">
              "{domainSlug}"
            </code>
            .
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={`/domains/${domainSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Domain</span>
          </Link>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all"
          >
            <span>All Domains</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    title,
    category,
    tags = [],
    shortDescription,
    scope,
    responsibilities = [],
    technicalSkills = [],
    softSkills = [],
    tools = [],
    stats = {},
    projects = { beginner: [], intermediate: [], advanced: [] },
    certifications = [],
    roadmap = [],
    interviewQuestions = [],
    topHiringCompanies = [],
    domain = {},
  } = role;

  const domainName = domain?.name || category;
  const DomainIcon = DOMAIN_ICONS[domainName] || Layers;
  const isCompared = comparedRoleIds.includes(id);

  const salaryText =
    stats.averageSalary ||
    (stats.minLpa ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA` : 'Competitive Rate');

  // Categorize Technical Skills
  const categorizedSkills = {
    'Languages & Core Technologies': [],
    'Frameworks & Libraries': [],
    'Cloud, Databases & Infrastructure': [],
    'Engineering Tools & Automation': [],
  };

  technicalSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (
      sLower.includes('javascript') ||
      sLower.includes('typescript') ||
      sLower.includes('python') ||
      sLower.includes('java') ||
      sLower.includes('c++') ||
      sLower.includes('go') ||
      sLower.includes('html') ||
      sLower.includes('css')
    ) {
      categorizedSkills['Languages & Core Technologies'].push(skill);
    } else if (
      sLower.includes('react') ||
      sLower.includes('vue') ||
      sLower.includes('node') ||
      sLower.includes('angular') ||
      sLower.includes('spring') ||
      sLower.includes('express') ||
      sLower.includes('django') ||
      sLower.includes('framework')
    ) {
      categorizedSkills['Frameworks & Libraries'].push(skill);
    } else if (
      sLower.includes('sql') ||
      sLower.includes('database') ||
      sLower.includes('aws') ||
      sLower.includes('azure') ||
      sLower.includes('gcp') ||
      sLower.includes('cloud') ||
      sLower.includes('docker') ||
      sLower.includes('kubernetes') ||
      sLower.includes('linux') ||
      sLower.includes('terraform')
    ) {
      categorizedSkills['Cloud, Databases & Infrastructure'].push(skill);
    } else {
      categorizedSkills['Engineering Tools & Automation'].push(skill);
    }
  });

  const validSkillGroups = Object.entries(categorizedSkills).filter(([_, items]) => items.length > 0);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Alert Feedback */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-foreground text-background px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-background/20 backdrop-blur-md">
            {toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            ) : (
              <Check className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION A: Breadcrumb and Top Navigation */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground flex-wrap">
            <Link to="/domains" className="hover:text-foreground transition-colors">
              Career Explorer
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/domains" className="hover:text-foreground transition-colors">
              Explore Domains
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/domains/${domainSlug}`}
              className="hover:text-foreground transition-colors font-medium text-foreground/80"
            >
              {domainName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-none">
              {title}
            </span>
          </nav>

          {/* Action Buttons: Back to Domain & Compare */}
          <div className="flex items-center gap-2">
            <Link
              to={`/domains/${domainSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-border/60 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {domainName}</span>
            </Link>

            <Link
              to={`/compare${comparedRoleIds.length > 0 ? `?roles=${comparedRoleIds.join(',')}` : ''}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-colors shadow-2xs"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare</span>
              {comparedRoleIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-foreground text-background">
                  {comparedRoleIds.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* HERO ROLE HEADER BANNER */}
        <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-md">
                <DomainIcon className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/domains/${domainSlug}`}
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-secondary text-foreground border border-border/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {domainName}
                  </Link>
                  {tags.map((t) => (
                    <Badge key={t} variant={t.toLowerCase()} size="sm">
                      {t}
                    </Badge>
                  ))}
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    • Dedicated Specifications
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/80 max-w-3xl leading-relaxed font-medium">
                  {shortDescription}
                </p>
              </div>
            </div>

            {/* Salary Range Tag */}
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold shadow-2xs self-start md:self-auto shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{salaryText}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/70">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Campus Placement Band
              </span>
              <span className="text-sm font-black text-foreground mt-0.5 block truncate">
                {salaryText}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Active Job Openings
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {stats.jobOpenings || 'Active Recruiting'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Market Growth Rate
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                {stats.growthRate || '+18% YoY'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Curriculum Stack
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                {technicalSkills.length} Skills • {tools.length} Tools
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/70">
            <button
              type="button"
              onClick={() => setFitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check My Career Fit</span>
            </button>

            <button
              type="button"
              onClick={handleToggleCompare}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                isCompared
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare Queue' : 'Compare Role'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRoadmapModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-muted-foreground" />
              <span>View Full Roadmap</span>
            </button>


            <Link
              to="/skill-analyzer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-foreground" />
              <span>Verify Skills</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN COLUMN (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION B: Role Overview & Scope */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/80">
              <Briefcase className="w-4 h-4 text-foreground" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Role Purpose & Engineering Scope
              </h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <p>
                As a <strong>{title}</strong> in the <strong>{domainName}</strong> discipline, you are responsible for core architectural solutions, software engineering rigor, and production reliability.
              </p>
              {scope && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 text-xs text-muted-foreground leading-relaxed flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-semibold block mb-0.5">Industry Mission:</strong>
                    <span>{scope}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION C: Day-to-Day Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Primary Day-to-Day Responsibilities
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {responsibilities.length} Verified Deliverables
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: Required Skills & Competencies */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Required Skills & Competencies
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {technicalSkills.length} Technical • {softSkills.length} Behavioral
              </span>
            </div>

            {/* Categorized Clusters */}
            <div className="space-y-4">
              {validSkillGroups.map(([groupName, items]) => (
                <div key={groupName} className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {groupName}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border text-foreground shadow-2xs hover:border-foreground/30 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Soft Skills */}
              {softSkills.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Behavioral & Professional Communication Traits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {softSkills.map((trait, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-card border border-border text-muted-foreground"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION E: Technology Stack and Tools */}
          {tools.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Standard Production Toolchains
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {tools.length} Industry Tools
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {tools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground border border-border shadow-2xs"
                  >
                    <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION F: Qualifications and Prerequisites */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Qualifications & Prerequisites
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Placement & Eligibility Criteria
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Educational Qualifications
                </span>
                <p className="text-foreground font-semibold">
                  {role.qualifications?.education || 'B.Tech / B.E (CSE, IT, ECE), MCA, M.Tech, or equivalent STEM Degree'}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Open to students meeting institutional academic placement eligibility cutoffs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Relevant Experience
                </span>
                <p className="text-foreground font-semibold">
                  {role.qualifications?.experience || 'Fresh Graduate / Entry-Level (0 - 1 Years)'}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Assessed via summer internships, portfolio project implementations, and coursework.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Prerequisite Knowledge
                </span>
                <p className="text-foreground font-semibold">
                  Core Computer Science Fundamentals
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Object-oriented design, algorithmic problem solving, database management, and basic version control.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Certifications & Preparation Requirements
                </span>
                <p className="text-foreground font-semibold">
                  {certifications.length > 0 ? `${certifications.length} Industry Credentials Recognized` : 'Optional Industry Credentials'}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {certifications.length > 0
                    ? certifications.map(c => c.name).slice(0, 2).join(' • ')
                    : 'Vendor credentials provide added distinction during technical screening.'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION G: Recommended Portfolio Capstones */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Recommended Portfolio Capstones
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Verifiable Proof of Work
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Build and showcase these production-grade projects on GitHub to substantiate your resume during campus interview screening:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Beginner */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-block">
                    Beginner Project
                  </span>
                  <div className="space-y-1.5">
                    {(projects.beginner || ['Foundational Domain Portfolio & Utility']).map((p, i) => (
                      <div key={i} className="text-xs font-semibold text-foreground leading-relaxed p-2 rounded-lg bg-card border border-border/60">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intermediate */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 inline-block">
                    Intermediate Framework
                  </span>
                  <div className="space-y-1.5">
                    {(projects.intermediate || ['End-to-End Enterprise Architecture Project']).map((p, i) => (
                      <div key={i} className="text-xs font-semibold text-foreground leading-relaxed p-2 rounded-lg bg-card border border-border/60">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 inline-block">
                    Advanced / Distributed
                  </span>
                  <div className="space-y-1.5">
                    {(projects.advanced || ['Full Scalable Cloud & Distributed Capstone']).map((p, i) => (
                      <div key={i} className="text-xs font-semibold text-foreground leading-relaxed p-2 rounded-lg bg-card border border-border/60">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION G: Structured Career Preparation Roadmap */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Placement Preparation Roadmap
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {roadmap.length > 0 ? `${roadmap.length} Progressive Stages` : '5 Verified Milestones'}
              </span>
            </div>

            {roadmap.length > 0 ? (
              <div className="space-y-4">
                {/* Stage Navigator Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
                  {roadmap.map((stg, sIndex) => (
                    <button
                      key={sIndex}
                      type="button"
                      onClick={() => setActiveRoadmapStage(sIndex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeRoadmapStage === sIndex
                          ? 'bg-foreground text-background shadow-xs'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Stage {sIndex + 1}: {stg.title || stg.stage}
                    </button>
                  ))}
                </div>

                {/* Selected Stage Detail Card */}
                {(() => {
                  const currentStage = roadmap[activeRoadmapStage] || roadmap[0];
                  return (
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border space-y-4 animate-in fade-in-50 duration-150">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                          Stage 0{activeRoadmapStage + 1}
                        </span>
                        <h4 className="text-base font-black text-foreground">
                          {currentStage.title || currentStage.stage}
                        </h4>
                        {currentStage.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {currentStage.description}
                          </p>
                        )}
                      </div>

                      {/* Skills & Tools */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentStage.skills && currentStage.skills.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Target Competencies
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {currentStage.skills.map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border text-foreground"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStage.tools && currentStage.tools.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Toolchains
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {currentStage.tools.map((tl, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border text-foreground"
                                >
                                  {tl}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Learning Activities */}
                      {currentStage.learningActivities && currentStage.learningActivities.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Actionable Milestone Objectives
                          </span>
                          <ul className="space-y-1.5 text-xs text-foreground/90">
                            {currentStage.learningActivities.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Fallback Standard Roadmap */
              <div className="space-y-3">
                {[
                  { n: '01', t: 'CS Foundations & Algorithmic Core', d: 'Master data structures, memory layout, and Git version control.' },
                  { n: '02', t: 'Core Domain Frameworks & Protocols', d: 'Construct full-stack modules and configure cloud databases.' },
                  { n: '03', t: 'Scalable Capstone Engineering', d: 'Deploy containerized services with automated CI/CD pipelines.' },
                  { n: '04', t: 'Resume ATS Alignment & Proof of Work', d: 'Synthesize quantified bullet points using the Google XYZ formula.' },
                  { n: '05', t: 'Live Technical & Behavioral Mock Rounds', d: 'Simulate high-frequency company interview questions.' },
                ].map((s) => (
                  <div key={s.n} className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-foreground text-background font-black text-xs flex items-center justify-center shrink-0">
                      {s.n}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{s.t}</h4>
                      <p className="text-[11px] text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION H: Interview Questions & Screening Prep */}
          {interviewQuestions.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    High-Frequency Campus Interview Questions
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {interviewQuestions.length} Questions
                </span>
              </div>

              <div className="space-y-2.5">
                {interviewQuestions.map((q, qIdx) => {
                  const isExpanded = expandedFaqIndex === qIdx;
                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-border bg-secondary/30 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : qIdx)}
                        className="w-full text-left p-3.5 text-xs font-bold text-foreground flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/60"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                            Q{qIdx + 1}
                          </span>
                          <span>{q.question || q}</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {isExpanded && q.answer && (
                        <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground border-t border-border/60 bg-card leading-relaxed">
                          <strong className="text-foreground block mb-1 font-semibold">Evaluation Rubric / Answer Hint:</strong>
                          <span>{q.answer}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR COLUMN (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* Card 1: Salary Benchmark Card */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Placement Economics</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Verified Band
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {salaryText}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Campus placement recruitment compensation band for entry to junior {title} roles.
              </p>
            </div>

            {stats.minLpa && stats.maxLpa && (
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Baseline Campus Offer:</span>
                  <strong className="text-foreground">₹{stats.minLpa} LPA</strong>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Super Dream / Ceiling Offer:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">₹{stats.maxLpa} LPA</strong>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Quick Action Center */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block pb-2 border-b border-border/80">
              CampusCorp Action Hub
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFitModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Check My Career Fit</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCompare}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  isCompared
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 border-border'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Role Queued in Comparison' : 'Add to Compare Queue'}</span>
              </button>

              <Link
                to="/resume-analyzer"
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-card hover:bg-secondary text-foreground border border-border flex items-center justify-between transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <FileSearch className="w-3.5 h-3.5 text-foreground" />
                  <span>ATS Resume Evaluation</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                to="/skill-analyzer"
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-card hover:bg-secondary text-foreground border border-border flex items-center justify-between transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-foreground" />
                  <span>Verify Skill Gaps</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Card 3: Industry Credentials & Certifications */}
          {certifications.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Recognized Certifications</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {certifications.length} Credentials
                </span>
              </div>

              <div className="space-y-2">
                {certifications.map((cert, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-1 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground leading-snug">{cert.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                          cert.type === 'FREE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {cert.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{cert.provider}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Verified Recruiters in Campus Drives */}
          {topHiringCompanies.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 pb-2 border-b border-border/80">
                <Building2 className="w-4 h-4 text-foreground" />
                <span>Recruiters for {title}</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {topHiringCompanies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary text-foreground border border-border"
                  >
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card 5: CampusCorp LMS Integration */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>CampusCorp Learning Integration</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Enrolled students can track course credits, solve proctored compiler challenges, and practice live mock video rounds.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/lms"
                className="p-2 rounded-lg bg-card border border-border text-center font-bold text-[11px] hover:bg-secondary text-foreground"
              >
                LMS Masterclass
              </Link>
              <Link
                to="/assessment"
                className="p-2 rounded-lg bg-card border border-border text-center font-bold text-[11px] hover:bg-secondary text-foreground"
              >
                Code Sandbox
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Compare Tray */}
      {comparedRoleIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-foreground text-background rounded-2xl p-3 shadow-2xl border border-background/20 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5 pl-1 truncate">
              <span className="w-6 h-6 rounded-full bg-background text-foreground text-xs font-black flex items-center justify-center shrink-0">
                {comparedRoleIds.length}
              </span>
              <div className="text-xs font-bold truncate">
                <span>{comparedRoleIds.length} roles selected for comparison</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setComparedRoleIds([])}
                className="text-[11px] font-semibold opacity-75 hover:opacity-100 px-2 py-1 transition-opacity cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleGoToCompare}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-background text-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Compare Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <VisualCareerRoadmapModal
        role={role}
        isOpen={roadmapModalOpen}
        onClose={() => setRoadmapModalOpen(false)}
      />

      <PersonalizedCareerFitModal
        role={role}
        isOpen={fitModalOpen}
        onClose={() => setFitModalOpen(false)}
      />
    </div>
  );
}

export default RoleDetailPage;
