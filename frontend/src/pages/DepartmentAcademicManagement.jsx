import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';
import { Modal, LoadingSpinner } from '../components/Modal';
import {
  Building2,
  GraduationCap,
  UploadCloud,
  History,
  Database,
  Plus,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Check,
  ChevronRight,
  Server,
  Layers,
  Users,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

export function DepartmentAcademicManagement() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: 'departments' | 'academics' | 'import' | 'history' | 'databases'
  const activeTab = searchParams.get('tab') || 'departments';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // -------------------------------------------------------------
  // Data States
  // -------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [academicStructures, setAcademicStructures] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [databaseStatus, setDatabaseStatus] = useState(null);

  // Search & Filter States
  const [deptSearch, setDeptSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedAcademicDept, setSelectedAcademicDept] = useState('');

  // -------------------------------------------------------------
  // Modals & Action States
  // -------------------------------------------------------------
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [deptWizardStep, setDeptWizardStep] = useState(1); // 1: Identity, 2: Program & HOD, 3: Database & Isolation, 4: Review & Confirm
  const [deptFormErrors, setDeptFormErrors] = useState({});
  const [deptSubmissionError, setDeptSubmissionError] = useState(null);
  const [deptConflictInfo, setDeptConflictInfo] = useState(null);
  const [isUpdatingExistingDept, setIsUpdatingExistingDept] = useState(false);
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [hasRestoredDeptDraft, setHasRestoredDeptDraft] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptFormData, setDeptFormData] = useState({
    dept_code: '',
    dept_name: '',
    description: '',
    hod_name: '',
    hod_email: '',
    duration_years: 4,
    total_semesters: 8,
    auto_provision: true,
  });

  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [isEditStructureOpen, setIsEditStructureOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [structureFormData, setStructureFormData] = useState({
    dept_code: 'CSE',
    academic_year: '2026-2027',
    admission_batch: '2023-2027',
    programme_name: 'B.Tech',
    duration_years: 4,
    total_semesters: 8,
    year_of_study: 4,
    semester: 7,
    class_name: 'CSE-A',
    section: 'A',
    class_advisor_name: '',
    class_advisor_email: '',
    max_capacity: 60,
  });

  const [provisioningDeptCode, setProvisioningDeptCode] = useState(null);
  const [verifyingDeptCode, setVerifyingDeptCode] = useState(null);

  // -------------------------------------------------------------
  // Bulk Import Wizard State
  // -------------------------------------------------------------
  const [importStep, setImportStep] = useState(1); // 1: Config, 2: Upload, 3: Preview/Validate, 4: Result
  const [importConfig, setImportConfig] = useState({
    department: 'CSE',
    data_type: 'STUDENT_MASTER',
    import_mode: 'UPSERT',
    academic_year: '2026-2027',
    admission_batch: '2023-2027',
    year_of_study: 4,
    semester: 7,
    class_name: 'CSE-A',
    section: 'A',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [importOutcome, setImportOutcome] = useState(null);
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const res = await apiClient.get('/admin/departments');
        setDepartments(res.data.data || []);
      } else if (activeTab === 'academics') {
        const [deptRes, acadRes] = await Promise.all([
          apiClient.get('/admin/departments'),
          apiClient.get('/admin/academics')
        ]);
        setDepartments(deptRes.data.data || []);
        setAcademicStructures(acadRes.data.data || []);
        if (!selectedAcademicDept && deptRes.data.data?.length > 0) {
          setSelectedAcademicDept(deptRes.data.data[0].dept_code);
        }
      } else if (activeTab === 'import') {
        const res = await apiClient.get('/admin/departments');
        setDepartments(res.data.data || []);
        if (res.data.data?.length > 0 && !importConfig.department) {
          setImportConfig(prev => ({ ...prev, department: res.data.data[0].dept_code }));
        }
      } else if (activeTab === 'history') {
        const res = await apiClient.get('/admin/imports/history');
        setImportHistory(res.data.data || []);
      } else if (activeTab === 'databases') {
        const res = await apiClient.get('/admin/database-status');
        setDatabaseStatus(res.data.data || null);
      }
    } catch (err) {
      console.error('Error fetching admin academic data:', err);
      showToast('Failed to load data: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedAcademicDept, importConfig.department, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // -------------------------------------------------------------
  // Draft Persistence Handlers (Client localStorage & Backend Sync)
  // -------------------------------------------------------------
  const DEPT_DRAFT_KEY = 'campuscorp_dept_wizard_draft';
  const IMPORT_DRAFT_KEY = 'campuscorp_import_wizard_draft';

  const saveDeptDraft = useCallback((data, step) => {
    try {
      const draftObj = { data, step, timestamp: new Date().toISOString() };
      localStorage.setItem(DEPT_DRAFT_KEY, JSON.stringify(draftObj));
      apiClient.put('/admin/wizard-drafts/DEPARTMENT_CREATION', { draftData: data, step }).catch(() => {});
    } catch (e) {
      console.warn('Could not save dept draft to localStorage:', e);
    }
  }, []);

  const loadDeptDraft = useCallback(async () => {
    try {
      const local = localStorage.getItem(DEPT_DRAFT_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.data && (parsed.data.dept_code || parsed.data.dept_name || parsed.data.hod_name)) {
          setDeptFormData(prev => ({ ...prev, ...parsed.data }));
          if (parsed.step) setDeptWizardStep(parsed.step);
          setHasRestoredDeptDraft(true);
          return;
        }
      }
      const res = await apiClient.get('/admin/wizard-drafts/DEPARTMENT_CREATION').catch(() => null);
      if (res?.data?.data?.draftData) {
        const bd = res.data.data.draftData;
        if (bd.dept_code || bd.dept_name || bd.hod_name) {
          setDeptFormData(prev => ({ ...prev, ...bd }));
          if (res.data.data.step) setDeptWizardStep(res.data.data.step);
          setHasRestoredDeptDraft(true);
        }
      }
    } catch (e) {
      console.warn('Could not load dept draft:', e);
    }
  }, []);

  const clearDeptDraft = useCallback(() => {
    try {
      localStorage.removeItem(DEPT_DRAFT_KEY);
      setHasRestoredDeptDraft(false);
      setIsUpdatingExistingDept(false);
      setDeptConflictInfo(null);
      setDeptFormData({
        dept_code: '',
        dept_name: '',
        description: '',
        hod_name: '',
        hod_email: '',
        duration_years: 4,
        total_semesters: 8,
        auto_provision: true,
      });
      setDeptWizardStep(1);
      setDeptFormErrors({});
      setDeptSubmissionError(null);
      apiClient.delete('/admin/wizard-drafts/DEPARTMENT_CREATION').catch(() => {});
      showToast('Department creation draft discarded.', 'info');
    } catch (e) {
      console.warn('Could not clear dept draft:', e);
    }
  }, [showToast]);

  const saveImportDraft = useCallback((config, step) => {
    try {
      const draftObj = { config, step, timestamp: new Date().toISOString() };
      localStorage.setItem(IMPORT_DRAFT_KEY, JSON.stringify(draftObj));
      apiClient.put('/admin/wizard-drafts/BULK_IMPORT', { draftData: config, step }).catch(() => {});
    } catch (e) {}
  }, []);

  const loadImportDraft = useCallback(async () => {
    try {
      const local = localStorage.getItem(IMPORT_DRAFT_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.config) {
          setImportConfig(prev => ({ ...prev, ...parsed.config }));
          if (parsed.step && parsed.step < 4) {
            setImportStep(parsed.step);
          }
          return;
        }
      }
      const res = await apiClient.get('/admin/wizard-drafts/BULK_IMPORT').catch(() => null);
      if (res?.data?.data?.draftData) {
        setImportConfig(prev => ({ ...prev, ...res.data.data.draftData }));
        if (res.data.data.step && res.data.data.step < 4) {
          setImportStep(res.data.data.step);
        }
      }
    } catch (e) {}
  }, []);

  const clearImportDraft = useCallback(() => {
    try {
      localStorage.removeItem(IMPORT_DRAFT_KEY);
      apiClient.delete('/admin/wizard-drafts/BULK_IMPORT').catch(() => {});
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadDeptDraft();
    loadImportDraft();
  }, [loadDeptDraft, loadImportDraft]);

  // -------------------------------------------------------------
  // Department Wizard Navigation & Validation Handlers
  // -------------------------------------------------------------
  const validateDeptStep = (step) => {
    const errors = {};
    if (step === 1) {
      const code = (deptFormData.dept_code || '').trim().toUpperCase();
      if (!code) {
        errors.dept_code = 'Department code is required.';
      } else if (!/^[A-Z0-9_]{2,15}$/.test(code)) {
        errors.dept_code = 'Code must be 2–15 uppercase alphanumeric characters (e.g. CSE, ECE, AIDS).';
      } else if (!isUpdatingExistingDept && departments.some(d => d.dept_code.toUpperCase() === code)) {
        errors.dept_code = `Department code '${code}' is already registered. Choose 'Update & Re-provision' below or enter a unique code.`;
      }

      const name = (deptFormData.dept_name || '').trim();
      if (!name) {
        errors.dept_name = 'Department full name is required.';
      } else if (name.length < 3) {
        errors.dept_name = 'Department name must be at least 3 characters.';
      }
    } else if (step === 2) {
      const hod = (deptFormData.hod_name || '').trim();
      if (!hod) {
        errors.hod_name = 'Head of Department (HOD) name is required.';
      }
      const email = (deptFormData.hod_email || '').trim();
      if (!email) {
        errors.hod_email = 'HOD institutional email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.hod_email = 'Please provide a valid email address (e.g. hod.cse@college.edu).';
      }
      if (deptFormData.duration_years < 1 || deptFormData.duration_years > 6) {
        errors.duration_years = 'Duration must be between 1 and 6 years.';
      }
      if (deptFormData.total_semesters < 1 || deptFormData.total_semesters > 12) {
        errors.total_semesters = 'Semesters must be between 1 and 12.';
      }
    }
    setDeptFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextDeptStep = () => {
    if (validateDeptStep(deptWizardStep)) {
      const nextStep = deptWizardStep + 1;
      setDeptWizardStep(nextStep);
      saveDeptDraft(deptFormData, nextStep);
    }
  };

  const handleBackDeptStep = () => {
    setDeptFormErrors({});
    setDeptSubmissionError(null);
    const prevStep = Math.max(1, deptWizardStep - 1);
    setDeptWizardStep(prevStep);
    saveDeptDraft(deptFormData, prevStep);
  };

  const handleSubmitDepartment = async (e, forceUpdate = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateDeptStep(1)) {
      setDeptWizardStep(1);
      showToast('Please correct department identity details.', 'error');
      return;
    }
    if (!validateDeptStep(2)) {
      setDeptWizardStep(2);
      showToast('Please correct academic program & HOD details.', 'error');
      return;
    }
    setIsSubmittingDept(true);
    setDeptSubmissionError(null);
    setDeptConflictInfo(null);
    try {
      const isExistingCode = departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase());
      const payload = {
        ...deptFormData,
        update_if_exists: Boolean(forceUpdate || isUpdatingExistingDept || isExistingCode),
      };
      const res = await apiClient.post('/admin/departments', payload);
      showToast(res.data.message || 'Department successfully created and provisioned!', 'success');
      clearDeptDraft();
      setIsCreateDeptOpen(false);
      setIsUpdatingExistingDept(false);
      setDeptFormData({
        dept_code: '',
        dept_name: '',
        description: '',
        hod_name: '',
        hod_email: '',
        duration_years: 4,
        total_semesters: 8,
        auto_provision: true,
      });
      setDeptWizardStep(1);
      fetchInitialData();
    } catch (err) {
      let errMsg = err.response?.data?.message || err.message || 'Failed to create department';
      if (err.response?.status === 502 || err.message?.includes('502')) {
        errMsg = 'Backend server or MySQL database is unreachable (HTTP 502 Bad Gateway). Please verify that the Node backend (port 5000) and MySQL service are running.';
      }
      setDeptSubmissionError(errMsg);
      if (err.response?.status === 409 || err.response?.data?.code === 'DEPARTMENT_EXISTS') {
        setDeptConflictInfo(err.response?.data?.existingDept || { dept_code: deptFormData.dept_code });
      }
      showToast('Department error: ' + errMsg, 'error');
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      const res = await apiClient.put(`/admin/departments/${editingDept.dept_code}`, editingDept);
      showToast(res.data.message || 'Department updated successfully!', 'success');
      setIsEditDeptOpen(false);
      setEditingDept(null);
      fetchInitialData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleProvisionDb = async (deptCode) => {
    setProvisioningDeptCode(deptCode);
    try {
      const res = await apiClient.post(`/admin/departments/${deptCode}/provision`);
      showToast(res.data.message || 'Database provisioned successfully!', 'success');
      fetchInitialData();
    } catch (err) {
      showToast('Provisioning error: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setProvisioningDeptCode(null);
    }
  };

  const handleVerifyDb = async (deptCode) => {
    setVerifyingDeptCode(deptCode);
    try {
      const res = await apiClient.get(`/admin/departments/${deptCode}/verify`);
      const v = res.data.data;
      if (v.status === 'UP') {
        showToast(`Department database '${v.databaseName}' is UP (${v.latencyMs}ms, ${v.studentCount} students).`, 'success');
      } else {
        showToast(`Database '${v.databaseName}' is DOWN: ${v.lastError}`, 'error');
      }
      fetchInitialData();
    } catch (err) {
      showToast('Verification error: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setVerifyingDeptCode(null);
    }
  };

  // -------------------------------------------------------------
  // Academic Structure Handlers
  // -------------------------------------------------------------
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/admin/academics', structureFormData);
      showToast(res.data.message || 'Academic structure created!', 'success');
      setIsCreateStructureOpen(false);
      fetchInitialData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleEditStructure = async (e) => {
    e.preventDefault();
    if (!editingStructure) return;
    try {
      const res = await apiClient.put(`/admin/academics/${editingStructure.id}`, editingStructure);
      showToast(res.data.message || 'Academic structure updated!', 'success');
      setIsEditStructureOpen(false);
      setEditingStructure(null);
      fetchInitialData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this academic structure mapping?')) return;
    try {
      await apiClient.delete(`/admin/academics/${id}`);
      showToast('Academic structure deleted.', 'success');
      fetchInitialData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // Bulk Import Handlers
  // -------------------------------------------------------------
  const handleDownloadTemplate = async (format) => {
    setDownloadingFormat(format);
    try {
      const dept = importConfig.department || 'CSE';
      const type = importConfig.data_type || 'STUDENT_MASTER';
      const res = await apiClient.get('/admin/imports/template', {
        params: { dataType: type, format, department: dept },
        responseType: 'blob',
      });

      let filename = `campuscorp_${dept.toLowerCase()}_${type.toLowerCase()}_template.${format.toLowerCase()}`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      let mimeType = 'application/octet-stream';
      if (format.toUpperCase() === 'CSV') mimeType = 'text/csv;charset=utf-8;';
      else if (format.toUpperCase() === 'XLSX') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (format.toUpperCase() === 'JSON') mimeType = 'application/json;charset=utf-8;';

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(`Successfully downloaded ${format} template for ${dept}`, 'success');
    } catch (err) {
      console.error('Error downloading template:', err);
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errObj = JSON.parse(text);
          showToast('Template download failed: ' + (errObj.message || text), 'error');
          return;
        } catch (e) {}
      }
      showToast('Template download failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleValidateUploadedFile = async () => {
    if (!selectedFile) {
      showToast('Please select a file to upload.', 'warning');
      return;
    }
    setIsValidatingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('department', importConfig.department);
      formData.append('data_type', importConfig.data_type);
      formData.append('academic_year', importConfig.academic_year);
      formData.append('admission_batch', importConfig.admission_batch);
      formData.append('year_of_study', importConfig.year_of_study);
      formData.append('semester', importConfig.semester);
      formData.append('class_name', importConfig.class_name);
      formData.append('section', importConfig.section);

      const res = await apiClient.post('/admin/imports/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreviewData(res.data);
      setImportStep(3);
      showToast(`Parsed ${res.data.summary.totalRows} rows. ${res.data.summary.validRows} valid.`, 'success');
    } catch (err) {
      showToast('Parsing failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsValidatingFile(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.allRecords) return;
    setIsExecutingImport(true);
    try {
      const res = await apiClient.post('/admin/imports/confirm', {
        department: importConfig.department,
        data_type: importConfig.data_type,
        import_mode: importConfig.import_mode,
        records: previewData.allRecords,
        metadata: {
          fileName: previewData.fileInfo?.fileName || 'bulk_upload.csv',
          fileFormat: previewData.fileInfo?.fileFormat || 'CSV',
          fileSizeBytes: previewData.fileInfo?.fileSizeBytes || 0,
          academic_year: importConfig.academic_year,
          admission_batch: importConfig.admission_batch,
          semester: importConfig.semester,
          class_name: importConfig.class_name,
          section: importConfig.section,
        }
      });

      setImportOutcome(res.data.data);
      setImportStep(4);
      showToast(`Successfully imported ${res.data.data.importedRows} records into isolated ${importConfig.department} database!`, 'success');
    } catch (err) {
      showToast('Import failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsExecutingImport(false);
    }
  };

  const handleDownloadErrorReport = async (jobId) => {
    try {
      const res = await apiClient.get(`/admin/imports/error-report/${jobId}`, {
        responseType: 'blob',
      });
      let filename = `error_report_job_${jobId}.csv`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Error report downloaded successfully.', 'success');
    } catch (err) {
      showToast('Failed to download error report: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDownloadPreviewErrors = () => {
    if (!previewData?.allRecords) return;
    const invalidRows = previewData.allRecords.filter(r => r.status !== 'VALID');
    if (invalidRows.length === 0) {
      showToast('No invalid rows to export.', 'info');
      return;
    }
    const headers = ['Row', 'Registration Number', 'Email', 'Status', 'Errors'];
    const csvLines = [headers.join(',')];
    for (const r of invalidRows) {
      const line = [
        r.rowNumber,
        `"${r.register_number || ''}"`,
        `"${r.email || ''}"`,
        `"${r.status || ''}"`,
        `"${(r.errors || []).join('; ')}"`
      ].join(',');
      csvLines.push(line);
    }
    const blob = new Blob([csvLines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `import_validation_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // Filtered Computed Lists
  // -------------------------------------------------------------
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesSearch =
        d.dept_code.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.dept_name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        (d.hod_name && d.hod_name.toLowerCase().includes(deptSearch.toLowerCase()));
      const matchesStatus =
        selectedDeptFilter === 'ALL' ||
        (selectedDeptFilter === 'ACTIVE' && d.is_active) ||
        (selectedDeptFilter === 'INACTIVE' && !d.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [departments, deptSearch, selectedDeptFilter]);

  const filteredAcademicStructures = useMemo(() => {
    if (!selectedAcademicDept) return academicStructures;
    return academicStructures.filter(s => s.dept_code === selectedAcademicDept);
  }, [academicStructures, selectedAcademicDept]);

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------- */}
      {/* Header & Section Title                                      */}
      {/* ----------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              CampusCorp Institutional Governance
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              MySQL XAMPP Multi-Tenant
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Department & Academic Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage academic departments, configure isolated tenant MySQL databases, structure academic cohorts, and execute verified bulk student data imports.
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateDeptOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setImportStep(1);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Data Import</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Subsections Navigation Tabs                                 */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'departments'
              ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Management</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'academics'
              ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academic Structure</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50">
            {academicStructures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'import'
              ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Student Data Import</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Import History</span>
        </button>

        <button
          onClick={() => setActiveTab('databases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'databases'
              ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting to CampusCorp database registry..." />
      ) : (
        <>
          {/* ========================================================= */}
          {/* 1. Department Management Subsection                       */}
          {/* ========================================================= */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Departments</span>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{departments.length}</div>
                  <span className="text-xs text-muted-foreground mt-1 block">Configured academic entities</span>
                </div>

                <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Provisioned DBs</span>
                    <Database className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {departments.filter(d => d.provisioning_status === 'READY').length} / {departments.length}
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                    Dedicated isolated schemas
                  </span>
                </div>

                <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Enrolled Students</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {departments.reduce((acc, d) => acc + (d.studentCount || 0), 0)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">Live across all department DBs</span>
                </div>

                <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Academic Cohorts</span>
                    <Layers className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {departments.reduce((acc, d) => acc + (d.academic_structures_count || 0), 0)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">Mapped classes & sections</span>
                </div>
              </div>

              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    placeholder="Search by code, department name, HOD..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-background border border-border focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-medium cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>

                  <button
                    onClick={fetchInitialData}
                    className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                    title="Refresh departments"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Department Table */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-xs uppercase font-semibold border-b border-border text-muted-foreground">
                      <tr>
                        <th className="py-3.5 px-5">Dept Code</th>
                        <th className="py-3.5 px-5">Department Full Name</th>
                        <th className="py-3.5 px-5">Dedicated MySQL Database</th>
                        <th className="py-3.5 px-5">Head of Department (HOD)</th>
                        <th className="py-3.5 px-5">Programme Duration</th>
                        <th className="py-3.5 px-5">Students</th>
                        <th className="py-3.5 px-5">DB Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDepartments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-muted-foreground">
                            No departments found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredDepartments.map((dept) => {
                          const isProvisioning = provisioningDeptCode === dept.dept_code;
                          const isVerifying = verifyingDeptCode === dept.dept_code;
                          const isReady = dept.provisioning_status === 'READY';

                          return (
                            <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-5 font-mono font-bold text-foreground">
                                <span className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-foreground text-xs">
                                  {dept.dept_code}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <div className="font-semibold text-foreground">{dept.dept_name}</div>
                                {dept.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                                    {dept.description}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 font-mono text-xs text-primary font-medium">
                                <div className="flex items-center gap-1.5">
                                  <Database className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>{dept.database_name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                {dept.hod_name ? (
                                  <div>
                                    <div className="font-medium text-foreground text-xs">{dept.hod_name}</div>
                                    <div className="text-[11px] text-muted-foreground">{dept.hod_email || '—'}</div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                )}
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground">
                                {dept.duration_years || 4} Years ({dept.total_semesters || 8} Sems)
                              </td>
                              <td className="py-4 px-5">
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                  <Users className="w-3 h-3" />
                                  {dept.studentCount || 0}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    isReady
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isReady ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                  />
                                  {dept.provisioning_status}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleVerifyDb(dept.dept_code)}
                                    disabled={isVerifying}
                                    title="Verify Database Connectivity"
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                                  </button>

                                  {!isReady && (
                                    <button
                                      onClick={() => handleProvisionDb(dept.dept_code)}
                                      disabled={isProvisioning}
                                      title="Provision Dedicated Database"
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                                    >
                                      {isProvisioning ? 'Provisioning...' : 'Provision DB'}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setEditingDept({ ...dept });
                                      setIsEditDeptOpen(true);
                                    }}
                                    title="Edit Department"
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedAcademicDept(dept.dept_code);
                                      setActiveTab('academics');
                                    }}
                                    title="Configure Academic Structure"
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <Layers className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setImportConfig(prev => ({ ...prev, department: dept.dept_code }));
                                      setActiveTab('import');
                                      setImportStep(1);
                                    }}
                                    title="Bulk Import Students"
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <UploadCloud className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. Academic Structure Management Subsection               */}
          {/* ========================================================= */}
          {activeTab === 'academics' && (
            <div className="space-y-6">
              {/* Hierarchy Visualizer Banner */}
              <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Institutional Academic Hierarchy
                  </span>
                  <span className="text-xs text-primary font-semibold">Strict Relational Isolation</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-foreground font-mono">
                    Department ({selectedAcademicDept || 'ALL'})
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-foreground">
                    Academic Year (e.g. 2026–2027)
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-foreground">
                    Admission Batch (e.g. 2023–2027)
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-foreground">
                    Year of Study & Semester
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-foreground">
                    Class Group & Section
                  </span>
                </div>
              </div>

              {/* Selector and Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Target Department:</label>
                  <select
                    value={selectedAcademicDept}
                    onChange={(e) => setSelectedAcademicDept(e.target.value)}
                    className="px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-semibold cursor-pointer min-w-44"
                  >
                    {departments.map((d) => (
                      <option key={d.dept_code} value={d.dept_code}>
                        {d.dept_code} — {d.dept_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setStructureFormData(prev => ({
                        ...prev,
                        dept_code: selectedAcademicDept || 'CSE'
                      }));
                      setIsCreateStructureOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Class & Section</span>
                  </button>
                  <button
                    onClick={fetchInitialData}
                    className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Academic Structures Table */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-xs uppercase font-semibold border-b border-border text-muted-foreground">
                      <tr>
                        <th className="py-3.5 px-5">Class & Section</th>
                        <th className="py-3.5 px-5">Academic Period</th>
                        <th className="py-3.5 px-5">Admission Batch</th>
                        <th className="py-3.5 px-5">Study Progression</th>
                        <th className="py-3.5 px-5">Class Advisor</th>
                        <th className="py-3.5 px-5">Enrolled / Capacity</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAcademicStructures.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-muted-foreground">
                            No academic structures configured for this department yet. Click "+ Add Class & Section" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredAcademicStructures.map((st) => {
                          const enrolled = st.enrolledStudents || 0;
                          const maxCap = st.max_capacity || 60;
                          const pct = Math.min(Math.round((enrolled / maxCap) * 100), 100);

                          return (
                            <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-5">
                                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                  <span>{st.class_name}</span>
                                  <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">
                                    Sec {st.section}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">{st.programme_name || 'B.Tech'}</span>
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground font-medium">
                                {st.academic_year}
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground font-mono">
                                {st.admission_batch}
                              </td>
                              <td className="py-4 px-5 text-xs">
                                <div className="font-semibold text-foreground">Year {st.year_of_study}</div>
                                <div className="text-muted-foreground text-[11px]">Semester {st.semester}</div>
                              </td>
                              <td className="py-4 px-5">
                                {st.class_advisor_name ? (
                                  <div>
                                    <div className="font-medium text-foreground text-xs">{st.class_advisor_name}</div>
                                    <div className="text-[11px] text-muted-foreground">{st.class_advisor_email || '—'}</div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">None assigned</span>
                                )}
                              </td>
                              <td className="py-4 px-5">
                                <div className="space-y-1 max-w-[130px]">
                                  <div className="flex justify-between text-xs font-medium">
                                    <span className="font-bold text-foreground">{enrolled}</span>
                                    <span className="text-muted-foreground">/ {maxCap}</span>
                                  </div>
                                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        pct >= 90 ? 'bg-amber-500' : 'bg-primary'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    st.is_active
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                                  }`}
                                >
                                  {st.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingStructure({ ...st });
                                      setIsEditStructureOpen(true);
                                    }}
                                    title="Edit Structure"
                                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStructure(st.id)}
                                    title="Delete Structure"
                                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. Bulk Student Data Import Subsection                    */}
          {/* ========================================================= */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      importStep === 1
                        ? 'bg-primary/5 border-primary text-foreground'
                        : importStep > 1
                        ? 'border-emerald-500/30 bg-emerald-50/20 text-muted-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        importStep > 1
                          ? 'bg-emerald-500 text-white'
                          : importStep === 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {importStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">Step 1</div>
                      <div className="text-xs font-semibold">Context & Template</div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      importStep === 2
                        ? 'bg-primary/5 border-primary text-foreground'
                        : importStep > 2
                        ? 'border-emerald-500/30 bg-emerald-50/20 text-muted-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        importStep > 2
                          ? 'bg-emerald-500 text-white'
                          : importStep === 2
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {importStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">Step 2</div>
                      <div className="text-xs font-semibold">Upload File</div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      importStep === 3
                        ? 'bg-primary/5 border-primary text-foreground'
                        : importStep > 3
                        ? 'border-emerald-500/30 bg-emerald-50/20 text-muted-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        importStep > 3
                          ? 'bg-emerald-500 text-white'
                          : importStep === 3
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {importStep > 3 ? <Check className="w-4 h-4" /> : '3'}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">Step 3</div>
                      <div className="text-xs font-semibold">Preview & Validate</div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      importStep === 4
                        ? 'bg-emerald-500/10 border-emerald-500 text-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        importStep === 4 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      4
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">Step 4</div>
                      <div className="text-xs font-semibold">Execution Results</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 1: Context & Configuration */}
              {importStep === 1 && (
                <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-6 shadow-xs">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">1. Select Target Department & Academic Context</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Uploaded student records will be validated and inserted directly into the selected department's isolated MySQL tenant database.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                        Target Department *
                      </label>
                      <select
                        value={importConfig.department}
                        onChange={(e) => setImportConfig({ ...importConfig, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold cursor-pointer"
                      >
                        {departments.map((d) => (
                          <option key={d.dept_code} value={d.dept_code}>
                            {d.dept_code} — {d.dept_name} ({d.database_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                        Type of Data to Import *
                      </label>
                      <select
                        value={importConfig.data_type}
                        onChange={(e) => setImportConfig({ ...importConfig, data_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold cursor-pointer"
                      >
                        <option value="STUDENT_MASTER">Student Master Records (Roster, Info, Placement)</option>
                        <option value="ACADEMIC_RECORDS">Student Academic Records (CGPA, SGPA, Backlogs)</option>
                        <option value="SEMESTER_MARKS">Semester Marks & Attendance Records</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                        Import Mode *
                      </label>
                      <select
                        value={importConfig.import_mode}
                        onChange={(e) => setImportConfig({ ...importConfig, import_mode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold cursor-pointer"
                      >
                        <option value="UPSERT">UPSERT (Insert new and update existing by Reg No)</option>
                        <option value="INSERT_ONLY">Insert New Records Only (Skip existing)</option>
                        <option value="UPDATE_EXISTING">Update Existing Records Only (Skip new)</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Context Fallback */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground block">
                      Default Academic Context (Used if file rows omit these columns):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Academic Year</label>
                        <input
                          type="text"
                          value={importConfig.academic_year}
                          onChange={(e) => setImportConfig({ ...importConfig, academic_year: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground"
                          placeholder="2026-2027"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Admission Batch</label>
                        <input
                          type="text"
                          value={importConfig.admission_batch}
                          onChange={(e) => setImportConfig({ ...importConfig, admission_batch: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground"
                          placeholder="2023-2027"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Study Year & Sem</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            value={importConfig.year_of_study}
                            onChange={(e) => setImportConfig({ ...importConfig, year_of_study: parseInt(e.target.value, 10) })}
                            className="w-1/2 px-2 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground"
                            placeholder="Yr"
                          />
                          <input
                            type="number"
                            value={importConfig.semester}
                            onChange={(e) => setImportConfig({ ...importConfig, semester: parseInt(e.target.value, 10) })}
                            className="w-1/2 px-2 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground"
                            placeholder="Sem"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Default Class Name</label>
                        <input
                          type="text"
                          value={importConfig.class_name}
                          onChange={(e) => setImportConfig({ ...importConfig, class_name: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground"
                          placeholder="CSE-A"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted-foreground mb-1">Default Section</label>
                        <input
                          type="text"
                          value={importConfig.section}
                          onChange={(e) => setImportConfig({ ...importConfig, section: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground uppercase"
                          placeholder="A"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Download Section */}
                  <div className="pt-2 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Download Sample Template for {importConfig.department}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Includes valid headers and pre-filled sample records with formula-injection prevention.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={downloadingFormat !== null}
                        onClick={() => handleDownloadTemplate('CSV')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {downloadingFormat === 'CSV' ? (
                          <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span>CSV Template</span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingFormat !== null}
                        onClick={() => handleDownloadTemplate('XLSX')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {downloadingFormat === 'XLSX' ? (
                          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>Excel (XLSX)</span>
                      </button>
                      <button
                        type="button"
                        disabled={downloadingFormat !== null}
                        onClick={() => handleDownloadTemplate('JSON')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {downloadingFormat === 'JSON' ? (
                          <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>JSON Template</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!importConfig.department) {
                          showToast('Please select a target department first.', 'warning');
                          return;
                        }
                        setImportStep(2);
                        saveImportDraft(importConfig, 2);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Upload File</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Upload File */}
              {importStep === 2 && (
                <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">2. Upload File (.csv, .xlsx, or .json)</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Targeting <strong>{importConfig.department}</strong> database with <strong>{importConfig.data_type}</strong> data.
                      </p>
                    </div>
                    <button
                      onClick={() => setImportStep(1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Step 1</span>
                    </button>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, .xls, .json"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-foreground">{selectedFile.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB — Click or drag to replace
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                          <UploadCloud className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-foreground">
                            Drag & drop your student data file here
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Supports CSV (.csv), Excel (.xlsx), and JSON (.json) up to 15MB (max 5,000 rows).
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                          Browse Computer
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImportStep(1);
                        saveImportDraft(importConfig, 1);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Context & Template</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        disabled={!selectedFile}
                        className="text-xs font-semibold text-muted-foreground hover:text-red-500 disabled:opacity-40 cursor-pointer px-2"
                      >
                        Clear File
                      </button>

                      <button
                        type="button"
                        onClick={handleValidateUploadedFile}
                        disabled={!selectedFile || isValidatingFile}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        {isValidatingFile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            <span>Validating Records...</span>
                          </>
                        ) : (
                          <>
                            <span>Parse & Validate Data</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Preview & Validation */}
              {importStep === 3 && previewData && (
                <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">3. Validation & Column Mapping Preview</h2>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-neutral-200 dark:bg-neutral-800 text-foreground font-bold">
                          {previewData.fileInfo?.fileName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Inspect row-level validity and column mappings before committing to the <strong>{importConfig.department}</strong> database.
                      </p>
                    </div>

                    <button
                      onClick={() => setImportStep(2)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Upload Different File</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-border text-center">
                      <span className="text-[11px] font-bold uppercase text-muted-foreground block">Total Rows</span>
                      <span className="text-xl font-extrabold text-foreground">{previewData.summary?.totalRows}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-center">
                      <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">Valid Rows</span>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-300">{previewData.summary?.validRows}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-500/20 text-center">
                      <span className="text-[11px] font-bold uppercase text-red-700 dark:text-red-400 block">Invalid Rows</span>
                      <span className="text-xl font-extrabold text-red-600 dark:text-red-300">{previewData.summary?.invalidRows}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-center">
                      <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400 block">Duplicates</span>
                      <span className="text-xl font-extrabold text-amber-600 dark:text-amber-300">{previewData.summary?.duplicateRows}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-500/20 text-center">
                      <span className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-400 block">New Records</span>
                      <span className="text-xl font-extrabold text-sky-600 dark:text-sky-300">{previewData.summary?.newRecords}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-500/20 text-center">
                      <span className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-400 block">Existing (Update)</span>
                      <span className="text-xl font-extrabold text-purple-600 dark:text-purple-300">{previewData.summary?.existingRecords}</span>
                    </div>
                  </div>

                  {/* Error Notification Alert if any invalid rows exist */}
                  {previewData.summary?.invalidRows > 0 && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs text-red-800 dark:text-red-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>{previewData.summary.invalidRows} records</strong> failed validation rules. Only valid records ({previewData.summary.validRows}) will be committed.
                        </span>
                      </div>
                      <button
                        onClick={handleDownloadPreviewErrors}
                        className="inline-flex items-center gap-1 font-bold underline hover:text-red-600 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Validation Report</span>
                      </button>
                    </div>
                  )}

                  {/* Records Table Preview */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="p-3.5 bg-muted/40 border-b border-border flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Parsed Preview (First {previewData.recordsPreview?.length} rows shown)</span>
                      <span className="text-muted-foreground">Showing verified fields</span>
                    </div>
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/70 uppercase font-semibold text-muted-foreground sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Row</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Reg Number</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Class/Sec</th>
                            <th className="py-2.5 px-3">Details / Validation Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {previewData.recordsPreview?.map((rec) => {
                            const isValid = rec.status === 'VALID';
                            return (
                              <tr
                                key={rec.rowNumber}
                                className={!isValid ? 'bg-red-50/20 dark:bg-red-950/20' : 'hover:bg-muted/20'}
                              >
                                <td className="py-2 px-3 font-mono text-muted-foreground">{rec.rowNumber}</td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      isValid
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-foreground">{rec.register_number || '—'}</td>
                                <td className="py-2 px-3 text-foreground font-medium">
                                  {rec.first_name} {rec.last_name}
                                </td>
                                <td className="py-2 px-3 text-muted-foreground">{rec.email || '—'}</td>
                                <td className="py-2 px-3 font-mono">
                                  {rec.class_name}-{rec.section}
                                </td>
                                <td className="py-2 px-3">
                                  {rec.errors && rec.errors.length > 0 ? (
                                    <span className="text-red-600 dark:text-red-400 font-semibold">
                                      {rec.errors.join('; ')}
                                    </span>
                                  ) : rec.existsInDb ? (
                                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                                      Matches existing record (will update in {importConfig.import_mode} mode)
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                      Ready to insert
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Confirmation Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <div className="text-xs text-muted-foreground">
                      Target: Isolated database <strong className="text-foreground">campuscorp_dept_{importConfig.department.toLowerCase()}</strong> ({importConfig.import_mode} Mode)
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setImportStep(2);
                          saveImportDraft(importConfig, 2);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Upload</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={!previewData.summary?.canImport || isExecutingImport}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        {isExecutingImport ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            <span>Committing to Department DB...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm & Import ({previewData.summary?.validRows} Records)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Execution Results */}
              {importStep === 4 && importOutcome && (
                <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border space-y-6 text-center max-w-2xl mx-auto shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                      Data Import Successfully Completed!
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                      All valid records have been securely committed to the isolated MySQL tenant database for <strong>{importOutcome.deptCode}</strong>.
                    </p>
                  </div>

                  {/* Results Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-muted-foreground block">Processed</span>
                      <span className="text-xl font-extrabold text-foreground">{importOutcome.totalProcessed}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-emerald-600 block">Committed</span>
                      <span className="text-xl font-extrabold text-emerald-600">{importOutcome.importedRows}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-muted-foreground block">Skipped/Rejected</span>
                      <span className="text-xl font-extrabold text-foreground">{importOutcome.rejectedRows || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setImportStep(1);
                        setSelectedFile(null);
                        setPreviewData(null);
                        setImportOutcome(null);
                      }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border cursor-pointer"
                    >
                      Import Another File
                    </button>

                    <Link
                      to="/students"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Students Roster</span>
                    </Link>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View Import History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. Import History Subsection                              */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground">Data Import Audit Trail</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Comprehensive audit logs of all batch imports across departments.</p>
                </div>
                <button
                  onClick={fetchInitialData}
                  className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-xs uppercase font-semibold border-b border-border text-muted-foreground">
                      <tr>
                        <th className="py-3.5 px-5">Job UUID</th>
                        <th className="py-3.5 px-5">Department</th>
                        <th className="py-3.5 px-5">File & Format</th>
                        <th className="py-3.5 px-5">Data Type</th>
                        <th className="py-3.5 px-5">Uploaded By</th>
                        <th className="py-3.5 px-5">Rows (Total / Imported / Rejected)</th>
                        <th className="py-3.5 px-5">Timestamp</th>
                        <th className="py-3.5 px-5 text-right">Status / Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importHistory.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-muted-foreground">
                            No bulk import jobs found in history.
                          </td>
                        </tr>
                      ) : (
                        importHistory.map((job) => {
                          const isSuccess = job.status === 'COMPLETED';
                          const hasErrors = job.invalid_rows > 0 || (job.error_report_json && job.error_report_json.length > 5);

                          return (
                            <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-5 font-mono text-xs text-foreground font-bold">
                                {job.job_uuid ? job.job_uuid.substring(0, 8) + '...' : `#${job.id}`}
                              </td>
                              <td className="py-4 px-5 font-mono font-bold text-xs text-primary">
                                {job.dept_code}
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground">
                                <div className="font-semibold">{job.file_name}</div>
                                <span className="text-[10px] text-muted-foreground font-mono uppercase">{job.file_format}</span>
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground font-medium">
                                {job.data_type}
                              </td>
                              <td className="py-4 px-5 text-xs text-foreground">
                                {job.uploaded_by_name || 'Admin'}
                              </td>
                              <td className="py-4 px-5 text-xs">
                                <span className="font-bold text-foreground">{job.total_rows}</span> total /{' '}
                                <span className="font-bold text-emerald-600">{job.imported_rows}</span> ok /{' '}
                                <span className="font-bold text-red-500">{job.invalid_rows}</span> err
                              </td>
                              <td className="py-4 px-5 text-xs text-muted-foreground">
                                {job.created_at ? new Date(job.created_at).toLocaleString() : '—'}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      isSuccess
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                    }`}
                                  >
                                    {job.status}
                                  </span>

                                  {hasErrors && (
                                    <button
                                      onClick={() => handleDownloadErrorReport(job.id)}
                                      title="Download Error Report"
                                      className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. Database Status Subsection                             */}
          {/* ========================================================= */}
          {activeTab === 'databases' && databaseStatus && (
            <div className="space-y-6">
              {/* Central Database Card */}
              <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">Central Institutional Master DB</h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {databaseStatus.centralDatabase?.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        Database: `{databaseStatus.centralDatabase?.name}` | Host: {databaseStatus.centralDatabase?.host}:{databaseStatus.centralDatabase?.port}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block font-bold uppercase">Master Latency</span>
                      <span className="text-sm font-extrabold text-foreground">
                        {databaseStatus.centralDatabase?.latencyMs || 1} ms
                      </span>
                    </div>
                    <button
                      onClick={fetchInitialData}
                      className="p-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border cursor-pointer"
                      title="Refresh status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Databases Grid */}
              <div>
                <h3 className="text-base font-bold text-foreground mb-3">
                  Isolated Department Tenant Databases ({databaseStatus.departments?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {databaseStatus.departments?.map((dept) => {
                    const isUp = dept.connectionStatus === 'UP';
                    const isVerifying = verifyingDeptCode === dept.dept_code;
                    const isProvisioning = provisioningDeptCode === dept.dept_code;

                    return (
                      <div
                        key={dept.dept_code}
                        className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs space-y-4 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-foreground">
                              {dept.dept_code}
                            </span>
                            <h4 className="text-sm font-bold text-foreground mt-2">{dept.dept_name}</h4>
                            <span className="text-xs text-primary font-mono block mt-0.5 font-medium">
                              `{dept.database_name}`
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                              isUp
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                            />
                            {dept.connectionStatus}
                          </span>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border text-center text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">Latency</span>
                            <span className="font-extrabold text-foreground">{dept.latencyMs ? `${dept.latencyMs}ms` : '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">Students</span>
                            <span className="font-extrabold text-foreground">{dept.studentCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">Tables</span>
                            <span className="font-extrabold text-foreground">{dept.tablesCount || 0}</span>
                          </div>
                        </div>

                        {/* Table chips */}
                        {dept.tables && dept.tables.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Verified Tables:</span>
                            <div className="flex flex-wrap gap-1">
                              {dept.tables.slice(0, 5).map(t => (
                                <span key={t} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-200 dark:bg-neutral-800 text-muted-foreground">
                                  {t}
                                </span>
                              ))}
                              {dept.tables.length > 5 && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-200 dark:bg-neutral-800 text-muted-foreground">
                                  +{dept.tables.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {dept.lastError && (
                          <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-500/20 text-[11px] text-red-700 dark:text-red-300">
                            <strong>Last Error:</strong> {dept.lastError}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-[11px] text-muted-foreground font-mono">
                            v{dept.schema_version || '1.0.0'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyDb(dept.dept_code)}
                              disabled={isVerifying}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border cursor-pointer"
                            >
                              {isVerifying ? 'Testing...' : 'Test Connection'}
                            </button>

                            <button
                              onClick={() => handleProvisionDb(dept.dept_code)}
                              disabled={isProvisioning}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                            >
                              {isProvisioning ? 'Repairing...' : 'Repair Schema'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------- */}
      {/* Create Department Modal (4-Step Wizard)                     */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isCreateDeptOpen}
        onClose={() => {
          setIsCreateDeptOpen(false);
          setDeptFormErrors({});
          setDeptSubmissionError(null);
        }}
        title="Department Creation Wizard"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border">
            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              deptWizardStep === 1
                ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                : deptWizardStep > 1
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-border text-muted-foreground'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider">Step 1</div>
              <div className="text-xs truncate flex items-center justify-center gap-1">
                {deptWizardStep > 1 && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span>Identity</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              deptWizardStep === 2
                ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                : deptWizardStep > 2
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-border text-muted-foreground'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider">Step 2</div>
              <div className="text-xs truncate flex items-center justify-center gap-1">
                {deptWizardStep > 2 && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span>Program & HOD</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              deptWizardStep === 3
                ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                : deptWizardStep > 3
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-border text-muted-foreground'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider">Step 3</div>
              <div className="text-xs truncate flex items-center justify-center gap-1">
                {deptWizardStep > 3 && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span>Database</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              deptWizardStep === 4
                ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                : 'border-border text-muted-foreground'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider">Step 4</div>
              <div className="text-xs truncate">Review & Confirm</div>
            </div>
          </div>

          {/* Restored Draft Alert Banner */}
          {hasRestoredDeptDraft && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Restored unsaved draft from your previous session (currently on Step {deptWizardStep}).</span>
              </span>
              <button
                type="button"
                onClick={clearDeptDraft}
                className="text-primary hover:underline font-bold ml-2 cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

          {/* Submission Error Banner */}
          {deptSubmissionError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="font-medium leading-relaxed">{deptSubmissionError}</span>
              </div>
              {deptConflictInfo && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200 dark:border-red-900/50">
                  <button
                    type="button"
                    disabled={isSubmittingDept}
                    onClick={() => handleSubmitDepartment(null, true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Update & Re-provision {deptConflictInfo.dept_code} Database</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeptWizardStep(1);
                      setDeptSubmissionError(null);
                      setDeptConflictInfo(null);
                    }}
                    className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Change Department Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Department Identity */}
          {deptWizardStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptFormData.dept_code}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const updated = { ...deptFormData, dept_code: val };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 1);
                      setIsUpdatingExistingDept(false);
                      if (deptFormErrors.dept_code) setDeptFormErrors(prev => ({ ...prev, dept_code: null }));
                    }}
                    placeholder="e.g. CSE, ECE, AIDS"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border ${
                      deptFormErrors.dept_code ? 'border-red-500 focus:ring-red-500' : 'border-border'
                    } text-foreground font-mono font-bold uppercase`}
                  />
                  {departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase()) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Department '{deptFormData.dept_code.trim().toUpperCase()}' is already registered in CampusCorp.</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            const code = deptFormData.dept_code.trim().toUpperCase();
                            const existing = departments.find(d => d.dept_code.toUpperCase() === code);
                            setIsUpdatingExistingDept(true);
                            if (existing) {
                              setDeptFormData(prev => ({
                                ...prev,
                                dept_name: existing.dept_name || prev.dept_name,
                                description: existing.description || prev.description,
                                hod_name: existing.hod_name || prev.hod_name,
                                hod_email: existing.hod_email || prev.hod_email,
                                duration_years: existing.duration_years || prev.duration_years,
                                total_semesters: existing.total_semesters || prev.total_semesters,
                              }));
                            }
                            setDeptFormErrors(prev => ({ ...prev, dept_code: null }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isUpdatingExistingDept
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:opacity-90'
                          } cursor-pointer`}
                        >
                          {isUpdatingExistingDept ? '✓ Mode: Update & Re-provision' : 'Select: Update & Re-provision'}
                        </button>
                      </div>
                    </div>
                  )}
                  {deptFormErrors.dept_code ? (
                    <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                      {deptFormErrors.dept_code}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Unique 2–15 character uppercase code
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Department Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptFormData.dept_name}
                    onChange={(e) => {
                      const updated = { ...deptFormData, dept_name: e.target.value };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 1);
                      if (deptFormErrors.dept_name) setDeptFormErrors(prev => ({ ...prev, dept_name: null }));
                    }}
                    placeholder="e.g. Computer Science and Engineering"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border ${
                      deptFormErrors.dept_name ? 'border-red-500 focus:ring-red-500' : 'border-border'
                    } text-foreground`}
                  />
                  {deptFormErrors.dept_name && (
                    <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                      {deptFormErrors.dept_name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Description / Vision
                </label>
                <textarea
                  rows={3}
                  value={deptFormData.description}
                  onChange={(e) => {
                    const updated = { ...deptFormData, description: e.target.value };
                    setDeptFormData(updated);
                    saveDeptDraft(updated, 1);
                  }}
                  placeholder="Department vision, domain focus, or accreditation details..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateDeptOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextDeptStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                >
                  <span>Next: Program & HOD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Program & Leadership */}
          {deptWizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Head of Department (HOD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptFormData.hod_name}
                    onChange={(e) => {
                      const updated = { ...deptFormData, hod_name: e.target.value };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 2);
                      if (deptFormErrors.hod_name) setDeptFormErrors(prev => ({ ...prev, hod_name: null }));
                    }}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border ${
                      deptFormErrors.hod_name ? 'border-red-500 focus:ring-red-500' : 'border-border'
                    } text-foreground`}
                  />
                  {deptFormErrors.hod_name && (
                    <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                      {deptFormErrors.hod_name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    HOD Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={deptFormData.hod_email}
                    onChange={(e) => {
                      const updated = { ...deptFormData, hod_email: e.target.value };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 2);
                      if (deptFormErrors.hod_email) setDeptFormErrors(prev => ({ ...prev, hod_email: null }));
                    }}
                    placeholder="hod.cse@college.edu"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border ${
                      deptFormErrors.hod_email ? 'border-red-500 focus:ring-red-500' : 'border-border'
                    } text-foreground`}
                  />
                  {deptFormErrors.hod_email && (
                    <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                      {deptFormErrors.hod_email}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Programme Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={deptFormData.duration_years}
                    onChange={(e) => {
                      const yrs = parseInt(e.target.value, 10) || 4;
                      const updated = { ...deptFormData, duration_years: yrs, total_semesters: yrs * 2 };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 2);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Standard: 4 Years</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                    Total Semesters
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={deptFormData.total_semesters}
                    onChange={(e) => {
                      const sems = parseInt(e.target.value, 10) || 8;
                      const updated = { ...deptFormData, total_semesters: sems };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 2);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Standard: 8 Semesters</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={handleBackDeptStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Identity</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextDeptStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                >
                  <span>Next: Database Isolation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dedicated Database & Tenant Architecture */}
          {deptWizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-foreground">Dedicated MySQL Tenant Identifier</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Isolated Schema
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-primary bg-background p-3 rounded-lg border border-border">
                  campuscorp_dept_{deptFormData.dept_code.toLowerCase().trim() || 'code'}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Each academic department is allocated an isolated MySQL database on the institution's XAMPP MySQL server. Cross-department queries are prevented at the connection-pool router level.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="autoProvisionWizard"
                    checked={deptFormData.auto_provision}
                    onChange={(e) => {
                      const updated = { ...deptFormData, auto_provision: e.target.checked };
                      setDeptFormData(updated);
                      saveDeptDraft(updated, 3);
                    }}
                    className="w-4 h-4 mt-0.5 rounded text-primary border-border cursor-pointer"
                  />
                  <div>
                    <label htmlFor="autoProvisionWizard" className="text-xs font-bold text-foreground cursor-pointer select-none">
                      Automatically provision isolated MySQL tenant database and execute schema migrations
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                      Creates the database immediately upon submission, applies version 1.0.0 tables (students, academic records, cohorts, classes, sections, and audit logs), and verifies connectivity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/80 bg-neutral-50 dark:bg-neutral-900/40">
                <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-2">Automated Table Manifest:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> students</span>
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> student_profiles</span>
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> student_academic_records</span>
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> semester_records</span>
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> classes & sections</span>
                  <span className="flex items-center gap-1.5 text-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> dept_audit_logs</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={handleBackDeptStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Program</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextDeptStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                >
                  <span>Next: Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Final Review & Confirmation */}
          {deptWizardStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Configuration Summary</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Department Code & Name:</span>
                    <strong className="text-foreground text-sm font-bold font-mono">{deptFormData.dept_code}</strong>
                    <div className="text-foreground font-semibold">{deptFormData.dept_name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Head of Department (HOD):</span>
                    <strong className="text-foreground">{deptFormData.hod_name || '—'}</strong>
                    <div className="text-muted-foreground font-mono">{deptFormData.hod_email || '—'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Academic Program:</span>
                    <strong className="text-foreground">{deptFormData.duration_years} Years ({deptFormData.total_semesters} Semesters)</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Dedicated MySQL Database:</span>
                    <strong className="text-primary font-mono">campuscorp_dept_{deptFormData.dept_code.toLowerCase().trim()}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Provisioning Mode:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isUpdatingExistingDept || departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase())
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : deptFormData.auto_provision
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {isUpdatingExistingDept || departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase())
                      ? 'Update Configuration & Re-provision Isolated Schema'
                      : deptFormData.auto_provision
                      ? 'Immediate Isolated Provisioning'
                      : 'Manual Provisioning Later'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 border border-border flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Confirming this action will register the department in the CampusCorp institutional master database and establish its isolated tenant MySQL database schema.
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={isSubmittingDept}
                  onClick={handleBackDeptStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Database</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDept}
                  onClick={(e) => handleSubmitDepartment(e, isUpdatingExistingDept || departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase()))}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isSubmittingDept ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Creating & Provisioning DB...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{departments.some(d => d.dept_code.toUpperCase() === (deptFormData.dept_code || '').trim().toUpperCase()) ? 'Confirm & Update / Provision' : 'Confirm & Create Department'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ----------------------------------------------------------- */}
      {/* Edit Department Modal                                       */}
      {/* ----------------------------------------------------------- */}
      {editingDept && (
        <Modal
          isOpen={isEditDeptOpen}
          onClose={() => {
            setIsEditDeptOpen(false);
            setEditingDept(null);
          }}
          title={`Edit Department: ${editingDept.dept_code}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={editingDept.dept_name}
                onChange={(e) => setEditingDept({ ...editingDept, dept_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingDept.description || ''}
                onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={editingDept.hod_name || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, hod_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  HOD Email
                </label>
                <input
                  type="email"
                  value={editingDept.hod_email || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, hod_email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Programme Duration (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={editingDept.duration_years || 4}
                  onChange={(e) => setEditingDept({ ...editingDept, duration_years: parseInt(e.target.value, 10) || 4 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Total Semesters
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={editingDept.total_semesters || 8}
                  onChange={(e) => setEditingDept({ ...editingDept, total_semesters: parseInt(e.target.value, 10) || 8 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editActive"
                checked={Boolean(editingDept.is_active)}
                onChange={(e) => setEditingDept({ ...editingDept, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-primary border-border cursor-pointer"
              />
              <label htmlFor="editActive" className="text-xs text-foreground font-semibold cursor-pointer select-none">
                Department is Active
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditDeptOpen(false);
                  setEditingDept(null);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ----------------------------------------------------------- */}
      {/* Create Academic Structure Modal                             */}
      {/* ----------------------------------------------------------- */}
      <Modal
        isOpen={isCreateStructureOpen}
        onClose={() => setIsCreateStructureOpen(false)}
        title="Add Academic Structure (Class & Section)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Department *
              </label>
              <select
                value={structureFormData.dept_code}
                onChange={(e) => setStructureFormData({ ...structureFormData, dept_code: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-semibold cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.dept_code} value={d.dept_code}>
                    {d.dept_code} — {d.dept_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={structureFormData.academic_year}
                onChange={(e) => setStructureFormData({ ...structureFormData, academic_year: e.target.value })}
                placeholder="e.g. 2026-2027"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Admission Batch *
              </label>
              <input
                type="text"
                required
                value={structureFormData.admission_batch}
                onChange={(e) => setStructureFormData({ ...structureFormData, admission_batch: e.target.value })}
                placeholder="2023-2027"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Year of Study (1-6)
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={structureFormData.year_of_study}
                onChange={(e) => setStructureFormData({ ...structureFormData, year_of_study: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Semester (1-12)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={structureFormData.semester}
                onChange={(e) => setStructureFormData({ ...structureFormData, semester: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Class / Group Name *
              </label>
              <input
                type="text"
                required
                value={structureFormData.class_name}
                onChange={(e) => setStructureFormData({ ...structureFormData, class_name: e.target.value })}
                placeholder="e.g. CSE-A, CSE-Core"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Section *
              </label>
              <input
                type="text"
                required
                value={structureFormData.section}
                onChange={(e) => setStructureFormData({ ...structureFormData, section: e.target.value.toUpperCase() })}
                placeholder="A, B, C"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground uppercase font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Class Advisor / Coordinator
              </label>
              <input
                type="text"
                value={structureFormData.class_advisor_name}
                onChange={(e) => setStructureFormData({ ...structureFormData, class_advisor_name: e.target.value })}
                placeholder="Prof. Rajesh Iyer"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Advisor Email
              </label>
              <input
                type="email"
                value={structureFormData.class_advisor_email}
                onChange={(e) => setStructureFormData({ ...structureFormData, class_advisor_email: e.target.value })}
                placeholder="advisor@college.edu"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
              Maximum Student Capacity
            </label>
            <input
              type="number"
              min={10}
              max={200}
              value={structureFormData.max_capacity}
              onChange={(e) => setStructureFormData({ ...structureFormData, max_capacity: parseInt(e.target.value, 10) || 60 })}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsCreateStructureOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
            >
              Save Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* ----------------------------------------------------------- */}
      {/* Edit Academic Structure Modal                               */}
      {/* ----------------------------------------------------------- */}
      {editingStructure && (
        <Modal
          isOpen={isEditStructureOpen}
          onClose={() => {
            setIsEditStructureOpen(false);
            setEditingStructure(null);
          }}
          title={`Edit Structure: ${editingStructure.class_name} - ${editingStructure.section}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditStructure} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Class Advisor / Coordinator
                </label>
                <input
                  type="text"
                  value={editingStructure.class_advisor_name || ''}
                  onChange={(e) => setEditingStructure({ ...editingStructure, class_advisor_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                  Advisor Email
                </label>
                <input
                  type="email"
                  value={editingStructure.class_advisor_email || ''}
                  onChange={(e) => setEditingStructure({ ...editingStructure, class_advisor_email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Max Student Capacity
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={editingStructure.max_capacity || 60}
                onChange={(e) => setEditingStructure({ ...editingStructure, max_capacity: parseInt(e.target.value, 10) || 60 })}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-background border border-border text-foreground"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editStructActive"
                checked={Boolean(editingStructure.is_active)}
                onChange={(e) => setEditingStructure({ ...editingStructure, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded text-primary border-border cursor-pointer"
              />
              <label htmlFor="editStructActive" className="text-xs text-foreground font-semibold cursor-pointer select-none">
                Structure is Active
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditStructureOpen(false);
                  setEditingStructure(null);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
