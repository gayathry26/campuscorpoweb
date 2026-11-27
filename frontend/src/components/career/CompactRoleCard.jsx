import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  GitCompare,
  Check,
} from 'lucide-react';

export function CompactRoleCard({
  role,
  domainSlug,
  onToggleCompare,
  isCompared = false,
  canAddCompare = true,
}) {
  if (!role) return null;

  const {
    id = '',
    title = 'Untitled Role',
    category = '',
    shortDescription = '',
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

  // Extract clean salary range safely
  const safeStats = stats || {};
  const salaryText =
    safeStats.averageSalary ||
    (safeStats.minLpa && safeStats.maxLpa
      ? `₹${safeStats.minLpa} - ₹${safeStats.maxLpa} LPA`
      : safeStats.minLpa
      ? `From ₹${safeStats.minLpa} LPA`
      : safeStats.avgSalaryLPA
      ? `₹${safeStats.avgSalaryLPA} LPA Avg`
      : null);

  // Exactly 3 to 4 core skills
  const safeSkills = Array.isArray(technicalSkills)
    ? technicalSkills
    : typeof technicalSkills === 'object' && technicalSkills !== null
    ? Object.values(technicalSkills).flat().filter((s) => typeof s === 'string')
    : [];
  const displaySkills = safeSkills.slice(0, 4);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="h-full bg-card rounded-xl border border-border hover:border-[#8B2942]/45 p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-xs transition-all duration-200">
        {/* Top Header: Title, Salary, and Compare Toggle */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Link
                to={`/domains/${resolvedDomainSlug}/${id}`}
                className="text-base font-bold text-foreground hover:text-[#8B2942] dark:hover:text-[#F2B8C7] transition-colors block leading-snug line-clamp-2"
                title={title}
              >
                {title}
              </Link>

              {salaryText && (
                <div className="inline-flex items-center text-xs font-semibold text-[#26966B] bg-[#26966B]/10 px-2.5 py-0.5 rounded-md border border-[#26966B]/25">
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
                    ? 'bg-[#8B2942] text-white border-[#8B2942]'
                    : 'bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground hover:text-[#8B2942] border-border'
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
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
            {shortDescription || 'Key placement specialization with structured technical benchmarks.'}
          </p>

          {/* 3–4 Important Skills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {displaySkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700/70"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action: View Details */}
        <div className="pt-3 border-t border-border">
          <Link
            to={`/domains/${resolvedDomainSlug}/${id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors cursor-pointer"
          >
            <span>View Role Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default CompactRoleCard;
