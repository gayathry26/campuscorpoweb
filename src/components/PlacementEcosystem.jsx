import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Code2, 
  MessageSquareText, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  ArrowRight,
  Workflow
} from 'lucide-react';
import { placementWorkflow } from '../data/websiteData';

const iconMap = {
  UserPlus,
  Code2,
  MessageSquareText,
  ShieldCheck,
  Building2,
  TrendingUp
};

export default function PlacementEcosystem({ onOpenDemo }) {
  return (
    <section id="ecosystem" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-3">
            <Workflow className="w-3.5 h-3.5 text-neutral-950" />
            <span>End-to-End Placement Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Placement Management Ecosystem
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
            A cohesive 6-stage operational pipeline engineered for institutional governance, verifiable candidate readiness, and corporate recruiting.
          </p>
        </div>

        {/* 6 Step Interactive Horizontal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placementWorkflow.map((step, index) => {
            const Icon = iconMap[step.icon] || ShieldCheck;
            return (
              <motion.div
                key={step.step}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-7 hover:border-neutral-950 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-neutral-300 group-hover:text-neutral-950 transition-colors">
                      {step.step}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-950 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Stage {index + 1} of 6</span>
                  <span className="text-neutral-950 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                    →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-lg font-bold">
              Ready to automate your college's placement operations?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Connect your placement cell to automated coding assessments, AI interviews, and regional company tracking.
            </p>
          </div>
          <button
            onClick={onOpenDemo}
            className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-100 font-semibold text-xs sm:text-sm rounded-xl whitespace-nowrap transition-colors active:scale-95"
          >
            Schedule Institutional Walkthrough
          </button>
        </div>

      </div>
    </section>
  );
}

