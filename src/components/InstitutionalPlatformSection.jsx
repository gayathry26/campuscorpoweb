import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  GraduationCap, 
  Shield, 
  BookOpen, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { fadeUp, staggerContainer, cardReveal, standardViewport } from '../utils/animations';

export default function InstitutionalPlatformSection() {
  const modules = [
    {
      id: 'placement',
      title: 'Placement Management',
      icon: Briefcase,
      desc: 'Automates student eligibility filtering, drive scheduling, interview slotting, and corporate offer tracking.',
      link: '/platform#placement'
    },
    {
      id: 'student',
      title: 'Student 360° Management',
      icon: Users,
      desc: 'Centralizes academic histories, verified programming badges, standing arrears, and dream-tier classifications.',
      link: '/platform#student-management'
    },
    {
      id: 'faculty',
      title: 'Faculty Management',
      icon: GraduationCap,
      desc: 'Coordinates teaching workloads, course code assignments, class advisor duties, and syllabus milestone sync.',
      link: '/platform#faculty-management'
    },
    {
      id: 'admin',
      title: 'Administration & RBAC',
      icon: Shield,
      desc: 'Governs multi-branch departments, role-based access permissions, and high-speed Excel/CSV/JSON bulk data ingestion.',
      link: '/platform#administration'
    },
    {
      id: 'lms',
      title: 'Semester LMS',
      icon: BookOpen,
      desc: 'Delivers structured semester classrooms supporting 7 subjects + 1 class advisor with lecture notes and timed quizzes.',
      link: '/platform#lms'
    }
  ];

  return (
    <section id="institutional-platform" className="py-20 md:py-24 bg-[#fafafa] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Layers className="w-3.5 h-3.5 text-neutral-950" />
            <span>Institutional Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Five Core Modules. One Connected Campus.
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Eliminate fragmented software and manual spreadsheets with an integrated institutional operating system.
          </p>
        </motion.div>

        {/* 5 Compact Cards Layout with Staggered Entrance */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.id}
                variants={cardReveal}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 hover:shadow-md transition-all flex flex-col justify-between group ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-950 mb-4 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-semibold text-neutral-950 mb-2">
                    {m.title}
                  </h3>
                  <p className="text-[15px] sm:text-base text-neutral-700 leading-relaxed font-normal">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <a
                    href={m.link}
                    className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-neutral-950 group-hover:underline"
                  >
                    <span>Explore Module Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

