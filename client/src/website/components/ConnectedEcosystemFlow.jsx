import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

gsap.registerPlugin(ScrollTrigger);

export default function ConnectedEcosystemFlow() {
  const sectionRef = useRef(null);
  const cardsGridRef = useRef(null);
  const progressLineRef = useRef(null);

  const steps = [
    { title: 'Institutional Setup', desc: 'Configure departments, regulations, terms, and academic hierarchy.', icon: UserPlus },
    { title: 'Cohort Onboarding', desc: 'Import student rosters and faculty masters via verified bulk schemas.', icon: BookOpen },
    { title: 'Academic Delivery', desc: 'Allocate course codes, syllabus milestones, and semester LMS rooms.', icon: TrendingUp },
    { title: 'Coding Benchmarks', desc: 'Evaluate hands-on problem solving with automated unit test suites.', icon: Code2 },
    { title: 'Mock Interviews', desc: 'Prepare candidates with structured technical and HR evaluation rubrics.', icon: MessageSquareText },
    { title: 'Placement Eligibility', desc: 'Filter candidates automatically by real-time CGPA, arrears, and skills.', icon: Briefcase },
    { title: 'Hiring Drives', desc: 'Coordinate recruiter portals, test slots, interview loops, and shortlists.', icon: Building2 },
    { title: 'Verified Outcomes', desc: 'Track offers, benchmark packages, and export NAAC/NBA audit reports.', icon: Award }
  ];

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
          '.flow-badge',
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 }
        )
        .fromTo(
          '.flow-heading-line',
          { y: '105%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.85, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(
          '.flow-desc',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          '-=0.5'
        );

      // 2. Staggered 8-Stage Cards Entrance Animation
      gsap.fromTo(
        '.flow-stage-card',
        { y: 45, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsGridRef.current,
            start: 'top 78%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // 3. Scroll-Linked Progress Line Trace
      if (progressLineRef.current) {
        gsap.fromTo(
          progressLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: cardsGridRef.current,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: 1,
            },
          }
        );
      }

      // 4. Subtle Parallax Across the Stage Cards on Scroll
      gsap.to('.flow-stage-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        y: (i) => (i % 2 === 0 ? -10 : 10),
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="lifecycle" 
      className="py-20 md:py-24 bg-[#fafafa] border-b border-neutral-200 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flow-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Network className="w-3.5 h-3.5 text-neutral-950" />
            <span>End-to-End Institutional Lifecycle</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="flow-heading-line block">From First-Year Enrollment</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="flow-heading-line block text-neutral-900">To Final Placement Offer</span>
            </span>
          </h2>

          <p className="flow-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Every academic milestone, lab assignment, and coding assessment automatically feeds into student placement readiness and recruiter conversion.
          </p>
        </div>

        {/* Scroll-Linked Progress Line Indicator */}
        <div className="relative mb-6 hidden lg:block">
          <div className="h-0.5 w-full bg-neutral-200/80 rounded-full overflow-hidden">
            <div 
              ref={progressLineRef}
              className="h-full bg-neutral-950 origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>

        {/* 8-Stage Compact Grid */}
        <div 
          ref={cardsGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx} 
                className="flow-stage-card bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-950 hover:shadow-sm transition-all duration-300 flex flex-col justify-between group will-change-transform"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-neutral-400 group-hover:text-neutral-950 transition-colors">
                      STAGE 0{idx + 1}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-200">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-950 mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Verified Data Sync</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
