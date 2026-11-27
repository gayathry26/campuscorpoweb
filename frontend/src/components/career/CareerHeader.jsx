import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, Search, X } from 'lucide-react';

export function CareerHeader({
  searchQuery,
  onSearchChange,
  comparedRoleIds = [],
  stats = {},
  selectedFamily = 'All Families',
  onFamilyChange,
  families = [],
  sortBy = 'alphabetical-asc',
  onSortChange,
}) {
  const navigate = useNavigate();

  const handleOpenCompare = () => {
    if (comparedRoleIds.length > 0) {
      navigate(`/compare?roles=${comparedRoleIds.join(',')}`);
    } else {
      navigate('/compare');
    }
  };

  return (
    <header className="space-y-4">
      {/* Top Row: Compact Title, Subtitle & Compare Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Career Intelligence
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F8EDF0] text-[#8B2942] dark:bg-[#312128] dark:text-[#F2B8C7] border border-[#8B2942]/20">
              {stats?.totalDomains || 38} Domains
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Explore specialized IT domains, industry roles, salary benchmarks, and skill roadmaps.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCompare}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            comparedRoleIds.length > 0
              ? 'bg-[#8B2942] text-white hover:bg-[#702038]'
              : 'bg-card text-foreground border border-border hover:border-[#8B2942]/40'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare Roles</span>
          {comparedRoleIds.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#8B2942]">
              {comparedRoleIds.length}
            </span>
          )}
        </button>
      </div>

      {/* Reference Screenshot 3 Style: Single Clean White Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search domains by name, role, or technology..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] text-xs sm:text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-[#8B2942] focus:bg-card transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onFamilyChange && families.length > 0 && (
          <select
            value={selectedFamily}
            onChange={(e) => onFamilyChange(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card text-xs font-medium text-foreground border border-border focus:outline-none focus:border-[#8B2942] cursor-pointer"
          >
            <option value="All Families">All Categories</option>
            {families.map((fam) => (
              <option key={fam} value={fam}>
                {fam}
              </option>
            ))}
          </select>
        )}

        {onSortChange && (
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card text-xs font-medium text-foreground border border-border focus:outline-none focus:border-[#8B2942] cursor-pointer"
          >
            <option value="alphabetical-asc">Sort by Name (A–Z)</option>
            <option value="alphabetical-desc">Sort by Name (Z–A)</option>
            <option value="roles-desc">Most Career Roles</option>
          </select>
        )}
      </div>
    </header>
  );
}

export default CareerHeader;
