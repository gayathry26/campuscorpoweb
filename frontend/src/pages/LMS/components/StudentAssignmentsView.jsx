import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Upload,
  ExternalLink,
  Award,
  MessageSquare,
  Send,
} from 'lucide-react';
import lmsService from '../../../services/lmsService';

function getAssignmentStatus(assign) {
  const isEvaluated =
    assign.hasSubmitted &&
    (assign.submission?.status === 'GRADED' ||
      assign.submission?.status === 'EVALUATED' ||
      (assign.submission?.grade !== null && assign.submission?.grade !== undefined));

  if (isEvaluated) return 'EVALUATED';
  if (assign.hasSubmitted) return 'SUBMITTED';

  if (assign.due_date) {
    const due = new Date(assign.due_date);
    if (!Number.isNaN(due.getTime()) && due < new Date()) {
      return 'OVERDUE';
    }
  }
  return 'PENDING';
}

export function StudentAssignmentsView({ assignments = [], onRefresh, showToast }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInstructions, setExpandedInstructions] = useState({});

  // Modal state: { assignment, mode: 'submit' | 'view' | 'feedback' }
  const [modalState, setModalState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({ githubUrl: '', text: '' });
  const [submissionFile, setSubmissionFile] = useState(null);

  // Compute statuses and counts from real backend data
  const enrichedAssignments = useMemo(() => {
    return (assignments || []).map((a) => ({
      ...a,
      computedStatus: getAssignmentStatus(a),
    }));
  }, [assignments]);

  const counts = useMemo(() => {
    const total = enrichedAssignments.length;
    const evaluated = enrichedAssignments.filter((a) => a.computedStatus === 'EVALUATED').length;
    const submittedOnly = enrichedAssignments.filter((a) => a.computedStatus === 'SUBMITTED').length;
    const overdue = enrichedAssignments.filter((a) => a.computedStatus === 'OVERDUE').length;
    const pendingOnly = enrichedAssignments.filter((a) => a.computedStatus === 'PENDING').length;
    return {
      total,
      pending: pendingOnly + overdue,
      submitted: submittedOnly + evaluated,
      overdue,
      evaluated,
    };
  }, [enrichedAssignments]);

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedAssignments.filter((a) => {
      if (statusFilter === 'PENDING' && a.computedStatus !== 'PENDING' && a.computedStatus !== 'OVERDUE') return false;
      if (statusFilter === 'SUBMITTED' && a.computedStatus !== 'SUBMITTED' && a.computedStatus !== 'EVALUATED') return false;
      if (statusFilter === 'OVERDUE' && a.computedStatus !== 'OVERDUE') return false;
      if (statusFilter === 'EVALUATED' && a.computedStatus !== 'EVALUATED') return false;

      if (q) {
        const title = (a.title || '').toLowerCase();
        const code = (a.course_code || '').toLowerCase();
        const courseTitle = (a.course_title || '').toLowerCase();
        const desc = (a.description || '').toLowerCase();
        if (!title.includes(q) && !code.includes(q) && !courseTitle.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [enrichedAssignments, statusFilter, searchQuery]);

  const toggleInstructions = (id) => {
    setExpandedInstructions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (assignment, mode) => {
    setModalState({ assignment, mode });
    setSubmissionForm({
      githubUrl: assignment.submission?.github_url || assignment.submission?.githubUrl || '',
      text: assignment.submission?.submission_text || assignment.submission?.text || '',
    });
    setSubmissionFile(null);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalState(null);
    setSubmissionFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalState?.assignment || submitting) return;

    if (!submissionForm.githubUrl.trim() && !submissionForm.text.trim() && !submissionFile) {
      showToast('Please provide a repository URL, notes, or attach a file before submitting.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('submissionText', submissionForm.text.trim());
      formData.append('githubUrl', submissionForm.githubUrl.trim());
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      await lmsService.submitAssignment(modalState.assignment.id, formData);
      showToast('Assignment submitted successfully!', 'success');
      setModalState(null);
      setSubmissionFile(null);
      setSubmissionForm({ githubUrl: '', text: '' });
      if (onRefresh) await onRefresh();
    } catch (err) {
      showToast('Submission failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'All', count: counts.total },
    { id: 'PENDING', label: 'Pending', count: counts.pending },
    { id: 'SUBMITTED', label: 'Submitted', count: counts.submitted },
    { id: 'OVERDUE', label: 'Overdue', count: counts.overdue },
    { id: 'EVALUATED', label: 'Evaluated', count: counts.evaluated },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EVALUATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#26966B]/12 text-[#26966B]">
            <Award className="w-3 h-3" />
            Evaluated
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#26966B]/12 text-[#26966B]">
            <CheckCircle2 className="w-3 h-3" />
            Submitted
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#B42318]/12 text-[#B42318] dark:text-[#F07178]">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5A13B]/15 text-[#B87A1E] dark:text-[#E5A13B]">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* 1. Compact Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Assignments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          View, manage and submit your coursework.
        </p>
      </div>

      {/* 2. Simple Assignment Statistics Row */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Assignments</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{counts.total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{counts.pending}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E5A13B]/12 text-[#E5A13B] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Submitted</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{counts.submitted}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#26966B]/12 text-[#26966B] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Compact Filter Tabs & Search Field */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-[#8B2942] text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course or title..."
            className="w-full h-9 pl-8 pr-8 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8B2942]"
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
      </div>

      {/* 4. Responsive Two-Column Assignment Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center space-y-1.5">
          <FileCheck2 className="w-7 h-7 text-muted-foreground mx-auto opacity-60" />
          <p className="text-sm font-semibold text-foreground">No assignments found</p>
          <p className="text-xs text-muted-foreground">
            {searchQuery ? 'Try adjusting your search keywords.' : 'No coursework matches the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assign) => {
            const status = assign.computedStatus;
            const hasInstructions = Boolean(assign.instructions && String(assign.instructions).trim());
            const isInstructionsOpen = Boolean(expandedInstructions[assign.id]);
            const formattedDue = assign.due_date
              ? new Date(assign.due_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={assign.id}
                className="bg-card text-card-foreground rounded-xl border border-border hover:border-[#8B2942]/35 p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Row: Course Code | Status Badge | Due Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {assign.course_code && (
                        <span className="font-bold text-[#8B2942] dark:text-[#F2B8C7]">
                          {assign.course_code}
                        </span>
                      )}
                      {getStatusBadge(status)}
                    </div>

                    {formattedDue && (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          status === 'OVERDUE'
                            ? 'text-[#B42318] dark:text-[#F07178]'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due: {formattedDue}</span>
                      </span>
                    )}
                  </div>

                  {/* Middle: Title & Short Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                      {assign.title}
                    </h3>
                    {assign.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {assign.description}
                      </p>
                    )}
                  </div>

                  {/* Expandable Instructions (only rendered when actual instructions exist) */}
                  {hasInstructions && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleInstructions(assign.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span>View Instructions</span>
                        {isInstructionsOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isInstructionsOpen && (
                        <div className="mt-2 p-3 rounded-lg bg-background border border-border text-xs text-muted-foreground leading-relaxed">
                          {assign.instructions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Contextual Info + One Compact Action Button */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground min-w-0 truncate">
                    {status === 'EVALUATED' && assign.submission?.grade !== undefined && assign.submission?.grade !== null ? (
                      <span className="font-semibold text-[#26966B]">
                        Score: {assign.submission.grade}/100
                      </span>
                    ) : status === 'SUBMITTED' ? (
                      <span className="text-[#26966B] font-medium">Awaiting evaluation</span>
                    ) : status === 'OVERDUE' ? (
                      <span className="text-[#B42318] dark:text-[#F07178] font-medium">Past deadline</span>
                    ) : (
                      <span>Not submitted yet</span>
                    )}
                  </div>

                  {status === 'EVALUATED' ? (
                    <button
                      type="button"
                      onClick={() => openModal(assign, 'feedback')}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#26966B]" />
                      <span>View Feedback</span>
                    </button>
                  ) : status === 'SUBMITTED' ? (
                    <button
                      type="button"
                      onClick={() => openModal(assign, 'view')}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      <span>View Submission</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(assign, 'submit')}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Submit Assignment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Clean Assignment Submission / View / Feedback Modal */}
      {modalState && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  {modalState.assignment.course_code && (
                    <span className="font-bold text-[#8B2942] dark:text-[#F2B8C7]">
                      {modalState.assignment.course_code}
                    </span>
                  )}
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {modalState.mode === 'feedback'
                      ? 'Evaluation Feedback'
                      : modalState.mode === 'view'
                      ? 'Submitted Work'
                      : 'Coursework Submission'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">
                  {modalState.assignment.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODE A: FEEDBACK OR VIEW SUBMISSION */}
            {modalState.mode !== 'submit' ? (
              <div className="space-y-4 text-xs">
                {modalState.mode === 'feedback' && (
                  <div className="p-3.5 rounded-xl bg-[#26966B]/10 border border-[#26966B]/25 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[#26966B]">
                      <span>Evaluation Score</span>
                      <span className="text-sm">{modalState.assignment.submission?.grade ?? '—'}/100</span>
                    </div>
                    {modalState.assignment.submission?.feedback && (
                      <p className="text-foreground leading-relaxed">
                        {modalState.assignment.submission.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2.5 p-3.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Status</span>
                    {getStatusBadge(modalState.assignment.computedStatus)}
                  </div>

                  {(modalState.assignment.submission?.github_url || modalState.assignment.submission?.githubUrl) && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                      <span className="text-muted-foreground font-medium">Repository / Project URL</span>
                      <a
                        href={modalState.assignment.submission?.github_url || modalState.assignment.submission?.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#8B2942] dark:text-[#F2B8C7] hover:underline truncate max-w-[260px]"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {(modalState.assignment.submission?.submission_text || modalState.assignment.submission?.text) && (
                    <div className="pt-2 border-t border-border space-y-1">
                      <span className="text-muted-foreground font-medium block">Submission Notes</span>
                      <p className="text-foreground leading-relaxed">
                        {modalState.assignment.submission?.submission_text || modalState.assignment.submission?.text}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {modalState.mode === 'view' && (
                    <button
                      type="button"
                      onClick={() => setModalState({ ...modalState, mode: 'submit' })}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
                    >
                      Update Submission
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* MODE B: SUBMIT ASSIGNMENT FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    GitHub Repository or Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={submissionForm.githubUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg text-xs bg-background border border-border text-foreground focus:outline-none focus:border-[#8B2942]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Upload Source Code or Report (.zip, .pdf, .py, .docx)
                  </label>
                  <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background border border-dashed border-border hover:border-[#8B2942]/50 text-xs text-muted-foreground cursor-pointer transition-colors">
                    <span className="flex items-center gap-2 truncate">
                      <Upload className="w-3.5 h-3.5 text-[#8B2942] shrink-0" />
                      <span className="truncate">
                        {submissionFile ? `${submissionFile.name} (${(submissionFile.size / 1024).toFixed(1)} KB)` : 'Choose file to attach...'}
                      </span>
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    />
                    {submissionFile && (
                      <span className="text-[11px] font-semibold text-[#26966B] shrink-0">Attached</span>
                    )}
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Submission Notes / Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add brief notes about your implementation, test cases, or setup..."
                    value={submissionForm.text}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, text: e.target.value })}
                    className="w-full p-2.5 rounded-lg text-xs bg-background border border-border text-foreground focus:outline-none focus:border-[#8B2942]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Assignment'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAssignmentsView;
