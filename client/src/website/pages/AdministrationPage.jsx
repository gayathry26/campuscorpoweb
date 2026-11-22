import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  FileSpreadsheet,
  Database,
  Layers,
  Lock,
  ArrowRight
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { campusManagementModules } from '../data/websiteData';

export default function AdministrationPage({ onOpenDemo }) {
  const seo = routesSEO.administration;
  const moduleData = campusManagementModules.find((m) => m.key === 'admin');

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
          { name: 'Administration Management', href: '/solutions/administration' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            CAMPUS GOVERNANCE &amp; RBAC
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Complete Institutional Control.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Govern multi-branch departments, academic calendars, batch migrations, role-based access permissions, and automated data ingestion with enterprise security.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Admin Walkthrough
            </button>
            <Link
              to="/solutions/faculty-management"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Faculty Coordination
            </Link>
          </div>
        </div>

        {/* Admin Preview */}
        <div className="py-8">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
              <div>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  EXECUTIVE GOVERNANCE CONSOLE
                </span>
                <h2 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-0.5">
                  Apex Institute of Engineering &amp; Technology
                </h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-white border border-neutral-200 rounded-full text-neutral-800">
                Central ERP Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Departments Configured</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">6 Branches</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">CSE, IT, ECE, EEE, Mech, Civil</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Enrolled Students</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">4,850</div>
                <div className="text-xs text-neutral-500 mt-0.5 font-normal">Imported via Excel / CSV sync</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200">
                <div className="text-xs sm:text-[13px] text-neutral-600 font-medium">Role-Based Access</div>
                <div className="text-2xl sm:text-[28px] font-bold text-neutral-950 mt-1">100% Isolated</div>
                <div className="text-xs text-emerald-600 mt-0.5 font-medium">Principal, HOD, TPO, Faculty</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-xs sm:text-[13px]">
              <span className="font-semibold text-neutral-500 uppercase tracking-wider block mb-2 text-xs">Automated Ingestion &amp; Security Pipelines</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <FileSpreadsheet className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                  <div className="font-semibold text-neutral-900 text-xs sm:text-sm">Excel / CSV Parser</div>
                  <div className="text-xs text-neutral-500 mt-0.5 font-normal">Student &amp; Faculty Master Data</div>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Database className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                  <div className="font-semibold text-neutral-900 text-xs sm:text-sm">JSON Schema Mapping</div>
                  <div className="text-xs text-neutral-500 mt-0.5 font-normal">Regulations &amp; Electives</div>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <Lock className="w-4 h-4 mx-auto text-neutral-700 mb-1" />
                  <div className="font-semibold text-neutral-900 text-xs sm:text-sm">Semester Freeze</div>
                  <div className="text-xs text-neutral-500 mt-0.5 font-normal">Audit-Compliant Lockdowns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Institutional Administration Modules
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Complete oversight designed for deans, campus directors, and university registrar offices.
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
            <span>&larr; Faculty Coordination</span>
          </Link>
          <Link to="/solutions/placement-management" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Placement Management Software &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection
        faqs={seo.faqs}
        title="Frequently Asked Questions: Institutional Administration"
        subtitle="Direct answers on role-based access control, CSV student import, and accreditation compliance."
      />
    </div>
  );
}

