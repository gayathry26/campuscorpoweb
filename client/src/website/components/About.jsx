import React from 'react';
import { motion } from 'framer-motion';
import { Database, Network, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react';
import { aboutHighlights } from '../data/websiteData';
import AnimatedCounter from './AnimatedCounter';

export default function About() {
  const iconMap = {
    'Centralized Management': Database,
    'Smarter Collaboration': Network,
    'Career-Focused Development': TrendingUp,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section id="about" className="py-24 md:py-32 bg-[#fafafa] border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4 shadow-2xs">
            About CampusCorpo
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
            Simplifying Campus Management Through Technology.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-neutral-600 leading-relaxed">
            CampusCorpo is designed to connect students, faculty, placement teams and administrators through a centralized platform. Our goal is to simplify institutional workflows, improve coordination and create better opportunities for students.
          </p>
        </motion.div>

        {/* 3 Highlights Grid with Staggered Entrance */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {aboutHighlights.map((item) => {
            const Icon = iconMap[item.title] || CheckCircle;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-subtle hover:shadow-premium hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="h-12 w-12 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs"
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-black transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-neutral-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                  <span>Enterprise Grade Architecture</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Supporting statement banner with Animated Counters */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="mt-14 p-6 sm:p-8 bg-white rounded-2xl border border-neutral-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex-shrink-0 flex items-center justify-center text-neutral-950">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-neutral-950">
                Engineered for Institutions of Every Scale
              </h4>
              <p className="text-sm text-neutral-500">
                Built to handle autonomous universities, multi-campus institutes, and affiliated colleges with zero operational latency.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-neutral-950 flex-shrink-0">
            <div className="text-center">
              <div className="text-xl font-extrabold text-neutral-950">
                <AnimatedCounter to={100} suffix="%" />
              </div>
              <div className="text-xs text-neutral-500 font-normal">Data Sovereignty</div>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div className="text-center">
              <div className="text-xl font-extrabold text-neutral-950">Zero</div>
              <div className="text-xs text-neutral-500 font-normal">Data Redundancy</div>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div className="text-center">
              <div className="text-xl font-extrabold text-neutral-950">
                <AnimatedCounter to={256} suffix="-Bit" />
              </div>
              <div className="text-xs text-neutral-500 font-normal">AES Encryption</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
