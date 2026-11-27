import React, { useMemo } from 'react';
import { Cpu, Wrench, Layers, CheckCircle2, GitMerge } from 'lucide-react';

export function DomainSkillInsights({ roles = [], domainName = '' }) {
  // Aggregate real skills and tools across roles
  const {
    sharedSkills,
    roleSpecificSkills,
    topSkillsList,
    allTools,
  } = useMemo(() => {
    const skillRoleMap = {};
    const toolsSet = new Set();

    roles.forEach((r) => {
      (r.technicalSkills || []).forEach((skill) => {
        const clean = skill.trim();
        if (!skillRoleMap[clean]) {
          skillRoleMap[clean] = [];
        }
        if (!skillRoleMap[clean].includes(r.title)) {
          skillRoleMap[clean].push(r.title);
        }
      });

      const roleTools = Array.isArray(r.tools)
        ? r.tools
        : typeof r.tools === 'object' && r.tools !== null
        ? Object.values(r.tools).flat().filter((t) => typeof t === 'string')
        : [];
      roleTools.forEach((tool) => toolsSet.add(tool.trim()));
    });

    const shared = [];
    const specificByRole = {};

    roles.forEach((r) => {
      specificByRole[r.title] = [];
    });

    Object.entries(skillRoleMap).forEach(([skill, roleList]) => {
      if (roles.length > 1 && roleList.length > 1) {
        shared.push({ skill, count: roleList.length, roles: roleList });
      } else {
        const roleName = roleList[0];
        if (specificByRole[roleName]) {
          specificByRole[roleName].push(skill);
        }
      }
    });

    shared.sort((a, b) => b.count - a.count);

    const topList = Object.entries(skillRoleMap)
      .map(([skill, roleList]) => ({ skill, count: roleList.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      sharedSkills: shared,
      roleSpecificSkills: specificByRole,
      topSkillsList: topList,
      allTools: Array.from(toolsSet),
    };
  }, [roles]);

  // If no skills found across all roles, return null
  if (topSkillsList.length === 0 && allTools.length === 0) {
    return null;
  }

  const isMultiRole = roles.length >= 2;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            Skills & Competency Insights
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
            Database Mapped
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Real technical competencies mapped to campus recruitment specifications
        </div>
      </div>

      {/* When 2 or more roles: Show Shared Core vs Role-Specific Specializations */}
      {isMultiRole ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Shared Core Competencies */}
          <div className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5 text-foreground" />
                <h4 className="text-xs font-bold text-foreground">
                  Shared Core Competencies
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Required in multiple roles
              </span>
            </div>

            {sharedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {sharedSkills.map(({ skill, count }) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-card text-foreground border border-border shadow-2xs"
                  >
                    <span>{skill}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-secondary text-muted-foreground">
                      {count}/{roles.length}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                Roles in this track feature highly specialized skill profiles.
              </p>
            )}
          </div>

          {/* Box 2: Role-Specific Specializations */}
          <div className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-foreground" />
                <h4 className="text-xs font-bold text-foreground">
                  Role-Specific Specializations
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Distinct competencies
              </span>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {Object.entries(roleSpecificSkills).map(([roleTitle, skills]) => {
                if (skills.length === 0) return null;
                return (
                  <div key={roleTitle} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {roleTitle}:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-card text-foreground border border-border/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 6 && (
                        <span className="text-[10px] font-semibold text-muted-foreground px-1 py-0.5">
                          +{skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Single role skills breakdown */
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">
            Core Curriculum Competencies for {roles[0]?.title}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(roles[0]?.technicalSkills || []).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-foreground border border-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Production Toolchains Footer */}
      {allTools.length > 0 && (
        <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground shrink-0">
            <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Documented Production Toolchains:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {allTools.slice(0, 8).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary/80 text-foreground border border-border/60"
              >
                {tool}
              </span>
            ))}
            {allTools.length > 8 && (
              <span className="text-[10px] text-muted-foreground font-semibold px-1">
                +{allTools.length - 8} tools
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DomainSkillInsights;
