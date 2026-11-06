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
    { title: 'Student Onboarding', desc: 'Centralized master data import', icon: UserPlus },
    { title: 'Academic Management', desc: '7 subjects + 1 advisor LMS rooms', icon: BookOpen },
    { title: 'Skill Development', desc: 'Curriculum & domain roadmaps', icon: TrendingUp },
    { title: 'Coding Assessment', desc: 'Automated test-case evaluation', icon: Code2 },
    { title: 'Mock Interviews', desc: 'AI-assisted technical & HR rubrics', icon: MessageSquareText },
    { title: 'Placement Prep', desc: 'Dynamic CGPA & arrears filtering', icon: Briefcase },
    { title: 'Recruitment Drives', desc: 'Corporate portal & round slotting', icon: Building2 },
    { title: 'Offers & Reporting', desc: 'Verified conversion & audits', icon: Award }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flow-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Network className="w-3.5 h-3.5 text-neutral-950" />
            <span>Integrated Lifecycle Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="flow-heading-line block">Connected Campus-to-Career Flow</span>
            </span>
          </h2>

          <p className="flow-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Every semester milestone connects directly to student placement readiness and recruiter conversion.
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

        {/* 8-Step Lifecycle Diagram with Staggered Scroll Entrance */}
        <div 
          ref={cardsGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flow-stage-card bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative will-change-transform"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-neutral-400 group-hover:text-neutral-950 transition-colors">
                      STAGE 0{idx + 1}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
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
                  <span className="text-neutral-950 font-bold group-hover:translate-x-1.5 transition-transform duration-200">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
