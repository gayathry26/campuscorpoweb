import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layout,
  Server,
  Layers,
  Smartphone,
  Monitor,
  BarChart3,
  LineChart,
  Brain,
  Sparkles,
  Database,
  HardDrive,
  Cloud,
  GitBranch,
  Network,
  Cpu,
  ShieldCheck,
  Key,
  Search,
  CheckSquare,
  Headphones,
  Palette,
  Briefcase,
  Boxes,
  Building2,
  CalendarCheck,
  Bot,
  Gamepad2,
  Link as LinkIcon,
  Workflow,
  FlaskConical,
  Users,
  CreditCard,
  Stethoscope,
  MapPin,
  FileCode,
  GraduationCap,
  Award,
  ArrowRight,
  X,
} from 'lucide-react';

export const DOMAIN_ICONS = {
  'Web Development & Frontend Engineering': Layout,
  'Backend & API Development': Server,
  'Full-Stack & Enterprise Software': Layers,
  'Mobile Application Development': Smartphone,
  'Desktop, Systems & Embedded Software': Monitor,
  'Data Analytics & Business Intelligence': BarChart3,
  'Data Science & Statistical Modeling': LineChart,
  'Artificial Intelligence & Machine Learning': Brain,
  'Generative AI & LLM Engineering': Sparkles,
  'Data Engineering & Big Data': Database,
  'Database & Data Platform Administration': HardDrive,
  'Cloud Computing & Cloud Engineering': Cloud,
  'DevOps, Platform Engineering & SRE': GitBranch,
  'Networking & Telecommunications': Network,
  'IT Infrastructure & Systems Administration': Cpu,
  'Cybersecurity & Information Security': ShieldCheck,
  'Ethical Hacking & Offensive Security': Key,
  'Digital Forensics, Incident Response & Governance': Search,
  'Software Testing & Quality Assurance': CheckSquare,
  'IT Support & IT Service Management': Headphones,
  'UI/UX & Product Design': Palette,
  'Product Management & Business Analysis': Briefcase,
  'Systems Architecture & Enterprise Integration': Boxes,
  'Enterprise Applications, ERP & CRM': Building2,
  'IT Project, Program & Delivery Management': CalendarCheck,
  'Robotics, IoT & Industrial Automation': Bot,
  'Game Development, Graphics & XR': Gamepad2,
  'Blockchain & Web3': LinkIcon,
  'Hardware, Semiconductor & Computer Engineering': Cpu,
  'MLOps, AI Infrastructure & Responsible AI': Workflow,
  'Research Computing & Scientific Technology': FlaskConical,
  'Technology Consulting & Technical Solutions': Users,
  'FinTech & Financial Technology': CreditCard,
  'HealthTech & Medical Informatics': Stethoscope,
  'GIS, Geospatial & Location Technology': MapPin,
  'Technical Writing & Developer Experience': FileCode,
  'IT Training & Technical Education': GraduationCap,
  'IT Governance, Risk & IT Leadership': Award,

  // Fallbacks
  'Software Development': Layout,
  'Data Science & Analytics': LineChart,
  Cybersecurity: ShieldCheck,
  'Cloud Computing & DevOps': Cloud,
  'UI/UX & Design': Palette,
  'Emerging Technologies': Boxes,
  'Testing & Quality Assurance': CheckSquare,
  'Business Analysis': Briefcase,
  'Product Management': Briefcase,
  Networking: Network,
};

export function InteractiveDomainGrid({
  domains = [],
  allRoles = [],
  searchQuery = '',
  selectedFamily = 'All Families',
  sortBy = 'alphabetical-asc',
  onClearSearch,
}) {
  const sampleRolesMap = useMemo(() => {
    const map = {};
    allRoles.forEach((role) => {
      const cat = role.category;
      if (!map[cat]) map[cat] = [];
      if (map[cat].length < 4) map[cat].push(role.title);
      if (Array.isArray(role.domainIds)) {
        role.domainIds.forEach((dId) => {
          if (!map[dId]) map[dId] = [];
          if (map[dId].length < 4 && !map[dId].includes(role.title)) {
            map[dId].push(role.title);
          }
        });
      }
    });
    return map;
  }, [allRoles]);

  const filteredDomains = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let list = domains.filter((d) => {
      if (selectedFamily && selectedFamily !== 'All Families') {
        if ((d.family || '').toLowerCase() !== selectedFamily.toLowerCase()) return false;
      }
      if (!q) return true;
      const nameMatch = d.name.toLowerCase().includes(q);
      const descMatch = (d.shortDescription || d.description || '').toLowerCase().includes(q);
      const overviewMatch = (d.overview || '').toLowerCase().includes(q);
      const techMatch = (d.coreTechnologies || []).some((t) => t.toLowerCase().includes(q));
      const sampleMatch = (sampleRolesMap[d.name] || sampleRolesMap[d.id] || []).some((r) =>
        r.toLowerCase().includes(q)
      );
      return nameMatch || descMatch || overviewMatch || techMatch || sampleMatch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'alphabetical-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'roles-desc') return (b.roleCount || 0) - (a.roleCount || 0);
      return a.name.localeCompare(b.name);
    });
  }, [domains, searchQuery, selectedFamily, sortBy, sampleRolesMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Career Domains</h2>
          <span className="text-xs font-medium text-muted-foreground">
            ({filteredDomains.length} available)
          </span>
        </div>
        {searchQuery.trim().length > 0 && (
          <span className="text-xs text-[#8B2942] font-medium">Filtered results</span>
        )}
      </div>

      {/* Compact Uniform 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.name] || Layers;
          const domainUrl = `/career-explorer/domains/${domain.id}`;

          return (
            <Link
              key={domain.id || domain.name}
              to={domainUrl}
              className="group bg-card text-card-foreground rounded-xl border border-border hover:border-[#8B2942]/45 p-4 flex flex-col justify-between gap-3.5 transition-all shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] group-hover:bg-[#8B2942] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground border border-border shrink-0">
                  {domain.roleCount || 0} {domain.roleCount === 1 ? 'Role' : 'Roles'} • 12 Modules
                </span>
              </div>

              <div className="space-y-1 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-[#8B2942] dark:group-hover:text-[#F2B8C7] transition-colors leading-snug">
                  {domain.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {domain.shortDescription || domain.description || 'Specialized IT career discipline with structured skills and industry roles.'}
                </p>
              </div>

              <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7]">
                <span>Explore Domain</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredDomains.length === 0 && (
        <div className="p-10 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">No career domains matched your search</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your keywords or clearing category filters.
            </p>
          </div>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#8B2942] text-white rounded-lg hover:bg-[#702038] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default InteractiveDomainGrid;
