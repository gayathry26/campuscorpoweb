import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  ChevronDown, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Shield, 
  BookOpen, 
  Code2, 
  MessageSquareText, 
  Compass, 
  Layers 
} from 'lucide-react';

export default function Navbar({ onOpenDemo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] py-2.5'
          : 'bg-white border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Schema Microdata & accessible alt */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none flex-shrink-0"
            aria-label="CampusCorpo Home"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-neutral-200 bg-white p-1 shadow-xs flex items-center justify-center overflow-hidden transition-shadow group-hover:shadow-sm">
              <img
                src="/campuscorpo-mark.png"
                alt="CampusCorpo Logo Emblem"
                className="h-full w-full object-contain"
                width="44"
                height="44"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 leading-none">
                Campus<span className="font-semibold text-neutral-600">Corpo</span>
              </span>
              <span className="text-xs tracking-wider uppercase text-neutral-500 font-semibold mt-0.5">
                Campus &amp; Career Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Standard 14–15px) */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            
            {/* Home */}
            <Link
              to="/"
              className={`px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'text-neutral-950 bg-neutral-100 font-semibold' 
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
              }`}
            >
              Home
            </Link>

            {/* Platform Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/platform"
                className={`flex items-center gap-1 px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                  location.pathname.startsWith('/platform') || location.pathname.startsWith('/solutions') || location.pathname.startsWith('/features')
                    ? 'text-neutral-950 bg-neutral-100 font-semibold'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                <span>Platform</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </Link>

              {/* Popover Mega-Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[560px] bg-white rounded-2xl border border-neutral-200 shadow-2xl p-4 grid grid-cols-2 gap-4 z-50"
                  >
                    {/* Left: Campus Management */}
                    <div className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-100">
                      <div className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2 px-2">
                        Institutional Management
                      </div>
                      <div className="space-y-0.5">
                        <a
                          href="/platform#placement"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-neutral-950 shrink-0" />
                          <span>Placement Management</span>
                        </a>
                        <a
                          href="/platform#student-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                        >
                          <Users className="w-4 h-4 text-neutral-950 shrink-0" />
                          <span>Student 360° Management</span>
                        </a>
                        <a
                          href="/platform#faculty-management"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                        >
                          <GraduationCap className="w-4 h-4 text-neutral-950 shrink-0" />
                          <span>Faculty Management</span>
                        </a>
                        <a
                          href="/platform#administration"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-neutral-950 shrink-0" />
                          <span>Administration &amp; RBAC</span>
                        </a>
                        <a
                          href="/platform#lms"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-neutral-950 shrink-0" />
                          <span>Semester LMS (8 Faculty)</span>
                        </a>
                      </div>
                    </div>

                    {/* Right: Technical Career Development */}
                    <div className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-100 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2 px-2">
                          Technical Development
                        </div>
                        <div className="space-y-0.5">
                          <a
                            href="/platform#coding-assessment"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                          >
                            <Code2 className="w-4 h-4 text-neutral-950 shrink-0" />
                            <span>Programming Assessments</span>
                          </a>
                          <a
                            href="/platform#mock-interviews"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-white hover:text-neutral-950 transition-colors"
                          >
                            <MessageSquareText className="w-4 h-4 text-neutral-950 shrink-0" />
                            <span>Mock Interview Platform</span>
                          </a>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-200/70 mt-3 px-2">
                        <Link
                          to="/platform"
                          onClick={() => setDropdownOpen(false)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-950 hover:underline"
                        >
                          <span>Explore All 7 Modules &rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Career Explorer Direct Link */}
            <Link
              to="/career-explorer"
              className={`px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                location.pathname === '/career-explorer'
                  ? 'text-neutral-950 bg-neutral-100 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
              }`}
            >
              Career Explorer
            </Link>

            {/* Company Explorer Direct Link */}
            <Link
              to="/company-explorer"
              className={`px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                location.pathname === '/company-explorer'
                  ? 'text-neutral-950 bg-neutral-100 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
              }`}
            >
              Company Explorer
            </Link>

            {/* About */}
            <Link
              to="/about"
              className={`px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                location.pathname === '/about'
                  ? 'text-neutral-950 bg-neutral-100 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
              }`}
            >
              About
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className={`px-3.5 py-2 text-[14px] sm:text-[15px] font-medium rounded-lg transition-colors ${
                location.pathname === '/contact'
                  ? 'text-neutral-950 bg-neutral-100 font-semibold'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right CTA */}
          <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-300 shadow-xs transition-all duration-150 group"
            >
              <span>Request a Demo</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-950" />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenDemo}
              className="sm:hidden px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg shadow-xs"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-neutral-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="px-5 pt-3 pb-6 space-y-1 text-sm font-medium">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                Home
              </Link>
              <Link 
                to="/platform" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                Platform
              </Link>
              <div className="pl-4 py-1 space-y-1 text-xs text-neutral-600 border-l-2 border-neutral-200 ml-3">
                <a 
                  href="/platform#placement" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Placement Management
                </a>
                <a 
                  href="/platform#student-management" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Student 360&deg; Management
                </a>
                <a 
                  href="/platform#faculty-management" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Faculty Management
                </a>
                <a 
                  href="/platform#administration" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Administration &amp; RBAC
                </a>
                <a 
                  href="/platform#lms" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Semester LMS
                </a>
                <a 
                  href="/platform#coding-assessment" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; Programming Assessment
                </a>
                <a 
                  href="/platform#mock-interviews" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-neutral-950"
                >
                  &bull; AI Mock Interviews
                </a>
              </div>
              <Link 
                to="/career-explorer" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                Career Explorer
              </Link>
              <Link 
                to="/company-explorer" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                Company Explorer
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 font-semibold"
              >
                Contact
              </Link>

              <div className="pt-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDemo();
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl shadow-xs transition-colors"
                >
                  Request a Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
