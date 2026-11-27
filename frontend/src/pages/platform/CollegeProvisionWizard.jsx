import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  Building2,
  Database,
  CreditCard,
  Layers,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Server,
  Lock,
  Mail,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Profile', icon: Building2, desc: 'College details' },
  { id: 2, name: 'Database', icon: Database, desc: 'Dedicated schema' },
  { id: 3, name: 'Licensing', icon: CreditCard, desc: 'SaaS plan' },
  { id: 4, name: 'Modules', icon: Layers, desc: 'Entitlements' },
  { id: 5, name: 'College Admin', icon: UserCheck, desc: 'Initial master account' },
  { id: 6, name: 'Review', icon: Shield, desc: 'Execute engine' },
];

export function CollegeProvisionWizard() {
  const { platformFetch } = usePlatformAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Profile
    name: '',
    code: '',
    type: 'ENGINEERING',
    affiliation: '',
    subdomain: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    // Step 2: Database
    database_name: '',
    db_host: '127.0.0.1',
    db_port: 3306,
    db_user: 'root',
    // Step 3: Subscription
    plan_id: 1,
    expiry_date: '',
    custom_student_limit: '',
    notes: '',
    // Step 4: Modules
    modules: {},
    // Step 5: Admin
    admin: {
      first_name: '',
      last_name: '',
      email: '',
      password: 'CollegeAdmin@2026',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);
  const [provisionError, setProvisionError] = useState(null);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [plansRes, modulesRes] = await Promise.all([
          platformFetch('/api/v1/platform/subscriptions/plans'),
          platformFetch('/api/v1/platform/modules'),
        ]);

        const plansJson = await plansRes.json();
        const modulesJson = await modulesRes.json();

        if (plansJson.success) {
          setPlans(plansJson.data);
          if (plansJson.data.length > 0) {
            setFormData((prev) => ({ ...prev, plan_id: plansJson.data[0].id }));
          }
        }

        if (modulesJson.success) {
          setAvailableModules(modulesJson.data);
          const defaultMods = {};
          modulesJson.data.forEach((m) => {
            defaultMods[m.module_key] = true;
          });
          setFormData((prev) => ({ ...prev, modules: defaultMods }));
        }

        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setFormData((prev) => ({
          ...prev,
          expiry_date: nextYear.toISOString().split('T')[0],
        }));
      } catch (err) {
        console.error('Error loading provisioning metadata:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadMetadata();
  }, []);

  // Auto-generate code, subdomain, and db name from name
  const handleNameChange = (val) => {
    const trimmed = val;
    let autoCode = formData.code;
    let autoSubdomain = formData.subdomain;
    let autoDb = formData.database_name;

    if (!formData.code || formData.code === deriveCode(formData.name)) {
      autoCode = deriveCode(trimmed);
    }
    if (!formData.subdomain || formData.subdomain === deriveSubdomain(formData.name)) {
      autoSubdomain = deriveSubdomain(trimmed);
    }
    if (!formData.database_name || formData.database_name === `campuscorp_college_${autoCode.toLowerCase()}`) {
      autoDb = `campuscorp_college_${autoCode.toLowerCase()}`;
    }

    setFormData((prev) => ({
      ...prev,
      name: trimmed,
      code: autoCode,
      subdomain: autoSubdomain,
      database_name: autoDb,
    }));
  };

  const deriveCode = (name) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return words.map((w) => w[0]).join('').toUpperCase().substring(0, 8);
    }
    return name.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const deriveSubdomain = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
  };

  const handleCodeChange = (val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    setFormData((prev) => ({
      ...prev,
      code: clean,
      database_name: `campuscorp_college_${clean.toLowerCase()}`,
    }));
  };

  const toggleModule = (key) => {
    setFormData((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [key]: !prev.modules[key],
      },
    }));
  };

  const handleLaunchProvisioning = async () => {
    setProvisioning(true);
    setProvisionError(null);

    try {
      const res = await platformFetch('/api/v1/platform/colleges/provision', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setProvisionResult(json.data);
      } else {
        setProvisionError(json.message || 'Provisioning failed.');
      }
    } catch (err) {
      setProvisionError(err.message);
    } finally {
      setProvisioning(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-foreground" />
        <span className="text-sm">Preparing College Provisioning Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Automated College Onboarding Engine</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Provision New College
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create an independent institutional tenant with dedicated MySQL database, schema baseline, and college admin credentials.
          </p>
        </div>

        <Link
          to="/platform-admin/colleges"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary border border-border hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold text-foreground transition self-start sm:self-auto shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Colleges Directory</span>
        </Link>
      </div>

      {/* Wizard Stepper Progress Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-secondary text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border'
                    : 'text-muted-foreground opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-background text-foreground'
                      : isCompleted
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>
                <div className="text-left">
                  <div className="leading-tight">{step.name}</div>
                  <div className="text-[10px] opacity-75 hidden sm:block">{step.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs text-card-foreground">
        {/* Step 1: Institutional Profile */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-foreground" />
                <span>Step 1: Institutional Profile</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter primary institutional details and identification code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-foreground font-semibold mb-1.5">
                  Official Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumaraguru College of Technology"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  College Code (Unique ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KCT"
                  value={formData.code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="kct"
                    value={formData.subdomain}
                    onChange={(e) =>
                      setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                    }
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-l-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                  <span className="px-3 py-2.5 bg-secondary border border-l-0 border-border text-muted-foreground font-mono text-[11px] rounded-r-xl">
                    .campuscorp.io
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Institution Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                >
                  <option value="ENGINEERING">Engineering & Technology</option>
                  <option value="AUTONOMOUS">Autonomous Institution</option>
                  <option value="UNIVERSITY">Deemed / State University</option>
                  <option value="ARTS_SCIENCE">Arts & Science College</option>
                  <option value="POLYTECHNIC">Polytechnic Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  University Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anna University"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="principal@kct.ac.in"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Official Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 94444 12345"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-foreground font-semibold mb-1.5">
                  Campus Address
                </label>
                <textarea
                  rows="2"
                  placeholder="Saravanampatti, Coimbatore, Tamil Nadu 641049"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Database Configuration */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-foreground" />
                <span>Step 2: Dedicated Physical Database Configuration</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure the dedicated MySQL database schema for complete data isolation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary border border-border flex items-start gap-3">
              <Server className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Physical Isolation Guarantee:</strong> CampusCorp SaaS provisions a separate MySQL database schema for this college. All student records, placement drives, LMS courses, and grades are strictly isolated.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-foreground font-semibold mb-1.5">
                  Physical Database Name (MySQL Schema) *
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formData.database_name}
                    onChange={(e) => setFormData({ ...formData, database_name: e.target.value.toLowerCase() })}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                  Schema will be auto-created: CREATE DATABASE `{formData.database_name}`
                </p>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Database Cluster Host
                </label>
                <input
                  type="text"
                  value={formData.db_host}
                  onChange={(e) => setFormData({ ...formData, db_host: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Database Port
                </label>
                <input
                  type="number"
                  value={formData.db_port}
                  onChange={(e) => setFormData({ ...formData, db_port: parseInt(e.target.value, 10) || 3306 })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Subscription & Licensing */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-foreground" />
                <span>Step 3: SaaS Subscription & Licensing Plan</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Select institutional tier and set student seat caps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isSelected = formData.plan_id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setFormData({ ...formData, plan_id: p.id })}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-secondary border-foreground/30 ring-1 ring-foreground/10 text-card-foreground shadow-xs'
                        : 'bg-card border-border hover:border-foreground/20 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-foreground">
                        {p.plan_code}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-foreground" />}
                    </div>
                    <div className="text-sm font-bold text-foreground mt-1">{p.plan_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                    <div className="mt-3 text-base font-black text-foreground">
                      ₹{Number(p.price_per_year).toLocaleString('en-IN')}
                      <span className="text-[10px] text-muted-foreground font-normal"> / year</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground space-y-1">
                      <div>Students: <strong className="text-foreground">{p.max_students.toLocaleString()}</strong></div>
                      <div>Faculty: <strong className="text-foreground">{p.max_faculty}</strong></div>
                      <div>Storage: <strong className="text-foreground">{p.max_storage_gb} GB</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3">
              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Subscription Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Custom Student Limit (Override)
                </label>
                <input
                  type="number"
                  placeholder="Optional custom seat count"
                  value={formData.custom_student_limit}
                  onChange={(e) => setFormData({ ...formData, custom_student_limit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Module Entitlements */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-foreground" />
                <span>Step 4: Module Entitlements & Features</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle the core modules enabled for this college.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableModules.map((m) => {
                const isEnabled = Boolean(formData.modules[m.module_key]);
                return (
                  <div
                    key={m.module_key}
                    onClick={() => toggleModule(m.module_key)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isEnabled
                        ? 'bg-card border-foreground/30 ring-1 ring-foreground/10 text-card-foreground shadow-xs'
                        : 'bg-card/60 border-border opacity-70 text-muted-foreground'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                        {m.category}
                      </div>
                      <div className="text-xs font-bold mt-0.5 text-foreground">{m.module_name}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {m.description}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1 transition ${
                        isEnabled
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'border border-border bg-background'
                      }`}
                    >
                      {isEnabled && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Initial College Administrator */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-foreground" />
                <span>Step 5: Initial College Super Administrator</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Create the master administrative account for the college to manage their placement cell and students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Administrator First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karthik"
                  value={formData.admin.first_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      admin: { ...formData.admin, first_name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Administrator Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajan"
                  value={formData.admin.last_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      admin: { ...formData.admin, last_name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Administrator Login Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="admin@kct.ac.in"
                    value={formData.admin.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admin: { ...formData.admin, email: e.target.value },
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1.5">
                  Initial Secure Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.admin.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admin: { ...formData.admin, password: e.target.value },
                      })
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Execute Engine */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-foreground" />
                <span>Step 6: Review Specifications & Launch Engine</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Confirm all onboarding parameters before triggering dedicated database provisioning.
              </p>
            </div>

            {provisionError && (
              <div className="p-4 rounded-2xl bg-secondary border border-border text-foreground text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-foreground">
                  <AlertTriangle className="w-4 h-4 text-foreground" />
                  <span>Provisioning Failed (Automatic Rollback Completed)</span>
                </div>
                <p>{provisionError}</p>
                <p className="text-muted-foreground text-[11px]">
                  All partial database schemas and platform records have been cleanly purged.
                </p>
              </div>
            )}

            {provisionResult ? (
              <div className="p-6 rounded-3xl bg-secondary border border-border text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">Institution Successfully Provisioned!</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Database <strong className="font-mono text-foreground">{provisionResult.databaseName}</strong> created, seeded with baseline schema, and College Admin activated.
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-xl bg-card border border-border text-left text-xs font-mono space-y-1.5 shadow-xs">
                  <div className="text-muted-foreground">College Code: <span className="text-foreground font-bold">{provisionResult.collegeCode}</span></div>
                  <div className="text-muted-foreground">Subdomain: <span className="text-foreground">{provisionResult.subdomain}.campuscorp.io</span></div>
                  <div className="text-muted-foreground">Database: <span className="text-foreground">{provisionResult.databaseName}</span></div>
                  <div className="text-muted-foreground">Admin Email: <span className="text-foreground">{provisionResult.adminEmail}</span></div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    to="/platform-admin/colleges"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition"
                  >
                    View in Colleges Registry
                  </Link>
                  <Link
                    to="/platform-admin/databases"
                    className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-foreground text-xs font-semibold transition"
                  >
                    Test DB Ping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-foreground">
                    Institution Profile
                  </h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-semibold text-foreground">{formData.name || 'Not provided'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Code:</span> <span className="font-mono text-foreground font-bold">{formData.code || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Subdomain:</span> <span className="font-mono text-foreground">{formData.subdomain}.campuscorp.io</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="text-foreground">{formData.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{formData.contact_email}</span></div>
                </div>

                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-foreground">
                    Dedicated Database
                  </h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Schema Name:</span> <span className="font-mono text-foreground font-bold">{formData.database_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cluster:</span> <span className="font-mono text-foreground">{formData.db_host}:{formData.db_port}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Isolation:</span> <span className="text-foreground font-semibold">100% Dedicated Schema</span></div>
                </div>

                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-foreground">
                    Subscription & Modules
                  </h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan:</span> <span className="font-bold text-foreground">{plans.find(p => p.id === formData.plan_id)?.plan_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Expiry Date:</span> <span className="text-foreground">{formData.expiry_date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Active Modules:</span> <span className="text-foreground font-bold">{Object.values(formData.modules).filter(Boolean).length} Enabled</span></div>
                </div>

                <div className="p-4 rounded-2xl bg-secondary border border-border space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-foreground">
                    College Administrator
                  </h4>
                  <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{formData.admin.first_name} {formData.admin.last_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-mono text-foreground">{formData.admin.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Role:</span> <span className="font-mono text-foreground">SUPER_ADMIN (Institutional)</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Footer */}
        {!provisionResult && (
          <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1 || provisioning}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border text-xs font-semibold transition disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  // Basic validation before advancing
                  if (currentStep === 1) {
                    if (!formData.name || !formData.code || !formData.subdomain || !formData.contact_email) {
                      alert('Please fill out all required fields marked with * in Step 1.');
                      return;
                    }
                  }
                  if (currentStep === 5) {
                    if (!formData.admin.first_name || !formData.admin.last_name || !formData.admin.email || !formData.admin.password) {
                      alert('Please complete all administrator fields in Step 5.');
                      return;
                    }
                  }
                  setCurrentStep((prev) => Math.min(6, prev + 1));
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={provisioning}
                onClick={handleLaunchProvisioning}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-extrabold shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{provisioning ? 'Provisioning Dedicated Database & Schema...' : 'Launch Automated Provisioning'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
