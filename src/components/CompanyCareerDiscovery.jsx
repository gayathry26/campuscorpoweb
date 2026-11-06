import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Code2,
  Globe,
  Smartphone,
  Brain,
  Cpu,
  LineChart,
  BarChart3,
  ShieldCheck,
  Cloud,
  Terminal,
  Network,
  Palette,
  Database,
  Boxes,
  CircuitBoard,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Users,
  Lock,
} from 'lucide-react';
import { itDomainsData } from '../data/websiteData';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Map IT domains to authoritative minimal Lucide icons
const DOMAIN_ICONS = {
  'software-dev': Code2,
  'web-dev': Globe,
  'mobile-dev': Smartphone,
  'ai': Brain,
  'machine-learning': Cpu,
  'data-science': LineChart,
  'data-analytics': BarChart3,
  'cybersecurity': ShieldCheck,
  'cloud-computing': Cloud,
  'devops': Terminal,
  'networking': Network,
  'ui-ux': Palette,
  'database-admin': Database,
  'blockchain': Boxes,
  'embedded-systems': CircuitBoard,
  'software-testing': CheckCircle2,
};

// 6 Featured Roles for Chapter 02
const FEATURED_ROLES = [
  {
    number: '01',
    title: 'Full Stack Engineer',
    domainId: 'software-dev',
    domainName: 'Software Engineering',
    description: 'Architects end-to-end web applications, microservice APIs, and scalable transactional datastores.',
    skills: ['React / Next.js', 'Node.js & TypeScript', 'PostgreSQL', 'Docker'],
    trajectory: 'Associate → Full Stack Engineer → Lead Architect',
    icon: Code2,
  },
  {
    number: '02',
    title: 'AI Research Engineer',
    domainId: 'ai',
    domainName: 'Artificial Intelligence',
    description: 'Designs deep neural networks, fine-tunes foundation models, and optimizes low-latency inference pipelines.',
    skills: ['PyTorch & TensorFlow', 'Transformers & LLMs', 'CUDA Acceleration', 'Hugging Face'],
    trajectory: 'Applied AI Scientist → Staff AI Engineer → Chief AI Officer',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Cloud Solutions Architect',
    domainId: 'cloud-computing',
    domainName: 'Cloud & Infrastructure',
    description: 'Deploys resilient multi-region infrastructure, VPC networks, and serverless architectures.',
    skills: ['AWS & Azure Core', 'Terraform IaC', 'Kubernetes Orchestration', 'Linux Internals'],
    trajectory: 'Cloud Engineer → Solutions Architect → VP Infrastructure',
    icon: Cloud,
  },
  {
    number: '04',
    title: 'Cybersecurity Analyst',
    domainId: 'cybersecurity',
    domainName: 'Information Assurance',
    description: 'Defends digital assets through threat detection, vulnerability assessment, and zero-trust security postures.',
    skills: ['SOC Operations', 'SIEM & Splunk', 'OWASP Top 10', 'Penetration Testing'],
    trajectory: 'SOC Analyst → Security Engineer → CISO',
    icon: ShieldCheck,
  },
  {
    number: '05',
    title: 'Data & Analytics Specialist',
    domainId: 'data-analytics',
    domainName: 'Business Intelligence',
    description: 'Translates massive datasets into executive dashboards, predictive signals, and strategic roadmaps.',
    skills: ['Advanced SQL & CTEs', 'Power BI & Tableau', 'Snowflake DW', 'Python (Pandas)'],
    trajectory: 'Junior Analyst → BI Developer → Head of Analytics',
    icon: LineChart,
  },
  {
    number: '06',
    title: 'DevOps & SRE Engineer',
    domainId: 'devops',
    domainName: 'Site Reliability',
    description: 'Automates deployment pipelines, cluster management, and guarantees 99.99% system availability.',
    skills: ['GitHub Actions CI/CD', 'Docker & Kubernetes', 'Prometheus & Grafana', 'Terraform'],
    trajectory: 'DevOps Engineer → Senior SRE → Director of Operations',
    icon: Terminal,
  },
];

