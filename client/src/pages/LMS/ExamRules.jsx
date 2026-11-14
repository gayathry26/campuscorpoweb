import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
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
  X,
} from 'lucide-react';

export default function ExamRules({ subject, totalQuestions = 30, duration = 45, onStartExam, onGoBack, testId }) {
  const { currentTheme } = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // EXE Lock status & handshake state
  const [isExeLockActive, setIsExeLockActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(
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

  // Launcher modal & execution state
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchStep, setLaunchStep] = useState('downloading'); // 'downloading' | 'spawning' | 'connected'
  const [spawnMessage, setSpawnMessage] = useState('');

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
    if (typeof window !== 'undefined' && (window.isCampusCorpExeLock || window.lockdownBrowser?.locked)) {
      try {
        const el = document.documentElement;
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (rfs && !document.fullscreenElement) {
          await rfs.call(el);
        }
      } catch (err) {}
      onStartExam && onStartExam(e);
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

    // 3. Open launcher modal
    setShowLaunchModal(true);
    setLaunchStep('spawning');
    setSpawnMessage('Downloaded CampusCorp-SecureLock.exe. Initializing locked desktop kiosk...');

    // 4. Calculate exact exam URL
    const origin = window.location.origin;
    const examTargetUrl = window.location.href.includes('/exam')
      ? window.location.href
      : `${origin}/exam?subject=${encodeURIComponent(subject || 'DSA')}&testId=${testId || 1}`;

    // 5. Automatically invoke protocol handler: campuscorp-lock://
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `campuscorp-lock://exam?target=${encodeURIComponent(examTargetUrl)}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (e) {}
      }, 3000);
    } catch (e) {}

    // 6. Automatically spawn the native executable on the host
    try {
      const res = await fetch('/api/v1/assessment/launch-desktop-exe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: examTargetUrl }),
      });
      const data = await res.json();
      if (data && data.success) {
        setSpawnMessage('Desktop Lock Executable spawned on host! Opening exam in lockdown kiosk...');
      }
    } catch (e) {
      // Endpoint fallback
    }

    // 7. Also ping local loopback bridge port 52189 if active
    try {
      await fetch('http://127.0.0.1:52189/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: examTargetUrl }),
      });
    } catch (e) {}

    // 8. Poll loopback bridge for live connection confirmation
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:52189/status', { mode: 'cors' });
        if (res.ok) {
          const statusData = await res.json();
          if (statusData && statusData.locked) {
            setLaunchStep('connected');
            setIsExeLockActive(true);
            clearInterval(pollTimer);
          }
        }
      } catch (e) {}
    }, 1000);

    setTimeout(() => clearInterval(pollTimer), 30000);
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

      {/* Launch Exam in EXE Client Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLaunchModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: currentTheme.primaryLight,
                  color: currentTheme.primary,
                }}
              >
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  EXE Lockdown Initializer
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Launching CampusCorp-SecureLock.exe
                </h3>
              </div>
            </div>

            {/* Launch Progress Steps */}
            <div className="space-y-3 p-4 rounded-2xl bg-secondary/50 border border-border text-xs">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>1. Downloaded CampusCorp-SecureLock.exe</span>
              </div>
              <div className="flex items-center gap-3 text-foreground font-semibold">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                <span>2. Starting Lockdown Window (Alt+Tab, Win key, and secondary displays disabled)</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  launchStep === 'connected' ? 'bg-emerald-500 text-white' : 'bg-secondary border border-border'
                }`}>
                  {launchStep === 'connected' ? '✓' : '3'}
                </span>
                <span>
                  {launchStep === 'connected'
                    ? '3. EXE Handshake Connected: Exam is running inside lockdown client!'
                    : '3. Connecting exam session into the lockdown kiosk...'}
                </span>
              </div>
            </div>

            {/* Helpful execution notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <span className="font-bold block">👉 Click to run the downloaded file:</span>
              <p className="text-[11px] leading-relaxed">
                If the lockdown window does not pop up automatically, click <strong>CampusCorp-SecureLock.exe</strong> in your browser's download tray to open the locked exam.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border">
              <a
                href="/downloads/CampusCorp-SecureLock.exe"
                download="CampusCorp-SecureLock.exe"
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Re-download .exe</span>
              </a>

              <button
                type="button"
                onClick={async (e) => {
                  setShowLaunchModal(false);
                  try {
                    const el = document.documentElement;
                    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                    if (rfs && !document.fullscreenElement) {
                      await rfs.call(el);
                    }
                  } catch (err) {}
                  onStartExam && onStartExam(e);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Exam in Fullscreen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
