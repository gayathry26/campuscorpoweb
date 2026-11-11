import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Sliders,
  Save,
  RefreshCw,
  Shield,
  Server,
  Mail,
  Lock,
  Globe,
} from 'lucide-react';

export function PlatformSettings() {
  const { platformFetch } = usePlatformAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await platformFetch('/api/v1/platform/settings');
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings((prev) =>
      prev.map((s) => (s.setting_key === key ? { ...s, setting_value: val } : s))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await platformFetch('/api/v1/platform/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: 'Global platform settings successfully saved.' });
      } else {
        setFeedback({ type: 'error', text: json.message || 'Failed to save settings.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Group settings by category
  const categories = Array.from(new Set(settings.map((s) => s.category || 'GENERAL')));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-foreground" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Global SaaS Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Central environment variables, cluster defaults, security gates, and multi-tenant parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition active:scale-95 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Global Settings'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-secondary text-foreground border-border'
              : 'bg-neutral-100 dark:bg-neutral-900 text-foreground border-neutral-300 dark:border-neutral-700'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
          <span>Loading platform settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {categories.map((cat) => {
            const catSettings = settings.filter((s) => s.category === cat);
            return (
              <div
                key={cat}
                className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4 text-card-foreground"
              >
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                    {cat} Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catSettings.map((s) => (
                    <div key={s.setting_key} className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <label className="text-xs font-mono font-semibold text-foreground">
                          {s.setting_key}
                        </label>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {s.description}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={s.setting_value}
                        onChange={(e) => handleChange(s.setting_key, e.target.value)}
                        className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </form>
      )}
    </div>
  );
}

