import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Download,
  CheckCircle2,
  Bookmark,
  Clock,
  Code2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Award,
  Layers,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FileText,
  Compass,
  FolderGit2,
  RefreshCw,
  Search,
  ChevronUp,
  X,
  Briefcase,
  Wrench,
  Shield,
  TrendingUp,
  DollarSign,
  Building2,
  Terminal,
  Cpu,
  Filter,
  Printer,
  CheckSquare,
  Network
} from 'lucide-react';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { DOMAIN_ICONS } from '../../components/career/InteractiveDomainGrid';

export function DomainLearningWorkspace() {
  const { domainSlug, moduleNumber } = useParams();
  const navigate = useNavigate();

  // 1. Data States
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Active View Tab (14 Tabs)
  const [activeTab, setActiveTab] = useState('overview');

  // 3. Sub-States for specific tabs
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');
  const [activeInterviewFilter, setActiveInterviewFilter] = useState('All');
  const [expandedInterviewIndex, setExpandedInterviewIndex] = useState(null);
  const [interviewSearch, setInterviewSearch] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // 4. Progress, Quiz & Bookmark States
  const [completedModules, setCompletedModules] = useState(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});

  // Fetch complete 14-section syllabus
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await domainKnowledgeService.getFullSyllabus(domainSlug);
        if (!isMounted) return;
        if (!data) {
          setError(`Domain '${domainSlug}' not found.`);
        } else {
          setDomain(data);
          // Set page title dynamically
          document.title = `${data.name} — IT Domain Knowledge Hub | CampusCorpo`;

          // If moduleNumber param was provided, switch directly to 12-modules tab
          if (moduleNumber) {
            const modNum = parseInt(moduleNumber, 10);
            if (modNum >= 1 && modNum <= 12) {
              setActiveTab('modules');
              setActiveModuleIndex(modNum - 1);
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load domain knowledge data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [domainSlug, moduleNumber]);

  // Copy code helper
  const handleCopyCode = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Toggle module completion
  const handleToggleModuleComplete = (modNum) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modNum)) {
        next.delete(modNum);
      } else {
        next.add(modNum);
      }
      // Save to service
      domainKnowledgeService.saveProgress(domain?.id, modNum, next.has(modNum));
      return next;
    });
  };

  // Toggle bookmark
  const handleToggleBookmark = (itemKey) => {
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  // Quiz submission
  const handleSelectQuizAnswer = (qId, optionIdx) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = (modNum) => {
    setQuizSubmitted((prev) => ({ ...prev, [modNum]: true }));
    handleToggleModuleComplete(modNum);
  };

  // Handle PDF Export
  const handleExportPdf = () => {
    if (domain) {
      domainKnowledgeService.exportPrintableDocument(domain);
    }
  };

  // Filtered interview questions
  const filteredInterviews = useMemo(() => {
    if (!domain?.interviews) return [];
    let list = domain.interviews;

    if (activeInterviewFilter !== 'All') {
      list = list.filter((item) => item.level === activeInterviewFilter);
    }

    if (interviewSearch.trim()) {
      const q = interviewSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [domain, activeInterviewFilter, interviewSearch]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!domain?.projects) return [];
    if (activeProjectFilter === 'All') return domain.projects;
    return domain.projects.filter((p) => p.level === activeProjectFilter);
  }, [domain, activeProjectFilter]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-80 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          <div className="h-80 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          <div className="h-80 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Knowledge Hub Domain Not Found
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We couldn't locate curriculum records for <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">"{domainSlug}"</code>.
          </p>
        </div>
        <div>
          <Link
            to="/career-explorer/knowledge-hub"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All 38 Domains</span>
          </Link>
        </div>
      </div>
    );
  }

  const DomainIcon = DOMAIN_ICONS[domain.name] || Layers;
  const progressPercent = Math.round((completedModules.size / 12) * 100);

  // Define the 14 Tabs
  const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'subdomains', label: `Subdomains (${domain.subdomains?.length || 6})`, icon: Layers },
    { id: 'roles', label: `Career Roles (${domain.careerRoles?.length || 0})`, icon: Briefcase },
    { id: 'skills', label: 'Required Skills', icon: Sparkles },
    { id: 'tech-stack', label: 'Tech Stack', icon: Wrench },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
    { id: 'modules', label: '12 Modules', icon: Code2, badge: `${completedModules.size}/12` },
    { id: 'projects', label: `9 Projects (${domain.projects?.length || 9})`, icon: FolderGit2 },
    { id: 'interviews', label: `Interview Prep (${domain.interviews?.length || 90})`, icon: HelpCircle },
    { id: 'industry-apps', label: 'Industry Use Cases', icon: Building2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'trends', label: 'Industry Trends & AI', icon: TrendingUp },
    { id: 'salary', label: 'Salary & Demand', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      {/* 1. TOP BREADCRUMB & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Link to="/career-explorer/knowledge-hub" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Knowledge Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 dark:text-white font-semibold truncate">
            {domain.name}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/career-explorer/knowledge-hub"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Domains</span>
          </Link>
        </div>
      </div>

      {/* 2. HERO BANNER */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 shadow-xs">
              <DomainIcon className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {domain.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  {domain.family}
                </span>
              </div>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {domain.shortDescription || domain.overview}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block">Curriculum Progress</span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">{progressPercent}% Completed</span>
            </div>
            <div className="w-32 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. STICKY 14-TAB NAVIGATION BAR */}
      <div className="sticky top-2 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto scrollbar-none flex items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.action) {
                  tab.action();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white dark:bg-black/20 dark:text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="pt-2">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* Detailed Definition */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Domain Definition</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  What is {domain.name}?
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.introduction?.definition || domain.overview}
                </p>
              </div>

              {/* What this domain actually does */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>Core Responsibilities</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  What Engineers & Professionals in this Domain Actually Do
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.introduction?.whatItDoes}
                </p>
                {Array.isArray(domain.whatProfessionalsDo) && domain.whatProfessionalsDo.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {domain.whatProfessionalsDo.map((task, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Why it exists & Real World Usage */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Enterprise Relevance</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Why this Domain Exists & Problems it Solves
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.introduction?.whyItExists}
                </p>
              </div>
            </div>

            {/* Right Column: Strategic Pillars */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Real-World Industries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(domain.introduction?.realWorldIndustries || ['IT Services', 'Product SaaS', 'Fintech', 'Healthcare', 'E-Commerce']).map((ind, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Importance in IT Industry
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.introduction?.industryImportance}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Future Opportunities (2026–2035)
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.introduction?.futureOpportunities}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBDOMAINS (6-8 SPECIALIZATIONS) */}
        {activeTab === 'subdomains' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Subdomains & Specialized Technical Tracks
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Explore major engineering specializations, key tools, and problems solved in this field.
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-400">
                {domain.subdomains?.length || 6} Specializations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(domain.subdomains || []).map((sub, idx) => (
                <div key={sub.id || idx} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                      0{idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {sub.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Key Technologies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(sub.keyTechnologies || []).map((t, tidx) => (
                          <span key={tidx} className="px-2 py-0.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {Array.isArray(sub.problemsSolved) && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Problems Solved
                        </span>
                        <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                          {sub.problemsSolved.map((p, pidx) => (
                            <li key={pidx} className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAREER ROLES & LADDERS */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Industry Career Roles & Job Opportunities
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Verified roles mapped from entry-level graduates to principal architects.
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-400">
                {domain.careerRoles?.length || 0} Industry Roles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(domain.careerRoles || []).map((role) => (
                <div key={role.id} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {role.level || 'Professional Role'}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {role.title}
                      </h3>
                    </div>
                    {role.stats?.averageSalary && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {role.stats.averageSalary}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {role.shortDescription}
                  </p>

                  {/* Skills & Tools */}
                  <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Technical Competencies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(role.technicalSkills || []).slice(0, 5).map((s, sidx) => (
                          <span key={sidx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/domains/${domain.id}/${role.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        <span>View Role Roadmap & Deliverables</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REQUIRED SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Core Competencies & Skills Required
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Categorized breakdown of technical, algorithmic, toolchain, and communication skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(domain.skills || {}).map(([key, items], idx) => {
                const titleMap = {
                  technicalSkills: 'Technical Engineering Skills',
                  programmingSkills: 'Programming & Syntax Fluency',
                  coreConcepts: 'Foundational CS Concepts',
                  toolsAndPlatforms: 'Tools & Platforms',
                  problemSolving: 'Problem-Solving & Debugging',
                  communicationCollaboration: 'Communication & Agile Workflow',
                  industrySpecificKnowledge: 'Industry Standards & Compliance'
                };
                return (
                  <div key={key} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                        0{idx + 1}
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {titleMap[key] || key}
                      </h3>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {(items || []).map((skill, sidx) => (
                        <li key={sidx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: TECH STACK */}
        {activeTab === 'tech-stack' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Complete Technology Stack & Enterprise Toolchains
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                11-Tier functional architecture explaining tools and why enterprise engineers use them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(domain.techStack || {}).map(([tierKey, items]) => {
                const labelMap = {
                  programmingLanguages: 'Programming Languages',
                  frameworks: 'Application Frameworks',
                  libraries: 'Essential Libraries',
                  developmentTools: 'Development & Build Tools',
                  platforms: 'Runtimes & Server Platforms',
                  databases: 'Databases & In-Memory Stores',
                  cloudServices: 'Cloud Services & Infrastructure',
                  industrySoftware: 'Enterprise & Container Software',
                  testingTools: 'Testing & Quality Verification',
                  monitoringTools: 'Telemetry & Observability',
                  deploymentTools: 'CI/CD & Deployment Automation'
                };
                return (
                  <div key={tierKey} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {labelMap[tierKey] || tierKey}
                    </h3>
                    <div className="space-y-3">
                      {(items || []).map((techItem, tidx) => (
                        <div key={tidx} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 space-y-1">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white block">
                            {techItem.name}
                          </span>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {techItem.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: LEARNING ROADMAP (6 LEVELS) */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Beginner-to-Advanced 6-Level Learning Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Ordered progression from academic foundations to enterprise technical leadership.
              </p>
            </div>

            <div className="space-y-6">
              {(domain.learningRoadmap || []).map((lvl) => (
                <div key={lvl.level} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        L{lvl.level}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {lvl.title}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      Duration: {lvl.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                        Core Syllabus Topics
                      </span>
                      <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {(lvl.topics || []).map((topic, tidx) => (
                          <li key={tidx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Hands-On Milestones & Outcomes
                      </span>
                      <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {(lvl.handsOnMilestones || []).map((ms, midx) => (
                          <li key={midx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{ms}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: 12 STRUCTURED MODULES */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Module Directory Navigation */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">12 Learning Modules</span>
                  <span className="text-xs font-bold text-purple-600">{completedModules.size} of 12 Completed</span>
                </div>

                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {(domain.modules || []).map((m, idx) => {
                    const isSelected = activeModuleIndex === idx;
                    const isDone = completedModules.has(m.moduleNumber);
                    return (
                      <button
                        key={m.moduleNumber}
                        type="button"
                        onClick={() => setActiveModuleIndex(idx)}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-neutral-900'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {m.moduleNumber}
                          </span>
                          <span className="text-xs font-semibold truncate">
                            {m.title}
                          </span>
                        </div>

                        {isDone && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Module Interactive Workspace */}
            <div className="lg:col-span-8 space-y-6">
              {(() => {
                const activeMod = domain.modules?.[activeModuleIndex] || domain.modules?.[0];
                if (!activeMod) return null;
                const isDone = completedModules.has(activeMod.moduleNumber);

                return (
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
                    {/* Module Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Module {activeMod.moduleNumber} of 12
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                          {activeMod.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                          {activeMod.subtitle} • Est. Time: {activeMod.estimatedMinutes} Mins
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleModuleComplete(activeMod.moduleNumber)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? 'Completed' : 'Mark Complete'}</span>
                      </button>
                    </div>

                    {/* Learning Objectives */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-200/70 dark:border-neutral-700/60 space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                        Module Learning Objectives
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {(activeMod.learningObjectives || []).map((obj, oidx) => (
                          <li key={oidx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Core Conceptual Theory */}
                    <div className="space-y-4">
                      {(activeMod.coreConcepts || []).map((cc, cidx) => (
                        <div key={cidx} className="space-y-1.5">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {cc.heading}
                          </h4>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {cc.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Hands-On Code Lab */}
                    {activeMod.codeLab && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            <Code2 className="w-4 h-4 text-purple-600" />
                            <span>{activeMod.codeLab.codeTitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(activeMod.codeLab.codeSnippet, `mod-${activeMod.moduleNumber}`)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                          >
                            {copiedCodeId === `mod-${activeMod.moduleNumber}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                          <code>{activeMod.codeLab.codeSnippet}</code>
                        </pre>
                        {activeMod.codeLab.explanation && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                            {activeMod.codeLab.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Practical Exercises */}
                    {activeMod.practicalExercises && activeMod.practicalExercises.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                          Hands-On Practical Exercises
                        </span>
                        <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                          {activeMod.practicalExercises.map((ex, eidx) => (
                            <li key={eidx} className="flex items-start gap-2">
                              <span className="font-bold text-neutral-400">{eidx + 1}.</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Assessment Quiz */}
                    {activeMod.assessments && activeMod.assessments.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Module Knowledge Check ({activeMod.assessments.length} Questions)
                          </span>
                        </div>

                        <div className="space-y-4">
                          {activeMod.assessments.map((q, qidx) => {
                            const selected = quizAnswers[q.id];
                            const submitted = quizSubmitted[activeMod.moduleNumber];
                            const isCorrect = selected === q.correctAnswer;

                            return (
                              <div key={q.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
                                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                                  {qidx + 1}. {q.question}
                                </span>

                                <div className="space-y-1.5">
                                  {q.options.map((opt, oidx) => {
                                    let btnStyle = 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
                                    if (selected === oidx) {
                                      btnStyle = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-400';
                                    }
                                    if (submitted) {
                                      if (oidx === q.correctAnswer) {
                                        btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500 font-semibold';
                                      } else if (selected === oidx) {
                                        btnStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500';
                                      }
                                    }

                                    return (
                                      <button
                                        key={oidx}
                                        type="button"
                                        disabled={submitted}
                                        onClick={() => handleSelectQuizAnswer(q.id, oidx)}
                                        className={`w-full text-left px-3.5 py-2 rounded-xl text-xs border transition-all cursor-pointer ${btnStyle}`}
                                      >
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {submitted && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 italic pt-1">
                                    {q.explanation}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {!quizSubmitted[activeMod.moduleNumber] ? (
                          <button
                            type="button"
                            onClick={() => handleSubmitQuiz(activeMod.moduleNumber)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                          >
                            Submit Knowledge Check Answers
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Assessment evaluated and module completed!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 8: 9 PRACTICAL PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  9 Practical Industry Capstones
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  3 Beginner, 3 Intermediate, and 3 Advanced production-grade portfolio projects.
                </p>
              </div>

              {/* Project Level Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setActiveProjectFilter(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeProjectFilter === lvl
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => {
                const levelColor =
                  proj.level === 'Beginner'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : proj.level === 'Intermediate'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

                return (
                  <div key={proj.id} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${levelColor}`}>
                          {proj.level}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {proj.problemStatement}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <div>
                        <span className="font-bold text-neutral-400 block mb-1">Architecture</span>
                        <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {proj.architectureOverview}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-neutral-400 block mb-1">Tech Stack</span>
                        <div className="flex flex-wrap gap-1">
                          {(proj.techStack || []).map((t, tidx) => (
                            <span key={tidx} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {Array.isArray(proj.resumeDescription) && proj.resumeDescription.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(proj.resumeDescription.join('\n'), proj.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            {copiedCodeId === proj.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Resume Bullets Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Resume Bullets</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 9: INTERVIEW PREP (90 Q&AS) */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Technical Interview Preparation (90 Questions & Answers)
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Comprehensive answers across 30 Beginner, 30 Intermediate, and 30 Advanced questions.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setActiveInterviewFilter(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeInterviewFilter === lvl
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar within Interviews */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search interview questions by keyword or topic..."
                value={interviewSearch}
                onChange={(e) => setInterviewSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Questions Accordion List */}
            <div className="space-y-3">
              {filteredInterviews.slice(0, 45).map((item, idx) => {
                const isExpanded = expandedInterviewIndex === idx;
                return (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedInterviewIndex(isExpanded ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {item.questionNumber}
                        </span>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                            {item.level} • {item.category}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                            {item.question}
                          </h3>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 sm:p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line pt-4">
                          {item.answer}
                        </p>

                        {Array.isArray(item.keyTakeaways) && item.keyTakeaways.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                              What Interviewers Evaluate
                            </span>
                            <ul className="text-xs text-purple-900 dark:text-purple-200 space-y-1">
                              {item.keyTakeaways.map((kt, ktidx) => (
                                <li key={ktidx} className="flex items-start gap-1.5">
                                  <span className="font-bold">•</span>
                                  <span>{kt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredInterviews.length > 45 && (
                <div className="text-center py-4">
                  <p className="text-xs text-neutral-400">
                    Showing top 45 of {filteredInterviews.length} questions. Use search bar to find specific topics.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: INDUSTRY USE CASES (8 SECTORS) */}
        {activeTab === 'industry-apps' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Enterprise Industry Applications & Real-World Use Cases
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Detailed architectural deployments across 8 major global enterprise sectors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(domain.industryApplications || []).map((app, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Sector 0{idx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      {app.sector}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {app.overview}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Production Case Studies
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                      {(app.realWorldUseCases || []).map((cs, cidx) => (
                        <li key={cidx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{cs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(app.examples || []).map((ex, eidx) => (
                      <span key={eidx} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Recognized Certifications & Professional Development
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Official credentials from global vendor boards and industry standards bodies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(domain.certifications || []).map((cert, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {cert.tier}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {cert.title}
                    </h3>
                    <span className="text-xs font-semibold text-neutral-500 block">
                      Issuing Body: {cert.issuingBody}
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {cert.examFocus}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-400 block">
                      Recommended Prep: {cert.preparationDuration}
                    </span>
                    <a
                      href={cert.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>Official Exam Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: INDUSTRY TRENDS & AI */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Industry Trends, Enterprise Adoption & AI Impact
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Strategic perspective on how AI and emerging paradigms are reshaping this discipline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  AI & Agentic Disruption
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  How AI & Autonomous Workflows are Transforming {domain.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.industryTrends?.aiTransformation}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Enterprise Adoption Patterns
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Global 2000 Modernization Trends
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.industryTrends?.enterpriseAdoption}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Emerging Frameworks & Tools
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Next-Generation Technologies
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  {(domain.industryTrends?.emergingTools || []).map((tool, tidx) => (
                    <li key={tidx} className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Strategic Horizon
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Next 5 to 10 Years Industry Outlook
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {domain.industryTrends?.fiveToTenYearOutlook}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: SALARY & DEMAND INTELLIGENCE */}
        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Salary Bands & Global Job Demand Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Verified compensation benchmarks across India and global remote markets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(domain.salaryIntelligence?.salaryBands || {}).map(([bandKey, band]) => {
                const labelMap = {
                  fresher: 'Entry-Level / Graduate (0–1y)',
                  midLevel: 'Mid-Level Engineer (2–5y)',
                  senior: 'Senior Engineer (5–8y)',
                  leadArchitect: 'Lead / Principal (8y+)'
                };
                return (
                  <div key={bandKey} className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      {labelMap[bandKey] || bandKey}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 block">
                      ₹{band.minLpa} – ₹{band.maxLpa} LPA
                    </span>
                    <span className="text-[11px] text-neutral-500 block">Annual Fixed + CTC</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Global Market Context (USD Equivalent)
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  <div className="flex justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <span className="font-semibold">US Engineering Hubs:</span>
                    <span className="font-mono font-bold text-emerald-600">{domain.salaryIntelligence?.globalSalaryContext?.usMarket}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <span className="font-semibold">European Tech Hubs:</span>
                    <span className="font-mono font-bold text-emerald-600">{domain.salaryIntelligence?.globalSalaryContext?.europeanMarket}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <span className="font-semibold">Global Remote Roles:</span>
                    <span className="font-mono font-bold text-emerald-600">{domain.salaryIntelligence?.globalSalaryContext?.remoteGlobalTier}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Top In-Demand Skills Commanding Premium
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(domain.salaryIntelligence?.highDemandSkills || []).map((sk, skidx) => (
                    <span key={skidx} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DomainLearningWorkspace;
