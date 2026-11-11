import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Layers,
  Building2,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';

export function ModuleEntitlements() {
  const { platformFetch } = usePlatformAuth();
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [modules, setModules] = useState([]);
  const [entitlements, setEntitlements] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 1. Fetch colleges list and platform module catalog
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [collegesRes, modulesRes] = await Promise.all([
          platformFetch('/api/v1/platform/colleges'),
          platformFetch('/api/v1/platform/modules'),
        ]);

        const collegesJson = await collegesRes.json();
        const modulesJson = await modulesRes.json();

        if (collegesJson.success && collegesJson.data.length > 0) {
          setColleges(collegesJson.data);
          setSelectedCollegeId(String(collegesJson.data[0].id));
        }

        if (modulesJson.success) {
          setModules(modulesJson.data);
        }
      } catch (err) {
        console.error('Error initializing entitlements:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // 2. Fetch specific college's entitlements when selected
  useEffect(() => {
    if (!selectedCollegeId) return;

    async function fetchCollegeEntitlements() {
      try {
        const res = await platformFetch(`/api/v1/platform/colleges/${selectedCollegeId}`);
        const json = await res.json();
        if (json.success && json.data.modules) {
          const map = {};
          json.data.modules.forEach((m) => {
            map[m.module_key] = m.is_enabled;
          });
          setEntitlements(map);
        }
      } catch (err) {
        console.error('Error fetching college entitlements:', err);
      }
    }

    fetchCollegeEntitlements();
  }, [selectedCollegeId]);

  const toggleModule = (key) => {
    setEntitlements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${selectedCollegeId}/modules`, {
        method: 'PUT',
        body: JSON.stringify({ modules: entitlements }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: 'Module entitlements saved and synced across tenant databases.' });
      } else {
        setFeedback({ type: 'error', message: json.message || 'Failed to save entitlements.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedCollege = colleges.find((c) => String(c.id) === String(selectedCollegeId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-foreground" />
            <span>Feature Entitlements</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Institutional Module Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Control SaaS module access per subscribed institution with instantaneous enforcement.
          </p>
        </div>

        {selectedCollege && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition active:scale-95 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Syncing Entitlements...' : 'Save Entitlements'}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-secondary text-foreground border-border'
              : 'bg-neutral-100 dark:bg-neutral-900 text-foreground border-neutral-300 dark:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-foreground" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-foreground" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground text-base px-2">
            ×
          </button>
        </div>
      )}

      {/* College Selector Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary text-foreground border border-border">
            <Building2 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Active Target Institution
            </label>
            <span className="text-sm font-bold text-foreground">
              {selectedCollege ? `${selectedCollege.name} (${selectedCollege.code})` : 'Select College'}
            </span>
          </div>
        </div>

        <select
          value={selectedCollegeId}
          onChange={(e) => setSelectedCollegeId(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring font-medium cursor-pointer"
        >
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const isEnabled = Boolean(entitlements[mod.module_key]);
          return (
            <div
              key={mod.module_key}
              className={`p-5 rounded-2xl border transition-all duration-200 bg-card text-card-foreground shadow-xs ${
                isEnabled
                  ? 'border-foreground/30 ring-1 ring-foreground/10'
                  : 'border-border opacity-70 bg-card/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border uppercase">
                    {mod.category}
                  </span>
                  <h3 className="font-bold text-base text-foreground mt-2">{mod.module_name}</h3>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.module_key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-ring ${
                    isEnabled ? 'bg-[#171717] dark:bg-[#fafafa]' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow-xs ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {mod.description || 'Institutional SaaS feature module.'}
              </p>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Route: {mod.base_route}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    isEnabled
                      ? 'bg-secondary text-foreground border border-border'
                      : 'text-muted-foreground'
                  }`}
                >
                  {isEnabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

