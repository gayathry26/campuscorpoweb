import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Briefcase, 
  GraduationCap, 
  User, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { platformDashboardShowcase } from '../data/websiteData';

const iconMap = {
  admin: Shield,
  placement: Briefcase,
  faculty: GraduationCap,
  student: User
};

export default function DashboardShowcase({ onOpenDemo }) {
  const [activeTabId, setActiveTabId] = useState('admin');

  const activeDashboard = platformDashboardShowcase.find((d) => d.id === activeTabId) || platformDashboardShowcase[0];

  return (
    <section id="dashboards" className="py-20 md:py-28 bg-[#fafafa] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Layers className="w-3.5 h-3.5 text-neutral-950" />
            <span>Dedicated Role-Based Interfaces</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
            Platform Dashboard Showcase
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Role-specific workspaces designed for campus leaders, placement officers, academic faculty mentors, and students.
          </p>
        </div>

        {/* 4 Clean Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {platformDashboardShowcase.map((dash) => {
            const Icon = iconMap[dash.id] || Shield;
            const isActive = dash.id === activeTabId;
            return (
              <button
                key={dash.id}
                onClick={() => setActiveTabId(dash.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-md'
                    : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{dash.role}</span>
              </button>
            );
          })}
        </div>

        {/* Active Dashboard UI Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDashboard.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden"
          >
            {/* Window Command Bar */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  {activeDashboard.badge}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-0.5">
                  {activeDashboard.role}
                </h3>
              </div>
              <span className="text-xs sm:text-[13px] font-medium text-neutral-700 bg-white border border-neutral-200 px-3 py-1 rounded-lg">
                {activeDashboard.tagline}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <p className="text-base text-neutral-600 leading-relaxed font-normal mb-6 max-w-3xl">
                {activeDashboard.description}
              </p>

              {/* 4 KPIs for Active Role */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {activeDashboard.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 shadow-2xs">
                    <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">{kpi.label}</div>
                    <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">{kpi.value}</div>
                    <div className="text-xs text-neutral-500 mt-1 font-normal">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Highlights & Walkthrough Trigger */}
              <div className="bg-neutral-50/70 p-5 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    Key Features Mapped to This Interface
                  </span>
                  <div className="space-y-1.5">
                    {activeDashboard.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onOpenDemo}
                  className="px-5 py-2.5 bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium rounded-xl whitespace-nowrap transition-colors active:scale-95 self-start md:self-center"
                >
                  Schedule Role Walkthrough
                </button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

