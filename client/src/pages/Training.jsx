import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookOpen, Users, Clock, CheckCircle2, Award, Plus } from 'lucide-react';

export function Training() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [trainings, setTrainings] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programs'); // 'programs' | 'attendance'

  useEffect(() => {
    fetchTrainingData();
  }, [user]);

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const tRes = await apiClient.get('/training');
      setTrainings(tRes.data.data || []);

      const dept = user?.departmentCode || 'CSE';
      const attRes = await apiClient.get(`/training/department/${dept}`);
      setAttendanceRecords(attRes.data.data || []);
    } catch (err) {
      console.error('Failed to load training data:', err);
      showToast('Failed to load training curriculum data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Training & Skill Readiness Accelerator</h1>
          <p className="text-xs text-muted-foreground">DSA bootcamps, aptitude preparation, and department-wise attendance tracking.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'programs'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Curriculum Programs
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Dept Attendance DB
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving training programs and department logs..." />
      ) : activeTab === 'programs' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trainings.map((tr) => (
            <div key={tr.id} className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-foreground border border-border">
                    {tr.category}
                  </span>
                  <StatusBadge status={tr.status} />
                </div>

                <h3 className="font-bold text-base text-foreground mt-2.5">{tr.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Trainer: <strong className="text-foreground">{tr.trainer_name}</strong></p>

                <div className="mt-4 p-3 rounded-xl bg-secondary/60 border border-border text-xs space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Duration: <strong className="text-foreground">{tr.duration_hours} Hours Intensive</strong></span>
                  </div>
                  <div>Schedule: {tr.start_date} to {tr.end_date}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Mandatory &gt; 75% Attendance</span>
                <span className="text-foreground font-bold">Active Cohort</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Attendance Records from Department DB */
        <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-foreground">
              Department Attendance Logs (Isolated Database: `lms_{user?.departmentCode?.toLowerCase() || 'cse'}`)
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">Live SQL Table: `dept_training_attendance`</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-secondary text-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Register No</th>
                  <th className="py-2.5 px-3">Sessions Attended</th>
                  <th className="py-2.5 px-3">Attendance %</th>
                  <th className="py-2.5 px-3">Pre-Assessment Score</th>
                  <th className="py-2.5 px-3">Post-Assessment Score</th>
                  <th className="py-2.5 px-3">Readiness Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendanceRecords.map((att, i) => (
                  <tr key={i} className="hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-foreground">{att.register_number}</td>
                    <td className="py-3 px-3">{att.sessions_attended} / {att.total_sessions}</td>
                    <td className="py-3 px-3 font-bold text-foreground">{att.attendance_percentage}%</td>
                    <td className="py-3 px-3">{att.pre_assessment_score} pts</td>
                    <td className="py-3 px-3 font-bold text-foreground">{att.post_assessment_score} pts</td>
                    <td className="py-3 px-3"><StatusBadge status={att.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default Training;
