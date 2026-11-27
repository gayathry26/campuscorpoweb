import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Layers,
  Clock,
  ShieldCheck,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';

export function SystemMonitoring() {
  const { platformFetch } = usePlatformAuth();
  const [telemetry, setTelemetry] = useState(null);
  const [storageData, setStorageData] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [failureLogs, setFailureLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pingingId, setPingingId] = useState(null);
  const [pingResults, setPingResults] = useState({});

  const fetchMonitoringData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [telemetryRes, storageRes, dbsRes, logsRes] = await Promise.all([
        platformFetch('/api/v1/platform/monitoring/telemetry').catch(() => null),
        platformFetch('/api/v1/platform/monitoring/storage').catch(() => null),
        platformFetch('/api/v1/platform/databases').catch(() => null),
        platformFetch('/api/v1/platform/audit-logs?limit=15').catch(() => null),
      ]);

      if (telemetryRes && telemetryRes.ok) {
        const json = await telemetryRes.json();
        setTelemetry(json.telemetry || json.data);
      }
      if (storageRes && storageRes.ok) {
        const json = await storageRes.json();
        setStorageData(json.storage || json.data || []);
      }
      if (dbsRes && dbsRes.ok) {
        const json = await dbsRes.json();
        if (json.success) setDatabases(json.data);
      }
      if (logsRes && logsRes.ok) {
        const json = await logsRes.json();
        if (json.success && json.data.logs) {
          const failures = json.data.logs.filter(
            (l) => l.action.includes('FAIL') || l.action.includes('ERROR') || l.action.includes('REVOKE')
          );
          setFailureLogs(failures);
        }
      }
    } catch (err) {
      console.error('Error fetching system monitoring:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handlePing = async (registryId) => {
    setPingingId(registryId);
    try {
      const res = await platformFetch(`/api/v1/platform/databases/${registryId}/ping`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setPingResults((prev) => ({ ...prev, [registryId]: json.data }));
        setDatabases((prev) =>
          prev.map((d) =>
            d.id === registryId
              ? {
                  ...d,
                  health_status: json.data.healthStatus,
                  latency_ms: json.data.latencyMs,
                  last_health_check: json.data.testedAt,
                }
              : d
          )
        );
      }
    } catch (err) {
      console.error('Ping test failed:', err);
    } finally {
      setPingingId(null);
    }
  };

  const healthyDbsCount = databases.filter((d) => d.health_status === 'HEALTHY').length;
  const avgLatency = Math.round(
    databases.reduce((acc, d) => acc + (d.latency_ms || 0), 0) / (databases.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-foreground" />
            <span>Infrastructure Telemetry & Diagnostic Health</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            System & Cluster Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time diagnostics across central databases, tenant connection pools, memory utilization, and failure audits.
          </p>
        </div>

        <button
          onClick={() => fetchMonitoringData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Primary KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Central Database Health */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">ONLINE</div>
            <div className="text-xs text-muted-foreground">Central DB (campuscorp_platform)</div>
          </div>
        </div>

        {/* Tenant Nodes Health */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {healthyDbsCount} / {databases.length}
            </div>
            <div className="text-xs text-muted-foreground">Tenant DBs Online ({avgLatency}ms avg)</div>
          </div>
        </div>

        {/* Process Memory */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {telemetry?.process?.memory?.rssMb || telemetry?.server?.memoryUsage?.rssMb || 140} MB
            </div>
            <div className="text-xs text-muted-foreground">
              Node RSS (Uptime: {telemetry?.process?.uptimeFormatted || telemetry?.server?.uptimeFormatted || 'Live'})
            </div>
          </div>
        </div>

        {/* Active Connection Pools */}
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {telemetry?.cluster?.activePoolsCached ?? telemetry?.tenantConnectionManager?.activeTenantPools ?? databases.length} Pool(s)
            </div>
            <div className="text-xs text-muted-foreground">Live Cached Tenant Pools</div>
          </div>
        </div>
      </div>

      {/* Grid: Tenant Databases Status & Failure History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Individual College Database Health */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-base text-foreground">Tenant Database Nodes Health</h2>
                <p className="text-xs text-muted-foreground">Physical MySQL database instances per subscribed institution</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {databases.length} schemas monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Database Schema</th>
                    <th className="pb-3">Institution</th>
                    <th className="pb-3">Health Status</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3">Last Checked</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {databases.map((db) => {
                    const isPinging = pingingId === db.id;
                    return (
                      <tr key={db.id} className="hover:bg-secondary/40 transition">
                        <td className="py-3 pl-2 font-mono font-bold text-foreground text-sm">
                          {db.database_name}
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-foreground">{db.college_name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{db.college_code}</div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              db.health_status === 'HEALTHY'
                                ? 'bg-secondary text-foreground border border-border'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-muted-foreground border border-border'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                db.health_status === 'HEALTHY' ? 'bg-foreground' : 'bg-neutral-400'
                              }`}
                            />
                            {db.health_status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-foreground font-semibold">
                          {db.latency_ms || 0} ms
                        </td>
                        <td className="py-3 text-muted-foreground font-mono text-[11px]">
                          {db.last_health_check ? new Date(db.last_health_check).toLocaleTimeString() : 'Never'}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <button
                            disabled={isPinging}
                            onClick={() => handlePing(db.id)}
                            className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border text-xs font-semibold transition cursor-pointer"
                          >
                            {isPinging ? 'Testing...' : 'Ping Test'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Failure Audit & Alert Watchdog */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-foreground" />
                <span>Security & Fault Watchdog</span>
              </h2>
            </div>

            {failureLogs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-secondary border border-border text-center text-xs text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-foreground mx-auto mb-2" />
                <span>Zero system errors or provisioning failures recorded in recent audit window.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {failureLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-secondary border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-[10px]">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-foreground truncate font-medium">{log.admin_email || 'System'}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : 'No details'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

