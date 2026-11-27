import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import {
  Code2,
  Play,
  CheckCircle2,
  Clock,
  Terminal,
  Trophy,
  BookOpen,
  ShieldCheck,
  Layers,
  Settings2,
  ArrowLeft,
  Check,
  Calendar,
  Share2,
  Copy,
  ExternalLink,
  Lock,
  X,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
} from 'lucide-react';

// Preserved LMS Components & Modules
import ExamRules from './LMS/ExamRules';
import ExamScreen from './LMS/ExamScreen';
import AdminDashboard from './LMS/admin/AdminDashboard';
import DesktopLockStandby from '../components/LMS/DesktopLockStandby';

const DEFAULT_TEMPLATES = {
  python: `# Python 3 Solution
def solve(target, arr):
    lookup = {}
    for i, num in enumerate(arr):
        diff = target - num
        if diff in lookup:
            return f"Pair indices: {lookup[diff]}, {i}"
        lookup[num] = i
    return "No pair found"

if __name__ == '__main__':
    print(solve(9, [2, 7, 11, 15]))
`,
  javascript: `// JavaScript (Node.js) Solution
function solve(target, nums) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return \`Pair indices: \${map.get(diff)}, \${i}\`;
    map.set(nums[i], i);
  }
  return "No pair found";
}

console.log(solve(9, [2, 7, 11, 15]));
`,
  java: `// Java Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        int target = 9;
        int[] nums = {2, 7, 11, 15};
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                System.out.println("Pair indices: " + map.get(diff) + ", " + i);
                return;
            }
            map.put(nums[i], i);
        }
        System.out.println("No pair found");
    }
}
`,
  c: `// C Solution
#include <stdio.h>

int main() {
    printf("CampusCorpo Compiler Ready.\\n");
    return 0;
}
`,
  cpp: `// C++ Solution
#include <iostream>

int main() {
    std::cout << "CampusCorpo Compiler Ready." << std::endl;
    return 0;
}
`,
};

