import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  FileText,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
} from 'lucide-react';

export function PlatformAuditLogs() {
  const { platformFetch } = usePlatformAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 25);
      if (actionFilter) params.append('action', actionFilter);

      const res = await platformFetch(`/api/v1/platform/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);

      const res = await platformFetch(`/api/v1/platform/audit-logs/export?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to generate compliance CSV export');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campuscorp_audit_compliance_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting audit logs to CSV:', err);
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-foreground" />
            <span>Compliance & Security</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Platform Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Immutable log of all administrative actions, database checks, status changes, and entitlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition disabled:opacity-50 cursor-pointer"
          >
            <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'Export Compliance CSV'}</span>
          </button>
          <button
            onClick={() => fetchLogs(pagination.page)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-foreground font-semibold">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="PLATFORM_LOGIN_SUCCESS">Login Success</option>
            <option value="COLLEGE_STATUS_UPDATED">College Status Changed</option>
            <option value="DATABASE_PING_TESTED">Database Ping Tested</option>
            <option value="COLLEGE_MODULES_UPDATED">Module Entitlements Updated</option>
            <option value="COLLEGE_SUBSCRIPTION_UPDATED">Subscription Assigned</option>
            <option value="PLATFORM_SETTINGS_UPDATED">Platform Settings Updated</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Total Logs: {pagination.total}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs text-card-foreground">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Timestamp</th>
                <th className="py-3.5">Action Code</th>
                <th className="py-3.5">Administrator</th>
                <th className="py-3.5">Target College</th>
                <th className="py-3.5">IP Address</th>
                <th className="py-3.5 text-right pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground">
                    No audit logs recorded for this criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-secondary/40 transition">
                        <td className="py-3.5 pl-4 font-mono text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span className="font-mono font-bold text-foreground text-[11px] px-2 py-0.5 rounded-md bg-secondary border border-border">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 text-foreground font-medium">
                          {log.admin_email || 'System Daemon'}
                        </td>
                        <td className="py-3.5">
                          {log.college_code ? (
                            <span className="font-mono font-semibold text-foreground px-2 py-0.5 rounded-md bg-secondary border border-border">{log.college_code}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3.5 font-mono text-muted-foreground">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          {log.details ? (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-medium border border-border transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && log.details && (
                        <tr className="bg-secondary/30 border-b border-border">
                          <td colSpan="6" className="p-4 pl-8">
                            <div className="p-3 rounded-xl bg-card border border-border font-mono text-[11px] text-foreground overflow-x-auto shadow-2xs">
                              <pre>{JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details) : log.details, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

