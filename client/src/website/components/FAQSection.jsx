import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection({ 
  faqs = [], 
  title = 'Frequently Asked Questions', 
  subtitle = 'Direct, factual answers to institutional questions.' 
}) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-neutral-50/60 border-t border-neutral-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-9 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200/90 text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-900" />
            <span>Answers &amp; Verification</span>
          </div>
          <h2 className="text-2xl sm:text-[28px] md:text-[30px] font-bold text-neutral-950 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-[15px] text-neutral-600 max-w-lg mx-auto font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-2.5 sm:space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-xl border transition-all duration-150 shadow-2xs ${
                  isOpen ? 'border-neutral-300 ring-1 ring-neutral-200/60' : 'border-neutral-200/90 hover:border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-[15px] text-neutral-900 hover:text-neutral-950 transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug pr-2">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ease-out ${
                      isOpen ? 'rotate-180 text-neutral-900' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4.5 pt-1.5 text-sm sm:text-[14px] text-neutral-600 leading-relaxed font-normal border-t border-neutral-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
