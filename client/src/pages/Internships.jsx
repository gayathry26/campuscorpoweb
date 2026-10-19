import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GraduationCap, Building2, Calendar, Award } from 'lucide-react';

export function Internships() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, [user]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/internships');
      setInternships(res.data.data || []);
    } catch (err) {
      console.error('Failed to load internships:', err);
      showToast('Failed to load internship records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Internship & Industrial Training Records</h1>
        <p className="text-xs text-muted-foreground">Corporate internships, stipends, faculty mentorship, and Pre-Placement Offer (PPO) tracking.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving internship records..." />
      ) : internships.length === 0 ? (
        <div className="bg-card text-card-foreground p-12 text-center rounded-2xl border border-border text-xs text-muted-foreground">
          No industrial internships recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {internships.map((intern) => (
            <div key={intern.id} className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{intern.company_name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {intern.role_title} • Reg: <span className="font-mono text-foreground">{intern.register_number}</span>
                    </p>
                  </div>
                  <StatusBadge status={intern.status} />
                </div>

                <div className="p-3.5 bg-secondary/60 rounded-xl text-xs space-y-1.5 text-muted-foreground border border-border">
                  <div className="flex justify-between items-center">
                    <span>Monthly Stipend:</span>
                    <strong className="text-foreground text-sm">₹{intern.stipend_monthly?.toLocaleString('en-IN') || '0'}/mo</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Duration:</span>
                    <span className="text-foreground font-medium">{intern.start_date} to {intern.end_date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Academic Dept:</span>
                    <strong className="text-foreground">{intern.department_code}</strong>
                  </div>
                </div>
              </div>

              {intern.ppo_offered ? (
                <div className="p-2.5 bg-secondary text-foreground rounded-xl border border-border text-xs font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Pre-Placement Offer (PPO) Granted by Employer</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Internships;
