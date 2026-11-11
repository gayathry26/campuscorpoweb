import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '../../context/PlatformAuthContext';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Users,
  HardDrive,
  RefreshCw,
  Building2,
  Sparkles,
  Plus,
  X,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export function SubscriptionManagement() {
  const { platformFetch } = usePlatformAuth();
  const [plans, setPlans] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign/Renew Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [studentLimit, setStudentLimit] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Create Plan Modal State
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    planCode: '',
    planName: '',
    pricePerYear: '',
    maxStudents: '',
    maxFaculty: '',
    maxStorageGb: '',
    description: '',
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  // College Invoicing & Quota Modal State
  const [activeCollegeModal, setActiveCollegeModal] = useState(null); // College object
  const [collegeQuota, setCollegeQuota] = useState(null);
  const [collegeInvoices, setCollegeInvoices] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, collegesRes] = await Promise.all([
        platformFetch('/api/v1/platform/subscriptions/plans'),
        platformFetch('/api/v1/platform/colleges'),
      ]);

      const plansJson = await plansRes.json();
      const collegesJson = await collegesRes.json();

      if (plansJson.success) setPlans(plansJson.data);
      if (collegesJson.success) setColleges(collegesJson.data);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Default expiry 1 year from now
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split('T')[0]);
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId || !selectedPlanId || !expiryDate) {
      alert('Please select college, plan and expiry date.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await platformFetch(`/api/v1/platform/colleges/${selectedCollegeId}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({
          planId: parseInt(selectedPlanId, 10),
          expiryDate,
          customStudentLimit: studentLimit ? parseInt(studentLimit, 10) : null,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: 'Subscription plan successfully assigned.' });
        setModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: 'error', text: json.message || 'Failed to assign plan.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    setCreatingPlan(true);
    try {
      const res = await platformFetch('/api/v1/platform/subscriptions/plans', {
        method: 'POST',
        body: JSON.stringify({
          planCode: newPlan.planCode.toUpperCase().trim(),
          planName: newPlan.planName.trim(),
          pricePerYear: parseFloat(newPlan.pricePerYear) || 0,
          maxStudents: parseInt(newPlan.maxStudents, 10) || 1000,
          maxFaculty: parseInt(newPlan.maxFaculty, 10) || 50,
          maxStorageGb: parseInt(newPlan.maxStorageGb, 10) || 50,
          description: newPlan.description.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: `Plan '${newPlan.planName}' created successfully!` });
        setCreatePlanModalOpen(false);
        setNewPlan({
          planCode: '',
          planName: '',
          pricePerYear: '',
          maxStudents: '',
          maxFaculty: '',
          maxStorageGb: '',
          description: '',
        });
        fetchData();
      } else {
        alert(json.message || 'Failed to create plan.');
      }
    } catch (err) {
      alert('Error creating plan: ' + err.message);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to delete tier '${planName}'? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await platformFetch(`/api/v1/platform/subscriptions/plans/${planId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: `Plan '${planName}' deleted.` });
        fetchData();
      } else {
        alert(json.message || 'Could not delete plan.');
      }
    } catch (err) {
      alert('Error deleting plan: ' + err.message);
    }
  };

  const openBillingModal = async (college) => {
    setActiveCollegeModal(college);
    setLoadingBilling(true);
    try {
      const [quotaRes, invoicesRes] = await Promise.all([
        platformFetch(`/api/v1/platform/colleges/${college.id}/quota`).catch(() => null),
        platformFetch(`/api/v1/platform/colleges/${college.id}/invoices`).catch(() => null),
      ]);

      if (quotaRes && quotaRes.ok) {
        const qJson = await quotaRes.json();
        if (qJson.success) setCollegeQuota(qJson.data);
      }
      if (invoicesRes && invoicesRes.ok) {
        const iJson = await invoicesRes.json();
        if (iJson.success) setCollegeInvoices(iJson.data);
      }
    } catch (err) {
      console.error('Error fetching billing details:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!activeCollegeModal) return;
    setGeneratingInvoice(true);
    try {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      const res = await platformFetch(`/api/v1/platform/colleges/${activeCollegeModal.id}/invoices`, {
        method: 'POST',
        body: JSON.stringify({
          amount: 199999,
          taxAmount: 35999.82,
          currency: 'INR',
          billingPeriodStart: new Date().toISOString().split('T')[0],
          billingPeriodEnd: nextMonth.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'PAID',
          paymentReference: `MANUAL-${Date.now()}`,
          notes: 'Annual institutional license renewal invoice',
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Refresh invoices
        const invoicesRes = await platformFetch(`/api/v1/platform/colleges/${activeCollegeModal.id}/invoices`);
        const iJson = await invoicesRes.json();
        if (iJson.success) setCollegeInvoices(iJson.data);
      } else {
        alert(json.message || 'Failed to generate invoice.');
      }
    } catch (err) {
      alert('Error creating invoice: ' + err.message);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>SaaS Monetization & Licensing</span>
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl tracking-tight">
            Subscriptions, Billing & Quotas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage multi-tier institutional pricing, track live student quotas, generate invoices, and assign licenses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setCreatePlanModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary border border-border hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Custom Plan</span>
          </button>
          <button
            onClick={() => {
              if (colleges.length > 0) setSelectedCollegeId(String(colleges[0].id));
              if (plans.length > 0) setSelectedPlanId(String(plans[0].id));
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign / Renew Plan</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${feedback.type === 'success'
              ? 'bg-secondary border-border text-foreground font-medium'
              : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-foreground font-medium'
            }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground font-bold">
            ×
          </button>
        </div>
      )}

      {/* Plan Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between transition relative overflow-hidden bg-card text-card-foreground shadow-xs ${plan.plan_code === 'ENTERPRISE'
                ? 'border-foreground/30 ring-1 ring-foreground/10'
                : 'border-border'
              }`}
          >
            {plan.plan_code === 'ENTERPRISE' && (
              <div className="absolute top-0 right-0 px-3.5 py-1 bg-foreground text-background text-[10px] font-black uppercase tracking-wider rounded-bl-xl">
                Flagship Plan
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
                  {plan.plan_code}
                </span>
                {plan.plan_code !== 'STARTER' && plan.plan_code !== 'ENTERPRISE' && (
                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.plan_name)}
                    className="text-muted-foreground hover:text-foreground p-1 transition"
                    title="Delete tier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-black text-foreground mt-1">{plan.plan_name}</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">
                  ₹{Number(plan.price_per_year).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground">/ year</span>
              </div>

              <div className="mt-6 space-y-2.5 pt-4 border-t border-border text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span>Up to <strong>{plan.max_students.toLocaleString()}</strong> Students</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span>Up to <strong>{plan.max_faculty}</strong> Faculty Advisors</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span><strong>{plan.max_storage_gb} GB</strong> Cloud Storage</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Subscriptions Table */}
      <div className="space-y-3">
        <h2 className="font-bold text-base text-foreground">Institutional Subscriptions & Billing Status</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 pl-4">Institution</th>
                  <th className="py-3.5">Active Plan</th>
                  <th className="py-3.5">Subscription Expiry</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/40 transition">
                    <td className="py-3.5 pl-4">
                      <div className="font-bold text-foreground text-sm">{c.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{c.code}</div>
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-foreground">{c.plan_name || 'Unassigned'}</span>
                    </td>
                    <td className="py-3.5 text-foreground font-mono">
                      {c.subscription_expiry ? new Date(c.subscription_expiry).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-secondary text-foreground border border-border">
                        {c.subscription_status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right space-x-2">
                      <button
                        onClick={() => openBillingModal(c)}
                        className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border font-medium text-xs transition inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Invoices & Quotas</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCollegeId(String(c.id));
                          setModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium text-xs transition"
                      >
                        Modify / Renew
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoices & Quotas Drawer Modal */}
      {activeCollegeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                  Institutional Telemetry & Billing
                </span>
                <h3 className="font-bold text-lg text-foreground">
                  {activeCollegeModal.name} ({activeCollegeModal.code})
                </h3>
              </div>
              <button onClick={() => setActiveCollegeModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingBilling ? (
              <div className="py-12 text-center text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-foreground mb-2" />
                <span>Querying tenant live quotas and invoices...</span>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Quota Telemetry Card */}
                {collegeQuota && (
                  <div className="p-4 rounded-2xl bg-secondary border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                        <Users className="w-4 h-4 text-foreground" />
                        <span>Live Student Enrollment Quota</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-background text-foreground border border-border">
                        {collegeQuota.utilizationPercentage}% Capacity Used
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-muted-foreground">
                      <span>
                        Enrolled Students: <strong className="text-foreground">{collegeQuota.currentStudentCount}</strong>
                      </span>
                      <span>
                        Subscription Cap: <strong className="text-foreground">{collegeQuota.maxStudentCapacity}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-foreground"
                        style={{ width: `${Math.min(100, Math.max(2, collegeQuota.utilizationPercentage))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Invoices Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-foreground" />
                      <span>Billing & Invoices History</span>
                    </h4>
                    <button
                      onClick={handleGenerateInvoice}
                      disabled={generatingInvoice}
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-semibold transition inline-flex items-center gap-1 text-xs shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{generatingInvoice ? 'Generating...' : 'Issue New Invoice'}</span>
                    </button>
                  </div>

                  {collegeInvoices.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-secondary border border-border text-center text-muted-foreground">
                      No invoices issued yet for this institution.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border bg-secondary/50 text-muted-foreground">
                            <th className="py-2.5 pl-3">Invoice #</th>
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Amount (INR)</th>
                            <th className="py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {collegeInvoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="py-2.5 pl-3 font-mono font-bold text-foreground">{inv.invoice_number}</td>
                              <td className="py-2.5 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</td>
                              <td className="py-2.5 font-bold text-foreground">
                                ₹{Number(inv.total_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-foreground border border-border">
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {createPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Create Custom Subscription Tier</h3>
              <button onClick={() => setCreatePlanModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Plan Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RESEARCH_PLUS"
                    value={newPlan.planCode}
                    onChange={(e) => setNewPlan({ ...newPlan, planCode: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground uppercase font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Plan Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Research & Innovation Tier"
                    value={newPlan.planName}
                    onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Price Per Year (₹ INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 299999"
                  value={newPlan.pricePerYear}
                  onChange={(e) => setNewPlan({ ...newPlan, pricePerYear: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Max Students</label>
                  <input
                    type="number"
                    required
                    placeholder="3000"
                    value={newPlan.maxStudents}
                    onChange={(e) => setNewPlan({ ...newPlan, maxStudents: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Max Faculty</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={newPlan.maxFaculty}
                    onChange={(e) => setNewPlan({ ...newPlan, maxFaculty: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Storage (GB)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={newPlan.maxStorageGb}
                    onChange={(e) => setNewPlan({ ...newPlan, maxStorageGb: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Plan Description</label>
                <textarea
                  rows="2"
                  placeholder="Details of features included in this tier..."
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreatePlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPlan}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-bold disabled:opacity-50"
                >
                  {creatingPlan ? 'Creating Plan...' : 'Create Plan Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Assign Subscription Plan</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Target College</label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Subscription Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plan_name} (₹{Number(p.price_per_year).toLocaleString('en-IN')}/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Custom Student Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to use plan default"
                  value={studentLimit}
                  onChange={(e) => setStudentLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, PO reference, or custom institutional agreement..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-bold disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
