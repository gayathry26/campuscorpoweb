import React from 'react';
import TransitionLink from './TransitionLink';
const Link = TransitionLink;
import { Mail, Phone, MapPin, ArrowUp, ArrowUpRight } from 'lucide-react';
import { companyDetails } from '../data/websiteData';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const iconMap = {
  Linkedin: LinkedinIcon,
  Twitter: TwitterIcon,
  Github: GithubIcon
};

export default function Footer({ onReplayIntro }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAFAFA] text-neutral-600 border-t border-neutral-200/90" itemScope itemType="https://schema.org/WPFooter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-neutral-200 p-1 shadow-2xs flex-shrink-0 group-hover:shadow-xs transition-shadow">
                <img
                  src="/campuscorpo-mark.png"
                  alt="CampusCorpo Emblem Logo"
                  className="h-full w-full object-contain"
                  width="40"
                  height="40"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-neutral-950 font-sans leading-none">
                  Campus<span className="font-semibold text-neutral-600">Corpo</span>
                </span>
                <span className="text-[11px] tracking-wider uppercase text-neutral-500 font-semibold mt-1">
                  Campus &amp; Career Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm font-normal">
              Unified institutional governance, semester classroom delivery, automated skill assessments, and campus placement recruiting.
            </p>

            <div className="pt-1 flex items-center gap-2.5 text-neutral-500">
              {companyDetails.socials.map((social) => {
                const Icon = iconMap[social.icon] || GithubIcon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`CampusCorpo on ${social.name}`}
                    className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:border-neutral-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Solutions (3 Cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-neutral-950 uppercase tracking-wider font-mono mb-4">
              Solutions
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600 font-normal">
              <li>
                <Link to="/solutions/placement-management" className="hover:text-neutral-950 transition-colors">
                  Placement Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/student-management" className="hover:text-neutral-950 transition-colors">
                  Student 360° Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/faculty-management" className="hover:text-neutral-950 transition-colors">
                  Faculty Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/administration" className="hover:text-neutral-950 transition-colors">
                  Administration &amp; RBAC
                </Link>
              </li>
              <li>
                <Link to="/solutions/lms" className="hover:text-neutral-950 transition-colors">
                  Semester LMS
                </Link>
              </li>
              <li>
                <Link to="/platform" className="hover:text-neutral-950 transition-colors font-medium text-neutral-900">
                  All 7 Modules &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Career & Labs (2.5 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-neutral-950 uppercase tracking-wider font-mono mb-4">
              Career &amp; Labs
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600 font-normal">
              <li>
                <Link to="/features/programming-assessment" className="hover:text-neutral-950 transition-colors">
                  Coding Assessments
                </Link>
              </li>
              <li>
                <Link to="/features/mock-interviews" className="hover:text-neutral-950 transition-colors">
                  Mock Interview Labs
                </Link>
              </li>
              <li>
                <Link to="/career-explorer" className="hover:text-neutral-950 transition-colors">
                  16 IT Career Domains
                </Link>
              </li>
              <li>
                <Link to="/company-explorer" className="hover:text-neutral-950 transition-colors">
                  IT Company Directory
                </Link>
              </li>
              <li className="pt-1">
                <Link to="/login" className="text-neutral-950 font-semibold hover:underline inline-flex items-center gap-1">
                  <span>Portal Sign In</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact (3 Cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-neutral-950 uppercase tracking-wider font-mono mb-4">
              Direct Contact
            </h3>
            <div className="space-y-2.5 text-sm text-neutral-600 font-normal leading-relaxed" itemScope itemType="https://schema.org/PostalAddress">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-950 flex-shrink-0 mt-0.5" />
                <span itemProp="streetAddress">{companyDetails.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-neutral-950 flex-shrink-0" />
                <a href={`mailto:${companyDetails.email}`} className="text-neutral-950 font-medium hover:underline" itemProp="email">
                  {companyDetails.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-neutral-950 flex-shrink-0" />
                <a href={`tel:${companyDetails.phoneRaw}`} className="hover:text-neutral-950 transition-colors" itemProp="telephone">
                  {companyDetails.phone}
                </a>
              </div>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span>Request Institutional Demo</span>
                  <ArrowUpRight className="h-3 w-3 text-neutral-400" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {companyDetails.year} CampusCorpo Technologies. All Rights Reserved.
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="hover:text-neutral-950 transition-colors cursor-pointer text-xs font-normal"
                aria-label="Replay Cinematic Opening Intro"
              >
                Replay Intro
              </button>
            )}
            <Link to="/about" className="hover:text-neutral-950 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-neutral-950 transition-colors">Contact</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-300 transition-colors shadow-2xs cursor-pointer"
              title="Back to Top"
              aria-label="Back to Top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
