import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Layers, ArrowRight, Building2, MapPin } from 'lucide-react';
import { fadeUp, staggerContainer, cardReveal, standardViewport } from '../utils/animations';

export default function CompanyCareerDiscovery() {
  const sampleDomains = [
    'Software Engineering',
    'Cloud Architecture',
    'AI & Machine Learning',
    'DevOps Engineering',
    'Cybersecurity',
    'Full Stack Web',
    'Mobile Application Dev',
    'Data Science & Analytics'
  ];

  const sampleHubs = [
    { city: 'Chennai', desc: 'Enterprise SaaS & Automotive Tech' },
    { city: 'Bengaluru', desc: 'Product Engineering & Cloud Ecosystems' },
    { city: 'Hyderabad', desc: 'Data Platforms & Multinational R&D' },
    { city: 'Pune', desc: 'Automotive Embedded & IT Services' },
    { city: 'Coimbatore', desc: 'Regional Tech Startups & SaaS Hubs' }
  ];

  return (
    <section id="discovery" className="py-20 md:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Compass className="w-3.5 h-3.5 text-neutral-950" />
            <span>Career &amp; Corporate Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Connect Students with Real Industry Opportunities
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            Equip candidates with curated domain curriculum roadmaps and regional corporate employer discovery.
          </p>
        </motion.div>

        {/* Two Balanced Cards: Career Explorer & Company Explorer */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={standardViewport}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          
          {/* Card A: Career Explorer Preview */}
          <motion.div 
            variants={cardReveal}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">16 Core Sectors</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    IT Career Domains &amp; Roadmaps
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-700 leading-relaxed font-normal mb-5">
                Structured taxonomy covering 16 industry sectors, target job roles, required technical skills, developer toolchains, and career progression ladders.
              </p>

              {/* Sample Domain Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sampleDomains.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs sm:text-[13px] font-medium text-neutral-800"
                  >
                    {d}
                  </span>
                ))}
                <span className="px-3 py-1.5 rounded-lg bg-neutral-200/70 text-xs sm:text-[13px] font-semibold text-neutral-700">
                  +8 more domains
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-neutral-500 font-medium">Curriculum &amp; skill roadmaps</span>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/career-explorer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Explore Career Domains</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Card B: Company Explorer Preview */}
          <motion.div 
            variants={cardReveal}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">5 Tech Clusters</span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Regional IT Company Directory
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-700 leading-relaxed font-normal mb-5">
                Curated directory of product and IT services employers across India's premier technology centers with active hiring tracks and direct career portal links.
              </p>

              {/* Sample Cities List */}
              <div className="space-y-2 mb-6">
                {sampleHubs.map((hub) => (
                  <div key={hub.city} className="flex items-center justify-between text-xs sm:text-[13px] bg-white p-2.5 sm:p-3 rounded-lg border border-neutral-200">
                    <span className="font-semibold text-neutral-950 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                      {hub.city}
                    </span>
                    <span className="text-neutral-600 font-medium">{hub.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-neutral-500 font-medium">Verified corporate career links</span>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/company-explorer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>Explore Company Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

