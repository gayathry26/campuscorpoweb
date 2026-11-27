import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  X,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  IT_ROLES,
  DOMAIN_CATEGORIES,
} from '../data/itRoles';
import careerService from '../services/careerService';

// Components for Main Domain Discovery Page
import { CareerHeader } from '../components/career/CareerHeader';
import { InteractiveDomainGrid } from '../components/career/InteractiveDomainGrid';

export function Domains() {
  const navigate = useNavigate();

  // 1. Data State (SQL Backend with resilient local fallback)
  const [allRoles, setAllRoles] = useState(IT_ROLES);
  const [domainsList, setDomainsList] = useState([]);
  const [statsData, setStatsData] = useState({
    totalRoles: IT_ROLES.length,
    totalDomains: DOMAIN_CATEGORIES.length - 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Modals & Compare Roles State
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

  // Load SQL Data on Mount
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [domainRes, rolesRes, statsRes] = await Promise.all([
          careerService.getDomains(),
          careerService.getRoles(),
          careerService.getCareerStats(),
        ]);

        if (!isMounted) return;

        if (domainRes?.domains) setDomainsList(domainRes.domains);
        if (rolesRes?.roles && rolesRes.roles.length > 0) {
          setAllRoles(rolesRes.roles);
        }
        if (statsRes?.success && statsRes.data) {
          setStatsData(statsRes.data);
        }
      } catch (err) {
        console.warn('Error loading domain data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Compare Roles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('campuscorp_compare_roles', JSON.stringify(comparedRoleIds));
    } catch (e) {}
  }, [comparedRoleIds]);

  const handleGoToCompare = () => {
    const param = comparedRoleIds.join(',');
    navigate(`/compare${param ? `?roles=${param}` : ''}`);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* SECTION 1: Clean Domain Discovery Header */}
      <CareerHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        comparedRoleIds={comparedRoleIds}
        stats={statsData}
      />

      {/* SECTION: Complete IT Domain Knowledge Hub Banner */}
      <div className="bg-gradient-to-r from-purple-900/10 via-purple-700/5 to-transparent dark:from-purple-950/40 dark:via-purple-900/20 border border-purple-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                New Learning Library
              </span>
              <span className="text-xs text-muted-foreground font-medium">38 Domains • 456 Learning Modules</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Complete IT Domain Knowledge Hub & Academic Study Notes
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Access deep, structured technical educational notes, architecture blueprints, executable code labs, capstones, and official PDF downloads for every domain.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/career-explorer/knowledge-hub')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <span>Open Knowledge Hub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 2: Minimalist Domain Cards Grid with Filters */}
      <InteractiveDomainGrid
        domains={domainsList}
        allRoles={allRoles}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
        totalRolesCount={allRoles.length}
      />

      {/* ================= COMPACT COMPARISON INDICATOR ================= */}
      {comparedRoleIds.length > 0 && (
        <aside aria-label="Comparison Tray" className="fixed bottom-6 right-6 sm:right-8 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-full px-4 py-2.5 shadow-xl border border-neutral-700/60 dark:border-neutral-200 flex items-center gap-3 text-sm font-semibold backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
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
              className="inline-flex items-center gap-1 font-bold text-sm text-purple-300 dark:text-purple-700 hover:underline cursor-pointer"
            >
              <span>Compare</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setComparedRoleIds([])}
              className="p-0.5 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
              title="Clear comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

export default Domains;
