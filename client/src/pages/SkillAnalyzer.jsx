import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Sparkles,
  Compass,
  Cpu,
  Layers,
  GitCompare,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Settings,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SkillSelector } from '../components/skill-analyzer/SkillSelector';
import { SelectedSkillsPanel } from '../components/skill-analyzer/SelectedSkillsPanel';
import { ProficiencyModal } from '../components/skill-analyzer/ProficiencyModal';
import { SkillAssessmentModal } from '../components/skill-analyzer/SkillAssessmentModal';
import { AnalysisResults } from '../components/skill-analyzer/AnalysisResults';
import { AdminSkillManagement } from '../components/skill-analyzer/AdminSkillManagement';
import { SKILL_CATALOGUE, SKILL_CATEGORIES } from '../data/skillsCatalogueData';
import { getRoleById } from '../data/itRoles';

export function SkillAnalyzer() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetedRoleId = searchParams.get('role') || searchParams.get('targetRole');
  const targetRoleObj = useMemo(() => {
    return targetedRoleId ? getRoleById(targetedRoleId) : null;
  }, [targetedRoleId]);
  const isAdminOrTpo =
    user?.roleName === 'SUPER_ADMIN' ||
    user?.roleName === 'ADMIN' ||
    user?.roleName === 'TPO_OFFICER';

  // 1. Skill Catalogue & Categories State (pre-populated with master catalogue for instant zero-lag rendering)
  const [catalogue, setCatalogue] = useState(SKILL_CATALOGUE);
  const [categories, setCategories] = useState(SKILL_CATEGORIES);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Skills');

  // 2. Student Selected Skills State
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loadingStudentSkills, setLoadingStudentSkills] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'SAVED' | 'SAVING' | 'ERROR'

  // 3. Modals State
  const [activeProficiencySkill, setActiveProficiencySkill] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // 4. Analysis Results State
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Selected skill IDs set for O(1) fast lookup
  const selectedSkillIds = useMemo(() => {
    return new Set(selectedSkills.map((s) => s.skillId));
  }, [selectedSkills]);

  // Load Skills Catalogue & Categories from backend DB
  const fetchCatalogue = useCallback(async () => {
    try {
      const [skillsRes, catsRes] = await Promise.all([
        apiClient.get('/skills'),
        apiClient.get('/skills/categories'),
      ]);

      if (skillsRes.data?.success && Array.isArray(skillsRes.data.data) && skillsRes.data.data.length > 0) {
        setCatalogue(skillsRes.data.data);
      }
      if (catsRes.data?.success && Array.isArray(catsRes.data.data?.categories) && catsRes.data.data.categories.length > 0) {
        setCategories(catsRes.data.data.categories);
      }
    } catch (err) {
      console.warn('Backend skill catalogue fetch skipped or offline, using robust client master catalogue:', err.message);
    } finally {
      setLoadingCatalogue(false);
    }
  }, []);

  // Load Student's Saved Skills from backend
  const fetchStudentSkills = useCallback(async () => {
    try {
      const res = await apiClient.get('/student/skills');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSelectedSkills(res.data.data);
        setSyncStatus('SAVED');
      }
    } catch (err) {
      console.warn('Error fetching student saved skills:', err.message);
    } finally {
      setLoadingStudentSkills(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogue();
    fetchStudentSkills();
  }, [fetchCatalogue, fetchStudentSkills]);

  // Save selected skills to backend with debounce
  const persistSkillsToBackend = async (updatedSkills) => {
    setSavingSkills(true);
    setSyncStatus('SAVING');
    try {
      const res = await apiClient.put('/student/skills', { skills: updatedSkills });
      if (res.data?.success) {
        setSyncStatus('SAVED');
      }
    } catch (err) {
      console.warn('Failed to sync skills to account:', err.message);
      setSyncStatus('ERROR');
    } finally {
      setSavingSkills(false);
    }
  };

  // Toggle skill selection
  const handleToggleSkill = (skill) => {
    const isAlreadySelected = selectedSkillIds.has(skill.id);
    let updated;

    if (isAlreadySelected) {
      updated = selectedSkills.filter((s) => s.skillId !== skill.id);
    } else {
      updated = [
        ...selectedSkills,
        {
          skillId: skill.id,
          name: skill.name,
          category: skill.category,
          isPopular: skill.isPopular,
          description: skill.description,
          proficiencyLevel: 'INTERMEDIATE',
          evidenceType: 'NONE',
          evidenceUrl: '',
          isVerified: false,
        },
      ];
    }

    setSelectedSkills(updated);
    persistSkillsToBackend(updated);
  };

  // Remove individual skill
  const handleRemoveSkill = (skillId) => {
    const updated = selectedSkills.filter((s) => s.skillId !== skillId);
    setSelectedSkills(updated);
    persistSkillsToBackend(updated);
  };

  // Clear all selected skills
  const handleClearAll = () => {
    setSelectedSkills([]);
    setAnalysis(null);
    persistSkillsToBackend([]);
  };

  // Update proficiency & evidence from modal
  const handleSaveProficiency = (updatedSkill) => {
    const updated = selectedSkills.map((s) =>
      s.skillId === updatedSkill.skillId ? updatedSkill : s
    );
    setSelectedSkills(updated);
    persistSkillsToBackend(updated);

    // If analysis was already run, re-run analysis dynamically
    if (analysis) {
      handleAnalyzeSkills(updated, analysis.targetRole?.roleId);
    }
  };

  // Run Skill Analysis
  const handleAnalyzeSkills = async (customSkills = null, overrideTargetRoleId = null) => {
    const skillsToAnalyze = customSkills || selectedSkills;
    if (skillsToAnalyze.length === 0) return;

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await apiClient.post('/skill-analyzer/analyze', {
        selectedSkills: skillsToAnalyze,
        targetRoleId: overrideTargetRoleId || targetedRoleId || null,
      });

      if (res.data?.success) {
        setAnalysis(res.data);
        // Smooth scroll to analysis results
        setTimeout(() => {
          const el = document.getElementById('analysis-results-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    } catch (err) {
      setAnalysisError(
        err.response?.data?.message || 'Failed to complete skill analysis.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Pre-select required skills from catalogue for the targeted role
  const handleSelectRoleSkills = () => {
    if (!targetRoleObj?.technicalSkills) return;
    const roleSkillNames = targetRoleObj.technicalSkills.map((s) => s.toLowerCase());

    const matchingCatalogueSkills = catalogue.filter((c) =>
      roleSkillNames.some(
        (ts) =>
          c.name.toLowerCase() === ts ||
          c.name.toLowerCase().includes(ts) ||
          ts.includes(c.name.toLowerCase())
      )
    );

    const existingIds = new Set(selectedSkills.map((s) => s.skillId));
    const newItems = matchingCatalogueSkills
      .filter((s) => !existingIds.has(s.id))
      .map((s) => ({
        skillId: s.id,
        name: s.name,
        category: s.category,
        isPopular: s.isPopular,
        description: s.description,
        proficiencyLevel: 'INTERMEDIATE',
        evidenceType: 'NONE',
        evidenceUrl: '',
        isVerified: false,
      }));

    if (newItems.length > 0) {
      const updated = [...selectedSkills, ...newItems];
      setSelectedSkills(updated);
      persistSkillsToBackend(updated);
    }
  };

  // Handle roadmap task completion checkbox
  const handleTaskToggle = async (roleId, taskId, isCompleted) => {
    try {
      await apiClient.patch('/skill-analyzer/roadmap/progress', {
        roleId,
        taskId,
        isCompleted,
      });

      // Update local analysis state
      setAnalysis((prev) => {
        if (!prev || !prev.roadmap) return prev;
        const updatedStages = prev.roadmap.stages.map((stage) => {
          const updatedTasks = stage.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: isCompleted } : t
          );
          const completedCount = updatedTasks.filter((t) => t.completed).length;
          return {
            ...stage,
            tasks: updatedTasks,
            progressPercentage: Math.round((completedCount / updatedTasks.length) * 100),
            isCompleted: completedCount === updatedTasks.length,
          };
        });

        let totalT = 0;
        let compT = 0;
        updatedStages.forEach((s) => {
          totalT += s.tasks.length;
          compT += s.tasks.filter((t) => t.completed).length;
        });

        return {
          ...prev,
          roadmap: {
            ...prev.roadmap,
            stages: updatedStages,
            totalTasks: totalT,
            completedTasksCount: compT,
            overallProgress: totalT > 0 ? Math.round((compT / totalT) * 100) : 0,
          },
        };
      });
    } catch (err) {
      console.warn('Failed to update roadmap task progress:', err);
    }
  };

  // Handle assessment quiz completion
  const handleAssessmentCompleted = (result) => {
    fetchStudentSkills();
    if (analysis) {
      handleAnalyzeSkills();
    }
  };

  // Filter skills by category & search query
  const filteredSkills = useMemo(() => {
    return catalogue.filter((s) => {
      // Category filter
      if (activeCategory !== 'All Skills' && s.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesc = (s.description || '').toLowerCase().includes(q);
        const matchCat = s.category.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat;
      }
      return true;
    });
  }, [catalogue, activeCategory, searchQuery]);

  return (
    <div id="skill-selector-top" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Placement Preparation
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">• Career Explorer Module</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Discover Your Skills. Find Your Career Path.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Select your technical stack, evaluate proficiency with verified credentials, and generate a deterministic role match with a personalized 5-stage placement roadmap.
          </p>
        </div>

        {/* Top Actions: Admin & Assessment Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAssessmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Take Skill Quiz</span>
          </button>

          {isAdminOrTpo && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Admin: Manage catalogue & role weights"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="hidden md:inline">Admin Governance</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Role Integration Banner */}
      {targetRoleObj && (
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50 duration-200 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Target Career Role Assessment
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                  {targetRoleObj.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">
                {targetRoleObj.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Select the technologies you already know below to calculate your fitment score, discover matched vs missing skills, and unlock a customized 5-stage placement roadmap.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectRoleSkills}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-colors cursor-pointer"
              title="Pre-select skills relevant to this role from the catalogue"
            >
              Pre-Select Stack
            </button>
            <button
              type="button"
              onClick={() => handleAnalyzeSkills(null, targetRoleObj.id)}
              disabled={analyzing || selectedSkills.length === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? 'Evaluating...' : 'Evaluate Role Fit'}
            </button>
          </div>
        </div>
      )}

      {/* Sync / Autosave status pill */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          {syncStatus === 'SAVING' ? (
            <span className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="w-2.5 h-2.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Saving selections to your account...</span>
            </span>
          ) : syncStatus === 'SAVED' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selections saved to your student profile</span>
            </span>
          ) : syncStatus === 'ERROR' ? (
            <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed to save. Changes saved locally.</span>
            </span>
          ) : null}
        </div>

        <div className="text-xs text-muted-foreground">
          {catalogue.length} technologies in catalogue
        </div>
      </div>

      {/* Section 1: Searchable Skill Selector */}
      <SkillSelector
        skills={filteredSkills}
        selectedSkillIds={selectedSkillIds}
        onToggleSkill={handleToggleSkill}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={categories}
        loading={loadingCatalogue}
      />

      {/* Section 2: Selected Skills Profile Panel */}
      <SelectedSkillsPanel
        selectedSkills={selectedSkills}
        onRemoveSkill={handleRemoveSkill}
        onClearAll={handleClearAll}
        onOpenProficiencyModal={(skill) => setActiveProficiencySkill(skill)}
        onAnalyze={() => handleAnalyzeSkills()}
        analyzing={analyzing}
        onOpenAssessmentModal={() => setIsAssessmentModalOpen(true)}
      />

      {/* Section 3: Analysis Results */}
      <div id="analysis-results-section">
        {analysisError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {analysis && (
          <AnalysisResults
            analysis={analysis}
            onSelectTargetRole={(roleId) => handleAnalyzeSkills(null, roleId)}
            onTaskToggle={handleTaskToggle}
          />
        )}
      </div>

      {/* Modals */}
      <ProficiencyModal
        isOpen={Boolean(activeProficiencySkill)}
        skill={activeProficiencySkill}
        onClose={() => setActiveProficiencySkill(null)}
        onSave={handleSaveProficiency}
      />

      <SkillAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onAssessmentCompleted={handleAssessmentCompleted}
      />

      <AdminSkillManagement
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          fetchCatalogue();
        }}
      />
    </div>
  );
}
