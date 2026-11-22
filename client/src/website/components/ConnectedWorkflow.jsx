import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  BookOpen, 
  Code2, 
  MessageSquareText, 
  ShieldCheck, 
  Compass, 
  Briefcase, 
  TrendingUp,
  ArrowRight,
  GitCommit,
  Network
} from 'lucide-react';
import { connectedEcosystemFlow } from '../data/websiteData';

const iconMap = {
  Building,
  Users,
  BookOpen,
  Code2,
  MessageSquareText,
  ShieldCheck,
  Compass,
  Briefcase,
  TrendingUp
};

export default function ConnectedWorkflow({ onOpenDemo }) {
  return (
    <section id="workflow" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Network className="w-3.5 h-3.5 text-neutral-950" />
            <span>Integrated Lifecycle Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
            How Everything Connects
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            CampusCorpo unifies the entire institutional pipeline — connecting initial campus setup, semester academics, coding evaluations, and corporate recruiting into one continuous flow.
          </p>
        </div>

        {/* 9-Step Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {connectedEcosystemFlow.map((step, idx) => {
            const Icon = iconMap[step.icon] || Building;
            return (
              <motion.div
                key={step.step}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-neutral-300 group-hover:text-neutral-950 transition-colors">
                      {step.step}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-950 mb-1.5">
                    {step.title}
                  </h3>

                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Stage {idx + 1} of 9</span>
                  <span className="text-neutral-950 font-semibold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Informational Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-lg sm:text-[19px] font-semibold text-white">
              Connecting Institutional Operations with Student Career Success
            </h4>
            <p className="text-sm text-neutral-300 mt-1 font-normal">
              From day one admissions and semester LMS to Tier-1 IT company placements and automated accreditation audits.
            </p>
          </div>
          <button
            onClick={onOpenDemo}
            className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-100 font-medium text-sm rounded-xl whitespace-nowrap transition-colors active:scale-95"
          >
            Explore Platform Demo
          </button>
        </div>

      </div>
    </section>
  );
}

