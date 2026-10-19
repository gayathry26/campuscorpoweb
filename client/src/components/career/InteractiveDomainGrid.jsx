import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  LineChart,
  Cpu,
  ShieldCheck,
  Cloud,
  Palette,
  Boxes,
  CheckSquare,
  Briefcase,
  Compass,
  Network,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DOMAIN_ICONS = {
  'Software Development': Code2,
  'Data Science & Analytics': LineChart,
  'Artificial Intelligence & Machine Learning': Cpu,
  Cybersecurity: ShieldCheck,
  'Cloud Computing & DevOps': Cloud,
  'UI/UX & Design': Palette,
  'Emerging Technologies': Boxes,
  'Testing & Quality Assurance': CheckSquare,
  'Business Analysis': Briefcase,
  'Product Management': Compass,
  Networking: Network,
};

export function InteractiveDomainGrid({
  domains = [],
  allRoles = [],
  searchQuery = '',
  totalRolesCount = 0,
}) {
  const navigate = useNavigate();

  // Map sample role names for each domain from allRoles
  const sampleRolesMap = React.useMemo(() => {
    const map = {};
    allRoles.forEach((role) => {
      const cat = role.category;
      if (!map[cat]) map[cat] = [];
      if (map[cat].length < 3) {
        map[cat].push(role.title);
      }
    });
    return map;
  }, [allRoles]);

  const maxRoleCount = React.useMemo(() => {
    return Math.max(...domains.map((d) => d.roleCount || 0), 1);
  }, [domains]);

  // Filter domains by search query if any
  const filteredDomains = React.useMemo(() => {
    if (!searchQuery.trim()) return domains;
    const q = searchQuery.toLowerCase().trim();
    return domains.filter((d) => {
      const nameMatch = d.name.toLowerCase().includes(q);
      const descMatch = (d.description || '').toLowerCase().includes(q);
      const rolesMatch = (sampleRolesMap[d.name] || []).some((r) =>
        r.toLowerCase().includes(q)
      );
      return nameMatch || descMatch || rolesMatch;
    });
  }, [domains, searchQuery, sampleRolesMap]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-foreground" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            Explore Career Domains
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-secondary border border-border/60">
            {filteredDomains.length} of {domains.length} Tracks
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any career track card below to open its dedicated domain discovery page
        </p>
      </div>

      {/* Grid of Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredDomains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.name] || Layers;
          const sampleRoles = sampleRolesMap[domain.name] || [];
          const percentage = Math.round(((domain.roleCount || 0) / maxRoleCount) * 100);
          const domainUrl = `/domains/${domain.id}`;

          return (
            <Link
              key={domain.id || domain.name}
              to={domainUrl}
              className="group relative text-left p-4 sm:p-5 rounded-2xl border border-border bg-card text-card-foreground hover:border-foreground/40 hover:shadow-md transition-all duration-200 cursor-pointer select-none flex flex-col justify-between space-y-4 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              {/* Top Row: Icon, Role Count Badge */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border/60 group-hover:bg-foreground group-hover:text-background transition-colors shadow-2xs">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-secondary text-foreground border border-border/60 shadow-2xs">
                    {domain.roleCount} {domain.roleCount === 1 ? 'Role' : 'Roles'}
                  </span>
                </div>
              </div>

              {/* Title & Roles Preview */}
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-foreground tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                  <span>{domain.name}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {domain.description || 'Specialized placement engineering track with structured competencies.'}
                </p>

                {sampleRoles.length > 0 && (
                  <div className="pt-1 text-[11px] font-medium text-foreground/80 line-clamp-1">
                    <span className="text-muted-foreground font-semibold">Includes: </span>
                    {sampleRoles.join(' • ')}
                  </div>
                )}
              </div>

              {/* Bottom Density Bar & Clear Navigation Action */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Catalogue Density</span>
                  <span className="group-hover:text-foreground transition-colors flex items-center gap-1 font-semibold text-[11px]">
                    Open Track
                    <ArrowRight className="w-3 h-3 text-foreground" />
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 group-hover:bg-purple-600 dark:group-hover:bg-purple-400"
                    style={{ width: `${Math.max(15, percentage)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredDomains.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card">
          <p className="text-sm font-semibold text-foreground">No domains matched "{searchQuery}"</p>
          <p className="text-xs text-muted-foreground mt-1">Try searching for other tech tracks or role titles.</p>
        </div>
      )}
    </div>
  );
}
