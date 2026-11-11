import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  X,
} from 'lucide-react';
import {
  IT_ROLES,
  DOMAIN_CATEGORIES,
} from '../data/itRoles';
import careerService from '../services/careerService';

// Components for Main Domain Discovery Page
import { CareerHeader } from '../components/career/CareerHeader';
import { InteractiveDomainGrid } from '../components/career/InteractiveDomainGrid';
import PersonalizedCareerFitModal from '../components/career/PersonalizedCareerFitModal';

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
  const [fitModalRole, setFitModalRole] = useState(null);
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

  const handleOpenMyFitDefault = () => {
    if (allRoles.length > 0) {
      setFitModalRole(allRoles[0]);
    }
  };

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
        onOpenMyFit={handleOpenMyFitDefault}
        stats={statsData}
      />

      {/* SECTION 2: Minimalist Domain Cards Grid with Filters */}
      <InteractiveDomainGrid
        domains={domainsList}
        allRoles={allRoles}
        searchQuery={searchQuery}
        totalRolesCount={allRoles.length}
      />

      {/* Personalized Career Fit Modal */}
      <PersonalizedCareerFitModal
        role={fitModalRole}
        isOpen={Boolean(fitModalRole)}
        onClose={() => setFitModalRole(null)}
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

export default Domains;
