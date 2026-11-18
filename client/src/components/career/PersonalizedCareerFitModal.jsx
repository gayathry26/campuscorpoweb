import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Award,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import careerService from '../../services/careerService';

export default function PersonalizedCareerFitModal({ role, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [fitData, setFitData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !role) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    careerService
      .getRoleFit(role.id)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success) {
          setFitData(res.data);
        } else {
          setError(res?.message || 'Unable to retrieve career fit analysis.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error connecting to analysis engine.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, role]);

  if (!isOpen || !role) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="pr-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Personalized Fit Analysis
                </span>
                <span className="text-xs sm:text-sm text-slate-400">• {role.category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {role.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Evaluated against your active verified skills catalogue and parsed resume benchmarks.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">Evaluating your skills & resume match...</p>
              <p className="text-xs text-slate-400 mt-1">Checking database records in student_skills and resume_analyses</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Failed to load fit analysis</p>
                <p className="text-xs text-rose-600 mt-1">{error}</p>
              </div>
            </div>
          ) : fitData ? (
            <>
              {/* Score Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Skill Match Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Curriculum Skill Overlap
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {fitData.skillFitPercentage}%
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 font-medium">
                        ({fitData.matchedSkills?.length || 0} / {fitData.totalRequiredSkills || 0} skills)
                      </span>
                    </div>
                    <div className="w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${fitData.skillFitPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Resume AI Score Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Resume AI Match Score
                    </span>
                    {fitData.hasResumeAnalysis ? (
                      <>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl sm:text-3xl font-bold text-indigo-700">
                            {fitData.resumeAnalysis.jobMatchScore || fitData.resumeAnalysis.overallScore}%
                          </span>
                          <span className="text-xs sm:text-sm text-indigo-600 font-medium">
                            (Mistral 7B Evaluated)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Analyzed on{' '}
                          {fitData.resumeAnalysis.createdAt
                            ? new Date(fitData.resumeAnalysis.createdAt).toLocaleDateString()
                            : 'Recent run'}
                        </p>
                      </>
                    ) : (
                      <div className="mt-1">
                        <span className="text-sm font-semibold text-slate-500">
                          Not analyzed yet
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          Upload your resume to calculate AI match
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Notice Disclaimer */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Governance Attribution Notice: </span>
                  Match percentages indicate technical prerequisite alignment with CampusCorp placement standards, not guarantees of employment or shortlist eligibility.
                </div>
              </div>

              {/* Matched Skills with Verification Badges */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matching Skills Found ({fitData.matchedSkills?.length || 0})
                  </h4>
                  <span className="text-xs sm:text-sm text-slate-500">
                    {fitData.verifiedSkillsCount || 0} Faculty / Assessment Verified
                  </span>
                </div>

                {fitData.matchedSkills?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {fitData.matchedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900">
                            {sk.name}
                          </span>
                          {sk.isVerified ? (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                              title="Verified by LMS Assessment or Faculty"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Verified
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                              title="Self-reported in skill catalogue"
                            >
                              Self-Reported
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-500 capitalize">
                          {sk.proficiencyLevel || 'Proficient'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                    No matching skills found in your active profile yet.
                  </div>
                )}
              </div>

              {/* Missing or Target Skills */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Skills to Acquire for {role.title} ({fitData.missingSkills?.length || 0})
                </h4>

                {fitData.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fitData.missingSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-300 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Exceptional match! You already possess all baseline technical skills identified for this role.
                  </div>
                )}
              </div>

              {/* Resume Analysis Summary if present */}
              {fitData.resumeAnalysis?.summary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h5 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                      AI Resume Insights
                    </h5>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {fitData.resumeAnalysis.summary}
                  </p>
                </div>
              )}

              {/* Actionable Next Steps CTA Bar */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h5 className="text-sm font-bold text-indigo-900">
                    Boost Your Career Readiness Score
                  </h5>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Verify pending skills with coding challenges or upload an updated resume.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/skill-analyzer"
                    className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Cpu className="w-4 h-4" />
                    Skill Analyzer
                  </Link>
                  <Link
                    to="/resume-analyzer"
                    className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Resume Analyzer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-slate-700">
                Analyze your resume to see your career fit
              </h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Our Mistral 7B AI engine will evaluate your current resume against this role's specific technical proficiencies.
              </p>
              <Link
                to="/resume-analyzer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Go to Resume Analyzer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Role ID: <code className="text-slate-600 font-mono">{role.id}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
