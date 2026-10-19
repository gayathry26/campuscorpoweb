import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  Compass,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../Badge';

export function CompactRoleCard({
  role,
  domainSlug,
  onViewRoadmap,
  onCheckFit,
  onToggleCompare,
  isCompared = false,
  canAddCompare = true,
}) {
  const {
    id,
    title,
    category,
    tags = [],
    shortDescription,
    technicalSkills = [],
    stats = {},
  } = role;

  const resolvedDomainSlug =
    domainSlug ||
    (category
      ? category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : 'all');

  // Extract real salary string
  const salaryText =
    stats.averageSalary ||
    (stats.minLpa && stats.maxLpa
      ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA`
      : stats.minLpa
      ? `From ₹${stats.minLpa} LPA`
      : null);

  // Take 3 to 5 actual skills
  const keySkills = technicalSkills.slice(0, 5);

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border hover:border-neutral-400 dark:hover:border-neutral-600 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Body */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Meta badges: Domain, tags, salary */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground border border-border/80">
              {category}
            </span>
            {tags.map((t) => (
              <Badge key={t} variant={t.toLowerCase()} size="sm">
                {t}
              </Badge>
            ))}
          </div>

          {salaryText ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{salaryText}</span>
            </div>
          ) : null}
        </div>

        {/* Title and Short Description */}
        <div className="space-y-1">
          <Link
            to={`/domains/${resolvedDomainSlug}/${id}`}
            className="text-base font-bold text-foreground group-hover:text-primary transition-colors inline-block"
          >
            {title}
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {shortDescription || 'Key placement specialization with structured technical benchmarks.'}
          </p>
        </div>

        {/* 3 to 5 Actual Key Skills */}
        {keySkills.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
              <span>Key Competencies:</span>
              <span className="font-mono">{technicalSkills.length} total</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {keySkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-foreground border border-border/60"
                >
                  {skill}
                </span>
              ))}
              {technicalSkills.length > 5 && (
                <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/50">
                  +{technicalSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-4 py-3 bg-secondary/30 border-t border-border flex flex-col gap-2">
        {/* Primary Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Career Details */}
            <Link
              to={`/domains/${resolvedDomainSlug}/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] transition-all cursor-pointer shadow-2xs"
            >
              <span>View Career Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Check My Fit */}
            {onCheckFit && (
              <button
                type="button"
                onClick={() => onCheckFit(role)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer"
                title="Check your personalized curriculum and resume fit for this role"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Check My Fit</span>
              </button>
            )}

            {/* Compare Role */}
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(role)}
                disabled={!isCompared && !canAddCompare}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isCompared
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white'
                    : !canAddCompare
                    ? 'opacity-40 cursor-not-allowed bg-card border-border text-muted-foreground'
                    : 'bg-card text-foreground border-border hover:bg-secondary'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Add role to comparison'}
              >
                {isCompared ? (
                  <>
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>Compare</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Roadmap Shortcut */}
          {onViewRoadmap && (
            <button
              type="button"
              onClick={() => onViewRoadmap(role)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
              title="View Learning Roadmap"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Career Prep Links: Resume Analyzer & Skill Analyzer */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <Link
            to={`/resume-analyzer?targetRole=${encodeURIComponent(id)}`}
            className="hover:text-foreground hover:underline inline-flex items-center gap-1"
          >
            <FileSearch className="w-3 h-3" />
            <span>Scan Resume for Role</span>
          </Link>
          <Link
            to="/skill-analyzer"
            className="hover:text-foreground hover:underline inline-flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Benchmark Skills</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompactRoleCard;
