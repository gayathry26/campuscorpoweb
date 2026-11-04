import React from 'react';
import { motion } from 'framer-motion';
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

export default function Hero({ onOpenDemo }) {
  const scrollToEcosystem = (e) => {
    e.preventDefault();
    const el = document.getElementById('campus-ecosystem');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* Subtle SaaS Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Hero Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Top Category Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-neutral-50/90 text-xs sm:text-sm font-medium text-neutral-800 shadow-2xs">
              <img src="/campuscorpo-mark.png" alt="CampusCorpo Emblem" className="h-4 w-4 object-contain" />
              <span>Enterprise Institutional &amp; Career Platform</span>
            </div>
          </motion.div>

          {/* Main Headline (Standardized 36–42px) */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-[42px] font-bold text-neutral-950 tracking-tight leading-[1.12]"
          >
            One Platform.<br />
            <span>Complete Campus Management.</span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Unify academic operations, student development, technical assessments and corporate placements in one connected campus-to-career ecosystem.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-xl shadow-md transition-all group"
            >
              <span>Request a Demo</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.a
              href="/platform"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs transition-colors"
            >
              Explore Platform
            </motion.a>
          </motion.div>

          {/* Core Pillars */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-neutral-500 font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Placement Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Student &amp; Faculty Portals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Semester LMS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-950" />
              <span>Coding Labs &amp; Mock Interviews</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Realistic CampusCorpo Product Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 sm:mt-18 relative max-w-6xl mx-auto"
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
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
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
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
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
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
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
                  <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
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
                  <div className="col-span-2 md:col-span-1 lg:col-span-1 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-900 transition-colors">
                    <div className="flex items-center justify-between text-neutral-600 text-xs sm:text-[13px] font-medium">
                      <span>Coding Pass Rate</span>
                      <Code2 className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-[28px] font-bold text-neutral-950 tracking-tight leading-none">
                      <AnimatedCounter to={94.2} decimals={1} suffix="%" />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      18,420 test submissions
                    </div>
                  </div>

                </div>

                {/* Split Panel: Institutional Operations & Real-Time Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* Left Column: Academic & LMS Sync Status (7 Cols) */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-950" />
                        <span className="text-sm sm:text-[15px] font-bold text-neutral-950">Semester Academic &amp; LMS Course Mapping</span>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200">
                        Semester VI • Section A
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-[13px]">
                      <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200">
                        <div className="text-neutral-500 font-medium">Course Code Allocations</div>
                        <div className="font-semibold text-neutral-900 mt-1 text-sm">7 Subjects + 1 Class Advisor</div>
                        <div className="mt-2 text-xs text-neutral-600 font-mono">
                          8 faculty assigned with specific study notes &amp; quizzes
                        </div>
                      </div>

                      <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200">
                        <div className="text-neutral-500 font-medium">Placement Eligibility Index</div>
                        <div className="font-semibold text-emerald-600 mt-1 text-sm flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          920 of 980 eligible for Tier 1
                        </div>
                        <div className="mt-2 text-xs text-neutral-600 font-mono">
                          &ge; 7.5 CGPA &amp; 0 standing arrears
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar of Batch Completion */}
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <div className="flex justify-between text-xs sm:text-[13px] text-neutral-600 mb-1.5">
                        <span className="font-medium">Curriculum &amp; Placement Readiness Milestone</span>
                        <span className="font-mono font-bold text-neutral-950">94.8% Synced</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-950 h-full rounded-full transition-all duration-1000" style={{ width: '94.8%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recent Institutional Activities (5 Cols) */}
                  <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-neutral-950" />
                          <span className="text-sm sm:text-[15px] font-bold text-neutral-950">Recent Institutional Activities</span>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>

                      <div className="mt-3 space-y-2.5 text-xs sm:text-[13px]">
                        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                          <Briefcase className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-neutral-950 text-xs sm:text-[13px]">Zoho Drive Shortlist Published</div>
                            <div className="text-xs text-neutral-600 mt-0.5">142 candidates qualified for round 2 technical interviews</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                          <Code2 className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-neutral-950 text-xs sm:text-[13px]">Department Coding Test Evaluated</div>
                            <div className="text-xs text-neutral-600 mt-0.5">420 submissions benchmarked on LC-204 algorithms</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                          <GraduationCap className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-neutral-950 text-xs sm:text-[13px]">Semester Faculty Mapping Updated</div>
                            <div className="text-xs text-neutral-600 mt-0.5">CS8491 Distributed Systems assigned to Dr. S. Ramanathan</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                      Real-time synchronized across admin, faculty, and placement units.
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
          
          <p className="mt-3 text-center text-xs text-neutral-400">
            Sample platform operations console (Illustrative Demo Figures). Architecture engineered for university and higher education administration.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
