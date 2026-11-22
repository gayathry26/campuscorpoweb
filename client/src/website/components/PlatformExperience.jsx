import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { platformTabs } from '../data/websiteData';
import { 
  Briefcase, 
  GraduationCap, 
  User, 
  CheckCircle2, 
  Clock, 
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function PlatformExperience({ onOpenDemo }) {
  const [activeTabId, setActiveTabId] = useState('placement');

  const currentTab = platformTabs.find((t) => t.id === activeTabId) || platformTabs[0];

  const tabIcons = {
    placement: Briefcase,
    student: User,
    faculty: GraduationCap,
    admin: Settings,
  };

  return (
    <section id="platform" className="py-24 md:py-32 bg-[#fafafa] border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4 shadow-2xs">
            Interactive Product Preview
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Platform Experience
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Tailored, role-specific experiences designed for students, faculty mentors, placement officers, and campus administrators.
          </p>
        </motion.div>

        {/* Tab Switcher Pills with Floating layoutId background */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {platformTabs.map((tab) => {
            const Icon = tabIcons[tab.id] || Briefcase;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-700 hover:text-neutral-950 bg-white border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="platformTabPill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    className="absolute inset-0 bg-neutral-950 rounded-xl -z-0 shadow-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Dashboard Mockup Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-elevated overflow-hidden"
        >
          {/* Top Panel Bar */}
          <div className="px-6 py-4 bg-neutral-50/90 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <img src="./campuscorpo-mark.png" alt="CampusCorpo" className="h-4 w-4 object-contain" />
                <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-200/90 text-neutral-800 font-bold">
                  {currentTab.tag}
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-medium">CampusCorpo Enterprise Suite</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mt-1">
                {currentTab.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDemo}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>Live Walkthrough</span>
                <ArrowRight className="h-3 w-3" />
              </motion.button>
            </div>
          </div>

          {/* Description sub-strip */}
          <div className="px-6 py-3 bg-neutral-100/40 border-b border-neutral-100 text-xs sm:text-sm text-neutral-600">
            {currentTab.description}
          </div>

          {/* Dashboard Body with AnimatePresence on Tab Change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6 sm:p-8 space-y-8"
            >
              {/* 4 Metric Cards for this Role */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentTab.metrics.map((metric, mIdx) => (
                  <motion.div 
                    key={mIdx} 
                    whileHover={{ y: -2 }}
                    className="bg-neutral-50 p-4 rounded-xl border border-neutral-200"
                  >
                    <div className="text-xs text-neutral-500 font-medium">{metric.label}</div>
                    <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-neutral-950">
                      {metric.value}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                      <CheckCircle2 className="h-3 w-3 text-neutral-950" />
                      <span>Real-time verified</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Role-Specific Deep Dive UI Content */}
              {activeTabId === 'placement' && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 font-bold text-xs uppercase tracking-wider text-neutral-700 flex justify-between items-center">
                    <span>Upcoming Recruitment Drives</span>
                    <span className="text-[11px] font-normal text-neutral-500">Auto-filtered by student eligibility</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {currentTab.recentEvents.map((evt, eIdx) => (
                      <div key={eIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors">
                        <div>
                          <div className="font-bold text-neutral-950 text-sm">{evt.company}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Role: {evt.role}</div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {evt.date}
                          </span>
                          <span className="px-2.5 py-1 bg-neutral-950 text-white font-medium rounded-md">
                            {evt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTabId === 'student' && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 font-bold text-xs uppercase tracking-wider text-neutral-700 flex justify-between items-center">
                    <span>Active Academic & Placement Timelines</span>
                    <span className="text-[11px] font-normal text-neutral-500">Semester 7 • CS & Data Systems</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {currentTab.recentEvents.map((evt, eIdx) => (
                      <div key={eIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors">
                        <div>
                          <div className="font-bold text-neutral-950 text-sm">{evt.title}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Course/Source: {evt.course}</div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {evt.due}
                          </span>
                          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 font-semibold rounded-md border border-neutral-200">
                            {evt.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTabId === 'faculty' && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 font-bold text-xs uppercase tracking-wider text-neutral-700 flex justify-between items-center">
                    <span>Faculty Queue & Evaluation Queue</span>
                    <span className="text-[11px] font-normal text-neutral-500">Prof. A. K. Sharma (Dept. of Computer Science)</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {currentTab.recentEvents.map((evt, eIdx) => (
                      <div key={eIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors">
                        <div>
                          <div className="font-bold text-neutral-950 text-sm">{evt.task}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Cohort: {evt.batch} • {evt.count}</div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
                        >
                          {evt.action}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTabId === 'admin' && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 font-bold text-xs uppercase tracking-wider text-neutral-700 flex justify-between items-center">
                    <span>Audit Logs & Institutional Governance</span>
                    <span className="text-[11px] font-normal text-neutral-500">System Logs • Real-time Monitoring</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {currentTab.recentEvents.map((evt, eIdx) => (
                      <div key={eIdx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors">
                        <div>
                          <div className="font-bold text-neutral-950 text-sm">{evt.event}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Department: {evt.dept} • {evt.timestamp}</div>
                        </div>
                        <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 font-semibold text-xs rounded-md border border-neutral-200 self-start sm:self-auto">
                          {evt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer note */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <span>All dashboards are responsive, cross-platform compatible, and support single sign-on (SSO).</span>
            <span className="font-semibold text-neutral-950">Enterprise SLA: 99.9% Uptime Guarantee</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
