import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionContext';
import {
  Sun,
  Moon,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  Eye,
} from 'lucide-react';

export function Settings() {
  const {
    isDark,
    setDarkMode,
    notificationsEnabled,
    setNotificationsEnabled,
    lmsAlertsEnabled,
    setLmsAlertsEnabled,
    placementAlertsEnabled,
    setPlacementAlertsEnabled,
    savingPreferences,
  } = usePreferences();

  const { user, switchRole } = useAuth();
  const {
    allPages,
    userRoles,
    rolePermissions,
    backendSynced,
    togglePermission,
    setAllPermissionsForRole,
    resetToDefaults,
  } = usePermissions();

  const isAdmin = user?.roleName === 'SUPER_ADMIN' || user?.roleName === 'ADMIN';

  // Navigation tab: defaults to 'preferences' for everyone.
  // Admins have access to the secondary 'matrix' tab for role page permissions.
  const [activeTab, setActiveTab] = useState('preferences');
  const [selectedRole, setSelectedRole] = useState(isAdmin ? 'STUDENT' : (user?.roleName || 'STUDENT'));
  const [pageSearch, setPageSearch] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  // Security guard: If non-admin somehow targets 'matrix', force back to 'preferences'
  useEffect(() => {
    if (!isAdmin && activeTab !== 'preferences') {
      setActiveTab('preferences');
    }
  }, [isAdmin, activeTab]);

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSelectMode = (mode) => {
    setDarkMode(mode === 'dark');
    triggerNotice();
  };

  const handleToggleNotifications = (val) => {
    setNotificationsEnabled(val);
    triggerNotice();
  };

  const handleToggleLms = (val) => {
    setLmsAlertsEnabled(val);
    triggerNotice();
  };

  const handleTogglePlacement = (val) => {
    setPlacementAlertsEnabled(val);
    triggerNotice();
  };

  const handleCheckboxToggle = (pagePath) => {
    if (!isAdmin) return;
    if (selectedRole === 'SUPER_ADMIN') return;
    togglePermission(selectedRole, pagePath);
    triggerNotice();
  };

  const currentRoleObj = userRoles.find((r) => r.id === selectedRole) || userRoles[0];
  const allowedForSelectedRole =
    selectedRole === 'SUPER_ADMIN'
      ? allPages.map((p) => p.path)
      : rolePermissions[selectedRole] || [];

  const filteredPages = allPages.filter(
    (p) =>
      p.label.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.path.toLowerCase().includes(pageSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(pageSearch.toLowerCase())
  );

  const categories = Array.from(new Set(allPages.map((p) => p.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. Header Banner & Section Navigation                                     */}
      {/* ========================================================================= */}
      <div className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Customization
              </span>
              {(savedNotice || savingPreferences) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-secondary text-foreground text-xs font-bold border border-border animate-fade-in">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  {savingPreferences ? 'Saving...' : 'Saved to Account'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Personalize your visual theme and configure notification delivery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-secondary border border-border text-right shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Logged in as
              </span>
              <span className="text-sm font-bold text-foreground">
                {user?.roleName || 'STUDENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Tab Switcher: Only displayed for Administrators */}
        {isAdmin && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border text-sm">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preferences'
                  ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Settings & Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Role Page Access Matrix</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. Compact Settings Content (Appearance & Notifications)                  */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Card A: Appearance */}
          <div className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Appearance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select your interface theme mode (Light or Dark).
                </p>
              </div>
            </div>

            {/* Display Mode Selector */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground block">
                Theme Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectMode('light')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    !isDark
                      ? 'border-foreground/80 bg-secondary/80 ring-1 ring-foreground/20 shadow-xs'
                      : 'border-border bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Light Mode</span>
                      {!isDark && <Check className="w-4 h-4 text-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Clean bright background with sharp contrast
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMode('dark')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isDark
                      ? 'border-foreground/80 bg-secondary/80 ring-1 ring-foreground/20 shadow-xs'
                      : 'border-border bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Dark Mode</span>
                      {isDark && <Check className="w-4 h-4 text-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Deep charcoal dark surface for reduced eye strain
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Notifications */}
          <div className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Notifications
                </h2>
                <p className="text-sm text-muted-foreground">
                  Control in-app alerts and deadline notifications.
                </p>
              </div>
            </div>

            {/* Master In-App Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                  {notificationsEnabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Allow In-App Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Master switch for all career alerts and academic updates.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#171717] dark:peer-checked:bg-[#fafafa] dark:peer-checked:after:bg-[#0a0a0a]"></div>
              </label>
            </div>

            {/* Category Sub-Toggles */}
            <div className={`space-y-3 pt-1 transition-opacity ${notificationsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      LMS Academic & Deadline Alerts
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Announcements, assignment due dates, and quiz releases.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!notificationsEnabled}
                    checked={notificationsEnabled && lmsAlertsEnabled}
                    onChange={(e) => handleToggleLms(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#171717] dark:peer-checked:bg-[#fafafa] dark:peer-checked:after:bg-[#0a0a0a]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Placement & Career Alerts
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      New campus drives, application status, and interview slots.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!notificationsEnabled}
                    checked={notificationsEnabled && placementAlertsEnabled}
                    onChange={(e) => handleTogglePlacement(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#171717] dark:peer-checked:bg-[#fafafa] dark:peer-checked:after:bg-[#0a0a0a]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Role Page Access Matrix (Super Admin Authority Only)                   */}
      {/* ========================================================================= */}
      {isAdmin && activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Authority notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary border border-border text-foreground flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <span>Super Admin Page Access Authority</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-xs font-extrabold uppercase">
                    Root Unrestricted
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  <strong>Super Admin will always have full access to all pages.</strong> For every other user type, <strong>only the ticked checkbox pages below will be visible</strong> in their sidebar navigation and portal routes.
                </p>
              </div>
            </div>
          </div>

          {/* User Role Selector Pills */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                Select User Type to Configure Permissions
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {userRoles.length} Defined Roles
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {userRoles.map((r) => {
                const isSelected = r.id === selectedRole;
                const isSuper = r.id === 'SUPER_ADMIN';
                const count =
                  r.id === 'SUPER_ADMIN'
                    ? allPages.length
                    : (rolePermissions[r.id] || []).length;

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                      isSelected
                        ? isSuper
                          ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-border shadow-xs font-black'
                          : 'bg-[#171717] text-white dark:bg-[#fafafa] dark:text-[#0a0a0a] border-transparent shadow-xs'
                        : 'bg-secondary text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        isSelected
                          ? isSuper
                            ? 'bg-slate-950 text-muted-foreground'
                            : 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-muted-foreground'
                      }`}
                    >
                      {count}/{allPages.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-foreground">
                    Permissions for: {currentRoleObj.label}
                  </h3>
                  {selectedRole === 'SUPER_ADMIN' ? (
                    <span className="px-2.5 py-0.5 rounded-md bg-secondary text-foreground text-xs font-extrabold border border-border">
                      Locked All On (Root)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold border border-border bg-secondary text-foreground">
                      {allowedForSelectedRole.length} of {allPages.length} Pages Visible
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentRoleObj.desc}
                </p>
              </div>

              {selectedRole !== 'SUPER_ADMIN' && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setAllPermissionsForRole(selectedRole, true);
                      triggerNotice();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Tick All</span>
                  </button>
                  <button
                    onClick={() => {
                      setAllPermissionsForRole(selectedRole, false);
                      triggerNotice();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    <span>Untick All</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToDefaults();
                      triggerNotice();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    onClick={() => switchRole(selectedRole)}
                    className="px-3 py-1.5 rounded-lg bg-[#171717] text-white dark:bg-[#fafafa] dark:text-[#0a0a0a] text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Switch session to this role to see the exact sidebar appearance"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview as {currentRoleObj.label}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="text"
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                placeholder="Filter pages by name, route (/students), or category..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-secondary transition-all"
              />
            </div>

            {/* Checkbox Groups by Category */}
            <div className="space-y-6 pt-2">
              {categories.map((category) => {
                const categoryPages = filteredPages.filter((p) => p.category === category);
                if (categoryPages.length === 0) return null;

                const allowedInCat = categoryPages.filter((p) =>
                  allowedForSelectedRole.includes(p.path)
                ).length;

                return (
                  <div key={category} className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {category}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {allowedInCat} / {categoryPages.length} active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {categoryPages.map((page) => {
                        const isTicked = allowedForSelectedRole.includes(page.path);
                        const isSuper = selectedRole === 'SUPER_ADMIN';

                        return (
                          <label
                            key={page.path}
                            onClick={(e) => {
                              if (isSuper) {
                                e.preventDefault();
                                return;
                              }
                            }}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                              isSuper
                                ? 'bg-secondary/40 border-border opacity-70 cursor-not-allowed'
                                : isTicked
                                ? 'bg-secondary/50 border-border cursor-pointer shadow-2xs hover:border-foreground/30'
                                : 'bg-card border-border hover:bg-secondary/30 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTicked}
                              disabled={isSuper}
                              onChange={() => handleCheckboxToggle(page.path)}
                              className="w-4 h-4 mt-1 rounded text-foreground focus:ring-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-foreground block truncate">
                                {page.label}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono block">
                                {page.path}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold uppercase px-2 py-0.5 rounded tracking-wider ${
                                isTicked
                                  ? 'bg-secondary text-foreground'
                                  : 'text-muted-foreground/60'
                              }`}
                            >
                              {isTicked ? 'Visible' : 'Hidden'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
