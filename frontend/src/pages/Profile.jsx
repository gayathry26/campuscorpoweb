import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/Badge';
import { User, Mail, Phone, BookOpen, Award, FileText, Upload, Save, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    skills: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(`/students/${user.studentId}`);
      const st = res.data.student || {};
      setProfile(st);

      let skillsStr = '';
      try {
        const parsed = typeof st.skills === 'string' ? JSON.parse(st.skills) : st.skills;
        skillsStr = Array.isArray(parsed) ? parsed.join(', ') : '';
      } catch (e) {}

      setForm({
        skills: skillsStr,
        linkedin_url: st.linkedin_url || '',
        github_url: st.github_url || '',
        portfolio_url: st.portfolio_url || '',
        phone: st.phone || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.studentId) return;

    setSaving(true);
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await apiClient.put(`/students/${user.studentId}/profile`, {
        ...form,
        skills: skillsArray,
      });
      showToast('Profile details updated successfully!', 'success');
      fetchProfile();
    } catch (err) {
      showToast('Failed to update profile: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving student profile and verified records..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Student Placement Profile & Credentials</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Official student identity, verified semester marks, and verified technical skill portfolio.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-xs space-y-5">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-border gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#171717] text-[#fafafa] dark:bg-[#fafafa] dark:text-[#0a0a0a] font-bold text-xl flex items-center justify-center shadow-xs">
              {user?.firstName?.[0] || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user?.firstName} {user?.lastName}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Reg No: {user?.registerNumber} • Department: {user?.departmentCode}</p>
            </div>
          </div>
          <div>
            <StatusBadge status={profile?.placement_status || 'REGISTERED'} />
          </div>
        </div>

        {/* Readonly Academic Data from Master DB */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-3.5 bg-secondary/70 rounded-xl border border-border">
          <div>
            <span className="text-muted-foreground font-medium text-xs">Programme & Batch:</span>
            <p className="font-semibold text-foreground text-sm mt-0.5">{profile?.programme || 'B.Tech'} ({profile?.batch || '2023-2027'})</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Cumulative CGPA:</span>
            <p className="font-bold text-foreground text-lg mt-0.5">{profile?.cgpa || '8.50'}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">Active Backlogs:</span>
            <p className="font-semibold text-foreground text-sm mt-0.5">
              {profile?.active_backlogs || 0} (No History)
            </p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium text-xs">AI Readiness Score:</span>
            <p className="font-bold text-foreground text-lg mt-0.5">{profile?.placement_readiness_score || 80}/100</p>
          </div>
        </div>

        {/* Skill Analyzer Integration Card */}
        <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Skill Analyzer & Career Fitment</p>
              <p className="text-xs text-muted-foreground mt-0.5">Select interactive technologies, take 3-minute quizzes, and discover matching IT career roles with personalized roadmaps.</p>
            </div>
          </div>
          <Link
            to="/skill-analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-xs transition-transform active:scale-95"
          >
            <span>Open Skill Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Editable Student Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Technical Skills (Comma separated)</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              placeholder="e.g. React, Node.js, Python, SQL, Docker, Machine Learning"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                className="w-full py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className="w-full py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Portfolio / Personal Website</label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                className="w-full py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                placeholder="https://myportfolio.dev"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full py-2 px-3 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] hover:bg-[#262626] text-[#fafafa] dark:bg-[#fafafa] dark:hover:bg-[#e5e5e5] dark:text-[#0a0a0a] font-semibold rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
