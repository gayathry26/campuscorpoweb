import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { DOMAIN_ICONS } from '../../components/career/InteractiveDomainGrid';

export function DomainLearningWorkspace() {
  const { domainSlug, moduleNumber } = useParams();
  const navigate = useNavigate();

  // 1. Data States
  const [domain, setDomain] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModuleNumber, setActiveModuleNumber] = useState(parseInt(moduleNumber || '1', 10));
  const [loading, setLoading] = useState(true);

  // 2. Interactive States per Module
  const [completedMap, setCompletedMap] = useState({});
  const [bookmarksMap, setBookmarksMap] = useState({});
  const [copiedCodeMod, setCopiedCodeMod] = useState(null);
  const [quizStates, setQuizStates] = useState({}); // { [modNum]: { selectedAnswers: {}, submitted: false, score: 0 } }
  const [expandedInterviewMap, setExpandedInterviewMap] = useState({}); // { [modNum]: questionIndex }
  const [projectTabs, setProjectTabs] = useState({}); // { [modNum]: 'beginner' | 'intermediate' | 'advanced' }
  const [topicSearch, setTopicSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 3. Scroll & Element References
  const rightPanelRef = useRef(null);
  const sidebarNavRef = useRef(null);
  const moduleSectionRefs = useRef({});
  const sidebarModuleRefs = useRef({});
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Load domain metadata, 12 modules, and saved local progress
  useEffect(() => {
    let isMounted = true;
    async function loadFullCurriculum() {
      try {
        setLoading(true);
        const fullDomain = await domainKnowledgeService.getFullSyllabus(domainSlug);
        if (!isMounted) return;

        if (fullDomain) {
          setDomain(fullDomain);
          const modList = fullDomain.modules || [];
          setModules(modList);

          // Populate initial completion and bookmark maps from local storage service
          const completedInit = {};
          const bookmarksInit = {};
          const quizInit = {};

          for (const m of modList) {
            const modNum = m.moduleNumber;
            // Get module details to retrieve stored user progress
            const detail = await domainKnowledgeService.getModuleDetails(domainSlug, modNum);
            if (detail?.userState) {
              completedInit[modNum] = Boolean(detail.userState.isCompleted);
              bookmarksInit[modNum] = detail.userState.bookmarks || [];
              if (detail.userState.quizScore > 0) {
                quizInit[modNum] = {
                  selectedAnswers: {},
                  submitted: true,
                  score: detail.userState.quizScore,
                };
              }
            }
          }

          setCompletedMap(completedInit);
          setBookmarksMap(bookmarksInit);
          setQuizStates(quizInit);

          // Synchronize URL moduleNumber parameter
          const reqMod = parseInt(moduleNumber || '1', 10);
          if (reqMod >= 1 && reqMod <= (modList.length || 12)) {
            setActiveModuleNumber(reqMod);
          }
        }
      } catch (err) {
        console.error('Failed to load complete domain knowledge curriculum:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFullCurriculum();
    return () => {
      isMounted = false;
    };
  }, [domainSlug, moduleNumber]);

  // Initial scroll to requested module when loaded
  useEffect(() => {
    if (!loading && modules.length > 0) {
      const initialMod = parseInt(moduleNumber || '1', 10);
      if (initialMod > 1) {
        setTimeout(() => {
          const target = moduleSectionRefs.current[initialMod];
          if (target && rightPanelRef.current) {
            isProgrammaticScrollRef.current = true;
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          }
        }, 150);
      }
    }
  }, [loading, modules.length, moduleNumber]);

  // IntersectionObserver: Track active module automatically as student scrolls through right content
  useEffect(() => {
    const container = rightPanelRef.current;
    if (!container || modules.length === 0) return;

    const observerCallback = (entries) => {
      if (isProgrammaticScrollRef.current) return;

      const intersecting = entries.filter((entry) => entry.isIntersecting);
      if (intersecting.length > 0) {
        // Pick the intersecting section closest to the top
        intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const modNumAttr = intersecting[0].target.getAttribute('data-module-number');
        if (modNumAttr) {
          const modNum = parseInt(modNumAttr, 10);
          if (modNum && modNum !== activeModuleNumber) {
            setActiveModuleNumber(modNum);
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: container,
      rootMargin: '-10% 0px -70% 0px',
      threshold: [0, 0.2, 0.5],
    });

    modules.forEach((m) => {
      const el = moduleSectionRefs.current[m.moduleNumber];
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [modules, activeModuleNumber]);

  // Automatic visibility in left navigation: Keep active module button visible
  useEffect(() => {
    const activeBtn = sidebarModuleRefs.current[activeModuleNumber];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeModuleNumber]);

  // Smooth click-to-scroll handler for sidebar module buttons
  const handleScrollToModule = useCallback(
    (modNum) => {
      setActiveModuleNumber(modNum);
      const target = moduleSectionRefs.current[modNum];
      if (target) {
        isProgrammaticScrollRef.current = true;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 850);
      }
    },
    []
  );

  // Toggle Module Completion State
  const handleToggleCompleted = async (modNum) => {
    const currentState = Boolean(completedMap[modNum]);
    const nextState = !currentState;

    setCompletedMap((prev) => ({ ...prev, [modNum]: nextState }));

    const currentModData = modules.find((m) => m.moduleNumber === modNum);
    const score = quizStates[modNum]?.score || 0;

    await domainKnowledgeService.saveProgress(
      domainSlug,
      modNum,
      nextState,
      score,
      currentModData?.title
    );

    // Refresh overall domain progress in header
    const updatedDomain = await domainKnowledgeService.getDomainBySlug(domainSlug);
    if (updatedDomain) setDomain(updatedDomain);
  };

  // Toggle Bookmark for a topic heading
  const handleToggleBookmark = async (modNum, topicHeading) => {
    const currentList = bookmarksMap[modNum] || [];
    const isBookmarked = currentList.includes(topicHeading);

    await domainKnowledgeService.toggleBookmark(domainSlug, modNum, topicHeading);

    setBookmarksMap((prev) => ({
      ...prev,
      [modNum]: isBookmarked
        ? (prev[modNum] || []).filter((h) => h !== topicHeading)
        : [...(prev[modNum] || []), topicHeading],
    }));
  };

  // Copy Code Lab Snippet
  const handleCopyCode = (modNum, codeText) => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopiedCodeMod(modNum);
    setTimeout(() => {
      setCopiedCodeMod(null);
    }, 2000);
  };

  // Interactive Quiz Handlers
  const handleSelectQuizOption = (modNum, qIdx, optIdx) => {
    const modQuiz = quizStates[modNum] || { selectedAnswers: {}, submitted: false, score: 0 };
    if (modQuiz.submitted) return;

    setQuizStates((prev) => ({
      ...prev,
      [modNum]: {
        ...modQuiz,
        selectedAnswers: {
          ...modQuiz.selectedAnswers,
          [qIdx]: optIdx,
        },
      },
    }));
  };

  const handleSubmitQuiz = async (modNum) => {
    const modData = modules.find((m) => m.moduleNumber === modNum);
    if (!modData?.assessments) return;

    const modQuiz = quizStates[modNum] || { selectedAnswers: {}, submitted: false, score: 0 };
    let correctCount = 0;

    modData.assessments.forEach((q, idx) => {
      if (modQuiz.selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / modData.assessments.length) * 100);

    setQuizStates((prev) => ({
      ...prev,
      [modNum]: {
        ...modQuiz,
        submitted: true,
        score: percentage,
      },
    }));

    // Auto mark module completed if score >= 80%
    if (percentage >= 80 && !completedMap[modNum]) {
      setCompletedMap((prev) => ({ ...prev, [modNum]: true }));
      await domainKnowledgeService.saveProgress(domainSlug, modNum, true, percentage);
      const updatedDomain = await domainKnowledgeService.getDomainBySlug(domainSlug);
      if (updatedDomain) setDomain(updatedDomain);
    } else {
      await domainKnowledgeService.saveProgress(
        domainSlug,
        modNum,
        Boolean(completedMap[modNum]),
        percentage
      );
    }
  };

  const handleRetakeQuiz = (modNum) => {
    setQuizStates((prev) => ({
      ...prev,
      [modNum]: {
        selectedAnswers: {},
        submitted: false,
        score: 0,
      },
    }));
  };

  // PDF Download Handlers
  const handleDownloadFullPdf = async () => {
    if (domain) {
      domainKnowledgeService.exportPrintableDocument({
        domain,
        moduleData: null,
      });
    }
  };

  const handleDownloadModulePdf = (modNum) => {
    const modData = modules.find((m) => m.moduleNumber === modNum);
    if (domain && modData) {
      domainKnowledgeService.exportPrintableDocument({
        domain,
        moduleData: modData,
      });
    }
  };

  // Topic Search Index & Smooth Jump with Temporary Highlight
  const searchableTopics = useMemo(() => {
    const list = [];
    modules.forEach((mod) => {
      (mod.sections || []).forEach((sec, sIdx) => {
        list.push({
          moduleNumber: mod.moduleNumber,
          moduleTitle: mod.title,
          heading: sec.heading,
          sectionIdx: sIdx,
          preview: sec.content.slice(0, 140),
        });
      });
    });
    return list;
  }, [modules]);

  const searchResults = useMemo(() => {
    if (!topicSearch.trim()) return [];
    const q = topicSearch.toLowerCase().trim();
    return searchableTopics
      .filter((t) => t.heading.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchableTopics, topicSearch]);

  const handleJumpToTopic = (modNum, secIdx) => {
    setShowSearchResults(false);
    setTopicSearch('');
    handleScrollToModule(modNum);

    setTimeout(() => {
      const topicId = `topic-heading-${modNum}-${secIdx}`;
      const el = document.getElementById(topicId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('topic-highlight-active');
        setTimeout(() => {
          el.classList.remove('topic-highlight-active');
        }, 2500);
      }
    }, 400);
  };

  const activeModuleData = useMemo(() => {
    return modules.find((m) => m.moduleNumber === activeModuleNumber) || modules[0];
  }, [modules, activeModuleNumber]);

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
        <p className="text-sm text-muted-foreground">
          The requested domain notes could not be located in the Knowledge Hub.
        </p>
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
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (modules.length || 12)) * 100);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-200">
      {/* ================= 1. TOP HEADER & BREADCRUMBS ================= */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/career-explorer" className="hover:text-foreground transition-colors">
              Career Explorer
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to="/career-explorer/knowledge-hub"
              className="hover:text-foreground transition-colors font-medium"
            >
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
              <span>
                {completedCount} / {modules.length || 12} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. TWO-COLUMN WORKSPACE: INDEPENDENT SCROLL AREAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch lg:h-[calc(100vh-140px)]">
        {/* ================= LEFT SIDEBAR: 12-MODULE NAVIGATION (INDEPENDENT SCROLL) ================= */}
        <aside className="lg:col-span-4 bg-card text-card-foreground border border-border rounded-3xl p-4 sm:p-5 shadow-xs lg:h-full lg:max-h-full flex flex-col overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                12 Learning Modules
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
              {modules.length || 12} Total
            </span>
          </div>

          {/* Quick Topic Search within Workspace */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search topics across all modules..."
              value={topicSearch}
              onChange={(e) => {
                setTopicSearch(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-secondary/50 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
            {topicSearch && (
              <button
                type="button"
                onClick={() => {
                  setTopicSearch('');
                  setShowSearchResults(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto overscroll-contain knowledge-scroll-area p-1.5 space-y-1">
                {searchResults.map((res, rIdx) => (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => handleJumpToTopic(res.moduleNumber, res.sectionIdx)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-secondary text-xs transition-colors cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase">
                      <span>Module {res.moduleNumber}</span>
                      <span>Jump →</span>
                    </div>
                    <div className="font-bold text-foreground line-clamp-1">{res.heading}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Module List Scroll Area: Independent Smooth Scroll with minimal scrollbar */}
          <nav
            ref={sidebarNavRef}
            className="overflow-y-auto overscroll-contain knowledge-scroll-area space-y-1.5 pr-1 flex-1"
          >
            {modules.map((m) => {
              const isSelected = m.moduleNumber === activeModuleNumber;
              const isDone = Boolean(completedMap[m.moduleNumber]);

              return (
                <button
                  key={m.moduleNumber}
                  ref={(el) => (sidebarModuleRefs.current[m.moduleNumber] = el)}
                  type="button"
                  onClick={() => handleScrollToModule(m.moduleNumber)}
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
                      <span className="text-xs sm:text-sm line-clamp-1">{m.title}</span>
                    </div>
                    <span
                      className={`text-[11px] block mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-background/80' : 'text-muted-foreground'
                      }`}
                    >
                      {m.subtitle || `${m.estimatedMinutes || 20} mins study`}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar Action: Full Handbook & Download */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs shrink-0">
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

        {/* ================= RIGHT READING CANVAS: CONTINUOUS 12-MODULE STREAM (INDEPENDENT SCROLL) ================= */}
        <main
          ref={rightPanelRef}
          className="lg:col-span-8 bg-card text-card-foreground border border-border rounded-3xl shadow-xs lg:h-full lg:max-h-full overflow-y-auto overscroll-contain knowledge-scroll-area relative scroll-smooth p-6 sm:p-9 min-w-0"
        >
          {/* STICKY READING HEADER: Synchronized with Active Scrolling Module */}
          <div className="sticky top-0 z-20 backdrop-blur-md bg-card/95 border-b border-border/80 px-6 py-3.5 -mx-6 sm:-mx-9 -mt-6 sm:-mt-9 mb-8 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                Module {activeModuleNumber} of {modules.length || 12}
              </span>
              <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeModuleData?.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mark Completed Button */}
              <button
                type="button"
                onClick={() => handleToggleCompleted(activeModuleNumber)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs ${
                  completedMap[activeModuleNumber]
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border-border'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${
                    completedMap[activeModuleNumber]
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                />
                <span className="hidden sm:inline">
                  {completedMap[activeModuleNumber] ? 'Completed ✓' : 'Mark Completed'}
                </span>
              </button>

              {/* Module PDF */}
              <button
                type="button"
                onClick={() => handleDownloadModulePdf(activeModuleNumber)}
                title="Download this module as PDF"
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Module PDF</span>
              </button>

              {/* Quick Jump Next */}
              {activeModuleNumber < modules.length && (
                <button
                  type="button"
                  onClick={() => handleScrollToModule(activeModuleNumber + 1)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1"
                  title="Next module"
                >
                  <span className="hidden md:inline">Next Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Continuous Sequence of all 12 Modules */}
          {modules.map((m) => {
            const modNum = m.moduleNumber;
            const isCompleted = Boolean(completedMap[modNum]);
            const bookmarkedTopics = bookmarksMap[modNum] || [];
            const modQuiz = quizStates[modNum] || { selectedAnswers: {}, submitted: false, score: 0 };
            const activeProjectTab = projectTabs[modNum] || 'beginner';
            const expandedInterviewIdx = expandedInterviewMap[modNum] ?? null;

            return (
              <section
                key={modNum}
                id={`module-section-${modNum}`}
                ref={(el) => (moduleSectionRefs.current[modNum] = el)}
                data-module-number={modNum}
                className="scroll-mt-24 border-b border-border/70 pb-12 mb-12 last:border-b-0 last:pb-0 last:mb-0 space-y-8"
              >
                {/* Module Header */}
                <div className="space-y-3 pb-6 border-b border-border/80">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        Module {modNum} of {modules.length || 12}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{m.estimatedMinutes || 25} mins
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(modNum)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border-border'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                          }`}
                        />
                        <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadModulePdf(modNum)}
                        title="Download module PDF"
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                      {m.title}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">
                      {m.subtitle}
                    </p>
                  </div>
                </div>

                {/* Section Notes Content */}
                <div className="space-y-7">
                  {(m.sections || []).map((sec, secIdx) => {
                    const isBookmarked = bookmarkedTopics.includes(sec.heading);
                    const topicElementId = `topic-heading-${modNum}-${secIdx}`;

                    return (
                      <article
                        key={secIdx}
                        id={topicElementId}
                        className="space-y-3 scroll-mt-28 p-3 -m-3 rounded-2xl transition-all"
                      >
                        <div className="flex items-center justify-between gap-3 group">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                            {sec.heading}
                          </h3>

                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(modNum, sec.heading)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-purple-600 transition-colors cursor-pointer"
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${
                                isBookmarked ? 'fill-purple-600 text-purple-600' : ''
                              }`}
                            />
                          </button>
                        </div>

                        <div className="text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3 font-normal">
                          {sec.content.split('\n\n').map((paragraph, pIdx) => {
                            if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                              const bulletItems = paragraph.split('\n').filter((b) => b.trim());
                              return (
                                <ul
                                  key={pIdx}
                                  className="space-y-1.5 pl-4 list-disc marker:text-purple-600"
                                >
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
                {m.codeSnippet && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-600" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Executable Implementation Lab
                        </h3>
                        <span className="text-xs font-mono uppercase bg-secondary px-2 py-0.5 rounded text-foreground font-semibold">
                          {m.codeSnippet.language}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(modNum, m.codeSnippet.code)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors cursor-pointer"
                      >
                        {copiedCodeMod === modNum ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCodeMod === modNum ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>

                    <div className="rounded-2xl bg-neutral-950 text-neutral-100 p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm border border-neutral-800 shadow-inner">
                      <pre className="leading-relaxed whitespace-pre font-mono">
                        <code>{m.codeSnippet.code}</code>
                      </pre>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed p-3.5 rounded-xl bg-secondary/50 border border-border/80">
                      <strong className="text-foreground font-semibold">Technical Walkthrough: </strong>
                      {m.codeSnippet.explanation}
                    </p>
                  </div>
                )}

                {/* COMPARATIVE TECHNOLOGY EVALUATION TABLE (Module 4) */}
                {m.toolsComparison && m.toolsComparison.length > 0 && (
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
                          {m.toolsComparison.map((row, idx) => (
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
                {m.projects && (
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
                            onClick={() =>
                              setProjectTabs((prev) => ({ ...prev, [modNum]: lvl }))
                            }
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
                      {(m.projects[activeProjectTab] || []).map((proj, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2.5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-foreground">{proj.title}</h4>
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300">
                              {activeProjectTab}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            <strong className="text-foreground">Objective: </strong>
                            {proj.objectives}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-xs font-semibold text-muted-foreground mr-1">
                              Stack:
                            </span>
                            {(proj.technologies || []).map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded text-xs font-medium bg-card border border-border text-foreground"
                              >
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
                {m.interviews && m.interviews.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Campus Recruitment Interview Questions
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {m.interviews.length} Questions
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {m.interviews.map((qa, qIdx) => {
                        const isExpanded = expandedInterviewIdx === qIdx;

                        return (
                          <div
                            key={qIdx}
                            className="rounded-2xl border border-border bg-secondary/30 overflow-hidden transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedInterviewMap((prev) => ({
                                  ...prev,
                                  [modNum]: isExpanded ? null : qIdx,
                                }))
                              }
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
                {m.assessments && m.assessments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Module Knowledge Self-Assessment
                        </h3>
                      </div>
                      {modQuiz.submitted && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          Score: {modQuiz.score}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {m.assessments.map((a, qIdx) => {
                        const selectedOpt = modQuiz.selectedAnswers[qIdx];
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

                                if (modQuiz.submitted) {
                                  if (optIdx === a.correctIndex) {
                                    btnClass =
                                      'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                                  } else if (isThisSelected && !isCorrect) {
                                    btnClass =
                                      'bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-200';
                                  }
                                } else if (isThisSelected) {
                                  btnClass =
                                    'bg-foreground text-background border-foreground font-bold shadow-xs';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    disabled={modQuiz.submitted}
                                    onClick={() => handleSelectQuizOption(modNum, qIdx, optIdx)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                                  >
                                    <span>
                                      <strong className="mr-2">
                                        {String.fromCharCode(65 + optIdx)})
                                      </strong>
                                      {opt}
                                    </span>
                                    {modQuiz.submitted && optIdx === a.correctIndex && (
                                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {modQuiz.submitted && (
                              <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                                <strong className="text-foreground">Rationale: </strong>
                                {a.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      <div className="flex items-center justify-between pt-2">
                        {!modQuiz.submitted ? (
                          <button
                            type="button"
                            onClick={() => handleSubmitQuiz(modNum)}
                            disabled={
                              Object.keys(modQuiz.selectedAnswers).length < m.assessments.length
                            }
                            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
                          >
                            Submit Assessment & Verify
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRetakeQuiz(modNum)}
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
                {m.roadmapStages && m.roadmapStages.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <Compass className="w-5 h-5 text-purple-600" />
                      <span>Mastery Milestones & Study Roadmap</span>
                    </h3>

                    <div className="space-y-3">
                      {m.roadmapStages.map((stage, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border space-y-2"
                        >
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
                {m.curatedResources && m.curatedResources.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-purple-600" />
                      <span>Recognized Standards & Official Documentation</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {m.curatedResources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-foreground transition-colors group"
                        >
                          <div className="space-y-0.5">
                            <div className="group-hover:text-purple-600 transition-colors">
                              {res.title}
                            </div>
                            <span className="text-xs text-muted-foreground font-normal">
                              {res.type}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Controls at Bottom of Each Module */}
                <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
                  <div>
                    {modNum > 1 && (
                      <button
                        type="button"
                        onClick={() => handleScrollToModule(modNum - 1)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous: Module {modNum - 1}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(modNum)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-foreground text-background border-foreground'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleted ? 'Module Completed ✓' : 'Mark Completed'}</span>
                    </button>

                    {modNum < modules.length ? (
                      <button
                        type="button"
                        onClick={() => handleScrollToModule(modNum + 1)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Next: Module {modNum + 1}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-secondary hover:bg-neutral-200 text-foreground cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                        <span>Back to Top</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

export default DomainLearningWorkspace;
