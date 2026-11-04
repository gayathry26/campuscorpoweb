import React from 'react';
import { motion } from 'framer-motion';
import { workflowSteps } from '../data/websiteData';
import { Settings, UserPlus, CalendarCheck, BarChart3, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  const stepIcons = [Settings, UserPlus, CalendarCheck, BarChart3];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
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
    <section id="how-it-works" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
            Deployment & Adoption
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            A structured four-phase implementation process designed for smooth institutional onboarding with minimal disruption.
          </p>
        </motion.div>

        {/* Desktop Horizontal Timeline (Visible on lg screens) */}
        <div className="hidden lg:block relative mt-16 mb-20">
          {/* Animated Connecting Line */}
          <div className="absolute top-[32px] left-16 right-16 h-0.5 bg-neutral-200 -z-0">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-neutral-950"
            />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-4 gap-8 relative z-10"
          >
            {workflowSteps.map((step, idx) => {
              const Icon = stepIcons[idx] || Settings;
              return (
                <motion.div 
                  key={step.number} 
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step Number Circle */}
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="h-16 w-16 rounded-2xl bg-white border-2 border-neutral-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-neutral-950 flex items-center justify-center font-extrabold text-lg transition-all duration-300 shadow-sm mb-6"
                  >
                    <Icon className="h-7 w-7 transition-colors" />
                  </motion.div>

                  <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold text-neutral-500 bg-neutral-100 mb-2">
                    Step {step.number}
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-black mb-1">
                    {step.title}
                  </h3>
                  
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                    {step.subtitle}
                  </span>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed px-2">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="lg:hidden relative pl-6 border-l-2 border-neutral-200 ml-4 space-y-10 my-10">
          {workflowSteps.map((step, idx) => {
            const Icon = stepIcons[idx] || Settings;
            return (
              <motion.div 
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Step Marker on the line */}
                <div className="absolute -left-[35px] top-0 h-10 w-10 rounded-full bg-white border-2 border-neutral-300 text-neutral-950 flex items-center justify-center shadow-xs">
                  <span className="text-xs font-bold font-mono">{step.number}</span>
                </div>

                <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-neutral-400">Phase {step.number}</span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs font-semibold text-neutral-600">{step.subtitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Workflow Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
        >
          <div className="text-sm text-neutral-700">
            <span className="font-bold text-neutral-950">Fast-track Deployment:</span> Most university departments go live in under 7 business days with guided data migration.
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-950 hover:underline underline-offset-4 flex-shrink-0"
          >
            <span>Learn about our onboarding process</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
