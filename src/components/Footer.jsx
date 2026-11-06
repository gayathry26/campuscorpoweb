import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, ArrowUp } from 'lucide-react';
import { companyDetails } from '../data/websiteData';

const iconMap = {
  Linkedin,
  Twitter,
  Github
};

export default function Footer({ onReplayIntro }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800" itemScope itemType="https://schema.org/WPFooter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white p-1.5 shadow-sm overflow-hidden flex-shrink-0">
                <img
                  src="/campuscorpo-mark.png"
                  alt="CampusCorpo Emblem Logo"
                  className="h-full w-full object-contain"
                  width="48"
                  height="48"
                />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  CampusCorpo
                </span>
                <span className="block text-xs tracking-wider uppercase text-neutral-400 font-medium">
                  Campus Management Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm font-normal">
              {companyDetails.description}
            </p>

            <div className="pt-2 flex items-center space-x-3 text-neutral-400">
              {companyDetails.socials.map((social) => {
                const Icon = iconMap[social.icon] || Github;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`CampusCorpo on ${social.name}`}
                    className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:text-white hover:border-neutral-600 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Campus Management (3 Cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">
              Campus Management
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400 font-normal">
              <li>
                <a href="/platform#placement" className="hover:text-white transition-colors">
                  Placement Management
                </a>
              </li>
              <li>
                <a href="/platform#student-management" className="hover:text-white transition-colors">
                  Student Management
                </a>
              </li>
              <li>
                <a href="/platform#faculty-management" className="hover:text-white transition-colors">
                  Faculty Management
                </a>
              </li>
              <li>
                <a href="/platform#administration" className="hover:text-white transition-colors">
                  Administration &amp; RBAC
                </a>
              </li>
              <li>
                <a href="/platform#lms" className="hover:text-white transition-colors">
                  Semester LMS
                </a>
              </li>
              <li>
                <Link to="/platform" className="hover:text-white transition-colors">
                  Complete Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Career & Opportunities (2.5 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">
              Career &amp; Placements
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400 font-normal">
              <li>
                <a href="/platform#coding-assessment" className="hover:text-white transition-colors">
                  Coding Assessments
                </a>
              </li>
              <li>
                <a href="/platform#mock-interviews" className="hover:text-white transition-colors">
                  Mock Interview System
                </a>
              </li>
              <li>
                <Link to="/company-explorer" className="hover:text-white transition-colors">
                  IT Company Explorer
                </Link>
              </li>
              <li>
                <Link to="/career-explorer" className="hover:text-white transition-colors">
                  16 IT Career Domains
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About CampusCorpo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (2.5 Cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">
              Direct Contact
            </h3>
            <div className="space-y-3 text-sm text-neutral-400 font-normal leading-relaxed" itemScope itemType="https://schema.org/PostalAddress">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                <span itemProp="streetAddress">{companyDetails.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-white flex-shrink-0" />
                <a href={`mailto:${companyDetails.email}`} className="hover:text-white transition-colors" itemProp="email">
                  {companyDetails.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-white flex-shrink-0" />
                <a href={`tel:${companyDetails.phoneRaw}`} className="hover:text-white transition-colors" itemProp="telephone">
                  {companyDetails.phone}
                </a>
              </div>
              <div className="pt-3">
                <Link
                  to="/contact"
                  className="inline-block px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  Schedule Institutional Consultation &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            Copyright © {companyDetails.year} CampusCorpo Technologies. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="hover:text-neutral-300 transition-colors cursor-pointer text-xs font-normal"
                aria-label="Replay Cinematic Opening Intro"
              >
                Replay Intro
              </button>
            )}
            <Link to="/about" className="hover:text-neutral-300 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-neutral-300 transition-colors">Contact</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 p-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Back to Top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
