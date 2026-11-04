import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  BookOpen, 
  TrendingUp, 
  Code2, 
  MessageSquareText, 
  Briefcase, 
  Building2, 
  Award,
  Network
} from 'lucide-react';
import { fadeUp, staggerContainer, cardReveal, standardViewport } from '../utils/animations';

export default function ConnectedEcosystemFlow() {
  const steps = [
    { title: 'Student Onboarding', desc: 'Centralized master data import', icon: UserPlus },
    { title: 'Academic Management', desc: '7 subjects + 1 advisor LMS rooms', icon: BookOpen },
    { title: 'Skill Development', desc: 'Curriculum & domain roadmaps', icon: TrendingUp },
    { title: 'Coding Assessment', desc: 'Automated test-case evaluation', icon: Code2 },
    { title: 'Mock Interviews', desc: 'AI-assisted technical & HR rubrics', icon: MessageSquareText },
    { title: 'Placement Prep', desc: 'Dynamic CGPA & arrears filtering', icon: Briefcase },
    { title: 'Recruitment Drives', desc: 'Corporate portal & round slotting', icon: Building2 },
    { title: 'Offers & Reporting', desc: 'Verified conversion & audits', icon: Award }
  ];

  return (
    <section id="lifecycle" className="py-20 md:py-24 bg-[#fafafa] border-b border-neutral-200">
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
            <Network className="w-3.5 h-3.5 text-neutral-950" />
            <span>Integrated Lifecycle Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Connected Campus-to-Career Flow
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Every semester milestone connects directly to student placement readiness and recruiter conversion.
          </p>
        </motion.div>

        {/* 8-Step Lifecycle Diagram with Staggered Scroll Entrance */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={cardReveal}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-950 hover:shadow-sm transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-neutral-400 group-hover:text-neutral-950 transition-colors">
                      STAGE 0{idx + 1}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-[17px] font-semibold text-neutral-950 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-600 font-normal leading-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                  <span>Step {idx + 1} of 8</span>
                  <span className="text-neutral-950 font-bold group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

