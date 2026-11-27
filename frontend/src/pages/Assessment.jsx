import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import { StatusBadge } from '../components/Badge';
import {
  Code2,
  Play,
  Clock,
  Terminal,
  Trophy,
  BookOpen,
  Settings2,
  ArrowLeft,
  Layers,
  Share2,
  Download,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';

// Preserved Exam & Admin Sub-Views
import ExamRules from './LMS/ExamRules';
import ExamScreen from './LMS/ExamScreen';
import AdminDashboard from './LMS/admin/AdminDashboard';
import DesktopLockStandby from '../components/LMS/DesktopLockStandby';

export function Assessment() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Primary view state: 'hub' | 'rules' | 'exe_running' | 'exam' | 'admin'
  const [viewMode, setViewMode] = useState('hub');
  const [activeTest, setActiveTest] = useState(null);

  // Data state
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Simple filter & tab state
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PROGRAMMING' | 'QUIZ' | 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');

  const isStaffOrAdmin = [
    'TPO_OFFICER',
    'ADMIN',
    'SUPER_ADMIN',
    'FACULTY_COORDINATOR',
  ].includes(user?.roleName);

  useEffect(() => {
    fetchAssessments();
    fetchStudentAttempts();
  }, [user]);

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const [codingRes, quizRes] = await Promise.all([
        apiClient.get('/assessment/list').catch(() => ({ data: { data: [] } })),
        apiClient.get('/lms/quizzes').catch(() => ({ data: { data: [] } })),
      ]);

      const codingList = (codingRes.data?.data || []).map((ca) => ({
        id: `code_${ca.id}`,
        assessmentId: ca.id,
        type: 'PROGRAMMING',
        title: ca.title,
        subject: 'Coding Assessment',
        description: ca.description || 'Timed programming test with automated test case evaluation.',
        duration: ca.duration_minutes || 60,
        questionsCount: ca.total_questions || 3,
        totalPoints: ca.total_score || 100,
        cutoff: 60,
        attemptsTaken: ca.attemptsTaken || 0,
        bestScore: ca.bestScore,
      }));

      const quizList = (quizRes.data?.data || []).map((q) => ({
        id: `quiz_${q.id}`,
        quizId: q.id,
        type: 'QUIZ',
        title: q.title,
        subject: q.course_code ? `${q.course_code} Quiz` : 'Curriculum Quiz',
        description: q.description || q.instructions || 'Objective multiple-choice assessment.',
        duration: q.time_limit_minutes || 30,
        questionsCount: q.question_count || 5,
        totalPoints: q.total_marks || (q.question_count ? q.question_count * 2 : 50),
        cutoff: q.passing_score || 60,
        attemptsTaken: q.attemptsTaken || 0,
        bestScore: q.bestScore,
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
            description: 'Timed technical assessment covering aptitude, technical MCQs, and live coding.',
            duration: 60,
            questionsCount: 3,
            totalPoints: 100,
            cutoff: 60,
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
      setMyAttempts(
        raw.map((sub) => ({
          id: sub.id,
          title: `${sub.assessment_title || 'CodeSprint'} — ${sub.question_title || 'Challenge'}`,
          date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent',
          score: sub.score || 0,
          total: 25,
          status: sub.execution_status || 'EVALUATED',
          passedTests: `${sub.passed_test_cases || 0}/${sub.total_test_cases || 0}`,
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
    setViewMode(isInsideExe ? 'exam' : 'exe_running');
  };

  const handleExitExam = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setViewMode('hub');
  };

  const handleShareLink = async (test, e) => {
    e.stopPropagation();
    const testParam = test?.id || test?.assessmentId || 1;
    const link = `${window.location.origin}/exam?testId=${encodeURIComponent(testParam)}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('Assessment link copied to clipboard', 'success');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const filteredAssessments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assessments.filter((a) => {
      if (activeTab === 'PROGRAMMING' && a.type !== 'PROGRAMMING') return false;
      if (activeTab === 'QUIZ' && a.type !== 'QUIZ') return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.subject || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    });
  }, [assessments, activeTab, searchQuery]);

  // ── Fullscreen Exam Rules ──
  if (viewMode === 'rules') {
    return (
      <div className="fixed inset-0 z-[1000] w-screen h-screen bg-background overflow-y-auto">
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

  // ── Desktop Lockdown Standby ──
  if (viewMode === 'exe_running') {
    return (
      <DesktopLockStandby
        subject={activeTest?.title || 'CampusCorpo Assessment'}
        testId={activeTest?.id || activeTest?.assessmentId || 1}
        candidate={{
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Student',
          rollNumber: user?.registerNumber || user?.rollNumber || '2023CSE001',
          email: user?.email || '',
          department: user?.departmentCode || 'CSE',
        }}
        onReturnToHub={() => setViewMode('hub')}
        onFallbackInBrowser={() => setViewMode('exam')}
      />
    );
  }

  // ── Fullscreen Exam View ──
  if (viewMode === 'exam') {
    return (
      <div className="fixed inset-0 z-[1000] w-screen h-screen bg-background overflow-y-auto">
        <ExamScreen
          autoStart={true}
          initialPhase="exam"
          selectedTestId={activeTest?.id}
          onExit={handleExitExam}
        />
      </div>
    );
  }

  // ── Staff / Admin Test Manager ──
  if (viewMode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Test & Question Bank Manager</h2>
            <p className="text-xs text-muted-foreground">Create assessments and review candidate logs.</p>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('hub')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border text-xs font-semibold text-foreground hover:border-[#8B2942] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assessments</span>
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  const codingCount = assessments.filter((a) => a.type === 'PROGRAMMING').length;
  const quizCount = assessments.filter((a) => a.type === 'QUIZ').length;

  // ── SIMPLIFIED ASSESSMENT CENTER HUB ──
  return (
    <div className="space-y-5 pb-10">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Assessment Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Take coding tests, curriculum quizzes, and view your evaluated results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/compiler"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Online Compiler</span>
          </Link>

          <a
            href="/downloads/CampusCorp-SecureLock.exe"
            download="CampusCorp-SecureLock.exe"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-card hover:bg-[#F8EDF0] text-foreground border border-border transition-colors"
            title="Download CampusCorp SecureLock Desktop Client"
          >
            <Download className="w-3.5 h-3.5 text-[#8B2942]" />
            <span>SecureLock .exe</span>
          </a>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => setViewMode('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-card hover:bg-[#F8EDF0] text-foreground border border-border transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#8B2942]" />
              <span>Manage Tests</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Search & Tabs Card */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests or quizzes..."
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#F7F6F7] dark:bg-[#262126] border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8B2942] focus:bg-card"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-2.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Assessments', count: assessments.length },
            { id: 'PROGRAMMING', label: 'Coding Tests', count: codingCount },
            { id: 'QUIZ', label: 'Quizzes', count: quizCount },
            { id: 'HISTORY', label: 'My Submissions', count: myAttempts.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 pb-1.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#8B2942] text-[#8B2942] dark:text-[#F2B8C7]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area: History Table OR Simple Assessment Card Grid */}
      {activeTab === 'HISTORY' ? (
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          {loadingAttempts ? (
            <p className="text-xs text-muted-foreground py-8 text-center">Loading submission history...</p>
          ) : myAttempts.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Trophy className="w-7 h-7 text-muted-foreground mx-auto opacity-60" />
              <p className="text-sm font-semibold text-foreground">No submissions yet</p>
              <p className="text-xs text-muted-foreground">Complete an assessment to view your scores here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Assessment</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Test Cases</th>
                    <th className="py-2.5 px-3 font-semibold">Score</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-[#F7F6F7]/60 dark:hover:bg-white/5">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{attempt.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{attempt.date}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{attempt.passedTests}</td>
                      <td className="py-2.5 px-3 font-bold text-foreground">{attempt.score} pts</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={attempt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : loadingAssessments ? (
        <div className="p-10 rounded-xl bg-card border border-border text-center text-xs text-muted-foreground">
          Loading assessments...
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="p-10 rounded-xl bg-card border border-border text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">No assessments found</p>
          <p className="text-xs text-muted-foreground">Try clearing your search or switching tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((test) => {
            const isCoding = test.type === 'PROGRAMMING';
            const Icon = isCoding ? Code2 : BookOpen;

            return (
              <div
                key={test.id}
                className="bg-card text-card-foreground rounded-xl border border-border hover:border-[#8B2942]/45 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground border border-border">
                      {isCoding ? 'Coding' : 'Quiz'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {test.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {test.questionsCount} {isCoding ? 'problems' : 'questions'}
                    </span>
                    {test.attemptsTaken > 0 && (
                      <span className="inline-flex items-center gap-1 text-[#26966B] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Best: {test.bestScore}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartTest(test)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start {isCoding ? 'Test' : 'Quiz'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleShareLink(test, e)}
                    title="Copy shareable link"
                    className="w-9 h-9 rounded-lg border border-border bg-[#F7F6F7] dark:bg-[#262126] hover:border-[#8B2942] text-muted-foreground hover:text-[#8B2942] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Assessment;
