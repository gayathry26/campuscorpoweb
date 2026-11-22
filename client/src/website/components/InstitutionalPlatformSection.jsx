import React, { useEffect, useRef } from 'react';
import TransitionLink from './TransitionLink';
const Link = TransitionLink;
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
      title: 'Placement Drive Automation',
      icon: Briefcase,
      desc: 'Filter eligible candidates instantly by CGPA and arrears, coordinate corporate drives, schedule multi-round interviews, and track student offers in real time.',
      link: '/platform#placement'
    },
    {
      id: 'student',
      title: 'Verified Student 360° Profiles',
      icon: Users,
      desc: 'Maintain a single source of truth for every student—unifying academic transcripts, verified coding badges, attendance logs, and tier-based placement eligibility.',
      link: '/platform#student-management'
    },
    {
      id: 'faculty',
      title: 'Faculty Workload & Mentorship',
      icon: GraduationCap,
      desc: 'Balance teaching workloads, allocate course codes with syllabus milestones, coordinate class advisor mentorship cohorts, and generate audit-ready NAAC/NBA documentation.',
      link: '/platform#faculty-management'
    },
    {
      id: 'admin',
      title: 'Administrative Governance & RBAC',
      icon: Shield,
      desc: 'Govern multi-branch departments, enforce granular role-based permissions, and onboard thousands of student records in minutes via secure bulk import.',
      link: '/platform#administration'
    },
    {
      id: 'lms',
      title: 'Structured Semester Classrooms',
      icon: BookOpen,
      desc: 'Equip each section with dedicated LMS rooms mapping 7 subjects and 1 class advisor—complete with lecture materials, timed assignments, and continuous mark tracking.',
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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Line-by-Line Reveal Masks */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="modules-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Layers className="w-3.5 h-3.5 text-neutral-950" />
            <span>Unified Institutional Infrastructure</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            <span className="block overflow-hidden pb-1">
              <span className="modules-heading-line block">Five Core Modules.</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="modules-heading-line block text-neutral-900">One Coordinated Institution.</span>
            </span>
          </h2>

          <p className="modules-desc mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Replace fragmented point solutions and error-prone spreadsheets with an integrated operating system designed for modern colleges.
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
                  <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    to={m.link}
                    className="inline-flex items-center text-xs font-semibold text-neutral-950 group-hover:text-neutral-700 transition-colors"
                  >
                    <span>Explore Module Details</span>
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <span className="text-[11px] font-mono text-neutral-400">
                    0{idx + 1}
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
