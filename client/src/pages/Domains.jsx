import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  GitCompare,
  Check,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  IT_ROLES,
  DOMAIN_CATEGORIES,
} from '../data/itRoles';
import careerService from '../services/careerService';

// Components for Main Domain Discovery Page
import { CareerHeader } from '../components/career/CareerHeader';
import { CareerMetricsCards } from '../components/career/CareerMetricsCards';
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
    rolesWithSalary: IT_ROLES.length,
    rolesWithSkills: IT_ROLES.length,
    minLpa: 4.5,
    maxLpa: 26.0,
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
        console.warn('Error loading dashboard data:', err);
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
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* SECTION A: Career Explorer Discovery Header */}
      <CareerHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        comparedRoleIds={comparedRoleIds}
        onOpenMyFit={handleOpenMyFitDefault}
      />

      {/* SECTION B: Career Overview Statistics Cards */}
      <CareerMetricsCards stats={statsData} loading={loading} />

      {/* SECTION C: All Career Domain Cards in a Visual Grid (Clicking navigates to /domains/:slug) */}
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

      {/* Floating Compare Tray (when roles are selected in compare queue) */}
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
                  Matrix comparison across responsibilities & skills
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

export default Domains;
