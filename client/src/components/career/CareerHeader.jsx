import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  Search,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export function CareerHeader({
  searchQuery,
  onSearchChange,
  comparedRoleIds = [],
  onOpenMyFit,
  stats = {},
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
    <header className="space-y-4 pt-1">
      {/* Top Row: Title, Subtitle, and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Explore IT Career Domains
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
              {stats?.totalDomains || 38} Domains
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Discover technology specializations, explore career pathways, and benchmark required industry skills.
          </p>
        </div>

        {/* Quick Actions: Compare & My Fit */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleOpenCompare}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              comparedRoleIds.length > 0
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
                : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
            }`}
            title="Open side-by-side career comparison matrix"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
            {comparedRoleIds.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-purple-700 dark:bg-purple-950 dark:text-purple-200">
                {comparedRoleIds.length}
              </span>
            )}
          </button>

          {onOpenMyFit && (
            <button
              type="button"
              onClick={onOpenMyFit}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all cursor-pointer shadow-xs"
              title="Inspect your personalized career fit"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>My Career Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Clean Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by domain, career role, technology, or skill (e.g. React, Python, Cloud, Security)..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-sm transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

export default CareerHeader;
