import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Play,
  CheckCircle2,
  Terminal,
  Clock,
  Cpu,
  ShieldCheck,
  MessageSquareText,
  Sparkles,
  Volume2,
  Award,
  BarChart2,
  Check,
  AlertCircle,
  Copy,
  ChevronRight
} from 'lucide-react';
import { codingAssessmentMockData, mockInterviewMockData } from '../data/websiteData';

export default function KeyDifferentiators({ onOpenDemo }) {
  // Programming Assessment State
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionRun, setExecutionRun] = useState(true);

  // Mock Interview State
  const [interviewType, setInterviewType] = useState('technical'); // 'technical' | 'hr'

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      setExecutionRun(true);
    }, 600);
  };

  return (
    <section id="differentiators" className="py-20 md:py-28 bg-[#fafafa] border-t border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header (Standardized 28–32px) */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-800 shadow-2xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Key Institutional Differentiators</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight leading-[1.24]">
            Engineered for High-Velocity Placement Readiness
          </h2>
          <p className="mt-4 text-base text-neutral-600 leading-relaxed font-normal">
            Move beyond static student spreadsheets. Equip placement cells with automated coding evaluation and AI-assisted interview intelligence.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DIFFERENTIATOR A: PROGRAMMING ASSESSMENT SYSTEM */}
        {/* ========================================================================= */}
        <div id="coding-assessment" className="mb-24">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                Capability 01 • Programming Assessment System
              </span>
              <h3 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-1 leading-[1.3]">
                Test Real Technical Skills.
              </h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                Automated test-case evaluation, timed coding challenges, and student performance tracking in an integrity-controlled environment.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-700">
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated Test Engine
              </span>
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" /> Full-Screen & Navigation Locks
              </span>
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-neutral-900" /> Timed Challenges
              </span>
            </div>
          </div>

          {/* Interactive Coding Platform UI Mockup */}
          <div className="rounded-2xl border border-neutral-300 bg-neutral-900 text-neutral-100 shadow-2xl overflow-hidden font-sans">

            {/* Editor Top Bar */}
            <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>assessment-session // {codingAssessmentMockData.problemId}</span>
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {codingAssessmentMockData.difficulty}
                  </span>
                </div>
              </div>

              {/* Integrity & Time Counters */}
              <div className="flex items-center gap-3 text-xs">
                <div className="hidden sm:flex items-center gap-1.5 text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proctoring Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-200 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded font-mono">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>34:12 Remaining</span>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="inline-flex items-center gap-1.5 bg-white text-neutral-950 hover:bg-neutral-200 font-semibold px-3.5 py-1 rounded text-xs transition-colors active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunningCode ? 'Evaluating...' : 'Run Test Cases'}</span>
                </button>
              </div>
            </div>

            {/* Split Editor Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">

              {/* Left Column: Problem Statement & Specs (4 Cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 bg-neutral-900/90 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="font-mono">PROBLEM STATEMENT</span>
                    <span>Max Points: 100</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {codingAssessmentMockData.title}
                  </h4>
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {codingAssessmentMockData.description}
                  </p>

                  <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 text-xs space-y-2 mb-4">
                    <div className="text-neutral-400 font-semibold font-mono">CONSTRAINTS</div>
                    <ul className="text-neutral-400 space-y-1 list-disc list-inside text-[11px] font-mono">
                      <li>2 &le; nums.length &le; 10<sup>5</sup></li>
                      <li>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></li>
                      <li>Only one valid answer exists.</li>
                      <li>Time Limit: {codingAssessmentMockData.timeLimit} | Memory Limit: {codingAssessmentMockData.memoryLimit}</li>
                    </ul>
                  </div>

                  <div className="text-xs">
                    <span className="text-neutral-400 font-semibold uppercase text-[11px] font-mono block mb-2">
                      Test Case Inspector
                    </span>
                    <div className="flex gap-2">
                      {codingAssessmentMockData.testCases.map((tc, idx) => (
                        <button
                          key={tc.id}
                          onClick={() => setActiveTestCase(idx)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${activeTestCase === idx
                            ? 'bg-neutral-700 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                        >
                          Case {tc.id}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                      <div>Input: <span className="text-neutral-400">{codingAssessmentMockData.testCases[activeTestCase].input}</span></div>
                      <div>Expected: <span className="text-emerald-400">{codingAssessmentMockData.testCases[activeTestCase].expected}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Languages: JS, Python, Java, C++</span>
                  <span className="text-neutral-300 font-medium">Auto-Graded Engine</span>
                </div>
              </div>

              {/* Right Column: Code Editor & Execution Console (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col bg-neutral-950">

                {/* Editor Tab Header */}
                <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-semibold">solution.js</span>
                    <span className="text-neutral-500">• JavaScript (Node v20.x)</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">Auto-saved</span>
                </div>

                {/* Code Window with Syntax Coloring Look */}
                <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto text-neutral-300 flex-1 bg-neutral-950">
                  <pre className="text-[12px] leading-6">
                    <code>
                      <span className="text-neutral-500">// Optimized Two-Pointer / Hash Map Solution</span>{'\n'}
                      <span className="text-purple-400">function</span> <span className="text-yellow-300">findTargetPair</span>(nums, target) {'{\n'}
                      {'  '}<span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-cyan-400">Map</span>();{'\n'}
                      {'  '}<span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = <span className="text-emerald-400">0</span>; i &lt; nums.length; i++) {'{\n'}
                      {'    '}<span className="text-purple-400">const</span> complement = target - nums[i];{'\n'}
                      {'    '}<span className="text-purple-400">if</span> (map.<span className="text-cyan-400">has</span>(complement)) {'{\n'}
                      {'      '}<span className="text-purple-400">return</span> [map.<span className="text-cyan-400">get</span>(complement), i];{'\n'}
                      {'    '}{'}\n'}
                      {'    '}map.<span className="text-cyan-400">set</span>(nums[i], i);{'\n'}
                      {'  '}{'}\n'}
                      {'  '}<span className="text-purple-400">return</span> [];{'\n'}
                      {'}'}
                    </code>
                  </pre>
                </div>

                {/* Execution Results Drawer */}
                <div className="border-t border-neutral-800 bg-neutral-900/90 p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300 font-mono font-medium">
                      <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Execution Console</span>
                      {executionRun && (
                        <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          {codingAssessmentMockData.metrics.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                      <span>Runtime: <strong className="text-neutral-200">{codingAssessmentMockData.metrics.runtime}</strong></span>
                      <span>Memory: <strong className="text-neutral-200">{codingAssessmentMockData.metrics.memory}</strong></span>
                      <span className="text-emerald-400">{codingAssessmentMockData.metrics.percentile}</span>
                    </div>
                  </div>

                  {/* 5 Passed Test Cases Status Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                    {codingAssessmentMockData.testCases.map((tc) => (
                      <div key={tc.id} className="bg-neutral-950 border border-neutral-800 rounded p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Case {tc.id}</span>
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="text-neutral-500 text-[10px] mt-1">{tc.runtime}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIFFERENTIATOR B: AI-ASSISTED MOCK INTERVIEW SYSTEM */}
        {/* ========================================================================= */}
        <div id="mock-interviews">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                Capability 02 • Mock Interview System
              </span>
              <h3 className="text-xl sm:text-2xl md:text-[23px] font-semibold text-neutral-950 mt-1 leading-[1.3]">
                Practice Before the Real Interview.
              </h3>
              <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                Role-based technical &amp; HR mock interview simulations with granular rubric scores, communication analysis, and actionable remediation logs.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-700">
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Technical &amp; HR Question Banks
              </span>
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <MessageSquareText className="w-3.5 h-3.5 text-neutral-900" /> Real-Time Response Evaluation
              </span>
              <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <BarChart2 className="w-3.5 h-3.5 text-neutral-900" /> Institutional Readiness Report
              </span>
            </div>
          </div>

          {/* Interview Interface Mockup */}
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">

            {/* Interview Header */}
            <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center">
                    RB
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-950">
                      {mockInterviewMockData.candidate}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {mockInterviewMockData.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-neutral-200/70 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setInterviewType('technical')}
                  className={`px-3 py-1 rounded-md transition-colors ${interviewType === 'technical'
                    ? 'bg-white text-neutral-950 font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                >
                  Technical Interview Round
                </button>
                <button
                  onClick={() => setInterviewType('hr')}
                  className={`px-3 py-1 rounded-md transition-colors ${interviewType === 'hr'
                    ? 'bg-white text-neutral-950 font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                >
                  Behavioral &amp; HR Round
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-neutral-500">{mockInterviewMockData.duration}</span>
                <span className="bg-neutral-950 text-white font-mono font-bold px-3 py-1 rounded-md">
                  Overall Score: {mockInterviewMockData.overallScore}/100
                </span>
              </div>
            </div>

            {/* Split Content: Question & Transcript vs Evaluation Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">

              {/* Left Column: Live Question & Student Response (7 Cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">

                {/* Current Question */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-2">
                    <span>SYSTEM ARCHITECTURE QUESTION #04</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      High Difficulty
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <p className="text-neutral-950 font-semibold text-sm sm:text-base leading-snug">
                      "{interviewType === 'technical'
                        ? mockInterviewMockData.sampleQuestion
                        : 'Describe a situation where a critical deployment broke production under tight deadlines. How did you communicate with stakeholders and resolve the incident?'
                      }"
                    </p>
                  </div>
                </div>

                {/* Candidate Response Transcript */}
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-neutral-700" />
                      <span>TRANSCRIBED CANDIDATE RESPONSE</span>
                    </div>
                    <span className="text-neutral-400">Audio &amp; Text Synced</span>
                  </div>
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white text-neutral-800 text-xs sm:text-sm leading-relaxed">
                    {interviewType === 'technical' ? (
                      <p>
                        "{mockInterviewMockData.candidateAnswer}"
                      </p>
                    ) : (
                      <p>
                        "I immediately rolled back to the previous stable artifact via the blue/green load balancer to restore service within 4 minutes. Then I set up a dedicated Slack war room with clear 15-minute status updates for stakeholders while our team reproduced the root cause in staging using error logs."
                      </p>
                    )}
                  </div>
                </div>

                {/* Automated Feedback & Suggestions */}
                <div>
                  <div className="text-xs font-mono text-neutral-500 mb-2">
                    EVALUATION &amp; IMPROVEMENT SUGGESTIONS
                  </div>
                  <div className="space-y-2 text-xs">
                    {mockInterviewMockData.evaluationFeedback.map((fb, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-start gap-2.5 ${fb.category === 'Strength'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : fb.category === 'Observation'
                            ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                            : 'bg-amber-50/70 border-amber-200 text-amber-950'
                          }`}
                      >
                        <div className="font-bold font-mono text-[11px] uppercase tracking-wider shrink-0 mt-0.5">
                          [{fb.category}]
                        </div>
                        <p className="leading-relaxed">
                          {fb.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Radar Breakdown & Readiness Metrics (5 Cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h5 className="font-bold text-neutral-950 text-sm">
                      Competency Assessment Rubric
                    </h5>
                    <span className="text-xs font-mono text-neutral-500">Benchmark: 85%</span>
                  </div>

                  {/* 4 Score Progress Bars */}
                  <div className="mt-5 space-y-4">
                    {mockInterviewMockData.scores.map((s, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-neutral-200">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-neutral-800">{s.label}</span>
                          <span className="font-mono font-bold text-neutral-950">{s.score}/100</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-neutral-950 h-full rounded-full transition-all duration-700"
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Readiness Status Box */}
                  <div className="mt-6 bg-white p-4 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-neutral-950" />
                      <span className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
                        Institutional Verdict
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Candidate demonstrates production-grade system comprehension and structured problem-solving. Recommended for Tier-1 Product Engineering drives.
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100">
                      <span>Placement Category: <strong className="text-neutral-900">Dream Tier (&gt;10 LPA)</strong></span>
                      <span className="text-emerald-700 font-semibold">Eligible</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Continuous institutional history</span>
                  <button
                    onClick={onOpenDemo}
                    className="text-xs font-semibold text-neutral-950 hover:underline flex items-center gap-1"
                  >
                    <span>Request Faculty Sandbox</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

