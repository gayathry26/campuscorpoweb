import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import { Shield, Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function PlatformLogin() {
  const { isAuthenticated, login } = usePlatformAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/platform-admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/platform-admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('platform.admin@campuscorp.io');
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative font-sans transition-colors selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border shadow-xs p-2 mb-4">
            <img
              src="/logo-light.jpeg"
              alt="CampusCorp Logo"
              className="w-full h-full object-contain dark:hidden"
            />
            <img
              src="/logo-dark.jpeg"
              alt="CampusCorp Logo"
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            CampusCorp Platform
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Global SaaS & Multi-Tenant Super Administration
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[11px] font-mono text-foreground font-semibold">
            <Sparkles className="w-3 h-3 text-foreground" />
            <span>Central Tier: campuscorp_platform</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-start gap-3 text-foreground text-xs">
              <AlertCircle className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Platform Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campuscorp.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-bold text-sm shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating with Central Cluster...</span>
              ) : (
                <>
                  <span>Sign In to Platform Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">Root Admin Credentials:</span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-foreground hover:underline font-semibold transition cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
            <div className="p-3 rounded-xl bg-secondary border border-border text-[11px] font-mono text-muted-foreground space-y-1">
              <div>Email: <span className="text-foreground font-bold">platform.admin@campuscorp.io</span></div>
              <div>Pass: <span className="text-foreground font-bold">Password@123</span></div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          CampusCorp Enterprise Multi-Tenant Engine • Tier 1 Platform Level
        </p>
      </div>
    </div>
  );
}

