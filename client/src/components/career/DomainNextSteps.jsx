import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  FileSearch,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function DomainNextSteps({
  topRole,
  onCheckFit,
  onViewRoadmap,
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/70">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            Career Readiness & Actionable Next Steps
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Validate your skills, review stage-by-stage roadmaps, and audit your resume for placement drives
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Action 1: Check My Fit */}
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-3 hover:border-foreground/30 transition-all">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Personalized Career Fit</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Match your profile, courses, and projects against placement rubrics.
            </p>
          </div>
          {topRole && onCheckFit && (
            <button
              type="button"
              onClick={() => onCheckFit(topRole)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] transition-all cursor-pointer shadow-2xs"
            >
              <span>Check My Fit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action 2: Learning Roadmap */}
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-3 hover:border-foreground/30 transition-all">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Learning Pathways</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Step-by-step curriculum roadmaps from foundational syntax to production capstones.
            </p>
          </div>
          {topRole && onViewRoadmap && (
            <button
              type="button"
              onClick={() => onViewRoadmap(topRole)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-all cursor-pointer"
            >
              <span>View Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action 3: Resume Analyzer */}
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-3 hover:border-foreground/30 transition-all">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <FileSearch className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">AI Resume Analyzer</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Upload your CV to audit keyword match against domain specifications with Mistral 7B.
            </p>
          </div>
          <Link
            to={topRole ? `/resume-analyzer?targetRole=${encodeURIComponent(topRole.id)}` : '/resume-analyzer'}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-all cursor-pointer"
          >
            <span>Scan Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Action 4: Skill Analyzer */}
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-3 hover:border-foreground/30 transition-all">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Skill Benchmarking</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Benchmark your proficiency against standardized industry question banks.
            </p>
          </div>
          <Link
            to="/skill-analyzer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-all cursor-pointer"
          >
            <span>Assess Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DomainNextSteps;
