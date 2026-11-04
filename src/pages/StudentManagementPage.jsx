import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Award, 
  Code2, 
  BookOpen, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { campusManagementModules } from '../data/websiteData';

export default function StudentManagementPage({ onOpenDemo }) {
  const seo = routesSEO.studentManagement;
  const moduleData = campusManagementModules.find((m) => m.key === 'student');

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
          { name: 'Student Management', href: '/solutions/student-management' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            CENTRALIZED STUDENT INFORMATION SYSTEM
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Every Student. One Complete Profile.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Centralize academic credentials, verified skills, coding challenge benchmarks, mock ratings, and placement eligibility into a single digital student portfolio.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Student Portal Demo
            </button>
            <Link
              to="/solutions/placement-management"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Placement Integration
            </Link>
          </div>
        </div>

        {/* Student 360 UI Preview */}
        <div className="py-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-950 text-white font-bold flex items-center justify-center text-sm">
                  AK
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Ananya Krishnan • Roll 22CS104
                  </h2>
                  <p className="text-xs sm:text-[13px] text-neutral-600 font-normal">
                    B.E. Computer Science &amp; Engineering • Batch 2022-26 • Semester VI
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                Tier-1 Dream Eligible (&gt;10 LPA)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Cumulative CGPA</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">8.84</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">0 Active Arrears • 100% Attendance Verified</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Coding Benchmark</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">Top 5%</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">18 Challenges Solved • 94.2% Test Accuracy</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Mock Interview Rating</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">4.7 / 5.0</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">Technical &amp; HR Rounds Cleared</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
              <span className="font-semibold text-neutral-500 uppercase tracking-wider block mb-2 text-xs">Verified Skill Competency Matrix</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">Data Structures &amp; Algorithms</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">Node.js &amp; Express</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">PostgreSQL</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">Distributed Systems</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded text-neutral-800 font-medium">Docker Containers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Integrated Student Profile Capabilities
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Transform raw student transcripts into verifiable career portfolios that corporate recruiters trust.
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
            <span>&larr; Faculty Management &amp; Mentorship</span>
          </Link>
          <Link to="/solutions/placement-management" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Placement Management Software &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Student Management"
        subtitle="Direct answers on student records, digital portfolios, and placement tier classification."
      />
    </div>
  );
}

