import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// 4 Primary Domains for Card 01 Navigation
const DOMAIN_OPTIONS = [
  {
    id: 'software-dev',
    number: '01',
    title: 'Software Development',
    subtitle: 'Core application architecture, system algorithms, and distributed enterprise microservices.',
    roleCount: 6,
    rolesPreview: ['Software Engineer', 'Full Stack Developer', 'Backend Architect', 'System Engineer'],
    accent: '#10b981',
  },
  {
    id: 'web-dev',
    number: '02',
    title: 'Web Development',
    subtitle: 'Modern frontend ecosystems, serverless APIs, state management, and resilient full-stack systems.',
    roleCount: 5,
    rolesPreview: ['Frontend Architect', 'Full Stack Engineer', 'JAMstack Developer', 'API Specialist'],
    accent: '#3b82f6',
  },
  {
    id: 'mobile-dev',
    number: '03',
    title: 'Mobile Development',
    subtitle: 'Native iOS & Android development alongside cross-platform Flutter and React Native mobile systems.',
    roleCount: 5,
    rolesPreview: ['iOS Engineer (Swift)', 'Android Dev (Kotlin)', 'Flutter Specialist', 'Mobile Architect'],
    accent: '#8b5cf6',
  },
  {
    id: 'ai',
    number: '04',
    title: 'Artificial Intelligence',
    subtitle: 'Autonomous intelligent agents, deep neural networks, transformer pipelines, and LLM inference.',
    roleCount: 5,
    rolesPreview: ['AI Research Scientist', 'Applied AI Engineer', 'NLP Specialist', 'MLOps Architect'],
    accent: '#ec4899',
  },
];

// 4 Primary Locations for Card 02 Navigation
const LOCATION_OPTIONS = [
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    number: '01',
    tagline: 'The Global SaaS & FinTech Capital',
    companies: [
      { name: 'Zoho Corporation', domain: 'Enterprise Cloud' },
      { name: 'Freshworks', domain: 'CRM Cloud' },
      { name: 'Chargebee', domain: 'FinTech Billing' },
      { name: 'Kissflow', domain: 'Digital Workspace' },
    ],
  },
  {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    number: '02',
    tagline: 'Automotive Embedded, IoT & Azure Cloud Hub',
    companies: [
      { name: 'Bosch Global Software', domain: 'Automotive IoT' },
      { name: 'Kovai.co', domain: 'Azure SaaS' },
      { name: 'Payoda Technologies', domain: 'Cloud Transformation' },
      { name: 'Pricol Limited', domain: 'Embedded Systems' },
    ],
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    number: '03',
    tagline: 'Silicon Valley of India • Startups & Tier-1 IT',
    companies: [
      { name: 'Infosys & Wipro', domain: 'Enterprise IT' },
      { name: 'Zerodha', domain: 'FinTech Core' },
      { name: 'Razorpay', domain: 'Payment Infrastructure' },
      { name: 'Swiggy', domain: 'Machine Learning' },
    ],
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    number: '04',
    tagline: 'Enterprise Cloud, AI & Global Innovation Corridor',
    companies: [
      { name: 'Microsoft IDC', domain: 'Azure & AI Core' },
      { name: 'ServiceNow', domain: 'Enterprise SaaS' },
      { name: 'Darwinbox', domain: 'HRTech Platform' },
      { name: 'Salesforce', domain: 'Enterprise Cloud' },
    ],
  },
];

