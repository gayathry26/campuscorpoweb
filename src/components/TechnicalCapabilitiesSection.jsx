import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

gsap.registerPlugin(ScrollTrigger);

export default function TechnicalCapabilitiesSection() {
  const sectionRef = useRef(null);
  const cardsGridRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Line-by-Line Heading & Header Reveal
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'play reverse play reverse',
        },
        defaults: { ease: 'power3.out' },
      });

      headerTl
        .fromTo(
          '.tech-badge',
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 }
        )
        .fromTo(
          '.tech-heading-line',
          { y: '105%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.85, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(
          '.tech-desc',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          '-=0.5'
        );

      // 2. Staggered Two-Panel Entrance Animation
      gsap.fromTo(
        '.tech-capability-card',
        { y: 55, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: 'top 78%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // 3. Mask-Reveal on Code Window and Rubric Window
      gsap.fromTo(
        '.tech-preview-window',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: 'top 70%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // 4. Subtle Parallax Scrub on the Cards during Scroll
      gsap.to('.tech-capability-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        y: -22,
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="technical-capabilities" 
      className="py-20 md:py-24 bg-white border-b border-neutral-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="tech-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Technical Career Development</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="tech-heading-line block">Advanced Technical Assessment</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="tech-heading-line block text-neutral-900">&amp; Interview Intelligence</span>
            </span>
          </h2>

          <p className="tech-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Move beyond superficial quizzes with automated programming benchmarks and AI-assisted interview preparation.
          </p>
        </div>

        {/* Two Compact Side-by-Side Panels */}
        <div 
          ref={cardsGridRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          
          {/* Panel 1: Programming Assessment System */}
          <div className="tech-capability-card bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all duration-300 will-change-transform">
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

              {/* Compact Code Preview Window with Mask Reveal */}
              <div className="tech-preview-window rounded-xl border border-neutral-300 bg-neutral-900 text-neutral-100 p-4 font-mono text-xs sm:text-[13px] shadow-inner mb-6">
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
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:underline group"
              >
                <span>View Full Coding Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </a>
            </div>
          </div>

          {/* Panel 2: AI-Assisted Mock Interview System */}
          <div className="tech-capability-card bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all duration-300 will-change-transform">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Preparation Hub</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    AI-Assisted Mock Interviews
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-6">
                Structured domain technical and HR question sets with AI-scored audio/video evaluations, communication rubrics, and detailed improvement feedback.
              </p>

              {/* Compact Rubric Preview Window with Mask Reveal */}
              <div className="tech-preview-window rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-700" /> Audio Analysis Session
                  </span>
                  <span className="font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Score: 88/100
                  </span>
                </div>
                
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-neutral-700 font-medium">
                      <span>Technical Precision</span>
                      <span className="font-mono text-neutral-950">92%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-neutral-900 h-full rounded-full w-[92%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-neutral-700 font-medium">
                      <span>Clarity &amp; Communication</span>
                      <span className="font-mono text-neutral-950">84%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-neutral-900 h-full rounded-full w-[84%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-neutral-700 font-medium">
                      <span>Problem-Solving Structure</span>
                      <span className="font-mono text-neutral-950">88%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-neutral-900 h-full rounded-full w-[88%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 font-mono flex items-center justify-between">
                  <span>Actionable AI Rubric</span>
                  <span className="text-neutral-700">Detailed Feedback Generated</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">AI &amp; Faculty Review Loops</span>
              <a
                href="/platform#mock-interviews"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:underline group"
              >
                <span>View Interview Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
