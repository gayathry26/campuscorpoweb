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
  Bookmark,
  Star,
  FileText,
} from 'lucide-react';
import careerService from '../services/careerService';
import { DOMAIN_ICONS } from '../components/career/InteractiveDomainGrid';
import { Badge } from '../components/Badge';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';
import PersonalizedCareerFitModal from '../components/career/PersonalizedCareerFitModal';
import { getRoleById, CAREER_DOMAINS } from '../data/itRoles';

export function RoleDetailPage() {
  const { domainSlug, roleSlug, slug } = useParams();
  const targetRole = roleSlug || slug || domainSlug;
  const navigate = useNavigate();

  // 1. Data States
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Fetch Role Details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);
    setError(null);

    const fetchPromise = (domainSlug && roleSlug)
      ? careerService.getRoleByDomainAndSlug(domainSlug, roleSlug)
      : careerService.getRoleById(targetRole);

    fetchPromise
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
  }, [domainSlug, roleSlug, targetRole]);

  // Check if role is in favourites
  useEffect(() => {
    if (!role?.id) return;
    careerService.getFavorites().then((favs) => {
      if (Array.isArray(favs)) {
        setIsFavorite(favs.some((f) => (typeof f === 'string' ? f : f.id) === role.id));
      }
    });
  }, [role?.id]);

  const handleToggleFavorite = async () => {
    if (!role?.id) return;
    const res = await careerService.toggleFavorite(role.id);
    if (res?.success) {
      setIsFavorite(res.saved);
      setToast({
        type: 'success',
        message: res.saved
          ? `"${role.title}" saved to your favourites!`
          : `"${role.title}" removed from favourites.`,
      });
    }
  };

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
    relatedRoles = [],
    domain = {},
  } = role;

  const domainName = domain?.name || category;
  const resolvedDomainSlug =
    domainSlug ||
    role?.domainSlug ||
    role?.domain?.slug ||
    role?.domain?.id ||
    (domainName ? domainName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
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
              to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
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
              to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-border/60 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {domainName}</span>
            </Link>

            <Link
              to={`/compare${comparedRoleIds.length > 0 ? `?roles=${comparedRoleIds.join(',')}` : ''}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-border bg-card hover:bg-secondary text-foreground transition-colors shadow-2xs"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare</span>
              {comparedRoleIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-foreground text-background">
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
                    to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-secondary text-foreground border border-border/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
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

                <h1 className="text-2xl font-bold text-foreground tracking-tight">
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
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Campus Placement Band
              </span>
              <span className="text-base font-black text-foreground mt-0.5 block truncate">
                {salaryText}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Active Job Openings
              </span>
              <span className="text-base font-bold text-foreground mt-0.5 block truncate">
                {stats.jobOpenings || 'Active Recruiting'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Market Growth Rate
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                {stats.growthRate || '+18% YoY'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Curriculum Stack
              </span>
              <span className="text-base font-bold text-foreground mt-0.5 block truncate">
                {technicalSkills.length} Skills • {tools.length} Tools
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/70">
            {/* 1. Save Role to Favourites */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-2xs ${
                isFavorite
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
              title={isFavorite ? 'Remove from favourites' : 'Save role to favourites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : 'text-amber-500'}`} />
              <span>{isFavorite ? 'Saved to Favourites' : 'Save to Favourites'}</span>
            </button>

            {/* 2. Assess My Skills (links directly to Skill Analyzer with preselected role) */}
            <Link
              to={`/skill-analyzer?role=${encodeURIComponent(id)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary hover:opacity-90 text-primary-foreground transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Assess My Skills</span>
            </Link>

            {/* 3. Analyze My Resume for This Role */}
            <Link
              to={`/resume-analyzer?targetRole=${encodeURIComponent(id)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analyze My Resume</span>
            </Link>

            {/* 4. Compare Roles */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer shadow-2xs ${
                isCompared
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{isCompared ? 'In Compare Queue' : 'Compare Role'}</span>
            </button>

            {/* 5. View Full Roadmap */}
            <button
              type="button"
              onClick={() => setRoadmapModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Compass className="w-4 h-4 text-muted-foreground" />
              <span>View Learning Roadmap</span>
            </button>
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Primary Day-to-Day Responsibilities
                  </h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {responsibilities.length} Verified Deliverables
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-3 text-sm sm:text-base text-foreground/90 leading-relaxed"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Required Skills & Competencies
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {technicalSkills.length} Technical • {softSkills.length} Behavioral
              </span>
            </div>

            {/* Categorized Clusters */}
            <div className="space-y-4">
              {validSkillGroups.map(([groupName, items]) => (
                <div key={groupName} className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {groupName}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-card border border-border text-foreground shadow-2xs hover:border-foreground/30 transition-colors"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Behavioral & Professional Communication Traits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {softSkills.map((trait, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1.5 rounded-xl text-sm font-medium bg-card border border-border text-muted-foreground"
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
                  <Wrench className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Standard Production Toolchains
                  </h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {tools.length} Industry Tools
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {tools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-secondary text-foreground border border-border shadow-2xs"
                  >
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION F: Career Readiness Benchmarks */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Career Readiness Benchmarks
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Placement & Eligibility Progression
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* 1. Beginner Prerequisites */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Beginner Prerequisites
                </span>
                <div className="space-y-1.5 text-xs text-foreground/90">
                  {(role.careerReadiness?.prerequisites || [
                    'Basic programming syntax and logical problem solving',
                    'Familiarity with version control (Git) and command line tools',
                    'Foundational computer science coursework'
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Internship & Entry-Level Expected */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Expected for Entry-Level & Internships
                </span>
                <div className="space-y-1.5 text-xs text-foreground/90">
                  {(role.careerReadiness?.entryLevelExpected || [
                    'Ability to build functional modules adhering to design patterns',
                    'Handling API calls, asynchronous states, and input validation',
                    'Writing clean, documented code and working in Agile sprints'
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Mid-Level & Senior Additional Skills */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Mid-Level & Senior Progression Skills
                </span>
                <div className="space-y-1.5 text-xs text-foreground/90">
                  {(role.careerReadiness?.midSeniorExpected || [
                    'Architecting scalable, fault-tolerant distributed solutions',
                    'Leading technical root-cause incident post-mortems',
                    'Mentoring junior engineers and governing architectural standards'
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Common Knowledge Gaps to Address */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Common Knowledge Gaps to Work On
                </span>
                <div className="space-y-1.5 text-xs text-foreground/90">
                  {(role.careerReadiness?.gaps || [
                    'Relying solely on high-level libraries without understanding underlying system mechanics',
                    'Neglecting automated test coverage (unit, integration, load)',
                    'Overlooking security vulnerabilities and edge case boundaries'
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION E: Recommended Portfolio Capstones */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Recommended Portfolio Capstones
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Verifiable Proof of Work
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Build and showcase these production-grade projects on GitHub to substantiate your resume during campus interview screening:
            </p>

            {(() => {
              const renderProjectItems = (projData, fallbackTitle) => {
                const items = Array.isArray(projData)
                  ? projData
                  : projData
                  ? [projData]
                  : [fallbackTitle];

                return items.map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <div key={idx} className="text-sm font-semibold text-foreground leading-relaxed p-3 rounded-lg bg-card border border-border/60">
                        {p}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="p-3.5 rounded-lg bg-card border border-border/60 space-y-2">
                      <div className="font-bold text-sm text-foreground leading-snug">
                        {p.title || p.name || fallbackTitle}
                      </div>
                      {p.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {p.description}
                        </p>
                      )}
                      {Array.isArray(p.tech) && p.tech.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Technologies to Use:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {p.tech.map((t, tidx) => (
                              <span key={tidx} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-secondary text-foreground border border-border/70">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {Array.isArray(p.skills) && p.skills.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-border/40">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Skills Demonstrated:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {p.skills.map((s, sidx) => (
                              <span key={sidx} className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Beginner */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-block">
                        Beginner Project
                      </span>
                      <div className="space-y-2">
                        {renderProjectItems(projects.beginner, 'Foundational Domain Portfolio & Utility')}
                      </div>
                    </div>
                  </div>

                  {/* Intermediate */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 inline-block">
                        Intermediate Framework
                      </span>
                      <div className="space-y-2">
                        {renderProjectItems(projects.intermediate, 'End-to-End Enterprise Architecture Project')}
                      </div>
                    </div>
                  </div>

                  {/* Advanced */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 inline-block">
                        Advanced / Distributed
                      </span>
                      <div className="space-y-2">
                        {renderProjectItems(projects.advanced, 'Full Scalable Cloud & Distributed Capstone')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION F: Related Career Opportunities & Cross-Domain Pathways */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Related Career Opportunities & Pathways
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Skill Overlaps & Lateral Growth
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Explore roles sharing core competencies, cross-domain specializations, and potential career progression routes:
            </p>

            {/* Similar & Skill-Sharing Roles */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Roles That Share Skills & Core Competencies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(relatedRoles.length > 0
                  ? relatedRoles
                  : ['full-stack-developer', 'backend-developer', 'cloud-engineer']
                ).map((rId, idx) => {
                  const relRole = getRoleById(rId);
                  const relTitle = relRole?.title || rId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  const relCat = relRole?.category || domainName;
                  const relSlug = relRole?.id || rId;

                  return (
                    <Link
                      key={idx}
                      to={`/career-explorer/roles/${relSlug}`}
                      className="p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border/80 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {relTitle}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {relCat}
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{relRole?.level || 'Entry-Level'}</span>
                        <span className="text-primary font-semibold">Explore Role →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Alternative Technology Domains */}
            {domain?.relatedDomains && domain.relatedDomains.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Alternative & Adjacent Technology Domains
                </span>
                <div className="flex flex-wrap gap-2">
                  {domain.relatedDomains.map((domSlug, idx) => {
                    const domObj = CAREER_DOMAINS.find(d => d.id === domSlug);
                    const domTitle = domObj?.name || domSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                    return (
                      <Link
                        key={idx}
                        to={`/career-explorer/domains/${domSlug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/70 hover:bg-secondary text-foreground border border-border/70 transition-colors"
                      >
                        <span>{domTitle}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECTION G: Structured Career Preparation Roadmap */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/80">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                  Placement Preparation Roadmap
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
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
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                          Stage 0{activeRoadmapStage + 1}
                        </span>
                        <h4 className="text-lg font-black text-foreground">
                          {currentStage.title || currentStage.stage}
                        </h4>
                        {currentStage.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {currentStage.description}
                          </p>
                        )}
                      </div>

                      {/* Skills & Tools */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentStage.skills && currentStage.skills.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Target Competencies
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {currentStage.skills.map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-card border border-border text-foreground"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStage.tools && currentStage.tools.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Toolchains
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {currentStage.tools.map((tl, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-card border border-border text-foreground"
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
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Actionable Milestone Objectives
                          </span>
                          <ul className="space-y-1.5 text-sm text-foreground/90">
                            {currentStage.learningActivities.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
                      <h4 className="text-sm font-bold text-foreground">{s.t}</h4>
                      <p className="text-xs text-muted-foreground">{s.d}</p>
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
                  <HelpCircle className="w-5 h-5 text-sky-500" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                    High-Frequency Campus Interview Questions
                  </h3>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
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
                        className="w-full text-left p-3.5 text-sm font-bold text-foreground flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/60"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
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
                        <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t border-border/60 bg-card leading-relaxed">
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
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Placement Economics</span>
              </span>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Verified Band
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {salaryText}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Campus placement recruitment compensation band for entry to junior {title} roles.
              </p>
            </div>

            {stats.minLpa && stats.maxLpa && (
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 space-y-1.5 text-xs sm:text-sm">
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
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground block pb-2 border-b border-border/80">
              CampusCorp Action Hub
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFitModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Check My Career Fit</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCompare}
                className={`w-full py-2.5 px-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  isCompared
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 border-border'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>{isCompared ? 'Role Queued in Comparison' : 'Add to Compare Queue'}</span>
              </button>

              <Link
                to={`/resume-analyzer?targetRole=${encodeURIComponent(id)}`}
                className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold bg-card hover:bg-secondary text-foreground border border-border flex items-center justify-between transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-foreground" />
                  <span>ATS Resume Evaluation</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to={`/skill-analyzer?role=${encodeURIComponent(id)}`}
                className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold bg-card hover:bg-secondary text-foreground border border-border flex items-center justify-between transition-colors shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-foreground" />
                  <span>Verify Skill Gaps</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Card 3: Industry Credentials & Certifications */}
          {certifications.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Recognized Certifications</span>
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {certifications.length} Credentials
                </span>
              </div>

              <div className="space-y-2">
                {certifications.map((cert, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-1 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground leading-snug">{cert.name}</span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                          cert.type === 'FREE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {cert.type}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block">{cert.provider}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Verified Recruiters in Campus Drives */}
          {topHiringCompanies.length > 0 && (
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 pb-2 border-b border-border/80">
                <Building2 className="w-4 h-4 text-foreground" />
                <span>Recruiters for {title}</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {topHiringCompanies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-secondary text-foreground border border-border"
                  >
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card 5: CampusCorp LMS Integration */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>CampusCorp Learning Integration</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Enrolled students can track course credits, solve proctored compiler challenges, and practice live mock video rounds.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/lms"
                className="p-2.5 rounded-lg bg-card border border-border text-center font-bold text-xs sm:text-sm hover:bg-secondary text-foreground"
              >
                LMS Masterclass
              </Link>
              <Link
                to="/assessment"
                className="p-2.5 rounded-lg bg-card border border-border text-center font-bold text-xs sm:text-sm hover:bg-secondary text-foreground"
              >
                Code Sandbox
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT COMPARISON INDICATOR ================= */}
      {comparedRoleIds.length > 0 && (
        <div className="fixed bottom-5 right-5 sm:right-8 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] rounded-full px-3.5 py-2 shadow-2xl border border-neutral-700/60 dark:border-neutral-200/60 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {comparedRoleIds.length}
              </span>
              <span className="font-bold text-xs">
                {comparedRoleIds.length === 1 ? '1 role' : `${comparedRoleIds.length} roles`} selected
              </span>
            </div>

            <div className="h-3.5 w-px bg-white/20 dark:bg-black/20" />

            <button
              type="button"
              onClick={handleGoToCompare}
              className="inline-flex items-center gap-1 font-bold text-xs text-purple-300 dark:text-purple-700 hover:underline cursor-pointer"
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setComparedRoleIds([])}
              className="p-0.5 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer ml-0.5"
              title="Clear comparison"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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
