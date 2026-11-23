import React from 'react';
import TransitionLink from './TransitionLink';
const Link = TransitionLink;
import { ArrowUp, ArrowUpRight } from 'lucide-react';
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
    <footer className="bg-[#0B0F17] text-neutral-400 border-t border-neutral-800/80 font-sans" itemScope itemType="https://schema.org/WPFooter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        
        {/* Main 4-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Column 1: Company */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-white p-1 shadow-xs flex-shrink-0">
                <img
                  src="/campuscorpo-mark.png"
                  alt="CampusCorpo Emblem Logo"
                  className="h-full w-full object-contain"
                  width="36"
                  height="36"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-bold tracking-tight text-white font-sans leading-none">
                  Campus<span className="font-semibold text-neutral-400">Corpo</span>
                </span>
                <span className="text-[11px] tracking-wider uppercase text-neutral-400 font-medium mt-1">
                  Campus &amp; Career Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed font-normal pr-2">
              Unified institutional governance, semester classroom delivery, automated skill assessments, and campus placement recruiting.
            </p>

            <div className="pt-1 flex items-center gap-2.5 text-neutral-400">
              {companyDetails.socials.map((social) => {
                const Icon = iconMap[social.icon] || GithubIcon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`CampusCorpo on ${social.name}`}
                    className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h3 className="text-[15px] font-semibold text-white tracking-normal mb-4">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-[13.5px] sm:text-[14px] text-neutral-400 font-normal">
              <li>
                <Link to="/solutions/placement-management" className="hover:text-white transition-colors block">
                  Placement Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/student-management" className="hover:text-white transition-colors block">
                  Student 360° Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/faculty-management" className="hover:text-white transition-colors block">
                  Faculty Management
                </Link>
              </li>
              <li>
                <Link to="/solutions/lms" className="hover:text-white transition-colors block">
                  Semester LMS
                </Link>
              </li>
              <li>
                <Link to="/platform" className="hover:text-white transition-colors font-medium text-neutral-300 block">
                  All Modules &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Career & Labs */}
          <div>
            <h3 className="text-[15px] font-semibold text-white tracking-normal mb-4">
              Career &amp; Labs
            </h3>
            <ul className="space-y-2.5 text-[13.5px] sm:text-[14px] text-neutral-400 font-normal">
              <li>
                <Link to="/features/programming-assessment" className="hover:text-white transition-colors block">
                  Coding Assessments
                </Link>
              </li>
              <li>
                <Link to="/features/mock-interviews" className="hover:text-white transition-colors block">
                  Mock Interview Labs
                </Link>
              </li>
              <li>
                <Link to="/career-explorer" className="hover:text-white transition-colors block">
                  16 IT Career Domains
                </Link>
              </li>
              <li>
                <Link to="/company-explorer" className="hover:text-white transition-colors block">
                  IT Company Directory
                </Link>
              </li>
              <li className="pt-0.5">
                <Link to="/login" className="text-white font-medium hover:underline inline-flex items-center gap-1">
                  <span>Portal Sign In</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-[15px] font-semibold text-white tracking-normal mb-4">
              Contact
            </h3>
            <div className="space-y-2.5 text-[13.5px] sm:text-[14px] text-neutral-400 font-normal leading-relaxed">
              <div>
                <a
                  href={`mailto:${companyDetails.email}`}
                  className="text-neutral-300 font-medium hover:text-white hover:underline transition-colors block truncate"
                >
                  {companyDetails.email}
                </a>
              </div>
              <div>
                <a
                  href={`tel:${companyDetails.phoneRaw}`}
                  className="hover:text-white transition-colors block"
                >
                  {companyDetails.phone}
                </a>
              </div>
              <div className="text-neutral-400">
                Tirupur, Tamil Nadu, India
              </div>
              <div className="pt-1">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-white font-medium hover:underline transition-colors"
                >
                  <span>Request a Demo</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Thin Divider */}
        <div className="mt-12 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-neutral-400">
          <div>
            &copy; {companyDetails.year} CampusCorpo Technologies. All Rights Reserved.
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="hover:text-white transition-colors cursor-pointer text-[13px] font-normal"
                aria-label="Replay Opening Intro"
              >
                Replay Intro
              </button>
            )}
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer ml-1"
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
