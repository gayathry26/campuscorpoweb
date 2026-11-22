import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  CheckCircle2,
  Volume2,
  Award,
  BarChart2,
  Check,
  ArrowRight
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumb from '../components/Breadcrumb';
import FAQSection from '../components/FAQSection';
import { routesSEO } from '../data/seoData';
import { mockInterviewMockData } from '../data/websiteData';

export default function MockInterviewsPage({ onOpenDemo }) {
  const seo = routesSEO.mockInterviews;

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
          { name: 'Mock Interviews', href: '/features/mock-interviews' }
        ]} />

        {/* Hero */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            INTERVIEW INTELLIGENCE &amp; PRACTICE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-neutral-950 tracking-tight leading-[1.18] mt-2">
            Prepare Students for Real Interviews.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Role-based technical and HR interview simulations with candidate transcription, 4-point rubric scoring, and remediation reports that build interview confidence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenDemo}
              className="px-6 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Request Interview Demo
            </button>
            <Link
              to="/company-explorer"
              className="px-6 py-3 rounded-xl bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 text-sm font-medium transition-all"
            >
              Explore IT Companies
            </Link>
          </div>
        </div>

        {/* Interview Simulation UI Preview */}
        <div className="py-8">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
            <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-neutral-950 text-white font-bold flex items-center justify-center text-xs">
                  RB
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-950 text-sm sm:text-base">
                    {mockInterviewMockData.candidate}
                  </h2>
                  <p className="text-neutral-500 text-xs font-normal">{mockInterviewMockData.role}</p>
                </div>
              </div>
              <span className="bg-neutral-950 text-white font-mono font-medium px-3 py-1 rounded text-xs sm:text-[13px]">
                Overall Score: {mockInterviewMockData.overallScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              <div className="lg:col-span-7 p-6 space-y-4">
                <div>
                  <span className="text-neutral-500 font-semibold text-xs uppercase tracking-wider block mb-1">
                    System Architecture Question
                  </span>
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-950">
                    "{mockInterviewMockData.sampleQuestion}"
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Candidate Transcribed Response</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-700 leading-relaxed font-normal">
                    "{mockInterviewMockData.candidateAnswer}"
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 font-semibold text-xs uppercase tracking-wider block mb-2">
                    Actionable Remediation Feedback
                  </span>
                  <div className="space-y-1.5 text-xs sm:text-[13px]">
                    {mockInterviewMockData.evaluationFeedback.map((fb, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-start gap-2">
                        <span className="font-semibold text-xs uppercase text-neutral-600">[{fb.category}]</span>
                        <span className="text-neutral-800 font-normal">{fb.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 bg-neutral-50/60 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-base text-neutral-950 mb-4 pb-2 border-b border-neutral-200">
                    Competency Rubric Scores
                  </h3>
                  <div className="space-y-3">
                    {mockInterviewMockData.scores.map((s, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-neutral-200 text-xs sm:text-[13px]">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-neutral-700">{s.label}</span>
                          <span className="font-bold text-neutral-950">{s.score}/100</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-neutral-950 h-full rounded-full" style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 text-xs sm:text-[13px] text-neutral-500">
                  Placement Recommendation: <strong className="text-neutral-900 font-medium">Recommended for Tier-1 Product Engineering</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="py-12 border-t border-neutral-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
              Mock Interview Platform Capabilities
            </h2>
            <p className="mt-2 text-base text-neutral-600 leading-relaxed font-normal">
              Build communicative articulation and deep technical problem-solving before real corporate panels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Role-Based Technical Question Banks</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Curated question sets for Frontend, Backend, Full Stack, Data Science, DevOps, Cybersecurity, and Cloud Engineering.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">HR &amp; Behavioral Practice</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Situational, leadership, conflict resolution, and project walkthrough prompts evaluated on clarity and structure.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">4-Dimension Evaluation Rubric</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Objective scoring across Technical Problem Solving, System Design, Code Complexity, and Communication Articulation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-950 mb-1.5">Institutional Readiness Reporting</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Placement officers inspect which students need remedial communication training before high-stakes on-campus drives.
              </p>
            </div>
          </div>
        </div>

        {/* Related Navigation */}
        <div className="py-10 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-sm font-medium">
          <Link to="/features/programming-assessment" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>&larr; Programming Assessments</span>
          </Link>
          <Link to="/company-explorer" className="font-semibold text-neutral-950 hover:underline flex items-center gap-1">
            <span>IT Company Explorer &rarr;</span>
          </Link>
        </div>

      </div>

      <FAQSection
        faqs={seo.faqs}
        title="Frequently Asked Questions: Mock Interviews"
        subtitle="Direct answers on candidate preparation, rubric scoring, and remediation reports."
      />
    </div>
  );
}

