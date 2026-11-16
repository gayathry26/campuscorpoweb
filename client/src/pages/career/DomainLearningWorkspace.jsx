import React, { useState, useEffect, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { DOMAIN_ICONS } from '../../components/career/InteractiveDomainGrid';

export function DomainLearningWorkspace() {
  const { domainSlug, moduleNumber } = useParams();
  const navigate = useNavigate();

  const [domain, setDomain] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [activeModuleNumber, setActiveModuleNumber] = useState(parseInt(moduleNumber || '1', 10));
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);

  // User Interactive States
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookmarkedTopics, setBookmarkedTopics] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState(null);
  const [activeProjectTab, setActiveProjectTab] = useState('beginner'); // 'beginner' | 'intermediate' | 'advanced'
  const [topicSearch, setTopicSearch] = useState('');

  // 1. Load domain metadata and module manifest
  useEffect(() => {
    let isMounted = true;
    async function loadDomain() {
      try {
        setLoading(true);
        const data = await domainKnowledgeService.getDomainBySlug(domainSlug);
        if (!isMounted) return;
        setDomain(data);

        // Sync initial module number
        const requestedMod = parseInt(moduleNumber || '1', 10);
        if (requestedMod >= 1 && requestedMod <= (data?.totalModules || 12)) {
          setActiveModuleNumber(requestedMod);
        }
      } catch (err) {
        console.error('Failed to load domain knowledge data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDomain();
    return () => {
      isMounted = false;
    };
  }, [domainSlug, moduleNumber]);

  // 2. Load active module content whenever activeModuleNumber changes
  useEffect(() => {
    if (!domainSlug) return;
    let isMounted = true;

    async function loadModule() {
      try {
        setModuleLoading(true);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        setExpandedInterviewIdx(null);

        const data = await domainKnowledgeService.getModuleDetails(domainSlug, activeModuleNumber);
        if (!isMounted) return;

        setCurrentModule(data);
        setIsCompleted(Boolean(data?.userState?.isCompleted));
        setBookmarkedTopics(data?.userState?.bookmarks || []);
      } catch (err) {
        console.error(`Failed to load module ${activeModuleNumber}:`, err);
      } finally {
        if (isMounted) setModuleLoading(false);
      }
    }

    loadModule();
    return () => {
      isMounted = false;
    };
  }, [domainSlug, activeModuleNumber]);

  const handleSelectModule = (modNum) => {
    setActiveModuleNumber(modNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCompleted = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    await domainKnowledgeService.saveProgress(
      domainSlug,
      activeModuleNumber,
      nextState,
      quizScore,
      currentModule?.title
    );

    // Refresh domain progress counts
    const updated = await domainKnowledgeService.getDomainBySlug(domainSlug);
    if (updated) setDomain(updated);
  };

  const handleToggleBookmarkTopic = async (topicTitle) => {
    const isBookmarked = await domainKnowledgeService.toggleBookmark(
      domainSlug,
      activeModuleNumber,
      topicTitle
    );
    if (isBookmarked) {
      setBookmarkedTopics((prev) => [...prev, topicTitle]);
    } else {
      setBookmarkedTopics((prev) => prev.filter((t) => t !== topicTitle));
    }
  };

  const handleCopyCode = () => {
    if (currentModule?.codeSnippet?.code) {
      navigator.clipboard.writeText(currentModule.codeSnippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentModule?.assessments) return;
    let score = 0;
    currentModule.assessments.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const percentage = Math.round((score / currentModule.assessments.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    // If score >= 80%, auto mark module completed
    if (percentage >= 80 && !isCompleted) {
      setIsCompleted(true);
      await domainKnowledgeService.saveProgress(domainSlug, activeModuleNumber, true, percentage);
      const updated = await domainKnowledgeService.getDomainBySlug(domainSlug);
      if (updated) setDomain(updated);
    } else {
      await domainKnowledgeService.saveProgress(domainSlug, activeModuleNumber, isCompleted, percentage);
    }
  };

  const handleDownloadFullPdf = async () => {
    const fullSyllabus = await domainKnowledgeService.getFullSyllabus(domainSlug);
    if (fullSyllabus) {
      domainKnowledgeService.exportPrintableDocument({
        domain: fullSyllabus,
        moduleData: null
      });
    }
  };

  const handleDownloadModulePdf = () => {
    if (domain && currentModule) {
      domainKnowledgeService.exportPrintableDocument({
        domain,
        moduleData: currentModule
      });
    }
  };

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!currentModule?.sections) return [];
    if (!topicSearch.trim()) return currentModule.sections;
    const q = topicSearch.toLowerCase().trim();
    return currentModule.sections.filter(
      (sec) => sec.heading.toLowerCase().includes(q) || sec.content.toLowerCase().includes(q)
    );
  }, [currentModule, topicSearch]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-foreground">Loading curriculum workspace...</p>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Domain Curriculum Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested domain notes could not be located in the Knowledge Hub.</p>
        <Link
          to="/career-explorer/knowledge-hub"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-foreground text-background"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Hub</span>
        </Link>
      </div>
    );
  }

  const IconComponent = DOMAIN_ICONS[domain.name] || Layers;

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/career-explorer" className="hover:text-foreground transition-colors">
              Career Explorer
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/career-explorer/knowledge-hub" className="hover:text-foreground transition-colors font-medium">
              Domain Knowledge Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-bold">{domain.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadFullPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Download Complete Notes (PDF)</span>
            </button>
          </div>
        </div>

        {/* Domain Title & Overall Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <IconComponent className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-foreground border border-border">
                  {domain.family}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  • 12 Comprehensive Modules
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  • ~{domain.estimatedLearningHours || 15} Hours
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                {domain.name}
              </h1>
            </div>
          </div>

          {/* Overall Domain Progress Bar */}
          <div className="md:w-64 bg-secondary/50 p-3 rounded-2xl border border-border/80 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Domain Progress</span>
              <span>{domain.userProgress?.completedModules || 0} / 12 ({domain.userProgress?.percentage || 0}%)</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${domain.userProgress?.percentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKSPACE: LEFT NAV + RIGHT NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT SIDEBAR: 12-MODULE NAVIGATION ================= */}
        <aside className="lg:col-span-4 bg-card text-card-foreground border border-border rounded-3xl p-4 sm:p-5 shadow-xs lg:sticky lg:top-6 space-y-4 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                12 Learning Modules
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
              {domain.modules?.length || 12} Total
            </span>
          </div>

          {/* Module List Scroll Area */}
          <nav className="overflow-y-auto space-y-1.5 pr-1 flex-1">
            {(domain.modules || []).map((m) => {
              const isSelected = m.moduleNumber === activeModuleNumber;
              const isDone = domain.userProgress?.completedModuleNumbers?.includes(m.moduleNumber) || false;

              return (
                <button
                  key={m.moduleNumber}
                  type="button"
                  onClick={() => handleSelectModule(m.moduleNumber)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background shadow-xs font-bold'
                      : 'hover:bg-secondary text-foreground font-medium'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-background text-foreground'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : m.moduleNumber}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm line-clamp-1">
                        {m.title}
                      </span>
                    </div>
                    <span className={`text-[11px] block mt-0.5 line-clamp-1 ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`}>
                      {m.subtitle || `${m.estimatedMinutes} mins study`}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar Action: Full Handbook */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
            <Link
              to="/career-explorer/knowledge-hub"
              className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All 38 Domains</span>
            </Link>
            <button
              type="button"
              onClick={handleDownloadFullPdf}
              className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full PDF</span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT READING AREA: COMPREHENSIVE NOTES ================= */}
        <main className="lg:col-span-8 bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-9 shadow-xs space-y-8 min-w-0">
          {moduleLoading || !currentModule ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-sm font-semibold text-foreground">Rendering module notes and code lab...</p>
            </div>
          ) : (
            <>
              {/* Module Header Bar */}
              <div className="pb-6 border-b border-border/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      Module {currentModule.moduleNumber} of 12
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{currentModule.estimatedMinutes} mins
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mark Completed Button */}
                    <button
                      type="button"
                      onClick={handleToggleCompleted}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border-border'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                      <span>{isCompleted ? 'Module Completed' : 'Mark Completed'}</span>
                    </button>

                    {/* Download Module PDF */}
                    <button
                      type="button"
                      onClick={handleDownloadModulePdf}
                      title="Download this module as PDF"
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {currentModule.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
                    {currentModule.subtitle}
                  </p>
                </div>
              </div>

              {/* In-Module Topic Filter Input */}
              {currentModule.sections && currentModule.sections.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search topics inside this module..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* SECTION NOTES CONTENT */}
              <div className="space-y-7">
                {filteredSections.map((sec, idx) => {
                  const isBookmarked = bookmarkedTopics.includes(sec.heading);

                  return (
                    <article key={idx} className="space-y-3 scroll-mt-6">
                      <div className="flex items-center justify-between gap-3 group">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                          {sec.heading}
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleToggleBookmarkTopic(sec.heading)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-purple-600 transition-colors cursor-pointer"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-purple-600 text-purple-600' : ''}`} />
                        </button>
                      </div>

                      <div className="text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3 font-normal">
                        {sec.content.split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                            const bulletItems = paragraph.split('\n').filter((b) => b.trim());
                            return (
                              <ul key={pIdx} className="space-y-1.5 pl-4 list-disc marker:text-purple-600">
                                {bulletItems.map((item, bIdx) => (
                                  <li key={bIdx} className="leading-relaxed">
                                    {item.replace(/^[-•]\s*/, '')}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={pIdx} className="leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* CODE LAB SNIPPET (Module 5 or relevant) */}
              {currentModule.codeSnippet && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-purple-600" />
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Executable Implementation Lab
                      </h3>
                      <span className="text-xs font-mono uppercase bg-secondary px-2 py-0.5 rounded text-foreground font-semibold">
                        {currentModule.codeSnippet.language}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-neutral-950 text-neutral-100 p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm border border-neutral-800 shadow-inner">
                    <pre className="leading-relaxed whitespace-pre font-mono">
                      <code>{currentModule.codeSnippet.code}</code>
                    </pre>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed p-3.5 rounded-xl bg-secondary/50 border border-border/80">
                    <strong className="text-foreground font-semibold">Technical Walkthrough: </strong>
                    {currentModule.codeSnippet.explanation}
                  </p>
                </div>
              )}

              {/* COMPARATIVE TECHNOLOGY EVALUATION TABLE (Module 4) */}
              {currentModule.toolsComparison && currentModule.toolsComparison.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>Comparative Technology Evaluation Matrix</span>
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-secondary/70 border-b border-border text-foreground font-bold">
                        <tr>
                          <th className="p-3 sm:p-3.5">Evaluation Criteria</th>
                          <th className="p-3 sm:p-3.5">Standard Tool (A)</th>
                          <th className="p-3 sm:p-3.5">Alternative Tool (B)</th>
                          <th className="p-3 sm:p-3.5">CampusCorp Placement Guidance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {currentModule.toolsComparison.map((row, idx) => (
                          <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-3 sm:p-3.5 font-bold text-foreground">{row.criteria}</td>
                            <td className="p-3 sm:p-3.5 font-mono text-xs text-foreground/90">{row.toolA}</td>
                            <td className="p-3 sm:p-3.5 font-mono text-xs text-muted-foreground">{row.toolB}</td>
                            <td className="p-3 sm:p-3.5 text-foreground leading-relaxed">{row.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PROJECTS & PRACTICAL LEARNING (Module 8) */}
              {currentModule.projects && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Production Capstone Projects
                      </h3>
                    </div>

                    {/* Level Tabs */}
                    <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl text-xs font-bold">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setActiveProjectTab(lvl)}
                          className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-all ${
                            activeProjectTab === lvl
                              ? 'bg-foreground text-background shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {lvl} (3)
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {(currentModule.projects[activeProjectTab] || []).map((proj, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2.5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-foreground">
                            {proj.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300">
                            {activeProjectTab}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          <strong className="text-foreground">Objective: </strong>
                          {proj.objectives}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-semibold text-muted-foreground mr-1">Stack:</span>
                          {(proj.technologies || []).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded text-xs font-medium bg-card border border-border text-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                        {proj.expectedOutput && (
                          <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed mt-2">
                            <strong className="text-foreground">Expected Output: </strong>
                            {proj.expectedOutput}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TECHNICAL INTERVIEW PREPARATION (Module 10) */}
              {currentModule.interviews && currentModule.interviews.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Campus Recruitment Interview Questions
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {currentModule.interviews.length} Questions
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentModule.interviews.map((qa, qIdx) => {
                      const isExpanded = expandedInterviewIdx === qIdx;

                      return (
                        <div
                          key={qIdx}
                          className="rounded-2xl border border-border bg-secondary/30 overflow-hidden transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedInterviewIdx(isExpanded ? null : qIdx)}
                            className="w-full text-left p-4 text-sm sm:text-base font-semibold text-foreground flex items-center justify-between gap-3 cursor-pointer hover:bg-secondary/60 transition-colors"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-foreground text-background shrink-0">
                                {qa.level}
                              </span>
                              <span>{qa.question}</span>
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-purple-600' : ''
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 text-sm text-foreground/90 border-t border-border/60 bg-card leading-relaxed space-y-2">
                              <strong className="text-foreground font-bold block">
                                Recommended Model Answer:
                              </strong>
                              <p className="whitespace-pre-line">{qa.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INTERACTIVE SELF-ASSESSMENT QUIZ (Module 11) */}
              {currentModule.assessments && currentModule.assessments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Module Knowledge Self-Assessment
                      </h3>
                    </div>
                    {quizSubmitted && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        Score: {quizScore}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {currentModule.assessments.map((a, qIdx) => {
                      const selectedOpt = selectedAnswers[qIdx];
                      const isCorrect = selectedOpt === a.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/80 space-y-3"
                        >
                          <p className="text-sm sm:text-base font-bold text-foreground">
                            {qIdx + 1}. {a.question}
                          </p>

                          <div className="space-y-2">
                            {a.options.map((opt, optIdx) => {
                              const isThisSelected = selectedOpt === optIdx;
                              let btnClass = 'bg-card border-border hover:bg-secondary text-foreground';

                              if (quizSubmitted) {
                                if (optIdx === a.correctIndex) {
                                  btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                                } else if (isThisSelected && !isCorrect) {
                                  btnClass = 'bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-200';
                                }
                              } else if (isThisSelected) {
                                btnClass = 'bg-foreground text-background border-foreground font-bold shadow-xs';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                                >
                                  <span>
                                    <strong className="mr-2">{String.fromCharCode(65 + optIdx)})</strong>
                                    {opt}
                                  </span>
                                  {quizSubmitted && optIdx === a.correctIndex && (
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                              <strong className="text-foreground">Rationale: </strong>
                              {a.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between pt-2">
                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(selectedAnswers).length < currentModule.assessments.length}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
                        >
                          Submit Assessment & Verify
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedAnswers({});
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-neutral-200 text-foreground cursor-pointer"
                        >
                          Retake Assessment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* LEARNING ROADMAP STAGES (Module 12) */}
              {currentModule.roadmapStages && currentModule.roadmapStages.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <Compass className="w-5 h-5 text-purple-600" />
                    <span>Mastery Milestones & Study Roadmap</span>
                  </h3>

                  <div className="space-y-3">
                    {currentModule.roadmapStages.map((stage, sIdx) => (
                      <div key={sIdx} className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                          {stage.stage}
                        </span>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/90 pl-4 list-disc marker:text-purple-600">
                          {stage.milestones.map((ms, mIdx) => (
                            <li key={mIdx} className="leading-relaxed">
                              {ms}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CURATED OFFICIAL RESOURCES (Module 12) */}
              {currentModule.curatedResources && currentModule.curatedResources.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-purple-600" />
                    <span>Recognized Standards & Official Documentation</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentModule.curatedResources.map((res, rIdx) => (
                      <a
                        key={rIdx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-foreground transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <div className="group-hover:text-purple-600 transition-colors">{res.title}</div>
                          <span className="text-xs text-muted-foreground font-normal">{res.type}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= BOTTOM MODULE NAVIGATION FOOTER ================= */}
              <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  {currentModule.navigation?.prevModule ? (
                    <button
                      type="button"
                      onClick={() => handleSelectModule(currentModule.navigation.prevModule)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous: Module {currentModule.navigation.prevModule}</span>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleCompleted}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-foreground text-background border-foreground'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Module Completed ✓' : 'Mark Completed & Proceed'}</span>
                  </button>

                  {currentModule.navigation?.nextModule && (
                    <button
                      type="button"
                      onClick={() => handleSelectModule(currentModule.navigation.nextModule)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Next: Module {currentModule.navigation.nextModule}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DomainLearningWorkspace;
