import React from 'react';
import {
  FileText,
  ListChecks,
  Code2,
  HeartHandshake,
  Wrench,
  FolderGit2,
  BookOpen,
  Award,
  Building2,
  DollarSign,
  TrendingUp,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../Badge';

function renderProjectContent(projData, fallbackLabel = 'Project') {
  if (!projData) return <span className="text-muted-foreground text-sm">Data unavailable</span>;

  // 1. Array of projects (strings or objects)
  if (Array.isArray(projData)) {
    if (projData.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
    return (
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {projData.map((p, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-2" />
            <span className="leading-relaxed">
              {typeof p === 'string' ? p : p.title || p.name || p.description}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // 2. Single Project Object { title, description, tech, skills }
  if (typeof projData === 'object') {
    return (
      <div className="space-y-2 p-3 rounded-xl bg-secondary/50 border border-border/70 text-xs sm:text-sm">
        <h4 className="font-bold text-foreground leading-snug">
          {projData.title || fallbackLabel}
        </h4>
        {projData.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {projData.description}
          </p>
        )}
        {Array.isArray(projData.tech) && projData.tech.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {projData.tech.map((t, tIdx) => (
              <span
                key={tIdx}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-card border border-border text-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. String
  if (typeof projData === 'string') {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">
        {projData}
      </p>
    );
  }

  return <span className="text-muted-foreground text-sm">Data unavailable</span>;
}

export function CompareMatrix({ roles = [] }) {
  if (roles.length === 0) return null;

  // 14 dimensions definition
  const dimensions = [
    {
      id: 'overview',
      label: '1. Career Overview',
      icon: FileText,
      render: (role) => (
        <p className="text-sm text-foreground/90 leading-relaxed font-normal">
          {role.shortDescription || 'Data unavailable'}
        </p>
      ),
    },
    {
      id: 'responsibilities',
      label: '2. Main Responsibilities',
      icon: ListChecks,
      render: (role) => {
        const items = Array.isArray(role.responsibilities) ? role.responsibilities : [];
        if (items.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
        return (
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      id: 'technicalSkills',
      label: '3. Technical Skills',
      icon: Code2,
      render: (role) => {
        const skills = Array.isArray(role.technicalSkills) ? role.technicalSkills : [];
        if (skills.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-medium bg-secondary text-foreground border border-border/80"
              >
                {skill}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'softSkills',
      label: '4. Soft Skills',
      icon: HeartHandshake,
      render: (role) => {
        const skills = Array.isArray(role.softSkills) ? role.softSkills : [];
        if (skills.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-medium bg-secondary text-foreground border border-border/80"
              >
                {skill}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'tools',
      label: '5. Tools & Technologies',
      icon: Wrench,
      render: (role) => {
        const tools = Array.isArray(role.tools) ? role.tools : [];
        if (tools.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-semibold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-300 dark:border-neutral-700"
              >
                {tool}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'beginnerProjects',
      label: '6. Beginner Projects',
      icon: FolderGit2,
      render: (role) => renderProjectContent(role.projects?.beginner, 'Beginner Capstone'),
    },
    {
      id: 'intermediateProjects',
      label: '7. Intermediate Projects',
      icon: FolderGit2,
      render: (role) => renderProjectContent(role.projects?.intermediate, 'Intermediate Project'),
    },
    {
      id: 'advancedProjects',
      label: '8. Advanced Projects',
      icon: FolderGit2,
      render: (role) => renderProjectContent(role.projects?.advanced, 'Advanced Enterprise Architecture'),
    },
    {
      id: 'roadmap',
      label: '9. Learning Roadmap',
      icon: BookOpen,
      render: (role) => {
        const stages = Array.isArray(role.roadmap) ? role.roadmap : [];
        if (stages.length === 0) return <span className="text-muted-foreground text-sm">Data unavailable</span>;
        return (
          <div className="space-y-2">
            {stages.map((stg, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="uppercase tracking-wider">
                    {typeof stg.stage === 'number' ? `Stage 0${stg.stage}` : stg.stage || `Stage 0${idx + 1}`}
                  </span>
                  {stg.duration && (
                    <span className="text-muted-foreground font-normal">{stg.duration}</span>
                  )}
                </div>
                {stg.title && (
                  <p className="font-semibold text-foreground text-xs leading-snug">{stg.title}</p>
                )}
                {Array.isArray(stg.topics) && stg.topics.length > 0 && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {stg.topics.slice(0, 2).join(' • ')}
                  </p>
                )}
                {Array.isArray(stg.skills) && stg.skills.length > 0 && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    Skills: {stg.skills.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: 'certifications',
      label: '10. Recommended Certifications & Credentials',
      icon: Award,
      render: (role) => {
        const certs = Array.isArray(role.certifications) ? role.certifications : [];
        if (certs.length > 0) {
          return (
            <div className="space-y-1.5">
              {certs.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border text-sm"
                >
                  <span className="font-medium text-foreground truncate">{cert.name || cert}</span>
                  {cert.type && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 bg-neutral-100 dark:bg-neutral-800 text-foreground border-border">
                      {cert.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        }

        const prereqs = role.careerReadiness?.prerequisites || [];
        if (Array.isArray(prereqs) && prereqs.length > 0) {
          return (
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                Prerequisite Benchmarks:
              </span>
              <ul className="space-y-1 pl-3 list-disc marker:text-purple-600">
                {prereqs.slice(0, 2).map((p, i) => (
                  <li key={i} className="line-clamp-2 leading-relaxed">{p}</li>
                ))}
              </ul>
            </div>
          );
        }

        return <span className="text-muted-foreground text-sm">Industry standard credentials</span>;
      },
    },
    {
      id: 'industry',
      label: '11. Hiring Industries & Companies',
      icon: Building2,
      render: (role) => {
        const ind = (Array.isArray(role.industry) && role.industry.length > 0)
          ? role.industry
          : (Array.isArray(role.topHiringCompanies) && role.topHiringCompanies.length > 0)
          ? role.topHiringCompanies
          : [];
        if (ind.length === 0) return <span className="text-muted-foreground text-sm">Top Tech & Enterprise Companies</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {ind.map((item) => (
              <span
                key={item}
                className="px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-300 dark:border-neutral-700"
              >
                {item}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'salary',
      label: '12. Average Salary',
      icon: DollarSign,
      render: (role) => (
        <div className="p-3 rounded-xl bg-secondary/60 border border-border">
          <p className="text-base font-bold text-foreground">
            {role.stats?.averageSalary || 'Data unavailable'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Annual CTC (Entry to Mid-Level)
          </p>
        </div>
      ),
    },
    {
      id: 'growth',
      label: '13. Job-Market Growth',
      icon: TrendingUp,
      render: (role) => (
        <div className="p-3 rounded-xl bg-secondary/60 border border-border">
          <p className="text-base font-bold text-foreground">
            {role.stats?.growthRate || 'Data unavailable'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Openings: {role.stats?.jobOpenings || 'Active hiring'}
          </p>
        </div>
      ),
    },
    {
      id: 'roleType',
      label: '14. Coding Requirement / Role Type',
      icon: Terminal,
      render: (role) => {
        const tags = Array.isArray(role.tags) ? role.tags : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant={t.toLowerCase()} size="md">
                  {t}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Domain: <strong className="text-foreground">{role.category}</strong>
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
            Side-by-Side Comparison Matrix
          </h3>
          <p className="text-sm text-muted-foreground">
            Evaluated across 14 comprehensive professional dimensions
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">
          Scroll horizontally on smaller screens
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm min-w-[700px]">
          {/* Table Header: Role Titles */}
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="p-4 w-52 sm:w-64 font-bold text-muted-foreground uppercase tracking-wider text-xs bg-card sticky left-0 z-10 border-r border-border">
                Comparison Dimension
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="p-4 font-bold text-foreground border-r border-border last:border-r-0 min-w-[220px]"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {role.category}
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {role.title}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: 14 Rows */}
          <tbody className="divide-y divide-border">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <tr key={dim.id} className="hover:bg-secondary/20 transition-colors">
                  {/* Sticky Dimension Label Column */}
                  <td className="p-4 font-bold text-foreground bg-card sticky left-0 z-10 border-r border-border align-top">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="leading-snug">{dim.label}</span>
                    </div>
                  </td>

                  {/* Role Data Columns */}
                  {roles.map((role) => (
                    <td
                      key={role.id}
                      className="p-4 border-r border-border last:border-r-0 align-top"
                    >
                      {dim.render(role)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
