import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight, Building2, MapPin, X } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';
import { itCompaniesData } from '../data/websiteData';
import { PREMIUM_EASE } from '../utils/animations';

const CITIES = ['All', 'Chennai', 'Coimbatore', 'Bengaluru', 'Hyderabad', 'Pune'];

export default function CompanyExplorerPage({ onOpenDemo }) {
  const seo = routesSEO.companyExplorer;
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return itCompaniesData.filter((company) => {
      const matchesCity = selectedCity === 'All' || company.city === selectedCity;
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.city.toLowerCase().includes(q) ||
        company.state.toLowerCase().includes(q) ||
        company.domain.toLowerCase().includes(q) ||
        company.roles.some((r) => r.toLowerCase().includes(q));
      return matchesCity && matchesSearch;
    });
  }, [selectedCity, searchQuery]);

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
          { name: 'Company Explorer', href: '/company-explorer' }
        ]} />

        {/* Hero */}
        <div className="py-10 md:py-14 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            REGIONAL CORPORATE DIRECTORY
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Explore IT Companies. By Location.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Curated technology product and services companies, technology domains, active hiring tracks, and direct links to verified career portals across India's premier tech clusters.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* City Pills with Layout Transition */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors z-10 ${
                    isSelected
                      ? 'text-white'
                      : 'text-neutral-700 hover:text-neutral-950 border border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCityTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-neutral-950 rounded-full -z-10 shadow-xs"
                    />
                  )}
                  <span>{city}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search company, domain or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white text-neutral-900 border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Directory Grid with Animated Stagger Cards */}
        <motion.div 
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          <AnimatePresence>
            {filteredCompanies.map((company) => (
              <motion.div
                key={company.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22, ease: PREMIUM_EASE }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-950 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <h2 className="font-semibold text-lg text-neutral-950 leading-snug group-hover:text-black">
                    {company.name}
                  </h2>

                  <div className="space-y-1.5 text-sm text-neutral-600">
                    <div>
                      <span className="text-neutral-500 font-medium">Location: </span>
                      <span className="text-neutral-900 font-medium">{company.city}, {company.state}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-medium">Technology Domain: </span>
                      <span className="text-neutral-900 font-medium">{company.domain}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 text-sm">
                    <span className="text-neutral-500 font-medium block mb-1 text-xs uppercase tracking-wider">Career Roles:</span>
                    <p className="text-neutral-800 font-normal leading-relaxed">
                      {company.roles.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-950 hover:underline group-hover:text-black"
                  >
                    <span>View Careers</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCompanies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 bg-neutral-50 rounded-xl border border-neutral-200"
          >
            <Building2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900">No matching companies found</h3>
            <p className="text-xs text-neutral-500 mt-1">Try resetting the location filter or modifying search keywords.</p>
            <button
              onClick={() => { setSelectedCity('All'); setSearchQuery(''); }}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* Related Navigation */}
        <div className="py-10 mt-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link to="/features/mock-interviews" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Mock Interview Platform</span>
          </Link>
          <Link to="/career-explorer" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>16 IT Career Domains &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection
        faqs={seo.faqs}
        title="Frequently Asked Questions: IT Company Explorer"
        subtitle="Direct answers regarding regional tech clusters, hiring tracks, and direct company links."
      />
    </AnimatedPageWrapper>
  );
}




