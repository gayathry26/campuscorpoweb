import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  GitCompare,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';

export function CareerHeader({
  searchQuery,
  onSearchChange,
  comparedRoleIds = [],
  onOpenMyFit,
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
    <div className="space-y-4 pb-2 border-b border-border/80">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground border border-border">
            Career Discovery Dashboard
          </span>
          <span className="text-xs text-muted-foreground">• Explore Domains & Specializations</span>
        </div>

        {/* Top Quick Actions: Compare & My Fit */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCompare}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              comparedRoleIds.length > 0
                ? 'bg-foreground text-background hover:opacity-90'
                : 'bg-card text-foreground border border-border hover:bg-secondary'
            }`}
            title="Open side-by-side career comparison matrix"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Careers</span>
            {comparedRoleIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-background text-foreground">
                {comparedRoleIds.length}
              </span>
            )}
          </button>

          {onOpenMyFit && (
            <button
              type="button"
              onClick={onOpenMyFit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
              title="Inspect your personalized career fit and verified skills"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>My Career Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="max-w-3xl space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span>Discover Your Career Path</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Explore high-growth IT engineering domains, benchmark salary expectations, inspect progressive 6-stage roadmaps, and match your skills directly to placement rubrics.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative w-full lg:w-96 shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search roles, skills, or domains..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-card text-foreground border border-border shadow-xs focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
