import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { DOMAIN_ICONS } from './InteractiveDomainGrid';

export function CompactDomainHeader({
  domain,
  roles = [],
  stats = {},
  showDetails = false,
  onToggleDetails,
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

  const coreTech = domain?.coreTechnologies || [];
  const displayTech = coreTech.slice(0, 6);

  return (
    <div className="space-y-4 pt-1">
      {/* Top Bar: Breadcrumb & Back Button */}
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

        <Link
          to="/domains"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors border border-border/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Domains</span>
        </Link>
      </div>

      {/* Compact Domain Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-xs">
              <DomainIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {domain?.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed line-clamp-2">
                {domain?.shortDescription || domain?.description || 'Explore specialized career roles, salary benchmarks, and core skills in this domain.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Roles Count Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold text-foreground border border-border/70">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{roles.length} {roles.length === 1 ? 'Career Role' : 'Career Roles'}</span>
            </div>

            {/* Verified Salary Spread */}
            {minLpa && maxLpa && minLpa !== Infinity ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>₹{minLpa} - ₹{maxLpa} LPA</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Core Technologies & Collapsible Details Toggle */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          {displayTech.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Core Technologies:
              </span>
              {displayTech.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-foreground/90 border border-border/60"
                >
                  {tech}
                </span>
              ))}
              {coreTech.length > displayTech.length && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  +{coreTech.length - displayTech.length} more
                </span>
              )}
            </div>
          )}

          {onToggleDetails && (
            <button
              type="button"
              onClick={onToggleDetails}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-auto cursor-pointer"
            >
              <span>{showDetails ? 'Hide Domain Overview & Details' : 'Domain Overview & Learning Details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompactDomainHeader;
