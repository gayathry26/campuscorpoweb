import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  FileCheck, 
  Code2, 
  Zap, 
  ShieldCheck, 
  FileSpreadsheet,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { fadeUp, staggerContainer, cardReveal, standardViewport } from '../utils/animations';

export default function WhyCampusCorpo({ onOpenDemo }) {
  const benefits = [
    {
      title: 'Connected Campus Data',
      desc: 'Brings admissions, semester coursework, faculty mentor notes, and placement drives into a unified institutional record.',
      icon: Database
    },
    {
      title: 'Better Accreditation Reporting',
      desc: 'Maintains auditable attendance logs, academic milestone histories, and verified placement conversions for NAAC, NBA, and NIRF audits.',
      icon: FileCheck
    },
    {
      title: 'Verified Skill Development',
      desc: 'Evaluates real programming proficiency and mock interview articulation rather than relying only on written theory grades.',
      icon: Code2
    },
    {
      title: 'Faster Placement Operations',
      desc: 'Automates student eligibility filtering, test slotting, recruiter round tracking, and offer letter generation in minutes.',
      icon: Zap
    },
    {
      title: 'Role-Based Access Control',
      desc: 'Ensures strict data isolation and permission boundaries between campus leadership, HODs, faculty members, and students.',
      icon: ShieldCheck
    },
    {
      title: 'Reduced Spreadsheet Dependency',
      desc: 'Replaces prone-to-error manual Excel trackers with validated digital databases and automated export pipelines.',
      icon: FileSpreadsheet
    }
  ];

  return (
    <section id="why-us" className="py-20 md:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Institutional Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Why Higher Education Institutions Choose CampusCorpo
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Designed specifically for engineering colleges, polytechnics, and universities seeking structured academic governance.
          </p>
        </motion.div>

        {/* 6 Benefits Grid with Staggered Entrance */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                variants={cardReveal}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-950 mb-4 shadow-2xs group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-semibold text-neutral-950 mb-2">
                    {b.title}
                  </h3>
                  <p className="text-[15px] sm:text-base text-neutral-700 leading-relaxed font-normal">
                    {b.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-200/60 text-xs font-semibold text-neutral-500">
                  BENEFIT 0{idx + 1}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
