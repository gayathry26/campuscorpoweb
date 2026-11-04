import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  GraduationCap,
  Shield,
  BookOpen,
  Code2,
  MessageSquareText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Database,
  Lock,
  Terminal,
  Volume2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';
import { codingAssessmentMockData, mockInterviewMockData } from '../data/websiteData';
import { fadeUp, standardViewport, PREMIUM_EASE } from '../utils/animations';

export default function PlatformPage({ onOpenDemo }) {
  const seo = routesSEO.platform;
  const location = useLocation();

  // Smooth scroll to anchor on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  const navItems = [
    { label: 'Placement', href: '#placement' },
    { label: 'Student 360°', href: '#student-management' },
    { label: 'Faculty', href: '#faculty-management' },
    { label: 'Administration', href: '#administration' },
    { label: 'Semester LMS', href: '#lms' },
    { label: 'Coding Labs', href: '#coding-assessment' },
    { label: 'Mock Interviews', href: '#mock-interviews' }
  ];

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
        <Breadcrumb items={[{ name: 'Platform', href: '/platform' }]} />

        {/* Page Hero */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="py-12 md:py-16 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Complete Institutional Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18]">
            One Platform. Complete Campus Management.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            CampusCorpo connects academic operations, student skill verification, semester curriculum delivery, and corporate placement recruiting in one connected software ecosystem.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              Request an Institutional Demo
            </motion.button>
            <motion.a
              href="#placement"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-semibold transition-all"
            >
              Explore Modules Below ↓
            </motion.a>
          </div>
        </motion.div>

        {/* Sticky Anchor Navigation Bar */}
        <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md py-3 border-y border-neutral-200 mb-16 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CATEGORY 1: INSTITUTIONAL MANAGEMENT */}
        {/* ========================================================================= */}
        <div className="space-y-24">

          <div className="border-b border-neutral-200 pb-4">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Category 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight mt-1">
              Institutional Management Systems
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-1 font-normal">
              Unified administration, student portfolios, semester classrooms, and corporate placement operations.
            </p>
          </div>

          {/* Module 1: Placement Management */}
          <motion.section 
            id="placement" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Module 01</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Placement Management
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  T&amp;P Command Console
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Eliminate chaotic spreadsheets. Automate student eligibility filtering, corporate partner communications, drive test slots, shortlisting loops, and real-time placement conversion analytics.
              </p>

              {/* Interface Preview: Corporate Drive Pipeline */}
              <div className="my-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-wrap justify-between items-center text-sm pb-4 border-b border-neutral-100 gap-2">
                  <span className="font-semibold text-neutral-950 text-base">Active Placement Drive Pipeline: Zoho Corporation (SaaS)</span>
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md font-semibold text-xs sm:text-[13px] border border-emerald-200">
                    Drive #2026-018 Online • Round 2 In Progress
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5 text-center">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Eligible</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">910</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Applied</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">724</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Shortlisted</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">142</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Verified Offers</div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">38</div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-neutral-800 font-medium flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">CTC Benchmark: ₹8.4 LPA • Location: Chennai</span>
                  <span className="text-neutral-500">Sample operations preview data</span>
                </div>
              </div>

              {/* 5 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Dynamic eligibility rules based on CGPA, standing arrears &amp; department branches</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>End-to-end recruitment drive scheduling, test venue mapping &amp; candidate slotting</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>ATS-style application tracking with recruiter feedback logging per round</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Verified offer letter tracking, CTC benchmarking &amp; institutional dual-offer policy controls</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal sm:col-span-2">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>One-click department-wise and company-wise placement conversion analytics</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Available across all enterprise campus tiers</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Placement Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Module 2: Student 360 Management */}
          <motion.section 
            id="student-management" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Module 02</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Student 360° Management
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Digital Student Portfolios
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Centralize student records into verifiable career portfolios that recruiters trust. Consolidates academic histories, semester marks, verified coding test submissions, mock ratings, and dream-tier placement eligibility.
              </p>

              {/* Interface Preview: Student Portfolio */}
              <div className="my-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-100 gap-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-950 text-white font-bold text-sm flex items-center justify-center">
                      AK
                    </div>
                    <div>
                      <div className="font-bold text-neutral-950 text-base">Ananya Krishnan (Roll: 22CS104)</div>
                      <div className="text-neutral-600 text-xs sm:text-[13px]">B.E. Computer Science &amp; Engineering • Semester VI</div>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-[13px] px-3 py-1 rounded-md font-semibold">
                    Tier-1 Dream Eligible (&gt;10 LPA)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Cumulative CGPA</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">8.84</div>
                    <div className="text-neutral-500 text-xs mt-1">0 Active Arrears • Verified</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Coding Benchmark</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">Top 5% Percentile</div>
                    <div className="text-neutral-500 text-xs mt-1">18 Challenges • 94.2% Accuracy</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-semibold uppercase tracking-wider">Mock Interview Rating</div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">4.7 / 5.0 (Cleared)</div>
                    <div className="text-neutral-500 text-xs mt-1">Technical &amp; HR Complete</div>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs sm:text-sm text-neutral-800 flex items-center justify-between">
                  <span className="font-medium">Verified Technical Matrix: Data Structures, Node.js, PostgreSQL, Distributed Systems</span>
                  <span className="text-neutral-500 font-mono text-xs">Profile Synced</span>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Single source of truth student profiles with academic grades, attendance &amp; milestones</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Automated skill verification badges mapped from real programming challenges</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Tiered placement eligibility classification (Dream, Super Dream, Core &amp; IT Services)</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Exportable digital student resume portfolios with verified credential locks</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Student information system &amp; portfolio module</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Student Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Module 3: Faculty Management */}
          <motion.section 
            id="faculty-management" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Module 03</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Faculty Management &amp; Mentorship
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Academic Workbench
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Coordinate teaching workloads, course code assignments, class advisor duties, student mentorship logs, and automated syllabus completion tracking in one organized workspace.
              </p>

              {/* Interface Preview: Faculty Academic Workbench */}
              <div className="my-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-3.5 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                  <span className="font-bold text-neutral-950 text-base">Dr. S. Ramanathan (Professor, Computer Science)</span>
                  <span className="text-neutral-600 text-xs sm:text-[13px] font-medium">Odd Term 2026-27 Active</span>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-neutral-900 text-base">Course: CS8491 Distributed Systems (4 Credits)</span>
                      <div className="text-xs sm:text-[13px] text-neutral-600 mt-0.5">62 Students Enrolled • 14 Study Materials Published</div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md font-semibold text-xs sm:text-[13px] border border-emerald-200">
                      98% Syllabus Synced
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-neutral-900 text-base">Designated Class Advisor Duty (Section A)</span>
                      <div className="text-xs sm:text-[13px] text-neutral-600 mt-0.5">Mentorship Logs &amp; Arrear Tracking Active</div>
                    </div>
                    <span className="text-neutral-800 bg-neutral-200/70 px-3 py-1 rounded-md font-semibold text-xs sm:text-[13px]">
                      Advisory Complete
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Direct course code allocation mapping teachers to departmental classrooms</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Dedicated class advisor mentorship logs and cohort attendance monitoring</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Automated syllabus completion progress tracking and study material uploads</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Online objective quiz grading and assignment review pipelines</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Faculty workload balancing &amp; teaching module</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Faculty Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Module 4: Administration & RBAC */}
          <motion.section 
            id="administration" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Module 04</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Administration &amp; RBAC Controls
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Governance Console
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Govern multi-branch academic departments, institutional calendars, batch migrations, and role permissions with enterprise-grade security and fast bulk data ingestion.
              </p>

              {/* Interface Preview: Ingestion & RBAC Pipeline */}
              <div className="my-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                  <span className="font-bold text-neutral-950 text-base">Multi-Branch Department &amp; Security Pipeline</span>
                  <span className="text-xs sm:text-[13px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold border border-emerald-200">100% Role Isolation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <FileSpreadsheet className="w-5 h-5 mx-auto text-neutral-800 mb-1.5" />
                    <div className="font-bold text-neutral-900 text-base">Excel / CSV Parser</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Bulk Student Master Sync</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <Database className="w-5 h-5 mx-auto text-neutral-800 mb-1.5" />
                    <div className="font-bold text-neutral-900 text-base">JSON Schema Mapping</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Regulations &amp; Electives</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <Lock className="w-5 h-5 mx-auto text-neutral-800 mb-1.5" />
                    <div className="font-bold text-neutral-900 text-base">Audit Semester Freeze</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Tamper-Proof Lockdowns</div>
                  </div>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Multi-department hierarchy (Engineering, Arts &amp; Science, Polytechnic)</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Granular Role-Based Access Control (Principal, Dean, HOD, Faculty, TPO, Recruiter)</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Fast bulk student and faculty onboarding via Excel, CSV, and JSON parsers</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>End-of-term grade freezes and auditable reports for accreditation (NAAC/NBA/NIRF)</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Institutional governance &amp; enterprise security</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Admin Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Module 5: Semester LMS */}
          <motion.section 
            id="lms" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Module 05</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Semester Learning Management System (LMS)
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Course Code Architecture
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Structured semester rooms mapping every university course code to allocated faculty, lecture slides, timed quizzes, and automated online assignments. Direct linkage between daily coursework and placement eligibility.
              </p>

              {/* Interface Preview: 7 Subjects + 1 Advisor Model */}
              <div className="my-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-100 gap-2 text-sm">
                  <div>
                    <span className="font-bold text-neutral-950 text-base">Semester VI • Computer Science &amp; Engineering</span>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-0.5">7 Theory/Lab Subjects + 1 Class Advisor = 8 Assigned Faculty Members</div>
                  </div>
                  <span className="text-xs sm:text-[13px] px-3 py-1 rounded-md bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200">
                    CSE Batch 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-sm">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8601</span>
                    <div className="font-bold text-neutral-900 text-base">Mobile Computing</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Faculty: Dr. Arumugam</div>
                    <div className="text-emerald-700 text-xs sm:text-[13px] mt-2 font-semibold">Quiz 03 Graded</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8602</span>
                    <div className="font-bold text-neutral-900 text-base">Compiler Design</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Faculty: Prof. Preethi</div>
                    <div className="text-neutral-700 text-xs sm:text-[13px] mt-2 font-semibold">18 Study Notes</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8603</span>
                    <div className="font-bold text-neutral-900 text-base">Distributed Systems</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Faculty: Dr. Ramanathan</div>
                    <div className="text-emerald-700 text-xs sm:text-[13px] mt-2 font-semibold">Assignment 02 Live</div>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-semibold text-neutral-500 text-xs block mb-1">ADVISOR</span>
                    <div className="font-bold text-neutral-900 text-base">Class Mentorship</div>
                    <div className="text-xs sm:text-[13px] text-neutral-600 mt-1">Advisor: Prof. Kousalya</div>
                    <div className="text-neutral-700 text-xs sm:text-[13px] mt-2 font-semibold">62 Student Logs</div>
                  </div>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Dedicated course-code mapped rooms with faculty upload permissions</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Centralized repository for syllabus notes, lecture slides, and coding exercises</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Automated online timed quizzes and assignment submission deadline trackers</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Continuous student academic progress sync with corporate placement eligibility criteria</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Semester LMS &amp; academic classroom engine</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request LMS Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

        </div>

        {/* ========================================================================= */}
        {/* CATEGORY 2: TECHNICAL CAREER DEVELOPMENT */}
        {/* ========================================================================= */}
        <div className="mt-24 space-y-24">

          <div className="border-b border-neutral-200 pb-5">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Category 02
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight mt-1">
              Technical Career Development Systems
            </h2>
            <p className="text-base text-neutral-600 mt-2 font-normal leading-relaxed">
              High-concurrency programming assessments and AI-assisted mock interview practice.
            </p>
          </div>

          {/* Feature 1: Programming Assessment Engine */}
          <motion.section 
            id="coding-assessment" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Technical Module 01</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      Programming Assessment System
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Automated Code Evaluation
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Move beyond superficial multiple-choice tests. Benchmark student problem-solving with timed coding challenges, multi-language test execution, runtime analysis, and proctoring locks.
              </p>

              {/* Interface Preview: Code Editor Sandbox */}
              <div className="my-8 rounded-xl border border-neutral-300 bg-neutral-900 text-neutral-100 shadow-xl overflow-hidden font-sans">
                <div className="bg-neutral-950 px-5 py-3.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px]">
                  <div className="flex items-center gap-2 font-mono text-neutral-300">
                    <Code2 className="w-4 h-4 text-neutral-400" />
                    <span>assessment-engine // {codingAssessmentMockData.problemId}</span>
                    <span className="bg-neutral-800 px-2.5 py-0.5 rounded text-xs text-neutral-300 font-medium">
                      {codingAssessmentMockData.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Full-Screen Lock Active
                    </span>
                    <span>Time: 34:12</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
                  <div className="lg:col-span-5 p-5 sm:p-6 bg-neutral-900/90 border-b lg:border-b-0 lg:border-r border-neutral-800 text-xs sm:text-[13px] flex flex-col justify-between">
                    <div>
                      <div className="text-neutral-400 font-mono text-xs uppercase mb-1 font-semibold">Problem Statement</div>
                      <h4 className="text-lg font-bold text-white mb-2">{codingAssessmentMockData.title}</h4>
                      <p className="text-neutral-300 leading-relaxed mb-4 text-xs sm:text-[13px] font-normal">{codingAssessmentMockData.description}</p>
                      <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-400 space-y-1">
                        <div>Time Limit: {codingAssessmentMockData.timeLimit}</div>
                        <div>Memory Limit: {codingAssessmentMockData.memoryLimit}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-neutral-800 text-xs sm:text-[13px] text-neutral-400 font-normal">
                      Languages: JavaScript, Python 3, Java, C, C++
                    </div>
                  </div>

                  <div className="lg:col-span-7 flex flex-col bg-neutral-950">
                    <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-300 flex-1">
                      <pre className="text-xs sm:text-[13px] leading-relaxed">
                        <code>
                          <span className="text-neutral-500">// Automated Evaluation Sandbox</span>{'\n'}
                          <span className="text-purple-400">function</span> <span className="text-yellow-300">findTargetPair</span>(nums, target) {'{\n'}
                          {'  '}<span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-cyan-400">Map</span>();{'\n'}
                          {'  '}<span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = <span className="text-emerald-400">0</span>; i &lt; nums.length; i++) {'{\n'}
                          {'    '}<span className="text-purple-400">const</span> complement = target - nums[i];{'\n'}
                          {'    '}<span className="text-purple-400">if</span> (map.<span className="text-cyan-400">has</span>(complement)) {'{\n'}
                          {'      '}<span className="text-purple-400">return</span> [map.<span className="text-cyan-400">get</span>(complement), i];{'\n'}
                          {'    '}{'}\n'}
                          {'    '}map.<span className="text-cyan-400">set</span>(nums[i], i);{'\n'}
                          {'  '}{'}\n'}
                          {'  '}<span className="text-purple-400">return</span> [];{'\n'}
                          {'}'}
                        </code>
                      </pre>
                    </div>

                    <div className="p-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs sm:text-[13px] font-mono">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Check className="w-4 h-4" />
                        <span>5 of 5 Test Cases Passed</span>
                      </div>
                      <div className="text-neutral-400 text-xs font-normal">
                        Runtime: <strong className="text-white font-semibold">24.8 ms</strong> • Top 96.4%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Automated test-case compilation against public and hidden validation test suites</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Millisecond runtime execution precision and memory complexity analysis</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Integrity security: full-screen lock, tab-switch monitoring &amp; clipboard restrictions</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Multi-language compiler support: JavaScript (Node.js), Python 3, Java, C, and C++</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">Live code evaluation &amp; technical assessment sandbox</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Assessment Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Feature 2: Mock Interview Platform */}
          <motion.section 
            id="mock-interviews" 
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
            className="scroll-mt-32 pt-2"
          >
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Technical Module 02</span>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-neutral-950 leading-snug">
                      AI-Assisted Mock Interview Platform
                    </h3>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                  Interview Readiness
                </span>
              </div>

              <p className="mt-5 text-base sm:text-[17px] text-neutral-700 leading-relaxed font-normal">
                Prepare students for high-stakes corporate campus panels with role-specific technical and HR question prompts, candidate transcription, 4-point rubric scoring, and remediation reports.
              </p>

              {/* Interface Preview: Mock Interview Simulation */}
              <div className="my-8 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-neutral-950 text-white font-bold flex items-center justify-center text-xs">
                      RB
                    </div>
                    <div>
                      <div className="font-bold text-neutral-950 text-base">{mockInterviewMockData.candidate}</div>
                      <div className="text-neutral-600 text-xs sm:text-[13px]">{mockInterviewMockData.role}</div>
                    </div>
                  </div>
                  <span className="bg-neutral-950 text-white font-semibold px-3 py-1.5 rounded-md text-xs sm:text-[13px]">
                    Overall Score: {mockInterviewMockData.overallScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
                  <div className="lg:col-span-7 p-6 sm:p-7 space-y-4">
                    <div>
                      <span className="text-neutral-500 font-semibold text-xs uppercase tracking-wider block mb-1.5">
                        System Architecture Question Prompt
                      </span>
                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-[15px] font-medium text-neutral-950 leading-relaxed">
                        "{mockInterviewMockData.sampleQuestion}"
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Candidate Speech-to-Text Transcription</span>
                      </div>
                      <div className="p-4 rounded-xl border border-neutral-200 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal bg-white">
                        "{mockInterviewMockData.candidateAnswer}"
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-500 font-semibold text-xs uppercase tracking-wider block mb-2">
                        Actionable Remediation Feedback
                      </span>
                      <div className="space-y-2 text-xs sm:text-[13px]">
                        {mockInterviewMockData.evaluationFeedback.map((fb, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 flex items-start gap-2.5">
                            <span className="font-bold text-xs uppercase text-neutral-700">[{fb.category}]</span>
                            <span className="text-neutral-800 font-normal leading-relaxed">{fb.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-7 bg-neutral-50/60 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-neutral-950 mb-3 pb-2 border-b border-neutral-200">
                        Competency Rubric Evaluation
                      </h4>
                      <div className="space-y-3.5">
                        {mockInterviewMockData.scores.map((s, idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
                            <div className="flex justify-between mb-1.5">
                              <span className="font-semibold text-neutral-800">{s.label}</span>
                              <span className="font-bold text-neutral-950">{s.score}/100</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                className="bg-neutral-950 h-full rounded-full" 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${s.score}%` }}
                                viewport={standardViewport}
                                transition={{ duration: 0.8, ease: PREMIUM_EASE }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-neutral-200 text-xs sm:text-[13px] text-neutral-600">
                      Recommendation: <strong className="text-neutral-950 font-semibold">Recommended for Tier-1 Product Engineering</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Core Capabilities */}
              <div className="space-y-3">
                <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                  Core Operational Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Role-based question banks for Frontend, Backend, Full Stack, Cloud, DevOps &amp; Data Science</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>HR &amp; behavioral evaluation prompts covering leadership, conflict resolution, and communication</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>4-dimension evaluation rubric: Problem Solving, System Design, Code Complexity &amp; Articulation</span>
                  </div>
                  <div className="flex items-start gap-3 text-[15px] sm:text-base text-neutral-800 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                    <span>Targeted remediation feedback reports flagging students who need communication coaching</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500">AI-assisted interview simulation &amp; candidate preparation</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Request Interview Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.section>

        </div>

      </div>

      {/* FAQs */}
      <FAQSection
        faqs={seo.faqs}
        title="Frequently Asked Questions: Platform Architecture"
        subtitle="Direct technical answers on institutional deployment, role isolation, and security."
      />
    </AnimatedPageWrapper>
  );
}
