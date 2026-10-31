import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  ArrowRight,
  Briefcase,
  Search,
  RotateCcw,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import careerService from '../services/careerService';
import { CompactDomainHeader } from '../components/career/CompactDomainHeader';
import { CompactRoleCard } from '../components/career/CompactRoleCard';
import { CompactSalaryRangeChart } from '../components/career/CompactSalaryRangeChart';
import { DomainSkillInsights } from '../components/career/DomainSkillInsights';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';
import PersonalizedCareerFitModal from '../components/career/PersonalizedCareerFitModal';

export function DomainDetail() {
  const { slug, domainSlug } = useParams();
  const currentSlug = slug || domainSlug;
  const navigate = useNavigate();

  // 1. Data States
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  // 2. Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical-asc');
  const [showDetails, setShowDetails] = useState(false);

  // 3. Modals State
  const [roadmapRole, setRoadmapRole] = useState(null);
  const [fitModalRole, setFitModalRole] = useState(null);

  // 4. Compare Roles State (Synced with localStorage)
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

  // Fetch Domain Details by Slug on Mount or URL Change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);
    setError(null);
    setSearchQuery('');
    setSelectedTag('');

    careerService
      .getDomainBySlug(currentSlug)
      .then((res) => {
        if (!isMounted) return;
        if (!res || res.notFound) {
          setNotFound(true);
        } else {
          setDomainData(res);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load domain information.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

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

  // Compare Toggles
  const handleToggleCompare = (role) => {
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
          message: 'Comparison limit reached (max 4 roles)',
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

  // Distinct available tags for this domain's roles
  const availableTags = useMemo(() => {
    if (!domainData?.roles) return [];
    const tags = new Set();
    domainData.roles.forEach((r) => {
      (r.tags || []).forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [domainData]);

  // Filter & Sort Roles for this domain
  const filteredRoles = useMemo(() => {
    if (!domainData?.roles) return [];
    let list = domainData.roles.filter((role) => {
      // Category / Tag filter
      if (selectedTag) {
        const roleTagsLower = (role.tags || []).map((t) => t.toLowerCase());
        if (!roleTagsLower.includes(selectedTag.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (role.title || '').toLowerCase().includes(q);
        const descMatch = (role.shortDescription || '').toLowerCase().includes(q);
        const skillsMatch = (role.technicalSkills || []).some((s) =>
          s.toLowerCase().includes(q)
        );
        const toolsMatch = (role.tools || []).some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!titleMatch && !descMatch && !skillsMatch && !toolsMatch) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'alphabetical-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'alphabetical-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'salary-desc') return (b.stats?.maxLpa || 0) - (a.stats?.maxLpa || 0);
      if (sortBy === 'salary-asc') return (a.stats?.minLpa || 999) - (b.stats?.minLpa || 999);
      if (sortBy === 'skills-desc') {
        return (b.technicalSkills || []).length - (a.technicalSkills || []).length;
      }
      return 0;
    });

    return list;
  }, [domainData, searchQuery, selectedTag, sortBy]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-6 w-48 bg-secondary rounded-lg" />
        <div className="h-24 bg-secondary rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-44 bg-secondary rounded-xl" />
          <div className="h-44 bg-secondary rounded-xl" />
          <div className="h-44 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  // Not Found State (Graceful 404 for invalid domain slug)
  if (notFound || !domainData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Career Domain Not Found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn't find a career domain matching <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">"{slug}"</code>.
          </p>
        </div>
        <div>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] hover:opacity-90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Domains</span>
          </Link>
        </div>
      </div>
    );
  }

  const { domain, roles, stats } = domainData;
  const hasActiveFilters = searchQuery.trim().length > 0 || Boolean(selectedTag);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* ================= COMPACT DOMAIN HEADER ================= */}
      <CompactDomainHeader
        domain={domain}
        roles={roles}
        stats={stats}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
      />

      {/* ================= COLLAPSIBLE DOMAIN DETAILS & INSIGHTS ================= */}
      {showDetails && (
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                <Briefcase className="w-4 h-4 text-primary" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  What Professionals in {domain.name} Do
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                {domain.overview || domain.description || domain.shortDescription}
              </p>
              {Array.isArray(domain.whatProfessionalsDo) && domain.whatProfessionalsDo.length > 0 && (
                <div className="space-y-2 pt-1">
                  {domain.whatProfessionalsDo.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed"
                    >
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Beginner Learning Prerequisites */}
              {Array.isArray(domain.prerequisites) && domain.prerequisites.length > 0 && (
                <div className="bg-secondary/30 border border-border/70 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Beginner Prerequisites
                    </h3>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {domain.prerequisites.map((prereq, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
                        <span>{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Progression */}
              {domain.careerProgression && (
                <div className="bg-secondary/30 border border-border/70 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/60">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Career Progression Track
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-foreground">
                    {domain.careerProgression.split('->').map((step, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className="px-2.5 py-1 rounded-md bg-card border border-border shadow-2xs font-bold text-[11px]">
                          {step.trim()}
                        </span>
                        {idx < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salary Chart & Skill Insights */}
          <CompactSalaryRangeChart roles={roles} domainName={domain.name} />
          <DomainSkillInsights roles={roles} domainName={domain.name} />
        </div>
      )}

      {/* ================= SEARCH, FILTER, AND SORT TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${domain.name} roles or skills...`}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-card text-foreground border border-border/80 focus:outline-hidden focus:ring-1 focus:ring-purple-500/50 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter, Sort & Count */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          {/* Category / Tag Filter Dropdown */}
          {availableTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-card text-foreground border border-border/80 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <option value="">All Categories</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-card text-foreground border border-border/80 focus:outline-hidden cursor-pointer shadow-2xs"
          >
            <option value="alphabetical-asc">Title (A → Z)</option>
            <option value="alphabetical-desc">Title (Z → A)</option>
            <option value="salary-desc">Salary (Highest First)</option>
            <option value="salary-asc">Salary (Lowest First)</option>
            <option value="skills-desc">Most Skills Required</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= CAREER ROLES GRID ================= */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            Career Roles ({filteredRoles.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Showing {filteredRoles.length} of {roles.length} roles
          </span>
        </div>

        {filteredRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <CompactRoleCard
                key={role.id}
                role={role}
                domainSlug={slug}
                onViewRoadmap={(r) => setRoadmapRole(r)}
                onCheckFit={(r) => setFitModalRole(r)}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedRoleIds.includes(role.id)}
                canAddCompare={comparedRoleIds.length < 4}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card space-y-2">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-foreground">
              No roles match "{searchQuery}"
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search terms or clearing category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('');
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] rounded-lg hover:opacity-90 mt-1 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Visual Career Roadmap Modal */}
      <VisualCareerRoadmapModal
        role={roadmapRole}
        isOpen={Boolean(roadmapRole)}
        onClose={() => setRoadmapRole(null)}
      />

      {/* Personalized Career Fit Modal */}
      <PersonalizedCareerFitModal
        role={fitModalRole}
        isOpen={Boolean(fitModalRole)}
        onClose={() => setFitModalRole(null)}
      />

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
    </div>
  );
}

export default DomainDetail;
