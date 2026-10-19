import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderPlus,
  HelpCircle,
  FileCheck2,
  Users,
  Layers,
  Video,
  MessagesSquare,
  Award,
  Bell,
  PieChart,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Filter,
  BarChart3,
  ExternalLink,
  Download,
  Trash2,
  Edit3,
  Play,
  X,
  Search,
  Check,
  AlertCircle,
  FileUp,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Code2,
  Terminal,
} from 'lucide-react';
import lmsService from '../../../services/lmsService';
import { useToast } from '../../../context/ToastContext';

export function FacultyViews({ activeSection, onSelectSection }) {
  const { showToast } = useToast();

  // Core data states
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [codingAssessments, setCodingAssessments] = useState([]);
  const [assessmentFilterType, setAssessmentFilterType] = useState('ALL');
  const [assignments, setAssignments] = useState([]);
  const [gradingQueue, setGradingQueue] = useState([]);
  const [resources, setResources] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [gradingStatusFilter, setGradingStatusFilter] = useState('ALL');
  const [selectedCourseIdFilter, setSelectedCourseIdFilter] = useState('');
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('ALL');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'create-course' | 'upload-resource' | 'create-quiz' | 'quiz-attempts' | 'create-assignment' | 'grade-submission' | 'create-path' | 'schedule-live' | 'live-attendance' | 'create-announcement' | 'issue-cert' | 'view-students'
  
  // Modal working states
  const [selectedQuizForAttempts, setSelectedQuizForAttempts] = useState(null);
  const [quizAttemptsList, setQuizAttemptsList] = useState([]);
  const [isCodingSubmissionModal, setIsCodingSubmissionModal] = useState(false);
  const [activeGradingSubmission, setActiveGradingSubmission] = useState(null);
  const [activeLiveClassForAttendance, setActiveLiveClassForAttendance] = useState(null);
  const [liveAttendanceRoster, setLiveAttendanceRoster] = useState([]);
  const [enrolledStudentsList, setEnrolledStudentsList] = useState([]);

  // Forms
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    course_code: '',
    description: '',
    category: 'Full Stack Engineering',
    level: 'INTERMEDIATE',
    duration_hours: 24,
    passing_percentage: 60,
    status: 'PUBLISHED',
  });

  const [resourceUploadForm, setResourceUploadForm] = useState({
    title: '',
    courseId: '',
    fileType: 'PDF',
    isExternal: false,
    externalUrl: '',
    description: '',
    targetSection: 'ALL',
    file: null,
  });

  const [quizBuilderForm, setQuizBuilderForm] = useState({
    assessmentType: 'QUIZ', // 'QUIZ' | 'PROGRAMMING'
    courseId: '',
    title: '',
    description: '',
    instructions: 'Select the best option. Answer all questions within the time limit.',
    timeLimitMinutes: 30,
    maxAttempts: 3,
    passingScore: 70,
    dueDate: '',
    isPublished: true,
    difficulty: 'MEDIUM',
    problemStatement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    hiddenInput: '',
    hiddenOutput: '',
    questions: [
      {
        questionText: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 2,
        explanation: '',
      },
    ],
  });

  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    description: '',
    instructions: 'Submit your solution code as a ZIP archive or GitHub link.',
    maxMarks: 100,
    dueDate: '',
    allowedFileTypes: 'pdf,zip,docx,py,js,java,cpp',
    allowLateSubmissions: true,
    allowResubmissions: true,
    isPublished: true,
  });

  const [gradingForm, setGradingForm] = useState({
    grade: 85,
    feedback: 'Good implementation of requirements. Well structured.',
    releaseResults: true,
  });

  const [newLiveClass, setNewLiveClass] = useState({
    courseId: '',
    title: '',
    startTime: '',
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/campuscorp-masterclass',
  });

  const [learningPathForm, setLearningPathForm] = useState({
    title: '',
    description: '',
    estimatedWeeks: 8,
    targetRoleId: 'fullstack-engineer',
    milestones: 'HTML/CSS/JS Foundations, Node.js & REST APIs, React & State Architecture, Production Capstone',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    courseId: '',
    title: '',
    content: '',
    priority: 'NORMAL',
  });

  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load all faculty LMS data
  const loadAllFacultyData = async () => {
    try {
      setLoading(true);
      const [dash, cList, qList, aList, gQueue, rList, prog, lpList, lcList, dList, certList, annList, rep, codingList] =
        await Promise.all([
          lmsService.getDashboard(),
          lmsService.getCourses(),
          lmsService.getQuizzes(),
          lmsService.getAssignments(),
          lmsService.getGradingQueue(),
          lmsService.getResources(),
          lmsService.getStudentProgress(),
          lmsService.getLearningPaths(),
          lmsService.getLiveClasses(),
          lmsService.getDiscussions(),
          lmsService.getCertificates(),
          lmsService.getAnnouncements(),
          lmsService.getReports(),
          lmsService.getCodingAssessments().catch(() => []),
        ]);

      setDashboardData(dash);
      setCourses(cList);
      if (cList.length > 0 && !selectedCourse) {
        setSelectedCourse(cList[0]);
        setResourceUploadForm((prev) => ({ ...prev, courseId: cList[0].id }));
        setQuizBuilderForm((prev) => ({ ...prev, courseId: cList[0].id }));
        setAssignmentForm((prev) => ({ ...prev, courseId: cList[0].id }));
        setNewLiveClass((prev) => ({ ...prev, courseId: cList[0].id }));
        setAnnouncementForm((prev) => ({ ...prev, courseId: cList[0].id }));
      }
      setQuizzes(qList);
      setCodingAssessments(codingList || []);
      setAssignments(aList);
      setGradingQueue(gQueue);
      setResources(rList);
      setStudentProgress(prog || []);
      setLearningPaths(lpList);
      setLiveClasses(lcList);
      setDiscussions(dList);
      setCertificates(certList);
      setAnnouncements(annList);
      setReports(rep);
    } catch (err) {
      console.warn('Error loading faculty LMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFacultyData();
  }, []);

  // Update resource list when course filter changes
  useEffect(() => {
    if (selectedCourseIdFilter) {
      lmsService.getResources({ courseId: selectedCourseIdFilter }).then(setResources);
      lmsService.getGradingQueue({ courseId: selectedCourseIdFilter, status: gradingStatusFilter }).then(setGradingQueue);
    }
  }, [selectedCourseIdFilter, gradingStatusFilter]);

  // Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await lmsService.createCourse(newCourseForm);
      showToast('Course successfully created and registered in curriculum catalog!', 'success');
      setActiveModal(null);
      setNewCourseForm({
        title: '',
        course_code: '',
        description: '',
        category: 'Full Stack Engineering',
        level: 'INTERMEDIATE',
        duration_hours: 24,
        passing_percentage: 60,
        status: 'PUBLISHED',
      });
      await loadAllFacultyData();
    } catch (err) {
      showToast('Error creating course: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Resource Upload
  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!resourceUploadForm.title.trim()) {
      showToast('Please enter a resource title.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const courseId = resourceUploadForm.courseId || courses[0]?.id;

      if (!resourceUploadForm.isExternal && resourceUploadForm.file) {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('title', resourceUploadForm.title);
        formData.append('targetSection', resourceUploadForm.targetSection);
        formData.append('description', resourceUploadForm.description);
        formData.append('file', resourceUploadForm.file);
        await lmsService.uploadResource(formData);
      } else {
        await lmsService.uploadResource({
          courseId,
          title: resourceUploadForm.title,
          targetSection: resourceUploadForm.targetSection,
          description: resourceUploadForm.description,
          externalUrl: resourceUploadForm.externalUrl || 'https://developer.mozilla.org',
          fileType: resourceUploadForm.fileType,
        });
      }

      showToast('Learning resource published to students successfully!', 'success');
      setActiveModal(null);
      setResourceUploadForm({
        title: '',
        courseId: courses[0]?.id || '',
        fileType: 'PDF',
        isExternal: false,
        externalUrl: '',
        description: '',
        targetSection: 'ALL',
        file: null,
      });
      const rList = await lmsService.getResources();
      setResources(rList);
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
    } catch (err) {
      showToast('Error uploading resource: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Resource Deletion
  const handleDeleteResource = async (resId) => {
    if (!confirm('Are you sure you want to remove this learning resource from the course?')) return;
    try {
      await lmsService.deleteResource(resId);
      setResources((prev) => prev.filter((r) => r.id !== resId));
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
      showToast('Resource removed successfully.', 'info');
    } catch (err) {
      showToast('Error deleting resource: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Handle Quiz & Coding Assessment Creation
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizBuilderForm.title.trim()) {
      showToast('Please enter an assessment title.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const courseId = quizBuilderForm.courseId || courses[0]?.id;

      if (quizBuilderForm.assessmentType === 'PROGRAMMING') {
        const sampleTestCases = quizBuilderForm.sampleInput
          ? [{ input: quizBuilderForm.sampleInput, output: quizBuilderForm.sampleOutput }]
          : [{ input: '4 9\n2 7 11 15', output: '0 1' }];
        const hiddenTestCases = quizBuilderForm.hiddenInput
          ? [{ input: quizBuilderForm.hiddenInput, output: quizBuilderForm.hiddenOutput }]
          : [{ input: '3 6\n3 2 4', output: '1 2' }];

        await lmsService.createCodingAssessment({
          title: quizBuilderForm.title,
          description: quizBuilderForm.description,
          durationMinutes: quizBuilderForm.timeLimitMinutes || 60,
          totalScore: quizBuilderForm.passingScore ? Math.max(quizBuilderForm.passingScore, 100) : 100,
          questions: [
            {
              title: quizBuilderForm.title,
              difficulty: quizBuilderForm.difficulty || 'MEDIUM',
              problemStatement: quizBuilderForm.problemStatement || quizBuilderForm.description || 'Solve algorithmic task within runtime constraints.',
              inputFormat: quizBuilderForm.inputFormat,
              outputFormat: quizBuilderForm.outputFormat,
              constraints: quizBuilderForm.constraints,
              points: 100,
              sampleTestCases,
              hiddenTestCases,
            },
          ],
        });
        showToast('Programming assessment created and registered in CodeSprint engine!', 'success');
        const cList = await lmsService.getCodingAssessments().catch(() => []);
        setCodingAssessments(cList || []);
      } else {
        await lmsService.createQuiz({
          ...quizBuilderForm,
          courseId,
        });
        showToast('Quiz assessment successfully built and published to students!', 'success');
        const qList = await lmsService.getQuizzes();
        setQuizzes(qList);
      }

      setActiveModal(null);
      setQuizBuilderForm({
        assessmentType: 'QUIZ',
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        instructions: 'Select the best option. Answer all questions within the time limit.',
        timeLimitMinutes: 30,
        maxAttempts: 3,
        passingScore: 70,
        dueDate: '',
        isPublished: true,
        difficulty: 'MEDIUM',
        problemStatement: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        sampleInput: '',
        sampleOutput: '',
        hiddenInput: '',
        hiddenOutput: '',
        questions: [
          {
            questionText: '',
            questionType: 'MCQ',
            options: ['', '', '', ''],
            correctAnswer: '',
            marks: 2,
            explanation: '',
          },
        ],
      });
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
    } catch (err) {
      showToast('Error saving assessment: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Open Quiz Attempts
  const handleOpenQuizAttempts = async (quiz) => {
    try {
      setSelectedQuizForAttempts(quiz);
      setIsCodingSubmissionModal(false);
      const attempts = await lmsService.getQuizAttempts(quiz.id);
      setQuizAttemptsList(attempts);
      setActiveModal('quiz-attempts');
    } catch (err) {
      showToast('Error fetching quiz attempts: ' + err.message, 'error');
    }
  };

  // Handle Open Coding Submissions
  const handleOpenCodingSubmissions = async (assessment) => {
    try {
      setSelectedQuizForAttempts(assessment);
      setIsCodingSubmissionModal(true);
      const subs = await lmsService.getCodingSubmissions(assessment.id);
      setQuizAttemptsList(subs);
      setActiveModal('quiz-attempts');
    } catch (err) {
      showToast('Error fetching coding submissions: ' + err.message, 'error');
    }
  };

  // Handle Assignment Creation
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title.trim() || !assignmentForm.dueDate) {
      showToast('Please provide assignment title and submission due date.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const courseId = assignmentForm.courseId || courses[0]?.id;
      await lmsService.createAssignment({
        ...assignmentForm,
        courseId,
      });
      showToast('Assignment created and published to students!', 'success');
      setActiveModal(null);
      setAssignmentForm({
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        instructions: 'Submit your solution code as a ZIP archive or GitHub link.',
        maxMarks: 100,
        dueDate: '',
        allowedFileTypes: 'pdf,zip,docx,py,js,java,cpp',
        allowLateSubmissions: true,
        allowResubmissions: true,
        isPublished: true,
      });
      const aList = await lmsService.getAssignments();
      setAssignments(aList);
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
    } catch (err) {
      showToast('Error creating assignment: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Grade Submission in Queue
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!activeGradingSubmission) return;
    try {
      setSubmitting(true);
      await lmsService.gradeAssignment(activeGradingSubmission.id, {
        grade: gradingForm.grade,
        feedback: gradingForm.feedback,
        releaseResults: gradingForm.releaseResults,
      });
      showToast(
        gradingForm.releaseResults
          ? 'Grade and evaluation feedback saved & released to student!'
          : 'Grade saved as draft. You can release results when ready.',
        'success'
      );
      setActiveModal(null);
      setActiveGradingSubmission(null);
      const gQueue = await lmsService.getGradingQueue();
      setGradingQueue(gQueue);
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
      const aList = await lmsService.getAssignments();
      setAssignments(aList);
    } catch (err) {
      showToast('Error grading assignment: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Direct Result Release
  const handleReleaseResult = async (submissionId) => {
    try {
      await lmsService.releaseAssignmentResult(submissionId);
      showToast('Results released to student!', 'success');
      const gQueue = await lmsService.getGradingQueue();
      setGradingQueue(gQueue);
    } catch (err) {
      showToast('Error releasing result: ' + err.message, 'error');
    }
  };

  // Handle Schedule Live Class
  const handleScheduleLive = async (e) => {
    e.preventDefault();
    if (!newLiveClass.title.trim() || !newLiveClass.startTime) {
      showToast('Please provide title and scheduled start time.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const courseId = newLiveClass.courseId || courses[0]?.id;
      await lmsService.scheduleLiveClass({
        ...newLiveClass,
        courseId,
      });
      showToast('Live masterclass scheduled and published to student calendar!', 'success');
      setActiveModal(null);
      setNewLiveClass({
        courseId: courses[0]?.id || '',
        title: '',
        startTime: '',
        durationMinutes: 60,
        meetingLink: 'https://meet.google.com/campuscorp-masterclass',
      });
      const lcList = await lmsService.getLiveClasses();
      setLiveClasses(lcList);
      const dash = await lmsService.getDashboard();
      setDashboardData(dash);
    } catch (err) {
      showToast('Error scheduling live class: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Open Live Attendance Roster
  const handleOpenLiveAttendance = async (liveClass) => {
    try {
      setActiveLiveClassForAttendance(liveClass);
      const res = await lmsService.getLiveClassAttendance(liveClass.id);
      setLiveAttendanceRoster(
        (res.data || []).map((s) => ({
          studentId: s.student_id,
          name: `${s.first_name} ${s.last_name}`,
          registerNumber: s.register_number,
          department: s.department_code,
          status: s.attendance_status || 'PRESENT',
          notes: s.notes || '',
        }))
      );
      setActiveModal('live-attendance');
    } catch (err) {
      showToast('Error loading attendance roster: ' + err.message, 'error');
    }
  };

  // Handle Save Live Attendance
  const handleSaveLiveAttendance = async () => {
    if (!activeLiveClassForAttendance) return;
    try {
      setSubmitting(true);
      const records = liveAttendanceRoster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        notes: r.notes,
      }));
      await lmsService.recordLiveClassAttendance(activeLiveClassForAttendance.id, records);
      showToast('Attendance records successfully saved and verified!', 'success');
      setActiveModal(null);
      const lcList = await lmsService.getLiveClasses();
      setLiveClasses(lcList);
    } catch (err) {
      showToast('Error saving attendance: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle View Course Students
  const handleViewStudents = async (course) => {
    try {
      setSelectedCourse(course);
      const students = await lmsService.getCourseStudents(course.id);
      setEnrolledStudentsList(students);
      setActiveModal('view-students');
    } catch (err) {
      showToast('Error loading course students: ' + err.message, 'error');
    }
  };

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    try {
      setSubmitting(true);
      await lmsService.createAnnouncement(announcementForm);
      showToast('Course announcement broadcast to students successfully!', 'success');
      setActiveModal(null);
      setAnnouncementForm({
        courseId: courses[0]?.id || '',
        title: '',
        content: '',
        priority: 'NORMAL',
      });
      const annList = await lmsService.getAnnouncements();
      setAnnouncements(annList);
    } catch (err) {
      showToast('Error posting announcement: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Discussion Reply
  const handleFacultyReply = async (discId) => {
    const text = replyText[discId];
    if (!text || !text.trim()) return;
    try {
      await lmsService.replyDiscussion(discId, text.trim());
      setReplyText((prev) => ({ ...prev, [discId]: '' }));
      const dList = await lmsService.getDiscussions();
      setDiscussions(dList);
    } catch (err) {
      showToast('Error replying to discussion: ' + err.message, 'error');
    }
  };

  // Handle Issue Certificate
  const handleIssueCert = async (studentId, courseId) => {
    try {
      await lmsService.issueCertificate({
        studentId,
        courseId,
        gradeAchieved: 'A+',
      });
      showToast('Verified Certificate issued to student!', 'success');
      const certList = await lmsService.getCertificates();
      setCertificates(certList);
      const prog = await lmsService.getStudentProgress();
      setStudentProgress(prog || []);
    } catch (err) {
      showToast('Error issuing certificate: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-muted-foreground">Loading Faculty LMS Engine & Database Records...</p>
      </div>
    );
  }

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  // 1. Dashboard Overview
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Courses</span>
          <p className="text-2xl font-black text-foreground">{dashboardData?.metrics?.totalCourses || courses.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{dashboardData?.metrics?.publishedCourses || 0} Published</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enrolled Students</span>
          <p className="text-2xl font-black text-foreground">{dashboardData?.metrics?.totalStudents || 0}</p>
          <span className="text-[10px] text-primary font-semibold">Active Roster</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Learning Materials</span>
          <p className="text-2xl font-black text-foreground">{dashboardData?.metrics?.publishedResourcesCount || resources.length}</p>
          <span className="text-[10px] text-blue-600 font-semibold">PDFs & Media</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assessments</span>
          <p className="text-2xl font-black text-foreground">{dashboardData?.metrics?.activeAssessments || (quizzes.length + assignments.length)}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Quizzes & Projects</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Grading</span>
          <p className="text-2xl font-black text-amber-600">{gradingQueue.filter(g => g.status === 'SUBMITTED' || g.status === 'AWAITING_GRADING').length}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Requires Evaluation</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Classes</span>
          <p className="text-2xl font-black text-foreground">{liveClasses.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Scheduled / Live</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Faculty Curriculum Hub</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveModal('create-course')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('upload-resource')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground hover:bg-secondary/80 border border-border cursor-pointer active:scale-95"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('create-quiz')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground hover:bg-secondary/80 border border-border cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('create-assignment')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground hover:bg-secondary/80 border border-border cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Courses Overview & Grading Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">My Authorized Courses</h3>
                <p className="text-[11px] text-muted-foreground">Departmental course offerings, enrollment rosters, and average student completion.</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('manage-courses')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                View Catalog →
              </button>
            </div>

            <div className="divide-y divide-border">
              {courses.map((course) => (
                <div key={course.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-primary">{course.course_code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        {course.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground truncate">{course.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {course.enrolled_count || 1} Enrolled • {course.module_count || 3} Modules • Level: {course.level}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewStudents(course)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 border border-border cursor-pointer"
                    >
                      Roster ({course.enrolled_count || 1})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseIdFilter(course.id);
                        onSelectSection('manage-materials');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    >
                      Materials
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Urgent Grading Queue Preview */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Grading Queue</h3>
                <p className="text-[11px] text-muted-foreground">Submissions awaiting faculty marks</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('manage-assignments')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                All Queue →
              </button>
            </div>

            <div className="space-y-2.5">
              {gradingQueue.slice(0, 4).map((sub) => (
                <div key={sub.id} className="p-3 rounded-xl border border-border bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">{sub.first_name} {sub.last_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{sub.assignment_title}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">{sub.register_number}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGradingSubmission(sub);
                        setGradingForm({
                          grade: sub.grade || 85,
                          feedback: sub.feedback || 'Good implementation.',
                          releaseResults: true,
                        });
                        setActiveModal('grade-submission');
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    >
                      Evaluate
                    </button>
                  </div>
                </div>
              ))}
              {gradingQueue.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No pending submissions awaiting review.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. My Courses Catalog & Curriculum Roster
  const renderMyCourses = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Course Roster & Catalog Management</h2>
          <p className="text-xs text-muted-foreground">
            View assigned academic courses, enrolled student batches, curriculum modules, and publication states.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('create-course')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div key={course.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-primary/50 transition-all">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-primary">{course.course_code}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-neutral-500/10 text-neutral-500'
                }`}>
                  {course.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground line-clamp-1">{course.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{course.description || 'No course overview provided.'}</p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Students</span>
                  <span className="text-xs font-bold text-foreground">{course.enrolled_count || 1}</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Modules</span>
                  <span className="text-xs font-bold text-foreground">{course.module_count || 3}</span>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Passing</span>
                  <span className="text-xs font-bold text-foreground">{course.passing_percentage}%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleViewStudents(course)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer border border-border"
              >
                View Roster
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourseIdFilter(course.id);
                  onSelectSection('manage-materials');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
              >
                Materials
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 3. Course Material & Resource Management
  const renderManageMaterials = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Course Material & Resource Management</h2>
          <p className="text-xs text-muted-foreground">
            Upload reference PDFs, PowerPoint decks, source code archives, video lecture links, and organize lessons.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('upload-resource')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Filter and Course Selector */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground uppercase">Filter by Course:</label>
          <select
            value={selectedCourseIdFilter}
            onChange={(e) => setSelectedCourseIdFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-secondary border border-border text-foreground font-semibold cursor-pointer"
          >
            <option value="">All My Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">{resources.length} resource(s) listed</span>
      </div>

      {/* Resources Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((res) => (
          <div key={res.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-primary">{res.course_code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground uppercase">
                  {res.file_type} {res.file_size_kb > 0 && `• ${res.file_size_kb} KB`}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground line-clamp-1">{res.title}</h3>
              {res.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{res.description}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Target: {res.target_section || 'ALL'}</span>
                <span>{new Date(res.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-border">
              <a
                href={res.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border inline-flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open / View</span>
              </a>
              <button
                type="button"
                onClick={() => handleDeleteResource(res.id)}
                className="p-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                title="Delete Resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {resources.length === 0 && (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Learning Resources Uploaded Yet</h3>
          <p className="text-xs text-muted-foreground">Click "Upload New Resource" above to add reference PDFs, slides, or technical documents.</p>
        </div>
      )}
    </div>
  );

  // 4. Quiz Builder & Assessment Management
  const renderQuizBuilder = () => {
    const showQuizzes = assessmentTypeFilter === 'ALL' || assessmentTypeFilter === 'QUIZ';
    const showCoding = assessmentTypeFilter === 'ALL' || assessmentTypeFilter === 'PROGRAMMING';
    const totalCount = quizzes.length + codingAssessments.length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Quiz & Assessment Builder</h2>
            <p className="text-xs text-muted-foreground">
              Build objective examinations, configure multiple-choice options, set server-side answer keys, and manage CodeSprint live programming assessments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('create-quiz')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        </div>

        {/* Assessment Type Filter Pills */}
        <div className="bg-card rounded-2xl border border-border p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground mr-1">Filter Type:</span>
            <button
              type="button"
              onClick={() => setAssessmentTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                assessmentTypeFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              All Assessments ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setAssessmentTypeFilter('QUIZ')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                assessmentTypeFilter === 'QUIZ'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              Curriculum Quizzes ({quizzes.length})
            </button>
            <button
              type="button"
              onClick={() => setAssessmentTypeFilter('PROGRAMMING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                assessmentTypeFilter === 'PROGRAMMING'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>CodeSprint Challenges ({codingAssessments.length})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Objective Curriculum Quizzes */}
          {showQuizzes &&
            quizzes.map((q) => (
              <div key={`quiz-${q.id}`} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-primary">{q.course_code || 'LMS'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                      CURRICULUM QUIZ
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{q.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{q.description || q.instructions}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center text-xs">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Questions</span>
                      <span className="font-bold text-foreground">{q.question_count || 5}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Duration</span>
                      <span className="font-bold text-foreground">{q.time_limit_minutes}m</span>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Submissions</span>
                      <span className="font-bold text-primary">{q.total_submissions || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuizAttempts(q)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer border border-border"
                  >
                    View Attempts ({q.total_submissions || 0})
                  </button>
                </div>
              </div>
            ))}

          {/* CodeSprint Programming Assessments */}
          {showCoding &&
            codingAssessments.map((ca) => (
              <div key={`code-${ca.id}`} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>CodeSprint</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ca.difficulty === 'HARD'
                          ? 'bg-rose-500/10 text-rose-600'
                          : ca.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {ca.difficulty || 'MEDIUM'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{ca.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ca.description || 'Automated code compilation & execution against hidden test cases.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center text-xs">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Problems</span>
                      <span className="font-bold text-foreground">{ca.question_count || 1}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Time Limit</span>
                      <span className="font-bold text-foreground">{ca.duration_minutes || ca.time_limit || 60}m</span>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <span className="text-[10px] text-muted-foreground block">Candidates</span>
                      <span className="font-bold text-purple-600">{ca.candidates_count || ca.total_submissions || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCodingSubmissions(ca)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer border border-border flex items-center justify-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Submissions ({ca.candidates_count || ca.total_submissions || 0})</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {totalCount === 0 && (
          <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
            <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Assessments Built Yet</h3>
            <p className="text-xs text-muted-foreground">Click "Create Assessment" above to construct curriculum quizzes or CodeSprint challenges.</p>
          </div>
        )}
      </div>
    );
  };

  // 5. Assignment & Capstone Grading Queue
  const renderManageAssignments = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Assignment & Grading Queue</h2>
          <p className="text-xs text-muted-foreground">
            Review live student deliverables, code files, and GitHub repositories. Assign grades and release feedback.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('create-assignment')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-muted-foreground uppercase">Status Filter:</label>
          <select
            value={gradingStatusFilter}
            onChange={(e) => setGradingStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-secondary border border-border text-foreground font-semibold cursor-pointer"
          >
            <option value="ALL">All Submissions</option>
            <option value="SUBMITTED">Pending Evaluation</option>
            <option value="GRADED">Graded (Draft Decision)</option>
            <option value="RESULTS_RELEASED">Results Released to Student</option>
          </select>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">{gradingQueue.length} student submission(s)</span>
      </div>

      {/* Submissions Queue Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Course & Assignment</th>
                <th className="p-3.5">Deliverables</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Marks</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gradingQueue.map((sub) => (
                <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-foreground">{sub.first_name} {sub.last_name}</p>
                    <p className="text-[11px] text-muted-foreground">{sub.register_number} • {sub.student_dept || 'CSE'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-foreground">{sub.assignment_title}</p>
                    <p className="text-[11px] text-primary">{sub.course_code}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1">
                      {sub.file_url && (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>{sub.file_name || 'Attached File'}</span>
                        </a>
                      )}
                      {sub.github_url && (
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:underline block"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GitHub Repo</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    <p>{new Date(sub.submitted_at).toLocaleDateString()}</p>
                    {sub.is_late ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600">LATE</span>
                    ) : (
                      <span className="text-[9px] text-emerald-600">On Time</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'RESULTS_RELEASED'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : sub.status === 'GRADED'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-foreground">
                      {sub.grade !== null ? `${sub.grade} / ${sub.max_marks}` : '—'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGradingSubmission(sub);
                          setGradingForm({
                            grade: sub.grade || 85,
                            feedback: sub.feedback || 'Well completed assignment requirements.',
                            releaseResults: true,
                          });
                          setActiveModal('grade-submission');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                      >
                        {sub.grade !== null ? 'Re-evaluate' : 'Grade'}
                      </button>
                      {sub.status === 'GRADED' && (
                        <button
                          type="button"
                          onClick={() => handleReleaseResult(sub.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                          title="Release Marks to Student"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 6. Student Academic Progress Matrix
  const renderStudentProgress = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Student Academic Progress Matrix</h2>
        <p className="text-xs text-muted-foreground">
          Live aggregate tracking of lesson completion, quiz test scores, project grades, and live class attendance by enrolled student.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Course Code & Name</th>
                <th className="p-3.5">Lesson Progress</th>
                <th className="p-3.5">Quizzes</th>
                <th className="p-3.5">Assignments</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5">Certificate</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {studentProgress.map((row, idx) => (
                <tr key={`${row.student_id}-${row.course_id}-${idx}`} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-foreground">{row.first_name} {row.last_name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.register_number} • {row.student_dept || 'CSE'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-foreground">{row.course_code}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{row.course_title}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1 w-28">
                      <div className="flex items-center justify-between text-[10px]">
                        <span>{row.completed_lessons || 0}/{row.total_lessons || 1}</span>
                        <span className="font-bold">{row.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full ${row.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                          style={{ width: `${row.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-foreground">
                      {row.avg_quiz_score !== null ? `${row.avg_quiz_score}% Avg` : 'None'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-foreground">
                      {row.avg_assignment_grade !== null ? `${row.avg_assignment_grade}%` : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-foreground">
                      {row.total_sessions > 0
                        ? `${Math.round((row.sessions_attended / row.total_sessions) * 100)}% (${row.sessions_attended}/${row.total_sessions})`
                        : '100%'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {row.certificate_issued ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Issued</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">In Progress</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {!row.certificate_issued && (
                      <button
                        type="button"
                        onClick={() => handleIssueCert(row.student_id, row.course_id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border cursor-pointer"
                      >
                        Issue Credential
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 7. Live Sessions & Attendance Management
  const renderManageLive = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Live Sessions & Attendance Management</h2>
          <p className="text-xs text-muted-foreground">
            Schedule virtual technical masterclasses and record attendance with persistent verification records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('schedule-live')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <Video className="w-4 h-4" />
          <span>Schedule Live Masterclass</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {liveClasses.map((lc) => (
          <div key={lc.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-primary">{lc.course_code}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  {lc.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground line-clamp-1">{lc.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{new Date(lc.start_time).toLocaleString()} ({lc.duration_minutes} mins)</span>
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
                <span>Platform: {lc.platform}</span>
                <span className="font-bold text-foreground">{lc.attendance_count || 0} Attended</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={lc.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Session</span>
              </a>
              <button
                type="button"
                onClick={() => handleOpenLiveAttendance(lc)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all cursor-pointer border border-border inline-flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Attendance</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 8. Learning Paths
  const renderManagePaths = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Curriculum & Learning Path Management</h2>
          <p className="text-xs text-muted-foreground">
            Group courses into sequential career roadmaps aligned with placement job roles and assign to batches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('create-path')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Learning Path</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {learningPaths.map((lp) => (
          <div key={lp.id} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {lp.estimated_weeks} Weeks Path
              </span>
              <span className="text-xs text-muted-foreground font-semibold">Dept: {lp.department_code || 'All'}</span>
            </div>
            <h3 className="text-base font-bold text-foreground">{lp.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{lp.description}</p>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milestones</span>
              <div className="flex flex-wrap gap-1.5">
                {(lp.milestones || []).map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-secondary text-foreground font-semibold">
                    {idx + 1}. {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await lmsService.assignLearningPath(lp.id, { departmentCode: lp.department_code });
                    showToast(`Assigned "${lp.title}" to batch students!`, 'success');
                  } catch (err) {
                    showToast('Failed to assign path: ' + err.message, 'error');
                  }
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
              >
                Assign Path to Enrolled Students
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 9. Discussions & Doubts
  const renderDiscussions = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Discussions & Doubts Resolution</h2>
        <p className="text-xs text-muted-foreground">
          Review academic doubts posted by students across course modules and post official faculty responses.
        </p>
      </div>

      <div className="space-y-4">
        {discussions.map((d) => (
          <div key={d.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-primary">{d.course_code}</span>
                  <span className="text-xs text-muted-foreground">• Posted by {d.first_name} {d.last_name} ({d.role_name})</span>
                  {d.is_resolved && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      RESOLVED
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground">{d.title}</h3>
              </div>
              {!d.is_resolved && (
                <button
                  type="button"
                  onClick={async () => {
                    await lmsService.resolveDiscussion(d.id);
                    const dList = await lmsService.getDiscussions();
                    setDiscussions(dList);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border cursor-pointer shrink-0"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-secondary/30 p-3 rounded-xl">
              {d.message}
            </p>

            {/* Replies */}
            <div className="space-y-2 pt-2 border-t border-border">
              {(d.replies || []).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-secondary/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {r.first_name} {r.last_name} {r.is_faculty_answer ? '★ Faculty Answer' : ''}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground">{r.reply_text}</p>
                </div>
              ))}

              {/* Reply Box */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Post verified faculty answer or explanation..."
                  value={replyText[d.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [d.id]: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleFacultyReply(d.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 10. Reports & Analytics
  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Curriculum & Outcome Reports</h2>
          <p className="text-xs text-muted-foreground">
            Auditable institutional records on course completion, assessment passing rates, and live participation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Enrollments</span>
          <p className="text-2xl font-black text-foreground">{reports?.summary?.total_enrollments || 0}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completions</span>
          <p className="text-2xl font-black text-emerald-600">{reports?.summary?.completed_enrollments || 0}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Quiz Score</span>
          <p className="text-2xl font-black text-foreground">{reports?.summary?.avg_quiz_score || 0}%</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Project Grade</span>
          <p className="text-2xl font-black text-primary">{reports?.summary?.avg_assignment_grade || 0}%</p>
        </div>
      </div>

      {/* Courses Breakdown */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="p-4 bg-secondary/50 font-bold text-xs text-foreground">Course-by-Course Analytics Breakdown</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/30 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Course Code & Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Enrolled</th>
                <th className="p-3.5">Completed</th>
                <th className="p-3.5">Avg Progress</th>
                <th className="p-3.5">Resources</th>
                <th className="p-3.5">Quizzes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(reports?.courses || []).map((c, idx) => (
                <tr key={idx} className="hover:bg-secondary/30">
                  <td className="p-3.5 font-bold text-foreground">{c.course_code}: {c.title}</td>
                  <td className="p-3.5 text-muted-foreground">{c.department_code || 'All'}</td>
                  <td className="p-3.5 font-semibold text-foreground">{c.total_enrolled}</td>
                  <td className="p-3.5 font-semibold text-emerald-600">{c.completions}</td>
                  <td className="p-3.5 font-bold text-primary">{c.avg_progress}%</td>
                  <td className="p-3.5 text-muted-foreground">{c.resource_count || 0}</td>
                  <td className="p-3.5 text-muted-foreground">{c.quiz_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 11. Certificates Management
  const renderCertificates = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Verified Academic Credentials & Certificates</h2>
        <p className="text-xs text-muted-foreground">
          Cryptographically hashed certificates issued to students upon verified curriculum completion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">{cert.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">VERIFIED</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{cert.first_name} {cert.last_name}</p>
              <p className="text-xs text-muted-foreground">{cert.register_number}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
              <p className="text-xs font-bold text-foreground">{cert.course_code}: {cert.course_title}</p>
              <p className="text-[11px] text-muted-foreground">Issue Date: {new Date(cert.issue_date).toLocaleDateString()} • Grade: {cert.grade_achieved}</p>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground truncate">Hash: {cert.verification_hash}</p>
          </div>
        ))}
        {certificates.length === 0 && (
          <div className="p-12 text-center bg-card rounded-2xl border border-border col-span-full">
            <p className="text-xs text-muted-foreground">No certificates issued yet. Certificates are issued automatically upon 100% course completion or manually in Student Progress.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 12. Announcements
  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Course Announcements</h2>
          <p className="text-xs text-muted-foreground">
            Broadcast departmental updates, exam schedules, and important deadlines to enrolled students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveModal('create-announcement')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-primary">{ann.course_code || 'General'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ann.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-600' : 'bg-secondary text-foreground'
                }`}>
                  {ann.priority}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">{new Date(ann.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="text-base font-bold text-foreground">{ann.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{ann.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Section Selector Map
  const sectionContent = {
    'faculty-dashboard': renderDashboard(),
    'overview': renderDashboard(),
    'manage-courses': renderMyCourses(),
    'courses': renderMyCourses(),
    'manage-materials': renderManageMaterials(),
    'materials': renderManageMaterials(),
    'manage-quizzes': renderQuizBuilder(),
    'quizzes': renderQuizBuilder(),
    'manage-assignments': renderManageAssignments(),
    'assignments': renderManageAssignments(),
    'grading-queue': renderManageAssignments(),
    'student-progress': renderStudentProgress(),
    'progress': renderStudentProgress(),
    'manage-learning-paths': renderManagePaths(),
    'learning-paths': renderManagePaths(),
    'manage-live-classes': renderManageLive(),
    'live-classes': renderManageLive(),
    'manage-discussions': renderDiscussions(),
    'discussions': renderDiscussions(),
    'manage-certificates': renderCertificates(),
    'certificates': renderCertificates(),
    'manage-announcements': renderAnnouncements(),
    'announcements': renderAnnouncements(),
    'reports': renderReports(),
  };

  return (
    <div className="space-y-6">
      {sectionContent[activeSection] || renderDashboard()}

      {/* ==================================================== */}
      {/* MODAL 1: Create Course Modal */}
      {/* ==================================================== */}
      {activeModal === 'create-course' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create New Academic Course</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FS-302"
                    value={newCourseForm.course_code}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, course_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Level</label>
                  <select
                    value={newCourseForm.level}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cloud Systems & Kubernetes"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Course Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of curriculum modules, learning objectives, and placement outcomes..."
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Duration (Hours)</label>
                  <input
                    type="number"
                    value={newCourseForm.duration_hours}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, duration_hours: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Pass Score %</label>
                  <input
                    type="number"
                    value={newCourseForm.passing_percentage}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, passing_percentage: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Upload Learning Resource Modal */}
      {/* ==================================================== */}
      {activeModal === 'upload-resource' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Upload Learning Resource</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadResource} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Course *</label>
                <select
                  value={resourceUploadForm.courseId}
                  onChange={(e) => setResourceUploadForm({ ...resourceUploadForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microservices Architecture & Event Streaming Blueprint"
                  value={resourceUploadForm.title}
                  onChange={(e) => setResourceUploadForm({ ...resourceUploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Resource Type</label>
                <div className="flex items-center gap-3 py-1">
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      checked={!resourceUploadForm.isExternal}
                      onChange={() => setResourceUploadForm({ ...resourceUploadForm, isExternal: false })}
                    />
                    <span>Upload Local File (PDF / DOC / ZIP)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      checked={resourceUploadForm.isExternal}
                      onChange={() => setResourceUploadForm({ ...resourceUploadForm, isExternal: true })}
                    />
                    <span>External URL / Video Stream Link</span>
                  </label>
                </div>
              </div>

              {!resourceUploadForm.isExternal ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Attach File (.pdf, .docx, .zip, max 25MB) *</label>
                  <input
                    type="file"
                    required={!resourceUploadForm.isExternal}
                    onChange={(e) => setResourceUploadForm({ ...resourceUploadForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">External URL / Video Link *</label>
                  <input
                    type="url"
                    required={resourceUploadForm.isExternal}
                    placeholder="https://..."
                    value={resourceUploadForm.externalUrl}
                    onChange={(e) => setResourceUploadForm({ ...resourceUploadForm, externalUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts, syllabus reference, or reading instructions..."
                  value={resourceUploadForm.description}
                  onChange={(e) => setResourceUploadForm({ ...resourceUploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Publishing...' : 'Publish Resource to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Quiz Builder Modal */}
      {/* ==================================================== */}
      {activeModal === 'create-quiz' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {quizBuilderForm.assessmentType === 'PROGRAMMING'
                  ? 'Build CodeSprint Programming Assessment'
                  : 'Build Objective Curriculum Quiz'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assessment Type Selector */}
            <div className="flex items-center gap-2 p-1 bg-secondary rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setQuizBuilderForm({ ...quizBuilderForm, assessmentType: 'QUIZ' })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  quizBuilderForm.assessmentType === 'QUIZ'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Curriculum Quiz (MCQ)
              </button>
              <button
                type="button"
                onClick={() => setQuizBuilderForm({ ...quizBuilderForm, assessmentType: 'PROGRAMMING' })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  quizBuilderForm.assessmentType === 'PROGRAMMING'
                    ? 'bg-card text-purple-600 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>CodeSprint Challenge</span>
              </button>
            </div>

            {quizBuilderForm.assessmentType === 'PROGRAMMING' ? (
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Difficulty Level *</label>
                    <select
                      value={quizBuilderForm.difficulty}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    >
                      <option value="EASY">EASY (Entry / Warm-up)</option>
                      <option value="MEDIUM">MEDIUM (Intermediate / Core Algorithms)</option>
                      <option value="HARD">HARD (Advanced / Dynamic Programming)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Time Limit (mins)</label>
                    <input
                      type="number"
                      value={quizBuilderForm.timeLimitMinutes}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, timeLimitMinutes: parseInt(e.target.value, 10) || 60 })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Problem Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Invert Binary Tree & Path Sum Optimization"
                    value={quizBuilderForm.title}
                    onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Problem Statement *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the algorithmic objective, inputs, and operational criteria..."
                    value={quizBuilderForm.problemStatement}
                    onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, problemStatement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Input Format</label>
                    <input
                      type="text"
                      placeholder="e.g. First line contains integer N, followed by N integers"
                      value={quizBuilderForm.inputFormat}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, inputFormat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Output Format</label>
                    <input
                      type="text"
                      placeholder="e.g. Print single integer representing the maximum sum"
                      value={quizBuilderForm.outputFormat}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, outputFormat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Constraints</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 <= N <= 10^5, Time limit 2.0s, Memory 256MB"
                    value={quizBuilderForm.constraints}
                    onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, constraints: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-600">Sample Input (Candidate Visible)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 4 9&#10;2 7 11 15"
                      value={quizBuilderForm.sampleInput}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, sampleInput: e.target.value })}
                      className="w-full px-3 py-1.5 font-mono text-xs rounded-xl bg-secondary border border-border text-foreground resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-600">Expected Sample Output</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 0 1"
                      value={quizBuilderForm.sampleOutput}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, sampleOutput: e.target.value })}
                      className="w-full px-3 py-1.5 font-mono text-xs rounded-xl bg-secondary border border-border text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-600">Hidden Test Input (Compiler Sandbox)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 5 100&#10;10 20 30 40 50"
                      value={quizBuilderForm.hiddenInput}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, hiddenInput: e.target.value })}
                      className="w-full px-3 py-1.5 font-mono text-xs rounded-xl bg-secondary border border-border text-foreground resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-600">Expected Hidden Output</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. -1"
                      value={quizBuilderForm.hiddenOutput}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, hiddenOutput: e.target.value })}
                      className="w-full px-3 py-1.5 font-mono text-xs rounded-xl bg-secondary border border-border text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                    {submitting ? 'Registering...' : 'Register CodeSprint Assessment'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Course *</label>
                    <select
                      value={quizBuilderForm.courseId}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, courseId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Due Date</label>
                    <input
                      type="datetime-local"
                      value={quizBuilderForm.dueDate}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Quiz Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Relational Database Transactions, Locks & ACID"
                    value={quizBuilderForm.title}
                    onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Time Limit (mins)</label>
                    <input
                      type="number"
                      value={quizBuilderForm.timeLimitMinutes}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, timeLimitMinutes: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Max Attempts</label>
                    <input
                      type="number"
                      value={quizBuilderForm.maxAttempts}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, maxAttempts: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Pass Mark %</label>
                    <input
                      type="number"
                      value={quizBuilderForm.passingScore}
                      onChange={(e) => setQuizBuilderForm({ ...quizBuilderForm, passingScore: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Dynamic Questions Builder */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Questions ({quizBuilderForm.questions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizBuilderForm({
                          ...quizBuilderForm,
                          questions: [
                            ...quizBuilderForm.questions,
                            {
                              questionText: '',
                              questionType: 'MCQ',
                              options: ['', '', '', ''],
                              correctAnswer: '',
                              marks: 2,
                              explanation: '',
                            },
                          ],
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {quizBuilderForm.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Question {qIdx + 1}</span>
                        {quizBuilderForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuizBuilderForm({
                                ...quizBuilderForm,
                                questions: quizBuilderForm.questions.filter((_, i) => i !== qIdx),
                              });
                            }}
                            className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="e.g. Which ACID property ensures database changes survive power failures?"
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...quizBuilderForm.questions];
                          updated[qIdx].questionText = e.target.value;
                          setQuizBuilderForm({ ...quizBuilderForm, questions: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            required
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...quizBuilderForm.questions];
                              updated[qIdx].options[optIdx] = e.target.value;
                              setQuizBuilderForm({ ...quizBuilderForm, questions: updated });
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs bg-secondary border border-border text-foreground"
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-emerald-600">Correct Answer Key *</label>
                          <input
                            type="text"
                            required
                            placeholder="Exact matching correct option text"
                            value={q.correctAnswer}
                            onChange={(e) => {
                              const updated = [...quizBuilderForm.questions];
                              updated[qIdx].correctAnswer = e.target.value;
                              setQuizBuilderForm({ ...quizBuilderForm, questions: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-secondary border border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">Explanation / Key Rationale</label>
                          <input
                            type="text"
                            placeholder="Explanation shown after result release"
                            value={q.explanation}
                            onChange={(e) => {
                              const updated = [...quizBuilderForm.questions];
                              updated[qIdx].explanation = e.target.value;
                              setQuizBuilderForm({ ...quizBuilderForm, questions: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-secondary border border-border text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                    {submitting ? 'Saving...' : 'Save & Publish Quiz'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Quiz & Assessment Attempts / Submissions Modal */}
      {/* ==================================================== */}
      {activeModal === 'quiz-attempts' && selectedQuizForAttempts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-3xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isCodingSubmissionModal ? 'CodeSprint Candidate Submissions' : 'Student Quiz Submissions'}: {selectedQuizForAttempts.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isCodingSubmissionModal
                    ? `Duration: ${selectedQuizForAttempts.duration_minutes || selectedQuizForAttempts.time_limit || 60}m • Evaluation: Live Sandbox Compiler Engine`
                    : `Passing Score: ${selectedQuizForAttempts.passing_score}% • Max Attempts: ${selectedQuizForAttempts.max_attempts}`}
                </p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {isCodingSubmissionModal ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Candidate Name</th>
                      <th className="p-3">Register No</th>
                      <th className="p-3">Language</th>
                      <th className="p-3">Verdict / Status</th>
                      <th className="p-3">Score / Tests</th>
                      <th className="p-3">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quizAttemptsList.map((sub) => (
                      <tr key={sub.id} className="hover:bg-secondary/30">
                        <td className="p-3 font-bold text-foreground">{sub.first_name} {sub.last_name}</td>
                        <td className="p-3 text-muted-foreground">{sub.register_number}</td>
                        <td className="p-3 uppercase font-mono text-[11px] text-primary">{sub.language || 'Python'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.execution_status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : sub.execution_status === 'COMPILATION_ERROR'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {sub.execution_status || 'EVALUATED'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-foreground">
                          {sub.score || 0} pts ({sub.passed_test_cases || 0}/{sub.total_test_cases || 0} passed)
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(sub.submitted_at || sub.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {quizAttemptsList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">No candidate submissions recorded for this CodeSprint assessment yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Register No</th>
                      <th className="p-3">Attempt #</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Outcome</th>
                      <th className="p-3">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quizAttemptsList.map((att) => (
                      <tr key={att.id} className="hover:bg-secondary/30">
                        <td className="p-3 font-bold text-foreground">{att.first_name} {att.last_name}</td>
                        <td className="p-3 text-muted-foreground">{att.register_number}</td>
                        <td className="p-3 font-semibold text-foreground">#{att.attempt_number}</td>
                        <td className="p-3 font-bold text-foreground">{att.score} / {att.max_score} ({att.percentage}%)</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {att.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(att.completed_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {quizAttemptsList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">No students have attempted this quiz yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: Create Assignment Modal */}
      {/* ==================================================== */}
      {activeModal === 'create-assignment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Course Assignment</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Course *</label>
                  <select
                    value={assignmentForm.courseId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Submission Deadline *</label>
                  <input
                    type="datetime-local"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Database Engine Implementation (Docker + MySQL)"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Instructions & Deliverables</label>
                <textarea
                  rows={3}
                  placeholder="Detail expected inputs, outputs, Docker Compose requirements, or test criteria..."
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Max Marks</label>
                  <input
                    type="number"
                    value={assignmentForm.maxMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Allowed File Types</label>
                  <input
                    type="text"
                    value={assignmentForm.allowedFileTypes}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, allowedFileTypes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Creating...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: Grade Submission Modal */}
      {/* ==================================================== */}
      {activeModal === 'grade-submission' && activeGradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Evaluate Student Submission</h3>
                <p className="text-xs text-muted-foreground">{activeGradingSubmission.first_name} {activeGradingSubmission.last_name} ({activeGradingSubmission.register_number})</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/50 space-y-2 text-xs">
              <p className="font-bold text-foreground">{activeGradingSubmission.assignment_title}</p>
              {activeGradingSubmission.submission_text && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Student Notes:</span>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{activeGradingSubmission.submission_text}</p>
                </div>
              )}
              {activeGradingSubmission.file_url && (
                <a
                  href={activeGradingSubmission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Deliverable File ({activeGradingSubmission.file_name})</span>
                </a>
              )}
              {activeGradingSubmission.github_url && (
                <a
                  href={activeGradingSubmission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-purple-600 hover:underline block pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Code on GitHub</span>
                </a>
              )}
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Score (Max: {activeGradingSubmission.max_marks}) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={activeGradingSubmission.max_marks}
                  value={gradingForm.grade}
                  onChange={(e) => setGradingForm({ ...gradingForm, grade: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Evaluation Feedback & Code Comments</label>
                <textarea
                  rows={3}
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                  placeholder="Provide structured praise and constructive improvement points..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="releaseImmediate"
                  checked={gradingForm.releaseResults}
                  onChange={(e) => setGradingForm({ ...gradingForm, releaseResults: e.target.checked })}
                  className="rounded border-border cursor-pointer"
                />
                <label htmlFor="releaseImmediate" className="text-xs text-foreground font-semibold cursor-pointer">
                  Release results & marks immediately to student
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Saving...' : 'Save & Post Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 7: Live Session Attendance Modal */}
      {/* ==================================================== */}
      {activeModal === 'live-attendance' && activeLiveClassForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Record Attendance: {activeLiveClassForAttendance.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(activeLiveClassForAttendance.start_time).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Register Number</th>
                    <th className="p-3">Attendance Status</th>
                    <th className="p-3">Remarks / Verification Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {liveAttendanceRoster.map((item, idx) => (
                    <tr key={item.studentId} className="hover:bg-secondary/30">
                      <td className="p-3 font-bold text-foreground">{item.name}</td>
                      <td className="p-3 text-muted-foreground">{item.registerNumber}</td>
                      <td className="p-3">
                        <select
                          value={item.status}
                          onChange={(e) => {
                            const updated = [...liveAttendanceRoster];
                            updated[idx].status = e.target.value;
                            setLiveAttendanceRoster(updated);
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-secondary border border-border font-bold text-foreground cursor-pointer"
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="LATE">LATE</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="EXCUSED">EXCUSED</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="e.g. Participated in Q&A"
                          value={item.notes}
                          onChange={(e) => {
                            const updated = [...liveAttendanceRoster];
                            updated[idx].notes = e.target.value;
                            setLiveAttendanceRoster(updated);
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-secondary border border-border w-full text-foreground"
                        />
                      </td>
                    </tr>
                  ))}
                  {liveAttendanceRoster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">No enrolled students in this course roster.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
              <button
                type="button"
                disabled={submitting || liveAttendanceRoster.length === 0}
                onClick={handleSaveLiveAttendance}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
              >
                {submitting ? 'Saving...' : 'Save & Verify Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: View Course Students Roster */}
      {/* ==================================================== */}
      {activeModal === 'view-students' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-2xl w-full space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Enrolled Roster: {selectedCourse.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedCourse.course_code} • {enrolledStudentsList.length} Students</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Register Number</th>
                    <th className="p-3">Dept</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enrolledStudentsList.map((s) => (
                    <tr key={s.enrollment_id} className="hover:bg-secondary/30">
                      <td className="p-3 font-bold text-foreground">{s.first_name} {s.last_name}</td>
                      <td className="p-3 text-muted-foreground">{s.register_number}</td>
                      <td className="p-3 text-muted-foreground">{s.department_code}</td>
                      <td className="p-3 font-bold text-primary">{s.progress_percentage}%</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground">
                          {s.enrollment_status}
                        </span>
                      </td>
                      <td className="p-3">
                        {s.certificate_issued ? (
                          <span className="text-emerald-600 font-bold text-[10px]">ISSUED</span>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">UNISSUED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {enrolledStudentsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">No students are currently enrolled in this course.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 9: Schedule Live Masterclass */}
      {/* ==================================================== */}
      {activeModal === 'schedule-live' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Schedule Live Masterclass</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleLive} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Course *</label>
                <select
                  value={newLiveClass.courseId}
                  onChange={(e) => setNewLiveClass({ ...newLiveClass, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interactive System Design & High Concurrency Architecture"
                  value={newLiveClass.title}
                  onChange={(e) => setNewLiveClass({ ...newLiveClass, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Date & Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newLiveClass.startTime}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newLiveClass.durationMinutes}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, durationMinutes: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Meeting Link / Virtual Room</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={newLiveClass.meetingLink}
                  onChange={(e) => setNewLiveClass({ ...newLiveClass, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Scheduling...' : 'Schedule Masterclass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 10: Create Announcement */}
      {/* ==================================================== */}
      {activeModal === 'create-announcement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Post Course Announcement</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Course</label>
                  <select
                    value={announcementForm.courseId}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  >
                    <option value="">General / All Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.course_code}: {c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final Semester Capstone Evaluation Schedule & Submission Portal"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Announcement Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full message delivered to students via dashboard and notification alerts..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Posting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 11: Create Learning Path */}
      {/* ==================================================== */}
      {activeModal === 'create-path' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Career Learning Path</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSubmitting(true);
                  const milestones = learningPathForm.milestones.split(',').map((m) => m.trim()).filter(Boolean);
                  await lmsService.createLearningPath({
                    title: learningPathForm.title,
                    description: learningPathForm.description,
                    estimatedWeeks: learningPathForm.estimatedWeeks,
                    targetRoleId: learningPathForm.targetRoleId,
                    milestones,
                  });
                  showToast('Learning path created successfully!', 'success');
                  setActiveModal(null);
                  const lpList = await lmsService.getLearningPaths();
                  setLearningPaths(lpList);
                } catch (err) {
                  showToast('Error creating learning path: ' + err.message, 'error');
                } finally {
                  setSubmitting(false);
                }
              }}
              className="space-y-3.5"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Path Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud & DevOps Infrastructure Architect Track"
                  value={learningPathForm.title}
                  onChange={(e) => setLearningPathForm({ ...learningPathForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Career roadmap overview..."
                  value={learningPathForm.description}
                  onChange={(e) => setLearningPathForm({ ...learningPathForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Estimated Weeks</label>
                  <input
                    type="number"
                    value={learningPathForm.estimatedWeeks}
                    onChange={(e) => setLearningPathForm({ ...learningPathForm, estimatedWeeks: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Target Role ID</label>
                  <input
                    type="text"
                    value={learningPathForm.targetRoleId}
                    onChange={(e) => setLearningPathForm({ ...learningPathForm, targetRoleId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Milestones (Comma-separated)</label>
                <input
                  type="text"
                  value={learningPathForm.milestones}
                  onChange={(e) => setLearningPathForm({ ...learningPathForm, milestones: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-secondary border border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90">
                  {submitting ? 'Creating...' : 'Create Learning Path'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyViews;
