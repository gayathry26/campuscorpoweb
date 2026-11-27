import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal, LoadingSpinner } from '../components/Modal';
import {
  FileText,
  UploadCloud,
  Eye,
  Download,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Archive,
  Clock,
  Building2,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Filter,
  Search,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Info,
} from 'lucide-react';

const DEPARTMENTS = [
  { code: 'ALL', name: 'Institution-Wide (All Departments)' },
  { code: 'CSE', name: 'Computer Science and Engineering (CSE)' },
  { code: 'ECE', name: 'Electronics and Communication (ECE)' },
  { code: 'EEE', name: 'Electrical & Electronics (EEE)' },
  { code: 'MECH', name: 'Mechanical Engineering (MECH)' },
  { code: 'CIVIL', name: 'Civil Engineering (CIVIL)' },
  { code: 'IT', name: 'Information Technology (IT)' },
];

const ACADEMIC_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2027-2028'];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

export function Policies() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [waiverModalOpen, setWaiverModalOpen] = useState(false);

  // Action targets
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    academicYear: '2026-2027',
    departmentCode: 'ALL',
    effectiveDate: new Date().toISOString().slice(0, 10),
    status: 'PUBLISHED',
    file: null,
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    id: null,
    title: '',
    description: '',
    academicYear: '2026-2027',
    departmentCode: 'ALL',
    effectiveDate: '',
    status: 'PUBLISHED',
  });

  // Replace File Form
  const [replaceFile, setReplaceFile] = useState(null);

  // Department Coordinator Waiver Form
  const [waiverForm, setWaiverForm] = useState({
    register_number: '2023MECH001',
    job_id: 1,
    override_type: 'BACKLOG_WAIVER',
    reason: 'Cleared backlog in special revaluation; achieved 90% attendance in remedial training bootcamp.',
  });

  const isCoordinatorOrAdmin = [
    'FACULTY_COORDINATOR',
    'TPO_OFFICER',
    'ADMIN',
    'SUPER_ADMIN',
    'MANAGEMENT',
  ].includes(user?.roleName);

  const isStudent = user?.roleName === 'STUDENT';

  useEffect(() => {
    fetchPolicies();
    if (isCoordinatorOrAdmin) {
      fetchOverrides();
    }
  }, [user]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/policies');
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error('Failed to load placement policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverrides = async () => {
    try {
      const dept = user?.departmentCode || 'CSE';
      const res = await apiClient.get(`/policies/overrides/${dept}`);
      setOverrides(res.data.data || []);
    } catch (err) {
      // Overrides are optional / dept-specific
      setOverrides([]);
    }
  };

  // Preview Document in In-App Modal
  const handleOpenPreview = async (policy) => {
    setSelectedPolicy(policy);
    setPreviewLoading(true);
    setPreviewModalOpen(true);
    try {
      const res = await apiClient.get(`/policies/${policy.id}/preview`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      console.error('Preview error:', err);
      showToast('Unable to load document preview: ' + (err.response?.data?.message || 'Access Denied'), 'error');
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewModalOpen(false);
    setSelectedPolicy(null);
  };

  // Download Document
  const handleDownload = async (policy) => {
    try {
      const res = await apiClient.get(`/policies/${policy.id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = policy.fileName || `${(policy.title || 'policy').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download document: ' + (err.response?.data?.message || 'Access Denied'), 'error');
    }
  };

  // Open Upload Modal
  const handleOpenUpload = () => {
    setUploadForm({
      title: '',
      description: '',
      academicYear: user?.academicYear || '2026-2027',
      departmentCode: user?.roleName === 'FACULTY_COORDINATOR' ? (user?.departmentCode || 'CSE') : 'ALL',
      effectiveDate: new Date().toISOString().slice(0, 10),
      status: 'PUBLISHED',
      file: null,
    });
    setUploadModalOpen(true);
  };

  // Submit Upload Policy
  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      showToast('Please select an official PDF policy document file.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('academicYear', uploadForm.academicYear);
      formData.append('departmentCode', uploadForm.departmentCode);
      formData.append('effectiveDate', uploadForm.effectiveDate);
      formData.append('status', uploadForm.status);
      formData.append('policyFile', uploadForm.file);

      const res = await apiClient.post('/policies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast(res.data.message || 'Policy document uploaded successfully.', 'success');
      setUploadModalOpen(false);
      fetchPolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload policy document.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Metadata Modal
  const handleOpenEdit = (policy) => {
    setSelectedPolicy(policy);
    setEditForm({
      id: policy.id,
      title: policy.title,
      description: policy.description || '',
      academicYear: policy.academicYear || '2026-2027',
      departmentCode: policy.departmentCode || 'ALL',
      effectiveDate: policy.effectiveDate || new Date().toISOString().slice(0, 10),
      status: policy.status || 'PUBLISHED',
    });
    setEditModalOpen(true);
  };

  // Submit Edit Metadata
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.put(`/policies/${editForm.id}`, {
        title: editForm.title,
        description: editForm.description,
        academicYear: editForm.academicYear,
        departmentCode: editForm.departmentCode,
        effectiveDate: editForm.effectiveDate,
        status: editForm.status,
      });

      setEditModalOpen(false);
      fetchPolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update policy metadata.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Replace File Modal
  const handleOpenReplace = (policy) => {
    setSelectedPolicy(policy);
    setReplaceFile(null);
    setReplaceModalOpen(true);
  };

  // Submit Replace File
  const handleSubmitReplace = async (e) => {
    e.preventDefault();
    if (!replaceFile) {
      showToast('Please select a new PDF file to replace the existing document.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('policyFile', replaceFile);

      await apiClient.post(`/policies/${selectedPolicy.id}/replace-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Policy PDF document replaced successfully.', 'success');
      setReplaceModalOpen(false);
      fetchPolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to replace policy PDF.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Change Status (Publish / Archive / Draft)
  const handleChangeStatus = async (policy, newStatus) => {
    try {
      await apiClient.patch(`/policies/${policy.id}/status`, { status: newStatus });
      showToast(`Policy status updated to ${newStatus}`, 'success');
      fetchPolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change policy status.', 'error');
    }
  };

  // Delete Policy
  const handleDeletePolicy = async (policy) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${policy.title}"?`)) {
      return;
    }
    try {
      await apiClient.delete(`/policies/${policy.id}`);
      showToast('Policy document deleted successfully.', 'success');
      fetchPolicies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete policy document.', 'error');
    }
  };

  // Grant Coordinator Waiver
  const handleGrantWaiver = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/policies/grant-override', waiverForm);
      setWaiverModalOpen(false);
      fetchOverrides();
      showToast('Coordinator exception waiver recorded into Department Database!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to grant waiver.', 'error');
    }
  };

  // Filtered Policies
  const filteredPolicies = policies.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.fileName && p.fileName.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (deptFilter !== 'ALL') {
      if (deptFilter === 'INSTITUTION_WIDE') {
        if (!p.isInstitutionWide) return false;
      } else if (p.departmentCode !== deptFilter) {
        return false;
      }
    }
    if (statusFilter !== 'ALL' && p.status !== statusFilter) {
      return false;
    }
    if (yearFilter !== 'ALL' && p.academicYear !== yearFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isStudent ? 'Official Placement Policies & Guidelines' : 'Placement Policy & Document Management'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {isStudent ? `${user?.departmentCode || 'CSE'} Department` : 'Governance System'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isStudent
              ? 'Institutional placement regulations, code of conduct, and department guidelines applicable to your degree program.'
              : 'Publish, replace, archive, and audit college placement policy PDF documents across institutions and departments.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isCoordinatorOrAdmin && (
            <>
              <button
                onClick={() => setWaiverModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-sm font-semibold border border-border transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Grant Waiver
              </button>
              <button
                onClick={handleOpenUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Upload Policy PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar for Coordinator / Admin */}
      {isCoordinatorOrAdmin && (
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policy documents by title, keyword, or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm">
            {/* Department Scope Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              <option value="INSTITUTION_WIDE">Institution-Wide Only</option>
              <option value="CSE">CSE Department</option>
              <option value="ECE">ECE Department</option>
              <option value="EEE">EEE Department</option>
              <option value="MECH">MECH Department</option>
              <option value="CIVIL">CIVIL Department</option>
              <option value="IT">IT Department</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Academic Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">All Academic Years</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {(searchQuery || deptFilter !== 'ALL' || statusFilter !== 'ALL' || yearFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDeptFilter('ALL');
                  setStatusFilter('ALL');
                  setYearFilter('ALL');
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline px-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Loading verified placement policy documents..." />
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No Policy Documents Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isStudent
              ? 'No placement policy documents have been published for your department yet. Check back soon for official updates.'
              : 'No policies match the active filter criteria. Upload a new PDF policy document to publish it to students.'}
          </p>
          {isCoordinatorOrAdmin && (
            <button
              onClick={handleOpenUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] rounded-lg text-xs font-semibold shadow-xs mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload First Policy PDF
            </button>
          )}
        </div>
      ) : isStudent ? (
        /* ================= STUDENT PORTAL VIEW ================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolicies.map((policy) => {
              const isInstWide = policy.isInstitutionWide;
              return (
                <div
                  key={policy.id}
                  className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:border-foreground/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Badges row */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isInstWide
                            ? 'bg-secondary text-foreground border-border'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {isInstWide ? '🏛️ Institution-Wide Policy' : `🏢 ${policy.departmentCode} Department Policy`}
                      </span>

                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> AY {policy.academicYear}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">{policy.title}</h3>
                      {policy.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">
                          {policy.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata pills */}
                    <div className="bg-secondary/60 rounded-lg p-2.5 border border-border/60 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-foreground">Effective Date:</span>{' '}
                        {formatDate(policy.effectiveDate)}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <FileCheck className="w-3.5 h-3.5 text-foreground" />
                        <span>{policy.fileName || 'policy.pdf'}</span>
                        {policy.fileSize ? <span>• {formatBytes(policy.fileSize)}</span> : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 mt-4 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPreview(policy)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Document
                    </button>
                    <button
                      onClick={() => handleDownload(policy)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= PLACEMENT COORDINATOR / ADMIN VIEW ================= */
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Document Title & Details</th>
                    <th className="py-3 px-3">Scope / Dept</th>
                    <th className="py-3 px-3">Academic Year</th>
                    <th className="py-3 px-3">Effective Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Document File</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPolicies.map((policy) => {
                    const isDraft = policy.status === 'DRAFT';
                    const isArchived = policy.status === 'ARCHIVED';
                    const isPublished = policy.status === 'PUBLISHED';

                    return (
                      <tr key={policy.id} className="hover:bg-muted/30 transition-colors">
                        {/* Title & Description */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-foreground text-sm leading-snug">{policy.title}</div>
                          {policy.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{policy.description}</p>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Uploaded by {policy.uploaderName || 'Admin'} • {formatDate(policy.createdAt)}
                          </div>
                        </td>

                        {/* Department / Scope */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {policy.isInstitutionWide ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-foreground border border-border">
                              Institution-Wide
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              {policy.departmentCode} Department
                            </span>
                          )}
                        </td>

                        {/* Academic Year */}
                        <td className="py-3.5 px-3 font-mono text-xs text-foreground whitespace-nowrap">
                          {policy.academicYear}
                        </td>

                        {/* Effective Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-muted-foreground text-xs">
                          {formatDate(policy.effectiveDate)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isPublished && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published
                            </span>
                          )}
                          {isDraft && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" /> Draft
                            </span>
                          )}
                          {isArchived && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              <Archive className="w-3.5 h-3.5" /> Archived
                            </span>
                          )}
                        </td>

                        {/* Document File details */}
                        <td className="py-3.5 px-3 max-w-[160px] truncate">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-mono truncate" title={policy.fileName}>
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{policy.fileName || 'policy.pdf'}</span>
                          </div>
                          {policy.fileSize ? (
                            <span className="text-xs text-muted-foreground pl-5">{formatBytes(policy.fileSize)}</span>
                          ) : null}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => handleOpenPreview(policy)}
                              title="Preview PDF Document"
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Download */}
                            <button
                              onClick={() => handleDownload(policy)}
                              title="Download PDF"
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Replace File */}
                            <button
                              onClick={() => handleOpenReplace(policy)}
                              title="Replace PDF File"
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Edit Metadata */}
                            <button
                              onClick={() => handleOpenEdit(policy)}
                              title="Edit Details"
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Status Quick Switch */}
                            {isPublished ? (
                              <button
                                onClick={() => handleChangeStatus(policy, 'ARCHIVED')}
                                title="Archive Policy (Hide from Students)"
                                className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors cursor-pointer"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangeStatus(policy, 'PUBLISHED')}
                                title="Publish Policy (Make visible to Students)"
                                className="p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeletePolicy(policy)}
                              title="Delete Policy Document"
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Overrides List (Retained for Coordinators) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Authorized Department Eligibility Overrides (`lms_{user?.departmentCode?.toLowerCase() || 'cse'}`)
                </h3>
                <p className="text-xs text-muted-foreground">Candidate-specific exemptions evaluated live by the eligibility engine</p>
              </div>
              <span className="text-xs font-semibold bg-secondary text-foreground px-2.5 py-1 rounded-md border border-border">
                Department Isolation Active
              </span>
            </div>

            {overrides.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No active candidate exceptions granted in this department database.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overrides.map((ov) => (
                  <div key={ov.id} className="p-3.5 bg-secondary/50 rounded-xl border border-border text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground font-mono">{ov.register_number}</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-secondary text-foreground border border-border">
                        {ov.override_type}
                      </span>
                    </div>
                    <div className="text-muted-foreground font-medium">Job: {ov.job_title || `Job ID #${ov.job_id}`} ({ov.company_name || 'Campus Recruiter'})</div>
                    <p className="text-muted-foreground italic">"Reason: {ov.reason}"</p>
                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/80">
                      Approved by: {ov.approved_by} • {ov.approved_at}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: IN-APP PDF PREVIEW ================= */}
      <Modal isOpen={previewModalOpen} onClose={handleClosePreview} title={selectedPolicy?.title || 'Policy Document Preview'} maxWidth="max-w-5xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
            <div>
              <span className="font-semibold text-foreground">Scope:</span>{' '}
              {selectedPolicy?.isInstitutionWide ? 'Institution-Wide (All Departments)' : `${selectedPolicy?.departmentCode} Department`}
              {' • '}
              <span className="font-semibold text-foreground">Effective:</span> {formatDate(selectedPolicy?.effectiveDate)}
              {' • '}
              <span className="font-semibold text-foreground">Academic Year:</span> {selectedPolicy?.academicYear}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectedPolicy && handleDownload(selectedPolicy)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>

          <div className="w-full h-[650px] bg-secondary/30 rounded-lg overflow-hidden border border-border flex items-center justify-center">
            {previewLoading ? (
              <LoadingSpinner text="Decrypting and streaming PDF document..." />
            ) : previewBlobUrl ? (
              <iframe
                src={previewBlobUrl}
                title={selectedPolicy?.title || 'PDF Preview'}
                className="w-full h-full border-0 rounded-lg"
              />
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Preview unavailable. Please use the Download button above to view the policy.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: UPLOAD POLICY DOCUMENT ================= */}
      <Modal isOpen={uploadModalOpen} onClose={() => !submitting && setUploadModalOpen(false)} title="Upload College Placement Policy PDF">
        <form onSubmit={handleSubmitUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Document Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Campus Placement Code of Conduct 2026-27"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Academic Year</label>
              <select
                value={uploadForm.academicYear}
                onChange={(e) => setUploadForm({ ...uploadForm, academicYear: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Department Scope</label>
              <select
                value={uploadForm.departmentCode}
                onChange={(e) => setUploadForm({ ...uploadForm, departmentCode: e.target.value })}
                disabled={user?.roleName === 'FACULTY_COORDINATOR'}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden disabled:opacity-70"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {uploadForm.departmentCode === 'ALL'
                  ? '🌐 Visible to all students across every department.'
                  : `🎯 Visible only to ${uploadForm.departmentCode} department students.`}
              </span>
              {user?.roleName === 'FACULTY_COORDINATOR' && (
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Locked to coordinator's department ({user?.departmentCode || 'CSE'}).</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Effective Date</label>
              <input
                type="date"
                required
                value={uploadForm.effectiveDate}
                onChange={(e) => setUploadForm({ ...uploadForm, effectiveDate: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Initial Status</label>
              <select
                value={uploadForm.status}
                onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="PUBLISHED">Published (Immediately visible to students)</option>
                <option value="DRAFT">Draft (Internal review, hidden from students)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Description / Summary (Optional)</label>
            <textarea
              rows="2"
              placeholder="Brief summary of policy provisions, eligibility conditions, or drive criteria..."
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Policy Document File (.PDF only, max 15MB) <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-foreground/30 transition-colors">
              <input
                type="file"
                id="policy-file-input"
                accept=".pdf,application/pdf"
                required
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] || null })}
                className="hidden"
              />
              <label htmlFor="policy-file-input" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-1.5" />
                {uploadForm.file ? (
                  <div className="text-xs font-semibold text-foreground">
                    Selected: {uploadForm.file.name} ({formatBytes(uploadForm.file.size)})
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-foreground">Click to browse official PDF</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Strictly PDF documents up to 15MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Uploading & Validating...' : 'Upload & Save Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EDIT POLICY METADATA ================= */}
      <Modal isOpen={editModalOpen} onClose={() => !submitting && setEditModalOpen(false)} title="Edit Policy Document Metadata">
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Document Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Academic Year</label>
              <select
                value={editForm.academicYear}
                onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Department Scope</label>
              <select
                value={editForm.departmentCode}
                onChange={(e) => setEditForm({ ...editForm, departmentCode: e.target.value })}
                disabled={user?.roleName === 'FACULTY_COORDINATOR'}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden disabled:opacity-70"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {editForm.departmentCode === 'ALL'
                  ? '🌐 Visible to all students across every department.'
                  : `🎯 Visible only to ${editForm.departmentCode} department students.`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Effective Date</label>
              <input
                type="date"
                required
                value={editForm.effectiveDate}
                onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="PUBLISHED">Published (Visible to students)</option>
                <option value="DRAFT">Draft (Hidden from students)</option>
                <option value="ARCHIVED">Archived (Historical record, hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Description / Summary</label>
            <textarea
              rows="3"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Metadata'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: REPLACE POLICY PDF FILE ================= */}
      <Modal isOpen={replaceModalOpen} onClose={() => !submitting && setReplaceModalOpen(false)} title="Replace Policy PDF Document">
        <form onSubmit={handleSubmitReplace} className="space-y-4 text-xs">
          <div className="p-3 bg-secondary rounded-lg border border-border">
            <div className="font-semibold text-foreground">{selectedPolicy?.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Current File: <span className="font-mono">{selectedPolicy?.fileName}</span> ({formatBytes(selectedPolicy?.fileSize)})
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Select New PDF File (.pdf, max 15MB) <span className="text-destructive">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-foreground/30 transition-colors">
              <input
                type="file"
                id="replace-file-input"
                accept=".pdf,application/pdf"
                required
                onChange={(e) => setReplaceFile(e.target.files[0] || null)}
                className="hidden"
              />
              <label htmlFor="replace-file-input" className="cursor-pointer block">
                <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-1.5" />
                {replaceFile ? (
                  <div className="text-xs font-semibold text-foreground">
                    New File: {replaceFile.name} ({formatBytes(replaceFile.size)})
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-foreground">Click to select revised PDF</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Will permanently replace the existing file</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setReplaceModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Uploading Replacement...' : 'Replace PDF Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: GRANT WAIVER ================= */}
      <Modal isOpen={waiverModalOpen} onClose={() => setWaiverModalOpen(false)} title="Grant Department Coordinator Exception">
        <form onSubmit={handleGrantWaiver} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Student Register Number</label>
            <input
              type="text"
              required
              value={waiverForm.register_number}
              onChange={(e) => setWaiverForm({ ...waiverForm, register_number: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Target Job Drive</label>
            <select
              value={waiverForm.job_id}
              onChange={(e) => setWaiverForm({ ...waiverForm, job_id: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
            >
              <option value="1">Google India - Software Development Engineer</option>
              <option value="2">Microsoft India - Cloud Systems Engineer</option>
              <option value="3">TCS - Digital Systems Innovator</option>
              <option value="4">Larsen & Toubro - Core Graduate Trainee</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Exception / Waiver Type</label>
            <select
              value={waiverForm.override_type}
              onChange={(e) => setWaiverForm({ ...waiverForm, override_type: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-hidden"
            >
              <option value="BACKLOG_WAIVER">Backlog Waiver (Cleared in revaluation or special permission)</option>
              <option value="CGPA_WAIVER">CGPA Threshold Waiver (Marginal waiver with project distinction)</option>
              <option value="SPECIAL_PERMISSION">Special Institutional Discretion Permission</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Official Academic Justification</label>
            <textarea
              rows="3"
              required
              value={waiverForm.reason}
              onChange={(e) => setWaiverForm({ ...waiverForm, reason: e.target.value })}
              className="w-full p-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-hidden"
              placeholder="State the academic justification for this candidate exception..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setWaiverModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Persist Exception into Department DB
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
