import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Database,
  GraduationCap,
  Briefcase,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Save,
  RefreshCw,
  Mail,
  Shield,
  Server,
  Users,
  X,
} from 'lucide-react';

export function CollegeAdminDashboard() {
  const { user, college, isModuleEnabled } = useAuth();
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'settings' | 'database'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ dept_code: '', dept_name: '', hod_name: '' });
  const [savingDept, setSavingDept] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, metricsRes, deptsRes, settingsRes] = await Promise.all([
        apiClient.get('/college-admin/profile'),
        apiClient.get('/college-admin/metrics'),
        apiClient.get('/college-admin/departments'),
        apiClient.get('/college-admin/settings'),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.college);
      if (metricsRes.data.success) setMetrics(metricsRes.data.data.metrics);
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.data);
    } catch (err) {
      console.error('Error loading college admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!newDept.dept_code || !newDept.dept_name) {
      alert('Department code and name are required.');
      return;
    }

    setSavingDept(true);
    setFeedback(null);
    try {
      const res = await apiClient.post('/college-admin/departments', newDept);
      if (res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        setModalOpen(false);
        setNewDept({ dept_code: '', dept_name: '', hod_name: '' });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setSavingDept(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);
    try {
      const res = await apiClient.put('/college-admin/settings', { settings });
      if (res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingChange = (key, val) => {
    setSettings((prev) =>
      prev.map((s) => (s.setting_key === key ? { ...s, setting_value: val } : s))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm">Connecting to Dedicated Institutional Database...</span>
      </div>
    );
  }

  const activeCollege = profile || college;

  return (
    <div className="space-y-6">
      {/* Institutional Header Banner */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {activeCollege?.code || 'INSTITUTION'}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {activeCollege?.type || 'AUTONOMOUS'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {activeCollege?.name || 'College Administration'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subdomain: <strong className="font-mono text-foreground">{activeCollege?.subdomain || 'main'}.campuscorp.io</strong> • Contact: {activeCollege?.contactEmail || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-secondary border border-border text-xs">
            <div className="text-[10px] text-muted-foreground font-mono uppercase">Dedicated Schema</div>
            <div className="font-mono font-bold text-foreground flex items-center gap-1.5 mt-0.5">
              <Database className="w-3.5 h-3.5 text-teal-500" />
              <span>{activeCollege?.databaseName || 'campuscorp_college'}</span>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground transition"
            title="Refresh College State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border border-destructive/30 text-destructive'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Institutional KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Students
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-foreground">
            {metrics?.totalStudents || 0}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Active in this institution</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Departments
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-foreground">
            {departments.length || metrics?.departmentsCount || 0}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Academic branches</div>
        </div>

        {isModuleEnabled('RECRUITMENT') && (
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partner Companies
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-foreground">
              {metrics?.totalCompanies || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Registered recruiters</div>
          </div>
        )}

        {isModuleEnabled('RECRUITMENT') && (
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Drives
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-foreground">
              {metrics?.activeDrives || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Upcoming & in-progress</div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Academic Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Institutional Policies & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Architecture Specs</span>
        </button>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Academic Departments Roster</h2>
              <p className="text-xs text-muted-foreground">Branches and HOD assignments for {activeCollege?.name}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-3.5 pl-4">Dept Code</th>
                    <th className="py-3.5">Department Name</th>
                    <th className="py-3.5">Head of Department (HOD)</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {departments.map((d) => (
                    <tr key={d.dept_code} className="hover:bg-secondary/30 transition">
                      <td className="py-3.5 pl-4 font-mono font-bold text-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">
                          {d.dept_code}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-foreground text-sm">
                        {d.dept_name}
                      </td>
                      <td className="py-3.5 text-muted-foreground">
                        {d.hod_name || 'Unassigned'}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {d.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right text-muted-foreground font-mono">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Baseline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Institutional Policies & Settings</h2>
              <p className="text-xs text-muted-foreground">Parameters stored in this college's dedicated `college_settings` table</p>
            </div>
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.map((s) => (
                <div key={s.setting_key} className="space-y-1.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <label className="font-mono font-semibold text-foreground">
                      {s.setting_key}
                    </label>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {s.description}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={s.setting_value}
                    onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Database Specs */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Dedicated Physical Database Schema</h3>
                <p className="text-xs text-muted-foreground">Complete institutional isolation on MySQL</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-1">
                <div className="text-muted-foreground">Database Schema Name</div>
                <div className="text-sm font-bold text-foreground">{activeCollege?.databaseName}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-1">
                <div className="text-muted-foreground">Multi-Tenant Isolation</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100% Dedicated Schema</div>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-1">
                <div className="text-muted-foreground">Institution Subdomain</div>
                <div className="text-sm font-bold text-foreground">{activeCollege?.subdomain}.campuscorp.io</div>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-1">
                <div className="text-muted-foreground">Institutional Code</div>
                <div className="text-sm font-bold text-foreground">{activeCollege?.code}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Add Academic Department</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIDS, CYBER, BT"
                  value={newDept.dept_code}
                  onChange={(e) => setNewDept({ ...newDept, dept_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={newDept.dept_name}
                  onChange={(e) => setNewDept({ ...newDept, dept_name: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Head of Department (HOD Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Ramesh"
                  value={newDept.hod_name}
                  onChange={(e) => setNewDept({ ...newDept, hod_name: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
                >
                  {savingDept ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

