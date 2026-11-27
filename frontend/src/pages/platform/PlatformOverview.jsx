import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Building2,
  Database,
  Layers,
  CreditCard,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Server,
  Zap,
  Users,
  GraduationCap,
} from 'lucide-react';

export function PlatformOverview() {
  const { platformFetch } = usePlatformAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await platformFetch('/api/v1/platform/overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to load platform data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-foreground" />
        <span className="text-sm font-medium">Connecting to Central Platform Cluster...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border text-foreground shadow-xs">
        <h3 className="font-bold text-base mb-1">Error Loading Platform Overview</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchOverview(true)}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, recentColleges = [], recentLogs = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-foreground" />
            <span>Platform Super Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            SaaS Infrastructure Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Central governance, multi-college registry, dynamic tenant databases, and module entitlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>

          <Link
            to="/platform-admin/colleges"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Colleges</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Colleges */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Colleges
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{metrics?.colleges?.total || 0}</span>
            <span className="text-[11px] text-foreground font-semibold px-1.5 py-0.5 rounded-full bg-secondary border border-border">
              {metrics?.colleges?.active || 0} Active
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Suspended: {metrics?.colleges?.suspended || 0}</span>
            <Link to="/platform-admin/colleges" className="text-foreground font-bold hover:underline">
              View →
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Students */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{metrics?.users?.totalStudents || 0}</span>
            <span className="text-[11px] text-muted-foreground font-semibold">Enrolled</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>All tenants</span>
            <span className="font-mono text-[10px] text-foreground font-bold">Live Data</span>
          </div>
        </div>

        {/* Metric 3: Total Faculty */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Faculty Staff
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{metrics?.users?.totalFaculty || 0}</span>
            <span className="text-[11px] text-muted-foreground font-semibold">Advisors</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Dept Staff</span>
            <span className="font-mono text-[10px] text-foreground font-bold">Verified</span>
          </div>
        </div>

        {/* Metric 4: Databases */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Databases
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{metrics?.databases?.total || 0}</span>
            <span className="text-[11px] text-foreground font-semibold px-1.5 py-0.5 rounded-full bg-secondary border border-border">
              {metrics?.databases?.healthy || 0} Healthy
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>~{metrics?.databases?.avgLatencyMs || 2}ms latency</span>
            <Link to="/platform-admin/databases" className="text-foreground font-bold hover:underline">
              Cluster →
            </Link>
          </div>
        </div>

        {/* Metric 5: Active Subscriptions */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Subscriptions
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">
              {metrics?.subscriptions?.reduce((acc, s) => acc + Number(s.active_count), 0) || 0}
            </span>
            <span className="text-[11px] text-foreground font-semibold px-1.5 py-0.5 rounded-full bg-secondary border border-border">
              Active
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>3 Active Tiers</span>
            <Link to="/platform-admin/subscriptions" className="text-foreground font-bold hover:underline">
              Plans →
            </Link>
          </div>
        </div>

        {/* Metric 6: Enabled Modules */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Enabled Modules
            </span>
            <div className="p-2 rounded-xl bg-secondary text-foreground border border-border">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground">{metrics?.modules?.totalEnabled || 0}</span>
            <span className="text-[11px] text-muted-foreground font-semibold">Active</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>{metrics?.modules?.catalogTotal || 9} in Catalog</span>
            <Link to="/platform-admin/modules" className="text-foreground font-bold hover:underline">
              Catalog →
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Recent Colleges & Live Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subscribed Colleges Directory (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-base text-foreground">Subscribed Institutions</h2>
                <p className="text-xs text-muted-foreground">Recent colleges onboarded to CampusCorp SaaS</p>
              </div>
              <Link
                to="/platform-admin/colleges"
                className="text-xs font-semibold text-foreground hover:underline flex items-center gap-1"
              >
                <span>View Full Registry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">College</th>
                    <th className="pb-3">Subdomain</th>
                    <th className="pb-3">Dedicated DB</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentColleges.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-muted-foreground">
                        No colleges registered yet.
                      </td>
                    </tr>
                  ) : (
                    recentColleges.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/40 transition">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-foreground">{c.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{c.code}</div>
                        </td>
                        <td className="py-3 font-mono text-muted-foreground">
                          {c.subdomain}.campuscorp.io
                        </td>
                        <td className="py-3 font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground">
                            {c.database_name || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground font-medium">
                          {c.current_plan || 'Custom'}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              c.status === 'ACTIVE'
                                ? 'bg-secondary text-foreground border border-border'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-muted-foreground border border-border'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <Link
                            to={`/platform-admin/colleges`}
                            className="text-xs text-foreground font-bold hover:underline"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Audit Log Stream (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-base text-foreground">Platform Audit Stream</h2>
                <p className="text-xs text-muted-foreground">Live immutable administration logs</p>
              </div>
              <Link
                to="/platform-admin/audit-logs"
                className="text-xs font-semibold text-foreground hover:underline"
              >
                All Logs →
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  No audit entries recorded yet.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-secondary border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] truncate">
                      {log.admin_email || 'System Daemon'}
                      {log.college_code && (
                        <span className="text-foreground ml-1 font-medium">→ {log.college_code}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

