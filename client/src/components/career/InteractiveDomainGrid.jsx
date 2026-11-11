import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CAREER_FAMILIES, CAREER_LEVELS } from '../../data/masterCareerDomains';

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
  totalRolesCount = 0,
}) {
  // Filter States
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');

  // Map sample role names for search matching
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

  // Combined Filtering
  const filteredDomains = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const skillQ = selectedSkill.toLowerCase().trim();

    let list = domains.filter((d) => {
      // 1. Search Query (name, description, overview, core technologies, sample roles)
      if (q) {
        const nameMatch = d.name.toLowerCase().includes(q);
        const descMatch = (d.shortDescription || d.description || '').toLowerCase().includes(q);
        const overviewMatch = (d.overview || '').toLowerCase().includes(q);
        const techMatch = (d.coreTechnologies || []).some((t) => t.toLowerCase().includes(q));
        const sampleMatch = (sampleRolesMap[d.name] || sampleRolesMap[d.id] || []).some((r) =>
          r.toLowerCase().includes(q)
        );
        if (!nameMatch && !descMatch && !overviewMatch && !techMatch && !sampleMatch) {
          return false;
        }
      }

      // 2. Family filter
      if (selectedFamily !== 'All Families') {
        if (d.family !== selectedFamily) return false;
      }

      // 3. Skill filter
      if (skillQ) {
        const hasSkillInDomain = (d.coreTechnologies || []).some((t) =>
          t.toLowerCase().includes(skillQ)
        );
        const hasSkillInRoles = allRoles.some(
          (r) =>
            (r.category === d.name || (r.domainIds && r.domainIds.includes(d.id))) &&
            ((r.technicalSkills || []).some((s) => s.toLowerCase().includes(skillQ)) ||
              (r.tools || []).some((t) => t.toLowerCase().includes(skillQ)))
        );
        if (!hasSkillInDomain && !hasSkillInRoles) return false;
      }

      // 4. Beginner friendly filter
      if (beginnerOnly) {
        const hasBeginnerRole = allRoles.some(
          (r) =>
            (r.category === d.name || (r.domainIds && r.domainIds.includes(d.id))) &&
            r.isBeginnerFriendly
        );
        if (!hasBeginnerRole) return false;
      }

      // 5. Level filter
      if (selectedLevel !== 'All Levels') {
        const hasLevelRole = allRoles.some(
          (r) =>
            (r.category === d.name || (r.domainIds && r.domainIds.includes(d.id))) &&
            r.level === selectedLevel
        );
        if (!hasLevelRole) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'roles-desc') return (b.roleCount || 0) - (a.roleCount || 0);
      if (sortBy === 'roles-asc') return (a.roleCount || 0) - (b.roleCount || 0);
      return 0;
    });

    return list;
  }, [
    domains,
    allRoles,
    searchQuery,
    selectedFamily,
    selectedLevel,
    selectedSkill,
    beginnerOnly,
    sortBy,
    sampleRolesMap,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedFamily !== 'All Families' ||
    selectedLevel !== 'All Levels' ||
    selectedSkill.trim().length > 0 ||
    beginnerOnly;

  const handleResetFilters = () => {
    setSelectedFamily('All Families');
    setSelectedLevel('All Levels');
    setSelectedSkill('');
    setBeginnerOnly(false);
    setSortBy('name-asc');
  };

  return (
    <div className="space-y-6">
      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {/* Career Family Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Career Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/10 cursor-pointer"
              >
                {CAREER_FAMILIES.map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            {/* Career Level Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Career Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/10 cursor-pointer"
              >
                {CAREER_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology / Skill Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Technology / Skill
              </label>
              <input
                type="text"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                placeholder="e.g. React, Python, AWS"
                className="w-full h-10 px-3 rounded-xl text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs sm:text-sm font-medium bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600/10 cursor-pointer"
              >
                <option value="name-asc">Domain Name (A → Z)</option>
                <option value="name-desc">Domain Name (Z → A)</option>
                <option value="roles-desc">Available Roles (High → Low)</option>
                <option value="roles-asc">Available Roles (Low → High)</option>
              </select>
            </div>
          </div>

          {/* Action Toggles: Beginner-Friendly & Reset */}
          <div className="flex items-center gap-2 pt-2 lg:pt-5 self-end shrink-0">
            <button
              type="button"
              onClick={() => setBeginnerOnly(!beginnerOnly)}
              className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                beginnerOnly
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {beginnerOnly && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>Beginner-Friendly Only</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= RESULTS HEADER ================= */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Available Domains
          </h2>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            ({filteredDomains.length} {filteredDomains.length === 1 ? 'domain' : 'domains'})
          </span>
        </div>
        {hasActiveFilters && (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Filters Active
          </span>
        )}
      </div>

      {/* ================= SPACIOUS MINIMAL DOMAIN CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.name] || Layers;
          const domainUrl = `/career-explorer/domains/${domain.id}`;

          return (
            <motion.div
              key={domain.id || domain.name}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="h-full"
            >
              <Link
                to={domainUrl}
                className="group h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 hover:border-purple-500/40 dark:hover:border-purple-500/40 p-6 flex flex-col justify-between space-y-5 transition-all shadow-xs hover:shadow-md cursor-pointer select-none"
              >
                {/* Top Section: Icon & Role Count Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                    <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shrink-0">
                    {domain.roleCount} {domain.roleCount === 1 ? 'Role' : 'Roles'}
                  </span>
                </div>

                {/* Middle Section: Domain Name & Short Description */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                    {domain.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {domain.shortDescription || domain.description || 'Specialized IT career discipline with structured skills and industry roles.'}
                  </p>
                </div>

                {/* Bottom Action: Clean "Explore Domain →" */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  <span>Explore Domain</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filteredDomains.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-3.5 my-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              No career domains matched your filters
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing career family filters, or resetting search filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default InteractiveDomainGrid;
