import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  CreditCard,
  ExternalLink,
  ShieldAlert,
  X,
  RefreshCw,
  Plus,
  Sparkles,
  MoreVertical,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  Edit3,
} from 'lucide-react';

export function CollegeManagement() {
  const { platformFetch } = usePlatformAuth();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Edit Modal State
  const [editingCollege, setEditingCollege] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'AUTONOMOUS',
    affiliation: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await platformFetch(`/api/v1/platform/colleges?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setColleges(json.data);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchColleges();
  };

  const openCollegeDetail = async (collegeId) => {
    setDetailLoading(true);
    setSelectedCollege(null);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${collegeId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedCollege(json.data);
      }
    } catch (err) {
      console.error('Error fetching college details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditModal = (college) => {
    setEditingCollege(college);
    setEditForm({
      name: college.name || '',
      type: college.type || 'AUTONOMOUS',
      affiliation: college.affiliation || '',
      contact_email: college.contact_email || '',
      contact_phone: college.contact_phone || '',
      address: college.address || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCollege) return;
    setSavingEdit(true);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${editingCollege.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `College '${editForm.name}' updated successfully.` });
        setEditingCollege(null);
        fetchColleges();
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to update college.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusToggle = async (collegeId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change status to ${nextStatus}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${collegeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `College status updated to ${nextStatus}` });
        fetchColleges();
        if (selectedCollege && selectedCollege.id === collegeId) {
          openCollegeDetail(collegeId);
        }
      } else {
        setMessage({ type: 'error', text: json.message || 'Status update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAllSessions = async (collegeId) => {
    if (!window.confirm('Are you sure you want to forcibly revoke all active sessions for this institution? All logged-in students, faculty, and administrators will be required to re-authenticate immediately.')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${collegeId}/revoke-sessions`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Emergency killswitch executed by Platform Super Admin' }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: `All active sessions for this college have been revoked successfully.` });
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to revoke sessions.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-foreground" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Colleges & Campuses Registry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage subscribed institutions, multi-tenant databases, subscriptions, and operational statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchColleges}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Registry</span>
          </button>

          <Link
            to="/platform-admin/provision"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Provision College</span>
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-secondary text-foreground border-border'
              : 'bg-neutral-100 dark:bg-neutral-900 text-foreground border-neutral-300 dark:border-neutral-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by college name, code, subdomain..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PROVISIONING">Provisioning</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Colleges Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs text-card-foreground">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Institution Name & Code</th>
                <th className="py-3.5">Subdomain</th>
                <th className="py-3.5">Dedicated Database</th>
                <th className="py-3.5">Plan / Subscription</th>
                <th className="py-3.5">Modules</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                    <span>Loading institutional directory...</span>
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted-foreground">
                    No colleges match the specified criteria.
                  </td>
                </tr>
              ) : (
                colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/40 transition">
                    <td className="py-3.5 pl-4">
                      <div className="font-bold text-foreground text-sm">{c.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{c.code}</div>
                    </td>
                    <td className="py-3.5 font-mono text-muted-foreground">
                      {c.subdomain}.campuscorp.io
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-foreground" />
                        <span className="font-mono text-foreground font-semibold">{c.database_name || 'Not provisioned'}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Health: {c.health_status || 'UNKNOWN'} ({c.latency_ms || 0}ms)
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-foreground">{c.plan_name || 'Standard'}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Expires: {c.subscription_expiry ? new Date(c.subscription_expiry).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-secondary border border-border font-mono text-[11px] text-foreground font-semibold">
                        {c.enabled_modules_count || 0} Enabled
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          c.status === 'ACTIVE'
                            ? 'bg-secondary text-foreground border border-border'
                            : c.status === 'SUSPENDED'
                            ? 'bg-neutral-100 dark:bg-neutral-900 text-muted-foreground border border-border'
                            : 'bg-neutral-100 dark:bg-neutral-900 text-foreground border border-border'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-medium border border-border transition inline-flex items-center gap-1 cursor-pointer"
                          title="Edit institutional details"
                        >
                          <Edit3 className="w-3 h-3 text-foreground" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openCollegeDetail(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-medium border border-border transition cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleStatusToggle(c.id, c.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            c.status === 'ACTIVE'
                              ? 'bg-neutral-100 dark:bg-neutral-900 border-border text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
                              : 'bg-primary border-primary text-primary-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* College Detail Modal / Drawer */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-card border-l border-border h-full overflow-y-auto p-6 sm:p-8 space-y-6 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold px-2 py-0.5 rounded-full bg-secondary border border-border">
                  {selectedCollege.code} • {selectedCollege.type}
                </span>
                <h2 className="text-xl font-black text-foreground mt-2">{selectedCollege.name}</h2>
                <div className="text-xs text-muted-foreground mt-1">{selectedCollege.subdomain}.campuscorp.io</div>
              </div>
              <button
                onClick={() => setSelectedCollege(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact & Affiliation Info */}
            <div className="p-4 rounded-xl bg-secondary border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-foreground shrink-0" />
                <span className="truncate">{selectedCollege.contact_email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-foreground shrink-0" />
                <span>{selectedCollege.contact_phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground sm:col-span-2">
                <MapPin className="w-4 h-4 text-foreground shrink-0" />
                <span className="truncate">{selectedCollege.address || 'Address unlisted'}</span>
              </div>
            </div>

            {/* Dedicated Database Specs */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-foreground" />
                <span>Isolated College Database</span>
              </h3>
              {selectedCollege.database ? (
                <div className="p-4 rounded-xl bg-secondary border border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database Name:</span>
                    <span className="text-foreground font-bold">{selectedCollege.database.database_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cluster Host:</span>
                    <span className="text-foreground">{selectedCollege.database.db_host}:{selectedCollege.database.db_port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health Status:</span>
                    <span className="text-foreground font-bold">{selectedCollege.database.health_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="text-foreground">{selectedCollege.database.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provisioned At:</span>
                    <span className="text-foreground">{selectedCollege.database.provisioned_at ? new Date(selectedCollege.database.provisioned_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border text-muted-foreground text-xs">
                  No dedicated database has been provisioned yet for this institution.
                </div>
              )}
            </div>

            {/* Active Subscription */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-foreground" />
                <span>Active Subscription</span>
              </h3>
              {selectedCollege.activeSubscription ? (
                <div className="p-4 rounded-xl bg-secondary border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-bold text-foreground">{selectedCollege.activeSubscription.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-foreground font-semibold px-2 py-0.5 rounded-full bg-card border border-border">{selectedCollege.activeSubscription.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid Through:</span>
                    <span className="text-foreground">{new Date(selectedCollege.activeSubscription.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Students:</span>
                    <span className="text-foreground">{selectedCollege.activeSubscription.max_students || 'Custom'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary border border-border text-muted-foreground text-xs">
                  No active subscription plan found.
                </div>
              )}
            </div>

            {/* Enabled Modules */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-foreground" />
                <span>Module Entitlements</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedCollege.modules?.map((m) => (
                  <div
                    key={m.module_key}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      m.is_enabled
                        ? 'bg-card border-foreground/30 text-foreground font-semibold shadow-2xs'
                        : 'bg-secondary/40 border-border text-muted-foreground line-through'
                    }`}
                  >
                    <span>{m.module_name}</span>
                    <span className="text-[10px] font-mono">{m.is_enabled ? 'ON' : 'OFF'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Modification Button & Emergency Killswitch */}
            <div className="pt-4 border-t border-border flex justify-between gap-3">
              <button
                onClick={() => handleRevokeAllSessions(selectedCollege.id)}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-foreground transition cursor-pointer"
              >
                Revoke All Active Sessions
              </button>

              <button
                onClick={() => handleStatusToggle(selectedCollege.id, selectedCollege.status)}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCollege.status === 'ACTIVE'
                    ? 'bg-neutral-100 dark:bg-neutral-900 border border-border text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    : 'bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground'
                }`}
              >
                {selectedCollege.status === 'ACTIVE' ? 'Suspend Institution' : 'Reactivate Institution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit College Modal */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 text-card-foreground shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                  Institutional Profile Edit
                </span>
                <h3 className="font-bold text-lg text-foreground">Edit {editingCollege.code}</h3>
              </div>
              <button onClick={() => setEditingCollege(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Institution Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    <option value="AUTONOMOUS">Autonomous</option>
                    <option value="UNIVERSITY_AFFILIATED">University Affiliated</option>
                    <option value="GOVERNMENT_AIDED">Government Aided</option>
                    <option value="PRIVATE">Private</option>
                    <option value="DEEMED">Deemed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Affiliation</label>
                  <input
                    type="text"
                    value={editForm.affiliation}
                    onChange={(e) => setEditForm({ ...editForm, affiliation: e.target.value })}
                    placeholder="e.g. Anna University"
                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Campus Address</label>
                <textarea
                  rows="2"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCollege(null)}
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground font-semibold border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-bold disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Update Information'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

