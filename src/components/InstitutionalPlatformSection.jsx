import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Briefcase, 
  Users, 
  GraduationCap, 
  Shield, 
  BookOpen, 
  ArrowRight,
  Layers
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function InstitutionalPlatformSection() {
  const sectionRef = useRef(null);
  const cardsContainerRef = useRef(null);

  const modules = [
    {
      id: 'placement',
      title: 'Placement Management',
      icon: Briefcase,
      desc: 'Automates student eligibility filtering, drive scheduling, interview slotting, and corporate offer tracking.',
      link: '/platform#placement'
    },
    {
      id: 'student',
      title: 'Student 360° Management',
      icon: Users,
      desc: 'Centralizes academic histories, verified programming badges, standing arrears, and dream-tier classifications.',
      link: '/platform#student-management'
    },
    {
      id: 'faculty',
      title: 'Faculty Management',
      icon: GraduationCap,
      desc: 'Coordinates teaching workloads, course code assignments, class advisor duties, and syllabus milestone sync.',
      link: '/platform#faculty-management'
    },
    {
      id: 'admin',
      title: 'Administration & RBAC',
      icon: Shield,
      desc: 'Governs multi-branch departments, role-based access permissions, and high-speed Excel/CSV/JSON bulk data ingestion.',
      link: '/platform#administration'
    },
    {
      id: 'lms',
      title: 'Semester LMS',
      icon: BookOpen,
      desc: 'Delivers structured semester classrooms supporting 7 subjects + 1 class advisor with lecture notes and timed quizzes.',
      link: '/platform#lms'
    }
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
          '.modules-badge',
          { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 }
        )
        .fromTo(
          '.modules-heading-line',
          { y: '105%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.85, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(
          '.modules-desc',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          '-=0.5'
        );

      // 2. Staggered 5-Card Entrance Animation
      gsap.fromTo(
        '.module-card-item',
        { y: 50, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // 3. Subtle Parallax Movement Across Cards During Scroll
      gsap.to('.module-card-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        y: (i) => (i % 2 === 0 ? -12 : 12),
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="institutional-platform" 
      className="py-20 md:py-24 bg-[#fafafa] border-b border-neutral-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="modules-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Layers className="w-3.5 h-3.5 text-neutral-950" />
            <span>Institutional Management</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="modules-heading-line block">Five Core Modules.</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="modules-heading-line block text-neutral-900">One Connected Campus.</span>
            </span>
          </h2>

          <p className="modules-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Eliminate fragmented software and manual spreadsheets with an integrated institutional operating system.
          </p>
        </div>

        {/* 5 Compact Cards Layout with Staggered Entrance */}
        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`module-card-item bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group will-change-transform ${
                  idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-950 mb-4 group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-[19px] font-semibold text-neutral-950 mb-2">
                    {m.title}
                  </h3>
                  <p className="text-[15px] sm:text-base text-neutral-700 leading-relaxed font-normal">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <a
                    href={m.link}
                    className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-neutral-950 group-hover:underline"
                  >
                    <span>Explore Module Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
