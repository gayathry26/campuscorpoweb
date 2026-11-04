import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fadeUp, standardViewport } from '../utils/animations';

export default function CallToAction({ onOpenDemo }) {
  return (
    <section className="py-20 md:py-24 bg-neutral-950 text-white relative overflow-hidden border-t border-neutral-800">
      {/* Subtle SaaS Dot Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <motion.div 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={standardViewport}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Institutional Transformation</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-white tracking-tight leading-tight">
          Smarter Placements Start Here.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Bring your institution's academic and placement operations together.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-xl transition-all shadow-md group"
          >
            <span>Request an Institutional Demo</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
          
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
          >
            <span>Contact Relations Team</span>
          </motion.a>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-[13px] text-neutral-400 font-medium">
          <span>Enterprise Campus Deployment</span>
          <span>•</span>
          <span>Fast Excel/CSV Student Onboarding</span>
          <span>•</span>
          <span>Accreditation-Ready Milestone Reporting</span>
        </div>
      </motion.div>
    </section>
  );
}
