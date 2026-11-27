import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Search,
  ChevronDown,
  Check,
  X,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Settings,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Compass,
  SlidersHorizontal,
  Plus,
  Award,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';
import { ProficiencyModal } from '../components/skill-analyzer/ProficiencyModal';
import { SkillAssessmentModal } from '../components/skill-analyzer/SkillAssessmentModal';
import { AnalysisResults } from '../components/skill-analyzer/AnalysisResults';
import { AdminSkillManagement } from '../components/skill-analyzer/AdminSkillManagement';
import { SKILL_CATALOGUE } from '../data/skillsCatalogueData';

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
];

const PROFICIENCY_COLORS = {
  BEGINNER: 'bg-neutral-400',
  INTERMEDIATE: 'bg-[#E5A13B]',
  ADVANCED: 'bg-[#8B2942]',
  EXPERT: 'bg-[#26966B]',
};

// Lightweight offline fallback if taxonomy endpoint is unreachable
const FALLBACK_TAXONOMY = {
  domains: [
    {
      id: 'backend-api-development',
      name: 'Backend & API Development',
      group: 'Software Engineering',
      roles: [
        {
          id: 'backend-developer',
          title: 'Backend Developer',
          required: ['java', 'python', 'node-js', 'express-js', 'rest-apis', 'sql', 'mongodb', 'postgresql', 'redis', 'docker', 'git'],
          related: ['graphql', 'microservices', 'ci-cd'],
        },
      ],
    },
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      group: 'Software Engineering',
      roles: [
        {
          id: 'frontend-developer',
          title: 'Frontend Developer',
          required: ['html5', 'css3', 'javascript', 'typescript', 'react', 'tailwind-css', 'git', 'rest-apis'],
          related: ['next-js', 'redux', 'jest'],
        },
      ],
    },
    {
      id: 'full-stack-development',
      name: 'Full Stack Development',
      group: 'Software Engineering',
      roles: [
        {
          id: 'full-stack-developer',
          title: 'Full Stack Developer',
          required: ['javascript', 'typescript', 'react', 'node-js', 'express-js', 'sql', 'mongodb', 'rest-apis', 'git', 'docker'],
          related: ['next-js', 'postgresql', 'aws'],
        },
      ],
    },
  ],
  skills: SKILL_CATALOGUE.map((s) => ({ ...s, aliases: [] })),
  groups: ['Software Engineering'],
  stats: { totalDomains: 3, totalRoles: 3, totalSkills: SKILL_CATALOGUE.length },
};

