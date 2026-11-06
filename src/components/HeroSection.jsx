import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Building2, 
  ShieldCheck, 
  Activity,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

/**
 * HeroSection — Reusable, High-Precision Editorial Hero Component for CampusCorpo
 * Incorporates MinimalGoods line-by-line heading reveals and institutional dashboard preview.
 */
export default function HeroSection({ onOpenDemo }) {
  const heroRef = useRef(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Initial Page Entrance Sequence (MinimalGoods staggered typography)
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Badge entrance
      tl.fromTo(
        '.hero-badge',
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, delay: 0.05 }
      );

      // Line-by-line heading reveal through overflow-hidden masks
      tl.fromTo(
        '.hero-heading-line',
        { y: '105%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.85, stagger: 0.12 },
        '-=0.4'
      );

      // Supporting description
      tl.fromTo(
        '.hero-desc',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.5'
      );

      // CTA buttons
      tl.fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.5'
      );

      // Core pillars list
      tl.fromTo(
        '.hero-pillar-item',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
        '-=0.4'
      );

      // Dashboard browser frame mask-reveal
      tl.fromTo(
        dashboardRef.current,
        { scale: 0.94, y: 45, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.95, ease: 'power3.out' },
        '-=0.6'
      );

      // Dashboard inner metric cards stagger
      tl.fromTo(
        '.hero-metric-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 },
        '-=0.5'
      );

      // 2. Scroll-Linked Parallax & Scale Scrub into Section 2
      gsap.to(dashboardRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: -35,
        scale: 0.985,
        ease: 'none',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* Subtle SaaS Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Hero Header */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Category Badge */}
          <div className="hero-badge flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-neutral-50/90 text-xs sm:text-sm font-medium text-neutral-800 shadow-2xs">
              <img src="/campuscorpo-mark.png" alt="CampusCorpo Emblem" className="h-4 w-4 object-contain" />
              <span>Enterprise Institutional &amp; Career Platform</span>
            </div>
          </div>

          {/* Main Headline (Line-by-line reveal masks inspired by MinimalGoods) */}
          <h1 className="text-4xl sm:text-5xl lg:text-[44px] font-bold text-neutral-950 tracking-tight leading-[1.12]">
            <span className="block overflow-hidden pb-1">
              <span className="hero-heading-line block">One Platform.</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="hero-heading-line block text-neutral-900">Complete Campus Management.</span>
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="hero-desc mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Unify academic operations, student development, technical assessments and corporate placements in one connected campus-to-career ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <span>Request a Demo</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="/platform"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs hover:border-neutral-400 transition-colors"
            >
              Explore Platform
            </a>
          </div>

          {/* Core Pillars */}
          <div className="hero-pillars mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-neutral-500 font-medium">
            <div className="hero-pillar-item flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Placement Management</span>
            </div>
            <div className="hero-pillar-item flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Student &amp; Faculty Portals</span>
            </div>
            <div className="hero-pillar-item flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Semester LMS</span>
            </div>
            <div className="hero-pillar-item flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Coding Labs &amp; Mock Interviews</span>
            </div>
          </div>
        </div>

        {/* Realistic CampusCorpo Product Dashboard (Mask reveal + Scroll-linked parallax) */}
        <div 
          ref={dashboardRef}
          className="mt-14 sm:mt-18 relative max-w-6xl mx-auto will-change-transform"
        >
          <div className="relative rounded-2xl p-2 sm:p-3 bg-neutral-100 border border-neutral-200/90 shadow-2xl">
            <div className="rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-inner">
              
              {/* Dashboard Browser Frame Header */}
              <div className="bg-neutral-50/90 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-neutral-300 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-neutral-300 inline-block" />
                  <div className="ml-3 flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-neutral-200">
                    <img src="/campuscorpo-mark.png" alt="CampusCorpo" className="h-3.5 w-3.5 object-contain" />
                    <span className="text-xs font-mono text-neutral-600 hidden sm:inline-block">
                      app.campuscorpo.com/command-center
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">Term 2026-27 Active</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-800 bg-neutral-200/70 px-2.5 py-0.5 rounded-md hidden md:inline-block">
                    Institutional Console
                  </span>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 sm:p-6 lg:p-8 bg-[#fafafa]">
                
                {/* 5 Core Metrics specified by ICP */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  
                  {/* 1. Total Students */}
                  <div className="hero-metric-card bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Total Students</span>
                      <Users className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={4850} />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      6 Engineering &amp; Tech wings
                    </div>
                  </div>

                  {/* 2. Placement Progress */}
                  <div className="hero-metric-card bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Placement Progress</span>
                      <TrendingUp className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={91.8} decimals={1} suffix="%" />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      842 offers verified
                    </div>
                  </div>

                  {/* 3. Faculty Activities */}
                  <div className="hero-metric-card bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Faculty Activities</span>
                      <GraduationCap className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={142} /> <span className="text-xs font-normal text-neutral-500">faculty</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      98.4% syllabus milestones
                    </div>
                  </div>

                  {/* 4. Active Placement Drives */}
                  <div className="hero-metric-card bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Active Drives</span>
                      <Briefcase className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={18} /> <span className="text-xs font-semibold text-emerald-600">+4 this week</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Zoho, Bosch, Freshworks...
                    </div>
                  </div>

                  {/* 5. Assessment Performance */}
                  <div className="hero-metric-card col-span-2 md:col-span-1 lg:col-span-1 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Coding Pass Rate</span>
                      <Code2 className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={94.2} decimals={1} suffix="%" />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Top 5th percentile
                    </div>
                  </div>

                </div>

                {/* Live Operations & Audit Table Row */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200/80 gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-neutral-950" />
                      <span className="text-xs sm:text-sm font-bold text-neutral-950">Active Placement Drives &amp; Live Shortlists</span>
                    </div>
                    <span className="text-xs font-mono text-neutral-500">Updated 2 minutes ago • Automated ATS Feed</span>
                  </div>
                  
                  <div className="divide-y divide-neutral-100 text-xs sm:text-sm">
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-neutral-900">Zoho Corporation</span>
                        <span className="text-neutral-500 text-xs hidden md:inline">Software Development • Round 2 Coding Test</span>
                      </div>
                      <span className="font-mono text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">142 Eligible Students</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-neutral-900">Freshworks</span>
                        <span className="text-neutral-500 text-xs hidden md:inline">Product Engineering • Final HR Round</span>
                      </div>
                      <span className="font-mono text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">38 Shortlisted</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

