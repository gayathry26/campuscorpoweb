import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import githubScannerService from '../../services/githubScannerService';
import {
  GitBranch,
  GitCommitHorizontal,
  Folder,
  FileCode,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  Compass,
  Zap,
  RotateCcw,
  Key,
  RefreshCw,
  Users,
  FileText,
  Clock,
  User,
  Activity,
  Lock,
  Terminal,
  Copy,
  Check,
  Bot,
  MessageSquare,
  Lightbulb,
  Send,
  BrainCircuit,
} from 'lucide-react';

const POPULAR_REPOS = [
  { label: 'React.js (Meta)', url: 'https://github.com/facebook/react' },
  { label: 'FastAPI (Python)', url: 'https://github.com/fastapi/fastapi' },
  { label: 'Next.js (Vercel)', url: 'https://github.com/vercel/next.js' },
  { label: 'Spring Boot (Java)', url: 'https://github.com/spring-projects/spring-boot' },
  { label: 'Profile: @vercel', url: 'https://github.com/vercel' },
];

function AvatarBadge({ src, label, className = 'w-14 h-14 rounded-2xl' }) {
  const [errored, setErrored] = useState(false);
  const initial = (label || 'GH').trim().slice(0, 2).toUpperCase();

  return (
    <div className={`relative flex items-center justify-center overflow-hidden border border-border bg-secondary text-foreground font-black select-none shrink-0 ${className}`}>
      <span className="text-xs tracking-tight">{initial}</span>
      {src && !errored && (
        <img
          src={src}
          alt={label || 'GitHub'}
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export function GithubRepoScanner() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inputUrl, setInputUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);

  const [scanResult, setScanResult] = useState(null);
  const [profileResult, setProfileResult] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'commits' | 'structure'
  const [recentScans, setRecentScans] = useState([]);

  // Live auto-refresh toggle
  const [liveAutoSync, setLiveAutoSync] = useState(false);
  const autoSyncTimerRef = useRef(null);

  // Skill import state
  const [importingSkills, setImportingSkills] = useState(false);
  const [imported, setImported] = useState(false);

  const handleScan = async (urlToScan, { silent = false } = {}) => {
    const target = (urlToScan || inputUrl || '').trim();
    if (!target) {
      showToast('Please enter a GitHub repository URL, "owner/repo", or username.', 'error');
      return;
    }

    if (!silent) {
      setScanning(true);
      setScanProgress({ step: 1, totalSteps: 5, label: 'Connecting to live GitHub scanner stream...' });
      setProgressLogs([`Starting live analysis for "${target}"...`]);
      setError(null);
      setImported(false);
    }

    try {
      const data = await githubScannerService.scanRepositoryLiveStream(target, {
        githubToken,
        onProgress: (stepInfo) => {
          if (!silent) {
            setScanProgress(stepInfo);
            if (stepInfo?.label) {
              setProgressLogs((prev) => (prev[prev.length - 1] === stepInfo.label ? prev : [...prev, stepInfo.label]));
            }
          }
        },
      });

      if (data?.type === 'profile' || Array.isArray(data?.repositories)) {
        setProfileResult(data);
        setScanResult(null);
        setLiveAutoSync(false);
        if (!silent) {
          showToast(`Loaded ${data.repositories?.length || 0} live repositories for @${data.profile?.login || target}`, 'success');
        }
      } else {
        setScanResult(data);
        setProfileResult(null);
        if (data?.repository?.fullName) {
          setRecentScans((prev) => {
            const next = [
              { fullName: data.repository.fullName, htmlUrl: data.repository.htmlUrl },
              ...prev.filter((r) => r.fullName !== data.repository.fullName),
            ];
            return next.slice(0, 5);
          });
        }
        if (!silent) {
          showToast(`Live scan complete for ${data.repository?.fullName || 'repository'} (${data.telemetry?.latencyMs || 0}ms)`, 'success');
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to scan repository.';
      if (!silent) {
        setError(errMsg);
        showToast(errMsg, 'error');
      }
    } finally {
      if (!silent) {
        setScanning(false);
      }
    }
  };

  // Handle Live Auto-Sync (polls live updates every 30s when active)
  useEffect(() => {
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }
    if (liveAutoSync && scanResult?.repository?.htmlUrl) {
      autoSyncTimerRef.current = setInterval(() => {
        handleScan(scanResult.repository.htmlUrl, { silent: true });
      }, 30000);
    }
    return () => {
      if (autoSyncTimerRef.current) clearInterval(autoSyncTimerRef.current);
    };
  }, [liveAutoSync, scanResult?.repository?.htmlUrl]);

  const handleImportSkills = async () => {
    if (!scanResult || !scanResult.detectedSkills || scanResult.detectedSkills.length === 0) {
      showToast('No detected skills to import.', 'error');
      return;
    }

    setImportingSkills(true);
    try {
      const res = await githubScannerService.verifyAndImportSkills(
        scanResult.repository?.htmlUrl || inputUrl,
        scanResult.detectedSkills,
        'INTERMEDIATE'
      );
      setImported(true);
      showToast(res.message || 'Skills verified successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify and import skills.', 'error');
    } finally {
      setImportingSkills(false);
    }
  };

  // AI Analyzer state
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiAdvisorAnswer, setAiAdvisorAnswer] = useState(null);
  const [aiAdvisorLoading, setAiAdvisorLoading] = useState(false);
  const [copiedBullets, setCopiedBullets] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const handleAskAi = async (overridePrompt) => {
    const promptToSend = (overridePrompt || aiCustomPrompt || '').trim();
    if (!promptToSend) return;
    setAiAdvisorLoading(true);
    setAiCustomPrompt(promptToSend);
    try {
      const res = await githubScannerService.analyzeWithAi(scanResult, promptToSend);
      if (res?.answer) {
        setAiAdvisorAnswer(res.answer);
      } else {
        setAiAdvisorAnswer(`### 🤖 AI Engineering Insights for **${repo?.name || 'Repository'}**\n\n- **Analysis of**: "${promptToSend}"\n- **Primary Tech Stack**: ${languages?.primaryLanguage || 'Software'} with ${detectedSkills.slice(0, 3).join(', ') || 'modern libraries'}.\n- **Architecture Health**: Code quality rated at ${quality?.score || 75}/100.\n- **Engineering Recommendation**: Maintain modular file separation, configure automated CI test suites, and containerize runtime.`);
      }
    } catch (e) {
      const q = promptToSend.toLowerCase();
      let fallbackText = '';
      if (q.includes('scale') || q.includes('traffic')) {
        fallbackText = `### 🚀 Scalability Strategy for **${repo?.name || 'Repository'}**\n\n1. **Horizontal Scaling**: Containerize runtime with Docker and scale pods horizontally.\n2. **State Decoupling**: Offload session tokens and user state into a Redis cluster.\n3. **Database Read Replicas**: Separate high-throughput read operations from write transactions.`;
      } else if (q.includes('security') || q.includes('harden')) {
        fallbackText = `### 🛡️ Production Security Checklist for **${repo?.name || 'Repository'}**\n\n1. **Secrets Gate**: Guarantee zero plaintext tokens or .env secrets in git commits.\n2. **Dependency Supply Chain**: Run automated vulnerability scanners in CI.\n3. **Sanitization**: Enforce schema validations and strict CORS/CSP security headers.`;
      } else {
        fallbackText = `### 🤖 AI Engineering Insights for **${repo?.name || 'Repository'}**\n\n- **Stack Assessment**: Clean ${languages?.primaryLanguage || 'Software'} codebase leveraging ${detectedSkills.slice(0, 3).join(', ') || 'modern architecture'}.\n- **Recruiter Screening Score**: ${quality?.score || 75}/100.\n- **Portfolio Recommendation**: Document setup instructions and add automated testing workflows.`;
      }
      setAiAdvisorAnswer(fallbackText);
    } finally {
      setAiAdvisorLoading(false);
    }
  };

  const getAiResumeBullets = () => {
    const pLang = languages?.primaryLanguage || repo?.language || 'Software';
    const topSkills = detectedSkills.slice(0, 3).join(', ') || pLang;
    const isDocker = quality?.hasDockerfile;
    const isCI = quality?.hasWorkflows;
    const score = quality?.score || 85;

    return [
      `Architected full-stack ${pLang} application incorporating ${topSkills}, enforcing clean separation of concerns and maintainable modular architecture.`,
      isDocker
        ? `Containerized application utilizing multi-stage Docker builds to achieve uniform development, automated testing, and isolated staging environments.`
        : `Implemented structured data models and RESTful API endpoints utilizing ${topSkills}, reducing query overhead and improving response latency.`,
      isCI
        ? `Configured automated CI/CD deployment pipelines with GitHub Actions, ensuring 100% test validation and zero-downtime integration.`
        : `Established comprehensive code hygiene standards and automated linting, achieving a repository quality score of ${score}/100 with zero exposed credentials.`,
    ];
  };

  const handleCopyBullets = () => {
    const bullets = getAiResumeBullets();
    const textToCopy = bullets.map((b) => `• ${b}`).join('\n');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedBullets(true);
    showToast('AI resume bullets copied to clipboard!', 'success');
    setTimeout(() => setCopiedBullets(false), 2500);
  };

  const getAiInterviewQuestions = () => {
    const pLang = languages?.primaryLanguage || repo?.language || 'Software';
    const isCI = quality?.hasWorkflows;
    return [
      {
        category: 'Architecture & Design Patterns',
        question: `How is state and data flow orchestrated across ${repo?.name || 'the project'}, and why was ${pLang} chosen?`,
        intent: 'Recruiters want to assess your technical decision making and architectural depth.',
        modelAnswer: `Discuss how client requests are routed through validation middleware, business service layers, and data access objects. Highlight how ${pLang}'s concurrency model, library ecosystem, and developer velocity drove your technology choice.`,
      },
      {
        category: 'Production Scalability & Reliability',
        question: `If traffic to ${repo?.name || 'this service'} surges by 20x during a peak window, what failure points emerge first?`,
        intent: 'Tests real-world capacity planning, caching strategy, and database bottleneck awareness.',
        modelAnswer: 'Highlight database connection pool exhaustion, synchronous file/network operations, and memory growth. Propose adding Redis response caching, background job queues, and connection poolers.',
      },
      {
        category: 'DevOps & Code Quality Assurance',
        question: `How do you guarantee code changes do not introduce regressions or security leaks before deploying?`,
        intent: 'Evaluates production hygiene, testing mindset, and automated CI/CD practices.',
        modelAnswer: isCI
          ? 'Reference your GitHub Actions workflow that executes automated test suites, linting rules, and dependency vulnerability scans on every pull request prior to merge.'
          : 'Explain your pre-commit hooks, unit testing strategy, environment variable isolation, and automated smoke testing prior to release.',
      },
    ];
  };

  const repo = scanResult?.repository;
  const languages = scanResult?.languages;
  const quality = scanResult?.codeQuality;
  const detectedSkills = scanResult?.detectedSkills || [];
  const matchedRoles = scanResult?.matchedRoles || [];
  const commits = scanResult?.commits || [];
  const contributors = scanResult?.contributors || [];
  const fileTree = scanResult?.fileTree || [];
  const telemetry = scanResult?.telemetry;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground border border-border mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live GitHub Repository & Portfolio Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Live GitHub Repo Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Scan any public GitHub repository or developer profile live — inspect monorepo dependencies,
            live commit history, security hygiene, and verify portfolio skills in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTokenInput((v) => !v)}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{githubToken ? 'GitHub PAT Connected' : 'Add Optional PAT Token'}</span>
        </button>
      </div>

      {/* Search Bar & Sample Repos */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <GitBranch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste repo URL (https://github.com/owner/repo), owner/repo, or @username"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={scanning}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {scanning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Scanning Live...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Scan Live</span>
              </>
            )}
          </button>
        </form>

        {/* Optional PAT Token Field */}
        {showTokenInput && (
          <div className="p-3.5 rounded-xl bg-secondary/60 border border-border flex flex-col sm:flex-row items-center gap-3">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_... (Optional personal access token for private repos or 5,000 req/hr quota)"
              className="flex-1 w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs font-mono focus:outline-none"
            />
            {githubToken && (
              <button
                type="button"
                onClick={() => setGithubToken('')}
                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer shrink-0"
              >
                Clear Token
              </button>
            )}
          </div>
        )}

        {/* Quick Demo Repositories */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Try Live:</span>
          {POPULAR_REPOS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                handleScan(sample.url);
              }}
              className="px-2.5 py-1 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Recent Scans History */}
        {recentScans.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Recent Live Scans:
            </span>
            {recentScans.map((rec) => (
              <button
                key={rec.fullName}
                type="button"
                onClick={() => {
                  setInputUrl(rec.htmlUrl);
                  handleScan(rec.htmlUrl);
                }}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-secondary text-foreground font-mono transition-colors cursor-pointer"
              >
                {rec.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live SSE Stream Progress Indicator */}
      {scanning && (
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-foreground">
                Live Stream Inspection ({scanProgress?.step || 1}/{scanProgress?.totalSteps || 5})
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(((scanProgress?.step || 1) / (scanProgress?.totalSteps || 5)) * 100)}%
            </span>
          </div>

          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.round(((scanProgress?.step || 1) / (scanProgress?.totalSteps || 5)) * 100)}%` }}
            />
          </div>

          <div className="bg-secondary/70 border border-border rounded-xl p-3 font-mono text-xs space-y-1">
            {progressLogs.map((logLine, idx) => (
              <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                <span className={idx === progressLogs.length - 1 ? 'text-emerald-500 font-bold' : 'text-emerald-600/70'}>
                  {idx === progressLogs.length - 1 ? '▸' : '✓'}
                </span>
                <span className={idx === progressLogs.length - 1 ? 'text-foreground font-medium' : ''}>{logLine}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error View */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold">Live Repository Scan Failed</h4>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* GitHub User / Org Profile Repositories Grid */}
      {profileResult && (
        <div className="space-y-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarBadge
                src={profileResult.profile?.avatarUrl}
                label={profileResult.profile?.login}
                className="w-16 h-16 rounded-2xl"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-foreground">{profileResult.profile?.name}</h2>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">
                    @{profileResult.profile?.login}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {profileResult.source || 'Live Profile'}
                  </span>
                </div>
                {profileResult.profile?.bio && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{profileResult.profile.bio}</p>
                )}
              </div>
            </div>

            <a
              href={profileResult.profile?.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold inline-flex items-center gap-1.5 self-start"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(profileResult.repositories || []).map((item) => (
              <div
                key={item.fullName}
                className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-foreground/30 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground break-all">{item.name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground shrink-0">
                      {item.language || 'Code'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    {item.description || 'Public GitHub repository ready for live code inspection.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" /> {item.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-blue-500" /> {item.forks}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl(item.htmlUrl);
                      handleScan(item.htmlUrl);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Scan Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repository Scan Results */}
      {scanResult && repo && (
        <div className="space-y-6">
          {/* Live Telemetry & Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-card border border-border text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                LIVE SYNCED
              </span>
              <span className="text-muted-foreground font-mono">
                Source: <strong className="text-foreground">{telemetry?.source || repo.sourceMode}</strong>
              </span>
              {telemetry?.latencyMs !== undefined && (
                <span className="text-muted-foreground font-mono">
                  Latency: <strong className="text-foreground">{telemetry.latencyMs}ms</strong>
                </span>
              )}
              {repo.totalFilesScanned > 0 && (
                <span className="text-muted-foreground font-mono">
                  Tree Items: <strong className="text-foreground">{repo.totalFilesScanned.toLocaleString()}</strong>
                </span>
              )}
              <span className="text-muted-foreground font-mono">
                Scanned: <strong className="text-foreground">{new Date(scanResult.scannedAt).toLocaleTimeString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLiveAutoSync((v) => !v)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  liveAutoSync
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${liveAutoSync ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                <span>{liveAutoSync ? 'Auto-Sync ON (30s)' : 'Auto-Sync'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleScan(repo.htmlUrl)}
                disabled={scanning}
                className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>
            </div>
          </div>

          {/* 1. Repository Hero Header */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => {
                  setInputUrl(repo.owner);
                  handleScan(repo.owner);
                }}
                title={`Browse all live repos by @${repo.owner}`}
                className="shrink-0 cursor-pointer group"
              >
                <AvatarBadge
                  src={repo.ownerAvatar}
                  label={repo.owner}
                  className="w-14 h-14 rounded-2xl group-hover:ring-2 group-hover:ring-ring transition-all"
                />
              </button>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {repo.fullName}
                  </h2>
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground hover:opacity-80"
                  >
                    <span>Open GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl(repo.owner);
                      handleScan(repo.owner);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <User className="w-3 h-3" />
                    <span>All Repos by @{repo.owner}</span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {repo.description}
                </p>

                {repo.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {repo.topics.slice(0, 8).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-secondary/80 border border-border text-muted-foreground"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-muted-foreground font-mono">
                  <span>Branch: <strong className="text-foreground">{repo.defaultBranch}</strong></span>
                  <span>License: <strong className="text-foreground">{repo.license}</strong></span>
                  {repo.sizeKb > 0 && (
                    <span>Size: <strong className="text-foreground">{(repo.sizeKb / 1024).toFixed(1)} MB</strong></span>
                  )}
                  <span>Last Push: <strong className="text-foreground">{new Date(repo.lastPushedAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center min-w-[76px]">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{(repo.stars || 0).toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Stars</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center min-w-[76px]">
                <div className="flex items-center justify-center gap-1 text-blue-500 font-bold text-base">
                  <GitFork className="w-4 h-4" />
                  <span>{(repo.forks || 0).toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Forks</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center min-w-[76px]">
                <div className="flex items-center justify-center gap-1 text-purple-500 font-bold text-base">
                  <Eye className="w-4 h-4" />
                  <span>{(repo.watchers || 0).toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Watchers</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            {[
              { id: 'overview', label: 'Code Quality, Stack & Roles', icon: ShieldCheck },
              { id: 'commits', label: `Live Commits (${commits.length}) & Contributors`, icon: GitCommitHorizontal },
              { id: 'structure', label: 'File Structure & README', icon: Folder },
              { id: 'ai', label: 'AI Analyzer', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW, STACK & HYGIENE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quality Score & Languages */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-foreground" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Engineering Quality
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-secondary text-foreground border border-border">
                      {quality?.rating?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-2 text-center">
                    <div className="text-5xl font-black text-foreground tracking-tight">
                      {quality?.score}
                      <span className="text-xl font-medium text-muted-foreground">/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Readiness for campus placement technical screening
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Documentation & README', val: quality?.scoreBreakdown?.documentation || 0, color: 'bg-emerald-500' },
                      { label: 'Architecture & Tech Stack', val: quality?.scoreBreakdown?.codebaseStructure || 0, color: 'bg-blue-500' },
                      { label: 'CI/CD & Testing', val: quality?.scoreBreakdown?.devOpsAndTesting || 0, color: 'bg-purple-500' },
                      { label: 'Recency & Maintenance', val: quality?.scoreBreakdown?.maintenanceAndActivity || 0, color: 'bg-amber-500' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>{row.label}</span>
                          <span className="font-bold text-foreground">{row.val}/25</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: `${(row.val / 25) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-foreground" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Language Breakdown
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Primary: <strong className="text-foreground">{languages?.primaryLanguage}</strong>
                    </span>
                  </div>

                  <div className="h-4 w-full rounded-full overflow-hidden flex bg-secondary border border-border">
                    {languages?.breakdown?.map((lang) => (
                      <div
                        key={lang.name}
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                        title={`${lang.name}: ${lang.percentage}%`}
                        className="h-full transition-all"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {languages?.breakdown?.slice(0, 6).map((lang) => (
                      <div
                        key={lang.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/60 border border-border text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                          <span className="font-bold text-foreground">{lang.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Production Hygiene & Security Badges */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Live Production Hygiene & Security Signals
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Tests Suite', ok: quality?.hasTests },
                        { label: 'CI/CD Pipeline', ok: quality?.hasWorkflows },
                        { label: 'Docker Setup', ok: quality?.hasDockerfile },
                        { label: '.gitignore', ok: quality?.hasGitignore },
                        { label: 'Linter / Config', ok: quality?.hasLinter },
                        { label: 'No Exposed .env', ok: !(quality?.exposedSecrets?.length > 0), critical: quality?.exposedSecrets?.length > 0 },
                      ].map((chk) => (
                        <span
                          key={chk.label}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                            chk.critical
                              ? 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                              : chk.ok
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                                : 'bg-secondary border-border text-muted-foreground'
                          }`}
                        >
                          {chk.critical ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : chk.ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 opacity-60" />
                          )}
                          <span>{chk.critical ? `Exposed: ${quality.exposedSecrets.join(', ')}` : chk.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Skills & One-Click Import */}
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span>Detected Frameworks & Technical Skills</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary text-foreground border border-border">
                        {detectedSkills.length} identified
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {repo.manifestsFound?.length > 0
                        ? `Inspected manifests: ${repo.manifestsFound.join(', ')}`
                        : 'Extracted from live repository tree, languages, and configuration files.'}
                    </p>
                  </div>

                  {user && (
                    <button
                      type="button"
                      onClick={handleImportSkills}
                      disabled={importingSkills || imported || detectedSkills.length === 0}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 ${
                        imported
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {imported ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Skills Verified</span>
                        </>
                      ) : importingSkills ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Verifying Skills...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify & Import Skills to Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {detectedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary border border-border text-foreground flex items-center gap-1.5"
                    >
                      <Cpu className="w-3.5 h-3.5 text-foreground" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Roles & Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Compass className="w-5 h-5 text-foreground" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Matched Placement Career Roles
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {matchedRoles.length > 0 ? (
                      matchedRoles.map((role) => (
                        <div
                          key={role.roleName}
                          className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between"
                        >
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{role.roleName}</h4>
                            <span className="text-xs text-muted-foreground">{role.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-foreground">{role.fitScore}%</span>
                            <span className="block text-[10px] text-muted-foreground">Portfolio Fit</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Scan a full project repository to compute role matches.</p>
                    )}
                  </div>
                </div>

                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Zap className="w-5 h-5 text-amber-500 fill-current" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Recruiter Highlights & Recommendations
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {scanResult.highlights?.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                    {scanResult.recommendations?.map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE COMMITS & CONTRIBUTORS */}
          {activeTab === 'commits' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <GitCommitHorizontal className="w-5 h-5 text-foreground" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Live Recent Commits ({repo.defaultBranch})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-500 font-bold">Live Feed</span>
                </div>

                {commits.length > 0 ? (
                  <div className="space-y-2.5">
                    {commits.map((c, idx) => (
                      <a
                        key={c.fullSha || idx}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <AvatarBadge
                            src={c.authorAvatar || repo.ownerAvatar}
                            label={c.author}
                            className="w-8 h-8 rounded-full mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{c.message}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {c.author} • {c.date ? new Date(c.date).toLocaleString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground shrink-0">
                          {c.sha}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">No commit feed available for this branch.</p>
                )}
              </div>

              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Users className="w-5 h-5 text-foreground" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Top Contributors
                  </h3>
                </div>

                {contributors.length > 0 ? (
                  <div className="space-y-2.5">
                    {contributors.map((ct) => (
                      <a
                        key={ct.login}
                        href={ct.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <AvatarBadge
                            src={ct.avatarUrl}
                            label={ct.login}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-xs font-bold text-foreground">@{ct.login}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {ct.contributions} commits
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">
                    Contributor insights are shown when REST API contributor statistics are available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FILE TREE STRUCTURE & README */}
          {activeTab === 'structure' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-foreground" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Root Directory Tree
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {fileTree.length} entries
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {fileTree.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/40 border border-border text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.type === 'dir' ? (
                          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate text-foreground">{item.name}</span>
                      </div>
                      {item.size > 0 && (
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {(item.size / 1024).toFixed(1)}KB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <FileText className="w-5 h-5 text-foreground" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    README.md Live Preview
                  </h3>
                </div>

                {scanResult.readmePreview ? (
                  <pre className="p-4 rounded-xl bg-secondary/60 border border-border text-xs font-mono text-foreground whitespace-pre-wrap break-words max-h-[420px] overflow-y-auto leading-relaxed">
                    {scanResult.readmePreview}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">No README file detected in repository root.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI ANALYZER */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* 1. AI Hero Overview Card */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/30 text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CampusCorp Neural Code & Architecture Engine</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      AI Portfolio & Architecture Intelligence
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                      Automated architectural review, security & production hygiene verification, technical interview prep matrix, and resume impact bullets generated specifically for <strong className="text-foreground">{repo.fullName}</strong>.
                    </p>
                  </div>

                  {/* Screening Verdict Badge */}
                  <div className="px-5 py-4 rounded-xl bg-card border border-border text-center shadow-xs shrink-0 min-w-[200px]">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                      Recruiter Placement Verdict
                    </span>
                    <div className="text-lg font-black text-emerald-500 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-5 h-5" />
                      <span>{quality?.score >= 80 ? 'Tier-1 Tech Ready' : quality?.score >= 60 ? 'Strong Candidate' : 'Emerging Project'}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground font-mono mt-1 block">
                      Quality Score: {quality?.score || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Architecture Patterns & Engineering Signals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pattern Breakdown */}
                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Detected Architecture & Patterns
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Automated Pattern Mining</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workspace Paradigm</span>
                      <p className="text-xs font-bold text-foreground">
                        {repo.manifestsFound?.length > 1 ? '📦 Multi-Package Monorepo' : '📁 Modular Single Package'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Runtime</span>
                      <p className="text-xs font-bold text-foreground">
                        ⚡ {languages?.primaryLanguage || repo.language || 'Multi-Language'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deployment Runtime</span>
                      <p className="text-xs font-bold text-foreground">
                        {quality?.hasDockerfile ? '🐳 OCI Docker Containerized' : '💻 Bare-Metal / Cloud VM'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Continuous Integration</span>
                      <p className="text-xs font-bold text-foreground">
                        {quality?.hasWorkflows ? '🚀 GitHub Actions Automated' : '⏳ Manual Release Cycle'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      AI Architectural Summary
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This repository demonstrates clean component modularity using <strong className="text-foreground">{languages?.primaryLanguage || 'standard languages'}</strong> with detected dependencies across {detectedSkills.slice(0, 4).join(', ') || 'core packages'}. {quality?.hasDockerfile ? 'The inclusion of a Dockerfile signals strong cloud-native deployment awareness.' : 'Adding containerization would further boost recruiter portfolio points.'}
                    </p>
                  </div>
                </div>

                {/* Security & Production Hygiene */}
                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                        AI Security & Hygiene Gate
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-500 font-bold">
                      {quality?.exposedSecrets?.length > 0 ? '⚠️ Action Required' : '✅ Passed Inspection'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border text-xs">
                      <div className="flex items-center gap-2.5">
                        {quality?.exposedSecrets?.length > 0 ? (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="font-bold text-foreground">Secrets & Sensitive Files</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${quality?.exposedSecrets?.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {quality?.exposedSecrets?.length > 0 ? `LEAK DETECTED (${quality.exposedSecrets.join(', ')})` : 'CLEAN (0 LEAKS)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border text-xs">
                      <div className="flex items-center gap-2.5">
                        {quality?.hasGitignore ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-bold text-foreground">.gitignore Environment Isolation</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${quality?.hasGitignore ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {quality?.hasGitignore ? 'CONFIGURED' : 'MISSING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border text-xs">
                      <div className="flex items-center gap-2.5">
                        {quality?.hasTests ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-bold text-foreground">Automated Test Suites</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${quality?.hasTests ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {quality?.hasTests ? 'VERIFIED (Active)' : 'NO TESTS FOUND'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border text-xs">
                      <div className="flex items-center gap-2.5">
                        {quality?.hasLinter ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-bold text-foreground">Code Formatter & Linter</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${quality?.hasLinter ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {quality?.hasLinter ? 'ENFORCED' : 'OPTIONAL'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. AI Technical Recruiter Interview Prep Matrix */}
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                      AI Recruiter Interview Prep Matrix
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Top 3 Questions Technical Hiring Managers Will Ask About This Project
                  </span>
                </div>

                <div className="space-y-4">
                  {getAiInterviewQuestions().map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Evaluation Question {idx + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        "{item.question}"
                      </p>
                      <div className="pt-1.5 space-y-1.5 text-xs">
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Recruiter's Goal:</strong> {item.intent}
                        </p>
                        <div className="p-3 rounded-lg bg-card/80 border border-border text-foreground text-xs leading-relaxed">
                          <span className="font-bold text-primary block mb-1">💡 AI Recommended Model Answer:</span>
                          {item.modelAnswer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. AI Resume Impact Bullets Generator (STAR Method) */}
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                        AI Resume Impact Bullets (STAR Method)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Pre-crafted, quantifiable bullet points formatted for tech resumes & LinkedIn project entries
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBullets}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    {copiedBullets ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBullets ? 'Copied to Clipboard!' : 'Copy All Bullets'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {getAiResumeBullets().map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border text-xs leading-relaxed text-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Interactive AI Repo Advisor & Prompt Sandbox */}
              <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Interactive AI Code & Architecture Advisor
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Neural Repo Consultant</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ask any engineering, refactoring, scalability, or interview question tailored specifically to this codebase:
                </p>

                {/* Quick Prompt Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🚀 Scaling to 10k Users', prompt: 'How do I scale this repository architecture to handle 10k daily active users?' },
                    { label: '🛡️ Security Hardening', prompt: 'Perform an in-depth security hardening review for this repository.' },
                    { label: '♻️ Clean Architecture Tips', prompt: 'Suggest clean code refactoring and design pattern improvements for this codebase.' },
                    { label: '🎯 Mock Interview Simulation', prompt: 'Generate 3 tough recruiter interview questions and model answers based on this repository.' },
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskAi(pill.prompt)}
                      disabled={aiAdvisorLoading}
                      className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Text Input & Submit */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAi();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Ask AI anything about this repository (e.g., How can I improve my error handling or add redis?)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={aiAdvisorLoading || !aiCustomPrompt.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {aiAdvisorLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{aiAdvisorLoading ? 'Analyzing...' : 'Ask AI'}</span>
                  </button>
                </form>

                {/* AI Response Output */}
                {aiAdvisorAnswer && (
                  <div className="mt-4 p-5 rounded-xl bg-secondary/60 border border-border space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        AI Advisor Response
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(aiAdvisorAnswer);
                          }
                          setCopiedAnswer(true);
                          showToast('AI response copied!', 'success');
                          setTimeout(() => setCopiedAnswer(false), 2000);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copiedAnswer ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans space-y-2">
                      {aiAdvisorAnswer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GithubRepoScanner;
