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
} from 'lucide-react';
import careerService from '../services/careerService';
import { CompactDomainHeader } from '../components/career/CompactDomainHeader';
import { CompactRoleCard } from '../components/career/CompactRoleCard';
import VisualCareerRoadmapModal from '../components/career/VisualCareerRoadmapModal';

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

  // Fetch Domain Details by Slug
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

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <div className="h-56 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-56 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-56 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not Found State (Graceful 404 for invalid domain slug)
  if (notFound || !domainData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
          <Compass className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Career Domain Not Found
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We couldn't locate a career domain matching <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">"{currentSlug}"</code>.
          </p>
        </div>
        <div>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs"
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
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Toast Notification */}
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

      {/* SECTION 1: Clean Domain Header with Expandable Overview */}
      <CompactDomainHeader
        domain={domain}
        roles={roles}
        stats={stats}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
      />

      {/* SECTION 2: Search, Filter, and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${domain?.name || 'domain'} roles or skills...`}
            className="w-full h-10 pl-10 pr-9 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
          {/* Category / Tag Filter */}
          {availableTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="">All Categories</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 cursor-pointer"
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
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 3: Career Roles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Career Roles in {domain?.name}
          </h2>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Showing {filteredRoles.length} of {roles.length} roles
          </span>
        </div>

        {filteredRoles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <CompactRoleCard
                key={role.id}
                role={role}
                domainSlug={currentSlug}
                onViewRoadmap={(r) => setRoadmapRole(r)}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedRoleIds.includes(role.id)}
                canAddCompare={comparedRoleIds.length < 4}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                No roles match "{searchQuery}"
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Try searching for another skill, job title, or clearing active category filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
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

      {/* ================= COMPACT COMPARISON INDICATOR ================= */}
      {comparedRoleIds.length > 0 && (
        <aside aria-label="Comparison Tray" className="fixed bottom-6 right-6 sm:right-8 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-full px-4 py-2.5 shadow-xl border border-neutral-700/60 dark:border-neutral-200 flex items-center gap-3 text-xs font-semibold backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
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
              className="inline-flex items-center gap-1 font-bold text-xs text-purple-300 dark:text-purple-700 hover:underline cursor-pointer"
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
    </div>
  );
}

export default DomainDetail;
