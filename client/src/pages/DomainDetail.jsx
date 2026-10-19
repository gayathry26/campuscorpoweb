import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  ArrowRight,
  GitCompare,
  Sparkles,
  Briefcase,
  Search,
  RotateCcw,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import careerService from '../services/careerService';
import { CompactDomainHeader } from '../components/career/CompactDomainHeader';
import { CompactRoleCard } from '../components/career/CompactRoleCard';
import { CompactSalaryRangeChart } from '../components/career/CompactSalaryRangeChart';
import { DomainSkillInsights } from '../components/career/DomainSkillInsights';
import { DomainNextSteps } from '../components/career/DomainNextSteps';
import { SingleRoleShowcase } from '../components/career/SingleRoleShowcase';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';
import PersonalizedCareerFitModal from '../components/career/PersonalizedCareerFitModal';
import { ROLE_TAGS } from '../data/itRoles';

export function DomainDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1. Data States
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  // 2. Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('alphabetical-asc');

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
    setSelectedTags([]);

    careerService
      .getDomainBySlug(slug)
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
  }, [slug]);

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

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter & Sort Roles for this domain
  const filteredRoles = useMemo(() => {
    if (!domainData?.roles) return [];
    let list = domainData.roles.filter((role) => {
      // Tag filter
      if (selectedTags.length > 0) {
        const roleTagsLower = (role.tags || []).map((t) => t.toLowerCase());
        const matches = selectedTags.some((tag) =>
          roleTagsLower.includes(tag.toLowerCase())
        );
        if (!matches) return false;
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
  }, [domainData, searchQuery, selectedTags, sortBy]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-6 w-48 bg-secondary rounded-lg" />
        <div className="h-24 bg-secondary rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-secondary rounded-xl" />
          <div className="h-44 bg-secondary rounded-xl" />
        </div>
        <div className="h-32 bg-secondary rounded-xl" />
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
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedTags.length > 0;
  const topRole = roles.length > 0 ? roles[0] : null;

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

      {/* ================= SECTION 1: COMPACT DOMAIN HEADER ================= */}
      {/* Contains breadcrumb, title, description, and at most 2-3 inline metrics */}
      <CompactDomainHeader
        domain={domain}
        roles={roles}
        stats={stats}
        comparedRoleIds={comparedRoleIds}
        onCheckFit={(r) => setFitModalRole(r)}
      />

      {/* ADAPTIVE DOMAIN ARCHITECTURE */}
      {roles.length === 1 ? (
        /* ================= CASE A: SINGLE ROLE DOMAIN ================= */
        /* Eliminates empty charts and gives prominent single-role focus, roadmap, and skills */
        <div className="space-y-6">
          <SingleRoleShowcase
            role={roles[0]}
            onCheckFit={(r) => setFitModalRole(r)}
            onToggleCompare={handleToggleCompare}
            isCompared={comparedRoleIds.includes(roles[0].id)}
            canAddCompare={comparedRoleIds.length < 4}
            onViewRoadmapModal={(r) => setRoadmapRole(r)}
          />

          {/* Actionable Next Steps */}
          <DomainNextSteps
            topRole={roles[0]}
            onCheckFit={(r) => setFitModalRole(r)}
            onViewRoadmap={(r) => setRoadmapRole(r)}
          />
        </div>
      ) : roles.length >= 2 ? (
        /* ================= CASE B & C: MULTI-ROLE DOMAINS ================= */
        <div className="space-y-6">
          {/* Search, Tag Filter, and Sort Toolbar */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${domain.name} roles or skills...`}
                  className="w-full pl-9 pr-8 py-2 rounded-lg text-xs sm:text-sm bg-secondary text-foreground border border-border/80 focus:outline-hidden focus:ring-1 focus:ring-ring transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Counter, Reset & Sort */}
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-xs font-bold text-muted-foreground">
                  {filteredRoles.length} of {roles.length} Roles
                </span>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground border border-border/80 focus:outline-hidden cursor-pointer shadow-2xs"
                >
                  <option value="alphabetical-asc">Title (A → Z)</option>
                  <option value="alphabetical-desc">Title (Z → A)</option>
                  <option value="salary-desc">Salary (Highest First)</option>
                  <option value="salary-asc">Salary (Lowest First)</option>
                  <option value="skills-desc">Most Skills Required</option>
                </select>
              </div>
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Focus:
              </span>
              {ROLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-foreground text-background shadow-2xs'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= SECTION 2: CAREER ROLE CARDS (PRIMARY CONTENT) ================= */}
          {/* Displayed BEFORE any charts so students explore roles immediately */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-foreground" />
                <span>Career Roles in {domain.name}</span>
              </h2>
              <span className="text-xs text-muted-foreground">
                Showing {filteredRoles.length} roles
              </span>
            </div>

            {filteredRoles.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  roles.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : roles.length === 3
                    ? 'grid-cols-1 md:grid-cols-3'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
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
                  No roles match "{searchQuery}" in {domain.name}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search terms or clearing your role focus tags.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] rounded-lg hover:opacity-90 mt-1 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ================= SECTION 3: COMPACT SALARY COMPARISON ================= */}
          {/* Floating range bar strictly sized to role count, rendered only when useful */}
          <CompactSalaryRangeChart roles={roles} domainName={domain.name} />

          {/* ================= SECTION 4: SKILLS & COMPETENCY INSIGHTS ================= */}
          {/* Uses real database mappings to contrast shared vs role-specific skills */}
          <DomainSkillInsights roles={roles} domainName={domain.name} />

          {/* ================= SECTION 5: ROADMAP & CAREER-FIT ACTIONS ================= */}
          <DomainNextSteps
            topRole={topRole}
            onCheckFit={(r) => setFitModalRole(r)}
            onViewRoadmap={(r) => setRoadmapRole(r)}
          />
        </div>
      ) : (
        /* Empty state for 0 roles */
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h4 className="text-base font-bold text-foreground">
            No Career Roles Catalogued Yet in {domain.name}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            This technology domain is currently being mapped into our institutional placement curriculum.
          </p>
        </div>
      )}

      {/* SECTION F: Visual Career Roadmap Modal */}
      <VisualCareerRoadmapModal
        role={roadmapRole}
        isOpen={Boolean(roadmapRole)}
        onClose={() => setRoadmapRole(null)}
      />

      {/* SECTION G: Personalized Career Fit Modal */}
      <PersonalizedCareerFitModal
        role={fitModalRole}
        isOpen={Boolean(fitModalRole)}
        onClose={() => setFitModalRole(null)}
      />

      {/* Floating Compare Tray */}
      {comparedRoleIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-foreground text-background rounded-2xl p-3 shadow-2xl border border-background/20 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5 pl-1 truncate">
              <span className="w-5 h-5 rounded-md bg-background text-foreground flex items-center justify-center text-xs font-black shrink-0">
                {comparedRoleIds.length}
              </span>
              <div className="truncate">
                <p className="text-xs font-bold leading-tight truncate">
                  {comparedRoleIds.length === 1
                    ? '1 role selected for comparison'
                    : `${comparedRoleIds.length} roles selected for comparison`}
                </p>
                <p className="text-[10px] opacity-75 truncate">
                  Compare across salary, skills & responsibilities
                </p>
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
    </div>
  );
}

export default DomainDetail;
