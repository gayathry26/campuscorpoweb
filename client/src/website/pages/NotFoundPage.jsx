import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass, Briefcase, HelpCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';

export default function NotFoundPage() {
  const seo = routesSEO.notFound;

  return (
    <AnimatedPageWrapper className="pt-32 pb-24 bg-white text-center">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          ERROR 404
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight mt-2">
          Page Not Found
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
          The page you are looking for may have been moved, renamed, or does not exist. Use the navigation links below to explore CampusCorpo's modules.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/platform"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-900 font-medium text-sm hover:bg-neutral-50 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Platform Overview</span>
          </Link>
        </div>

        {/* Helpful Popular Links */}
        <div className="mt-14 pt-8 border-t border-neutral-200 text-left">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-3 text-center">
            Popular Product Destinations
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <Link to="/solutions/placement-management" className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <span className="font-semibold text-sm text-neutral-950 block">Placement Management</span>
              <span className="text-xs text-neutral-500 font-normal">Automate campus recruitment drives</span>
            </Link>
            <Link to="/features/programming-assessment" className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <span className="font-semibold text-sm text-neutral-950 block">Coding Assessments</span>
              <span className="text-xs text-neutral-500 font-normal">Automated test-case evaluation engine</span>
            </Link>
            <Link to="/company-explorer" className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <span className="font-semibold text-sm text-neutral-950 block">IT Company Explorer</span>
              <span className="text-xs text-neutral-500 font-normal">Discover companies across 5 tech hubs</span>
            </Link>
            <Link to="/career-explorer" className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
              <span className="font-semibold text-sm text-neutral-950 block">16 IT Career Domains</span>
              <span className="text-xs text-neutral-500 font-normal">Skills, tools, and progression roadmaps</span>
            </Link>
          </div>
        </div>

      </div>
    </AnimatedPageWrapper>
  );
}

