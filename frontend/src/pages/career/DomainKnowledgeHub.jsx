import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Bookmark,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  Compass,
  ChevronRight,
  Code2,
  Award,
  ExternalLink,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { DOMAIN_ICONS } from '../../components/career/InteractiveDomainGrid';

export function DomainKnowledgeHub() {
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in-progress' | 'completed' | 'bookmarked'
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await domainKnowledgeService.getDomains();
        if (!isMounted) return;

        setDomains(data.domains || []);
        setCategories(data.categories || []);

        const bData = await domainKnowledgeService.getBookmarks();
        if (bData && bData.bookmarks) {
          setBookmarkedIds([...new Set(bData.bookmarks.map((b) => b.domainId))]);
        }
      } catch (err) {
        console.error('Error loading Domain Knowledge Hub data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesDesc = (d.shortDescription || '').toLowerCase().includes(q);
        const matchesTech = (d.technologies || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTech) return false;
      }

      // 2. Family filter
      if (selectedFamily !== 'All Families') {
        if (d.family.toLowerCase() !== selectedFamily.toLowerCase()) return false;
      }

      // 3. Status tab filter
      if (activeTab === 'in-progress') {
        if (!d.completedModules || d.completedModules === 0 || d.isCompleted) return false;
      } else if (activeTab === 'completed') {
        if (!d.isCompleted) return false;
      } else if (activeTab === 'bookmarked') {
        if (!bookmarkedIds.includes(d.id)) return false;
      }

      return true;
    });
  }, [domains, searchQuery, selectedFamily, activeTab, bookmarkedIds]);

  // Overall platform statistics
  const stats = useMemo(() => {
    const totalDomainsCount = domains.length;
    const completedDomains = domains.filter((d) => d.isCompleted).length;
    const totalModulesDone = domains.reduce((acc, d) => acc + (d.completedModules || 0), 0);
    return {
      totalDomainsCount,
      completedDomains,
      totalModulesDone,
      totalModulesAvailable: totalDomainsCount * 12
    };
  }, [domains]);

  const handleDownloadHandbook = async () => {
    const handbookData = await domainKnowledgeService.getHandbook();
    domainKnowledgeService.exportPrintableDocument({
      isHandbook: true,
      allDomains: domains
    });
  };

  const handleDownloadDomainPdf = async (domain, e) => {
    e.stopPropagation();
    const fullSyllabus = await domainKnowledgeService.getFullSyllabus(domain.id);
    if (fullSyllabus) {
      domainKnowledgeService.exportPrintableDocument({
        domain: fullSyllabus,
        moduleData: null
      });
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in-50 duration-200">
      {/* 1. HERO HEADER */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs sm:text-sm font-bold">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>CampusCorp Domain Knowledge Hub</span>
              <span className="text-muted-foreground">• Academic Library 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
              Complete IT Domain Knowledge Hub
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore exhaustive, university-grade educational notes for all 38 IT Career Domains. Master core architectures, step-by-step code labs, production capstones, interview question banks, and download complete academic PDF notes.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <strong>38</strong> IT Career Domains
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <strong>456</strong> Structured Modules
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                <strong>340+</strong> Practical Projects
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                Downloadable Academic PDFs
              </span>
            </div>
          </div>

          {/* Action Callout: Complete 38-Domain Handbook */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              type="button"
              onClick={handleDownloadHandbook}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-foreground text-background hover:opacity-90 shadow-md transition-all cursor-pointer group active:scale-[0.98]"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Complete 38-Domain Handbook (PDF)</span>
            </button>
            <Link
              to="/domains"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-colors text-center"
            >
              <span>Switch to Career Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by domain, technology (e.g. React, Kubernetes, Solidity), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Family Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-card border border-border text-xs sm:text-sm font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs cursor-pointer"
            >
              {categories.map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-secondary/70 border border-border/80">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All 38 Domains ({domains.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('in-progress')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'in-progress'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed ({stats.completedDomains})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'bookmarked'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bookmarked ({bookmarkedIds.length})
            </button>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Showing <strong className="text-foreground">{filteredDomains.length}</strong> of {domains.length} domains
          </div>
        </div>
      </div>

      {/* 3. DOMAIN CARDS GRID */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm font-semibold text-foreground">Loading Knowledge Hub technical library...</p>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="py-20 text-center bg-card border border-border rounded-3xl p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No matching domains found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try adjusting your search keywords or switching the family filter back to "All Families".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedFamily('All Families');
              setActiveTab('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-neutral-200 text-foreground cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDomains.map((domain) => {
            const IconComponent = DOMAIN_ICONS[domain.name] || Layers;
            const isBookmarked = bookmarkedIds.includes(domain.id);

            return (
              <div
                key={domain.id}
                onClick={() => navigate(`/career-explorer/knowledge-hub/${domain.id}`)}
                className="group bg-card text-card-foreground border border-border hover:border-purple-500/50 dark:hover:border-purple-500/50 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 cursor-pointer"
              >
                {/* Top Bar: Icon, Family & Bookmark */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-foreground border border-border">
                        {domain.family}
                      </span>
                    </div>
                  </div>

                  {/* Domain Title & Description */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {domain.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed font-normal">
                      {domain.shortDescription}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {domain.completedModules > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Learning Progress</span>
                        <span>{domain.completedModules} of 12 Modules ({domain.progressPercentage}%)</span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${domain.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Technology Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      Core Technology Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(domain.technologies || []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                      {(domain.technologies || []).length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold text-muted-foreground bg-secondary/50">
                          +{domain.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Meta & Actions */}
                <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      12 Modules
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{domain.estimatedLearningHours || 15} hrs
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct PDF Download button */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadDomainPdf(domain, e)}
                      title="Download Complete Domain Notes (PDF)"
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/career-explorer/knowledge-hub/${domain.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-purple-600 dark:text-purple-400 group-hover:underline"
                    >
                      <span>Study Notes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DomainKnowledgeHub;
