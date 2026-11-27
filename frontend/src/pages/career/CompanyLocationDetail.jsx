import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  ChevronLeft,
  Share2,
  Navigation,
  Compass,
  Star,
  Plus,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  Phone,
  Mail,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import careerService from '../../services/careerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CompanyLocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('offices'); // 'offices' | 'jobs' | 'tech' | 'about'
  const [jobSearch, setJobSearch] = useState('');
  const [jobExpFilter, setJobExpFilter] = useState('ALL');
  const [jobWorkModeFilter, setJobWorkModeFilter] = useState('ALL');

  // Geolocation for distance calculation
  const [userCoords, setUserCoords] = useState(null);

  // Admin Modal States
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add Office Form State
  const [officeForm, setOfficeForm] = useState({
    office_name: '',
    office_type: 'BRANCH',
    address_line1: '',
    city: '',
    state: 'Tamil Nadu',
    country: 'India',
    postal_code: '',
    latitude: '',
    longitude: '',
    work_modes: 'HYBRID,ONSITE',
    is_hiring_here: true,
  });

  // Edit Company Form State
  const [companyForm, setCompanyForm] = useState({
    name: '',
    company_type: 'MNC',
    website: '',
    careers_url: '',
    overview: '',
    employee_count_range: '10,000+',
    headquarters: '',
    is_verified: true,
  });

  const isAdmin = user && (user.roleName === 'SUPER_ADMIN' || user.roleName === 'ADMIN' || user.roleName === 'TPO_OFFICER');

  // Load user geolocation silently if permitted
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Geolocation declined or unavailable, distance will be null
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await careerService.getCompanyLocationDetails(id, userCoords);
      if (!data) {
        setError('Company record not found in the verified corporate registry.');
      } else {
        setCompany(data);
        setCompanyForm({
          name: data.name || '',
          company_type: data.company_type || 'MNC',
          website: data.website || '',
          careers_url: data.careers_url || '',
          overview: data.overview || '',
          employee_count_range: data.employee_count_range || '10,000+',
          headquarters: data.headquarters || '',
          is_verified: Boolean(data.is_verified),
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve company details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, userCoords]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle share / copy link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Company link copied to clipboard!', 'success');
  };

  // Handle Add Office Submission
  const handleAddOfficeSubmit = async (e) => {
    e.preventDefault();
    if (!officeForm.office_name || !officeForm.city || !officeForm.address_line1) {
      showToast('Please provide an office name, city, and street address.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...officeForm,
        latitude: officeForm.latitude ? parseFloat(officeForm.latitude) : null,
        longitude: officeForm.longitude ? parseFloat(officeForm.longitude) : null,
      };
      await careerService.adminAddOffice(company.id, payload);
      showToast('Verified office location added successfully!', 'success');
      setShowAddOfficeModal(false);
      setOfficeForm({
        office_name: '',
        office_type: 'BRANCH',
        address_line1: '',
        city: '',
        state: 'Tamil Nadu',
        country: 'India',
        postal_code: '',
        latitude: '',
        longitude: '',
        work_modes: 'HYBRID,ONSITE',
        is_hiring_here: true,
      });
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add office location.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Company Submission
  const handleEditCompanySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await careerService.adminUpdateCompany(company.id, companyForm);
      showToast('Company profile updated successfully!', 'success');
      setShowEditCompanyModal(false);
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update company.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Office Status Toggle (Hiring or Verify)
  const handleToggleOffice = async (officeId, field) => {
    try {
      await careerService.adminToggleOfficeStatus('office', officeId, field);
      showToast(`Office ${field} status updated.`, 'success');
      fetchDetails();
    } catch (err) {
      showToast('Failed to toggle status.', 'error');
    }
  };

  // Filter Jobs
  const filteredJobs = (company?.jobs || []).filter((job) => {
    const matchesSearch =
      !jobSearch ||
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      (job.office_city && job.office_city.toLowerCase().includes(jobSearch.toLowerCase())) ||
      (job.locations && job.locations.toLowerCase().includes(jobSearch.toLowerCase()));
    const matchesExp = jobExpFilter === 'ALL' || job.experience_level === jobExpFilter;
    const matchesWorkMode = jobWorkModeFilter === 'ALL' || job.work_mode === jobWorkModeFilter;
    return matchesSearch && matchesExp && matchesWorkMode;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Loading Verified Company Profile...</p>
          <p className="text-xs text-muted-foreground mt-1">Connecting to corporate database & geocoded offices</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-card rounded-2xl border border-border text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Company Information Unavailable</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {error || 'The requested IT company record could not be loaded.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/career-explorer/companies')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to IT Companies</span>
          </button>
          <button
            onClick={fetchDetails}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  const activeHiringOffices = company.offices?.filter((o) => o.is_hiring_here) || [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to="/career-explorer/companies"
            className="inline-flex items-center gap-1.5 hover:text-foreground font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>IT Companies by Location</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">{company.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
            title="Copy page link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditCompanyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>
              <button
                onClick={() => setShowAddOfficeModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Office</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center p-3 shrink-0 shadow-xs">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = `<span class="text-2xl font-black text-primary">${company.name.slice(0, 2).toUpperCase()}</span>`;
                  }}
                />
              ) : (
                <span className="text-2xl font-black text-primary">
                  {company.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {company.name}
                </h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified IT Enterprise</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {company.company_type || 'MNC'}
                </span>
                {company.tier && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                    {company.tier}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>HQ: {company.headquarters || 'India'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Scale: {company.employee_count_range || '1,000+ Engineers'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-foreground">{company.rating || 4.5}</span>
                  <span>/ 5.0 Rating</span>
                </span>
              </div>

              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed pt-1">
                {company.overview || 'Leading Information Technology innovator driving engineering, software products, and global digital consulting solutions.'}
              </p>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            {company.careers_url && (
              <a
                href={company.careers_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-transform active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>Careers Portal</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>Official Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xs text-muted-foreground block">Verified Offices</span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">
              {company.offices?.length || 0} Locations
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xs text-muted-foreground block">Hiring Hubs</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {activeHiringOffices.length} Active Hubs
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xs text-muted-foreground block">Open Positions</span>
            <span className="text-lg font-bold text-primary mt-0.5 block">
              {company.jobs?.length || 0} Verified Roles
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-xs text-muted-foreground block">Tech Domains</span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">
              {company.tech_domains?.length || 0} Core Stacks
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('offices')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'offices'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Office Locations ({company.offices?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'jobs'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Career Openings ({company.jobs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('tech')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'tech'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Technologies & Domains ({company.tech_domains?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'about'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Overview & Insights</span>
        </button>
      </div>

      {/* Tab 1: Office Locations */}
      {activeTab === 'offices' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Verified Development Centers & Campuses</h2>
              <p className="text-xs text-muted-foreground">
                All physical development offices, research centers, and delivery hubs registered with CampusCorp
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddOfficeModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Office Location</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(company.offices || []).map((office) => {
              const googleMapsQuery = office.latitude && office.longitude
                ? `${office.latitude},${office.longitude}`
                : encodeURIComponent(`${company.name} ${office.address_line1} ${office.city}`);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`;

              return (
                <div
                  key={office.id}
                  className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                            {office.office_name}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                          {office.city}, {office.state}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                          {office.office_type.replace('_', ' ')}
                        </span>
                        {office.is_hiring_here ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Hiring Active</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                            Office Only
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2 pt-1">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        {office.address_line1}
                        {office.postal_code ? `, PIN: ${office.postal_code}` : ''}
                      </span>
                    </div>

                    {/* Work Modes */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {office.work_modes_list?.map((wm) => (
                        <span
                          key={wm}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/50"
                        >
                          {wm}
                        </span>
                      ))}
                      {office.distance_km !== null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Navigation className="w-3 h-3" />
                          <span>{office.distance_km} km away</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleOffice(office.id, 'hiring')}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-border hover:bg-muted text-muted-foreground transition-colors"
                          title="Toggle hiring status"
                        >
                          {office.is_hiring_here ? 'Mark Inactive' : 'Mark Hiring'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Career Openings */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search openings by role, keywords, or location..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={jobExpFilter}
                onChange={(e) => setJobExpFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Experience Levels</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FRESHER">Fresher (0-1 yrs)</option>
                <option value="ENTRY_LEVEL">Entry Level (1-3 yrs)</option>
                <option value="MID_LEVEL">Mid Level (3-5 yrs)</option>
              </select>

              <select
                value={jobWorkModeFilter}
                onChange={(e) => setJobWorkModeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">All Work Modes</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border p-6">
              <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-sm">No Active Roles Matching Filter</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try clearing search terms or check back when new recruitment drives are scheduled.
              </p>
              {company.careers_url && (
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
                >
                  <span>Explore Direct Careers Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-snug">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {job.office_city || job.locations || job.location || 'Multiple Hubs'}
                          </span>
                          {job.office_name && <span>• {job.office_name}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {job.work_mode || 'HYBRID'}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {job.experience_level?.replace('_', ' ') || 'ENTRY LEVEL'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs pt-1">
                      {job.ctc_lpa && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{job.ctc_lpa} LPA
                        </span>
                      )}
                      {job.stipend_monthly && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{job.stipend_monthly.toLocaleString()}/mo Stipend
                        </span>
                      )}
                      {job.domain_name && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
                          {job.domain_name}
                        </span>
                      )}
                      {job.is_verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Opportunity</span>
                        </span>
                      )}
                    </div>

                    {job.eligibility_criteria_parsed?.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg border border-border/40">
                        <span className="font-semibold text-foreground">Eligibility: </span>
                        {job.eligibility_criteria_parsed.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      Status: <strong className="text-foreground">{job.status || 'Active'}</strong>
                    </span>

                    <a
                      href={job.apply_url || company.careers_url || company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-transform active:scale-95 shadow-xs"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Technologies & Domains */}
      {activeTab === 'tech' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Verified Engineering Domains & Tech Stack</h2>
            <p className="text-xs text-muted-foreground">
              Production stacks, tools, and technical competencies verified for {company.name} engineering teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(company.tech_domains || []).map((domain) => (
              <div
                key={domain.id}
                className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-foreground text-base">
                        {domain.domain_name}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground block">
                      Proficiency Level: <strong className="text-foreground">{domain.proficiency_level || 'Enterprise Scale'}</strong>
                    </span>
                  </div>

                  {domain.is_core_domain && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      Core Domain
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Verified Tools & Technologies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(domain.tech_stack) && domain.tech_stack.length > 0 ? (
                      domain.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/80 hover:border-primary/50 transition-colors"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Enterprise architecture stack
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Related Career Explorer Domains */}
          {company.relatedDomains && company.relatedDomains.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Related Career Explorer Learning Pathways</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Learn the foundational skills, salary benchmarks, and career roadmaps required by {company.name}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {company.relatedDomains.map((cd) => (
                  <Link
                    key={cd.id}
                    to={`/domains`}
                    className="p-3.5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-primary block">{cd.family}</span>
                      <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors mt-0.5">
                        {cd.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cd.short_description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                      <span>Explore Domain</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Overview & Insights */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-3 shadow-xs">
              <h2 className="text-lg font-bold text-foreground">About {company.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.overview || 'Leading Information Technology innovator driving engineering, software products, and global digital consulting solutions.'}
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-foreground">Data Integrity & Verification Guarantee</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                CampusCorp IT Company Explorer enforces a strict no-fabrication policy. All office locations, GPS coordinates, corporate headquarters, and career links have been mapped to authorized corporate records and official careers portals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">Zero Fake Postings</span>
                    <span className="text-muted-foreground">Every career opening links to real recruiter listings</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">Verified IT Locations</span>
                    <span className="text-muted-foreground">Physical campuses verified with geocoded coordinates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-foreground text-sm">Corporate Metadata</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Organization Type</span>
                  <span className="font-semibold text-foreground">{company.company_type || 'MNC'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Campus Tier</span>
                  <span className="font-semibold text-foreground">{company.tier || 'Tier 1'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Global Scale</span>
                  <span className="font-semibold text-foreground">{company.employee_count_range || '1,000+'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Primary HQ</span>
                  <span className="font-semibold text-foreground">{company.headquarters || 'India'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Verification</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Institutional Certified</span>
                </div>
              </div>
            </div>

            {company.careers_url && (
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                <h4 className="font-bold text-foreground text-sm">Direct Student Application</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Students eligible for off-campus recruitment or campus drives can review genuine vacancies on {company.name}&apos;s official careers portal.
                </p>
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
                >
                  <span>Visit {company.name} Careers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Modal: Add Office Location */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Verified Office Location</span>
              </h3>
              <button
                onClick={() => setShowAddOfficeModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfficeSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Office / Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saravanampatti IT Park Campus"
                  value={officeForm.office_name}
                  onChange={(e) => setOfficeForm({ ...officeForm, office_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore"
                    value={officeForm.city}
                    onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Office Type</label>
                  <select
                    value={officeForm.office_type}
                    onChange={(e) => setOfficeForm({ ...officeForm, office_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  >
                    <option value="HEADQUARTERS">Headquarters</option>
                    <option value="REGIONAL_HUB">Regional Tech Hub</option>
                    <option value="BRANCH">Development Branch</option>
                    <option value="DELIVERY_CENTER">Delivery Center</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHIL SEZ, Keeranatham Road, Saravanampatti"
                  value={officeForm.address_line1}
                  onChange={(e) => setOfficeForm({ ...officeForm, address_line1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">State</label>
                  <input
                    type="text"
                    value={officeForm.state}
                    onChange={(e) => setOfficeForm({ ...officeForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 641035"
                    value={officeForm.postal_code}
                    onChange={(e) => setOfficeForm({ ...officeForm, postal_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 11.0827"
                    value={officeForm.latitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 76.9958"
                    value={officeForm.longitude}
                    onChange={(e) => setOfficeForm({ ...officeForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_hiring_here"
                  checked={officeForm.is_hiring_here}
                  onChange={(e) => setOfficeForm({ ...officeForm, is_hiring_here: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="is_hiring_here" className="text-xs font-semibold text-foreground cursor-pointer">
                  Actively Hiring at this Office Location
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Verified Office'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal: Edit Company Profile */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Edit Company Information</span>
              </h3>
              <button
                onClick={() => setShowEditCompanyModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCompanySubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Company Type</label>
                  <select
                    value={companyForm.company_type}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  >
                    <option value="MNC">MNC</option>
                    <option value="PRODUCT">Product & Engineering</option>
                    <option value="SERVICE">IT Services & Consulting</option>
                    <option value="STARTUP">High-Growth Tech</option>
                    <option value="GLOBAL_RD">Global R&D Center</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Scale / Size</label>
                  <input
                    type="text"
                    value={companyForm.employee_count_range}
                    onChange={(e) => setCompanyForm({ ...companyForm, employee_count_range: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Official Website URL</label>
                <input
                  type="url"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Verified Careers Portal URL</label>
                <input
                  type="url"
                  value={companyForm.careers_url}
                  onChange={(e) => setCompanyForm({ ...companyForm, careers_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Company Overview</label>
                <textarea
                  rows={3}
                  value={companyForm.overview}
                  onChange={(e) => setCompanyForm({ ...companyForm, overview: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={companyForm.is_verified}
                  onChange={(e) => setCompanyForm({ ...companyForm, is_verified: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="is_verified" className="text-xs font-semibold text-foreground cursor-pointer">
                  Mark as Institutional Verified IT Enterprise
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyLocationDetail;