export default function HorizontalIntelligence() {
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const domainWheelTimeout = useRef(false);
  const locationWheelTimeout = useRef(false);

  // Wheel down/up scrolling support for the left side boxes
  const handleDomainWheel = (e) => {
    if (domainWheelTimeout.current) return;
    if (Math.abs(e.deltaY) > 15) {
      if (e.deltaY > 0 && activeDomainIndex < DOMAIN_OPTIONS.length - 1) {
        domainWheelTimeout.current = true;
        setActiveDomainIndex((prev) => prev + 1);
        setTimeout(() => { domainWheelTimeout.current = false; }, 280);
      } else if (e.deltaY < 0 && activeDomainIndex > 0) {
        domainWheelTimeout.current = true;
        setActiveDomainIndex((prev) => prev - 1);
        setTimeout(() => { domainWheelTimeout.current = false; }, 280);
      }
    }
  };

  const handleLocationWheel = (e) => {
    if (locationWheelTimeout.current) return;
    if (Math.abs(e.deltaY) > 15) {
      if (e.deltaY > 0 && activeLocationIndex < LOCATION_OPTIONS.length - 1) {
        locationWheelTimeout.current = true;
        setActiveLocationIndex((prev) => prev + 1);
        setTimeout(() => { locationWheelTimeout.current = false; }, 280);
      } else if (e.deltaY < 0 && activeLocationIndex > 0) {
        locationWheelTimeout.current = true;
        setActiveLocationIndex((prev) => prev - 1);
        setTimeout(() => { locationWheelTimeout.current = false; }, 280);
      }
    }
  };

  return (
    <div
      id="discovery"
      className="relative w-full bg-white text-neutral-950 py-12 sm:py-16 overflow-hidden"
      aria-label="CampusCorpo Career and Institutional Intelligence"
    >
      {/* Centered Compact Container (max-w-[960px]) */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 space-y-7 sm:space-y-8">
        
        {/* =================================================================== */}
        {/* CARD 01 – EXPLORE DOMAIN                                            */}
        {/* =================================================================== */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex flex-col lg:flex-row min-h-[350px]">
            
            {/* Left section (64% width): Header + Content Reel + Action Bar */}
            <div
              onWheel={handleDomainWheel}
              className="lg:w-[64%] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative cursor-default"
            >
              {/* Top: Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                      DISCOVERY / {DOMAIN_OPTIONS[activeDomainIndex].number}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">
                      Scroll box or select
                    </span>
                    <div className="flex items-center gap-0.5 border border-neutral-200/80 rounded-md p-0.5 bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => setActiveDomainIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeDomainIndex === 0}
                        className="p-0.5 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 transition-colors cursor-pointer"
                        title="Previous discipline"
                        aria-label="Previous discipline"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDomainIndex((prev) => Math.min(DOMAIN_OPTIONS.length - 1, prev + 1))}
                        disabled={activeDomainIndex === DOMAIN_OPTIONS.length - 1}
                        className="p-0.5 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 transition-colors cursor-pointer"
                        title="Next discipline"
                        aria-label="Next discipline"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-neutral-950 leading-tight">
                  Explore Domain
                </h2>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed line-clamp-1">
                  Select a technology discipline to review competency matrices and placement pathways.
                </p>
              </div>

              {/* Middle: Content Transition Area (Zero Overlap Guaranteed) */}
              <div className="my-3 min-h-[152px] overflow-hidden relative border-y border-neutral-100 py-3 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={DOMAIN_OPTIONS[activeDomainIndex].id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        {DOMAIN_OPTIONS[activeDomainIndex].number}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      <span className="text-xs font-mono text-neutral-600">
                        {DOMAIN_OPTIONS[activeDomainIndex].roleCount} Verified Tracks
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-[22px] font-bold text-neutral-950 leading-snug">
                      {DOMAIN_OPTIONS[activeDomainIndex].title}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                      {DOMAIN_OPTIONS[activeDomainIndex].subtitle}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {DOMAIN_OPTIONS[activeDomainIndex].rolesPreview.map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-1 rounded-md bg-neutral-100/90 border border-neutral-200/80 text-xs font-mono text-neutral-800"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom: Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <Link
                  to={`/career-explorer?domain=${DOMAIN_OPTIONS[activeDomainIndex].id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-[13px] font-semibold transition-colors shadow-2xs w-fit"
                >
                  <span>Explore {DOMAIN_OPTIONS[activeDomainIndex].title}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/career-explorer"
                  className="text-xs sm:text-[13px] font-mono text-neutral-500 hover:text-neutral-950 font-medium transition-colors"
                >
                  All 16 domains →
                </Link>
              </div>
            </div>

            {/* Right section (36% width): Vertical Numbered Navigation */}
            <div className="lg:w-[36%] border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-center">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold mb-3 px-2">
                Select Discipline
              </div>

              <div className="flex flex-col gap-1.5">
                {DOMAIN_OPTIONS.map((domain, idx) => {
                  const isActive = activeDomainIndex === idx;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => setActiveDomainIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-mono transition-all duration-150 flex items-center justify-between cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-neutral-950 text-white font-semibold shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-neutral-400 font-bold' : 'text-neutral-400 font-medium'}>
                          {domain.number}
                        </span>
                        <span>{domain.title}</span>
                      </div>
                      {isActive && <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 02 – IT LOCATION                                               */}
        {/* =================================================================== */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex flex-col lg:flex-row min-h-[350px]">
            
            {/* Left section (64% width): Header + Content Reel + Action Bar */}
            <div
              onWheel={handleLocationWheel}
              className="lg:w-[64%] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative cursor-default"
            >
              {/* Top: Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                      DISCOVERY / {LOCATION_OPTIONS[activeLocationIndex].number}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">
                      Scroll box or select
                    </span>
                    <div className="flex items-center gap-0.5 border border-neutral-200/80 rounded-md p-0.5 bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => setActiveLocationIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeLocationIndex === 0}
                        className="p-0.5 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 transition-colors cursor-pointer"
                        title="Previous location"
                        aria-label="Previous location"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLocationIndex((prev) => Math.min(LOCATION_OPTIONS.length - 1, prev + 1))}
                        disabled={activeLocationIndex === LOCATION_OPTIONS.length - 1}
                        className="p-0.5 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-neutral-700 transition-colors cursor-pointer"
                        title="Next location"
                        aria-label="Next location"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-neutral-950 leading-tight">
                  IT Location
                </h2>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed line-clamp-1">
                  Explore premier technology corridors, corporate recruiters, and enterprise SaaS unicorns.
                </p>
              </div>

              {/* Middle: Content Transition Area (Zero Overlap Guaranteed) */}
              <div className="my-3 min-h-[152px] overflow-hidden relative border-y border-neutral-100 py-3 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={LOCATION_OPTIONS[activeLocationIndex].city}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col justify-center"
                  >
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl sm:text-[22px] font-bold text-neutral-950 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-neutral-700" />
                          <span>{LOCATION_OPTIONS[activeLocationIndex].city}</span>
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-mono text-neutral-700">
                          {LOCATION_OPTIONS[activeLocationIndex].state}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 truncate max-w-[240px]">
                        {LOCATION_OPTIONS[activeLocationIndex].tagline}
                      </span>
                    </div>

                    {/* Prominent Companies Grid */}
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LOCATION_OPTIONS[activeLocationIndex].companies.map((comp) => (
                        <div
                          key={comp.name}
                          className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/80"
                        >
                          <span className="text-xs sm:text-[13px] font-bold text-neutral-950 block truncate">
                            {comp.name}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono block truncate mt-0.5">
                            {comp.domain}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom: Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <Link
                  to={`/company-explorer?city=${LOCATION_OPTIONS[activeLocationIndex].city}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-[13px] font-semibold transition-colors shadow-2xs w-fit"
                >
                  <span>View {LOCATION_OPTIONS[activeLocationIndex].city} Directory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/company-explorer"
                  className="text-xs sm:text-[13px] font-mono text-neutral-500 hover:text-neutral-950 font-medium transition-colors"
                >
                  All Tech Hubs →
                </Link>
              </div>
            </div>

            {/* Right section (36% width): Vertical Numbered Navigation */}
            <div className="lg:w-[36%] border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-center">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold mb-3 px-2">
                Select Hub
              </div>

              <div className="flex flex-col gap-1.5">
                {LOCATION_OPTIONS.map((loc, idx) => {
                  const isActive = activeLocationIndex === idx;
                  return (
                    <button
                      key={loc.city}
                      type="button"
                      onClick={() => setActiveLocationIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-mono transition-all duration-150 flex items-center justify-between cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-neutral-950 text-white font-semibold shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-neutral-400 font-bold' : 'text-neutral-400 font-medium'}>
                          {loc.number}
                        </span>
                        <span>{loc.city}</span>
                      </div>
                      {isActive && <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
