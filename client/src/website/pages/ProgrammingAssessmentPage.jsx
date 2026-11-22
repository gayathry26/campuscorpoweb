import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  CheckCircle2, 
  Terminal, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  Play, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { codingAssessmentMockData } from '../data/websiteData';

export default function ProgrammingAssessmentPage({ onOpenDemo }) {
  const seo = routesSEO.programmingAssessment;

  return (
    <div className="pt-24 pb-20 bg-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { name: 'Features', href: '/platform' },
          { name: 'Programming Assessments', href: '/features/programming-assessment' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            AUTOMATED EVALUATION ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Test Real Technical Skills.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Move beyond superficial MCQ tests. Benchmark students with timed programming challenges, multi-language test execution, runtime analysis, and proctoring locks.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Assessment Sandbox
            </button>
            <Link
              to="/features/mock-interviews"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Mock Interview System
            </Link>
          </div>
        </div>

        {/* Code Editor Platform UI */}
        <div className="py-8">
          <div className="rounded-2xl border border-neutral-300 bg-neutral-900 text-neutral-100 shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono text-neutral-300">
                <Code2 className="w-4 h-4 text-neutral-400" />
                <span>assessment-engine // {codingAssessmentMockData.problemId}</span>
                <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-neutral-300 font-medium">
                  {codingAssessmentMockData.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Full-Screen Lock Active
                </span>
                <span>Time: 34:12</span>
              </div>
            </div>

            {/* Split Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              <div className="lg:col-span-5 p-5 bg-neutral-900/90 border-b lg:border-b-0 lg:border-r border-neutral-800 text-xs flex flex-col justify-between">
                <div>
                  <div className="text-neutral-400 font-mono text-xs uppercase mb-1 font-semibold">Problem Statement</div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{codingAssessmentMockData.title}</h3>
                  <p className="text-neutral-300 leading-relaxed mb-4 text-xs sm:text-sm font-normal">{codingAssessmentMockData.description}</p>
                  <div className="bg-neutral-950 p-3 rounded border border-neutral-800 font-mono text-xs text-neutral-400">
                    <div>Time Limit: {codingAssessmentMockData.timeLimit}</div>
                    <div>Memory Limit: {codingAssessmentMockData.memoryLimit}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 font-normal">
                  Languages: JavaScript, Python 3, Java, C++
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col bg-neutral-950">
                <div className="p-4 font-mono text-xs leading-relaxed text-neutral-300 flex-1">
                  <pre className="text-xs leading-5">
                    <code>
                      <span className="text-neutral-500">// Automated Evaluation Sandbox</span>{'\n'}
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

                <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>5 of 5 Test Cases Passed</span>
                  </div>
                  <div className="text-neutral-400 text-xs font-normal">
                    Runtime: <strong className="text-white font-medium">24.8 ms</strong> • Top 96.4%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Enterprise Coding Assessment Capabilities
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Designed for high-concurrency departmental coding drives, hackathons, and placement screening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Automated Test-Case Evaluation</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Code submissions are safely compiled and executed against public and hidden test cases with millisecond runtime precision.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Secure Integrity &amp; Navigation Lock</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Full-screen assessment lockdown, tab-switch detection, and copy-paste restrictions protect evaluation integrity.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Multiple Programming Languages</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Supports industry-standard languages: JavaScript (Node.js), Python 3, Java, C, and C++ with standard I/O pipelines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Direct Placement Eligibility Linkage</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Test results feed directly into the student's placement readiness score, allowing TPOs to filter drive shortlists instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Related Navigation */}
        <div className="py-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <Link to="/solutions/lms" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Semester LMS</span>
          </Link>
          <Link to="/features/mock-interviews" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>Mock Interview Platform &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection 
        faqs={seo.faqs}
        title="Frequently Asked Questions: Coding Assessment Platform"
        subtitle="Direct answers on automated test cases, languages, and anti-cheating controls."
      />
    </div>
  );
}

