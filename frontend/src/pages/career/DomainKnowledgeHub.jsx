import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Download,
  Clock,
  Layers,
  ArrowRight,
  Compass,
  FolderGit2,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';
import domainKnowledgeService from '../../services/domainKnowledgeService';
import { DOMAIN_ICONS } from '../../components/career/InteractiveDomainGrid';
import { KpiCard } from '../../components/common/SaasCards';

export function DomainKnowledgeHub() {
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [activeTab, setActiveTab] = useState('all');
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

  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesDesc = (d.shortDescription || '').toLowerCase().includes(q);
        const matchesTech = (d.technologies || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTech) return false;
      }
      if (selectedFamily !== 'All Families') {
        if ((d.family || '').toLowerCase() !== selectedFamily.toLowerCase()) return false;
      }
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

  const stats = useMemo(() => {
    const totalDomainsCount = domains.length;
    const completedDomains = domains.filter((d) => d.isCompleted).length;
    const totalModulesDone = domains.reduce((acc, d) => acc + (d.completedModules || 0), 0);
    return {
      totalDomainsCount,
      completedDomains,
      totalModulesDone,
      totalModulesAvailable: totalDomainsCount * 12,
    };
  }, [domains]);

  const handleDownloadHandbook = async () => {
    await domainKnowledgeService.getHandbook();
    domainKnowledgeService.exportPrintableDocument({
      isHandbook: true,
      allDomains: domains,
    });
  };

  const handleDownloadDomainPdf = async (domain, e) => {
    e.stopPropagation();
    const fullSyllabus = await domainKnowledgeService.getFullSyllabus(domain.id);
    if (fullSyllabus) {
      domainKnowledgeService.exportPrintableDocument({
        domain: fullSyllabus,
        moduleData: null,
      });
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Knowledge Hub & Learning Library
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Showing {filteredDomains.length} of {domains.length} IT domains • {stats.totalModulesAvailable || 456} structured modules
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadHandbook}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Handbook PDF</span>
          </button>
          <Link
            to="/domains"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card hover:bg-[#F8EDF0] text-foreground border border-border transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#8B2942]" />
            <span>Career Explorer</span>
          </Link>
        </div>
      </div>

      {/* Compact 4-Card KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard label="IT Domains" value={stats.totalDomainsCount || 38} subtitle="Complete coverage" icon={Compass} accentTop />
        <KpiCard label="Learning Modules" value={stats.totalModulesAvailable || 456} subtitle="12 modules per domain" icon={Layers} accentTop />
        <KpiCard label="Practical Projects" value="340+" subtitle="Beginner to Advanced" icon={FolderGit2} accentTop />
        <KpiCard label="Completed Modules" value={stats.totalModulesDone} subtitle={`${stats.completedDomains} domains finished`} icon={FileText} accentTop />
      </div>

      {/* Reference Screenshot 3 Style: Search, Category Dropdown & Tab Strip */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search domains, modules, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8B2942] focus:bg-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-xs font-medium text-foreground focus:outline-none focus:border-[#8B2942] cursor-pointer"
          >
            {categories.map((fam) => (
              <option key={fam} value={fam}>
                {fam}
              </option>
            ))}
          </select>
        </div>

        {/* Clean Underline Tabs */}
        <div className="flex items-center gap-4 border-t border-border pt-2.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Domains', count: domains.length },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed', count: stats.completedDomains },
            { id: 'bookmarked', label: 'Bookmarked', count: bookmarkedIds.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 pb-1.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#8B2942] text-[#8B2942] dark:text-[#F2B8C7]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Uniform Course / Domain Cards Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-[#8B2942] animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Loading learning modules...</p>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="py-14 text-center bg-card border border-border rounded-xl p-6 space-y-2.5">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-foreground">No matching domains found</h3>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedFamily('All Families');
              setActiveTab('all');
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#8B2942] text-white hover:bg-[#702038] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((domain) => {
            const IconComponent = DOMAIN_ICONS[domain.name] || Layers;
            const pct = domain.progressPercentage || 0;

            return (
              <div
                key={domain.id}
                onClick={() => navigate(`/career-explorer/knowledge-hub/${domain.id}`)}
                className="group bg-card text-card-foreground border border-border hover:border-[#8B2942]/45 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3.5 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] group-hover:bg-[#8B2942] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground border border-border truncate max-w-[180px]">
                      {domain.family}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-[#8B2942] dark:group-hover:text-[#F2B8C7] transition-colors leading-snug">
                      {domain.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {domain.shortDescription}
                    </p>
                  </div>

                  {/* Uniform Progress Bar (Reference Screenshot 3 Style) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#8B2942]" />
                        12 Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{domain.estimatedLearningHours || 15} hrs
                      </span>
                    </div>
                    <div className="w-full bg-[#F2EFF1] dark:bg-[#262126] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#8B2942] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Progress: {domain.completedModules || 0}/12 modules ({pct}%)
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadDomainPdf(domain, e)}
                    title="Download Domain Notes PDF"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-[#8B2942] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7]">
                    <span>{domain.completedModules > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
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
