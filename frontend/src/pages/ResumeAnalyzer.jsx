import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import resumeAnalyzerService from '../services/resumeAnalyzerService';
import { IT_ROLES } from '../data/itRoles';
import {
  FileSearch,
  Upload,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Download,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  FileText,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

export function ResumeAnalyzer() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const targetRoleQuery = searchParams.get('targetRole') || searchParams.get('role');

  // State
  const [roles, setRoles] = useState(IT_ROLES);
  const [placementJobs, setPlacementJobs] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(targetRoleQuery || IT_ROLES[0]?.id || 'frontend-developer');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customJobDesc, setCustomJobDesc] = useState('');
  const [showCustomDesc, setShowCustomDesc] = useState(false);

  useEffect(() => {
    if (targetRoleQuery) {
      setSelectedRoleId(targetRoleQuery);
    }
  }, [targetRoleQuery]);

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState('');

  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'history'

  const [aiHealth, setAiHealth] = useState(null);
  const fileInputRef = useRef(null);

  // Load initial roles, health, and history
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [rolesRes, healthRes] = await Promise.all([
          resumeAnalyzerService.getRoles().catch(() => null),
          resumeAnalyzerService.getHealth().catch(() => null),
        ]);

        if (mounted) {
          if (rolesRes?.roles?.length > 0) {
            setRoles(rolesRes.roles);
            if (!selectedRoleId) {
              setSelectedRoleId(rolesRes.roles[0].id);
            }
          }
          if (rolesRes?.placementJobs?.length > 0) {
            setPlacementJobs(rolesRes.placementJobs);
          }
          if (healthRes) {
            setAiHealth(healthRes.aiService);
          }
        }
      } catch (err) {
        console.warn('Backend sync skipped, using local IT roles catalog:', err);
      }
    }

    loadData();
    fetchHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const items = await resumeAnalyzerService.getHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setError('Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Document exceeds the 5MB size limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select or drag-and-drop a resume file (PDF or DOCX).');
      return;
    }
    if (!selectedRoleId) {
      setError('Please select a target job role.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      setAnalysisStage('Extracting & validating document text...');

      const stageTimer1 = setTimeout(() => {
        setAnalysisStage('Analyzing resume against role benchmarks...');
      }, 1500);

      const stageTimer2 = setTimeout(() => {
        setAnalysisStage('Synthesizing ATS scores, matched skills & recommendations...');
      }, 25000);

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('roleId', selectedRoleId);
      if (selectedJobId) formData.append('jobId', selectedJobId);
      if (customJobDesc.trim()) formData.append('customJobDescription', customJobDesc.trim());

      const res = await resumeAnalyzerService.analyzeResume(formData);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      setActiveAnalysis(res.data);
      fetchHistory(); // Refresh history tab
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.message || err.message || 'Analysis failed. Please check the AI service status.';
      setError(msg);
    } finally {
      setAnalyzing(false);
      setAnalysisStage('');
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume analysis record?')) return;
    try {
      await resumeAnalyzerService.deleteAnalysis(id);
      setHistory(prev => prev.filter(item => item.id !== id && item.uuid !== id));
      if (activeAnalysis && (activeAnalysis.id === id || activeAnalysis.uuid === id)) {
        setActiveAnalysis(null);
      }
      showToast('Resume analysis record removed', 'success');
    } catch (err) {
      showToast('Failed to delete record: ' + err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  AI Resume Analyzer
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                  AI Powered
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Targeted ATS parsing, semantic skill verification, and metric-driven feedback powered by CampusCorpo AI.
              </p>
            </div>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center gap-2 text-sm bg-muted/50 px-3.5 py-2 rounded-xl border border-border self-start md:self-auto shrink-0">
            <Cpu className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Engine Status</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className={`w-2 h-2 rounded-full ${aiHealth?.model_loaded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{aiHealth?.model_loaded ? 'AI Engine Ready' : 'AI Service Initializing...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 pt-3 border-t border-border flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-foreground text-background font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Resume Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-foreground text-background font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>Analysis History</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border font-bold">
              {history.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'analyzer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload & Role Configuration (Sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center gap-2 font-semibold text-base border-b border-border pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>Step 1: Choose Target Role & Criteria</span>
              </div>

              {/* Target Job Role Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Target Career Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => {
                    setSelectedRoleId(e.target.value);
                    setError('');
                  }}
                  className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {roles.length === 0 ? (
                    <option value="" disabled>Loading career roles...</option>
                  ) : (
                    Object.entries(
                       roles.reduce((acc, r) => {
                        const cat = r.category || 'General IT Roles';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(r);
                        return acc;
                      }, {})
                    ).map(([catName, catRoles]) => (
                      <optgroup key={catName} label={catName} className="bg-popover text-foreground font-semibold">
                        {catRoles.map((r) => (
                          <option key={r.id} value={r.id} className="bg-card text-foreground py-1 font-normal">
                            {r.title}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
                {selectedRole && (
                  <div className="mt-2 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {selectedRole.category}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedRole.shortDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Skills Preview */}
              {selectedRole?.technicalSkills?.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-sm space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Core Target Skills for {selectedRole.title}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedRole.technicalSkills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-xs bg-secondary text-secondary-foreground border border-border font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedRole.technicalSkills.length > 6 && (
                      <span className="text-xs text-muted-foreground font-semibold px-1 py-0.5">
                        +{selectedRole.technicalSkills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Placement Opening Link */}
              {placementJobs.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Match Against Active Campus Opening (Optional)
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- General Industry Standards for Role --</option>
                    {placementJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Custom Job Description */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCustomDesc(!showCustomDesc)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCustomDesc ? 'rotate-180' : ''}`} />
                  <span>{showCustomDesc ? 'Hide custom job description' : 'Paste custom job description or requirements'}</span>
                </button>

                {showCustomDesc && (
                  <textarea
                    rows={4}
                    value={customJobDesc}
                    onChange={(e) => setCustomJobDesc(e.target.value)}
                    placeholder="Paste specific JD requirements, preferred frameworks, minimum qualifications, or team tech stack..."
                    className="w-full mt-2 text-sm rounded-xl border border-border bg-background p-3 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-y"
                  />
                )}
              </div>
            </div>

            {/* Document Upload Zone */}
            <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b border-border pb-3">
                <Upload className="w-4 h-4 text-primary" />
                <span>Step 2: Upload Resume (PDF / DOCX)</span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground truncate max-w-xs mx-auto">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • Click or drop new file to replace
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Drag and drop your resume here, or <span className="text-primary underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supports digital PDF and Word DOCX (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={!file || analyzing}
                onClick={handleAnalyze}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Resume for {selectedRole?.title || 'Selected Role'}</span>
                  </>
                )}
              </button>

              {analyzing && (
                <div className="p-3 rounded-xl bg-muted/60 border border-border text-center space-y-2">
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground animate-pulse">
                    {analysisStage || 'Processing resume with CampusCorpo AI...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results Showcase (Independent Scroll) */}
          <div className="lg:col-span-7 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            {activeAnalysis ? (
              <div className="space-y-6">
                {/* Result Score Header Card */}
                <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Analysis Summary Report
                      </span>
                      <h2 className="text-xl font-bold text-foreground">
                        {activeAnalysis.roleTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        File: {activeAnalysis.originalFilename} • Evaluated via CampusCorpo AI
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Score Rings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Overall Resume Score */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                        <span className="text-xl font-black text-foreground">
                          {activeAnalysis.overallScore || activeAnalysis.analysis?.overallScore}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                          <span>Overall Quality Score</span>
                          <span className="text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Assesses structural formatting, quantifiable metrics, clarity, and ATS readability.
                        </p>
                      </div>
                    </div>

                    {/* Job Match Score */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {activeAnalysis.jobMatchScore || activeAnalysis.analysis?.jobMatchScore}%
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                          <span>Role Match Alignment</span>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {(activeAnalysis.jobMatchScore || activeAnalysis.analysis?.jobMatchScore) >= 75 ? 'Competitive Match' : 'Optimization Needed'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Measures demonstrated competencies versus target requirements for {activeAnalysis.roleTitle}.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 rounded-xl bg-secondary/40 border border-border text-sm leading-relaxed text-foreground">
                    <span className="font-bold block text-foreground mb-1">Executive Summary:</span>
                    <p>{activeAnalysis.analysis?.summary}</p>
                  </div>
                </div>

                {/* Key Strengths */}
                {activeAnalysis.analysis?.strengths?.length > 0 && (
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Standout Resume Strengths</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {activeAnalysis.analysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="leading-relaxed text-foreground">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>Matched Skills ({activeAnalysis.analysis?.matchedSkills?.length || 0})</span>
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {activeAnalysis.analysis?.matchedSkills?.map((s, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm">
                          <span className="font-bold text-foreground block">{s.skill}</span>
                          <span className="text-xs text-muted-foreground mt-0.5 block italic">
                            "{s.evidence}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing or Weak Skills */}
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                      <Zap className="w-4 h-4" />
                      <span>Missing / Weak Skills ({activeAnalysis.analysis?.missingOrWeakSkills?.length || 0})</span>
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {activeAnalysis.analysis?.missingOrWeakSkills?.map((s, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{s.skill}</span>
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              {s.priority} priority
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.reason}</p>
                          <p className="text-xs text-foreground font-medium bg-background/50 p-2 rounded-md">
                            💡 Tip: {s.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section-Wise Feedback */}
                {activeAnalysis.analysis?.sectionFeedback?.length > 0 && (
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Section-Wise ATS Quality Analysis</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {activeAnalysis.analysis.sectionFeedback.map((sec, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-muted/20 border border-border text-sm space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-base">{sec.section}</span>
                            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
                              Score: {sec.score}/100
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{sec.feedback}</p>
                          <p className="text-foreground font-medium text-xs bg-background/60 p-2 rounded-lg border border-border/60">
                            <strong>Recommendation:</strong> {sec.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ATS Keyword Suggestions */}
                {activeAnalysis.analysis?.keywordSuggestions?.length > 0 && (
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
                    <span className="text-sm font-bold text-foreground block">
                      Recommended ATS Keywords to Embed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAnalysis.analysis.keywordSuggestions.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs bg-muted font-medium text-foreground border border-border"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Action Plan */}
                {activeAnalysis.analysis?.actionPlan?.length > 0 && (
                  <div className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Immediate Action Plan</span>
                    </div>
                    <div className="space-y-2">
                      {activeAnalysis.analysis.actionPlan.map((act, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed text-foreground">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="bg-card text-card-foreground border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
                  <FileSearch className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Ready to Evaluate Your Resume
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                  Select your desired job role, upload your resume, and let our AI engine analyze your ATS compatibility and technical positioning.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md w-full text-center text-sm">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="font-bold block text-foreground">ATS Score</span>
                    <span className="text-xs text-muted-foreground">Readability check</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="font-bold block text-foreground">Skill Matching</span>
                    <span className="text-xs text-muted-foreground">Evidence quotes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="font-bold block text-foreground">Gap Analysis</span>
                    <span className="text-xs text-muted-foreground">Actionable tips</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Past Resume Evaluations</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Saved scans for {user?.first_name || 'Student'}. Compare your score progression across target roles.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading past analyses...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p>No previous resume analyses recorded.</p>
              <button
                type="button"
                onClick={() => setActiveTab('analyzer')}
                className="text-primary font-bold hover:underline"
              >
                Run your first analysis now →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveAnalysis(item);
                    setActiveTab('analyzer');
                  }}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">{item.roleTitle}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {item.fileFormat}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.originalFilename} • {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Quality:</span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {item.overallScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Role Match:</span>
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {item.jobMatchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete scan record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
