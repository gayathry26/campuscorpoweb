import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  GitCompare,
  Sparkles,
  Layers,
  Briefcase,
  DollarSign,
  Cpu,
} from 'lucide-react';
import { DOMAIN_ICONS } from './InteractiveDomainGrid';

export function CompactDomainHeader({
  domain,
  roles = [],
  stats = {},
  comparedRoleIds = [],
  onCheckFit,
}) {
  const DomainIcon = DOMAIN_ICONS[domain?.name] || Layers;

  // Extract real salary range if available
  let minLpa = stats?.minLpa;
  let maxLpa = stats?.maxLpa;
  if ((!minLpa || !maxLpa) && roles.length > 0) {
    let min = Infinity;
    let max = 0;
    roles.forEach((r) => {
      const s = r.stats || {};
      if (typeof s.minLpa === 'number' && s.minLpa < min) min = s.minLpa;
      if (typeof s.maxLpa === 'number' && s.maxLpa > max) max = s.maxLpa;
    });
    if (min !== Infinity) minLpa = min;
    if (max > 0) maxLpa = max;
  }

  // Count documented unique skills from real database records
  const uniqueSkills = new Set();
  roles.forEach((r) => {
    (r.technicalSkills || []).forEach((s) => uniqueSkills.add(s));
  });
  const skillsCount = stats?.topSkills?.length || uniqueSkills.size;

  const compareUrl = `/compare${comparedRoleIds.length > 0 ? `?roles=${comparedRoleIds.join(',')}` : ''}`;

  return (
    <div className="space-y-3 pt-1">
      {/* Top Bar: Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Link to="/domains" className="hover:text-foreground transition-colors">
            Career Explorer
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/domains" className="hover:text-foreground transition-colors">
            Explore Domains
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-bold">{domain?.name}</span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/domains"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-border/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Domains</span>
          </Link>

          <Link
            to={compareUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-colors shadow-2xs"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
            {comparedRoleIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-foreground text-background">
                {comparedRoleIds.length}
              </span>
            )}
          </Link>

          {roles.length > 0 && onCheckFit && (
            <button
              type="button"
              onClick={() => onCheckFit(roles[0])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check My Fit</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Domain Banner & Inline Metrics */}
      <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-xs">
            <DomainIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                Career Track
              </span>
              <span className="text-xs font-bold text-foreground">
                {domain?.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {domain?.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed line-clamp-2">
              {domain?.description || 'Explore specialized roles, salary benchmarks, and core skills in this domain.'}
            </p>
          </div>
        </div>

        {/* 2 to 3 Compact, High-Relevance Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
          {/* Metric 1: Roles Count */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border/80 text-xs font-bold text-foreground">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{roles.length} {roles.length === 1 ? 'Career Role' : 'Career Roles'}</span>
          </div>

          {/* Metric 2: Salary Spread (Only when valid data exists) */}
          {minLpa && maxLpa ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>₹{minLpa} - ₹{maxLpa} LPA</span>
            </div>
          ) : null}

          {/* Metric 3: Documented Skills */}
          {skillsCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border/80 text-xs font-bold text-foreground">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{skillsCount} Skills Documented</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompactDomainHeader;
