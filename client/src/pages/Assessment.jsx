import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import {
  Code2,
  Play,
  CheckCircle2,
  Clock,
  Terminal,
  AlertTriangle,
  Trophy,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Layers,
  Settings2,
  ArrowLeft,
  Cpu,
  Monitor,
  Check,
  Filter,
  Calendar,
  CheckCircle,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  X,
} from 'lucide-react';

// LMS Components & Modules
import ExamRules from './LMS/ExamRules';
import ExamScreen from './LMS/ExamScreen';
import AdminDashboard from './LMS/admin/AdminDashboard';
import CodeEditor from '../components/LMS/CodeEditor';

export function Assessment() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();

  // Primary view state: 'hub' | 'rules' | 'exam' | 'admin'
  const [viewMode, setViewMode] = useState('hub');
  const [activeTest, setActiveTest] = useState(null);
  const [runtimeStatus, setRuntimeStatus] = useState({
    compilers: { python: true, gcc: false, gxx: false, java: false },
    executionLimits: { timeoutMs: 5000 },
  });

  // Dynamic assessments from database
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'PROGRAMMING' | 'QUIZ'

  // Share Test Link Modal State
  const [shareModalTest, setShareModalTest] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const getExamLink = (test) => {
    const origin = window.location.origin;
    const testParam = test?.id || test?.assessmentId || 1;
    return `${origin}/exam?testId=${encodeURIComponent(testParam)}`;
  };

  const handleOpenShareModal = (test) => {
    setShareModalTest(test);
    setCopiedLink(false);
  };

  const handleCopyLink = async (test) => {
    const link = getExamLink(test);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showToast('Exam link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      showToast('Could not copy link to clipboard.', 'error');
    }
  };

  // Past Assessment Attempts
  const [myAttempts, setMyAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Sandbox Code Editor State
  const [sandboxLang, setSandboxLang] = useState('python');
  const [sandboxCode, setSandboxCode] = useState(`# Python 3 CampusCorp Assessment Solution
def solve(n, target, arr):
    lookup = {}
    for i, num in enumerate(arr):
        diff = target - num
        if diff in lookup:
            return f"Found target pairs at index: {lookup[diff]} and {i}"
        lookup[num] = i
    return "No pair found"

if __name__ == '__main__':
    target = 9
    nums = [2, 7, 11, 15]
    print(solve(len(nums), target, nums))
`);

  const handleLangChange = (newLang) => {
    setSandboxLang(newLang);
    if (newLang === 'python') {
      setSandboxCode(`# Python 3 CampusCorp Assessment Solution
def solve(n, target, arr):
    lookup = {}
    for i, num in enumerate(arr):
        diff = target - num
        if diff in lookup:
            return f"Found target pairs at index: {lookup[diff]} and {i}"
        lookup[num] = i
    return "No pair found"

if __name__ == '__main__':
    target = 9
    nums = [2, 7, 11, 15]
    print(solve(len(nums), target, nums))
`);
    } else if (newLang === 'javascript') {
      setSandboxCode(`// JavaScript (Node.js) Assessment Solution
function solve(target, nums) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return \`Found target pairs at index: \${map.get(diff)} and \${i}\`;
    }
    map.set(nums[i], i);
  }
  return "No pair found";
}

const target = 9;
const nums = [2, 7, 11, 15];
console.log(solve(target, nums));
`);
    } else if (newLang === 'java') {
      setSandboxCode(`// Java 21 CampusCorp Assessment Solution
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        int target = 9;
        int[] nums = {2, 7, 11, 15};
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                System.out.println("Found target pairs at index: " + map.get(diff) + " and " + i);
                return;
            }
            map.put(nums[i], i);
        }
        System.out.println("No pair found");
    }
}
`);
    } else if (newLang === 'c') {
      setSandboxCode(`// C (GCC) Assessment Solution
#include <stdio.h>

int main() {
    printf("Executing C solution on CampusCorp live sandbox runtime.\\n");
    printf("Status: Online and operational.\\n");
    return 0;
}
`);
    } else if (newLang === 'cpp') {
      setSandboxCode(`// C++ (G++) Assessment Solution
#include <iostream>
#include <vector>

int main() {
    std::cout << "Executing C++17 solution on CampusCorp live sandbox runtime." << std::endl;
    return 0;
}
`);
    }
  };
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [sandboxRunning, setSandboxRunning] = useState(false);

  const isStaffOrAdmin = [
    'TPO_OFFICER',
    'ADMIN',
    'SUPER_ADMIN',
    'FACULTY_COORDINATOR',
  ].includes(user?.roleName);

  useEffect(() => {
    // Check runtime compilers status
    apiClient
      .get('/assessment/runtime-status')
      .then((res) => {
        if (res.data) setRuntimeStatus(res.data);
      })
      .catch(() => {});

    fetchAssessments();
    fetchStudentAttempts();
  }, [user]);

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      // 1. Fetch real CodeSprint programming assessments
      const codingRes = await apiClient.get('/assessment/list').catch(() => ({ data: { data: [] } }));
      const codingList = (codingRes.data?.data || []).map((ca) => ({
        id: `code_${ca.id}`,
        assessmentId: ca.id,
        type: 'PROGRAMMING',
        title: ca.title,
        subject: 'Data Structures & Algorithms',
        description: ca.description || 'Comprehensive programming assessment with automated compilation, test case verification, and execution constraints.',
        duration: ca.duration_minutes || 60,
        questionsCount: ca.total_questions || 3,
        phases: ['Core Logic', 'Live Coding'],
        difficulty: 'Medium - Advanced',
        totalPoints: ca.total_score || 100,
        cutoff: 60,
        active: Boolean(ca.is_active),
        attemptsTaken: ca.attemptsTaken || 0,
        bestScore: ca.bestScore,
        hasPassed: ca.hasPassed,
        dueDate: ca.end_time || null,
        totalCandidates: ca.total_candidates || 0,
      }));

      // 2. Fetch real LMS Quizzes
      const quizRes = await apiClient.get('/lms/quizzes').catch(() => ({ data: { data: [] } }));
      const quizList = (quizRes.data?.data || []).map((q) => ({
        id: `quiz_${q.id}`,
        quizId: q.id,
        type: 'QUIZ',
        title: q.title,
        subject: q.course_code ? `${q.course_code}: ${q.course_title || 'LMS Course'}` : 'Objective Curriculum Quiz',
        description: q.description || q.instructions || 'Standard objective multiple-choice assessment evaluated securely against placement benchmarks.',
        duration: q.time_limit_minutes || 30,
        questionsCount: q.question_count || 5,
        phases: ['Objective MCQs'],
        difficulty: 'Standard',
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
        // Fallback default if backend is initializing
        setAssessments([
          {
            id: 'code_1',
            assessmentId: 1,
            type: 'PROGRAMMING',
            title: 'National Campus CodeSprint 2026-27',
            subject: 'Data Structures & Algorithms',
            description: 'Comprehensive 3-phase technical assessment covering Quantitative Aptitude, Technical MCQs, and algorithmic live coding.',
            duration: 60,
            questionsCount: 3,
            phases: ['Aptitude Logic', 'Technical MCQ', 'Live Coding'],
            difficulty: 'Medium - Advanced',
            totalPoints: 100,
            cutoff: 60,
            active: true,
            attemptsTaken: 0,
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
      if (raw.length > 0) {
        const formatted = raw.map((sub) => ({
          id: sub.id,
          title: `${sub.assessment_title || 'CodeSprint'} — ${sub.question_title || 'Challenge'}`,
          date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent',
          score: sub.score || 0,
          total: 25,
          status: sub.execution_status || 'EVALUATED',
          executionTime: sub.execution_time_ms ? `${sub.execution_time_ms}ms` : null,
          passedTests: `${sub.passed_test_cases || 0}/${sub.total_test_cases || 0} passed`,
          type: 'PROGRAMMING',
        }));
        setMyAttempts(formatted);
      } else {
        setMyAttempts([]);
      }
    } catch (err) {
      console.error('Failed to load student attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Launch test flow
  const handleStartTest = (test) => {
    setActiveTest(test);
    setViewMode('rules');
  };

  const handleLaunchExam = () => {
    setViewMode('exam');
  };

  // Run Sandbox code
  const handleRunSandbox = async () => {
    setSandboxRunning(true);
    setSandboxOutput('Transmitting payload to live execution sandbox...');

    try {
      const res = await apiClient.post('/assessment/run', {
        language: sandboxLang,
        source_code: sandboxCode,
        input: sandboxInput,
      });

      if (res.data) {
        const out = res.data.output || (res.data.error ? '' : '(Code executed successfully with zero stdout output)');
        const err = res.data.error ? `\n\n[Runtime / Stderr]:\n${res.data.error}` : '';
        const status = res.data.executionStatus || res.data.status || 'ACCEPTED';
        const time = res.data.executionTimeMs || 0;

        setSandboxOutput(
          `Status: ${status}\nExecution Time: ${time}ms\nSandbox: Ephemeral Process Isolation\n\n=== Terminal Stdout ===\n${out}${err}`
        );
        showToast(`Code executed: ${status}`, status === 'ACCEPTED' ? 'success' : 'warning');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setSandboxOutput(`Execution Error:\n${errMsg}`);
      showToast('Sandbox execution failed: ' + errMsg, 'error');
    } finally {
      setSandboxRunning(false);
    }
  };

  // ── RENDER EXAM RULES VIEW (Full viewport - no sidebar or navbar) ──
  if (viewMode === 'rules') {
    return (
      <div className="fixed inset-0 z-[1000] w-screen h-screen bg-secondary overflow-y-auto">
        <ExamRules
          subject={activeTest?.title}
          duration={activeTest?.duration || 45}
          totalQuestions={activeTest?.questionsCount || 25}
          onStartExam={handleLaunchExam}
          onGoBack={() => setViewMode('hub')}
        />
      </div>
    );
  }

  const handleExitExam = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setViewMode('hub');
  };

  // ── RENDER FULLSCREEN PROCTORED EXAM VIEW (Full viewport - no sidebar or navbar) ──
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

  // ── RENDER LMS ADMIN DASHBOARD VIEW ──
  if (viewMode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card text-card-foreground p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground">
              LMS Admin Console
            </span>
            <span className="text-xs text-muted-foreground">
              Manage question banks, tests, and student attempt logs.
            </span>
          </div>
          <button
            onClick={() => setViewMode('hub')}
            className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Candidate Hub</span>
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const filteredAssessments = assessments.filter((a) => {
    if (typeFilter === 'PROGRAMMING') return a.type === 'PROGRAMMING';
    if (typeFilter === 'QUIZ') return a.type === 'QUIZ';
    return true;
  });

  // ── RENDER MAIN ASSESSMENT HUB (DEFAULT) ──
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner */}
      <div className="bg-card text-card-foreground rounded-2xl p-6 sm:p-8 border border-border shadow-xs relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: currentTheme.glow }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: currentTheme.primaryLight,
                  color: currentTheme.primaryText,
                }}
              >
                <Code2 className="w-3.5 h-3.5" />
                Unified Assessment & CodeSprint Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[10px] font-bold border border-border">
                <Check className="w-3 h-3" />
                Live Compilers Active
              </span>
            </div>

            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Assessment & CodeSprint Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Consolidated evaluation platform supporting regular curriculum quizzes and proctored CodeSprint live coding assessments with compiler sandboxing.
            </p>
          </div>

          {/* Quick Staff/Admin Console Switcher */}
          {isStaffOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('admin')}
                className="px-4 py-2.5 rounded-xl border border-border hover:border-border bg-secondary hover:bg-secondary text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <span>Question Bank & Test Manager</span>
              </button>
            </div>
          )}
        </div>

        {/* Runtime Diagnostics Strip */}
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Runtime Compilers:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] animate-pulse" />
              Python 3 (Ready)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a]" />
              Node.js / JS (Ready)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a]" />
              C / C++ (GCC/G++)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-muted-foreground text-[11px] font-semibold">
              Java OpenJDK
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground font-medium">
            Sandboxed Process Execution • 5000ms Timeout Limit
          </div>
        </div>
      </div>

      {/* Grid: Assessments on Left, Sandbox on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Proctored Coding Tests & Quizzes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span>Active Assessments & Quizzes</span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-bold border border-border">
                  {filteredAssessments.length} Available
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Authorized institutional assessments retrieved live from campus database.
              </p>
            </div>

            {/* Assessment Type Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl border border-border text-sm font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'ALL'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({assessments.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('PROGRAMMING')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'PROGRAMMING'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                CodeSprint ({assessments.filter((a) => a.type === 'PROGRAMMING').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('QUIZ')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  typeFilter === 'QUIZ'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Quizzes ({assessments.filter((a) => a.type === 'QUIZ').length})
              </button>
            </div>
          </div>

          {loadingAssessments ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center text-sm text-muted-foreground animate-pulse">
              Retrieving authorized database assessments and curriculum quizzes...
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center text-sm text-muted-foreground">
              No active assessments found matching the selected category.
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredAssessments.map((test) => (
                <div
                  key={test.id}
                  className="bg-card text-card-foreground rounded-2xl p-5 border border-border shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all relative overflow-hidden group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {test.type === 'PROGRAMMING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] text-xs font-bold uppercase tracking-wider">
                            <Code2 className="w-3.5 h-3.5" />
                            CodeSprint Challenge
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-secondary text-foreground text-xs font-bold uppercase tracking-wider border border-border">
                            <BookOpen className="w-3.5 h-3.5" />
                            Curriculum Quiz
                          </span>
                        )}

                        <span
                          className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: currentTheme.primaryLight,
                            color: currentTheme.primaryText,
                          }}
                        >
                          {test.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-semibold">
                          {test.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs font-bold border border-border">
                          Pass Mark: {test.cutoff}%
                        </span>
                        {test.dueDate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium border border-border">
                            <Calendar className="w-3.5 h-3.5" />
                            Due: {new Date(test.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-foreground group-hover:underline transition-colors">
                        {test.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {test.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3.5 pt-2 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {test.duration} Mins
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          {test.questionsCount} {test.type === 'PROGRAMMING' ? 'Coding Problems' : 'Questions'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-foreground" />
                          {test.totalPoints} Marks Total
                        </span>
                        {test.attemptsTaken > 0 && (
                          <span className="flex items-center gap-1.5 font-bold text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-foreground" />
                            Best: {test.bestScore} pts ({test.attemptsTaken} attempt{test.attemptsTaken > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                      <button
                        onClick={() => handleStartTest(test)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md hover:opacity-90 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{test.type === 'PROGRAMMING' ? 'Start CodeSprint' : 'Start Quiz'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShareModal(test);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:border-border/80"
                        title="Generate and copy shareable exam link"
                      >
                        <Share2 className="w-3.5 h-3.5 text-primary" />
                        <span>Share Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Submissions Section */}
          <div className="bg-card text-card-foreground rounded-2xl p-5 border border-border shadow-xs space-y-3.5 mt-6">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-foreground" />
                <span>My Evaluated Submissions & History</span>
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                {myAttempts.length} Records Found
              </span>
            </div>

            {loadingAttempts ? (
              <p className="text-sm text-muted-foreground py-4 text-center animate-pulse">Loading submission history...</p>
            ) : myAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No past assessment submissions recorded yet. Attempt an assessment above to view evaluated scores.</p>
            ) : (
              <div className="space-y-2.5">
                {myAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-3.5 rounded-xl bg-secondary border border-border flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">{attempt.title}</p>
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5">
                        <span>{attempt.date}</span>
                        {attempt.executionTime && <span>• Runtime: {attempt.executionTime}</span>}
                        {attempt.passedTests && <span>• {attempt.passedTests}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-foreground">
                          {attempt.score}/{attempt.total}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${
                        attempt.status === 'ACCEPTED' || attempt.status === 'PASSED'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-secondary text-foreground border-border'
                      }`}>
                        {attempt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Compiler Sandbox */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-2xl p-5 border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-foreground" />
                  <span>Compiler Execution Sandbox</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Write and test code instantly against the live backend compiler runner.
                </p>
              </div>

              {/* Language Selector */}
              <select
                value={sandboxLang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-foreground bg-secondary focus:outline-none cursor-pointer"
              >
                <option value="python">Python 3.10</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="java">Java 21 (OpenJDK)</option>
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (G++)</option>
              </select>
            </div>

            {/* Embedded Code Editor */}
            <div className="rounded-xl overflow-hidden border border-border bg-slate-950">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">main.{sandboxLang === 'python' ? 'py' : sandboxLang === 'java' ? 'java' : sandboxLang === 'cpp' ? 'cpp' : 'c'}</span>
                <span>UTF-8</span>
              </div>
              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                rows={10}
                className="w-full p-3.5 bg-slate-950 text-slate-100 font-mono text-sm focus:outline-none resize-y selection:bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] selection:text-white leading-relaxed"
                spellCheck="false"
              />
            </div>

            {/* Input & Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Custom Input (stdin)
                </span>
              </div>
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Optional input arguments (e.g. 9)"
                className="w-full px-3.5 py-2 rounded-lg border border-border text-sm font-mono bg-secondary focus:outline-none text-foreground"
              />
            </div>

            {/* Run Button */}
            <div>
              <button
                onClick={handleRunSandbox}
                disabled={sandboxRunning}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60 hover:opacity-90"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{sandboxRunning ? 'Executing Code...' : 'Run Code in Sandbox'}</span>
              </button>
            </div>

            {/* Terminal Console Output */}
            {sandboxOutput && (
              <div className="rounded-xl bg-slate-900 p-3.5 text-slate-100 font-mono text-sm border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-slate-800 pb-1 mb-1">
                  <span>SANDBOX TERMINAL OUTPUT</span>
                  <span className="text-foreground">Process Complete</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed text-xs">
                  {sandboxOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Exam Link Modal */}
      {shareModalTest && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShareModalTest(null)}
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
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  Public Shareable Exam Link
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {shareModalTest.title}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground font-semibold">
                <span>Format: <strong className="text-foreground">{shareModalTest.type === 'PROGRAMMING' ? 'CodeSprint Live Coding' : 'Curriculum Quiz'}</strong></span>
                <span>Duration: <strong className="text-foreground">{shareModalTest.duration} Mins</strong></span>
                <span>Marks: <strong className="text-foreground">{shareModalTest.totalPoints} pts</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Fullscreen lock & anti-cheat monitoring automatically active on open</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Shareable Candidate URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getExamLink(shareModalTest)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs select-all focus:outline-none"
                  onClick={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareModalTest)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Works for anyone right now:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                Candidates opening this link in any browser or incognito tab will instantly access the Candidate Gate, review exam instructions, and enter mandatory fullscreen lock upon starting.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShareModalTest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 cursor-pointer"
              >
                Close
              </button>
              <a
                href={getExamLink(shareModalTest)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold text-foreground bg-card hover:bg-secondary border border-border flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Test Link in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
