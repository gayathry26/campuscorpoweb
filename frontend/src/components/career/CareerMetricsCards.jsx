import React from 'react';
import {
  Briefcase,
  Compass,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export function CareerMetricsCards({
  stats = {},
  loading = false,
}) {
  const {
    totalRoles = 0,
    totalDomains = 0,
    rolesWithSalary = 0,
    rolesWithSkills = 0,
    minLpa = 4.5,
    maxLpa = 26.0,
  } = stats;

  const cards = [
    {
      id: 'roles',
      label: 'Available Career Roles',
      value: loading ? '—' : totalRoles,
      subtext: 'Catalogued IT career roles',
      icon: Briefcase,
      badge: 'Database Verified',
    },
    {
      id: 'domains',
      label: 'Industry Domains',
      value: loading ? '—' : totalDomains,
      subtext: 'Distinct tech specializations',
      icon: Layers,
      badge: 'Curated Tracks',
    },
    {
      id: 'salaries',
      label: 'Salary Benchmarks',
      value: loading ? '—' : `${rolesWithSalary} Roles`,
      subtext: `₹${minLpa} - ₹${maxLpa} LPA campus range`,
      icon: DollarSign,
      badge: 'Placement Verified',
    },
    {
      id: 'skills',
      label: 'Skill Mappings',
      value: loading ? '—' : `${rolesWithSkills} Roles`,
      subtext: 'Direct competency alignments',
      icon: Cpu,
      badge: 'ATS Aligned',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border/60 shadow-2xs">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/50">
                {card.badge}
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-bold text-foreground mt-0.5">
                {card.label}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
