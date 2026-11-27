import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, BookOpen } from 'lucide-react';
import { IT_ROLES, DOMAIN_CATEGORIES } from '../data/itRoles';
import careerService from '../services/careerService';
import { CareerHeader } from '../components/career/CareerHeader';
import { InteractiveDomainGrid } from '../components/career/InteractiveDomainGrid';

export function Domains() {
  const navigate = useNavigate();

  const [allRoles, setAllRoles] = useState(IT_ROLES);
  const [domainsList, setDomainsList] = useState([]);
  const [statsData, setStatsData] = useState({
    totalRoles: IT_ROLES.length,
    totalDomains: DOMAIN_CATEGORIES.length - 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [sortBy, setSortBy] = useState('alphabetical-asc');

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

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [domainRes, rolesRes, statsRes] = await Promise.all([
          careerService.getDomains(),
          careerService.getRoles(),
          careerService.getCareerStats(),
        ]);
        if (!isMounted) return;
        if (domainRes?.domains) setDomainsList(domainRes.domains);
        if (rolesRes?.roles && rolesRes.roles.length > 0) setAllRoles(rolesRes.roles);
        if (statsRes?.success && statsRes.data) setStatsData(statsRes.data);
      } catch (err) {
        console.warn('Error loading domain data:', err);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('campuscorp_compare_roles', JSON.stringify(comparedRoleIds));
    } catch (e) {}
  }, [comparedRoleIds]);

  const families = useMemo(() => {
    const set = new Set();
    domainsList.forEach((d) => {
      if (d.family) set.add(d.family);
    });
    return Array.from(set).sort();
  }, [domainsList]);

  const handleGoToCompare = () => {
    const param = comparedRoleIds.join(',');
    navigate(`/compare${param ? `?roles=${param}` : ''}`);
  };

  return (
    <div className="space-y-5 pb-12">
      <CareerHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        comparedRoleIds={comparedRoleIds}
        stats={statsData}
        selectedFamily={selectedFamily}
        onFamilyChange={setSelectedFamily}
        families={families}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Compact Knowledge Hub Callout Strip */}
      <div className="bg-card border border-border border-l-4 border-l-[#8B2942] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Domain Knowledge Hub — 456 Structured Learning Modules
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Access academic study notes, architecture blueprints, code labs, projects, and printable PDFs.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/career-explorer/knowledge-hub')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8B2942] text-white hover:bg-[#702038] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
        >
          <span>Open Knowledge Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <InteractiveDomainGrid
        domains={domainsList}
        allRoles={allRoles}
        searchQuery={searchQuery}
        selectedFamily={selectedFamily}
        sortBy={sortBy}
        onClearSearch={() => {
          setSearchQuery('');
          setSelectedFamily('All Families');
        }}
      />

      {/* Floating Comparison Pill */}
      {comparedRoleIds.length > 0 && (
        <aside aria-label="Comparison Tray" className="fixed bottom-5 right-6 z-40">
          <div className="bg-[#29252A] text-white rounded-full px-4 py-2 shadow-xl border border-white/10 flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2942] text-white flex items-center justify-center text-[11px] font-bold">
                {comparedRoleIds.length}
              </span>
              <span>
                {comparedRoleIds.length === 1 ? '1 role' : `${comparedRoleIds.length} roles`} selected
              </span>
            </div>
            <div className="h-3.5 w-px bg-white/20" />
            <button
              type="button"
              onClick={handleGoToCompare}
              className="inline-flex items-center gap-1 font-bold text-[#F2B8C7] hover:underline cursor-pointer"
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setComparedRoleIds([])}
              className="p-0.5 rounded-full opacity-70 hover:opacity-100 cursor-pointer"
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