// Curated Tech Hubs for Chapter 03
const TECH_HUBS = [
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    tagline: 'The Global SaaS & FinTech Capital',
    companies: [
      { name: 'Zoho Corporation', domain: 'Enterprise SaaS & Cloud', link: '/company-explorer?city=Chennai' },
      { name: 'Freshworks', domain: 'Customer Engagement CRM', link: '/company-explorer?city=Chennai' },
      { name: 'Chargebee', domain: 'Subscription Billing SaaS', link: '/company-explorer?city=Chennai' },
      { name: 'Kissflow', domain: 'Low-Code Digital Workplace', link: '/company-explorer?city=Chennai' },
    ],
  },
  {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    tagline: 'Automotive Embedded, IoT & Azure Cloud Hub',
    companies: [
      { name: 'Bosch Global Software', domain: 'Automotive IoT & Mobility', link: '/company-explorer?city=Coimbatore' },
      { name: 'Kovai.co', domain: 'Enterprise Azure SaaS', link: '/company-explorer?city=Coimbatore' },
      { name: 'Payoda Technologies', domain: 'Digital Transformation & Cloud', link: '/company-explorer?city=Coimbatore' },
    ],
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    tagline: 'Silicon Valley of India • Startups & Tier-1 IT',
    companies: [
      { name: 'Infosys & Wipro', domain: 'Global IT Enterprise Consulting', link: '/company-explorer' },
      { name: 'Razorpay & Swiggy', domain: 'High-Velocity FinTech & Consumer Tech', link: '/company-explorer' },
    ],
  },
];

// 5 Editorial Chapters
const CHAPTERS = [
  { id: 'domains', number: '01', title: 'Technology Domains' },
  { id: 'roles', number: '02', title: 'Career Roles' },
  { id: 'companies', number: '03', title: 'Tech Hubs' },
  { id: 'platform', number: '04', title: 'Platform Architecture' },
  { id: 'gateway', number: '05', title: 'Discovery Gateway' },
];

