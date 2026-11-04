import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Layers,
  Code,
  Wrench,
  TrendingUp,
  BookOpen,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';
import { itDomainsData } from '../data/websiteData';
import { PREMIUM_EASE } from '../utils/animations';

export default function CareerExplorerPage({ onOpenDemo }) {
  const seo = routesSEO.careerExplorer;
  const [selectedDomainId, setSelectedDomainId] = useState('software-dev');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDomains = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return itDomainsData;
    return itDomainsData.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.skills.some((s) => s.toLowerCase().includes(q)) ||
      d.roles.some((r) => r.toLowerCase().includes(q)) ||
      d.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeDomain = useMemo(() => {
    return filteredDomains.find((d) => d.id === selectedDomainId) || filteredDomains[0] || itDomainsData[0];
  }, [filteredDomains, selectedDomainId]);

  return (
    <AnimatedPageWrapper className="pt-24 pb-20 bg-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { name: 'Career Explorer', href: '/career-explorer' }
        ]} />

        {/* Hero */}
        <div className="py-10 md:py-14 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            STRUCTURED CAREER INTELLIGENCE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Explore Every IT Domain. Discover Every Role.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Detailed technology taxonomy covering 16 core IT sectors, industry job roles, prerequisite technical skills, developer toolchains, and verified career ladders.
          </p>
        </div>

        {/* Master Explorer Layout: 16 Domains Sidebar + Detailed Specs */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skill, role or domain (e.g. React, Docker, Python, Cloud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-neutral-900 border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition-colors shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Domains Selector (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-2 max-h-[580px] overflow-y-auto space-y-1 shadow-2xs">
            <div className="p-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex justify-between items-center">
              <span>All 16 IT Domains</span>
              <span>{filteredDomains.length} Active</span>
            </div>
            {filteredDomains.map((domain, index) => {
              const isSelected = domain.id === activeDomain?.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomainId(domain.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${isSelected
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'hover:bg-neutral-100 text-neutral-800'
                    }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-sm truncate">
                        {domain.title}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {domain.tagline}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-neutral-400 group-hover:translate-x-0.5'}`} />
                </button>
              );
            })}
          </div>

          {/* Active Domain Specs (8 Cols) with Animated Transition */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-md min-h-[460px]">
            <AnimatePresence mode="wait">
              {activeDomain && (
                <motion.div
                  key={activeDomain.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: PREMIUM_EASE }}
                  className="space-y-6"
                >
                  <div className="pb-5 border-b border-neutral-200">
                    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                      Technology Track Breakdown
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 mt-1">
                      {activeDomain.title}
                    </h2>
                    <p className="mt-1 text-base text-neutral-600 font-normal">
                      {activeDomain.tagline}
                    </p>
                  </div>

                  {/* Target Roles */}
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2.5">
                      Target Placement Roles
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeDomain.roles.map((r, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills & Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
                        <Code className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Core Technical Skills</span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-neutral-700">
                        {activeDomain.skills.map((s, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
                        <Wrench className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Toolchains &amp; Frameworks</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDomain.tools.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-neutral-100 text-xs sm:text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career Progression Ladder */}
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Career Progression Ladder</span>
                    </div>
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900">
                      {activeDomain.progression}
                    </div>
                  </div>

                  {/* Recommended Roadmap */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Recommended Campus Curriculum Roadmap</span>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed font-normal bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl">
                      {activeDomain.learningPath}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Navigation */}
        <div className="py-10 mt-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <Link to="/company-explorer" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; IT Company Explorer</span>
          </Link>
          <Link to="/solutions/placement-management" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Placement Management Software &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection
        faqs={seo.faqs}
        title="Frequently Asked Questions: IT Career Domains"
        subtitle="Direct answers regarding software engineering career tracks, skills, and tools."
      />
    </AnimatedPageWrapper>
  );
}


