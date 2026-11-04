import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  FileCheck, 
  Code2, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { fadeUp, staggerContainer, standardViewport } from '../utils/animations';

export default function WhyCampusCorpo({ onOpenDemo }) {
  const benefits = [
    {
      title: 'Unified Campus Data',
      desc: 'Everything connected in one place.',
      icon: Database
    },
    {
      title: 'Audit-Ready Records',
      desc: 'Organized academic and placement records.',
      icon: FileCheck
    },
    {
      title: 'Verified Skills',
      desc: 'Measure practical student capabilities.',
      icon: Code2
    },
    {
      title: 'Faster Placements',
      desc: 'Simplify recruitment workflows.',
      icon: Zap
    },
    {
      title: 'Secure Access',
      desc: 'Role-based permissions and data control.',
      icon: ShieldCheck
    },
    {
      title: 'Less Manual Work',
      desc: 'Reduce spreadsheets and repetitive tasks.',
      icon: FileSpreadsheet
    }
  ];

  return (
    <section id="why-us" className="py-16 md:py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Section Header */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-tight">
            Why Institutions Choose CampusCorpo
          </h2>
          <p className="mt-2.5 text-base sm:text-[17px] text-neutral-600 font-normal leading-relaxed">
            One connected platform. Better campus operations.
          </p>
        </motion.div>

        {/* Minimal 3-Column × 2-Row Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9 sm:gap-y-11 max-w-6xl mx-auto"
        >
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="flex items-start gap-4 group"
              >
                <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950 shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-950 leading-snug">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm sm:text-[15px] text-neutral-600 leading-relaxed font-normal">
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
