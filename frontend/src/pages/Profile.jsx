import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/Badge';
import {
  User,
  Lock,
  Save,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Code2,
  Globe,
  FileSearch,
} from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    date_of_birth: '',
    gender: '',
    city: '',
    preferred_locations: '',
    bio: '',
    target_roles: '',
    languages_known: '',
    skills: '',
    certifications: '',
    projects_summary: '',
    internships_summary: '',
    linkedin_url: '',
    github_url: '',
    coding_profile_url: '',
    portfolio_url: '',
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
      } catch (e) { }

      let ext = {};
      try {
        ext = typeof st.profile_details === 'string' ? JSON.parse(st.profile_details) : (st.profile_details || {});
      } catch (e) { }

      setForm({
        phone: st.phone || '',
        date_of_birth: ext.date_of_birth || '',
        gender: ext.gender || '',
        city: ext.city || '',
        preferred_locations: ext.preferred_locations || '',
        bio: ext.bio || '',
        target_roles: ext.target_roles || '',
        languages_known: ext.languages_known || '',
        skills: skillsStr,
        certifications: ext.certifications || '',
        projects_summary: ext.projects_summary || '',
        internships_summary: ext.internships_summary || '',
        linkedin_url: st.linkedin_url || '',
        github_url: st.github_url || '',
        coding_profile_url: ext.coding_profile_url || '',
        portfolio_url: st.portfolio_url || '',
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
      const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
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

  const activeBacklogs = Number(profile?.active_backlogs ?? 0);
  const historyBacklogs = Number(profile?.history_of_backlogs ?? 0);

  return (
    <div className="space-y-5 max-w-5xl pb-12">
      {/* Compact Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Student Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Official academic credentials, personal details, technical skills, and career portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/resume-analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-card hover:bg-[#F8EDF0] text-foreground border border-border transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5 text-[#8B2942]" />
            <span>AI Resume Analyzer</span>
          </Link>
          <Link
            to="/skill-analyzer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#8B2942] hover:bg-[#702038] text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skill Analyzer</span>
          </Link>
        </div>
      </div>

      {/* 1. IDENTITY & ADMIN-VERIFIED ACADEMIC CREDENTIALS (READ-ONLY) */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#8B2942] text-white font-bold text-lg flex items-center justify-center shrink-0">
              {user?.firstName?.[0] || 'S'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reg No: <strong className="text-foreground">{profile?.register_number || user?.registerNumber || 'N/A'}</strong> • Dept: <strong className="text-foreground">{profile?.department_code || user?.departmentCode || 'CSE'}</strong> • {profile?.email || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={profile?.placement_status || 'REGISTERED'} />
          </div>
        </div>

        {/* Admin-Only Verified Academic Bar */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#8B2942]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Official Academic & Backlog Records
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] dark:text-[#F2B8C7] border border-[#8B2942]/20">
              <Lock className="w-3 h-3" />
              <span>Admin Managed • Read-Only</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 p-3.5 bg-[#F7F6F7] dark:bg-[#262126] rounded-xl border border-border">
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Programme</span>
              <p className="font-semibold text-foreground text-xs mt-0.5">
                {profile?.programme || 'B.Tech'} ({profile?.batch || '2023-2027'})
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Semester</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                Sem {profile?.current_semester || 7}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Cumulative CGPA</span>
              <p className="font-bold text-foreground text-sm mt-0.5">
                {profile?.cgpa ?? '8.50'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Active Backlogs</span>
              <p className={`font-bold text-sm mt-0.5 ${activeBacklogs > 0 ? 'text-[#B42318]' : 'text-[#26966B]'}`}>
                {activeBacklogs}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Backlog History</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {historyBacklogs > 0 ? `${historyBacklogs} Past` : 'No History'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">10th / 12th %</span>
              <p className="font-semibold text-foreground text-xs mt-0.5">
                {profile?.tenth_percentage ? `${profile.tenth_percentage}%` : '—'} / {profile?.twelfth_percentage ? `${profile.twelfth_percentage}%` : '—'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-medium">Readiness Score</span>
              <p className="font-bold text-[#8B2942] dark:text-[#F2B8C7] text-sm mt-0.5">
                {profile?.placement_readiness_score || 80}/100
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Backlogs, CGPA, and official semester marks can only be entered or modified by the Institution Admin or Placement Officer.
          </p>
        </div>
      </div>

      {/* 2. COMPREHENSIVE EDITABLE PROFILE FORM */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* Personal & Contact Details */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Personal & Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Official Email</label>
              <input
                type="email"
                value={profile?.email || user?.email || ''}
                disabled
                className="w-full h-9 px-3 border border-border bg-[#F7F6F7] dark:bg-[#262126] text-muted-foreground rounded-lg text-xs cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Current City / Location</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. Chennai, Bengaluru"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Preferred Work Locations</label>
              <input
                type="text"
                value={form.preferred_locations}
                onChange={(e) => setForm({ ...form, preferred_locations: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. Bengaluru, Hyderabad, Remote"
              />
            </div>
          </div>
        </div>

        {/* Career Summary, Skills & Experience */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Skills, Career Objective & Experience</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Professional Summary / Career Objective</label>
            <textarea
              rows={2}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full p-2.5 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
              placeholder="Briefly describe your technical strengths, career goals, and engineering interests..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Technical Skills (Comma separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. React, Node.js, Python, SQL, Docker"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target IT Roles / Domains</label>
              <input
                type="text"
                value={form.target_roles}
                onChange={(e) => setForm({ ...form, target_roles: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. Full-Stack Developer, Cloud Engineer, AI Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Certifications</label>
              <input
                type="text"
                value={form.certifications}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. AWS Cloud Practitioner, Google Data Analytics"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Languages Known</label>
              <input
                type="text"
                value={form.languages_known}
                onChange={(e) => setForm({ ...form, languages_known: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="e.g. English, Tamil, Hindi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Key Projects Summary</label>
              <textarea
                rows={2}
                value={form.projects_summary}
                onChange={(e) => setForm({ ...form, projects_summary: e.target.value })}
                className="w-full p-2.5 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="Highlight your top academic or personal software projects..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Internships / Industrial Training</label>
              <textarea
                rows={2}
                value={form.internships_summary}
                onChange={(e) => setForm({ ...form, internships_summary: e.target.value })}
                className="w-full p-2.5 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="Company, role, duration, and key deliverables..."
              />
            </div>
          </div>
        </div>

        {/* Professional & Coding Profiles */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-[#F8EDF0] dark:bg-[#312128] text-[#8B2942] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Professional & Coding Profiles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">LeetCode / HackerRank Profile URL</label>
              <input
                type="url"
                value={form.coding_profile_url}
                onChange={(e) => setForm({ ...form, coding_profile_url: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="https://leetcode.com/u/username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Portfolio / Personal Website</label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                className="w-full h-9 px-3 border border-border bg-card text-foreground rounded-lg text-xs focus:outline-none focus:border-[#8B2942]"
                placeholder="https://myportfolio.dev"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B2942] hover:bg-[#702038] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Profile;
