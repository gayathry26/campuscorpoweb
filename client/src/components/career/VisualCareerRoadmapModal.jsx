import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Compass,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Cpu,
  FolderGit2,
  FileSearch,
  ExternalLink,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Video,
} from 'lucide-react';

const SIX_STAGES = [
  {
    stageNumber: 1,
    title: 'Foundations & Computer Science Core',
    subtitle: 'Algorithmic Thinking, Language Syntax & Version Control',
    accent: 'border-l-sky-500',
    badge: 'Stage 01',
    objectives: [
      'Master core programming language syntax, control structures, and memory models.',
      'Implement foundational data structures (Arrays, Linked Lists, Hash Maps, Stacks, Queues).',
      'Establish professional Git workflow (branching, commits, pull requests, semantic versioning).',
    ],
    lmsLink: '/lms',
    lmsLabel: 'CS Core Fundamentals in LMS',
    practiceLink: '/programming-assessment',
    practiceLabel: 'Algorithm Screening Challenges',
  },
  {
    stageNumber: 2,
    title: 'Core Technical Skills & Frameworks',
    subtitle: 'Production Ecosystem, State Management & Databases',
    accent: 'border-l-indigo-500',
    badge: 'Stage 02',
    objectives: [
      'Deep dive into primary stack libraries, asynchronous paradigms, and modern framework lifecycles.',
      'Design relational and document database schemas with indexed queries and transaction integrity.',
      'Build and secure RESTful / GraphQL endpoints following clean architecture standards.',
    ],
    lmsLink: '/lms',
    lmsLabel: 'Framework Masterclasses',
    practiceLink: '/skill-analyzer',
    practiceLabel: 'Verify Stack Competency Quiz',
  },
  {
    stageNumber: 3,
    title: 'Practical Projects & System Design',
    subtitle: 'End-to-End Capstones & Scalable Architecture',
    accent: 'border-l-purple-500',
    badge: 'Stage 03',
    objectives: [
      'Architect and deploy a full-featured capstone application addressing real-world problem domains.',
      'Integrate third-party services, authentication (JWT/OAuth), caching (Redis), and containerization (Docker).',
      'Optimize latency, caching headers, payload serialization, and database query bottlenecks.',
    ],
    lmsLink: '/lms',
    lmsLabel: 'System Design Patterns',
    practiceLink: '/programming-assessment',
    practiceLabel: 'API & Database Coding Tests',
  },
  {
    stageNumber: 4,
    title: 'Portfolio, Resume & Open Source',
    subtitle: 'Verifiable Proof of Work & ATS Optimization',
    accent: 'border-l-pink-500',
    badge: 'Stage 04',
    objectives: [
      'Curate public GitHub repository documentation with live production demo links and architecture diagrams.',
      'Synthesize quantified bullet points using the Google XYZ formula ("Accomplished X, measured by Y, by doing Z").',
      'Tailor resume keywords directly to recruitment ATS filters using CampusCorp Resume Analyzer.',
    ],
    lmsLink: '/resume-analyzer',
    lmsLabel: 'Run Mistral 7B Resume Analyzer',
    practiceLink: '/my-applications',
    practiceLabel: 'Update Portfolio Profile',
  },
  {
    stageNumber: 5,
    title: 'Interview Preparation & Mock Rounds',
    subtitle: 'Live Technical Rounds & Behavioral Rubrics',
    accent: 'border-l-amber-500',
    badge: 'Stage 05',
    objectives: [
      'Practice high-frequency company interview questions under time constraints.',
      'Simulate 1-on-1 peer technical interviews with live shared whiteboard and video audio channels.',
      'Master STAR method responses for behavioral questions and company values alignment.',
    ],
    lmsLink: '/mock-interview',
    lmsLabel: 'Live WebRTC Mock Interview Room',
    practiceLink: '/interview-slots',
    practiceLabel: 'Book Interview Practice Slot',
  },
  {
    stageNumber: 6,
    title: 'Job Application Readiness & Drives',
    subtitle: 'Campus Recruitment Drives, Eligibility & Offers',
    accent: 'border-l-emerald-500',
    badge: 'Stage 06',
    objectives: [
      'Verify CGPA, backlog, and department eligibility criteria for upcoming placement partner drives.',
      'Submit targeted applications with tailored cover notes directly through CampusCorp Jobs portal.',
      'Track recruitment stage transitions from online test to technical round and final offer letter.',
    ],
    lmsLink: '/jobs',
    lmsLabel: 'View Active Openings & Drives',
    practiceLink: '/placement-drives',
    practiceLabel: 'Upcoming Placement Schedules',
  },
];

export function VisualCareerRoadmapModal({
  isOpen = false,
  role = null,
  onClose,
}) {
  if (!isOpen || !role) return null;

  const {
    title,
    category,
    technicalSkills = [],
    tools = [],
    projects = {},
    certifications = [],
  } = role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-start justify-between gap-4 bg-secondary/30 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground border border-border">
                {category}
              </span>
              <span className="text-xs text-muted-foreground">• 6-Stage Learning Progression</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-foreground" />
              <span>{title} Career Roadmap</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A structured step-by-step curriculum customized to industry hiring requirements for {title}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
            title="Close roadmap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable 6-Stage Progression */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          {/* Quick Stack Summary Pillbox */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground">Target Role Competencies: </span>
              <span className="text-muted-foreground">
                {technicalSkills.slice(0, 6).join(' • ') || 'Core Technologies'}
              </span>
            </div>
            {tools.length > 0 && (
              <div className="text-[11px] font-mono text-muted-foreground">
                Tools: {tools.slice(0, 4).join(', ')}
              </div>
            )}
          </div>

          {/* 6 Stages Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {SIX_STAGES.map((stage) => (
              <div key={stage.stageNumber} className="relative group">
                {/* Stepper node dot */}
                <div className="absolute -left-[23px] sm:-left-[27px] top-2 w-5 h-5 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-[9px] font-bold shadow-xs">
                  {stage.stageNumber}
                </div>

                {/* Stage Box */}
                <div
                  className={`bg-card rounded-2xl border border-border border-l-4 ${stage.accent} p-5 shadow-xs space-y-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-secondary text-foreground">
                          {stage.badge}
                        </span>
                        <h3 className="text-base font-bold text-foreground">
                          {stage.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Key Milestones & Objectives
                    </span>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {stage.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CampusCorp Integrated Resource Links */}
                  <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-border/40 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                      Platform Resources:
                    </span>
                    <Link
                      to={stage.lmsLink}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{stage.lmsLabel}</span>
                    </Link>
                    <Link
                      to={stage.practiceLink}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{stage.practiceLabel}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-secondary/30 flex items-center justify-between text-xs shrink-0">
          <p className="text-muted-foreground hidden sm:block">
            Completion milestones synchronize automatically with active LMS courses and submitted assessments.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold bg-foreground text-background hover:opacity-90 ml-auto cursor-pointer"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisualCareerRoadmapModal;