export function SkillAnalyzer() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetedRoleParam = searchParams.get('role') || searchParams.get('targetRole');

  const isAdminOrTpo =
    user?.roleName === 'SUPER_ADMIN' ||
    user?.roleName === 'ADMIN' ||
    user?.roleName === 'TPO_OFFICER';

  // 1. Dynamic 3-level taxonomy state
  const [taxonomy, setTaxonomy] = useState(FALLBACK_TAXONOMY);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // 2. Guided 3-level navigation state
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [browseEntireDomain, setBrowseEntireDomain] = useState(false);

  // Domain dropdown selector state
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('ALL');
  const domainDropdownRef = useRef(null);

  // Global search & local skill search
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [skillFilterQuery, setSkillFilterQuery] = useState('');
  const globalSearchRef = useRef(null);

  // 3. Student Selected Skills State
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loadingStudentSkills, setLoadingStudentSkills] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'SAVED' | 'SAVING' | 'UNSAVED' | 'ERROR'

  // 4. Modals & Analysis State
  const [activeProficiencySkill, setActiveProficiencySkill] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(e.target)) {
        setDomainMenuOpen(false);
      }
      if (globalSearchRef.current && !globalSearchRef.current.contains(e.target)) {
        setGlobalSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Fetch taxonomy from backend
  const fetchTaxonomy = useCallback(async () => {
    setLoadingTaxonomy(true);
    try {
      const res = await apiClient.get('/skill-analyzer/taxonomy');
      if (res.data?.success && res.data.data?.domains?.length > 0) {
        const data = res.data.data;
        setTaxonomy(data);

        // Pre-select targeted role from URL if provided, else default to Backend or first domain
        let matchedDomain = null;
        let matchedRole = null;
        if (targetedRoleParam) {
          const norm = targetedRoleParam.toLowerCase();
          for (const d of data.domains) {
            const r = (d.roles || []).find(
              (role) => role.id === norm || role.title.toLowerCase().includes(norm)
            );
            if (r) {
              matchedDomain = d;
              matchedRole = r;
              break;
            }
          }
        }
        const initialDomain =
          matchedDomain ||
          data.domains.find((d) => d.id === 'backend-api-development') ||
          data.domains[0];
        setSelectedDomainId(initialDomain?.id || '');
        setSelectedRoleId(matchedRole?.id || initialDomain?.roles?.[0]?.id || '');
      }
    } catch (err) {
      console.warn('Taxonomy fetch failed, using fallback:', err.message);
      setSelectedDomainId(FALLBACK_TAXONOMY.domains[0].id);
      setSelectedRoleId(FALLBACK_TAXONOMY.domains[0].roles[0].id);
    } finally {
      setLoadingTaxonomy(false);
    }
  }, [targetedRoleParam]);

  // Fetch student's saved skills
  const fetchStudentSkills = useCallback(async () => {
    setLoadingStudentSkills(true);
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
    fetchTaxonomy();
    fetchStudentSkills();
  }, [fetchTaxonomy, fetchStudentSkills]);

  // Fast lookup maps
  const skillsById = useMemo(() => {
    const map = new Map();
    for (const s of taxonomy.skills || []) {
      map.set(s.id, s);
    }
    return map;
  }, [taxonomy.skills]);

  const selectedSkillMap = useMemo(() => {
    const map = new Map();
    for (const s of selectedSkills) {
      map.set(s.skillId, s);
    }
    return map;
  }, [selectedSkills]);

  // Active domain & active role objects
  const activeDomain = useMemo(() => {
    return (taxonomy.domains || []).find((d) => d.id === selectedDomainId) || taxonomy.domains?.[0] || null;
  }, [taxonomy.domains, selectedDomainId]);

  const activeRole = useMemo(() => {
    if (!activeDomain || browseEntireDomain) return null;
    return (activeDomain.roles || []).find((r) => r.id === selectedRoleId) || activeDomain.roles?.[0] || null;
  }, [activeDomain, selectedRoleId, browseEntireDomain]);

  // Helper to resolve a skill ID into a normalized skill object
  const resolveSkill = useCallback(
    (skillId) => {
      const found = skillsById.get(skillId);
      if (found) return found;
      return {
        id: skillId,
        name: skillId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        category: 'Technical Skills',
        aliases: [],
      };
    },
    [skillsById]
  );

  // Domain dropdown filtered list
  const filteredDomains = useMemo(() => {
    const q = domainSearch.trim().toLowerCase();
    return (taxonomy.domains || []).filter((d) => {
      if (activeGroupFilter !== 'ALL' && d.group !== activeGroupFilter) return false;
      if (!q) return true;
      if (d.name.toLowerCase().includes(q) || d.group.toLowerCase().includes(q)) return true;
      return (d.roles || []).some((r) => r.title.toLowerCase().includes(q));
    });
  }, [taxonomy.domains, domainSearch, activeGroupFilter]);

  // Skills for Step 3 (either selected role's required + related, or entire domain's unique skills)
  const { primarySkills, relatedSkills } = useMemo(() => {
    if (!activeDomain) return { primarySkills: [], relatedSkills: [] };

    let reqIds = [];
    let relIds = [];

    if (browseEntireDomain || !activeRole) {
      const reqSet = new Set();
      const relSet = new Set();
      for (const role of activeDomain.roles || []) {
        (role.required || []).forEach((id) => reqSet.add(id));
        (role.related || []).forEach((id) => {
          if (!reqSet.has(id)) relSet.add(id);
        });
      }
      reqIds = Array.from(reqSet);
      relIds = Array.from(relSet);
    } else {
      reqIds = Array.from(new Set(activeRole.required || []));
      const reqSet = new Set(reqIds);
      relIds = Array.from(new Set((activeRole.related || []).filter((id) => !reqSet.has(id))));
    }

    const q = skillFilterQuery.trim().toLowerCase();
    const matchesFilter = (skill) => {
      if (!q) return true;
      if (skill.name.toLowerCase().includes(q)) return true;
      if ((skill.category || '').toLowerCase().includes(q)) return true;
      return (skill.aliases || []).some((a) => a.toLowerCase().includes(q));
    };

    return {
      primarySkills: reqIds.map(resolveSkill).filter(matchesFilter),
      relatedSkills: relIds.map(resolveSkill).filter(matchesFilter),
    };
  }, [activeDomain, activeRole, browseEntireDomain, resolveSkill, skillFilterQuery]);

  // Role/Domain coverage stats for Step 3
  const step3Coverage = useMemo(() => {
    const allIds = primarySkills.map((s) => s.id);
    const matched = allIds.filter((id) => selectedSkillMap.has(id)).length;
    const total = allIds.length;
    const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
    return { matched, total, pct };
  }, [primarySkills, selectedSkillMap]);

  // Global search results across domains, roles, and skills (with aliases)
  const globalSearchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (q.length < 2) return { domains: [], roles: [], skills: [] };

    const domains = (taxonomy.domains || [])
      .filter((d) => d.name.toLowerCase().includes(q) || d.group.toLowerCase().includes(q))
      .slice(0, 5);

    const roles = [];
    for (const d of taxonomy.domains || []) {
      for (const r of d.roles || []) {
        if (r.title.toLowerCase().includes(q)) {
          roles.push({ ...r, domainId: d.id, domainName: d.name });
        }
        if (roles.length >= 6) break;
      }
      if (roles.length >= 6) break;
    }

    const skills = (taxonomy.skills || [])
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.aliases || []).some((a) => a.toLowerCase().includes(q))
      )
      .slice(0, 8);

    return { domains, roles, skills };
  }, [globalSearch, taxonomy]);

  // Summary metrics across all 62 domains
  const summaryStats = useMemo(() => {
    const domainsTouched = new Set();
    const rolesTouched = new Set();

    if (selectedSkillMap.size > 0) {
      for (const d of taxonomy.domains || []) {
        for (const r of d.roles || []) {
          const allRoleSkills = [...(r.required || []), ...(r.related || [])];
          const matchedCount = allRoleSkills.filter((id) => selectedSkillMap.has(id)).length;
          if (matchedCount >= 2 || (allRoleSkills.length > 0 && matchedCount === allRoleSkills.length)) {
            domainsTouched.add(d.id);
            rolesTouched.add(r.id);
          }
        }
      }
    }

    const proficiencyCounts = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 };
    for (const s of selectedSkills) {
      const lvl = s.proficiencyLevel || 'INTERMEDIATE';
      if (proficiencyCounts[lvl] !== undefined) proficiencyCounts[lvl] += 1;
    }

    return {
      totalSelected: selectedSkills.length,
      domainsCount: domainsTouched.size,
      rolesCount: rolesTouched.size,
      proficiencyCounts,
    };
  }, [selectedSkills, selectedSkillMap, taxonomy.domains]);

  // Persist skills to backend
  const persistSkillsToBackend = async (updatedSkills) => {
    setSavingSkills(true);
    setSyncStatus('SAVING');
    try {
      const res = await apiClient.put('/student/skills', { skills: updatedSkills });
      if (res.data?.success) {
        if (Array.isArray(res.data.data)) {
          setSelectedSkills(res.data.data);
        }
        setSyncStatus('SAVED');
      }
    } catch (err) {
      console.warn('Failed to save skills:', err.message);
      setSyncStatus('ERROR');
    } finally {
      setSavingSkills(false);
    }
  };

  // Toggle single skill
  const handleToggleSkill = (skill) => {
    const exists = selectedSkillMap.has(skill.id);
    let updated;
    if (exists) {
      updated = selectedSkills.filter((s) => s.skillId !== skill.id);
    } else {
      updated = [
        ...selectedSkills,
        {
          skillId: skill.id,
          name: skill.name,
          category: skill.category || 'Technical Skills',
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

  // Inline proficiency change
  const handleInlineProficiencyChange = (skillId, proficiencyLevel) => {
    const updated = selectedSkills.map((s) =>
      s.skillId === skillId ? { ...s, proficiencyLevel } : s
    );
    setSelectedSkills(updated);
    persistSkillsToBackend(updated);
  };

  // Select all visible primary skills
  const handleSelectAllVisible = () => {
    const toAdd = primarySkills
      .filter((s) => !selectedSkillMap.has(s.id))
      .map((s) => ({
        skillId: s.id,
        name: s.name,
        category: s.category || 'Technical Skills',
        proficiencyLevel: 'INTERMEDIATE',
        evidenceType: 'NONE',
        evidenceUrl: '',
        isVerified: false,
      }));
    if (toAdd.length === 0) return;
    const updated = [...selectedSkills, ...toAdd];
    setSelectedSkills(updated);
    persistSkillsToBackend(updated);
  };

  // Clear visible primary skills
  const handleClearVisible = () => {
    const visibleIds = new Set(primarySkills.map((s) => s.id));
    const updated = selectedSkills.filter((s) => !visibleIds.has(s.skillId));
    if (updated.length === selectedSkills.length) return;
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
  const handleSaveProficiencyModal = (updatedSkill) => {
    const updated = selectedSkills.map((s) =>
      s.skillId === updatedSkill.skillId ? updatedSkill : s
    );
    setSelectedSkills(updated);
    persistSkillsToBackend(updated);
  };

  // Select domain from dropdown
  const handleSelectDomain = (domain) => {
    setSelectedDomainId(domain.id);
    setSelectedRoleId(domain.roles?.[0]?.id || '');
    setBrowseEntireDomain(false);
    setSkillFilterQuery('');
    setDomainMenuOpen(false);
    setDomainSearch('');
  };

  // Run Career Fit Analysis
  const handleAnalyzeSkills = async (customSkills = null, overrideRoleId = null) => {
    const skillsToAnalyze = customSkills || selectedSkills;
    if (skillsToAnalyze.length === 0) return;

    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await apiClient.post('/skill-analyzer/analyze', {
        selectedSkills: skillsToAnalyze,
        targetRoleId: overrideRoleId || null,
      });
      if (res.data?.success) {
        setAnalysis(res.data);
        setTimeout(() => {
          document.getElementById('analysis-results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Unable to complete career fit analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Roadmap task checkbox handler
  const handleTaskToggle = async (roleId, taskId, isCompleted) => {
    try {
      await apiClient.patch('/skill-analyzer/roadmap/progress', { roleId, taskId, isCompleted });
      setAnalysis((prev) => {
        if (!prev?.roadmap) return prev;
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
      console.warn('Failed to update roadmap task:', err);
    }
  };

  const hasGlobalResults =
    globalSearchResults.domains.length > 0 ||
    globalSearchResults.roles.length > 0 ||
    globalSearchResults.skills.length > 0;

  return (
    <div id="skill-selector-top" className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. CLEAN PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#EAE6E8] dark:border-[#2C272D]">
        <div>
          <h1 className="text-2xl font-bold text-[#29252A] dark:text-white tracking-tight">
            Skill Analyzer
          </h1>
          <p className="text-sm text-[#858087] dark:text-neutral-400 mt-1">
            Discover your strengths and build your technical skill profile.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[#858087] dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#29252A] dark:text-neutral-200">
              <Compass className="w-3.5 h-3.5 text-[#8B2942]" />
              {taxonomy.stats?.totalDomains || 62} IT Domains
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#29252A] dark:text-neutral-200">
              <Briefcase className="w-3.5 h-3.5 text-[#8B2942]" />
              {taxonomy.stats?.totalRoles || 90}+ Job Roles
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#29252A] dark:text-neutral-200">
              <Layers className="w-3.5 h-3.5 text-[#8B2942]" />
              {taxonomy.stats?.totalSkills || 125}+ Skills
            </span>
            {syncStatus === 'SAVING' && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 text-[#8B2942] font-medium">
                  <span className="w-2.5 h-2.5 border-2 border-[#8B2942] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              </>
            )}
            {syncStatus === 'SAVED' && !savingSkills && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-[#26966B] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced with profile
                </span>
              </>
            )}
          </div>
        </div>

        {/* Clean Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/github-scanner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#EAE6E8] dark:border-[#2C272D] bg-white dark:bg-[#1C181C] text-[#29252A] dark:text-neutral-200 hover:border-[#8B2942]/40 hover:text-[#8B2942] transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Scanner</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsAssessmentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#EAE6E8] dark:border-[#2C272D] bg-white dark:bg-[#1C181C] text-[#29252A] dark:text-neutral-200 hover:border-[#8B2942]/40 hover:text-[#8B2942] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B2942]" />
            <span>Skill Quiz</span>
          </button>

          {isAdminOrTpo && (
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#EAE6E8] dark:border-[#2C272D] bg-white dark:bg-[#1C181C] text-[#29252A] dark:text-neutral-200 hover:bg-[#F7F6F7] dark:hover:bg-[#242024] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#858087]" />
              <span>Manage Catalogue</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. GLOBAL SMART SEARCH (Domains, Roles, Skills & Aliases) */}
      <div ref={globalSearchRef} className="relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#858087] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onFocus={() => setGlobalSearchOpen(true)}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setGlobalSearchOpen(true);
            }}
            placeholder="Quick search any IT domain, job role, or skill (e.g., Backend, DevOps, Python, k8s, RAG, Salesforce)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] text-sm text-[#29252A] dark:text-white placeholder:text-[#858087] focus:outline-none focus:border-[#8B2942] focus:ring-2 focus:ring-[#8B2942]/15 transition-all"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => {
                setGlobalSearch('');
                setGlobalSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858087] hover:text-[#29252A] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Search Popover */}
        {globalSearchOpen && globalSearch.trim().length >= 2 && (
          <div className="absolute z-40 mt-1.5 w-full rounded-xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] shadow-xl overflow-hidden max-h-[420px] overflow-y-auto">
            {!hasGlobalResults ? (
              <div className="p-6 text-center text-sm text-[#858087]">
                No matching domains, roles, or skills found for &ldquo;{globalSearch}&rdquo;.
              </div>
            ) : (
              <div className="divide-y divide-[#EAE6E8] dark:divide-[#2C272D]">
                {globalSearchResults.domains.length > 0 && (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858087] px-2 mb-1.5">
                      IT Domains
                    </div>
                    <div className="space-y-0.5">
                      {globalSearchResults.domains.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            handleSelectDomain(d);
                            setGlobalSearch('');
                            setGlobalSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm hover:bg-[#F8EDF0] dark:hover:bg-[#8B2942]/15 transition-colors cursor-pointer"
                        >
                          <span className="font-medium text-[#29252A] dark:text-white">{d.name}</span>
                          <span className="text-xs text-[#858087]">
                            {d.roles?.length || 0} roles · {d.group}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {globalSearchResults.roles.length > 0 && (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858087] px-2 mb-1.5">
                      Job Roles
                    </div>
                    <div className="space-y-0.5">
                      {globalSearchResults.roles.map((r) => (
                        <button
                          key={`${r.domainId}-${r.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedDomainId(r.domainId);
                            setSelectedRoleId(r.id);
                            setBrowseEntireDomain(false);
                            setGlobalSearch('');
                            setGlobalSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm hover:bg-[#F8EDF0] dark:hover:bg-[#8B2942]/15 transition-colors cursor-pointer"
                        >
                          <span className="font-medium text-[#29252A] dark:text-white">{r.title}</span>
                          <span className="text-xs text-[#858087]">{r.domainName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {globalSearchResults.skills.length > 0 && (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858087] px-2 mb-1.5">
                      Skills (Click to Add / Remove)
                    </div>
                    <div className="space-y-0.5">
                      {globalSearchResults.skills.map((skill) => {
                        const isSelected = selectedSkillMap.has(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm hover:bg-[#F7F6F7] dark:hover:bg-[#242024] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-[#8B2942] border-[#8B2942] text-white'
                                    : 'border-[#EAE6E8] dark:border-[#3A343B]'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </span>
                              <span className="font-medium text-[#29252A] dark:text-white">
                                {skill.name}
                              </span>
                              <span className="text-xs text-[#858087]">{skill.category}</span>
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                isSelected ? 'text-[#26966B]' : 'text-[#8B2942]'
                              }`}
                            >
                              {isSelected ? 'Selected' : '+ Add'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. MAIN 2-COLUMN WORKSPACE: LEFT 3-LEVEL GUIDED SELECTOR | RIGHT SUMMARY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 cols): 3-LEVEL GUIDED STRUCTURE */}
        <div className="lg:col-span-8 space-y-5">
          {/* LEVEL 1: SELECT IT DOMAIN */}
          <section className="rounded-2xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F8EDF0] dark:bg-[#8B2942]/20 text-[#8B2942] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#29252A] dark:text-white">
                    Select IT Domain
                  </h2>
                  <p className="text-xs text-[#858087] dark:text-neutral-400">
                    Choose from {taxonomy.domains?.length || 62} specialized IT &amp; engineering domains
                  </p>
                </div>
              </div>

              {activeDomain && (
                <button
                  type="button"
                  onClick={() => setBrowseEntireDomain((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    browseEntireDomain
                      ? 'bg-[#8B2942] text-white border-[#8B2942]'
                      : 'bg-[#F7F6F7] dark:bg-[#242024] text-[#29252A] dark:text-neutral-200 border-[#EAE6E8] dark:border-[#352F36] hover:border-[#8B2942]/50'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>{browseEntireDomain ? 'Viewing All Domain Skills' : 'Browse All Domain Skills'}</span>
                </button>
              )}
            </div>

            {/* Searchable Domain Dropdown */}
            <div ref={domainDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDomainMenuOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] hover:border-[#8B2942]/50 transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[#858087] dark:text-neutral-400">
                    {activeDomain?.group || 'IT Domain'}
                  </div>
                  <div className="text-sm font-semibold text-[#29252A] dark:text-white truncate">
                    {loadingTaxonomy ? 'Loading IT domains...' : activeDomain?.name || 'Select a domain'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {activeDomain && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#242024] border border-[#EAE6E8] dark:border-[#352F36] text-[#858087]">
                      {activeDomain.roles?.length || 0} {activeDomain.roles?.length === 1 ? 'role' : 'roles'}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-[#858087] transition-transform ${domainMenuOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {domainMenuOpen && (
                <div className="absolute z-30 mt-2 w-full rounded-xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] shadow-xl overflow-hidden">
                  {/* Search inside dropdown */}
                  <div className="p-3 border-b border-[#EAE6E8] dark:border-[#2C272D] space-y-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#858087] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={domainSearch}
                        onChange={(e) => setDomainSearch(e.target.value)}
                        placeholder="Filter 62 IT domains or roles..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] text-xs text-[#29252A] dark:text-white focus:outline-none focus:border-[#8B2942]"
                      />
                    </div>

                    {/* Domain group filter chips (compact, single wrap) */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveGroupFilter('ALL')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          activeGroupFilter === 'ALL'
                            ? 'bg-[#8B2942] text-white'
                            : 'bg-[#F7F6F7] dark:bg-[#242024] text-[#858087] hover:text-[#29252A] dark:hover:text-white'
                        }`}
                      >
                        All ({taxonomy.domains?.length || 0})
                      </button>
                      {(taxonomy.groups || []).map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setActiveGroupFilter(grp)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            activeGroupFilter === grp
                              ? 'bg-[#8B2942] text-white'
                              : 'bg-[#F7F6F7] dark:bg-[#242024] text-[#858087] hover:text-[#29252A] dark:hover:text-white'
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Domain List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EAE6E8]/60 dark:divide-[#2C272D]/60">
                    {filteredDomains.length === 0 ? (
                      <div className="p-5 text-center text-xs text-[#858087]">
                        No domains match &ldquo;{domainSearch}&rdquo;.
                      </div>
                    ) : (
                      filteredDomains.map((domain) => {
                        const isActive = domain.id === activeDomain?.id;
                        return (
                          <button
                            key={domain.id}
                            type="button"
                            onClick={() => handleSelectDomain(domain)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-[#F8EDF0] dark:bg-[#8B2942]/20 text-[#8B2942]'
                                : 'hover:bg-[#F7F6F7] dark:hover:bg-[#242024] text-[#29252A] dark:text-neutral-200'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium">{domain.name}</div>
                              <div className="text-[11px] text-[#858087] dark:text-neutral-400">
                                {domain.group}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-[#858087]">
                                {domain.roles?.length || 0} roles
                              </span>
                              {isActive && <Check className="w-4 h-4 text-[#8B2942]" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* LEVEL 2: SELECT JOB ROLE */}
          {activeDomain && !browseEntireDomain && (
            <section className="rounded-2xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] p-5">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#F8EDF0] dark:bg-[#8B2942]/20 text-[#8B2942] text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#29252A] dark:text-white">
                      Select Job Role
                    </h2>
                    <p className="text-xs text-[#858087] dark:text-neutral-400">
                      Roles under {activeDomain.name}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#858087]">
                  {activeDomain.roles?.length || 0} available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(activeDomain.roles || []).map((role) => {
                  const isActive = role.id === activeRole?.id;
                  const reqCount = (role.required || []).length;
                  const matchedCount = (role.required || []).filter((id) => selectedSkillMap.has(id)).length;
                  const pct = reqCount > 0 ? Math.round((matchedCount / reqCount) * 100) : 0;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setSkillFilterQuery('');
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#F8EDF0]/70 dark:bg-[#8B2942]/15 border-[#8B2942] shadow-2xs'
                          : 'bg-[#F7F6F7]/60 dark:bg-[#141114] border-[#EAE6E8] dark:border-[#2C272D] hover:border-[#8B2942]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm text-[#29252A] dark:text-white leading-snug">
                          {role.title}
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            pct >= 70
                              ? 'bg-[#26966B]/15 text-[#26966B]'
                              : pct > 0
                              ? 'bg-[#F8EDF0] dark:bg-[#8B2942]/25 text-[#8B2942]'
                              : 'bg-white dark:bg-[#242024] text-[#858087]'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#858087] dark:text-neutral-400">
                        <span>
                          {matchedCount} of {reqCount} core skills selected
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#EAE6E8] dark:bg-[#2C272D] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct >= 70 ? 'bg-[#26966B]' : 'bg-[#8B2942]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* LEVEL 3: SELECT SKILLS & TECHNOLOGIES (Structured Checkbox List) */}
          <section className="rounded-2xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] p-5">
            {/* Step 3 Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6E8] dark:border-[#2C272D]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#F8EDF0] dark:bg-[#8B2942]/20 text-[#8B2942] text-xs font-bold flex items-center justify-center">
                  {browseEntireDomain ? '2' : '3'}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#29252A] dark:text-white">
                    {browseEntireDomain
                      ? `Skills in ${activeDomain?.name || 'Domain'}`
                      : `Skills for ${activeRole?.title || 'Selected Role'}`}
                  </h2>
                  <p className="text-xs text-[#858087] dark:text-neutral-400">
                    Check the technologies you know and set your proficiency level
                  </p>
                </div>
              </div>

              {/* Coverage Pill */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#29252A] dark:text-white">
                    {step3Coverage.matched} / {step3Coverage.total} Core Skills ({step3Coverage.pct}%)
                  </div>
                  <div className="w-32 h-1.5 rounded-full bg-[#EAE6E8] dark:bg-[#2C272D] overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        step3Coverage.pct >= 70 ? 'bg-[#26966B]' : 'bg-[#8B2942]'
                      }`}
                      style={{ width: `${step3Coverage.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar: Local Skill Filter + Select All / Clear */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 my-4">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#858087] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={skillFilterQuery}
                  onChange={(e) => setSkillFilterQuery(e.target.value)}
                  placeholder="Filter skills in this list (e.g., SQL, Docker, React)..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] text-xs text-[#29252A] dark:text-white focus:outline-none focus:border-[#8B2942]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F8EDF0] dark:bg-[#8B2942]/20 text-[#8B2942] hover:bg-[#8B2942] hover:text-white transition-colors cursor-pointer"
                >
                  Select All Visible
                </button>
                <button
                  type="button"
                  onClick={handleClearVisible}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F6F7] dark:bg-[#242024] text-[#858087] hover:text-[#29252A] dark:hover:text-white border border-[#EAE6E8] dark:border-[#352F36] transition-colors cursor-pointer"
                >
                  Clear Visible
                </button>
              </div>
            </div>

            {/* Structured Checkbox List */}
            {primarySkills.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#858087]">
                No skills match your filter. Clear the filter to see all role skills.
              </div>
            ) : (
              <div className="divide-y divide-[#EAE6E8] dark:divide-[#2C272D] border border-[#EAE6E8] dark:border-[#2C272D] rounded-xl overflow-hidden">
                {primarySkills.map((skill) => {
                  const selectedRecord = selectedSkillMap.get(skill.id);
                  const isChecked = Boolean(selectedRecord);

                  return (
                    <div
                      key={skill.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 transition-colors ${
                        isChecked
                          ? 'bg-[#F8EDF0]/45 dark:bg-[#8B2942]/10'
                          : 'bg-white dark:bg-[#1C181C] hover:bg-[#F7F6F7]/70 dark:hover:bg-[#242024]/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <span
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#8B2942] border-[#8B2942] text-white'
                              : 'border-[#CFC9CC] dark:border-[#423B43] bg-white dark:bg-[#141114]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#29252A] dark:text-white truncate">
                              {skill.name}
                            </span>
                            {selectedRecord?.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#26966B]/15 text-[#26966B]">
                                <Award className="w-2.5 h-2.5" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#858087] dark:text-neutral-400">
                            {skill.category}
                          </div>
                        </div>
                      </button>

                      {/* Inline Proficiency Selector when selected */}
                      {isChecked ? (
                        <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                          <select
                            value={selectedRecord.proficiencyLevel || 'INTERMEDIATE'}
                            onChange={(e) => handleInlineProficiencyChange(skill.id, e.target.value)}
                            aria-label={`${skill.name} proficiency`}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#352F36] text-[#29252A] dark:text-white focus:outline-none focus:border-[#8B2942] cursor-pointer"
                          >
                            {PROFICIENCY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setActiveProficiencySkill(selectedRecord)}
                            title="Add project / certificate evidence"
                            className="p-1.5 rounded-lg text-[#858087] hover:text-[#8B2942] hover:bg-[#F8EDF0] dark:hover:bg-[#8B2942]/20 transition-colors cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#858087] hover:text-[#8B2942] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommended / Complementary Skills */}
            {relatedSkills.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#EAE6E8] dark:border-[#2C272D]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-[#29252A] dark:text-neutral-200">
                    Recommended Complementary Skills
                  </span>
                  <span className="text-[11px] text-[#858087]">Optional bonus technologies</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedSkills.map((skill) => {
                    const isChecked = selectedSkillMap.has(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#F8EDF0]/70 dark:bg-[#8B2942]/15 border-[#8B2942] text-[#8B2942] font-semibold'
                            : 'bg-[#F7F6F7]/70 dark:bg-[#141114] border-[#EAE6E8] dark:border-[#2C272D] text-[#29252A] dark:text-neutral-200 hover:border-[#8B2942]/40'
                        }`}
                      >
                        <span className="truncate">{skill.name}</span>
                        {isChecked ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-[#858087] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN (4 cols): COMPACT SELECTED SKILLS SUMMARY PANEL */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#1C181C] border border-[#EAE6E8] dark:border-[#2C272D] p-5 space-y-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#29252A] dark:text-white">
                  Selected Skills Summary
                </h2>
                <p className="text-xs text-[#858087] dark:text-neutral-400">
                  Your saved technical skill profile
                </p>
              </div>
              {selectedSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#858087] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear all selected skills"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* 3 Compact Summary Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] p-2.5 text-center">
                <div className="text-lg font-bold text-[#8B2942]">
                  {summaryStats.totalSelected}
                </div>
                <div className="text-[11px] text-[#858087]">Skills</div>
              </div>
              <div className="rounded-xl bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] p-2.5 text-center">
                <div className="text-lg font-bold text-[#29252A] dark:text-white">
                  {summaryStats.domainsCount}
                </div>
                <div className="text-[11px] text-[#858087]">Domains</div>
              </div>
              <div className="rounded-xl bg-[#F7F6F7] dark:bg-[#141114] border border-[#EAE6E8] dark:border-[#2C272D] p-2.5 text-center">
                <div className="text-lg font-bold text-[#29252A] dark:text-white">
                  {summaryStats.rolesCount}
                </div>
                <div className="text-[11px] text-[#858087]">Roles</div>
              </div>
            </div>

            {/* Proficiency Distribution Bar */}
            {selectedSkills.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#858087]">
                  <span>Proficiency Mix</span>
                  <span>
                    {summaryStats.proficiencyCounts.ADVANCED + summaryStats.proficiencyCounts.EXPERT} Advanced+
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EAE6E8] dark:bg-[#2C272D] overflow-hidden flex">
                  {PROFICIENCY_OPTIONS.map((opt) => {
                    const count = summaryStats.proficiencyCounts[opt.value] || 0;
                    if (!count) return null;
                    const widthPct = (count / selectedSkills.length) * 100;
                    return (
                      <div
                        key={opt.value}
                        className={PROFICIENCY_COLORS[opt.value]}
                        style={{ width: `${widthPct}%` }}
                        title={`${opt.label}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Skills List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-[#EAE6E8]/70 dark:divide-[#2C272D] border border-[#EAE6E8] dark:border-[#2C272D] rounded-xl">
              {loadingStudentSkills ? (
                <div className="p-6 text-center text-xs text-[#858087]">
                  Loading your saved skills...
                </div>
              ) : selectedSkills.length === 0 ? (
                <div className="p-6 text-center space-y-1">
                  <div className="text-xs font-semibold text-[#29252A] dark:text-neutral-200">
                    No skills selected yet
                  </div>
                  <p className="text-[11px] text-[#858087]">
                    Choose a domain and role on the left, then check the skills you know.
                  </p>
                </div>
              ) : (
                selectedSkills.map((skill) => (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-[#1C181C]"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#29252A] dark:text-white truncate">
                        {skill.name}
                      </div>
                      <div className="text-[10px] text-[#858087] capitalize">
                        {(skill.proficiencyLevel || 'INTERMEDIATE').toLowerCase()}
                        {skill.isVerified ? ' · Verified' : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSkill({ id: skill.skillId })}
                      className="p-1 rounded-md text-[#858087] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleAnalyzeSkills()}
                disabled={analyzing || selectedSkills.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzing ? 'Analyzing Career Fit...' : 'Analyze Career Fit'}</span>
                {!analyzing && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => persistSkillsToBackend(selectedSkills)}
                disabled={savingSkills || selectedSkills.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[#EAE6E8] dark:border-[#2C272D] bg-[#F7F6F7] dark:bg-[#141114] text-[#29252A] dark:text-neutral-200 hover:border-[#8B2942]/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#8B2942]" />
                <span>{savingSkills ? 'Saving...' : 'Save My Skills'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Analysis Error Alert */}
      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* 4. ANALYSIS RESULTS & PERSONALIZED ROADMAP */}
      {analysis && (
        <div id="analysis-results-section" className="pt-6 border-t border-[#EAE6E8] dark:border-[#2C272D]">
          <AnalysisResults
            analysis={analysis}
            onSelectTargetRole={(roleId) => handleAnalyzeSkills(selectedSkills, roleId)}
            onTaskToggle={handleTaskToggle}
            onStartQuiz={() => setIsAssessmentModalOpen(true)}
            onAddSkills={() => {
              document.getElementById('skill-selector-top')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* 5. PRESERVED MODALS */}
      {activeProficiencySkill && (
        <ProficiencyModal
          skill={activeProficiencySkill}
          onClose={() => setActiveProficiencySkill(null)}
          onSave={handleSaveProficiencyModal}
        />
      )}

      {isAssessmentModalOpen && (
        <SkillAssessmentModal
          onClose={() => setIsAssessmentModalOpen(false)}
          onCompleted={() => {
            fetchStudentSkills();
            if (analysis) handleAnalyzeSkills();
          }}
        />
      )}

      {isAdminModalOpen && isAdminOrTpo && (
        <AdminSkillManagement
          onClose={() => setIsAdminModalOpen(false)}
          onUpdated={() => {
            fetchTaxonomy();
            fetchStudentSkills();
          }}
        />
      )}
    </div>
  );
}

export default SkillAnalyzer;
