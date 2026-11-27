import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Filter, Eye, GraduationCap, Award, BookOpen, Save, ShieldCheck } from 'lucide-react';

export function Students() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [academicForm, setAcademicForm] = useState({
    active_backlogs: 0,
    history_of_backlogs: 0,
    cgpa: 0,
    tenth_percentage: 0,
    twelfth_percentage: 0,
    current_semester: 7,
    placement_status: 'REGISTERED',
    placement_readiness_score: 75,
  });

  const canEditAcademics = ['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER', 'FACULTY_COORDINATOR'].includes(user?.roleName);

  useEffect(() => {
    fetchStudents();
  }, [departmentFilter, statusFilter, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (departmentFilter !== 'ALL') params.department = departmentFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/students', { params });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      showToast('Failed to fetch student records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = async (studentId) => {
    setModalLoading(true);
    setSelectedStudent({ loading: true });
    try {
      const res = await apiClient.get(`/students/${studentId}`);
      setSelectedStudent(res.data);
      const st = res.data?.student || {};
      setAcademicForm({
        active_backlogs: st.active_backlogs ?? 0,
        history_of_backlogs: st.history_of_backlogs ?? 0,
        cgpa: st.cgpa ?? 0,
        tenth_percentage: st.tenth_percentage ?? 0,
        twelfth_percentage: st.twelfth_percentage ?? 0,
        current_semester: st.current_semester ?? 7,
        placement_status: st.placement_status || 'REGISTERED',
        placement_readiness_score: st.placement_readiness_score ?? 75,
      });
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      showToast('Failed to fetch student details.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveAcademicRecords = async (e) => {
    e.preventDefault();
    if (!selectedStudent?.student?.id) return;
    setSavingAcademic(true);
    try {
      const res = await apiClient.put(`/students/${selectedStudent.student.id}/academic-records`, academicForm);
      showToast('Official academic & backlog records updated.', 'success');
      if (res.data?.data) {
        setSelectedStudent((prev) => ({
          ...prev,
          student: { ...prev.student, ...res.data.data },
        }));
      }
      fetchStudents();
    } catch (err) {
      showToast('Failed to update academic records: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSavingAcademic(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Placement Master Roster</h1>
          <p className="text-sm text-muted-foreground mt-1">Central student identities linked to isolated department academic databases.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, reg number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter (Only for TPO/Admin/Management) */}
          {user?.roleName !== 'FACULTY_COORDINATOR' && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-xl border border-border bg-secondary font-medium text-foreground cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ECE">ECE (Electronics)</option>
              <option value="EEE">EEE (Electrical)</option>
              <option value="MECH">MECH (Mechanical)</option>
              <option value="CIVIL">CIVIL (Civil)</option>
              <option value="IT">IT (Information Tech)</option>
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-xl border border-border bg-secondary font-medium text-foreground cursor-pointer"
          >
            <option value="ALL">All Placement Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="PLACED">Placed</option>
            <option value="MULTIPLE_OFFERS">Multiple Offers</option>
            <option value="OPTED_OUT">Opted Out</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving student records from institutional database..." />
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No students match the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-secondary text-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Register No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Active Backlogs</th>
                  <th className="py-3 px-4">Technical Skills</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((st) => {
                  let skillsList = [];
                  try {
                    skillsList = typeof st.skills === 'string' ? JSON.parse(st.skills) : st.skills || [];
                  } catch (e) {
                    skillsList = [];
                  }

                  return (
                    <tr key={st.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">{st.register_number}</td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {st.first_name} {st.last_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary border border-border text-foreground">
                          {st.department_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">{st.cgpa || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${st.active_backlogs > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-foreground'}`}>
                          {st.active_backlogs || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(skillsList) && skillsList.slice(0, 3).map((sk, i) => (
                            <span key={i} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded text-foreground font-medium">
                              {sk}
                            </span>
                          ))}
                          {Array.isArray(skillsList) && skillsList.length > 3 && (
                            <span className="text-xs text-muted-foreground font-semibold">+{skillsList.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={st.placement_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewStudent(st.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> View Academic File
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Dossier Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.loading ? 'Loading Student Dossier...' : `Student Academic & Placement Dossier: ${selectedStudent?.student?.first_name || ''} ${selectedStudent?.student?.last_name || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedStudent?.loading ? (
          <LoadingSpinner text="Reading unified student identity & isolated academic records..." />
        ) : selectedStudent?.student ? (
          <div className="space-y-6 text-sm text-foreground">
            {/* Basic Info */}
            <div className="p-4 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  {selectedStudent.student.first_name} {selectedStudent.student.last_name}
                </h4>
                <p className="text-muted-foreground text-sm mt-0.5 font-mono">
                  {selectedStudent.student.register_number} • Dept: {selectedStudent.student.department_code} • {selectedStudent.student.email}
                </p>
              </div>
              <StatusBadge status={selectedStudent.student.placement_status} />
            </div>

            {/* Admin-Only Official Academic & Backlog Management */}
            {canEditAcademics && (
              <form onSubmit={handleSaveAcademicRecords} className="p-4 rounded-xl bg-[#F7F6F7] dark:bg-[#262126] border border-border space-y-3.5">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#8B2942]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Admin Control: Backlogs & Official Academic Records
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7]">
                    Admin Only
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Active Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={academicForm.active_backlogs}
                      onChange={(e) => setAcademicForm({ ...academicForm, active_backlogs: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Backlog History</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={academicForm.history_of_backlogs}
                      onChange={(e) => setAcademicForm({ ...academicForm, history_of_backlogs: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">CGPA (0–10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={academicForm.cgpa}
                      onChange={(e) => setAcademicForm({ ...academicForm, cgpa: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={academicForm.current_semester}
                      onChange={(e) => setAcademicForm({ ...academicForm, current_semester: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">10th %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={academicForm.tenth_percentage}
                      onChange={(e) => setAcademicForm({ ...academicForm, tenth_percentage: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">12th / Diploma %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={academicForm.twelfth_percentage}
                      onChange={(e) => setAcademicForm({ ...academicForm, twelfth_percentage: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Readiness (0–100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={academicForm.placement_readiness_score}
                      onChange={(e) => setAcademicForm({ ...academicForm, placement_readiness_score: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">Placement Status</label>
                    <select
                      value={academicForm.placement_status}
                      onChange={(e) => setAcademicForm({ ...academicForm, placement_status: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-[#8B2942]"
                    >
                      <option value="REGISTERED">Registered</option>
                      <option value="PLACED">Placed</option>
                      <option value="MULTIPLE_OFFERS">Multiple Offers</option>
                      <option value="OPTED_OUT">Opted Out</option>
                      <option value="NOT_REGISTERED">Not Registered</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingAcademic}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B2942] hover:bg-[#702038] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingAcademic ? 'Saving...' : 'Save Academic Records'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Verified Semester GPAs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                  <BookOpen className="w-4 h-4 text-[#8B2942]" />
                  <span>Verified Semester GPAs ({selectedStudent.student.department_code} Department)</span>
                </div>
                <span className="text-xs font-semibold bg-secondary text-foreground px-2.5 py-0.5 rounded border border-border">
                  Verified Record
                </span>
              </div>

              {selectedStudent.departmentAcademicData ? (
                <>
                  <div className="grid grid-cols-4 gap-2.5 text-center bg-secondary/60 p-4 rounded-xl border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 1</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem1_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 2</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem2_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 3</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem3_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 4</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem4_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 5</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem5_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Sem 6</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.sem6_gpa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Dept Rank</span>
                      <p className="font-bold text-foreground text-sm mt-0.5">#{selectedStudent.departmentAcademicData.department_rank || '1'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Status</span>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{selectedStudent.departmentAcademicData.verification_status}</p>
                    </div>
                  </div>

                  {selectedStudent.departmentAcademicData.mentor_remarks && (
                    <div className="text-sm bg-secondary/60 p-3.5 rounded-xl border border-border mt-3">
                      <span className="font-semibold text-foreground">Faculty Mentor Remarks ({selectedStudent.departmentAcademicData.faculty_mentor_name}):</span>
                      <p className="text-muted-foreground mt-0.5">{selectedStudent.departmentAcademicData.mentor_remarks}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No isolated academic semester row found for this register number.</p>
              )}
            </div>

            {/* Applications History */}
            <div>
              <h5 className="font-bold text-foreground mb-2 flex items-center gap-1.5 text-sm">
                <Award className="w-4 h-4 text-foreground" />
                <span>Recruitment Drive Application History</span>
              </h5>
              {selectedStudent.applications?.length === 0 ? (
                <p className="text-muted-foreground text-sm">Candidate has not applied to any recruitment drives yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.applications?.map((app) => (
                    <div key={app.id} className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-foreground">{app.company_name}</span> - {app.job_title}
                        <p className="text-xs text-muted-foreground mt-0.5">Round: {app.current_round_number} • Applied: {app.application_date?.split('T')[0]}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">Unable to load candidate dossier.</p>
        )}
      </Modal>
    </div>
  );
}
export default Students;
