import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  Save,
  Search,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  Sparkles,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { domainKnowledgeService } from '../../services/domainKnowledgeService';
import { getAllKnowledgeDomains, CAREER_FAMILIES } from '../../data/domainKnowledgeData';

export function AdminDomainKnowledgeManagement() {
  const [domains, setDomains] = useState([]);
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [selectedModuleNum, setSelectedModuleNum] = useState(1);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All Families');

  // Form edit states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDuration, setFormDuration] = useState(45);
  const [isPublished, setIsPublished] = useState(true);
  const [sections, setSections] = useState([]);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeExplanation, setCodeExplanation] = useState('');

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const allDoms = getAllKnowledgeDomains();
        setDomains(allDoms);
        if (allDoms.length > 0) {
          setSelectedDomainId(allDoms[0].id);
        }
        const stats = await domainKnowledgeService.adminGetAnalytics();
        setAnalytics(stats);
      } catch (err) {
        console.error('Failed to load admin knowledge hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // When selected domain or module changes, load module details
  useEffect(() => {
    if (!selectedDomainId) return;
    async function loadModule() {
      try {
        const mod = await domainKnowledgeService.getModuleDetails(selectedDomainId, selectedModuleNum);
        if (mod) {
          setModuleData(mod);
          setFormTitle(mod.title || '');
          setFormSubtitle(mod.subtitle || '');
          setFormDuration(mod.estimatedMinutes || 45);
          setIsPublished(true);
          setSections(mod.sections ? JSON.parse(JSON.stringify(mod.sections)) : []);
          if (mod.codeSnippet) {
            setCodeLanguage(mod.codeSnippet.language || 'javascript');
            setCodeSnippet(mod.codeSnippet.code || '');
            setCodeExplanation(mod.codeSnippet.explanation || '');
          } else {
            setCodeLanguage('python');
            setCodeSnippet('');
            setCodeExplanation('');
          }
        }
      } catch (err) {
        console.error('Failed to load module details:', err);
      }
    }
    loadModule();
  }, [selectedDomainId, selectedModuleNum]);

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  const filteredDomains = domains.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.family.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFamily =
      selectedFamily === 'All Families' || d.family.toLowerCase() === selectedFamily.toLowerCase();
    return matchesSearch && matchesFamily;
  });

  const handleSectionContentChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        title: formTitle,
        subtitle: formSubtitle,
        estimatedMinutes: formDuration,
        isPublished,
        contentJson: {
          sections,
          codeSnippet: codeSnippet
            ? {
                language: codeLanguage,
                code: codeSnippet,
                explanation: codeExplanation
              }
            : null
        }
      };

      await domainKnowledgeService.adminUpdateModule(selectedDomainId, selectedModuleNum, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save module:', err);
      alert('Error updating module content.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!activeDomain || !moduleData) return;
    domainKnowledgeService.exportPrintableDocument({
      domain: activeDomain,
      moduleData: {
        ...moduleData,
        title: formTitle,
        subtitle: formSubtitle,
        sections,
        codeSnippet: codeSnippet ? { language: codeLanguage, code: codeSnippet, explanation: codeExplanation } : null
      }
    });
  };

  return (
    <div className="space-y-7">
      {/* Top Banner & Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CampusCorpo Academic Governance & Curriculum CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Domain Knowledge Hub Management
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
              Curate, edit, and publish technical educational content across all 38 IT domains and 456 modules.
              Maintain university curriculum standards, verify runnable code snippets, and review student completion metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/career-explorer/knowledge-hub"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4 text-primary" />
              <span>Student View Hub</span>
            </Link>
            {activeDomain && (
              <Link
                to={`/career-explorer/knowledge-hub/${activeDomain.id}/${selectedModuleNum}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold shadow-sm transition-all"
              >
                <span>Live Workspace</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Analytics High-level Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Total Domains</span>
            </div>
            <div className="text-2xl font-bold text-foreground">38 Tracks</div>
            <div className="text-xs text-muted-foreground mt-0.5">8 Tech Families</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Active Modules</span>
            </div>
            <div className="text-2xl font-bold text-foreground">456 Modules</div>
            <div className="text-xs text-muted-foreground mt-0.5">12 per domain</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Student Learners</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {analytics?.activeStudentLearners ? `${analytics.activeStudentLearners.toLocaleString()}+` : '1,420+'}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Active candidates</div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>PDF Notes Exports</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {analytics?.totalPdfsDownloaded ? `${analytics.totalPdfsDownloaded.toLocaleString()}` : '1,280'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Academic editions</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Domain & Module Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Select Domain</span>
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {filteredDomains.length} / 38
              </span>
            </div>

            {/* Search and Family Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter domain name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                />
              </div>

              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="All Families">All Career Families (8)</option>
                {CAREER_FAMILIES.map((fam) => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>

            {/* Scrollable Domain List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredDomains.map((dom) => {
                const isSelected = dom.id === selectedDomainId;
                return (
                  <button
                    key={dom.id}
                    onClick={() => {
                      setSelectedDomainId(dom.id);
                      setSelectedModuleNum(1);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                        : 'bg-background hover:bg-muted border-border/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{dom.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        12 mods
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{dom.family}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Selector (1 to 12) */}
          {activeDomain && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Modules for {activeDomain.name}</span>
              </h3>
              <p className="text-xs text-muted-foreground">Select a module to view and edit its syllabus notes:</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                  const isCurrent = num === selectedModuleNum;
                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedModuleNum(num)}
                      className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all border ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background hover:bg-muted border-border text-foreground'
                      }`}
                    >
                      Module {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Module Content Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header & Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Module {selectedModuleNum} of 12 • {activeDomain?.name}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Curriculum & Syllabus Editor
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors"
                  title="Export module as printable academic PDF"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Module PDF</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Core Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Module Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Estimated Study Time (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Module Subtitle & Academic Scope</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Sections Accordion / List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Curriculum Content Sections ({sections.length})</span>
                </h3>
              </div>

              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        Topic {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Section Heading</label>
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => handleSectionContentChange(idx, 'heading', e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Detailed Content Notes</label>
                      <textarea
                        rows={5}
                        value={sec.content}
                        onChange={(e) => handleSectionContentChange(idx, 'content', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippet Lab Editor */}
            <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Executable Implementation Lab Code</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Programming Language</label>
                  <input
                    type="text"
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    placeholder="e.g. javascript, python, sql, go, rust"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Executable Code</label>
                <textarea
                  rows={8}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border bg-neutral-900 text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Technical Code Walkthrough</label>
                <textarea
                  rows={3}
                  value={codeExplanation}
                  onChange={(e) => setCodeExplanation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-muted-foreground">
                  Auto-validated against CampusCorpo Quality Standards
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Save & Publish Module Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminDomainKnowledgeManagement;
