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
      title: 'Eliminate System Silos',
      desc: 'Consolidate 4 to 6 disconnected tools and risky spreadsheets into one unified institutional operating system.',
      icon: Database
    },
    {
      title: 'Accelerate Placement Cycles',
      desc: 'Filter eligible students instantly by CGPA and arrears, schedule multi-round drives, and cut administrative effort by 80%.',
      icon: Zap
    },
    {
      title: 'Audit & Accreditation Ready',
      desc: 'Export comprehensive student progression, faculty workloads, and placement conversion data for NAAC, NBA, and NIRF audits.',
      icon: FileCheck
    },
    {
      title: 'Verified Technical Readiness',
      desc: 'Measure practical coding ability and interview confidence with automated test cases before corporate recruiters arrive.',
      icon: Code2
    },
    {
      title: 'Empower Faculty Mentorship',
      desc: 'Streamline course code allocations, class advisor rosters, and LMS delivery so educators can focus on student guidance.',
      icon: FileSpreadsheet
    },
    {
      title: 'Enterprise Governance & Security',
      desc: 'Protect institutional data with granular role-based access control, term grade locks, and end-to-end audit trails.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="why-us" className="py-16 md:py-20 bg-white border-b border-neutral-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
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
            <span>The Institutional Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-tight">
            Why Progressive Colleges Choose CampusCorpo
          </h2>
          <p className="mt-2.5 text-base sm:text-[17px] text-neutral-600 font-normal leading-relaxed">
            Traditional ERPs store passive records. CampusCorpo actively connects campus operations to measurable placement outcomes.
          </p>
        </motion.div>

        {/* Minimal 3-Column × 2-Row Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9 sm:gap-y-11 max-w-[1200px] mx-auto"
        >
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <motion.div 
                key={idx}
                variants={fadeUp}
                className="flex items-start gap-4 group"
              >
                <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-950 flex-shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-[17px] font-semibold text-neutral-950 mb-1">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
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