export function Assessment() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Primary view state: 'hub' | 'rules' | 'exam' | 'exe_running' | 'admin'
  const [viewMode, setViewMode] = useState('hub');
  const [activeTest, setActiveTest] = useState(null);

  // Assessments & Attempts from Backend
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'QUIZ' | 'CODESPRINT' | 'COMPLETED' | 'UPCOMING'

  const [myAttempts, setMyAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Compiler Expandable Workspace State
  const [compilerOpen, setCompilerOpen] = useState(false);
  const [sandboxLang, setSandboxLang] = useState('python');
  const [sandboxCode, setSandboxCode] = useState(DEFAULT_TEMPLATES.python);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [sandboxRunning, setSandboxRunning] = useState(false);

  // Compact SecureLock State
  const [exeLockRunning, setExeLockRunning] = useState(false);
  const [checkingExe, setCheckingExe] = useState(false);
  const [secureLockExpanded, setSecureLockExpanded] = useState(false);
  const [simulatedExe, setSimulatedExe] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('campuscorp_simulated_exe_lock') === 'true';
  });

  // Share Test Link Modal State
  const [shareModalTest, setShareModalTest] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedExeLink, setCopiedExeLink] = useState(false);

  const isStaffOrAdmin = [
    'TPO_OFFICER',
    'ADMIN',
    'SUPER_ADMIN',
    'FACULTY_COORDINATOR',
  ].includes(user?.roleName);

  const getExamLink = (test) => {
    const origin = window.location.origin;
    const testParam = test?.id || test?.assessmentId || 1;
    return `${origin}/exam?testId=${encodeURIComponent(testParam)}`;
  };

  const getExeExamLink = (test) => {
    const testParam = test?.id || test?.assessmentId || 1;
    return `campuscorp-lock://exam?testId=${encodeURIComponent(testParam)}`;
  };

  const checkExeLock = async (silent = false) => {
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
          setExeLockRunning(true);
          if (!silent) showToast('SecureLock desktop client connected.', 'success');
          return;
        }
      }
      setExeLockRunning(Boolean(simulatedExe));
    } catch {
      setExeLockRunning(Boolean(simulatedExe));
    } finally {
      setCheckingExe(false);
    }
  };

  useEffect(() => {
    checkExeLock(true);
  }, []);

  useEffect(() => {
    fetchAssessments();
    fetchStudentAttempts();
  }, [user]);

  const toggleSimulatedExe = () => {
    const next = !simulatedExe;
    setSimulatedExe(next);
    setExeLockRunning(next);
    if (next) {
      localStorage.setItem('campuscorp_simulated_exe_lock', 'true');
      showToast('Test lock simulation enabled.', 'success');
    } else {
      localStorage.removeItem('campuscorp_simulated_exe_lock');
      showToast('Test lock simulation disabled.', 'info');
    }
  };

  const handleLangChange = (newLang) => {
    setSandboxLang(newLang);
    setSandboxCode(DEFAULT_TEMPLATES[newLang] || DEFAULT_TEMPLATES.python);
  };

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const codingRes = await apiClient.get('/assessment/list').catch(() => ({ data: { data: [] } }));
      const codingList = (codingRes.data?.data || []).map((ca) => ({
        id: `code_${ca.id}`,
        assessmentId: ca.id,
        type: 'PROGRAMMING',
        title: ca.title,
        subject: ca.subject || 'Data Structures & Algorithms',
        duration: ca.duration_minutes || 60,
        questionsCount: ca.total_questions || 3,
        totalPoints: ca.total_score || 100,
        cutoff: ca.passing_percentage || 60,
        active: Boolean(ca.is_active),
        attemptsTaken: ca.attemptsTaken || 0,
        bestScore: ca.bestScore,
        hasPassed: ca.hasPassed,
        dueDate: ca.end_time || null,
      }));

      const quizRes = await apiClient.get('/lms/quizzes').catch(() => ({ data: { data: [] } }));
      const quizList = (quizRes.data?.data || []).map((q) => ({
        id: `quiz_${q.id}`,
        quizId: q.id,
        type: 'QUIZ',
        title: q.title,
        subject: q.course_code ? `${q.course_code}: ${q.course_title || 'Course'}` : 'Curriculum Quiz',
        duration: q.time_limit_minutes || 30,
        questionsCount: q.question_count || 5,
        totalPoints: q.total_marks || (q.question_count ? q.question_count * 2 : 50),
        cutoff: q.passing_score || 60,
        active: Boolean(q.is_published),
        attemptsTaken: q.attemptsTaken || 0,
        bestScore: q.bestScore,
        hasPassed: q.hasPassed,
        dueDate: q.due_date || null,
      }));

      const combined = [...codingList, ...quizList];
      if (combined.length === 0) {
        setAssessments([
          {
            id: 'code_1',
            assessmentId: 1,
            type: 'PROGRAMMING',
            title: 'National Campus CodeSprint 2026-27',
            subject: 'Data Structures & Algorithms',
            duration: 60,
            questionsCount: 3,
            totalPoints: 100,
            cutoff: 60,
            active: true,
            attemptsTaken: 0,
            dueDate: null,
          },
        ]);
      } else {
        setAssessments(combined);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchStudentAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const res = await apiClient.get('/assessment/student/my-submissions').catch(() => ({ data: { data: [] } }));
      const raw = res.data?.data || [];
      setMyAttempts(
        raw.map((sub) => ({
          id: sub.id,
          title: `${sub.assessment_title || 'CodeSprint'} — ${sub.question_title || 'Challenge'}`,
          date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent',
          score: sub.score || 0,
          total: 25,
          status: sub.execution_status || 'EVALUATED',
          executionTime: sub.execution_time_ms ? `${sub.execution_time_ms}ms` : null,
          passedTests: `${sub.passed_test_cases || 0}/${sub.total_test_cases || 0} passed`,
        }))
      );
    } catch (err) {
      console.error('Failed to load student attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleStartTest = (test) => {
    setActiveTest(test);
    setViewMode('rules');
  };

  const handleLaunchExam = () => {
    const isInsideExe =
      typeof window !== 'undefined' &&
      Boolean(
        window.location.search.includes('exeLock=true') ||
          window.isCampusCorpExeLock ||
          window.lockdownBrowser?.locked
      );
    if (isInsideExe) {
      setViewMode('exam');
    } else {
      setViewMode('exe_running');
    }
  };

  const handleExitExam = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setViewMode('hub');
  };

  const handleRunSandbox = async () => {
    setSandboxRunning(true);
    setSandboxOutput('Running code...');
    try {
      const res = await apiClient.post('/assessment/run', {
        language: sandboxLang,
        source_code: sandboxCode,
        input: sandboxInput,
      });
      if (res.data) {
        const out = res.data.output || (res.data.error ? '' : '(No output)');
        const err = res.data.error ? `\n[Error]\n${res.data.error}` : '';
        const status = res.data.executionStatus || res.data.status || 'ACCEPTED';
        const time = res.data.executionTimeMs || 0;
        setSandboxOutput(`Status: ${status} (${time}ms)\n\n${out}${err}`);
        showToast(`Executed: ${status}`, status === 'ACCEPTED' ? 'success' : 'warning');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setSandboxOutput(`Execution Error:\n${errMsg}`);
      showToast('Execution failed: ' + errMsg, 'error');
    } finally {
      setSandboxRunning(false);
    }
  };

  const handleCopyLink = async (test) => {
    try {
      await navigator.clipboard.writeText(getExamLink(test));
      setCopiedLink(true);
      showToast('Exam link copied.', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Could not copy link.', 'error');
    }
  };

  const handleCopyExeLink = async (test) => {
    try {
      await navigator.clipboard.writeText(getExeExamLink(test));
      setCopiedExeLink(true);
      showToast('Desktop app link copied.', 'success');
      setTimeout(() => setCopiedExeLink(false), 2500);
    } catch {
      showToast('Could not copy link.', 'error');
    }
  };

  // Derived assessment counts & filtered list
  const stats = useMemo(() => {
    const quizzes = assessments.filter((a) => a.type === 'QUIZ');
    const codeSprint = assessments.filter((a) => a.type === 'PROGRAMMING');
    const completed = assessments.filter((a) => a.attemptsTaken > 0 || a.hasPassed);
    const upcoming = assessments.filter((a) => !a.attemptsTaken && !a.hasPassed);
    return {
      total: assessments.length,
      quizzes: quizzes.length,
      codeSprint: codeSprint.length,
      completed: completed.length,
      upcoming: upcoming.length,
    };
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    if (activeTab === 'QUIZ') return assessments.filter((a) => a.type === 'QUIZ');
    if (activeTab === 'CODESPRINT') return assessments.filter((a) => a.type === 'PROGRAMMING');
    if (activeTab === 'COMPLETED') return assessments.filter((a) => a.attemptsTaken > 0 || a.hasPassed);
    if (activeTab === 'UPCOMING') return assessments.filter((a) => !a.attemptsTaken && !a.hasPassed);
    return assessments;
  }, [assessments, activeTab]);

  // ── FULLSCREEN EXAM RULES VIEW ──
  if (viewMode === 'rules') {
    return (
      <div className="fixed inset-0 z-[1000] w-screen h-screen bg-secondary overflow-y-auto">
        <ExamRules
          subject={activeTest?.title}
          duration={activeTest?.duration || 45}
          totalQuestions={activeTest?.questionsCount || 25}
          onStartExam={handleLaunchExam}
          onGoBack={() => setViewMode('hub')}
          testId={activeTest?.id || activeTest?.assessmentId || 1}
        />
      </div>
    );
  }

  // ── DESKTOP LOCKDOWN STANDBY VIEW ──
  if (viewMode === 'exe_running') {
    return (
      <DesktopLockStandby
        subject={activeTest?.title || 'CampusCorpo Assessment'}
        testId={activeTest?.id || activeTest?.assessmentId || 1}
        candidate={{
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Student Candidate',
          rollNumber: user?.registerNumber || user?.rollNumber || '2023CSE001',
          email: user?.email || '',
          department: user?.departmentCode || 'Computer Science & Engineering',
        }}
        onReturnToHub={() => setViewMode('hub')}
        onFallbackInBrowser={() => setViewMode('exam')}
      />
    );
  }

  // ── FULLSCREEN PROCTORED EXAM VIEW ──
  if (viewMode === 'exam') {
    return (
      <div className="fixed inset-0 z-[1000] w-screen h-screen bg-secondary overflow-y-auto">
        <ExamScreen
          autoStart={true}
          initialPhase="exam"
          selectedTestId={activeTest?.id}
          onExit={handleExitExam}
        />
      </div>
    );
  }

  // ── STAFF / ADMIN TEST MANAGER VIEW ──
  if (viewMode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card text-card-foreground p-4 rounded-xl border border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground">Question Bank & Test Manager</h2>
            <p className="text-xs text-muted-foreground">Manage quizzes, coding challenges, and attempt logs.</p>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('hub')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assessment Center</span>
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const tabs = [
    { id: 'ALL', label: 'All Assessments', count: stats.total },
    { id: 'QUIZ', label: 'Quizzes', count: stats.quizzes },
    { id: 'CODESPRINT', label: 'CodeSprint', count: stats.codeSprint },
    { id: 'COMPLETED', label: 'Completed', count: stats.completed },
    { id: 'UPCOMING', label: 'Upcoming', count: stats.upcoming },
  ];

  // ── MAIN ASSESSMENT CENTER DASHBOARD ──
  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      {/* 1. Simple Page Heading & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your quizzes, coding assessments and evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCompilerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-[#F8EDF0] dark:hover:bg-[#312128] text-foreground text-xs font-semibold transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#8B2942] dark:text-[#F2B8C7]" />
            <span>{compilerOpen ? 'Hide Compiler' : 'Open Compiler'}</span>
          </button>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => setViewMode('admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Manage Tests</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Small Assessment Statistics Row (Total, Upcoming, Completed) */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.upcoming}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E5A13B]/12 text-[#E5A13B] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.completed}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#26966B]/12 text-[#26966B] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Horizontal Assessment Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-[#8B2942] text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'CODESPRINT' && (
          <button
            type="button"
            onClick={() => setCompilerOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7] hover:underline cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Compiler</span>
          </button>
        )}
      </div>

      {/* 5 (Optional Expandable): Dedicated Compiler Workspace */}
      {compilerOpen && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8B2942] dark:text-[#F2B8C7]" />
              <h2 className="text-sm font-bold text-foreground">Compiler Workspace</h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sandboxLang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:border-[#8B2942] cursor-pointer"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>

              <Link
                to="/compiler"
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <button
                type="button"
                onClick={() => setCompilerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                aria-label="Close Compiler"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                rows={10}
                spellCheck="false"
                className="w-full p-3.5 rounded-lg border border-border bg-[#141214] text-[#F7F6F7] font-mono text-xs leading-relaxed focus:outline-none focus:border-[#8B2942] resize-y"
              />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Custom Input (stdin)
                </label>
                <input
                  type="text"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  placeholder="Optional input..."
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:border-[#8B2942]"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSandbox}
                disabled={sandboxRunning}
                className="w-full h-9 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{sandboxRunning ? 'Running...' : 'Run Code'}</span>
              </button>

              <div className="flex-1 min-h-[120px] rounded-lg border border-border bg-[#141214] p-3 text-[#F7F6F7] font-mono text-xs overflow-auto">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Output</p>
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {sandboxOutput || 'Run your code to see output here.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Responsive Grid of Clean, Compact Assessment Cards */}
      {loadingAssessments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 rounded-xl bg-card border border-border p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center space-y-2">
          <BookOpen className="w-7 h-7 text-muted-foreground mx-auto opacity-60" />
          <p className="text-sm font-semibold text-foreground">No assessments in this category</p>
          <p className="text-xs text-muted-foreground">Switch tabs to view other available assessments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((test) => {
            const isCompleted = test.attemptsTaken > 0 || test.hasPassed;
            const statusLabel = isCompleted ? 'Completed' : test.active ? 'Upcoming' : 'Scheduled';
            const actionLabel = isCompleted ? 'View Results' : 'Start Assessment';

            return (
              <div
                key={test.id}
                className="bg-card text-card-foreground rounded-xl border border-border hover:border-[#8B2942]/40 p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                {/* Top Meta: Type & Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B2942] dark:text-[#F2B8C7]">
                      {test.type === 'PROGRAMMING' ? (
                        <Code2 className="w-3.5 h-3.5" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5" />
                      )}
                      <span>{test.type === 'PROGRAMMING' ? 'CodeSprint' : 'Quiz'}</span>
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#26966B]/12 text-[#26966B]'
                          : 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                      {test.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {test.subject}
                    </p>
                  </div>

                  {/* Compact Key Specs */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 pt-2 border-t border-border text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{test.duration} mins</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span>{test.totalPoints} marks</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span>{test.questionsCount} questions</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      <span>Pass: {test.cutoff}%</span>
                    </span>
                    {test.dueDate && (
                      <span className="col-span-2 inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Due: {new Date(test.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Single Prominent Action Button (+ subtle share icon for staff) */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartTest(test)}
                    className="flex-1 h-9 px-4 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{actionLabel}</span>
                  </button>

                  {isStaffOrAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShareModalTest(test);
                        setCopiedLink(false);
                        setCopiedExeLink(false);
                      }}
                      title="Share exam link"
                      className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compact Recent Submissions (only shown if student has submissions) */}
      {!loadingAttempts && myAttempts.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Recent Evaluated Submissions</h2>
            <span className="text-xs text-muted-foreground">{myAttempts.length} records</span>
          </div>
          <div className="divide-y divide-border">
            {myAttempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{attempt.title}</p>
                  <p className="text-muted-foreground mt-0.5">
                    {attempt.date} • {attempt.passedTests}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-foreground">
                    {attempt.score}/{attempt.total}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      attempt.status === 'ACCEPTED' || attempt.status === 'PASSED'
                        ? 'bg-[#26966B]/12 text-[#26966B]'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {attempt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Compact SecureLock Status Section */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">SecureLock Desktop Client</h2>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    exeLockRunning
                      ? 'bg-[#26966B]/12 text-[#26966B]'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${exeLockRunning ? 'bg-[#26966B]' : 'bg-muted-foreground'}`} />
                  {exeLockRunning ? 'Installed & Active' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Required for proctored full-screen assessments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/downloads/CampusCorp-SecureLock.exe"
              download="CampusCorp-SecureLock.exe"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download App</span>
            </a>

            <button
              type="button"
              onClick={() => checkExeLock(false)}
              disabled={checkingExe}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingExe ? 'animate-spin' : ''}`} />
              <span>{checkingExe ? 'Checking...' : 'Check Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSecureLockExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span>Details</span>
              {secureLockExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Technical Details & Advanced Controls */}
        {secureLockExpanded && (
          <div className="pt-3 border-t border-border space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-muted-foreground">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border">
                <ShieldCheck className="w-4 h-4 text-[#26966B] shrink-0" />
                <span>Full-screen kiosk & shortcut lock</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border">
                <ShieldCheck className="w-4 h-4 text-[#26966B] shrink-0" />
                <span>Dual-monitor blackout protection</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border">
                <ShieldCheck className="w-4 h-4 text-[#26966B] shrink-0" />
                <span>Background process verification</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <a
                  href="campuscorp-lock://exam?testId=1"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Desktop App</span>
                </a>
                <button
                  type="button"
                  onClick={toggleSimulatedExe}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    simulatedExe
                      ? 'bg-[#26966B]/12 border-[#26966B]/30 text-[#26966B]'
                      : 'bg-background border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{simulatedExe ? 'Test Lock: ON' : 'Test Lock Mode'}</span>
                </button>
              </div>
              <span className="text-[11px] text-muted-foreground">SecureLock Client v2.4.0</span>
            </div>
          </div>
        )}
      </div>

      {/* Share Exam Link Modal (Preserved for Staff/Admin) */}
      {shareModalTest && (
        <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 max-w-md w-full shadow-xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShareModalTest(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-foreground">Share Assessment Link</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{shareModalTest.title}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Web Browser Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getExamLink(shareModalTest)}
                  onClick={(e) => e.target.select()}
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-foreground font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareModalTest)}
                  className="h-9 px-3 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">SecureLock App Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getExeExamLink(shareModalTest)}
                  onClick={(e) => e.target.select()}
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-foreground font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleCopyExeLink(shareModalTest)}
                  className="h-9 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedExeLink ? <Check className="w-3.5 h-3.5 text-[#26966B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExeLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShareModalTest(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                Close
              </button>
              <a
                href={getExamLink(shareModalTest)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessment;
