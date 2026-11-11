import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import { usePreferences } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Building2,
  Database,
  Layers,
  CreditCard,
  FileText,
  Sliders,
  Shield,
  LogOut,
  Activity,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Users,
  Sun,
  Moon,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'SaaS Overview', path: '/platform-admin', icon: LayoutDashboard, exact: true },
  { name: 'Colleges Registry', path: '/platform-admin/colleges', icon: Building2 },
  { name: 'Onboarding Wizard', path: '/platform-admin/provision', icon: Sparkles },
  { name: 'Database Clusters', path: '/platform-admin/databases', icon: Database },
  { name: 'Module Entitlements', path: '/platform-admin/modules', icon: Layers },
  { name: 'Subscriptions', path: '/platform-admin/subscriptions', icon: CreditCard },
  { name: 'User & Access', path: '/platform-admin/users', icon: Users },
  { name: 'System Monitoring', path: '/platform-admin/monitoring', icon: Activity },
  { name: 'Platform Audit Logs', path: '/platform-admin/audit-logs', icon: FileText },
  { name: 'Platform Settings', path: '/platform-admin/settings', icon: Sliders },
];

export function PlatformAdminLayout({ children }) {
  const { platformUser, logout } = usePlatformAuth();
  const { isDark, toggleDarkMode } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/platform-admin/login');
  };

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/platform-admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-card p-1 border border-border shadow-xs flex items-center justify-center overflow-hidden shrink-0">
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
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-foreground text-base sm:text-lg">CampusCorp</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                    SaaS Hub
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">Global Multi-College Administration</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cluster Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
              </span>
              <span>Cluster: Online</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
            </button>

            {/* Back to college app link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-xl border border-border bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 font-semibold"
              title="Open College Portal in New Tab"
            >
              <span>College Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Platform Admin User Profile */}
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-foreground">
                  {platformUser?.first_name} {platformUser?.last_name}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono tracking-wide">
                  {platformUser?.role || 'PLATFORM_SUPER_ADMIN'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer"
                title="Sign out of Platform Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-card rounded-2xl border border-border p-3 space-y-1 shadow-xs">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Global Platform Controls
            </div>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-[#fafafa] dark:text-[#0a0a0a]' : 'text-muted-foreground'}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa] dark:bg-[#0a0a0a]" />
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4 mt-4 border-t border-border px-1">
              <div className="p-3.5 rounded-xl bg-secondary border border-border">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-foreground" />
                  <span>Central Platform DB</span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                  campuscorp_platform
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground font-medium">
                  Isolated multi-tenant SaaS architecture
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-4 flex flex-col shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-foreground" />
                  <span className="font-bold text-foreground">SaaS Console</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        active
                          ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 truncate">{item.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa] dark:bg-[#0a0a0a]" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-foreground bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

