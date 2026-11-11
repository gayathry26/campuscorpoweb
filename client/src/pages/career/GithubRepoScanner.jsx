import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import githubScannerService from '../../services/githubScannerService';
import {
  GitBranch,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  BookOpen,
  Zap,
  RotateCcw,
  Plus,
  Compass,
} from 'lucide-react';

const POPULAR_REPOS = [
  { label: 'React.js (Meta)', url: 'https://github.com/facebook/react' },
  { label: 'FastAPI (Python)', url: 'https://github.com/fastapi/fastapi' },
  { label: 'Next.js (Vercel)', url: 'https://github.com/vercel/next.js' },
  { label: 'Spring Boot (Java)', url: 'https://github.com/spring-projects/spring-boot' },
];

export function GithubRepoScanner() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inputUrl, setInputUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  // Skill import state
  const [importingSkills, setImportingSkills] = useState(false);
  const [imported, setImported] = useState(false);

  const handleScan = async (urlToScan) => {
    const target = urlToScan || inputUrl;
    if (!target || !target.trim()) {
      showToast('Please enter a GitHub repository URL or "owner/repo" path.', 'error');
      return;
    }

    setScanning(true);
    setError(null);
    setImported(false);

    try {
      const data = await githubScannerService.scanRepository(target.trim());
      setScanResult(data);
      showToast(`Scanned ${data.repository?.fullName || 'repository'} successfully!`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to scan repository.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setScanning(false);
    }
  };

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
      showToast(res.message || 'Skills imported and verified successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import skills.', 'error');
    } finally {
      setImportingSkills(false);
    }
  };

  const repo = scanResult?.repository;
  const languages = scanResult?.languages;
  const quality = scanResult?.codeQuality;
  const detectedSkills = scanResult?.detectedSkills || [];
  const matchedRoles = scanResult?.matchedRoles || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Placement Code Quality & Portfolio Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            GitHub Repository Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Audit public student repositories, inspect language distribution, detect frameworks & dependencies,
            evaluate production engineering readiness, and verify technical skills.
          </p>
        </div>
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
              placeholder="e.g. https://github.com/facebook/react or username/project"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                <span>Scanning Repository...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Scan Repository</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Repositories */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Sample Repositories:</span>
          {POPULAR_REPOS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => {
                setInputUrl(sample.url);
                handleScan(sample.url);
              }}
              className="px-2.5 py-1 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground hover:border-primary/50 transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold">Repository Scan Failed</h4>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && repo && (
        <div className="space-y-6">
          {/* 1. Repository Hero Header */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={repo.ownerAvatar}
                alt={repo.owner}
                className="w-14 h-14 rounded-2xl border border-border object-cover bg-secondary"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {repo.fullName}
                  </h2>
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border text-primary hover:underline"
                  >
                    <span>View on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {repo.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
                  <span>Branch: <strong className="text-foreground">{repo.defaultBranch}</strong></span>
                  <span>License: <strong className="text-foreground">{repo.license}</strong></span>
                  <span>Size: <strong className="text-foreground">{(repo.sizeKb / 1024).toFixed(1)} MB</strong></span>
                  <span>Updated: <strong className="text-foreground">{new Date(repo.lastPushedAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{repo.stars.toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Stars</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center">
                <div className="flex items-center justify-center gap-1 text-blue-500 font-bold text-base">
                  <GitFork className="w-4 h-4" />
                  <span>{repo.forks.toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Forks</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-center">
                <div className="flex items-center justify-center gap-1 text-purple-500 font-bold text-base">
                  <Eye className="w-4 h-4" />
                  <span>{repo.watchers.toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Watchers</span>
              </div>
            </div>
          </div>

          {/* 2. Grid: Code Quality Score & Language Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Code Quality & Readiness Score */}
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Engineering Quality
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                  {quality?.rating?.replace('_', ' ')}
                </span>
              </div>

              {/* Big Score Gauge */}
              <div className="py-2 text-center">
                <div className="text-5xl font-black text-foreground tracking-tight">
                  {quality?.score}
                  <span className="text-xl font-medium text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Readiness for campus placement technical screening
                </p>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Documentation & README</span>
                    <span className="font-bold text-foreground">{quality?.scoreBreakdown?.documentation}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(quality?.scoreBreakdown?.documentation / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Architecture & Tech Stack</span>
                    <span className="font-bold text-foreground">{quality?.scoreBreakdown?.codebaseStructure}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(quality?.scoreBreakdown?.codebaseStructure / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>CI/CD & Testing</span>
                    <span className="font-bold text-foreground">{quality?.scoreBreakdown?.devOpsAndTesting}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(quality?.scoreBreakdown?.devOpsAndTesting / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Recency & Maintenance</span>
                    <span className="font-bold text-foreground">{quality?.scoreBreakdown?.maintenanceAndActivity}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(quality?.scoreBreakdown?.maintenanceAndActivity / 25) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right: Languages Distribution */}
            <div className="lg:col-span-2 bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Language Breakdown
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Primary: <strong className="text-foreground">{languages?.primaryLanguage}</strong>
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-secondary border border-border">
                {languages?.breakdown?.map((lang) => (
                  <div
                    key={lang.name}
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                    title={`${lang.name}: ${lang.percentage}%`}
                    className="h-full transition-all"
                  />
                ))}
              </div>

              {/* Language Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {languages?.breakdown?.slice(0, 6).map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/60 border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-bold text-foreground">{lang.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Detected Skills & One-Click Import */}
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Detected Frameworks & Technical Skills</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {detectedSkills.length} identified
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Extracted automatically from source tree, dependencies (package.json, requirements.txt, pom.xml), and CI workflows.
                </p>
              </div>

              {/* Import Skills Button */}
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
                      <span>Skills Verified in Your Profile</span>
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

            {/* Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {detectedSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary border border-border text-foreground flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 4. Matched Placement Roles & Recruiter Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Matched Roles */}
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Compass className="w-5 h-5 text-primary" />
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
                        <span className="text-base font-black text-primary">{role.fitScore}%</span>
                        <span className="block text-[10px] text-muted-foreground">Portfolio Fit</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No specific placement roles mapped yet.</p>
                )}
              </div>
            </div>

            {/* Right: Recruiter Highlights & Advice */}
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
    </div>
  );
}

export default GithubRepoScanner;

