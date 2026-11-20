import React from 'react';
import {
  Briefcase,
  DollarSign,
  Cpu,
  Layers,
  Wrench,
  BookOpen,
  FolderGit2,
  Award,
  Sparkles,
} from 'lucide-react';

export function AdaptiveDomainStats({ domain = {}, roles = [], stats = {} }) {
  const roleCount = roles.length;

  // Extract min and max LPA
  let minLpa = stats.minLpa;
  let maxLpa = stats.maxLpa;

  if ((!minLpa || !maxLpa) && roles.length > 0) {
    let min = Infinity;
    let max = 0;
    roles.forEach((r) => {
      const s = r.stats || {};
      if (typeof s.minLpa === 'number' && s.minLpa < min) min = s.minLpa;
      if (typeof s.maxLpa === 'number' && s.maxLpa > max) max = s.maxLpa;
    });
    if (min !== Infinity) minLpa = min;
    if (max > 0) maxLpa = max;
  }

  const salaryText =
    minLpa && maxLpa
      ? `₹${minLpa} - ₹${maxLpa} LPA`
      : minLpa
      ? `From ₹${minLpa} LPA`
      : 'Benchmark Verified';

  // Count unique skills and tools
  const uniqueSkills = new Set();
  const uniqueTools = new Set();
  let totalProjects = 0;
  let totalStages = 0;

  roles.forEach((r) => {
    (r.technicalSkills || []).forEach((s) => uniqueSkills.add(s));
    (r.tools || []).forEach((t) => uniqueTools.add(t));
    if (r.projects) {
      const getProjCount = (p) => (Array.isArray(p) ? p.length : p ? 1 : 0);
      totalProjects += getProjCount(r.projects.beginner);
      totalProjects += getProjCount(r.projects.intermediate);
      totalProjects += getProjCount(r.projects.advanced);
    }
    if (Array.isArray(r.roadmap)) {
      totalStages = Math.max(totalStages, r.roadmap.length);
    }
  });

  const skillsCount = stats.topSkills?.length || uniqueSkills.size;
  const toolsCount = stats.totalTools || uniqueTools.size;
  const rolesWithSalary = stats.rolesWithSalary || roles.filter((r) => r.stats?.averageSalary || r.stats?.minLpa).length;

  // =========================================================================
  // CASE A: SINGLE ROLE DOMAIN (e.g. Testing & QA, Cybersecurity, UI/UX)
  // =========================================================================
  if (roleCount === 1) {
    const singleRole = roles[0];
    const roleTitle = singleRole.title;
    const certificationsCount = (singleRole.certifications || []).length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Role Focus */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              Specialized Track
            </span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-foreground tracking-tight truncate" title={roleTitle}>
              {roleTitle}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              1 Focused Career Path
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {domain.name}
            </div>
          </div>
        </div>

        {/* Card 2: Verified Salary Benchmark */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Placement Band
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {salaryText}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Campus Placement Range
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {singleRole.stats?.growthRate || 'High market demand'}
            </div>
          </div>
        </div>

        {/* Card 3: Verified Competency Stack */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              Competencies
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {skillsCount} Skills • {toolsCount} Tools
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Curriculum Stack
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {certificationsCount > 0 ? `${certificationsCount} Industry Credentials` : 'ATS aligned benchmarks'}
            </div>
          </div>
        </div>

        {/* Card 4: Capstones & Roadmap */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/20">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Roadmap
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {totalProjects > 0 ? `${totalProjects} Capstones` : `${totalStages || 6} Stages`}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Practical Preparation
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {totalStages > 0 ? `${totalStages} Progressive Learning Stages` : 'Guided Placement Pathway'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE B: 2 TO 3 ROLES (Role Comparison Layout)
  // =========================================================================
  if (roleCount >= 2 && roleCount <= 3) {
    const roleTitlesPreview = roles.map((r) => r.title.split('/')[0].trim()).join(' • ');

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Catalogued Roles */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              {roleCount} Roles
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {roleCount} Career Roles
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Available in {domain.name}
            </div>
            <div className="text-[11px] text-muted-foreground truncate" title={roleTitlesPreview}>
              {roleTitlesPreview}
            </div>
          </div>
        </div>

        {/* Card 2: Domain Compensation Spread */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Salary Range
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {salaryText}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Domain Compensation Spread
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {rolesWithSalary} roles with placement benchmarks
            </div>
          </div>
        </div>

        {/* Card 3: Shared & Specialized Skills */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              Skills
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {skillsCount}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Documented Skills
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Shared foundations & specialized skills
            </div>
          </div>
        </div>

        {/* Card 4: Production Toolchains */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Tools
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {toolsCount}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              Production Toolchains
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Industry standard stacks
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE C & D: 4+ ROLES (Analytical & Discovery Layout)
  // =========================================================================
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Available Roles */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            Roles
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {roleCount}
          </div>
          <div className="text-xs font-bold text-foreground mt-0.5">
            Available Career Roles
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            In {domain.name}
          </div>
        </div>
      </div>

      {/* Card 2: Salary Range */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Salary
          </span>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
            {salaryText}
          </div>
          <div className="text-xs font-bold text-foreground mt-0.5">
            Campus Placement Range
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {rolesWithSalary} roles with salary benchmarks
          </div>
        </div>
      </div>

      {/* Card 3: Skills Documented */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
            Skills
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {skillsCount}
          </div>
          <div className="text-xs font-bold text-foreground mt-0.5">
            Documented Skills
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            Curriculum ATS alignments
          </div>
        </div>
      </div>

      {/* Card 4: Production Toolchains */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/20">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            Tools
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {toolsCount}
          </div>
          <div className="text-xs font-bold text-foreground mt-0.5">
            Production Tools
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            Industry standard stacks
          </div>
        </div>
      </div>
    </div>
  );
}
