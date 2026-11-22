import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, UserCheck, BookOpen, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { solutionsData } from '../data/websiteData';

export default function Solutions({ onOpenDemo }) {
  const iconComponents = {
    Briefcase: Briefcase,
    GraduationCap: GraduationCap,
    UserCheck: UserCheck,
    BookOpen: BookOpen,
    ShieldCheck: ShieldCheck
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="solutions" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
            Unified Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Our Solutions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            Engineered modularly to address the core operational and strategic pillars of higher education institutions.
          </p>
        </motion.div>

        {/* 5 Solutions Cards Grid with Framer Motion Stagger */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {solutionsData.map((sol) => {
            const Icon = iconComponents[sol.icon] || Briefcase;

            return (
              <motion.div
                key={sol.id}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="rounded-2xl p-7 border border-neutral-200 bg-white text-neutral-950 shadow-subtle hover:shadow-premium hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="h-12 w-12 rounded-xl bg-neutral-100 text-neutral-950 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-200 shadow-xs"
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700">
                      {sol.highlight}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-neutral-950">
                    {sol.title}
                  </h3>
                  
                  <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-neutral-500">
                    {sol.tagline}
                  </p>

                  <p className="text-sm leading-relaxed mb-6 text-neutral-600">
                    {sol.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                    {sol.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <div className="mt-0.5 rounded-full p-0.5 flex-shrink-0 bg-neutral-100 text-neutral-950">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="text-neutral-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="mt-8 pt-5 border-t border-neutral-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenDemo}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors bg-neutral-50 text-neutral-900 border border-neutral-200 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 group/btn"
                  >
                    <span>Request Solution Demo</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
