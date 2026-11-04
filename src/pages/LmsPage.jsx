import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  FileText, 
  HelpCircle, 
  Award, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { campusManagementModules } from '../data/websiteData';

export default function LmsPage({ onOpenDemo }) {
  const seo = routesSEO.lms;
  const moduleData = campusManagementModules.find((m) => m.key === 'lms');

  return (
    <div className="pt-24 pb-20 bg-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { name: 'Solutions', href: '/platform' },
          { name: 'Learning Management System', href: '/solutions/lms' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            SEMESTER-STRUCTURED LMS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            One Learning Space for Every Semester.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Structured semester learning spaces mapping every course code to allocated faculty, lecture slides, timed quizzes, and automated online assignments.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request LMS Walkthrough
            </button>
            <Link
              to="/features/programming-assessment"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Coding Assessment Lab
            </Link>
          </div>
        </div>

        {/* 7 Subjects + 1 Class Advisor Scenario Preview */}
        <div className="py-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  SEMESTER LMS ROOM ARCHITECTURE
                </span>
                <h2 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-0.5">
                  Semester VI • Department of Computer Science &amp; Engineering
                </h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white border border-neutral-200 rounded-full text-neutral-800">
                8 Faculty Assigned Cohort
              </span>
            </div>

            <div className="my-5 p-4 bg-white rounded-xl border border-neutral-200 text-sm text-neutral-700 leading-relaxed font-normal">
              <strong className="text-neutral-950 font-semibold">Curriculum Structure Scenario:</strong> This semester section contains seven theory/practical subjects and one designated class advisor, resulting in <strong className="text-neutral-950 font-semibold">eight allocated faculty members</strong>. Each teacher is mapped to their respective course code with dedicated lecture materials, timed quizzes, and assignment submission trackers.
            </div>

            {/* Grid of Course Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
                <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8601</span>
                <div className="font-semibold text-neutral-950 text-sm">Mobile Computing</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">Faculty: Dr. Arumugam</div>
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium inline-block">
                  Quiz 03 Graded
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
                <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8602</span>
                <div className="font-semibold text-neutral-950 text-sm">Compiler Design</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">Faculty: Prof. Preethi</div>
                <div className="mt-2 text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-medium inline-block">
                  18 Study Notes
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
                <span className="font-semibold text-neutral-500 text-xs block mb-1">CS8603</span>
                <div className="font-semibold text-neutral-950 text-sm">Distributed Systems</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">Faculty: Dr. Ramanathan</div>
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium inline-block">
                  Assignment 02 Live
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
                <span className="font-semibold text-neutral-500 text-xs block mb-1">ADVISOR</span>
                <div className="font-semibold text-neutral-950 text-sm">Class Mentorship</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">Advisor: Prof. Kousalya</div>
                <div className="mt-2 text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-medium inline-block">
                  62 Student Logs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              LMS Features Engineered for Engineering &amp; Arts Colleges
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Direct linkage between daily classroom coursework and campus placement eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleData?.capabilities.map((cap, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-700 leading-relaxed font-normal">{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Navigation */}
        <div className="py-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <Link to="/solutions/faculty-management" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Faculty Management</span>
          </Link>
          <Link to="/features/programming-assessment" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Programming Assessment Engine &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Learning Management System"
        subtitle="Direct answers on semester course code mapping, online assignments, and grading."
      />
    </div>
  );
}

