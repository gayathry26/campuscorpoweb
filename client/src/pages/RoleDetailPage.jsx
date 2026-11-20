import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
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
  ArrowRight,
  Layers,
  Check,
  AlertCircle,
  X,
  GraduationCap,
  Star,
} from 'lucide-react';
import careerService from '../services/careerService';
import { DOMAIN_ICONS } from '../components/career/InteractiveDomainGrid';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';
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

  // 2. Interactive & Modal States
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [activeRoadmapStage, setActiveRoadmapStage] = useState(0);

  // 3. Comparison Queue State (synced with localStorage)
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

  // Fetch Role Specifications
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

  // Check if role is favorited
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
          ? `"${role.title}" saved to your favourites.`
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
          message: `${role.title} removed from comparison`,
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
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-6 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
        <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
      </div>
    );
  }

  // Not Found State
  if (notFound || !role) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <Briefcase className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Career Role Not Found
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We couldn't locate role specifications for{' '}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              "{roleSlug || targetRole}"
            </code>
            .
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={domainSlug ? `/domains/${domainSlug}` : '/domains'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Domain</span>
          </Link>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
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

  // Categorize Technical Skills into clean clusters
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
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Alert Feedback */}
      {toast && (
        <aside aria-label="Notifications" className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-neutral-700 dark:border-neutral-300">
            {toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
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
        </aside>
      )}

      {/* Top Bar: Breadcrumbs & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Link to="/domains" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Career Explorer
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link to="/domains" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Explore Domains
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link
            to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors truncate max-w-[200px]"
          >
            {domainName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[220px]">
            {title}
          </span>
        </nav>

        <Link
          to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {domainName}</span>
        </Link>
      </div>

      {/* ================= SECTION A: ROLE OVERVIEW ================= */}
      <section aria-labelledby="role-overview-heading" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 shadow-xs">
              <DomainIcon className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={resolvedDomainSlug ? `/domains/${resolvedDomainSlug}` : '/domains'}
                  className="text-sm font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {domainName}
                </Link>
                {role.level && (
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    {role.level}
                  </span>
                )}
              </div>

              <h1 id="role-overview-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {title}
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                {shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Clean, Consistent Action Layout */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-2.5">
          {/* 1. Assess My Skills */}
          <Link
            to={`/skill-analyzer?role=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Cpu className="w-4 h-4" />
            <span>Assess My Skills</span>
          </Link>

          {/* 2. Analyze My Resume */}
          <Link
            to={`/resume-analyzer?targetRole=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <FileSearch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Analyze My Resume</span>
          </Link>

          {/* 3. Compare Role */}
          <button
            type="button"
            onClick={handleToggleCompare}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer shadow-xs ${
              isCompared
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>{isCompared ? 'In Comparison' : 'Compare Role'}</span>
          </button>

          {/* 5. Save to Favourites */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer shadow-xs ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
            title={isFavorite ? 'Remove from favourites' : 'Save role to favourites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current text-amber-500' : 'text-neutral-400'}`} />
            <span>{isFavorite ? 'Saved' : 'Save Role'}</span>
          </button>

          {/* 6. View Learning Roadmap Modal */}
          <button
            type="button"
            onClick={() => setRoadmapModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs ml-auto"
          >
            <Compass className="w-4 h-4 text-neutral-500" />
            <span>View Visual Roadmap</span>
          </button>
        </div>
      </section>

      {/* ================= SECTION C: WHAT YOU WILL DO ================= */}
      <section aria-labelledby="responsibilities-heading" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 id="responsibilities-heading" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            What You Will Do
          </h2>
        </div>

        {scope && (
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 dark:text-white font-semibold block mb-0.5">
                Engineering Mission:
              </strong>
              <span>{scope}</span>
            </div>
          </div>
        )}

        {responsibilities.length > 0 && (
          <div className="space-y-3 pt-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Key Responsibilities & Deliverables
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {responsibilities.map((resp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-start gap-3 text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= SECTION D: SKILLS REQUIRED ================= */}
      <section aria-labelledby="skills-heading" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 id="skills-heading" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Skills Required
            </h2>
          </div>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {technicalSkills.length} Technical • {softSkills.length} Behavioral
          </span>
        </div>

        {/* Categorized Technical Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validSkillGroups.map(([groupName, items]) => (
            <div
              key={groupName}
              className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-2.5"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                {groupName}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Soft Skills */}
        {softSkills.length > 0 && (
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Professional & Behavioral Soft Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {softSkills.map((trait, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Industry Toolchains */}
        {tools.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-neutral-400" />
              <span>Production Tools & Environments</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= SECTION E: QUALIFICATIONS & LEARNING ================= */}
      <section aria-labelledby="qualifications-heading" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 id="qualifications-heading" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
            Qualifications & Learning Prerequisites
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Beginner Prerequisites */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-2.5">
            <span className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Beginner Prerequisites
            </span>
            <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {(role.careerReadiness?.prerequisites || [
                'Basic programming syntax and logical problem solving',
                'Familiarity with version control (Git) and command line tools',
                'Foundational computer science or engineering coursework'
              ]).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Expected for Entry-Level & Internships */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-2.5">
            <span className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Expected for Campus Placement
            </span>
            <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {(role.careerReadiness?.entryLevelExpected || [
                'Ability to build functional modules adhering to standard patterns',
                'Handling API calls, asynchronous states, and input validation',
                'Writing clean, documented code and working in Agile team sprints'
              ]).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-2" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Certifications */}
        {certifications.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Recommended Industry Certifications</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {certifications.map((cert, cIdx) => (
                <div
                  key={cIdx}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                      {cert.name}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                        cert.type === 'FREE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {cert.type}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                    {cert.provider}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= SECTION F: CAREER ROADMAP & PROJECTS ================= */}
      <section aria-labelledby="roadmap-heading" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 id="roadmap-heading" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Career Roadmap & Practical Capstones
            </h2>
          </div>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Beginner → Intermediate → Advanced
          </span>
        </div>

        {/* Interactive Progressive Stages */}
        {roadmap.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              {roadmap.map((stg, sIndex) => (
                <button
                  key={sIndex}
                  type="button"
                  onClick={() => setActiveRoadmapStage(sIndex)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeRoadmapStage === sIndex
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  Stage {sIndex + 1}: {stg.title || stg.stage}
                </button>
              ))}
            </div>

            {(() => {
              const currentStage = roadmap[activeRoadmapStage] || roadmap[0];
              return (
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-4 animate-in fade-in-50 duration-150">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                      Stage 0{activeRoadmapStage + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      {currentStage.title || currentStage.stage}
                    </h3>
                    {currentStage.description && (
                      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {currentStage.description}
                      </p>
                    )}
                  </div>

                  {/* Stage Skills & Tools */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentStage.skills && currentStage.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                          Target Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentStage.skills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStage.tools && currentStage.tools.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                          Toolchains
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentStage.tools.map((tl, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                            >
                              {tl}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Recommended Capstone Projects */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Recommended Practical Capstones (Proof of Work)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Beginner */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 inline-block">
                  Beginner Capstone
                </span>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                  {(projects.beginner && projects.beginner[0]?.title) || (typeof projects.beginner?.[0] === 'string' ? projects.beginner[0] : 'Foundational Portfolio App')}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {(projects.beginner && projects.beginner[0]?.description) || 'Build and deploy a functional end-to-end utility applying domain fundamentals.'}
                </p>
              </div>
            </div>

            {/* Intermediate */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 inline-block">
                  Intermediate Project
                </span>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                  {(projects.intermediate && projects.intermediate[0]?.title) || (typeof projects.intermediate?.[0] === 'string' ? projects.intermediate[0] : 'Production Enterprise Application')}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {(projects.intermediate && projects.intermediate[0]?.description) || 'Incorporate asynchronous APIs, authentication, testing, and responsive UI components.'}
                </p>
              </div>
            </div>

            {/* Advanced */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 inline-block">
                  Advanced Scalable System
                </span>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                  {(projects.advanced && projects.advanced[0]?.title) || (typeof projects.advanced?.[0] === 'string' ? projects.advanced[0] : 'Distributed Cloud-Native Architecture')}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {(projects.advanced && projects.advanced[0]?.description) || 'Architect distributed caching, CI/CD pipelines, containerized orchestration, and analytics.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPACT COMPARISON INDICATOR ================= */}
      {comparedRoleIds.length > 0 && (
        <aside aria-label="Comparison Tray" className="fixed bottom-6 right-6 sm:right-8 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-full px-4 py-2.5 shadow-xl border border-neutral-700/60 dark:border-neutral-200 flex items-center gap-3 text-sm font-semibold backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                {comparedRoleIds.length}
              </span>
              <span>
                {comparedRoleIds.length === 1 ? '1 role' : `${comparedRoleIds.length} roles`} selected
              </span>
            </div>

            <div className="h-3.5 w-px bg-white/20 dark:bg-black/20" />

            <button
              type="button"
              onClick={handleGoToCompare}
              className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-purple-300 dark:text-purple-700 hover:underline cursor-pointer"
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setComparedRoleIds([])}
              className="p-0.5 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
              title="Clear comparison"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Modals */}
      <VisualCareerRoadmapModal
        role={role}
        isOpen={roadmapModalOpen}
        onClose={() => setRoadmapModalOpen(false)}
      />
    </div>
  );
}

export default RoleDetailPage;
