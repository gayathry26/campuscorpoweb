import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { DollarSign, PieChart, TrendingDown, Plus, CheckCircle2 } from 'lucide-react';

export function Finance() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: 'TRAINING',
    amount: '',
    description: 'Corporate Aptitude & Soft skills training vendor fee',
  });

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/finance/budget');
      setBudget(res.data.data || {});
    } catch (err) {
      console.error('Failed to load budget:', err);
      showToast('Failed to load placement budget details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/finance/expense', expenseForm);
      setIsModalOpen(false);
      setExpenseForm({ category: 'TRAINING', amount: '', description: '' });
      fetchBudget();
      showToast('Placement expense recorded successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record expense.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving placement cell finance ledgers..." />;

  const allocated = parseFloat(budget?.allocated_budget || 2500000);
  const spent = parseFloat(budget?.spent_amount || 0);
  const remaining = allocated - spent;
  const utilizationPct = Math.round((spent / allocated) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Placement Cell Budget & Operational Expenditure</h1>
          <p className="text-xs text-muted-foreground">Track institutional training funds, recruitment logistics, hospitality, and licenses.</p>
        </div>

        {['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.roleName) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-semibold shadow-xs transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Record Operational Expense
          </button>
        )}
      </div>

      {/* Main Budget Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Allocated Fiscal Budget</span>
          <div className="text-2xl font-black text-foreground mt-1">₹{allocated.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-muted-foreground">FY 2026-2027</span>
        </div>

        <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Expenditure Utilized</span>
          <div className="text-2xl font-black text-foreground mt-1">₹{spent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-muted-foreground font-semibold">{utilizationPct}% Utilization</span>
        </div>

        <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Remaining Balance</span>
          <div className="text-2xl font-black text-foreground mt-1">₹{remaining.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-foreground font-semibold">Available for Spring Drives</span>
        </div>
      </div>

      {/* Expenditure Breakdown by Category */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs">
        <h3 className="text-sm font-bold text-foreground mb-4">Expenditure Category Allocation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-secondary/60 rounded-xl border border-border">
            <span className="font-semibold text-muted-foreground block mb-1">Corporate Training</span>
            <div className="text-lg font-black text-foreground">₹{parseFloat(budget?.training_expense || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Bootcamps, DSA mentors & assessments</p>
          </div>

          <div className="p-4 bg-secondary/60 rounded-xl border border-border">
            <span className="font-semibold text-muted-foreground block mb-1">Logistics & Infrastructure</span>
            <div className="text-lg font-black text-foreground">₹{parseFloat(budget?.logistics_expense || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Interview halls, lab reservation, transport</p>
          </div>

          <div className="p-4 bg-secondary/60 rounded-xl border border-border">
            <span className="font-semibold text-muted-foreground block mb-1">Corporate Hospitality</span>
            <div className="text-lg font-black text-foreground">₹{parseFloat(budget?.hospitality_expense || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Recruiter accommodation & guest meals</p>
          </div>

          <div className="p-4 bg-secondary/60 rounded-xl border border-border">
            <span className="font-semibold text-muted-foreground block mb-1">Software & Cloud Licenses</span>
            <div className="text-lg font-black text-foreground">₹{parseFloat(budget?.software_license_expense || 0).toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Assessment sandbox, ATS & cloud hosting</p>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Operational Placement Expense">
        <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Expense Category</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TRAINING">Corporate Training & Mentors</option>
              <option value="LOGISTICS">Logistics & Campus Labs</option>
              <option value="HOSPITALITY">Corporate Recruiter Hospitality</option>
              <option value="SOFTWARE">Software & Cloud Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Amount (in ₹ INR)</label>
            <input
              type="number"
              required
              placeholder="e.g. 50000"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Purpose / Vendor Invoice Details</label>
            <textarea
              rows="3"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-foreground font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer shadow-xs"
            >
              Record Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default Finance;
