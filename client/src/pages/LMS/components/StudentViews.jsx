import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  HelpCircle,
  FolderGit2,
  Milestone,
  LineChart,
  Video,
  MessagesSquare,
  Bookmark,
  Award,
  Bell,
  Briefcase,
  LifeBuoy,
  CheckCircle2,
  Clock,
  Play,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Plus,
  Send,
  Code2,
  ArrowRight,
  Cpu,
  Layers,
  Trash2,
} from 'lucide-react';
import lmsService from '../../../services/lmsService';
import { useToast } from '../../../context/ToastContext';

export function StudentViews({ activeSection, onSelectSection }) {
  const { showToast } = useToast();
  // State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ text: '', githubUrl: '', fileName: '' });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', message: '' });
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'COURSE_ACCESS', description: '', priority: 'MEDIUM' });
  const [announcements, setAnnouncements] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [cList, qList, aList, lpList, lcList, dList, nList, certList, notifList, pList, tList, annList, pData] =
          await Promise.all([
            lmsService.getCourses(),
            lmsService.getQuizzes(),
            lmsService.getAssignments(),
            lmsService.getLearningPaths(),
            lmsService.getLiveClasses(),
            lmsService.getDiscussions(),
            lmsService.getNotes(),
            lmsService.getCertificates(),
            lmsService.getNotifications(),
            lmsService.getPortfolio(),
            lmsService.getSupportTickets(),
            lmsService.getAnnouncements(),
            lmsService.getStudentProgress().catch(() => null),
          ]);

        if (mounted) {
          setCourses(cList);
          if (cList.length > 0 && !selectedCourse) {
            setSelectedCourse(cList[0]);
          }
          setQuizzes(qList);
          setAssignments(aList);
          setLearningPaths(lpList);
          setLiveClasses(lcList);
          setDiscussions(dList);
          setNotes(nList);
          setCertificates(certList);
          setNotifications(notifList);
          setPortfolio(pList);
          setTickets(tList);
          setAnnouncements(annList);
          setProgressData(pData);
        }
      } catch (err) {
        console.warn('Error loading student LMS data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // When selected course changes, load full course detail with modules & lessons
  useEffect(() => {
    if (selectedCourse?.id) {
      lmsService.getCourseById(selectedCourse.id).then((data) => {
        setCourseDetail(data);
        if (data?.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(data.modules[0].lessons[0]);
        }
      });
    }
  }, [selectedCourse]);

  // Handle Mark Lesson Complete
  const handleCompleteLesson = async (lessonId) => {
    if (!lessonId || completingLesson) return;
    try {
      setCompletingLesson(true);
      const res = await lmsService.completeLesson(lessonId);
      if (res.success) {
        // Refresh course detail
        const updated = await lmsService.getCourseById(selectedCourse.id);
        setCourseDetail(updated);
        // Refresh courses list
        const updatedCourses = await lmsService.getCourses();
        setCourses(updatedCourses);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setCompletingLesson(false);
    }
  };

  // Handle Quiz Start
  const handleStartQuiz = async (quiz) => {
    try {
      const fullQuiz = await lmsService.getQuizById(quiz.id);
      setActiveQuiz(fullQuiz);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (err) {
      console.error('Error loading quiz:', err);
    }
  };

  // Handle Quiz Submit
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmittingQuiz(true);
      const res = await lmsService.submitQuiz(activeQuiz.id, quizAnswers);
      setQuizResult(res);
      // Refresh quizzes
      const qList = await lmsService.getQuizzes();
      setQuizzes(qList);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Handle Assignment Submit (supports real multipart file upload)
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;
    try {
      const formData = new FormData();
      formData.append('submissionText', submissionForm.text || '');
      formData.append('githubUrl', submissionForm.githubUrl || '');
      if (submissionFile) {
        formData.append('file', submissionFile);
      } else if (submissionForm.fileName) {
        formData.append('fileName', submissionForm.fileName);
      }
      await lmsService.submitAssignment(activeAssignment.id, formData);
      showToast('Assignment submitted successfully for faculty evaluation!', 'success');
      setActiveAssignment(null);
      setSubmissionFile(null);
      setSubmissionForm({ text: '', githubUrl: '', fileName: '' });
      const aList = await lmsService.getAssignments();
      setAssignments(aList);
      const pData = await lmsService.getStudentProgress().catch(() => null);
      if (pData) setProgressData(pData);
    } catch (err) {
      showToast('Failed to submit assignment: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Handle Create Discussion Question / Doubt
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussion.title.trim() || !newDiscussion.message.trim()) return;
    try {
      await lmsService.createDiscussion({
        courseId: selectedCourse?.id || courses[0]?.id || 1,
        title: newDiscussion.title.trim(),
        message: newDiscussion.message.trim(),
      });
      showToast('Technical question posted to course discussion board!', 'success');
      setNewDiscussion({ title: '', message: '' });
      setShowNewDiscussion(false);
      const dList = await lmsService.getDiscussions();
      setDiscussions(dList);
    } catch (err) {
      showToast('Error creating discussion: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Handle Discussion Reply
  const handleReplyDiscussion = async (discId) => {
    const text = replyText[discId];
    if (!text || !text.trim()) return;
    try {
      await lmsService.replyDiscussion(discId, text.trim());
      setReplyText(prev => ({ ...prev, [discId]: '' }));
      const dList = await lmsService.getDiscussions();
      setDiscussions(dList);
    } catch (err) {
      console.error('Error replying to discussion:', err);
    }
  };

  // Handle Save Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    try {
      await lmsService.saveNote({
        courseId: selectedCourse?.id || courses[0]?.id || 1,
        title: newNote.title,
        noteContent: newNote.content,
        isBookmarked: true,
      });
      setNewNote({ title: '', content: '' });
      const nList = await lmsService.getNotes();
      setNotes(nList);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  // Handle Delete Note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await lmsService.deleteNote(noteId);
      const nList = await lmsService.getNotes();
      setNotes(nList);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Handle Support Ticket Submit
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
    try {
      await lmsService.createSupportTicket({
        courseId: selectedCourse?.id || null,
        ...newTicket,
      });
      showToast('Support ticket created! The academic support team will respond shortly.', 'success');
      setNewTicket({ subject: '', category: 'COURSE_ACCESS', description: '', priority: 'MEDIUM' });
      const tList = await lmsService.getSupportTickets();
      setTickets(tList);
    } catch (err) {
      showToast('Error creating support ticket: ' + err.message, 'error');
    }
  };

  // 1. My Learning Sub-Page
  const renderMyLearning = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Enrolled Courses & Active Learning</h2>
          <p className="text-xs text-muted-foreground">
            Track your semester coursework, lesson completion, and verified skill outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/skill-analyzer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Map to Skill Profile</span>
          </Link>
          <Link
            to="/domains"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Career Domains</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-card rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md ${
              selectedCourse?.id === course.id ? 'border-primary ring-1 ring-primary/30' : 'border-border'
            }`}
          >
            <div>
              <div className="relative h-40 w-full overflow-hidden bg-neutral-900">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                    {course.course_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-primary-foreground backdrop-blur-md">
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.category}</span>
                  <span>{course.duration_hours} hrs content</span>
                </div>

                <h3 className="text-base font-bold text-foreground line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-foreground">
                      {course.progressPercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        course.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${course.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCourse(course);
                  onSelectSection('materials');
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 2. Course Materials Sub-Page (Video player, PDF & lesson viewer)
  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {courseDetail?.course_code || selectedCourse?.course_code}
          </span>
          <h2 className="text-xl font-bold text-foreground">
            {courseDetail?.title || selectedCourse?.title}
          </h2>
        </div>

        {/* Course Switcher */}
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const found = courses.find((c) => c.id === parseInt(e.target.value, 10));
            if (found) setSelectedCourse(found);
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground cursor-pointer"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_code}: {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Lesson Viewer */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Active Lesson Module
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {activeLesson?.title || 'Select a lesson to begin'}
                </h3>
              </div>
              {activeLesson?.isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <button
                  type="button"
                  disabled={completingLesson}
                  onClick={() => handleCompleteLesson(activeLesson?.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completingLesson ? 'Saving...' : 'Mark as Completed'}</span>
                </button>
              )}
            </div>

            {/* Video or Document Container */}
            <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 p-1">
              {activeLesson?.lesson_type === 'VIDEO' ? (
                <div className="aspect-video w-full flex items-center justify-center relative">
                  <div className="text-center space-y-3 p-6 text-white">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md">
                      <Play className="w-8 h-8 fill-current text-white translate-x-0.5" />
                    </div>
                    <p className="text-sm font-semibold">{activeLesson.title}</p>
                    <a
                      href={activeLesson.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                    >
                      <span>Open streaming video lecture</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-foreground bg-card rounded-lg min-h-[260px] space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Technical Reference & Learning Document</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {activeLesson?.content || 'Study the architecture diagrams, component lifecycles, and code patterns covered in this lesson.'}
                  </p>
                  {activeLesson?.resource_url && (
                    <div className="pt-2">
                      <a
                        href={activeLesson.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Official Documentation</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Downloadable Resources */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <span>Faculty Course Resources & Downloadable Materials</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(courseDetail?.resources || []).map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{res.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{res.file_type} • {res.file_size_kb} KB</p>
                  </div>
                  <a
                    href={res.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-card border border-border hover:bg-secondary text-foreground text-xs font-bold shrink-0"
                    title="Download Resource"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
              {(!courseDetail?.resources || courseDetail.resources.length === 0) && (
                <div className="col-span-1 sm:col-span-2 text-center p-6 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                  No reference documents or lecture decks published yet for this course.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Modules & Lessons Syllabus Accordion */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Course Syllabus Modules</span>
            </h4>

            <div className="space-y-3">
              {(courseDetail?.modules || []).map((mod, modIdx) => (
                <div key={mod.id} className="border border-border/80 rounded-xl overflow-hidden">
                  <div className="p-3 bg-secondary/50 font-bold text-xs text-foreground flex items-center justify-between">
                    <span className="truncate">{mod.title}</span>
                    <span className="text-[10px] text-muted-foreground">{mod.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="p-1 space-y-1 bg-card">
                    {(mod.lessons || []).map((les) => (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => setActiveLesson(les)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          activeLesson?.id === les.id
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {les.lesson_type === 'VIDEO' ? (
                            <Play className="w-3 h-3 shrink-0" />
                          ) : (
                            <FileText className="w-3 h-3 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        {les.isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {(!courseDetail?.modules || courseDetail.modules.length === 0) && (
                <div className="text-center p-6 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                  No syllabus modules configured yet for this course.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. Quizzes & Assessments View
  const renderQuizzes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Assigned Quizzes & Knowledge Checks</h2>
          <p className="text-xs text-muted-foreground">
            Complete objective assessments to verify your skills and unlock placement credentials.
          </p>
        </div>
      </div>

      {activeQuiz ? (
        /* Quiz Taking Screen */
        <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Timed Assessment
              </span>
              <h3 className="text-lg font-bold text-foreground">{activeQuiz.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveQuiz(null)}
              className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
            >
              Exit Quiz
            </button>
          </div>

          {quizResult ? (
            /* Results Screen */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div
                className={`p-6 rounded-2xl border text-center space-y-3 ${
                  quizResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="text-3xl font-black">{quizResult.percentage}%</div>
                <p className="font-bold text-sm">{quizResult.message}</p>
                <p className="text-xs">
                  Score: {quizResult.score} / {quizResult.maxScore} marks
                </p>
              </div>

              {/* Review questions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground">Question-by-Question Review</h4>
                {quizResult.review?.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Question {idx + 1}</span>
                      <span className={rev.isCorrect ? 'text-emerald-500' : 'text-red-500'}>
                        {rev.isCorrect ? '✓ Correct (+2)' : '✗ Incorrect (0)'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.explanation}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                className="w-full py-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
              >
                Return to Quizzes Roster
              </button>
            </div>
          ) : (
            /* Questions Form */
            <div className="space-y-6">
              {activeQuiz.questions?.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-bold text-foreground">
                      {idx + 1}. {q.questionText}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                      {q.marks} mark(s)
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          quizAnswers[q.id] === opt
                            ? 'border-primary bg-primary/10 text-foreground font-semibold'
                            : 'border-border bg-card hover:bg-secondary text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={quizAnswers[q.id] === opt}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                          className="accent-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                disabled={submittingQuiz}
                onClick={handleSubmitQuiz}
                className="w-full py-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {submittingQuiz ? 'Evaluating on Server...' : 'Submit Assessment Answers'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quizzes List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-bold text-primary">{quiz.course_code}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.time_limit_minutes} mins
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{quiz.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                  <span>Questions: {quiz.question_count}</span>
                  <span>Max Marks: {quiz.total_marks}</span>
                  <span>Pass: {quiz.passing_score}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                {quiz.hasPassed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Passed ({quiz.bestPercentage}%)
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Attempts: {quiz.attemptsTaken || 0} / {quiz.max_attempts}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleStartQuiz(quiz)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {quiz.attemptsTaken > 0 ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 4. Assignments & Capstones View
  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Assignments & Capstone Submissions</h2>
          <p className="text-xs text-muted-foreground">
            Submit your project source code, GitHub repositories, and documentation for faculty review.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((assign) => (
          <div key={assign.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-primary">{assign.course_code}</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(assign.due_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{assign.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {assign.description}
              </p>
              <div className="p-3 rounded-xl bg-secondary text-xs text-foreground font-mono">
                Instructions: {assign.instructions}
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-3">
              {assign.hasSubmitted ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Status: {assign.submission?.status}</span>
                    {assign.submission?.grade && <span>Score: {assign.submission.grade}/100</span>}
                  </div>
                  {assign.submission?.feedback && (
                    <p className="text-muted-foreground italic">
                      Faculty Feedback: "{assign.submission.feedback}"
                    </p>
                  )}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setActiveAssignment(assign)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {assign.hasSubmitted ? 'Resubmit Project Work' : 'Submit Assignment Code / URL'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Submission Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Submit: {activeAssignment.title}</h3>
              <button
                type="button"
                onClick={() => setActiveAssignment(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">GitHub Repository Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/aditya/capstone-repo"
                  value={submissionForm.githubUrl}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Project Description & Architecture Notes</label>
                <textarea
                  rows={3}
                  placeholder="Explain your approach, technologies utilized, and testing instructions..."
                  value={submissionForm.text}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Attach Solution File / Archive (.zip, .pdf, .py, .docx)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-primary file:text-primary-foreground cursor-pointer"
                />
                {submissionFile && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Attached: {submissionFile.name} ({(submissionFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 5. Learning Paths View
  const renderLearningPaths = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Structured Career Learning Journeys</h2>
        <p className="text-xs text-muted-foreground">
          Step-by-step roadmaps aligned with corporate placement profiles and recruitment benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map((lp) => (
          <div key={lp.id} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {lp.estimated_weeks} Weeks Curriculum
              </span>
              <h3 className="text-lg font-bold text-foreground">{lp.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{lp.description}</p>
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Path Milestones
              </h4>
              <div className="space-y-2">
                {(lp.milestones || []).map((m, idx) => {
                  const isDone = (lp.completedMilestones || []).includes(m.id);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isDone
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                          : 'border-border bg-neutral-50 dark:bg-neutral-900 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Milestone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold truncate">{m.title}</span>
                      </div>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Path Progress: {lp.progressPercentage || 0}%
              </span>
              <Link
                to="/skill-analyzer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Verify Skills in Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. My Progress View
  const renderProgress = () => {
    const pCourses = progressData?.courses || courses;
    const pAttendance = progressData?.attendance || [];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Learning Progress & Academic Analytics</h2>
          <p className="text-xs text-muted-foreground">
            Comprehensive breakdown of your completed modules, quiz passing rates, and placement readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Total Courses Enrolled</p>
            <p className="text-2xl font-black text-foreground">{pCourses.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Completed Courses</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {pCourses.filter((c) => c.enrollment_status === 'COMPLETED' || c.enrollmentStatus === 'COMPLETED').length}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Verified Certificates</p>
            <p className="text-2xl font-black text-primary">{certificates.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Live Lectures Attended</p>
            <p className="text-2xl font-black text-foreground">
              {pAttendance.filter((a) => a.status === 'PRESENT').length} / {pAttendance.length}
            </p>
          </div>
        </div>

        {/* Course-by-course performance */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground">Course-by-Course Learning Performance</h3>
          <div className="space-y-4">
            {pCourses.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">{c.course_code}: {c.title}</span>
                  <span className="text-primary">{c.progress_percentage ?? c.progressPercentage ?? 0}% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${c.progress_percentage ?? c.progressPercentage ?? 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-muted-foreground">
                  <div>Lessons: <strong className="text-foreground">{c.completed_lessons || 0} / {c.total_lessons || 0}</strong></div>
                  <div>Avg Quiz: <strong className="text-foreground">{c.avg_quiz_score ? `${c.avg_quiz_score}%` : 'N/A'}</strong></div>
                  <div>Avg Assignment: <strong className="text-foreground">{c.avg_assignment_grade ? `${c.avg_assignment_grade}/100` : 'N/A'}</strong></div>
                  <div>Status: <span className="font-bold uppercase text-primary">{c.enrollment_status || c.enrollmentStatus || 'ENROLLED'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attendance Matrix */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center justify-between">
            <span>Verified Live Class Attendance History</span>
            <span className="text-xs font-normal text-muted-foreground">{pAttendance.length} Session(s) Recorded</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Live Session Topic</th>
                  <th className="py-2.5 px-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pAttendance.map((rec, i) => (
                  <tr key={i} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {new Date(rec.start_time).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-primary">{rec.course_code}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{rec.class_title}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : rec.status === 'LATE'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pAttendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No live attendance sessions recorded yet for your enrolled courses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 7. Live Classes View
  const renderLiveClasses = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Live Classes & Virtual Lecture Calendar</h2>
        <p className="text-xs text-muted-foreground">
          Join scheduled interactive masterclasses and video Q&A sessions with department faculty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {liveClasses.map((lc) => (
          <div key={lc.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">{lc.course_code}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {lc.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{lc.title}</h3>
              <p className="text-xs text-muted-foreground">
                Instructor: Prof. {lc.instructor_first} {lc.instructor_last}
              </p>
              <div className="flex items-center gap-2 text-xs text-foreground font-semibold">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{new Date(lc.start_time).toLocaleString()} ({lc.duration_minutes} mins)</span>
              </div>
            </div>

            <a
              href={lc.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xs"
            >
              <Video className="w-4 h-4" />
              <span>Join Live Video Class</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  // 8. Discussions View
  const renderDiscussions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Course Discussions & Faculty Q&A</h2>
          <p className="text-xs text-muted-foreground">
            Ask technical questions, resolve implementation doubts, and review faculty answers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showNewDiscussion ? 'Cancel Question' : 'Ask Question / Doubt'}</span>
        </button>
      </div>

      {showNewDiscussion && (
        <form onSubmit={handleCreateDiscussion} className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs animate-in fade-in">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">New Academic Doubt / Question</h4>
          <input
            type="text"
            placeholder="Doubt title (e.g. Clarification on Redis caching strategy in Module 2)"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
            required
          />
          <textarea
            rows={3}
            placeholder="Detailed description of your question or error encountered..."
            value={newDiscussion.message}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, message: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewDiscussion(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-xs"
            >
              Post Doubt to Course Board
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {discussions.map((disc) => (
          <div key={disc.id} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{disc.course_title}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(disc.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{disc.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{disc.message}</p>
            </div>

            {/* Replies */}
            <div className="space-y-2.5 pl-4 border-l-2 border-primary/40 pt-2">
              {(disc.replies || []).map((rep) => (
                <div key={rep.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground">{rep.first_name} {rep.last_name}</span>
                    {rep.is_faculty_answer ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground font-bold">
                        Faculty Answer
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{rep.reply_text}</p>
                </div>
              ))}

              {/* Reply Box */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type your response or question..."
                  value={replyText[disc.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [disc.id]: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleReplyDiscussion(disc.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {discussions.length === 0 && (
          <div className="text-center p-8 rounded-2xl border border-dashed border-border bg-card text-xs text-muted-foreground">
            No technical doubts posted yet. Click "Ask Question / Doubt" above to begin a discussion with faculty.
          </div>
        )}
      </div>
    </div>
  );

  // 9. Notes & Bookmarks View
  const renderNotes = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">My Personal Notes & Bookmarked Resources</h2>
        <p className="text-xs text-muted-foreground">
          Quick revisions, algorithmic snippets, and bookmarks saved while studying lessons.
        </p>
      </div>

      {/* New Note Form */}
      <form onSubmit={handleSaveNote} className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Save New Learning Note</h4>
        <input
          type="text"
          placeholder="Note title (e.g. React 19 Actions Syntax)"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
          required
        />
        <textarea
          rows={3}
          placeholder="Write your personal study summary or memory aid..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-xs"
          >
            Save to My Notes
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold text-primary">{n.course_code || 'General'}</span>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
                <button
                  type="button"
                  onClick={() => handleDeleteNote(n.id)}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-sm font-bold text-foreground">{n.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{n.note_content}</p>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-2 text-center p-8 rounded-2xl border border-dashed border-border bg-card text-xs text-muted-foreground">
            No personal notes saved yet. Write revision summaries or algorithmic snippets above.
          </div>
        )}
      </div>
    </div>
  );

  // 10. Certificates & Achievements View
  const renderCertificates = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Verified Certificates & Academic Credentials</h2>
        <p className="text-xs text-muted-foreground">
          Official institutional completion credentials cryptographically verified against coursework requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-card rounded-2xl border-2 border-primary/30 p-6 shadow-sm relative overflow-hidden space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Academic Credential
                </span>
                <h3 className="text-lg font-bold text-foreground">{cert.course_title}</h3>
                <p className="text-xs text-muted-foreground">Issued to: {cert.first_name} {cert.last_name} ({cert.register_number})</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary space-y-1 font-mono text-[11px] text-muted-foreground">
              <p>Certificate ID: <strong className="text-foreground">{cert.id}</strong></p>
              <p>Issued: {new Date(cert.issue_date).toLocaleDateString()} • Grade: {cert.grade_achieved}</p>
              <p className="truncate">Hash: {cert.verification_hash}</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                to="/skill-analyzer"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Synced to Skill Analyzer</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </Link>
              <button
                type="button"
                onClick={() => showToast(`Certificate #${cert.id} verified and ready for download. Generating credentials...`, 'info')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-xs"
              >
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 11. LMS Notifications View
  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Academic Notifications & Deadline Alerts</h2>
        <p className="text-xs text-muted-foreground">
          Real-time updates regarding released grades, quiz deadlines, and new faculty study materials.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 rounded-xl border border-border bg-card text-center space-y-2">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
            <h4 className="text-sm font-bold text-foreground">No LMS Notifications</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are all caught up. If LMS alerts are muted, you can adjust your preferences in Settings.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-4 rounded-xl border border-border bg-card flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
                <span className="text-[10px] text-muted-foreground">{new Date(notif.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 12. Portfolio Projects View
  const renderPortfolio = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Capstone Projects & Verified Portfolio</h2>
        <p className="text-xs text-muted-foreground">
          Showcase projects built throughout your coursework with direct links for hiring recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolio.map((proj) => (
          <div key={proj.id} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{proj.course_title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Faculty Approved
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{proj.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(proj.technologies || []).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-foreground">
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3">
              {proj.github_url && (
                <a
                  href={proj.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-card hover:bg-secondary text-foreground"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {proj.live_demo_url && (
                <a
                  href={proj.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 13. Help & Support View
  const renderSupport = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">LMS Help Desk & Academic Ticket Tracking</h2>
        <p className="text-xs text-muted-foreground">
          Raise issues concerning video playback, quiz evaluations, or course enrollment permissions.
        </p>
      </div>

      {/* Ticket form */}
      <form onSubmit={handleCreateTicket} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4 max-w-xl">
        <h4 className="text-sm font-bold text-foreground">Raise Support Ticket</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Category</label>
            <select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
            >
              <option value="COURSE_ACCESS">Course Access</option>
              <option value="VIDEO_PLAYBACK">Video Playback</option>
              <option value="QUIZ_SUBMISSION">Quiz Submission</option>
              <option value="ASSIGNMENT_UPLOAD">Assignment Upload</option>
              <option value="CERTIFICATE">Certificate Issue</option>
              <option value="OTHER">Other Query</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Priority</label>
            <select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">Subject</label>
          <input
            type="text"
            placeholder="Brief summary of the issue..."
            value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">Detailed Description</label>
          <textarea
            rows={3}
            placeholder="Describe what occurred, error messages, and browser information..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
        >
          Submit Support Ticket
        </button>
      </form>

      {/* Ticket History */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">Past Support Requests</h4>
        {tickets.map((t) => (
          <div key={t.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{t.subject}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary text-foreground">
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                t.status === 'RESOLVED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeSection === 'my-learning' && renderMyLearning()}
      {activeSection === 'materials' && renderMaterials()}
      {activeSection === 'quizzes' && renderQuizzes()}
      {activeSection === 'assignments' && renderAssignments()}
      {activeSection === 'learning-paths' && renderLearningPaths()}
      {activeSection === 'progress' && renderProgress()}
      {activeSection === 'live-classes' && renderLiveClasses()}
      {activeSection === 'discussions' && renderDiscussions()}
      {activeSection === 'notes' && renderNotes()}
      {activeSection === 'certificates' && renderCertificates()}
      {activeSection === 'notifications' && renderNotifications()}
      {activeSection === 'portfolio' && renderPortfolio()}
      {activeSection === 'support' && renderSupport()}
    </div>
  );
}

export default StudentViews;
