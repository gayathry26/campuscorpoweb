import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ExamRules({ subject, totalQuestions = 30, duration = 45, onStartExam, onGoBack }) {
  const { currentTheme } = useTheme();
  const [agreed, setAgreed] = useState(false);

  const rules = [
    { title: 'Secure Proctored Environment', desc: 'The exam will run securely in this browser with AI proctoring active.' },
    { title: 'Mandatory Fullscreen Mode', desc: 'Exam runs in fullscreen. Exiting triggers an automatic violation.' },
    { title: 'No Tab Switching / Window Blur', desc: 'Switching tabs, minimizing, or losing focus is penalized.' },
    { title: 'Keyboard Lockdown', desc: 'Developer tools, shortcut keys (Ctrl+C, Ctrl+V, F12, Alt+Tab) are strictly blocked.' },
    { title: 'Mouse Restrictions', desc: 'Right-click, text selection, and drag-and-drop are disabled.' },
    { title: 'Browser Navigation Blocked', desc: 'Browser back/refresh buttons are blocked during live testing.' },
    { title: 'Network Disconnection Detection', desc: 'Internet state is actively verified throughout the session.' },
    { title: 'CampusCorp Dynamic Watermarking', desc: 'Your roll number is digitally watermarked on screen to prevent screen capture.' },
    { title: `${duration} Minutes Total Duration`, desc: `You have ${duration} minutes. The system auto-submits when the timer ends.` },
    { title: '3-Strike Auto-Submission', desc: 'Upon reaching 3 proctoring violations, the exam freezes, auto-submits, and automatically exits.' },
    { title: 'Inactivity Monitoring', desc: 'Inactivity for 2+ minutes triggers an attention warning.' },
    { title: 'Auto-Save Cloud Progress', desc: 'All code submissions and MCQ choices are auto-saved every 30 seconds.' },
    { title: 'Integrated Compiler Sandbox', desc: 'Interactive in-browser execution with real-time test cases for Python, C, C++, and Java.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-3xl bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
        {/* Header with Theme Gradient Accent */}
        <div className="p-6 sm:p-8 text-center border-b border-border relative">
          <div
            className="w-16 h-16 rounded-2xl bg-card p-2 shadow-md flex items-center justify-center mx-auto mb-4 border border-border overflow-hidden"
          >
            <img src="/logo-light.jpeg" alt="CampusCorp Logo" className="w-full h-full object-contain dark:hidden" />
            <img src="/logo-dark.jpeg" alt="CampusCorp Logo" className="w-full h-full object-contain hidden dark:block" />
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
            style={{
              backgroundColor: currentTheme.primaryLight,
              color: currentTheme.primaryText,
              borderColor: currentTheme.primaryBorder,
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            CampusCorp Proctored Assessment
          </span>

          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {subject || 'Campus CodeSprint & Assessment'} Rules
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
            Please review the institutional examination instructions before launching your test.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <span className="px-3.5 py-1.5 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center gap-2 border border-border">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Duration: {duration} Minutes
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center gap-2 border border-border">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {totalQuestions} Questions (MCQ + Code)
            </span>
          </div>
        </div>

        {/* Rules Scrollable List */}
        <div className="p-6 sm:p-8 max-h-[380px] overflow-y-auto space-y-3 bg-secondary/30">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3.5 hover:border-border/80 transition-colors shadow-2xs"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: currentTheme.primaryLight,
                  color: currentTheme.primaryText,
                }}
              >
                {idx + 1}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground">{rule.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement & Launch Actions */}
        <div className="p-6 sm:p-8 bg-card border-t border-border space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none p-3.5 rounded-xl bg-secondary/60 border border-border hover:bg-secondary transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-foreground focus:ring-neutral-400 cursor-pointer"
              style={{ accentColor: currentTheme.primary }}
            />
            <span className="text-sm font-semibold text-foreground">
              I have read, understood, and agree to strictly comply with all the assessment regulations above.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {onGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Assessments</span>
              </button>
            )}

            <button
              type="button"
              disabled={!agreed}
              onClick={async (e) => {
                try {
                  const el = document.documentElement;
                  const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                  if (rfs && !document.fullscreenElement) {
                    await rfs.call(el);
                  }
                } catch (err) {
                  console.warn('Fullscreen entry gesture:', err);
                }
                onStartExam && onStartExam(e);
              }}
              className="w-full sm:w-auto ml-auto px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.primary,
                boxShadow: agreed ? `0 4px 14px 0 ${currentTheme.glow}` : undefined,
              }}
            >
              <span>Launch Proctored Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
