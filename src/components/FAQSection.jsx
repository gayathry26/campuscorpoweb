import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection({ faqs = [], title = 'Frequently Asked Questions', subtitle = 'Direct, factual answers to institutional questions.' }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-neutral-50/70 border-t border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-950" />
            <span>Answers &amp; Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto font-normal">
            {subtitle}
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all duration-150"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-950 hover:bg-neutral-50/70 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-neutral-950' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 text-sm sm:text-[15px] text-neutral-700 leading-relaxed font-normal border-t border-neutral-100">
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

