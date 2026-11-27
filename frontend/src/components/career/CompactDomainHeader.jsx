import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Layers,
  ChevronDown,
  Sparkles,
  Compass,
  Check,
  BookOpen,
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
  const coreTech = domain?.coreTechnologies || [];
  const displayTech = coreTech.slice(0, 6);

  return (
    <div className="space-y-4 pt-1">
      {/* Top Bar: Breadcrumbs & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Link to="/domains" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Career Explorer
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link to="/domains" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Explore Domains
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[240px] sm:max-w-none">
            {domain?.name}
          </span>
        </nav>

        <Link
          to="/domains"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Domains</span>
        </Link>
      </div>

      {/* Main Domain Hero Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 shadow-xs">
              <DomainIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {domain?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                  {roles.length} {roles.length === 1 ? 'Career Role' : 'Career Roles'}
                </span>
              </div>
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {domain?.shortDescription || domain?.description || 'Explore career paths, verified salary bands, and essential skills in this technology domain.'}
              </p>
            </div>
          </div>
        </div>

        {/* Essential Technologies & Learn More Toggle */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          {displayTech.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-400 mr-1">
                Core Technologies:
              </span>
              {displayTech.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80"
                >
                  {tech}
                </span>
              ))}
              {coreTech.length > displayTech.length && (
                <span className="text-xs sm:text-sm font-medium text-neutral-400 px-1.5">
                  +{coreTech.length - displayTech.length} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <Link
              to={`/career-explorer/knowledge-hub/${domain?.slug || domain?.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>12-Module Knowledge Notes & PDF</span>
            </Link>

            {onToggleDetails && (
              <button
                type="button"
                onClick={onToggleDetails}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
              >
                <span>{showDetails ? 'Hide Overview' : 'Learn More'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showDetails ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Expandable "Learn About This Domain" Section */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: What Professionals Do */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-neutral-100 dark:border-neutral-800">
                    <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      What Professionals in This Domain Do
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {domain?.overview || domain?.description || domain?.shortDescription || 'Comprehensive domain curriculum and career progression pathways.'}
                  </p>
                  {Array.isArray(domain?.whatProfessionalsDo) && domain.whatProfessionalsDo.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {domain.whatProfessionalsDo.map((task, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
                        >
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Prerequisites & Career Progression */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Beginner Prerequisites */}
                  {Array.isArray(domain?.prerequisites) && domain.prerequisites.length > 0 && (
                    <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-200/60 dark:border-neutral-700/60">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Beginner Prerequisites
                        </h4>
                      </div>
                      <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                        {domain.prerequisites.map((prereq, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0 mt-2" />
                            <span>{prereq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career Progression Track */}
                  {domain?.careerProgression && typeof domain.careerProgression === 'string' && (
                    <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-200/60 dark:border-neutral-700/60">
                        <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Career Progression Track
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {domain.careerProgression.split(/\s*(?:->|→)\s*/).map((step, idx, arr) => (
                          <React.Fragment key={idx}>
                            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-medium">
                              {step.trim()}
                            </span>
                            {idx < arr.length - 1 && (
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CompactDomainHeader;
