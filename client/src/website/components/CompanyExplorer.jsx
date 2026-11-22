import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, X, Search, Building2 } from 'lucide-react';
import { itCompaniesData } from '../data/websiteData';

const CITIES = ['Chennai', 'Coimbatore', 'Bengaluru', 'Hyderabad', 'Pune'];
const MODAL_CITIES = ['All', 'Chennai', 'Coimbatore', 'Bengaluru', 'Hyderabad', 'Pune'];

export default function CompanyExplorer() {
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCity, setModalCity] = useState('All');
  const [modalSearch, setModalSearch] = useState('');

  // 3 Preview companies for the selected homepage city
  const previewCompanies = useMemo(() => {
    return itCompaniesData
      .filter((c) => c.city === selectedCity)
      .slice(0, 3);
  }, [selectedCity]);

  const handleOpenModal = (cityOverride) => {
    setModalCity(cityOverride || selectedCity);
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

  // Filtered companies for the complete directory modal
  const filteredModalCompanies = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    return itCompaniesData.filter((company) => {
      const matchesCity = modalCity === 'All' || company.city === modalCity;
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.city.toLowerCase().includes(q) ||
        company.state.toLowerCase().includes(q) ||
        company.domain.toLowerCase().includes(q) ||
        company.roles.some((r) => r.toLowerCase().includes(q));
      return matchesCity && matchesSearch;
    });
  }, [modalCity, modalSearch]);

  return (
    <section id="company-explorer" className="py-16 md:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Two-Column Minimal Layout: Left (55%) | Right (45%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: Feature Information & Location Pills */}
          <div className="lg:col-span-7">
            <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              COMPANY DISCOVERY
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24] mt-2">
              Explore IT Companies by Location.
            </h2>

            <p className="mt-2.5 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              Discover technology companies and career opportunities across India's major IT hubs.
            </p>

            {/* Location Selection Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-6">
              {CITIES.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${isSelected
                      ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/80'
                      }`}
                  >
                    {city}
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
                <span>Explore Companies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Minimal Preview Panel (3 Companies) */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 text-xs sm:text-[13px]">
                <span className="font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  Featured in {selectedCity}
                </span>
                <span className="font-mono text-neutral-600 text-xs">
                  {selectedCity}, India
                </span>
              </div>

              {/* 3 Simple Company Rows */}
              <div className="divide-y divide-neutral-200">
                <AnimatePresence mode="wait">
                  {previewCompanies.map((company) => (
                    <motion.div
                      key={company.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => handleOpenModal(company.city)}
                      className="py-3.5 flex items-center justify-between cursor-pointer group hover:bg-white px-2.5 -mx-2.5 rounded-lg transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-sm sm:text-base text-neutral-900 group-hover:text-black">
                          {company.name}
                        </span>
                        <div className="text-xs sm:text-[13px] text-neutral-600 mt-0.5">
                          {company.domain}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-3 mt-1 border-t border-neutral-200/60 flex items-center justify-between text-xs sm:text-sm text-neutral-600">
                <span>Verified corporate profiles</span>
                <button
                  onClick={() => handleOpenModal()}
                  className="font-semibold text-neutral-950 hover:underline"
                >
                  View full list &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* COMPLETE COMPANY EXPLORER MODAL (Preserves all 100% data, search & links) */}
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
                    IT Company Directory
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Explore profiles, technology domains, and verified career portals.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
                  aria-label="Close directory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters in Modal */}
              <div className="px-6 py-3.5 border-b border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {MODAL_CITIES.map((city) => {
                    const isSelected = modalCity === city;
                    return (
                      <button
                        key={city}
                        onClick={() => setModalCity(city)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${isSelected
                          ? 'bg-neutral-950 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search company or role..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg text-xs placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Body: Complete Directory Cards */}
              <div className="p-6 overflow-y-auto flex-1 bg-[#fafafa]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModalCompanies.map((company) => (
                    <div
                      key={company.name}
                      className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-950 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-sm sm:text-base text-neutral-950">
                          {company.name}
                        </h4>

                        <div className="space-y-1 text-xs text-neutral-600">
                          <div>
                            <span className="text-neutral-400 font-medium">Location: </span>
                            <span className="text-neutral-900 font-medium">{company.city}, {company.state}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Technology Domain: </span>
                            <span className="text-neutral-900 font-medium">{company.domain}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 text-xs">
                          <span className="text-neutral-400 font-medium block mb-0.5">Career Roles:</span>
                          <p className="text-neutral-800 font-medium leading-relaxed">
                            {company.roles.join(' · ')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-950 hover:underline"
                        >
                          <span>View Careers</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredModalCompanies.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <Building2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <h4 className="text-xs font-semibold text-neutral-800">No companies found</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Try resetting the location filter or modifying search keywords.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-neutral-200 bg-white flex items-center justify-between text-xs text-neutral-500">
                <span>Showing {filteredModalCompanies.length} companies</span>
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
