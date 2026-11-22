import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import { routesSEO } from '../data/seoData';
import { companyDetails } from '../data/websiteData';
import { fadeUp, standardViewport } from '../utils/animations';

export default function AboutPage({ onOpenDemo }) {
  const seo = routesSEO.about;

  return (
    <AnimatedPageWrapper className="pt-24 pb-20 bg-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { name: 'About CampusCorpo', href: '/about' }
        ]} />

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-12 md:py-16 text-center max-w-3xl mx-auto"
        >
          <div className="h-16 w-16 mx-auto mb-4 bg-white border border-neutral-200 rounded-2xl p-2 shadow-xs flex items-center justify-center">
            <img src="/campuscorpo-mark.png" alt="CampusCorpo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            ABOUT CAMPUSCORPO
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            One Platform. Complete Campus Management.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            CampusCorpo is an integrated campus-to-career management platform that connects institutional administration, placement operations, student development, faculty coordination, and career opportunities through one connected ecosystem.
          </p>
        </motion.div>

        {/* Institutional Mission & Architectural Philosophy */}
        <div className="space-y-8 py-8 border-t border-neutral-200 text-base text-neutral-700 leading-relaxed font-normal">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
          >
            <h2 className="text-xl sm:text-2xl md:text-[24px] font-semibold text-neutral-950 mb-3">
              Our Institutional Purpose
            </h2>
            <p>
              Modern higher education institutions in India face a persistent challenge: academic course management and campus placement operations exist in isolated silos. Students attend classes and complete exams, but placement cells often lack real-time visibility into each candidate's genuine technical competence, algorithmic problem-solving ability, or interview articulation until recruiters arrive on campus.
            </p>
            <p className="mt-3">
              CampusCorpo was engineered from the ground up to unify this entire lifecycle. By integrating daily course code syllabus tracking and LMS materials with timed coding evaluations and mock interviews, institutions can continuously nurture and benchmark student placement readiness throughout their college degree.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
          >
            <h2 className="text-xl sm:text-2xl md:text-[24px] font-semibold text-neutral-950 mb-3">
              The Three Core Pillars of CampusCorpo
            </h2>
            <div className="space-y-4">
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className="p-5 rounded-xl bg-neutral-50 border border-neutral-200"
              >
                <h3 className="font-semibold text-base sm:text-lg text-neutral-950">1. Institution Management Core</h3>
                <p className="text-sm text-neutral-600 mt-1 font-normal leading-relaxed">
                  Connects multi-branch academic departments, faculty allocations, course code syllabi, 7 subjects + 1 class advisor allocations, and centralized student records.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className="p-5 rounded-xl bg-neutral-50 border border-neutral-200"
              >
                <h3 className="font-semibold text-base sm:text-lg text-neutral-950">2. Technical Career Development</h3>
                <p className="text-sm text-neutral-600 mt-1 font-normal leading-relaxed">
                  Features built-in multi-language programming assessments, automated test-case evaluation, proctoring locks, and structured technical &amp; HR mock interview simulations.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className="p-5 rounded-xl bg-neutral-50 border border-neutral-200"
              >
                <h3 className="font-semibold text-base sm:text-lg text-neutral-950">3. Corporate Opportunity &amp; Recruitment</h3>
                <p className="text-sm text-neutral-600 mt-1 font-normal leading-relaxed">
                  Enables location-based IT company discovery across Chennai, Coimbatore, Bengaluru, Hyderabad, and Pune, with 16 domain career roadmaps and automated placement drive management.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={standardViewport}
          >
            <h2 className="text-xl sm:text-2xl md:text-[24px] font-semibold text-neutral-950 mb-3">
              Genuine Business &amp; Location Information
            </h2>
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-950">Legal Entity: </span>
                  <span className="text-neutral-700">CampusCorpo Technologies</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-950">Office Address: </span>
                  <span className="text-neutral-700">{companyDetails.address}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-950">Official Support: </span>
                  <a href={`mailto:${companyDetails.email}`} className="text-neutral-950 underline font-medium">
                    {companyDetails.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-950">Helpline: </span>
                  <a href={`tel:${companyDetails.phoneRaw}`} className="text-neutral-950 underline font-medium">
                    {companyDetails.phone}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="py-10 border-t border-neutral-200 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-950 mb-2">
            Schedule a CampusCorpo Walkthrough
          </h2>
          <p className="text-sm text-neutral-600 mb-5 font-normal">
            Experience our placement management, LMS, and coding assessment workflows.
          </p>
          <div className="flex justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenDemo}
              className="px-6 py-2.5 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Request a Demo
            </motion.button>
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 font-medium text-sm hover:bg-neutral-50 transition-colors"
            >
              Contact Team
            </Link>
          </div>
        </div>

      </div>

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: About CampusCorpo"
        subtitle="Verifiable institutional facts about CampusCorpo."
      />
    </AnimatedPageWrapper>
  );
}
