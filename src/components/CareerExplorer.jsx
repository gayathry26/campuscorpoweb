import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X, 
  Search, 
  Layers, 
  Code, 
  Wrench, 
  TrendingUp, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react';
import { itDomainsData } from '../data/websiteData';

const FEATURED_DOMAINS = [
  { id: 'software-dev', name: 'Software Development' },
  { id: 'ai', name: 'Artificial Intelligence' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'cloud-computing', name: 'Cloud Computing' },
  { id: 'web-dev', name: 'Web Development' },
];

export default function CareerExplorer() {
  const [selectedDomainId, setSelectedDomainId] = useState('software-dev');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal specific state
  const [modalActiveId, setModalActiveId] = useState('software-dev');
  const [modalSearch, setModalSearch] = useState('');

  // Selected domain object for homepage preview
  const currentDomain = useMemo(() => {
    return itDomainsData.find((d) => d.id === selectedDomainId) || itDomainsData[0];
  }, [selectedDomainId]);

  // Open modal with current domain selected
  const handleOpenModal = (domainIdOverride) => {
    setModalActiveId(domainIdOverride || selectedDomainId);
    setModalSearch('');
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Modal filtered domains
  const modalFilteredDomains = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    if (!q) return itDomainsData;
    return itDomainsData.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.skills.some((s) => s.toLowerCase().includes(q)) ||
      d.roles.some((r) => r.toLowerCase().includes(q)) ||
      d.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [modalSearch]);

  const modalActiveDomain = useMemo(() => {
    return modalFilteredDomains.find((d) => d.id === modalActiveId) || modalFilteredDomains[0] || itDomainsData[0];
  }, [modalFilteredDomains, modalActiveId]);

  return (
    <section id="career-explorer" className="py-16 md:py-24 bg-[#fafafa] border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Column Minimal Layout: Left (55%) | Right (45%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Feature Information & Domain Pills */}
          <div className="lg:col-span-7">
            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              CAREER INTELLIGENCE
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24] mt-2">
              Explore IT Domains. Discover Your Career Path.
            </h2>

            <p className="mt-2.5 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              Explore technology domains, job roles and the skills needed to build your IT career.
            </p>

            {/* Compact Domain Selection Labels */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-6">
              {FEATURED_DOMAINS.map((dom) => {
                const isSelected = selectedDomainId === dom.id;
                return (
                  <button
                    key={dom.id}
                    onClick={() => setSelectedDomainId(dom.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                      isSelected
                        ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                        : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {dom.name}
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="mt-7">
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-semibold transition-all shadow-xs active:scale-95"
              >
                <span>Explore Career Roles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Minimal Career Preview Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs">
                <span className="font-mono font-bold text-neutral-400 uppercase">
                  Selected Domain
                </span>
                <span className="font-semibold text-neutral-900 text-xs">
                  {currentDomain.title}
                </span>
              </div>

              {/* Popular Roles Section */}
              <div className="pt-2">
                <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                  Popular Roles
                </span>

                <div className="divide-y divide-neutral-100">
                  <AnimatePresence mode="wait">
                    {currentDomain.roles.slice(0, 4).map((role, idx) => (
                      <motion.div
                        key={`${currentDomain.id}-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleOpenModal(currentDomain.id)}
                        className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-neutral-50 px-2 -mx-2 rounded-lg transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-neutral-800 group-hover:text-black">
                          {role}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-transform" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-3 mt-1 border-t border-neutral-100 flex items-center justify-between text-xs sm:text-sm text-neutral-600">
                <span>16 structured IT domains</span>
                <button
                  onClick={() => handleOpenModal()}
                  className="font-semibold text-neutral-950 hover:underline"
                >
                  View full taxonomy &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* COMPLETE CAREER EXPLORER MODAL (Preserves all 16 domains, tools & skills) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950">
                    IT Domains &amp; Career Taxonomy
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Explore all 16 technology domains, technical competencies, and progression roadmaps.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
                  aria-label="Close taxonomy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Search Bar */}
              <div className="px-6 py-3 border-b border-neutral-100 bg-white">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search any skill, domain, role, or tool (e.g. React, Docker, Python)..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg text-xs placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Split View: 16 Domains List + Deep-Dive Details */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-200 bg-[#fafafa]">
                
                {/* Left: 16 Domains Selector (4 Cols) */}
                <div className="md:col-span-4 p-3 bg-white space-y-1 overflow-y-auto max-h-[500px]">
                  <div className="text-xs font-mono font-semibold uppercase text-neutral-500 px-2 py-1">
                    All 16 IT Domains ({modalFilteredDomains.length})
                  </div>
                  {modalFilteredDomains.map((d, index) => {
                    const isSelected = d.id === modalActiveDomain.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setModalActiveId(d.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-neutral-950 text-white'
                            : 'hover:bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <span className="truncate">{d.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Right: Detailed Domain Specs (8 Cols) */}
                <div className="md:col-span-8 p-6 bg-white overflow-y-auto max-h-[500px] space-y-5">
                  <div>
                    <span className="text-xs font-mono font-semibold tracking-wider text-neutral-500 uppercase">
                      Curriculum Track
                    </span>
                    <h4 className="text-xl sm:text-2xl font-bold text-neutral-950 mt-1">
                      {modalActiveDomain.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                      {modalActiveDomain.tagline}
                    </p>
                  </div>

                  {/* Target Roles */}
                  <div>
                    <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                      Target Placement Roles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {modalActiveDomain.roles.map((r, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs sm:text-[13px] font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills & Tools */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Prerequisite Skills
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-[13px] text-neutral-700">
                        {modalActiveDomain.skills.map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Developer Tools
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {modalActiveDomain.tools.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progression & Learning Path */}
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Career Progression
                      </span>
                      <p className="text-xs font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                        {modalActiveDomain.progression}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Campus Curriculum Roadmap
                      </span>
                      <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                        {modalActiveDomain.learningPath}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-neutral-200 bg-white flex items-center justify-between text-xs text-neutral-500">
                <span>16 Domains mapped to industry certifications</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white font-medium hover:bg-neutral-800 transition-colors"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
