import React, { useEffect, useRef } from 'react';
import TransitionLink from './TransitionLink';
const Link = TransitionLink;
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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="tech-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Career Readiness Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="tech-heading-line block">Evaluate Real Technical Skills</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="tech-heading-line block text-neutral-900">Before Corporate Drives Begin</span>
            </span>
          </h2>

          <p className="tech-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Bridge the gap between theoretical syllabus and industry hiring benchmarks with automated code compilation, runtime profiling, and structured mock interviews.
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
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Automated Evaluation Engine</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Enterprise Coding Assessment Sandbox
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-6">
                Timed in-browser coding environment executing code in JavaScript, Python, Java, C, and C++ against automated public and hidden test cases with millisecond runtime analysis and full-screen proctoring.
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
                
                {/* Micro Test Case Bar */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-semibold">5 / 5 Test Cases Passed</span>
                  </div>
                  <span className="font-mono text-neutral-400">24.8 ms • 42.1 MB</span>
                </div>
              </div>

              {/* Verified Feature Bullets */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automated unit test evaluation (edge &amp; boundary cases)</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Multi-language compilation (Python, Java, C, C++, JavaScript)</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Anti-tab switching detection &amp; secure assessment mode</span>
                </div>
              </div>
            </div>

            <Link
              to="/platform#coding-assessment"
              className="inline-flex items-center text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors pt-4 border-t border-neutral-200"
            >
              <span>Explore Assessment Features</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Panel 2: Mock Interview System */}
          <div className="tech-capability-card bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all duration-300 will-change-transform">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Candidate Performance Analytics</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Rubric-Driven Mock Interview Intelligence
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal mb-6">
                Train students for high-stakes technical and HR rounds using standardized evaluation rubrics that grade algorithmic reasoning, system design tradeoffs, and communication articulation with instant actionable feedback.
              </p>

              {/* Compact Rubric Window with Mask Reveal */}
              <div className="tech-preview-window rounded-xl border border-neutral-200 bg-white p-4 text-xs sm:text-[13px] shadow-sm mb-6">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-950">
                    <span>Technical Evaluation Rubric</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Score: 89 / 100
                  </span>
                </div>

                <div className="space-y-2">
                  {mockInterviewMockData.scores.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-neutral-700">
                      <span className="text-xs text-neutral-600">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-28 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-neutral-950 rounded-full" 
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-neutral-950 w-6 text-right">
                          {s.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 italic">
                  "Accurately articulated concurrency patterns; suggested deeper exploration of deadlock avoidance."
                </div>
              </div>

              {/* Verified Feature Bullets */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Standardized 4-pillar scoring matrix (Coding, Design, Complexity, Soft Skills)</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Targeted question banks across 16 software engineering domains</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Permanent interview audit history linked to student placement profiles</span>
                </div>
              </div>
            </div>

            <Link
              to="/platform#mock-interviews"
              className="inline-flex items-center text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors pt-4 border-t border-neutral-200"
            >
              <span>Explore Interview Capabilities</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
