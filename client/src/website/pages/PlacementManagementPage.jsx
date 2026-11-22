import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowRight,
  FileCheck,
  Building2,
  Filter,
  Award
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { campusManagementModules } from '../data/websiteData';

export default function PlacementManagementPage({ onOpenDemo }) {
  const seo = routesSEO.placementManagement;
  const moduleData = campusManagementModules.find((m) => m.key === 'placement');

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
          { name: 'Placement Management', href: '/solutions/placement-management' }
        ]} />

        {/* Hero Section */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            PLACEMENT MANAGEMENT SYSTEM
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Manage the Entire Campus Placement Lifecycle.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Eliminate chaotic spreadsheets. Automate student eligibility filtering, corporate partner communications, drive test slots, and placement conversion reporting.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Placement Demo
            </button>
            <Link
              to="/features/programming-assessment"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              View Coding Assessment Engine
            </Link>
          </div>
        </div>

        {/* Live Placement Hub Preview UI */}
        <div className="py-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  T&amp;P COMMAND HUB PREVIEW
                </span>
                <h2 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-0.5">
                  Corporate Recruitment Operations Console
                </h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white border border-neutral-200 rounded-full text-neutral-800">
                Term 2026-27 Active Season
              </span>
            </div>

            {/* 3 KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Placement Conversion Rate</div>
                <div className="text-2xl sm:text-[30px] font-bold text-neutral-950 mt-1">91.8%</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">842 of 910 eligible students placed</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Active Placement Drives</div>
                <div className="text-2xl sm:text-[30px] font-bold text-neutral-950 mt-1">18 Drives</div>
                <div className="text-xs text-emerald-600 mt-1 font-medium">+4 drives scheduled this week</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Average Package (CTC)</div>
                <div className="text-2xl sm:text-[30px] font-bold text-neutral-950 mt-1">₹7.4 LPA</div>
                <div className="text-xs text-neutral-500 mt-1 font-normal">Highest package verified: ₹28.5 LPA</div>
              </div>
            </div>

            {/* Pipeline Demonstration */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs sm:text-[13px]">
                <span className="font-semibold text-neutral-950">Zoho Corporation (Enterprise SaaS Drive #018)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-medium">
                  Round 2 Interviews In Progress
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs mt-4">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 text-xs uppercase font-medium">Eligible</div>
                  <div className="font-bold text-neutral-950 text-lg mt-0.5">910</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 text-xs uppercase font-medium">Applied</div>
                  <div className="font-bold text-neutral-950 text-lg mt-0.5">724</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 text-xs uppercase font-medium">Shortlisted</div>
                  <div className="font-bold text-neutral-950 text-lg mt-0.5">142</div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 text-xs uppercase font-medium">Verified Offers</div>
                  <div className="font-bold text-emerald-600 text-lg mt-0.5">38</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Capabilities Grid */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Comprehensive Placement Management Capabilities
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Every workflow engineered to handle thousands of candidate profiles, rigorous eligibility criteria, and corporate SLAs.
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

        {/* Related Solutions Navigation */}
        <div className="py-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <Link to="/solutions/student-management" className="text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Student 360° Management</span>
          </Link>
          <Link to="/features/programming-assessment" className="text-neutral-950 hover:underline flex items-center gap-1">
            <span>Online Coding Assessment Platform &rarr;</span>
          </Link>
        </div>

      </div>

      {/* AEO FAQ Section */}
      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Placement Management"
        subtitle="Direct answers regarding college placement management systems and recruiter workflows."
      />
    </div>
  );
}