export default function CompanyCareerDiscovery({ onOpenDemo }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const progressBarRef = useRef(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Mobile touch scroll state
  const mobileTrackRef = useRef(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // GSAP ScrollTrigger Horizontal Pinning & Direct Scrubbing
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let lastIndex = -1;

    // Use GSAP MatchMedia for clean responsive isolation
    const mm = gsap.matchMedia();

    // -------------------------------------------------------------------------
    // DESKTOP & LAPTOPS (>= 1024px): True Hokaido Horizontal Scroll
    // -------------------------------------------------------------------------
    mm.add('(min-width: 1024px)', () => {
      // Direct calculation of the total horizontal overflow distance
      const getScrollAmount = () => track.scrollWidth - window.innerWidth;

      // Single unified timeline for 100% synchronized, buttery-smooth scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2, // Continuous, liquid-silk scrub curve matching Hokaido
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          invalidateOnRefresh: true, // Recalculates dynamically on window resize
          anticipatePin: 1,
          fastScrollEnd: true,
          onUpdate: (self) => {
            // Direct DOM update for the progress bar without React re-render overhead
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }

            // Sync active chapter index
            const newIndex = Math.min(
              CHAPTERS.length - 1,
              Math.floor(self.progress * CHAPTERS.length + 0.05)
            );
            if (newIndex !== lastIndex) {
              lastIndex = newIndex;
              setActiveChapterIndex(newIndex);
            }
          },
        },
      });

      // Horizontal track translation
      tl.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
      }, 0);

      // Subtle Parallax effect on background numerical watermarks in the same timeline
      const watermarks = section.querySelectorAll('.horizontal-watermark');
      if (watermarks.length > 0) {
        tl.to(watermarks, {
          x: () => window.innerWidth * 0.15,
          ease: 'none',
        }, 0);
      }

      return () => {
        tl.kill();
      };
    });

    // Refresh after DOM layout stabilization
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(refreshTimer);
      mm.revert(); // Full GSAP cleanup, removes all pin spacers cleanly
    };
  }, []);

  // Mobile horizontal swipe synchronization
  const handleMobileScroll = (e) => {
    const target = e.target;
    const scrollLeft = target.scrollLeft;
    const cardWidth = target.clientWidth * 0.88;
    const newIdx = Math.round(scrollLeft / cardWidth);
    setMobileActiveIndex(Math.min(CHAPTERS.length - 1, Math.max(0, newIdx)));
  };

  return (
    <section id="discovery" className="relative bg-white text-neutral-950">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP GSAP PINNED HORIZONTAL SCROLL (HOKAIDO EXACT ARCHITECTURE)     */}
      {/* ========================================================================= */}
      <div
        ref={sectionRef}
        className="hidden lg:block relative w-full h-screen overflow-hidden bg-white select-none"
      >
        {/* --------------------------------------------------------------------- */}
        {/* TOP HUD: FIXED BRANDING + PASSIVE CHAPTER INDICATOR + SCROLL CUE      */}
        {/* (Purely passive readout — zero button clicks or arrow carousels)      */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute top-0 left-0 w-full h-16 px-8 xl:px-14 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between z-30">
          {/* Brand Tagline */}
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-neutral-950 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-neutral-950">
              CAMPUSCORPO / HORIZONTAL INTELLIGENCE
            </span>
          </div>

          {/* Passive Chapter Readout */}
          <div className="flex items-center gap-2">
            {CHAPTERS.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <div
                  key={ch.id}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                      : 'text-neutral-500 bg-neutral-100/70 font-medium'
                  }`}
                >
                  <span className="opacity-60">{ch.number}</span>
                  <span>{ch.title}</span>
                </div>
              );
            })}
          </div>

          {/* Scroll Notice */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>Scroll down to advance sections</span>
            <ArrowRight className="h-3.5 w-3.5 text-neutral-950 animate-pulse" />
          </div>
        </div>


        {/* --------------------------------------------------------------------- */}
        {/* CONTINUOUS HORIZONTAL TRACK: 5 VIEWPORT PANELS (WILL-CHANGE: TRANSFORM)*/}
        {/* --------------------------------------------------------------------- */}
        <div
          ref={trackRef}
          className="flex h-full flex-row flex-nowrap will-change-transform pt-16 pb-16"
        >

          {/* ===================================================================== */}
          {/* PANEL 1: EXPLORE IT DOMAINS                                           */}
          {/* ===================================================================== */}
          <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 xl:px-20 relative">
            {/* Parallax Numerical Watermark */}
            <span
              aria-hidden="true"
              className="horizontal-watermark absolute top-1/2 -translate-y-1/2 left-8 text-[220px] xl:text-[280px] font-black font-mono text-neutral-950/[0.035] select-none pointer-events-none leading-none -z-0"
            >
              01
            </span>

            <div className="w-full max-w-7xl relative z-10">
              <div className="flex items-end justify-between gap-6 mb-7 pb-5 border-b border-neutral-200/80">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 font-semibold">
                      CHAPTER 01 / TECHNOLOGY DOMAINS
                    </span>
                  </div>
                  <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-neutral-950">
                    16 Disciplines. Infinite Possibilities.
                  </h2>
                  <p className="mt-2 text-sm xl:text-base text-neutral-600 max-w-2xl">
                    Comprehensive skill roadmaps, toolchains, and verified career progression pathways across software engineering, artificial intelligence, cloud systems, and cybersecurity.
                  </p>
                </div>

                <Link
                  to="/career-explorer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold transition-all shadow-xs flex-shrink-0 group"
                >
                  <span>Explore All 16 Domains</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 6 High-Impact Domain Cards Grid (No nested scrollbars) */}
              <div className="grid grid-cols-6 gap-3.5">
                {itDomainsData.slice(0, 6).map((domain) => {
                  const IconComp = DOMAIN_ICONS[domain.id] || Code2;
                  return (
                    <Link
                      key={domain.id}
                      to={`/career-explorer?domain=${domain.id}`}
                      className="p-4 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] hover:bg-white hover:border-neutral-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="h-9 w-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-950 leading-snug">
                          {domain.title}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                          {domain.tagline}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                        <span>{domain.roles.length} Roles</span>
                        <span className="font-semibold text-neutral-950 group-hover:translate-x-0.5 transition-transform">
                          View →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Secondary 10 Domains Strip */}
              <div className="mt-5 pt-3.5 border-t border-neutral-200/80 flex items-center gap-2 text-xs text-neutral-600">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mr-2">
                  Also Included:
                </span>
                {itDomainsData.slice(6).map((d, i) => (
                  <span key={d.id} className="inline-flex items-center gap-1.5">
                    <Link
                      to={`/career-explorer?domain=${d.id}`}
                      className="hover:text-neutral-950 hover:underline font-medium"
                    >
                      {d.title}
                    </Link>
                    {i < itDomainsData.slice(6).length - 1 && <span className="text-neutral-300">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>


          {/* ===================================================================== */}
          {/* PANEL 2: CAREER OPPORTUNITIES & ROLES                                 */}
          {/* ===================================================================== */}
          <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 xl:px-20 relative">
            {/* Parallax Numerical Watermark */}
            <span
              aria-hidden="true"
              className="horizontal-watermark absolute top-1/2 -translate-y-1/2 left-8 text-[220px] xl:text-[280px] font-black font-mono text-neutral-950/[0.035] select-none pointer-events-none leading-none -z-0"
            >
              02
            </span>

            <div className="w-full max-w-7xl relative z-10">
              <div className="flex items-end justify-between gap-6 mb-7 pb-5 border-b border-neutral-200/80">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 font-semibold">
                      CHAPTER 02 / CAREER OPPORTUNITIES
                    </span>
                  </div>
                  <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-neutral-950">
                    Engineered for Real Industry Roles.
                  </h2>
                  <p className="mt-2 text-sm xl:text-base text-neutral-600 max-w-2xl">
                    Inspect day-to-day engineering responsibilities, requisite technical toolchains, and structured career progression ladders across key technical disciplines.
                  </p>
                </div>

                <Link
                  to="/career-explorer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold transition-all shadow-xs flex-shrink-0 group"
                >
                  <span>Explore All Roles</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 3 Detailed Engineering Dossiers */}
              <div className="grid grid-cols-3 gap-5">
                {FEATURED_ROLES.slice(0, 3).map((role) => {
                  const IconComp = role.icon;
                  return (
                    <div
                      key={role.title}
                      className="p-6 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] hover:bg-white hover:border-neutral-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="text-xs font-mono font-bold text-neutral-400">
                            {role.number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-neutral-200/80 text-[10px] font-mono text-neutral-700 font-semibold">
                            {role.domainName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="h-8 w-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center flex-shrink-0">
                            <IconComp className="h-4 w-4" />
                          </div>
                          <h3 className="text-lg font-bold text-neutral-950">
                            {role.title}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                          {role.description}
                        </p>

                        {/* Tech Stack Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {role.skills.map((sk) => (
                            <span
                              key={sk}
                              className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-[11px] font-mono text-neutral-700"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3.5 border-t border-neutral-200/60">
                        <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">
                          Career Progression
                        </div>
                        <div className="text-xs font-semibold text-neutral-900 truncate mb-2.5">
                          {role.trajectory}
                        </div>
                        <Link
                          to={`/career-explorer?domain=${role.domainId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-950 hover:underline group"
                        >
                          <span>View Role Blueprint</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Secondary Specialized Roles Strip */}
              <div className="mt-5 pt-3.5 border-t border-neutral-200/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  More Specialized Tracks:
                </span>
                <div className="flex items-center gap-4 text-neutral-700 font-medium">
                  {FEATURED_ROLES.slice(3).map((r) => (
                    <Link
                      key={r.title}
                      to={`/career-explorer?domain=${r.domainId}`}
                      className="hover:text-neutral-950 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{r.title}</span>
                      <ArrowUpRight className="h-3 w-3 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* ===================================================================== */}
          {/* PANEL 3: FEATURED CORPORATE PARTNERS & TECH HUBS                      */}
          {/* ===================================================================== */}
          <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 xl:px-20 relative">
            {/* Parallax Numerical Watermark */}
            <span
              aria-hidden="true"
              className="horizontal-watermark absolute top-1/2 -translate-y-1/2 left-8 text-[220px] xl:text-[280px] font-black font-mono text-neutral-950/[0.035] select-none pointer-events-none leading-none -z-0"
            >
              03
            </span>

            <div className="w-full max-w-7xl relative z-10">
              <div className="flex items-end justify-between gap-6 mb-7 pb-5 border-b border-neutral-200/80">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 font-semibold">
                      CHAPTER 03 / CORPORATE LANDSCAPE
                    </span>
                  </div>
                  <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-neutral-950">
                    Connect With Premier Technology Employers.
                  </h2>
                  <p className="mt-2 text-sm xl:text-base text-neutral-600 max-w-2xl">
                    Discover leading corporate recruiters, enterprise SaaS unicorns, and global technology delivery centers across South India's high-velocity engineering corridors.
                  </p>
                </div>

                <Link
                  to="/company-explorer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold transition-all shadow-xs flex-shrink-0 group"
                >
                  <span>Explore All Companies</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Tech Hub Columns */}
              <div className="grid grid-cols-3 gap-5">
                {TECH_HUBS.map((hub) => (
                  <div
                    key={hub.city}
                    className="p-6 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-neutral-950 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-neutral-700" />
                          {hub.city}
                        </h3>
                        <span className="text-xs font-mono text-neutral-400">
                          {hub.state}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 mb-3.5">
                        {hub.tagline}
                      </p>

                      <div className="space-y-2">
                        {hub.companies.map((comp) => (
                          <Link
                            key={comp.name}
                            to={comp.link}
                            className="block p-3 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-300 hover:shadow-2xs transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-950 group-hover:text-neutral-800">
                                {comp.name}
                              </span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                              {comp.domain}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200/60">
                      <Link
                        to={`/company-explorer?city=${hub.city}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-950 hover:underline"
                      >
                        <span>View {hub.city} Corporate Directory</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footnote */}
              <div className="mt-5 pt-3.5 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500 font-mono">
                <span>Direct recruiter application portals & verified corporate profiles</span>
                <span className="font-semibold text-neutral-950">5 Cities • 20+ Profiled Partners</span>
              </div>
            </div>
          </div>


          {/* ===================================================================== */}
          {/* PANEL 4: INSTITUTIONAL PLATFORM ARCHITECTURE                          */}
          {/* ===================================================================== */}
          <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 xl:px-20 relative">
            {/* Parallax Numerical Watermark */}
            <span
              aria-hidden="true"
              className="horizontal-watermark absolute top-1/2 -translate-y-1/2 left-8 text-[220px] xl:text-[280px] font-black font-mono text-neutral-950/[0.035] select-none pointer-events-none leading-none -z-0"
            >
              04
            </span>

            <div className="w-full max-w-7xl relative z-10">
              <div className="flex items-end justify-between gap-6 mb-7 pb-5 border-b border-neutral-200/80">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 font-semibold">
                      CHAPTER 04 / INSTITUTIONAL PLATFORM
                    </span>
                  </div>
                  <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-neutral-950">
                    The Complete Higher-Ed Operating System.
                  </h2>
                  <p className="mt-2 text-sm xl:text-base text-neutral-600 max-w-2xl">
                    Unifying academic administration, faculty mentorship, timed coding assessments, and placement automation onto one cohesive institutional core.
                  </p>
                </div>

                <Link
                  to="/platform"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold transition-all shadow-xs flex-shrink-0 group"
                >
                  <span>Explore Platform Architecture</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* 4 Core Pillars Grid */}
              <div className="grid grid-cols-2 gap-5">
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-neutral-950">Placement Management Hub</h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                        91.8% Conversion
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Automated student eligibility filtering by CGPA & backlogs, corporate partner ATS coordination, and multi-round interview tracking.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-neutral-950">Student 360° Digital Record</h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                        Single Record
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Centralize academic credentials, verified programming competencies, coding test percentiles, and generate ATS-compliant dynamic resumes.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-neutral-950">Coding Assessment Sandbox</h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                        10+ Languages
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Timed programming challenges with automated unit test execution, edge-case validation, memory profiling, and percentile analytics.
                    </p>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="p-5 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-neutral-950">Faculty & Mentorship Workbench</h3>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                        LMS Aligned
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Subject-specific course code allocations, class advisor mentorship logs, continuous attendance tracking, and syllabus verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="mt-5 pt-3.5 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500 font-mono">
                <span>Role-Based Access for Principals, TPOs, Faculty Advisors & Students</span>
                <Link to="/platform" className="font-bold text-neutral-950 hover:underline">
                  View Architecture Diagram →
                </Link>
              </div>
            </div>
          </div>


          {/* ===================================================================== */}
          {/* PANEL 5: DISCOVERY GATEWAY & LAUNCHPAD                                */}
          {/* ===================================================================== */}
          <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 xl:px-20 relative">
            {/* Parallax Numerical Watermark */}
            <span
              aria-hidden="true"
              className="horizontal-watermark absolute top-1/2 -translate-y-1/2 left-8 text-[220px] xl:text-[280px] font-black font-mono text-neutral-950/[0.035] select-none pointer-events-none leading-none -z-0"
            >
              05
            </span>

            <div className="w-full max-w-5xl relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <div className="inline-flex items-center gap-2 mb-2.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-600 font-semibold">
                    DISCOVERY GATEWAY / 05
                  </span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-neutral-950">
                  Accelerate Your Campus Transformation.
                </h2>
                <p className="mt-2 text-sm xl:text-base text-neutral-600">
                  Whether you are an aspiring student charting your engineering career or an institution seeking modern placement automation.
                </p>
              </div>

              {/* Dual Action Cards */}
              <div className="grid grid-cols-2 gap-6">
                {/* Student Pathway */}
                <div className="p-7 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                      For Students & Job Seekers
                    </span>
                    <h3 className="text-xl font-bold text-neutral-950 mb-2">
                      Explore Career Paths & Companies
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                      Access verified curriculum roadmaps across 16 domains, review salary benchmarks, and discover hiring companies by city.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to="/career-explorer"
                      className="flex-1 py-3 px-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-bold text-neutral-950 text-center transition-colors shadow-2xs"
                    >
                      Career Domains
                    </Link>
                    <Link
                      to="/company-explorer"
                      className="flex-1 py-3 px-4 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold text-center transition-colors shadow-2xs"
                    >
                      IT Companies
                    </Link>
                  </div>
                </div>

                {/* Institutional Pathway */}
                <div className="p-7 rounded-2xl border border-neutral-200/90 bg-[#FAFAFA] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                      For Institutions & TPOs
                    </span>
                    <h3 className="text-xl font-bold text-neutral-950 mb-2">
                      Schedule Platform Demonstration
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                      Speak with our academic technology team to see how CampusCorpo automates placements, assessments, and student records.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenDemo}
                      className="flex-1 py-3 px-4 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Schedule Demo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      to="/platform"
                      className="flex-1 py-3 px-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs font-bold text-neutral-950 text-center transition-colors shadow-2xs"
                    >
                      View Platform
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trust Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-neutral-700" />
                  100% Student Data Privacy & GDPR Compliant
                </span>
                <span>SOC 2 Ready Architecture • Real-Time Placement Analytics</span>
              </div>
            </div>
          </div>

        </div>


        {/* --------------------------------------------------------------------- */}
        {/* BOTTOM HUD: STATUS TRACKER + PROGRESS BAR + PERCENTAGE INDICATOR      */}
        {/* (Zero buttons or manual controls — updates directly as user scrolls)  */}
        {/* --------------------------------------------------------------------- */}
        <div className="absolute bottom-0 left-0 w-full h-16 px-8 xl:px-14 border-t border-neutral-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between z-30">
          {/* Section Counter */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-neutral-950">
              SECTION {CHAPTERS[activeChapterIndex]?.number} OF 05
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-semibold text-neutral-600">
              {CHAPTERS[activeChapterIndex]?.title}
            </span>
          </div>

          {/* Direct Scrub Progress Bar (scaleX driven directly by GSAP onUpdate) */}
          <div className="w-64 xl:w-96 h-1 bg-neutral-200 rounded-full overflow-hidden relative">
            <div
              ref={progressBarRef}
              className="absolute inset-0 bg-neutral-950 origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          {/* Completion Status */}
          <div className="text-xs font-mono text-neutral-500">
            <span className="font-bold text-neutral-950">
              {Math.round((activeChapterIndex + 1) * 20)}%
            </span>
            <span className="ml-1 text-neutral-400">completed</span>
          </div>
        </div>

      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE / TABLET TOUCH-BASED HORIZONTAL SCROLLING EXPERIENCE           */}
      {/* (Natural horizontal swipe track with snap alignment, no scroll lock traps)*/}
      {/* ========================================================================= */}
      <div className="block lg:hidden py-16 px-4 sm:px-6">
        
        {/* Mobile Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-500 font-semibold">
              HORIZONTAL DISCOVERY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Where Education Meets Industry.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Swipe horizontally across the panels below to explore domains, career roles, tech hubs, and platform architecture.
          </p>

          {/* Chapter Breadcrumbs */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CHAPTERS.map((ch, idx) => (
              <span
                key={ch.id}
                className={`px-3 py-1 rounded-lg text-xs font-mono flex-shrink-0 transition-colors ${
                  mobileActiveIndex === idx
                    ? 'bg-neutral-950 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {ch.number} {ch.title}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Touch Horizontal Track */}
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none -mx-4 px-4 scroll-smooth"
        >

          {/* Mobile Panel 1: Domains */}
          <div className="snap-start w-[88vw] max-w-[390px] flex-shrink-0 p-6 rounded-2xl border border-neutral-200 bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">01 / IT DOMAINS</span>
              <h3 className="text-xl font-bold text-neutral-950">16 Technology Domains</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed mb-4">
                Structured curriculum blueprints for software engineering, AI, and cloud infrastructure.
              </p>

              <div className="space-y-2">
                {itDomainsData.slice(0, 4).map((d) => {
                  const Icon = DOMAIN_ICONS[d.id] || Code2;
                  return (
                    <Link
                      key={d.id}
                      to={`/career-explorer?domain=${d.id}`}
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded bg-neutral-950 text-white flex items-center justify-center">
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-bold text-neutral-950">{d.title}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-neutral-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80">
              <Link
                to="/career-explorer"
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>View All 16 Domains</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Panel 2: Roles */}
          <div className="snap-start w-[88vw] max-w-[390px] flex-shrink-0 p-6 rounded-2xl border border-neutral-200 bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">02 / CAREER ROLES</span>
              <h3 className="text-xl font-bold text-neutral-950">Industry Career Profiles</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed mb-4">
                Verified responsibilities, requisite toolchains, and career trajectories.
              </p>

              <div className="space-y-2.5">
                {FEATURED_ROLES.slice(0, 3).map((r) => (
                  <div key={r.title} className="p-3 bg-white rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-950">{r.title}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{r.domainName}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-1">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80">
              <Link
                to="/career-explorer"
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Explore All Career Roles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Panel 3: Tech Hubs */}
          <div className="snap-start w-[88vw] max-w-[390px] flex-shrink-0 p-6 rounded-2xl border border-neutral-200 bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">03 / TECH HUBS</span>
              <h3 className="text-xl font-bold text-neutral-950">Top Regional Hubs</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed mb-4">
                Premier corporate employers across South India's software tech corridors.
              </p>

              <div className="space-y-2">
                <Link
                  to="/company-explorer?city=Chennai"
                  className="p-3 bg-white rounded-xl border border-neutral-200 block"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-950">
                    <span>Chennai Tech Hub</span>
                    <span>Zoho, Freshworks →</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Global SaaS Capital</span>
                </Link>

                <Link
                  to="/company-explorer?city=Coimbatore"
                  className="p-3 bg-white rounded-xl border border-neutral-200 block"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-950">
                    <span>Coimbatore Tech Hub</span>
                    <span>Bosch, Kovai.co →</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Automotive IoT & Azure</span>
                </Link>

                <Link
                  to="/company-explorer"
                  className="p-3 bg-white rounded-xl border border-neutral-200 block"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-950">
                    <span>Bengaluru & All Hubs</span>
                    <span>Infosys, Wipro →</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Tier-1 Technology Ecosystem</span>
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80">
              <Link
                to="/company-explorer"
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Launch Company Explorer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Panel 4: Platform */}
          <div className="snap-start w-[88vw] max-w-[390px] flex-shrink-0 p-6 rounded-2xl border border-neutral-200 bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">04 / PLATFORM</span>
              <h3 className="text-xl font-bold text-neutral-950">Campus Operating Core</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed mb-4">
                Automating placements, coding tests, and student records.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-neutral-700 flex-shrink-0" />
                  <span className="font-semibold text-neutral-950">Placement Automation Hub</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-neutral-700 flex-shrink-0" />
                  <span className="font-semibold text-neutral-950">Student 360° Digital Record</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 flex items-center gap-2.5">
                  <Code2 className="h-4 w-4 text-neutral-700 flex-shrink-0" />
                  <span className="font-semibold text-neutral-950">Online Coding Assessment Sandbox</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80">
              <Link
                to="/platform"
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>View Full Platform</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Panel 5: Gateway & Demo */}
          <div className="snap-start w-[88vw] max-w-[390px] flex-shrink-0 p-6 rounded-2xl border border-neutral-200 bg-[#FAFAFA] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400 block mb-2">05 / GET STARTED</span>
              <h3 className="text-xl font-bold text-neutral-950">Elevate Your Campus</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed mb-4">
                Connect with our academic solutions team to schedule an interactive institutional demonstration.
              </p>

              <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs font-mono text-neutral-600 space-y-1">
                <div>✓ 100% Student Data Privacy</div>
                <div>✓ SOC 2 Ready Architecture</div>
                <div>✓ Real-Time Placement Analytics</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200/80 space-y-2">
              <button
                type="button"
                onClick={onOpenDemo}
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Institutional Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Link
                to="/career-explorer"
                className="w-full py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Explore Tech Roadmaps</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Swipe Indicators */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {CHAPTERS.map((ch, idx) => (
            <span
              key={ch.id}
              className={`h-1.5 rounded-full transition-all ${
                mobileActiveIndex === idx ? 'w-6 bg-neutral-950' : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
