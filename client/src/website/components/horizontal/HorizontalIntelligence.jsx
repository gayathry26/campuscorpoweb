import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  ChevronDown,
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
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0 && activeDomainIndex < DOMAIN_OPTIONS.length - 1) {
        domainWheelTimeout.current = true;
        setActiveDomainIndex((prev) => prev + 1);
        setTimeout(() => { domainWheelTimeout.current = false; }, 320);
      } else if (e.deltaY < 0 && activeDomainIndex > 0) {
        domainWheelTimeout.current = true;
        setActiveDomainIndex((prev) => prev - 1);
        setTimeout(() => { domainWheelTimeout.current = false; }, 320);
      }
    }
  };

  const handleLocationWheel = (e) => {
    if (locationWheelTimeout.current) return;
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0 && activeLocationIndex < LOCATION_OPTIONS.length - 1) {
        locationWheelTimeout.current = true;
        setActiveLocationIndex((prev) => prev + 1);
        setTimeout(() => { locationWheelTimeout.current = false; }, 320);
      } else if (e.deltaY < 0 && activeLocationIndex > 0) {
        locationWheelTimeout.current = true;
        setActiveLocationIndex((prev) => prev - 1);
        setTimeout(() => { locationWheelTimeout.current = false; }, 320);
      }
    }
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 280, damping: 28 };

  return (
    <div
      id="discovery"
      className="relative w-full bg-white text-neutral-950 py-12 sm:py-16 overflow-hidden"
      aria-label="CampusCorpo Career and Institutional Intelligence"
    >
      {/* Centered Compact Container (max-w-[920px]) */}
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 space-y-7 sm:space-y-8">
        
        {/* =================================================================== */}
        {/* CARD 01 – EXPLORE DOMAIN                                            */}
        {/* =================================================================== */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs hover:border-neutral-300 transition-all">
          <div className="flex flex-col lg:flex-row min-h-[350px] lg:h-[360px]">
            
            {/* Left section (68% width): Header + Down-scrolling reel */}
            <div
              onWheel={handleDomainWheel}
              className="lg:w-[68%] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative cursor-default"
            >
              {/* Top: Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                      DISCOVERY / 01
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 hidden sm:inline-flex items-center gap-1">
                    Scroll down inside box <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-neutral-950 leading-tight">
                  Explore Domain
                </h2>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed line-clamp-1">
                  Select a technology discipline to review competency matrices and placement pathways.
                </p>
              </div>

              {/* Middle: Down-Scrolling Content Reel (Height 148px) */}
              <div className="my-3 h-[148px] overflow-hidden relative border-y border-neutral-100 py-1.5">
                <motion.div
                  animate={{ y: -activeDomainIndex * 148 }}
                  transition={springTransition}
                  className="flex flex-col will-change-transform"
                >
                  {DOMAIN_OPTIONS.map((domain) => (
                    <div
                      key={domain.id}
                      className="h-[148px] flex flex-col justify-center flex-shrink-0"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          {domain.number}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                        <span className="text-xs font-mono text-neutral-600">
                          {domain.roleCount} Verified Tracks
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-[22px] font-bold text-neutral-950 leading-snug">
                        {domain.title}
                      </h3>

                      <p className="mt-1 text-sm text-neutral-600 line-clamp-1 leading-relaxed">
                        {domain.subtitle}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 overflow-hidden">
                        {domain.rolesPreview.map((role) => (
                          <span
                            key={role}
                            className="px-2.5 py-1 rounded-md bg-neutral-100/80 border border-neutral-200/80 text-xs font-mono text-neutral-800"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
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

            {/* Right section (32% width): Vertical Numbered Navigation */}
            <div className="lg:w-[32%] border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-center">
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
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-neutral-950 text-white font-semibold shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-neutral-400 font-bold' : 'text-neutral-400 font-medium'}>
                          {domain.number}
                        </span>
                        <span className="truncate">{domain.title}</span>
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
          <div className="flex flex-col lg:flex-row min-h-[350px] lg:h-[360px]">
            
            {/* Left section (68% width): Header + Down-scrolling reel */}
            <div
              onWheel={handleLocationWheel}
              className="lg:w-[68%] p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative cursor-default"
            >
              {/* Top: Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                      DISCOVERY / 02
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 hidden sm:inline-flex items-center gap-1">
                    Scroll down inside box <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </div>

                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-neutral-950 leading-tight">
                  IT Location
                </h2>
                <p className="mt-1 text-sm text-neutral-600 leading-relaxed line-clamp-1">
                  Explore premier technology corridors, corporate recruiters, and enterprise SaaS unicorns.
                </p>
              </div>

              {/* Middle: Down-Scrolling Content Reel (Height 148px) */}
              <div className="my-3 h-[148px] overflow-hidden relative border-y border-neutral-100 py-1.5">
                <motion.div
                  animate={{ y: -activeLocationIndex * 148 }}
                  transition={springTransition}
                  className="flex flex-col will-change-transform"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <div
                      key={loc.city}
                      className="h-[148px] flex flex-col justify-center flex-shrink-0"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl sm:text-[22px] font-bold text-neutral-950 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-neutral-700" />
                            <span>{loc.city}</span>
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-xs font-mono text-neutral-700">
                            {loc.state}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-neutral-500 truncate max-w-[220px]">
                          {loc.tagline}
                        </span>
                      </div>

                      {/* Prominent Companies Grid */}
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {loc.companies.map((comp) => (
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
                    </div>
                  ))}
                </motion.div>
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

            {/* Right section (32% width): Vertical Numbered Navigation */}
            <div className="lg:w-[32%] border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-[#FAFAFA] p-5 sm:p-6 flex flex-col justify-center">
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
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-neutral-950 text-white font-semibold shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-neutral-400 font-bold' : 'text-neutral-400 font-medium'}>
                          {loc.number}
                        </span>
                        <span className="truncate">{loc.city}</span>
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
