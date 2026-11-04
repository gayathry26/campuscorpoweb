import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code2, 
  MessageSquareText, 
  ShieldCheck, 
  Check, 
  Volume2, 
  ArrowRight,
  Sparkles,
  Terminal
} from 'lucide-react';
import { codingAssessmentMockData, mockInterviewMockData } from '../data/websiteData';
import { fadeUp, staggerContainer, cardReveal, standardViewport } from '../utils/animations';

export default function TechnicalCapabilitiesSection() {
  return (
    <section id="technical-capabilities" className="py-20 md:py-24 bg-white border-b border-neutral-200">
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
            <span>Technical Career Development</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Advanced Technical Assessment &amp; Interview Intelligence
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Move beyond superficial quizzes with automated programming benchmarks and AI-assisted interview preparation.
          </p>
        </motion.div>

        {/* Two Compact Side-by-Side Panels */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          
          {/* Panel 1: Programming Assessment System */}
          <motion.div 
            variants={cardReveal}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Evaluation Engine</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Programming Assessment System
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-6">
                Timed coding sandbox compiling code in JavaScript, Python, Java, C, and C++ against automated public and hidden test cases with millisecond runtime analysis.
              </p>

              {/* Compact Code Preview */}
              <div className="rounded-xl border border-neutral-300 bg-neutral-900 text-neutral-100 p-4 font-mono text-xs sm:text-[13px] shadow-inner mb-6">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Full-Screen Lock Active
                  </span>
                  <span className="font-medium">Two Sum // Easy</span>
                </div>
                <div className="space-y-1 text-neutral-300 text-xs sm:text-[13px] leading-relaxed">
                  <div><span className="text-purple-400">function</span> <span className="text-yellow-300">findTargetPair</span>(nums, target) {'{'}</div>
                  <div className="pl-4 text-neutral-400">// Map-based linear lookup O(n)</div>
                  <div className="pl-4"><span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-cyan-400">Map</span>();</div>
                  <div className="pl-4"><span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt; nums.length; i++) {'{'} ... {'}'}</div>
                  <div>{'}'}</div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> 5/5 Test Cases Passed
                  </span>
                  <span className="text-neutral-400 font-mono">Runtime: 24.8 ms</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">Supports JS, Python, Java, C, C++</span>
              <a
                href="/platform#coding-assessment"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:underline"
              >
                <span>View Full Coding Engine</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Panel 2: AI-Assisted Mock Interview System */}
          <motion.div 
            variants={cardReveal}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Candidate Readiness</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    AI-Assisted Mock Interview System
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-6">
                Role-specific technical and HR simulations evaluating student responses with speech-to-text transcripts, 4-point rubric scoring, and remediation guidance.
              </p>

              {/* Compact Interview Preview */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs sm:text-[13px] shadow-inner mb-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-neutral-600">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-neutral-950 text-white font-bold flex items-center justify-center text-xs">
                      RB
                    </div>
                    <span className="font-semibold text-neutral-950 text-xs sm:text-[13px]">Rohit Balaji • Full Stack Track</span>
                  </div>
                  <span className="text-neutral-950 font-bold bg-neutral-100 px-2.5 py-0.5 rounded text-xs">
                    Score: 88/100
                  </span>
                </div>

                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-neutral-800 font-medium text-xs sm:text-[13px] leading-relaxed">
                  "{mockInterviewMockData.sampleQuestion}"
                </div>

                <div className="flex items-center justify-between text-neutral-600 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-700" /> Transcribed candidate answer
                  </span>
                  <span className="text-emerald-700 font-semibold">Tier-1 Product Recommended</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">Technical &amp; HR prompt rubrics</span>
              <a
                href="/platform#mock-interviews"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:underline"
              >
                <span>View Interview System</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

