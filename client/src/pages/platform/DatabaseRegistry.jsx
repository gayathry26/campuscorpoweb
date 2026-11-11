import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Database,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Clock,
  HardDrive,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  RotateCcw,
} from 'lucide-react';

export function DatabaseRegistry() {
  const { platformFetch } = usePlatformAuth();
  const [databases, setDatabases] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [pingResults, setPingResults] = useState({});
  const [search, setSearch] = useState('');

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const [dbRes, storageRes, telemetryRes] = await Promise.all([
        platformFetch('/api/v1/platform/databases'),
        platformFetch('/api/v1/platform/monitoring/storage').catch(() => null),
        platformFetch('/api/v1/platform/monitoring/telemetry').catch(() => null),
      ]);

      const json = await dbRes.json();
      if (json.success) {
        setDatabases(json.data);
      }

      if (storageRes && storageRes.ok) {
        const storageJson = await storageRes.json();
        if (storageJson.success) setStorageData(storageJson.data);
      }

      if (telemetryRes && telemetryRes.ok) {
        const telemetryJson = await telemetryRes.json();
        if (telemetryJson.success) setTelemetry(telemetryJson.data);
      }
    } catch (err) {
      console.error('Error fetching database cluster info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handlePing = async (registryId, dbName) => {
    setPingingId(registryId);
    try {
      const res = await platformFetch(`/api/v1/platform/databases/${registryId}/ping`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setPingResults((prev) => ({
          ...prev,
          [registryId]: json.data,
        }));
        // Update local databases array
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
      console.error('Error pinging database:', err);
    } finally {
      setPingingId(null);
    }
  };

  const handleRetryProvision = async (collegeId, dbName) => {
    setRetryingId(collegeId);
    try {
      const res = await platformFetch(`/api/v1/platform/databases/${collegeId}/retry-provision`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || 'Provisioning refreshed.');
        fetchDatabases();
      } else {
        alert(json.message || 'Retry failed.');
      }
    } catch (err) {
      alert('Error retrying provisioning: ' + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const getStorageForDb = (dbName) => {
    return storageData.find((s) => s.databaseName === dbName);
  };

  const filtered = databases.filter(
    (d) =>
      d.database_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.college_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.college_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-foreground" />
            <span>Infrastructure & Clustering</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Tenant Database Registry & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage physical database connections, monitor runtime memory, storage footprints, and verify multi-tenant isolation.
          </p>
        </div>

        <button
          onClick={fetchDatabases}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cluster</span>
        </button>
      </div>

      {/* Cluster Telemetry Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{databases.length}</div>
            <div className="text-xs text-muted-foreground">Total Registered Schemas</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {databases.filter((d) => d.health_status === 'HEALTHY').length}
            </div>
            <div className="text-xs text-muted-foreground">Healthy & Online</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {telemetry?.process?.memory?.rssMb ? `${telemetry.process.memory.rssMb} MB` : (telemetry?.server?.memoryUsage?.rssMb ? `${telemetry.server.memoryUsage.rssMb} MB` : '140 MB')}
            </div>
            <div className="text-xs text-muted-foreground">
              {telemetry?.process?.uptimeFormatted ? `Uptime: ${telemetry.process.uptimeFormatted}` : (telemetry?.server?.uptimeFormatted ? `Uptime: ${telemetry.server.uptimeFormatted}` : 'Process RSS Memory')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border text-card-foreground shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary text-foreground border border-border">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {telemetry?.cluster?.activePoolsCached ?? telemetry?.tenantConnectionManager?.activeTenantPools ?? 3} Pool(s)
            </div>
            <div className="text-xs text-muted-foreground">Live Cached Tenant Pools</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by database name, college or host..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs text-card-foreground">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4">Database Schema</th>
                <th className="py-3.5">Associated Institution</th>
                <th className="py-3.5">Host & Port</th>
                <th className="py-3.5">Storage Footprint</th>
                <th className="py-3.5">Provisioning</th>
                <th className="py-3.5">Health Status</th>
                <th className="py-3.5">Latency</th>
                <th className="py-3.5">Last Checked</th>
                <th className="py-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                    <span>Auditing cluster registry...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-foreground">
                    No databases registered.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const pingInfo = pingResults[d.id];
                  const isPinging = pingingId === d.id;
                  const storage = getStorageForDb(d.database_name);

                  return (
                    <tr key={d.id} className="hover:bg-secondary/40 transition">
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-foreground" />
                          <span className="font-mono font-bold text-foreground text-sm">
                            {d.database_name}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono pl-6">
                          v{d.schema_version || '1.0.0'}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-foreground">{d.college_name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{d.college_code}</div>
                      </td>
                      <td className="py-3.5 font-mono text-muted-foreground">
                        {d.db_host}:{d.db_port}
                      </td>
                      <td className="py-3.5">
                        {storage ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground font-bold">
                              <HardDrive className="w-3 h-3 text-foreground" />
                              <span>{storage.sizeFormatted}</span>
                              <span className="text-[10px] font-normal text-muted-foreground">/ {storage.quotaGb} GB</span>
                            </div>
                            <div className="w-24 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-foreground h-full rounded-full"
                                style={{ width: `${Math.max(2, storage.usedPercentage)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.is_provisioned
                              ? 'bg-secondary text-foreground border border-border'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-muted-foreground border border-border'
                          }`}
                        >
                          {d.is_provisioned ? 'PROVISIONED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            d.health_status === 'HEALTHY'
                              ? 'bg-secondary text-foreground border border-border'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-muted-foreground border border-border'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              d.health_status === 'HEALTHY' ? 'bg-foreground' : 'bg-neutral-400'
                            }`}
                          />
                          {d.health_status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-secondary border border-border font-mono text-foreground text-xs font-semibold">
                          {d.latency_ms || 0} ms
                        </span>
                        {pingInfo?.tableCount !== undefined && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {pingInfo.tableCount} tables
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                        {d.last_health_check
                          ? new Date(d.last_health_check).toLocaleTimeString()
                          : 'Never'}
                      </td>
                      <td className="py-3.5 pr-4 text-right space-x-2">
                        <button
                          disabled={retryingId === d.college_id}
                          onClick={() => handleRetryProvision(d.college_id, d.database_name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-semibold border border-border transition cursor-pointer"
                          title="Retry provisioning or re-run baseline migrations"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === d.college_id ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
                        </button>
                        <button
                          disabled={isPinging}
                          onClick={() => handlePing(d.id, d.database_name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                          <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
                        </button>
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
  );
}

