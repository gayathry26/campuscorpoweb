import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Shield,
  Lock,
  CheckCircle2,
  Download,
  ExternalLink,
  ArrowLeft,
  Monitor,
  RefreshCw,
  Zap,
  Cpu,
  EyeOff,
} from 'lucide-react';

export default function DesktopLockStandby({
  subject = 'National Campus Technical CodeSprint 2026',
  testId = 1,
  candidate = {},
  onReturnToHub,
  onFallbackInBrowser,
}) {
  const { currentTheme } = useTheme();
  const [relaunching, setRelaunching] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('CampusCorp-SecureLock.exe is supervising this session');

  const candidateName =
    candidate.name ||
    `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() ||
    'Student Candidate';
  const rollNumber = candidate.rollNumber || candidate.registerNumber || candidate.roll_number || '2023CSE001';

  // Poll loopback bridge on port 52189 to verify connection with the running exe
  useEffect(() => {
    let mounted = true;
    const checkBridge = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch('http://127.0.0.1:52189/status', {
          signal: controller.signal,
          mode: 'cors',
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data && data.locked) {
            setBridgeConnected(true);
            setStatusMessage('Connected to live CampusCorp-SecureLock.exe process');
          }
        }
      } catch (err) {
        if (mounted) {
          setBridgeConnected(false);
        }
      }
    };

    checkBridge();
    const interval = setInterval(checkBridge, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleBringToFront = async () => {
    setRelaunching(true);
    setStatusMessage('Focusing CampusCorp-SecureLock.exe window...');

    const origin = window.location.origin;
    const query = new URLSearchParams({
      testId: String(testId || 1),
      subject: subject || 'DSA',
      name: candidateName,
      rollNumber: rollNumber,
      email: candidate.email || '',
      department: candidate.department || '',
      exeLock: 'true',
    });
    const examTargetUrl = `${origin}/exam?${query.toString()}`;

    // 1. Try loopback bridge
    try {
      await fetch('http://127.0.0.1:52189/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: examTargetUrl }),
      });
    } catch (e) {}

    // 2. Request backend to spawn/bring forward
    try {
      await fetch('/api/v1/assessment/launch-desktop-exe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: examTargetUrl }),
      });
    } catch (e) {}

    // 3. Invoke custom protocol
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `campuscorp-lock://exam?target=${encodeURIComponent(examTargetUrl)}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (e) {}
      }, 3000);
    } catch (e) {}

    setTimeout(() => {
      setRelaunching(false);
      setStatusMessage('Focus signal sent to desktop lockdown client');
    }, 1200);
  };

  const handleManualDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = '/downloads/CampusCorp-SecureLock.exe';
      a.download = 'CampusCorp-SecureLock.exe';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatusMessage('CampusCorp-SecureLock.exe downloaded. Run it to start the exam.');
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-[1000] w-screen h-screen bg-neutral-950 text-white flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto selection:bg-emerald-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-2xl bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header / Brand */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 p-1.5 border border-neutral-700 flex items-center justify-center">
              <img src="/logo-dark.jpeg" alt="CampusCorp" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                CampusCorp Assessment Security
              </span>
              <span className="text-sm font-semibold text-neutral-200">
                Institutional Lockdown Subsystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{bridgeConnected ? 'EXE BRIDGE ACTIVE' : 'DESKTOP EXE RUNNING'}</span>
          </div>
        </div>

        {/* Hero Beacon */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <Shield className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-neutral-900 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Examination Is Running in Desktop Lockdown Client
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Your exam has transitioned to the standalone <strong className="text-neutral-200 font-mono">CampusCorp-SecureLock.exe</strong> client with OS-level hardware lock. This browser tab remains on standby.
            </p>
          </div>
        </div>

        {/* Candidate & Assessment Info Strip */}
        <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider font-semibold">Active Assessment</span>
            <span className="font-bold text-white text-sm truncate block mt-0.5">{subject}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider font-semibold">Candidate</span>
            <span className="font-bold text-white text-sm truncate block mt-0.5">{candidateName}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px] uppercase tracking-wider font-semibold">Roll Number</span>
            <span className="font-bold text-emerald-400 text-sm font-mono block mt-0.5">{rollNumber}</span>
          </div>
        </div>

        {/* Active Security Features Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Active Hardware & OS Lockdown Protections
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-start gap-2.5">
              <Monitor className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block">True Fullscreen Kiosk</span>
                <span className="text-neutral-400 text-[11px]">Taskbar, address bar, and tabs completely hidden.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block">Low-Level Keyboard Hook</span>
                <span className="text-neutral-400 text-[11px]">Alt+Tab, Win Keys, Alt+F4, and PrtScn suppressed.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block">Dual Monitor Shield</span>
                <span className="text-neutral-400 text-[11px]">Secondary displays blacked out with warning veil.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-200 block">Anti-Cheat Process Scanner</span>
                <span className="text-neutral-400 text-[11px]">AnyDesk, OBS, Discord, TeamViewer actively terminated.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Notice */}
        <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          {bridgeConnected && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold">PORT 52189 ✓</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={handleBringToFront}
            disabled={relaunching}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
          >
            {relaunching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            <span>Bring Lockdown Kiosk to Front</span>
          </button>

          <button
            type="button"
            onClick={handleManualDownload}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Re-download .exe</span>
          </button>

          {onReturnToHub && (
            <button
              type="button"
              onClick={onReturnToHub}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-neutral-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Hub</span>
            </button>
          )}
        </div>

        {/* Fallback option if user explicitly needs in-browser testing */}
        {onFallbackInBrowser && (
          <div className="text-center pt-1 border-t border-neutral-800/60">
            <button
              type="button"
              onClick={onFallbackInBrowser}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors underline cursor-pointer"
            >
              Need to test inside this browser window? Switch to In-Browser Fullscreen Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
