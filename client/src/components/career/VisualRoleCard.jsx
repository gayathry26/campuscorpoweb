import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Cpu,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Compass,
  Sparkles,
  BookOpen,
  FolderGit2,
  Award,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../Badge';

export function VisualRoleCard({
  role,
  domainSlug,
  isExpanded = false,
  onToggleExpand,
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
    scope,
    responsibilities = [],
    technicalSkills = [],
    softSkills = [],
    tools = [],
    stats = {},
    projects = {},
    certifications = [],
    topHiringCompanies = [],
  } = role;

  const resolvedDomainSlug =
    domainSlug ||
    (category
      ? category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : 'all');

  const salaryText = stats.averageSalary || (stats.minLpa ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA` : 'Competitive Rate');

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border hover:border-neutral-400 dark:hover:border-neutral-600 shadow-xs transition-all overflow-hidden">
      {/* Primary Card Header / Summary */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Meta Line: Domain Badge, Tags, and Quick Action Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Domain Pill */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-secondary text-foreground border border-border/80">
              {category}
            </span>

            {/* Tags (Coding, Creative, etc.) */}
            {tags.map((t) => (
              <Badge key={t} variant={t.toLowerCase()} size="sm">
                {t}
              </Badge>
            ))}
          </div>

          {/* Salary Range Tag */}
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{salaryText}</span>
          </div>
        </div>

        {/* Title & Short Description */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {shortDescription}
          </p>
        </div>

        {/* Core Competencies Preview Pills */}
        {technicalSkills.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>Required Core Competencies:</span>
              <span className="font-mono text-[10px]">{technicalSkills.length} skills</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {technicalSkills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-foreground border border-border/60"
                >
                  {skill}
                </span>
              ))}
              {technicalSkills.length > 5 && (
                <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/50">
                  +{technicalSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Roadmap Action */}
            <button
              type="button"
              onClick={() => onViewRoadmap(role)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View Roadmap</span>
            </button>

            {/* Check My Fit Action */}
            <button
              type="button"
              onClick={() => onCheckFit(role)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check My Fit</span>
            </button>

            {/* Compare Toggle */}
            <button
              type="button"
              onClick={() => onToggleCompare(role)}
              disabled={!isCompared && !canAddCompare}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isCompared
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white'
                  : !canAddCompare
                  ? 'opacity-40 cursor-not-allowed bg-card border-border text-muted-foreground'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
              title={
                isCompared
                  ? 'Remove from comparison'
                  : !canAddCompare
                  ? 'Compare limit reached (max 4)'
                  : 'Add to compare'
              }
            >
              {isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Compare</span>
                </>
              )}
            </button>
          </div>

          {/* Dedicated Full Specifications Route Navigation */}
          <Link
            to={`/domains/${resolvedDomainSlug}/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 py-1.5 px-3 rounded-xl border border-border/70 hover:border-border transition-all cursor-pointer active:scale-95 group shadow-2xs"
            title={`View full role specifications for ${title}`}
          >
            <span>Full Specifications</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
