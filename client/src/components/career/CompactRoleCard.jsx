import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  GitCompare,
  Check,
} from 'lucide-react';

export function CompactRoleCard({
  role,
  domainSlug,
  onCheckFit,
  onToggleCompare,
  isCompared = false,
  canAddCompare = true,
}) {
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

  // Extract clean salary range
  const salaryText =
    stats.averageSalary ||
    (stats.minLpa && stats.maxLpa
      ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA`
      : stats.minLpa
      ? `From ₹${stats.minLpa} LPA`
      : null);

  // Exactly 3 to 4 core skills
  const displaySkills = technicalSkills.slice(0, 4);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 hover:border-purple-500/40 dark:hover:border-purple-500/40 p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all duration-200">
        {/* Top Header: Title, Salary, and Compare Toggle */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Link
                to={`/domains/${resolvedDomainSlug}/${id}`}
                className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors block leading-snug line-clamp-2"
                title={title}
              >
                {title}
              </Link>

              {salaryText && (
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                  <span>{salaryText}</span>
                </div>
              )}
            </div>

            {/* Compare Toggle Pill */}
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(role)}
                disabled={!isCompared && !canAddCompare}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isCompared
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 border-neutral-200 dark:border-neutral-700'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
                aria-label="Toggle comparison"
              >
                {isCompared ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <GitCompare className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Short description: 2–3 lines */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
            {shortDescription || 'Key placement specialization with structured technical benchmarks.'}
          </p>

          {/* 3–4 Important Skills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {displaySkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700/70"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two Clear Primary Actions: View Details and Check My Fit */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2.5">
          <Link
            to={`/domains/${resolvedDomainSlug}/${id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition-colors cursor-pointer shadow-xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {onCheckFit && (
            <button
              type="button"
              onClick={() => onCheckFit(role)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer shadow-xs"
              title="Check your suitability for this role"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Check My Fit</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CompactRoleCard;
