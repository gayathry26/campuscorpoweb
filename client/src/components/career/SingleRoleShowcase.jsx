import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Cpu,
  Wrench,
  CheckCircle2,
  FolderGit2,
  Award,
  Sparkles,
  GitCompare,
  FileSearch,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  Building2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '../Badge';

export function SingleRoleShowcase({
  role,
  onCheckFit,
  onToggleCompare,
  isCompared = false,
  canAddCompare = true,
  onViewRoadmapModal,
}) {
  if (!role) return null;

  const {
    id,
    title,
    category,
    tags = [],
    shortDescription,
    scope,
    responsibilities = [],
    technicalSkills = [],
    softSkills = [],
    tools = [],
    stats = {},
    projects = {},
    certifications = [],
    topHiringCompanies = [],
    roadmap = [],
  } = role;

  const [activeTab, setActiveTab] = useState('skills-tools'); // 'skills-tools' | 'roadmap' | 'projects' | 'certifications'
  const [activeRoadmapStage, setActiveRoadmapStage] = useState(0);

  const salaryText =
    stats.averageSalary ||
    (stats.minLpa ? `₹${stats.minLpa} - ₹${stats.maxLpa} LPA` : 'Competitive Placement Benchmark');

  // Categorize technical skills heuristically for clean visualization
  const skillCategories = React.useMemo(() => {
    const categories = {
      'Core & Automation': [],
      'Testing & Frameworks': [],
      'Backend, Data & Cloud': [],
      'Practices & Tooling': [],
    };

    technicalSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      if (sLower.includes('automation') || sLower.includes('playwright') || sLower.includes('cypress') || sLower.includes('selenium') || sLower.includes('python') || sLower.includes('java') || sLower.includes('javascript')) {
        categories['Core & Automation'].push(skill);
      } else if (sLower.includes('test') || sLower.includes('api') || sLower.includes('performance') || sLower.includes('jmeter') || sLower.includes('qa')) {
        categories['Testing & Frameworks'].push(skill);
      } else if (sLower.includes('sql') || sLower.includes('database') || sLower.includes('cloud') || sLower.includes('backend') || sLower.includes('ci/cd')) {
        categories['Backend, Data & Cloud'].push(skill);
      } else {
        categories['Practices & Tooling'].push(skill);
      }
    });

    // Remove empty categories
    return Object.entries(categories).filter(([_, items]) => items.length > 0);
  }, [technicalSkills]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. HERO ROLE CARD */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Top Badges & Salary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              {category}
            </span>
            {tags.map((t) => (
              <Badge key={t} variant={t.toLowerCase()} size="sm">
                {t}
              </Badge>
            ))}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-secondary text-muted-foreground border border-border">
              Focused Career Pathway
            </span>
          </div>

          {/* Salary Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-2xs">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{salaryText}</span>
          </div>
        </div>

        {/* Title & Scope */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
            {shortDescription}
          </p>
          {scope && (
            <div className="p-3.5 rounded-xl bg-secondary/60 border border-border/80 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground font-semibold">Industry Impact: </strong>
                {scope}
              </span>
            </div>
          )}
        </div>

        {/* Market Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Active Job Openings
            </span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {stats.jobOpenings || 'High Demand Campus Track'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Market Growth Rate
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {stats.growthRate || '+15% YoY Growth'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Placement Readiness
            </span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              ATS Standard Verified
            </span>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/70">
          {/* Check Career Fit */}
          {onCheckFit && (
            <button
              type="button"
              onClick={() => onCheckFit(role)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check My Career Fit</span>
            </button>
          )}

          {/* Compare Role Button */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(role)}
              disabled={!isCompared && !canAddCompare}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                isCompared
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border hover:bg-secondary text-foreground'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare Queue' : 'Compare Role'}</span>
            </button>
          )}

          {/* Resume Analyzer Integration */}
          <Link
            to="/resume-analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-2xs"
          >
            <FileSearch className="w-3.5 h-3.5 text-foreground" />
            <span>Scan Resume for this Role</span>
          </Link>

          {/* Skill Analyzer Integration */}
          <Link
            to="/skill-analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5 text-foreground" />
            <span>Verify Skills</span>
          </Link>

          {/* Full Roadmap Modal Trigger */}
          {onViewRoadmapModal && (
            <button
              type="button"
              onClick={() => onViewRoadmapModal(role)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Full Roadmap View</span>
            </button>
          )}

          {/* Dedicated Full Specifications Page */}
          <Link
            to={`/domains/${category ? category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'all'}/${id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all shadow-xs ml-auto"
          >
            <span>Full Specifications Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. TABBED DEEP-DIVE SECTION */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              {title} Deep Dive
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-secondary p-1 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('skills-tools')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'skills-tools'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Skills & Toolchains
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Career Roadmap
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Practical Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certifications')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Certifications & Recruiters
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: SKILLS & TOOLCHAINS */}
        {activeTab === 'skills-tools' && (
          <div className="space-y-6">
            {/* Responsibilities Checklist */}
            {responsibilities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Core Responsibilities & Day-to-Day Deliverables</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {responsibilities.map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-foreground flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Technical Competencies ({technicalSkills.length} Verified)</span>
                </h3>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Curriculum ATS Alignment
                </span>
              </div>

              {skillCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skillCategories.map(([categoryName, items]) => (
                    <div
                      key={categoryName}
                      className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-2"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        {categoryName}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-card text-foreground border border-border shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground border border-border/80 shadow-2xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Production Tools & Soft Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Production Tools */}
              {tools.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    <span>Production Toolchains ({tools.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-card text-foreground border border-border shadow-2xs"
                      >
                        <Wrench className="w-3 h-3 text-muted-foreground" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {softSkills.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Behavioral & Collaboration Traits</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {softSkills.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-card text-muted-foreground border border-border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: CAREER PREPARATION ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                Structured placement progression from foundational engineering to industry-ready candidate.
              </p>
              <span className="font-semibold text-foreground">
                {roadmap.length > 0 ? `${roadmap.length} Milestone Stages` : '5 Verified Stages'}
              </span>
            </div>

            {roadmap.length > 0 ? (
              <div className="space-y-4">
                {/* Stage Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                  {roadmap.map((stageItem, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveRoadmapStage(index)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeRoadmapStage === index
                          ? 'bg-foreground text-background shadow-xs'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Stage {index + 1}: {stageItem.title || stageItem.stage}
                    </button>
                  ))}
                </div>

                {/* Active Stage Details */}
                {(() => {
                  const currentStage = roadmap[activeRoadmapStage] || roadmap[0];
                  return (
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Stage {activeRoadmapStage + 1}
                          </span>
                          <h4 className="text-base font-black text-foreground">
                            {currentStage.title || currentStage.stage}
                          </h4>
                          {currentStage.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {currentStage.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills & Tools in this Stage */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentStage.skills && currentStage.skills.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Target Competencies
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {currentStage.skills.map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border text-foreground"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStage.tools && currentStage.tools.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Toolchains
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {currentStage.tools.map((tl, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border text-foreground flex items-center gap-1"
                                >
                                  <Wrench className="w-3 h-3 text-muted-foreground" />
                                  <span>{tl}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Learning Activities */}
                      {currentStage.learningActivities && currentStage.learningActivities.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Actionable Milestones
                          </span>
                          <ul className="space-y-1.5 text-xs text-foreground/90">
                            {currentStage.learningActivities.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Fallback standard 5-stage roadmap if custom role array is empty */
              <div className="space-y-3">
                {[
                  {
                    num: '01',
                    title: 'Foundations & Domain Fundamentals',
                    desc: 'Core architecture principles, syntax standards, and version control discipline.',
                  },
                  {
                    num: '02',
                    title: 'Core Tools & Automation Frameworks',
                    desc: 'Hands-on framework mastery, API integration, and automated testing paradigms.',
                  },
                  {
                    num: '03',
                    title: 'Practical Capstone Projects',
                    desc: 'End-to-end production projects demonstrating enterprise-ready problem solving.',
                  },
                  {
                    num: '04',
                    title: 'Resume & Portfolio Optimization',
                    desc: 'Targeted keyword alignment and quantified achievement bullet points.',
                  },
                  {
                    num: '05',
                    title: 'Technical & Behavioral Interview Prep',
                    desc: 'Mock rounds, company-specific question rubrics, and STAR framework responses.',
                  },
                ].map((stg) => (
                  <div
                    key={stg.num}
                    className="p-4 rounded-xl bg-secondary/30 border border-border flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-foreground text-background font-black text-xs flex items-center justify-center shrink-0">
                      {stg.num}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{stg.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stg.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 3: PRACTICAL PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Build verifiable proof of work for your resume and campus recruitment interviews:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Beginner */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Beginner Capstones</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    Tier 1
                  </span>
                </div>
                <div className="space-y-2">
                  {(projects.beginner || ['Manual Test Plan and Defect Log for Campus E-Commerce Portal']).map((p, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card border border-border text-xs text-foreground/90 leading-relaxed">
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Intermediate */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Intermediate Frameworks</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">
                    Tier 2
                  </span>
                </div>
                <div className="space-y-2">
                  {(projects.intermediate || ['Automated Playwright/Cypress End-to-End Regression Suite']).map((p, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card border border-border text-xs text-foreground/90 leading-relaxed">
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Advanced / Enterprise</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                    Tier 3
                  </span>
                </div>
                <div className="space-y-2">
                  {(projects.advanced || ['Continuous Performance Testing Pipeline simulating 5k Virtual Users with k6']).map((p, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-card border border-border text-xs text-foreground/90 leading-relaxed">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: CERTIFICATIONS & RECRUITERS */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Industry Credentials & Recognized Certifications</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certifications.map((c, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.provider}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                          c.type === 'FREE'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hiring Companies */}
            {topHiringCompanies.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-foreground" />
                  <span>Verified Recruiters for this Role in Campus Drives</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topHiringCompanies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary text-foreground border border-border"
                    >
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{comp}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
