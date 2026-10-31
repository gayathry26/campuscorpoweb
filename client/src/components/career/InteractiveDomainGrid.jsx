import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  PieChart,
} from 'lucide-react';
import { CAREER_FAMILIES, CAREER_LEVELS } from '../../data/masterCareerDomains';

export const DOMAIN_ICONS = {
  // Exact names
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
  'Product Management': CompassIcon,
  Networking: Network,
};

function CompassIcon(props) {
  return <Briefcase {...props} />;
}

export function InteractiveDomainGrid({
  domains = [],
  allRoles = [],
  searchQuery = '',
  totalRolesCount = 0,
}) {
  const navigate = useNavigate();

  // Filter States
  const [selectedFamily, setSelectedFamily] = useState('All Families');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [showInsights, setShowInsights] = useState(true);

  // Map sample role names for each domain
  const sampleRolesMap = useMemo(() => {
    const map = {};
    allRoles.forEach((role) => {
      const cat = role.category;
      if (!map[cat]) map[cat] = [];
      if (map[cat].length < 3) {
        map[cat].push(role.title);
      }
      // Also map via domainIds
      if (Array.isArray(role.domainIds)) {
        role.domainIds.forEach((dId) => {
          if (!map[dId]) map[dId] = [];
          if (map[dId].length < 3 && !map[dId].includes(role.title)) {
            map[dId].push(role.title);
          }
        });
      }
    });
    return map;
  }, [allRoles]);

  // Family role count distribution for compact insight chart
  const familyDistribution = useMemo(() => {
    const counts = {};
    CAREER_FAMILIES.filter((f) => f !== 'All Families').forEach((f) => {
      counts[f] = 0;
    });

    domains.forEach((d) => {
      const fam = d.family || 'Software & Web Engineering';
      if (counts[fam] !== undefined) {
        counts[fam] += d.roleCount || 0;
      } else {
        counts[fam] = d.roleCount || 0;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([family, count]) => ({
      family,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [domains]);

  const maxRoleCount = useMemo(() => {
    return Math.max(...domains.map((d) => d.roleCount || 0), 1);
  }, [domains]);

  // Combined Filtering
  const filteredDomains = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const skillQ = selectedSkill.toLowerCase().trim();

    let list = domains.filter((d) => {
      // 1. Search Query
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
      {/* ================= OPTIONAL VISUAL INSIGHTS ================= */}
      {/* Compact chart showing role distribution across Career Families */}
      {showInsights && (
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                Career Family Distribution (Actual Catalogue Data)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowInsights(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hide Insights
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Distribution of {totalRolesCount || allRoles.length} documented IT roles across {domains.length} technology disciplines:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {familyDistribution.map((item) => {
              const isSelected = selectedFamily === item.family;
              return (
                <button
                  key={item.family}
                  type="button"
                  onClick={() =>
                    setSelectedFamily(isSelected ? 'All Families' : item.family)
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-secondary/40 border-border/80 hover:bg-secondary text-foreground'
                  }`}
                  title={`Filter by ${item.family}`}
                >
                  <span className="text-[10px] font-bold block truncate opacity-75">
                    {item.family.split('&')[0].trim()}
                  </span>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-base font-black">{item.count}</span>
                    <span className="text-[10px] opacity-75">{item.percentage}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: FUNCTIONAL FILTER TOOLBAR ================= */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 flex-1">
            {/* 1. Career Family Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Career Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-secondary text-foreground border border-border/80 focus:outline-none focus:ring-1 focus:ring-foreground/20 cursor-pointer"
              >
                {CAREER_FAMILIES.map((fam) => (
                  <option key={fam} value={fam}>
                    {fam}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Career Level Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Career Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-secondary text-foreground border border-border/80 focus:outline-none focus:ring-1 focus:ring-foreground/20 cursor-pointer"
              >
                {CAREER_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Tech or Skill Filter Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Technology / Skill
              </label>
              <input
                type="text"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                placeholder="e.g. React, Python, Kafka"
                className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm bg-secondary text-foreground border border-border/80 focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground"
              />
            </div>

            {/* 4. Sort By Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Sort Domains
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-secondary text-foreground border border-border/80 focus:outline-none focus:ring-1 focus:ring-foreground/20 cursor-pointer"
              >
                <option value="name-asc">Domain Name (A → Z)</option>
                <option value="name-desc">Domain Name (Z → A)</option>
                <option value="roles-desc">Available Roles (High → Low)</option>
                <option value="roles-asc">Available Roles (Low → High)</option>
              </select>
            </div>
          </div>

          {/* Quick Toggle: Beginner-Friendly */}
          <div className="flex items-center gap-2 pt-2 lg:pt-0 self-end shrink-0">
            <button
              type="button"
              onClick={() => setBeginnerOnly(!beginnerOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
                beginnerOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border-border/80'
              }`}
            >
              {beginnerOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>Beginner-Friendly Only</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary/80 border border-border/80 transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: DOMAIN CARDS GRID ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-foreground" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            Explore IT Career Domains
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-secondary border border-border/60">
            {filteredDomains.length} of {domains.length} Domains
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any domain card to navigate to its dedicated domain details page
        </p>
      </div>

      {/* Grid of All 38 Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDomains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.name] || Layers;
          const sampleRoles = sampleRolesMap[domain.name] || sampleRolesMap[domain.id] || domain.sampleRoles || [];
          const percentage = Math.round(((domain.roleCount || 0) / maxRoleCount) * 100);
          const domainUrl = `/career-explorer/domains/${domain.id}`;

          return (
            <Link
              key={domain.id || domain.name}
              to={domainUrl}
              className="group relative text-left p-5 rounded-2xl border border-border bg-card text-card-foreground hover:border-foreground/40 hover:shadow-md transition-all duration-200 cursor-pointer select-none flex flex-col justify-between space-y-4 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              {/* Top Row: Icon, Family Badge, Role Count Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border/60 group-hover:bg-foreground group-hover:text-background transition-colors shadow-2xs">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-secondary text-foreground border border-border/60 shadow-2xs">
                    {domain.roleCount} {domain.roleCount === 1 ? 'Role' : 'Roles'}
                  </span>
                  {domain.family && (
                    <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[120px]">
                      {domain.family.split('&')[0].trim()}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{domain.name}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {domain.shortDescription || domain.description || 'Specialized placement engineering track with structured competencies.'}
                </p>

                {sampleRoles.length > 0 && (
                  <div className="pt-1.5 text-[11px] font-medium text-foreground/80 line-clamp-1">
                    <span className="text-muted-foreground font-semibold">Roles: </span>
                    {sampleRoles.join(' • ')}
                  </div>
                )}
              </div>

              {/* Bottom Density & Explore Domain Action */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Role Density
                  </span>
                  <span className="font-bold text-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                    Explore Domain
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(15, percentage)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State when no domains match */}
      {filteredDomains.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <Filter className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <h4 className="text-base font-bold text-foreground">
            No domains matched your filters
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Families", or clearing your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
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
