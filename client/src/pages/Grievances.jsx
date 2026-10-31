import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertCircle, CheckCircle2, MessageSquare, Plus, ShieldCheck } from 'lucide-react';

export function Grievances() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // In-app Resolve Modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    category: 'ELIGIBILITY',
    subject: '',
    description: '',
  });

  useEffect(() => {
    fetchGrievances();
  }, [user]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/grievances');
      setGrievances(res.data.data || []);
    } catch (err) {
      console.error('Failed to load grievances:', err);
      showToast('Failed to load grievances.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/grievances/file', ticketForm);
      setIsModalOpen(false);
      setTicketForm({ category: 'ELIGIBILITY', subject: '', description: '' });
      fetchGrievances();
      showToast('Grievance ticket submitted to placement committee.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to file ticket.', 'error');
    }
  };

  const openResolveDialog = (ticketId) => {
    setSelectedTicketId(ticketId);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      showToast('Please provide committee resolution notes before resolving.', 'warning');
      return;
    }
    setResolving(true);
    try {
      await apiClient.put(`/grievances/${selectedTicketId}/resolve`, {
        status: 'RESOLVED',
        resolution_notes: resolutionNotes.trim(),
      });
      setResolveModalOpen(false);
      setSelectedTicketId(null);
      setResolutionNotes('');
      fetchGrievances();
      showToast('Grievance ticket marked resolved successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve ticket.', 'error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Placement Grievances & Support Desk</h1>
          <p className="text-sm text-muted-foreground mt-1">Confidential dispute resolution, policy clarification appeals, and assessment support.</p>
        </div>

        {user?.roleName === 'STUDENT' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> File Placement Grievance Ticket
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving placement grievances..." />
      ) : grievances.length === 0 ? (
        <div className="bg-card text-card-foreground p-12 text-center rounded-2xl border border-border text-sm text-muted-foreground">
          No grievance tickets recorded. All operations nominal.
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((g) => (
            <div key={g.id} className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{g.ticket_number}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                      {g.category}
                    </span>
                    <StatusBadge status={g.status} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1.5">{g.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Filed by: <strong className="text-foreground">{g.first_name} {g.last_name}</strong> ({g.register_number}) • {g.created_at?.split('T')[0]}
                  </p>
                </div>

                {['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.roleName) && g.status === 'OPEN' && (
                  <button
                    onClick={() => openResolveDialog(g.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Resolve Ticket
                  </button>
                )}
              </div>

              <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border leading-relaxed">
                {g.description}
              </p>

              {g.resolution_notes && (
                <div className="p-4 bg-secondary/80 rounded-xl border border-border text-sm space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Placement Committee Resolution:</span>
                  </div>
                  <p className="text-foreground italic">{g.resolution_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="File Placement Support / Grievance Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-foreground mb-1 text-sm">Dispute / Inquiry Category</label>
            <select
              value={ticketForm.category}
              onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="ELIGIBILITY">Eligibility Calculation Discrepancy</option>
              <option value="INTERVIEW_DISPUTE">Interview Slot Conflict / Technical Glitch</option>
              <option value="OFFER_CONFLICT">Multiple Offer Policy Clarification</option>
              <option value="ASSESSMENT_ISSUE">Online Coding Assessment Platform Dispute</option>
              <option value="GENERAL">General Career Guidance Request</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1 text-sm">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Backlog cleared but drive status marked ineligible"
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1 text-sm">Comprehensive Description</label>
            <textarea
              rows="4"
              required
              placeholder="Provide complete context, job posting title, and reference dates..."
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              className="w-full p-2.5 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-foreground font-semibold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer shadow-xs text-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* In-App Resolve Ticket Dialog (Replaces window.prompt) */}
      <Modal isOpen={resolveModalOpen} onClose={() => setResolveModalOpen(false)} title="Record Placement Committee Resolution">
        <form onSubmit={handleConfirmResolve} className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-3 leading-relaxed text-sm">
              Document the formal resolution or corrective action taken by the placement office. This note will be recorded in the institutional grievance registry and visible to the student.
            </p>
            <label className="block font-bold text-foreground mb-1 text-sm">Resolution & Committee Action Notes *</label>
            <textarea
              rows="5"
              required
              placeholder="e.g. Re-verified semester 5 grade sheet with registrar. Student cleared for drive with updated 8.1 CGPA."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full p-3 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-foreground font-semibold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving || !resolutionNotes.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 cursor-pointer shadow-xs disabled:opacity-50 text-sm"
            >
              {resolving ? 'Recording Resolution...' : 'Mark as Resolved'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default Grievances;
