import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Download,
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  ShieldAlert,
} from 'lucide-react';

export default function ExamRules({ subject, totalQuestions = 30, duration = 45, onStartExam, onGoBack, testId }) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // EXE Lock status & handshake state
  const [isExeLockActive, setIsExeLockActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(
        window.location.search.includes('exeLock=true') ||
        window.isCampusCorpExeLock ||
        window.lockdownBrowser?.locked ||
        localStorage.getItem('campuscorp_simulated_exe_lock') === 'true'
      );
    }
    return false;
  });
  const [checkingExe, setCheckingExe] = useState(false);
  const [simulated, setSimulated] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('campuscorp_simulated_exe_lock') === 'true';
  });

  const verifyExeBridge = async () => {
    setCheckingExe(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('http://127.0.0.1:52189/status', {
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.locked) {
          setIsExeLockActive(true);
        }
      }
    } catch (e) {
      // Loopback not responding
    } finally {
      setCheckingExe(false);
    }
  };

  useEffect(() => {
    verifyExeBridge();
  }, []);

  const toggleSimulateLock = () => {
    const next = !simulated;
    setSimulated(next);
    setIsExeLockActive(next);
    if (next) {
      localStorage.setItem('campuscorp_simulated_exe_lock', 'true');
    } else {
      localStorage.removeItem('campuscorp_simulated_exe_lock');
    }
  };

  const handleLaunchProctoredExam = async (e) => {
    // 1. If already running inside CampusCorp-SecureLock.exe, enter directly!
    const isInsideExe = typeof window !== 'undefined' && Boolean(
      window.location.search.includes('exeLock=true') ||
      window.isCampusCorpExeLock ||
      window.lockdownBrowser?.locked
    );

    if (isInsideExe) {
      try {
        const el = document.documentElement;
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (rfs && !document.fullscreenElement) {
          await rfs.call(el);
        }
      } catch (err) {}
      onStartExam && onStartExam({ isDesktopLaunch: false });
      return;
    }

    // 2. Automatically trigger download of CampusCorp-SecureLock.exe
    try {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = '/downloads/CampusCorp-SecureLock.exe';
      downloadAnchor.download = 'CampusCorp-SecureLock.exe';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (err) {
      console.warn('Auto download notice:', err);
    }

    // 3. Calculate exact exam URL with candidate credentials and exeLock flag
    const origin = window.location.origin;
    const studentName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate';
    const rollNo = user?.registerNumber || user?.rollNumber || '';
    const email = user?.email || '';
    const dept = user?.departmentCode || '';

    const query = new URLSearchParams({
      testId: String(testId || 1),
      subject: subject || 'DSA',
      name: studentName,
      rollNumber: rollNo,
      email: email,
      department: dept,
      exeLock: 'true',
    });
    const examTargetUrl = `${origin}/exam?${query.toString()}`;

    // 4. Automatically invoke protocol handler: campuscorp-lock://
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `campuscorp-lock://exam?target=${encodeURIComponent(examTargetUrl)}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (e) {}
      }, 3000);
    } catch (e) {}

    // 5. Automatically spawn the native executable on the host
    try {
      await fetch('/api/v1/assessment/launch-desktop-exe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: examTargetUrl }),
      });
    } catch (e) {
      // Endpoint fallback
    }

    // 6. Also ping local loopback bridge port 52189 if active
    try {
      await fetch('http://127.0.0.1:52189/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: examTargetUrl }),
      });
    } catch (e) {}

    // 7. Transition parent view to Standby Screen (never run exam inside normal browser tab!)
    onStartExam && onStartExam({ isDesktopLaunch: true, examTargetUrl });
  };

  const rules = [
    {
      title: 'EXE-Based Anti-Cheat Kiosk Lock (.exe)',
      desc: 'CampusCorp-SecureLock.exe enforces OS-level Alt+Tab suppression, disables dual monitors, blocks screen-recording tools (OBS, Discord, AnyDesk), and isolates the examination kiosk.',
    },
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
            <button
              type="button"
              onClick={() => {
                const shareUrl = window.location.href.includes('/exam')
                  ? window.location.href
                  : `${window.location.origin}/exam?subject=${encodeURIComponent(subject || 'DSA')}`;
                navigator.clipboard.writeText(shareUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-sm font-semibold flex items-center gap-2 border border-border cursor-pointer transition-colors"
              title="Copy shareable link for this exam"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-muted-foreground" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Exam Link'}</span>
            </button>
          </div>
        </div>

        {/* EXE-Based Lock Verification & Download Banner */}
        <div className="px-6 sm:px-8 py-3.5 bg-secondary/50 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {isExeLockActive ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div>
              <span className="font-bold text-foreground block">
                {isExeLockActive
                  ? 'EXE-Based Desktop Lock Verified & Active (Kiosk + Anti-Cheat)'
                  : 'EXE-Based Anti-Cheat Client Available (CampusCorp-SecureLock.exe)'}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isExeLockActive
                  ? 'OS-level keyboard hook active, Alt+Tab suppressed, secondary displays shielded.'
                  : 'For institutional lockdown examinations, launch via CampusCorp-SecureLock.exe or protocol.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <a
              href="/downloads/CampusCorp-SecureLock.exe"
              download="CampusCorp-SecureLock.exe"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .exe</span>
            </a>
            <a
              href={`campuscorp-lock://exam?subject=${encodeURIComponent(subject || 'DSA')}`}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold flex items-center gap-1.5"
              title="Launch in CampusCorp SecureLock Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch .exe</span>
            </a>
            <button
              type="button"
              onClick={verifyExeBridge}
              disabled={checkingExe}
              className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              title="Check loopback handshake with CampusCorp-SecureLock.exe"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingExe ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={toggleSimulateLock}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                simulated
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle simulated handshake for testing & evaluation"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              <span>{simulated ? 'Test Lock: ON' : 'Test Lock'}</span>
            </button>
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
              onClick={handleLaunchProctoredExam}
              className="w-full sm:w-auto ml-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{
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
