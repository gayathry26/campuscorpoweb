import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  FileCheck, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { campusManagementModules } from '../data/websiteData';

export default function FacultyManagementPage({ onOpenDemo }) {
  const seo = routesSEO.facultyManagement;
  const moduleData = campusManagementModules.find((m) => m.key === 'faculty');

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
          { name: 'Faculty Management', href: '/solutions/faculty-management' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            ACADEMIC COORDINATION &amp; WORKLOADS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Connect Faculty. Coordinate Better.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Manage course code allocations, class advisor duties, cohort mentorship logs, and automated syllabus completion tracking in one clean workspace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Faculty Demo
            </button>
            <Link
              to="/solutions/lms"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Semester LMS Integration
            </Link>
          </div>
        </div>

        {/* Faculty Workbench Preview */}
        <div className="py-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  FACULTY ACADEMIC WORKBENCH PREVIEW
                </span>
                <h2 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-0.5">
                  Dr. S. Ramanathan • Professor (Computer Science)
                </h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white border border-neutral-200 rounded-full text-neutral-800">
                Odd Term 2026-27 Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Allocated Subjects</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">3 Courses</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">CS8491, CS8492, CS8461 Lab</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Class Advisor Role</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">Section A (62 Students)</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">Mentorship &amp; Arrear Tracking Active</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Syllabus Completion</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">98.4% Synced</div>
                <div className="text-xs text-emerald-600 mt-0.5 font-medium">14 Study Materials Published</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-xs sm:text-[13px] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="font-semibold text-neutral-950">Assigned Semester Subjects Roster</span>
                <span className="text-neutral-500 font-medium">CS Department</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900">CS8491 Distributed Systems (4 Credits)</span>
                  <div className="text-xs text-neutral-500 font-normal">Semester VI Section A • 62 Students Enrolled</div>
                </div>
                <span className="text-emerald-700 font-medium text-xs">Quiz 02: 96% Submissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Faculty Coordination &amp; Teaching Modules
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Structured tools that reduce administrative burden and let teachers focus on mentoring students.
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
          <Link to="/solutions/administration" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Administration &amp; RBAC</span>
          </Link>
          <Link to="/solutions/lms" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Semester Learning Management System (LMS) &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Faculty Management"
        subtitle="Direct answers on course code allocations, class advisor duties, and teaching workflows."
      />
    </div>
  );
}

