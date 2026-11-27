import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Users,
  Shield,
  Building2,
  Search,
  Filter,
  Plus,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  Mail,
  Lock,
  UserCheck,
  UserX,
} from 'lucide-react';

export function UserAccessManagement() {
  const { platformFetch } = usePlatformAuth();
  const [activeTab, setActiveTab] = useState('platform'); // 'platform' | 'college'

  // Platform Admins State
  const [platformAdmins, setPlatformAdmins] = useState([]);
  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'PLATFORM_SUPER_ADMIN',
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // College Admins State
  const [collegeAdmins, setCollegeAdmins] = useState([]);
  const [loadingCollege, setLoadingCollege] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchPlatformAdmins = async () => {
    setLoadingPlatform(true);
    try {
      const res = await platformFetch('/api/v1/platform/users/platform-admins');
      const json = await res.json();
      if (json.success) setPlatformAdmins(json.data);
    } catch (err) {
      console.error('Error fetching platform admins:', err);
    } finally {
      setLoadingPlatform(false);
    }
  };

  const fetchCollegeAdmins = async () => {
    setLoadingCollege(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await platformFetch(`/api/v1/platform/users/college-admins?${params.toString()}`);
      const json = await res.json();
      if (json.success) setCollegeAdmins(json.data);
    } catch (err) {
      console.error('Error fetching college admins:', err);
    } finally {
      setLoadingCollege(false);
    }
  };

  useEffect(() => {
    fetchPlatformAdmins();
    fetchCollegeAdmins();
  }, []);

  const handleCreatePlatformAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await platformFetch('/api/v1/platform/users/platform-admins', {
        method: 'POST',
        body: JSON.stringify(newAdmin),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: `Platform administrator '${newAdmin.email}' created successfully.` });
        setCreateAdminModal(false);
        setNewAdmin({ email: '', password: '', first_name: '', last_name: '', role: 'PLATFORM_SUPER_ADMIN' });
        fetchPlatformAdmins();
      } else {
        alert(json.message || 'Failed to create platform administrator.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleTogglePlatformStatus = async (adminId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change this administrator status to ${nextStatus}?`)) return;

    setActionLoading(true);
    try {
      const res = await platformFetch(`/api/v1/platform/users/platform-admins/${adminId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: `Platform user status updated to ${nextStatus}` });
        fetchPlatformAdmins();
      } else {
        alert(json.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePlatformSessions = async (adminId) => {
    if (!window.confirm('Force revoke all active sessions for this platform administrator?')) return;
    setActionLoading(true);
    try {
      const res = await platformFetch(`/api/v1/platform/users/platform-admins/${adminId}/revoke-sessions`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Manual session revocation by Super Admin' }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: json.message || 'Sessions revoked.' });
        fetchPlatformAdmins();
      } else {
        alert(json.message || 'Failed to revoke sessions.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeCollegeAdminSessions = async (collegeId, userId) => {
    if (!window.confirm('Force revoke active sessions for this institutional administrator?')) return;
    setActionLoading(true);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${collegeId}/revoke-sessions`, {
        method: 'POST',
        body: JSON.stringify({ reason: `Revoking administrator ID ${userId}` }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: 'College sessions revoked.' });
        fetchCollegeAdmins();
      } else {
        alert(json.message || 'Failed to revoke sessions.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCollegeAdmins = collegeAdmins.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.collegeCode?.toLowerCase().includes(search.toLowerCase()) ||
      u.collegeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Identity & Access Governance</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            User & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centrally audit global platform staff, oversee institutional administrators, and enforce session revocation.
          </p>
        </div>

        {activeTab === 'platform' && (
          <button
            onClick={() => setCreateAdminModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Platform Admin</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-secondary border-border text-foreground font-medium'
              : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-foreground font-medium'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('platform')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'platform'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Platform Administrators ({platformAdmins.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('college')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'college'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institutional College Admins ({collegeAdmins.length})</span>
        </button>
      </div>

      {/* Tab 1: Platform Administrators */}
      {activeTab === 'platform' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3.5 pl-4">Administrator</th>
                    <th className="py-3.5">Email Address</th>
                    <th className="py-3.5">Role</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5">Created Date</th>
                    <th className="py-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingPlatform ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                        <span>Loading platform administrators...</span>
                      </td>
                    </tr>
                  ) : platformAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-muted-foreground">
                        No platform administrators found.
                      </td>
                    </tr>
                  ) : (
                    platformAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-secondary/40 transition">
                        <td className="py-3.5 pl-4 font-bold text-foreground text-sm">
                          {admin.first_name} {admin.last_name}
                        </td>
                        <td className="py-3.5 font-mono text-muted-foreground">{admin.email}</td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-secondary text-foreground border border-border">
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              admin.status === 'ACTIVE'
                                ? 'bg-secondary text-foreground border border-border'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-muted-foreground border border-border'
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 pr-4 text-right space-x-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRevokePlatformSessions(admin.id)}
                            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border font-medium text-xs transition"
                            title="Revoke active sessions"
                          >
                            Revoke Sessions
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleTogglePlatformStatus(admin.id, admin.status)}
                            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border font-semibold text-xs transition"
                          >
                            {admin.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Institutional College Admins Directory */}
      {activeTab === 'college' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between shadow-xs">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by administrator name, email, or college code..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <button
              onClick={fetchCollegeAdmins}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold text-foreground border border-border transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Directory</span>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3.5 pl-4">Administrator</th>
                    <th className="py-3.5">Official Email</th>
                    <th className="py-3.5">Institution</th>
                    <th className="py-3.5">Role</th>
                    <th className="py-3.5">Dedicated Database</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingCollege ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                        <span>Querying tenant institutional databases...</span>
                      </td>
                    </tr>
                  ) : filteredCollegeAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-muted-foreground">
                        No college administrators found.
                      </td>
                    </tr>
                  ) : (
                    filteredCollegeAdmins.map((ca, idx) => (
                      <tr key={`${ca.collegeId}_${ca.userId}_${idx}`} className="hover:bg-secondary/40 transition">
                        <td className="py-3.5 pl-4 font-bold text-foreground text-sm">
                          {ca.firstName} {ca.lastName}
                        </td>
                        <td className="py-3.5 font-mono text-muted-foreground">{ca.email}</td>
                        <td className="py-3.5">
                          <div className="font-semibold text-foreground">{ca.collegeName}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{ca.collegeCode}</div>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-secondary text-foreground border border-border">
                            {ca.roleName}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-muted-foreground text-[11px]">
                          {ca.databaseName}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              ca.status === 'ACTIVE'
                                ? 'bg-secondary text-foreground border border-border'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-muted-foreground border border-border'
                            }`}
                          >
                            {ca.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRevokeCollegeAdminSessions(ca.collegeId, ca.userId)}
                            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border font-medium text-xs transition"
                            title="Force revoke active session for this administrator"
                          >
                            Revoke Session
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Platform Admin Modal */}
      {createAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Add Platform Administrator</h3>
              <button onClick={() => setCreateAdminModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlatformAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.first_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newAdmin.last_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Role Permission</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin (Full Control)</option>
                  <option value="PLATFORM_SUPPORT_ADMIN">Platform Support Admin (Read & Auditing)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-bold disabled:opacity-50"
                >
                  {creatingAdmin ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
