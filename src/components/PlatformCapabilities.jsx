import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileCheck, 
  FolderGit2, 
  Layers, 
  Briefcase, 
  Building, 
  Shield, 
  BarChart3,
  Cpu
} from 'lucide-react';
import { platformCapabilities } from '../data/websiteData';

const iconMap = {
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  FolderGit2,
  Layers,
  Briefcase,
  Building,
  Shield,
  BarChart3
};

export default function PlatformCapabilities() {
  return (
    <section id="capabilities" className="py-20 md:py-28 bg-[#fafafa] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-3">
            <Cpu className="w-3.5 h-3.5 text-neutral-950" />
            <span>Institutional Governance</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Comprehensive Platform Capabilities
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
            Ten core modules engineered for multi-department scale, role-based governance, and NAAC/NBA accreditation data compliance.
          </p>
        </div>

        {/* 10 Compact Clean Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {platformCapabilities.map((cap, index) => {
            const Icon = iconMap[cap.icon] || Layers;
            return (
              <motion.div
                key={cap.title}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-950 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-950 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-950 mb-1.5 leading-snug">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[10px] font-mono text-neutral-400">
                  MODULE {String(index + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

