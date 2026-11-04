import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  GraduationCap, 
  Shield, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  FileCheck,
  Calendar,
  Layers,
  Database,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { campusManagementModules } from '../data/websiteData';

const iconMap = {
  Briefcase,
  Users,
  GraduationCap,
  Shield,
  BookOpen
};

export default function CampusEcosystem({ onOpenDemo }) {
  const [activeModuleId, setActiveModuleId] = useState('placement-mgmt');

  const currentModule = campusManagementModules.find((m) => m.id === activeModuleId) || campusManagementModules[0];

  return (
    <section id="campus-ecosystem" className="py-20 md:py-28 bg-[#fafafa] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Standardized 28–32px) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Complete Campus Management Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            One Connected Core for Every Institutional Workflow
          </h2>
          <p className="mt-4 text-base text-neutral-600 leading-relaxed font-normal">
            CampusCorpo connects students, faculty, class advisors, placement officers, administrators, and recruiters into a unified operating system.
          </p>
        </div>

        {/* 5-Module Tab Switcher */}
        <div className="flex items-center justify-start lg:justify-center gap-2.5 overflow-x-auto pb-4 scrollbar-none mb-10">
          {campusManagementModules.map((module) => {
            const Icon = iconMap[module.icon] || Briefcase;
            const isActive = module.id === activeModuleId;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-md'
                    : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{module.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Showcase Card with Framer Motion AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden"
          >
            
            {/* Top Bar */}
            <div className="bg-neutral-50 px-6 sm:px-8 py-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs sm:text-[13px] font-semibold tracking-wider text-neutral-500 uppercase">
                  INSTITUTIONAL CORE MODULE
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 mt-1 leading-snug">
                  {currentModule.headline}
                </h3>
              </div>
              <span className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                {currentModule.mockup.tag}
              </span>
            </div>

            {/* Split Content: Capabilities List vs Live Realistic Dashboard Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              
              {/* Left Column: Description & 10 Capabilities (5 Cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-base sm:text-[17px] text-neutral-600 leading-relaxed mb-6 font-normal">
                    {currentModule.desc}
                  </p>

                  <div className="space-y-3">
                    <span className="text-xs sm:text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
                      Key Operational Capabilities
                    </span>
                    {currentModule.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-normal">
                        <Check className="w-4 h-4 text-neutral-950 shrink-0 mt-1" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm text-neutral-500 font-medium">Institutional Governance</span>
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-neutral-950 hover:underline"
                  >
                    <span>Request Walkthrough</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Realistic Dashboard Preview (7 Cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 bg-neutral-50/50 flex flex-col justify-between">
                
                {/* Mockup KPIs */}
                <div>
                  <div className="grid grid-cols-3 gap-3.5 mb-6">
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-xs sm:text-sm text-neutral-600 font-medium">{currentModule.mockup.statPrimaryLabel}</div>
                      <div className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 mt-1.5 leading-none">{currentModule.mockup.statPrimary}</div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-xs sm:text-sm text-neutral-600 font-medium">{currentModule.mockup.statSecondaryLabel}</div>
                      <div className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 mt-1.5 leading-none">{currentModule.mockup.statSecondary}</div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-xs sm:text-sm text-neutral-600 font-medium">{currentModule.mockup.statTertiaryLabel}</div>
                      <div className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 mt-1.5 leading-none">{currentModule.mockup.statTertiary}</div>
                    </div>
                  </div>

                  {/* Contextual UI preview specific to each module */}
                  {currentModule.key === 'placement' && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                      <div className="flex justify-between items-center text-sm pb-3 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-950 text-sm sm:text-base">Active Placement Drive Pipeline</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-medium text-xs border border-emerald-200">
                          Drive #2026-018 Online
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2.5 text-center text-xs sm:text-sm">
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                          <div className="text-neutral-600 text-xs sm:text-[13px] uppercase font-semibold tracking-wider">Eligible</div>
                          <div className="font-bold text-neutral-950 text-xl sm:text-2xl mt-1">910</div>
                        </div>
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                          <div className="text-neutral-600 text-xs sm:text-[13px] uppercase font-semibold tracking-wider">Applied</div>
                          <div className="font-bold text-neutral-950 text-xl sm:text-2xl mt-1">724</div>
                        </div>
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                          <div className="text-neutral-600 text-xs sm:text-[13px] uppercase font-semibold tracking-wider">Shortlisted</div>
                          <div className="font-bold text-neutral-950 text-xl sm:text-2xl mt-1">142</div>
                        </div>
                        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                          <div className="text-neutral-600 text-xs sm:text-[13px] uppercase font-semibold tracking-wider">Offers</div>
                          <div className="font-bold text-emerald-600 text-xl sm:text-2xl mt-1">38</div>
                        </div>
                      </div>
                          <div className="font-bold text-emerald-600 text-lg sm:text-xl mt-1">38</div>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-neutral-800 font-medium flex items-center justify-between">
                        <span>Corporate: Zoho Corporation (SaaS)</span>
                        <span>CTC: ₹8.4 LPA • Chennai</span>
                      </div>
                    </div>
                  )}

                  {currentModule.key === 'student' && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-neutral-950 text-white font-bold text-xs flex items-center justify-center">
                            AK
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-950 text-sm sm:text-base">Ananya Krishnan (22CS104)</div>
                            <div className="text-neutral-500 text-xs font-normal">B.E. Computer Science • Semester VI</div>
                          </div>
                        </div>
                        <span className="bg-neutral-100 text-neutral-800 text-xs px-2.5 py-1 rounded font-medium">
                          Dream Tier
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div className="text-neutral-500 font-medium text-xs">Technical Assessment</div>
                          <div className="font-bold text-neutral-900 mt-1 text-sm sm:text-base">94.2% Coding Benchmark</div>
                          <div className="text-xs text-neutral-500 mt-1 font-normal">JS, Python, DSA, System Design</div>
                        </div>
                        <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div className="text-neutral-500 font-medium text-xs">Mock Interview Rating</div>
                          <div className="font-bold text-neutral-900 mt-1 text-sm sm:text-base">4.7 / 5.0 (Cleared)</div>
                          <div className="text-xs text-neutral-500 mt-1 font-normal">Technical Round 1 &amp; HR Complete</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentModule.key === 'faculty' && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-950 text-sm sm:text-base">Faculty Teaching Load &amp; Advisor Roster</span>
                        <span className="text-xs text-neutral-500 font-medium">CS Department</span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-neutral-900 text-sm">Dr. S. Ramanathan (Professor)</span>
                            <div className="text-xs text-neutral-500 font-normal">Course: CS8491 Distributed Systems (4 Credits)</div>
                          </div>
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-medium text-xs">
                            98% Syllabus Done
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-neutral-900 text-sm">Prof. M. Kousalya (Associate Professor)</span>
                            <div className="text-xs text-neutral-500 font-normal">Course: CS8492 Database Management Systems</div>
                          </div>
                          <span className="text-neutral-700 bg-neutral-200/70 px-2.5 py-1 rounded font-medium text-xs">
                            Class Advisor - Sec B
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentModule.key === 'admin' && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="font-semibold text-neutral-950 text-sm sm:text-base">Data Ingestion &amp; Role-Based Governance</span>
                        <span className="text-xs text-emerald-600 font-semibold">Secure RBAC</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                          <FileSpreadsheet className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                          <div className="font-semibold text-neutral-900 text-sm">Excel / CSV</div>
                          <div className="text-xs text-neutral-500 mt-0.5 font-normal">Instant Student Sync</div>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                          <Database className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                          <div className="font-semibold text-neutral-900 text-sm">JSON Schemas</div>
                          <div className="text-xs text-neutral-500 mt-0.5 font-normal">Curriculum Mapping</div>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                          <Shield className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                          <div className="font-semibold text-neutral-900 text-sm">RBAC Controls</div>
                          <div className="text-xs text-neutral-500 mt-0.5 font-normal">Multi-Role Isolation</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentModule.key === 'lms' && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <div>
                          <span className="font-semibold text-neutral-950 text-sm sm:text-base">Semester VI Structured LMS Room</span>
                          <div className="text-xs text-neutral-500 font-normal">7 Theory/Lab Subjects + 1 Class Advisor (8 Assigned Faculty)</div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 font-semibold">
                          CSE Batch 2026
                        </span>
                      </div>

                      {/* Course Cards Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div className="font-semibold text-neutral-900 text-sm">CS8601 Mobile Computing</div>
                          <div className="text-neutral-500 text-xs mt-0.5 font-normal">Faculty: Dr. Arumugam • 14 Study Notes</div>
                          <div className="text-emerald-600 text-xs mt-1 font-medium">Quiz 03 Submissions: 96%</div>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div className="font-semibold text-neutral-900 text-sm">CS8602 Compiler Design</div>
                          <div className="text-neutral-500 text-xs mt-0.5 font-normal">Faculty: Prof. Preethi • 18 Study Notes</div>
                          <div className="text-emerald-600 text-xs mt-1 font-medium">Assignment 02: Graded</div>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-100/70 rounded-lg text-neutral-700 text-xs sm:text-sm flex items-center justify-between">
                        <span className="font-medium">Class Advisor Duty: Prof. Kousalya</span>
                        <span className="text-neutral-600 text-xs font-medium">Mentorship Logs Up-to-Date</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Recent Notification Bar */}
                <div className="mt-4 p-3.5 bg-white rounded-xl border border-neutral-200 text-xs sm:text-sm text-neutral-700 font-medium flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{currentModule.mockup.recentRow}</span>
                </div>

              </div>

            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

