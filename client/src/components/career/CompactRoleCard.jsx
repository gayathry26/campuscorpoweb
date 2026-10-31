import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  MoreVertical,
  GitCompare,
  FileSearch,
  Compass,
  CheckCircle2,
  Check,
  DollarSign,
} from 'lucide-react';

export function CompactRoleCard({
  role,
  domainSlug,
  onViewRoadmap,
  onCheckFit,
  onToggleCompare,
  isCompared = false,
  canAddCompare = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const {
    id,
    title,
    category,
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

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Extract verified salary range only if available
  const salaryText =
    stats.averageSalary ||
    (stats.minLpa && stats.maxLpa
      ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA`
      : stats.minLpa
      ? `From ₹${stats.minLpa} LPA`
      : null);

  // Strictly 3 to 4 important skills
  const keySkills = technicalSkills.slice(0, 3);
  const remainingSkillsCount = technicalSkills.length - keySkills.length;

  return (
    <div className="h-full bg-card text-card-foreground rounded-2xl border border-border/80 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden relative group">
      {/* Top Header & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
        {/* Title, Salary, & Secondary Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <Link
              to={`/domains/${resolvedDomainSlug}/${id}`}
              className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors block leading-tight line-clamp-2 min-h-[2.25rem]"
              title={title}
            >
              {title}
            </Link>
            {salaryText && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{salaryText}</span>
              </span>
            )}
          </div>

          {/* Secondary Actions 3-dots Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-48 bg-card border border-border rounded-xl shadow-lg p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                {onToggleCompare && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleCompare(role);
                      setMenuOpen(false);
                    }}
                    disabled={!isCompared && !canAddCompare}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isCompared
                        ? 'text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10'
                        : !canAddCompare
                        ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    {isCompared ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Remove from Compare</span>
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Add to Compare</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  to={`/resume-analyzer?targetRole=${encodeURIComponent(id)}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-secondary transition-colors"
                >
                  <FileSearch className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Scan Resume for Role</span>
                </Link>

                {onViewRoadmap && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewRoadmap(role);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>View Roadmap</span>
                  </button>
                )}

                <Link
                  to="/skill-analyzer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-foreground hover:bg-secondary transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Benchmark Skills</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 1–2 line description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {shortDescription || 'Key placement specialization with structured technical benchmarks.'}
        </p>

        {/* 3–4 Key Skills */}
        {keySkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-auto">
            {keySkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-foreground/80 border border-border/60"
              >
                {skill}
              </span>
            ))}
            {remainingSkillsCount > 0 && (
              <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/50">
                +{remainingSkillsCount} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary Actions Footer: Only View Details and Check My Fit */}
      <div className="px-4 py-3 bg-secondary/20 border-t border-border flex items-center gap-2">
        <Link
          to={`/domains/${resolvedDomainSlug}/${id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] transition-all cursor-pointer shadow-2xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onCheckFit && (
          <button
            type="button"
            onClick={() => onCheckFit(role)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
            title="Check your suitability for this role"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check My Fit</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default CompactRoleCard;
