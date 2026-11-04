import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const MODULE_OPTIONS = [
  'Programming Assessment System',
  'AI-Assisted Mock Interviews',
  'Location-Based IT Company Explorer',
  'Placement Drive Management',
  'Placement Readiness Analytics',
  'Full Unified Suite'
];

const API_ENDPOINT = '/api/send';

export default function DemoModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    role: 'Placement Officer',
    preferredModule: 'Placement Management',
    _hp: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedSnapshot, setSubmittedSnapshot] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Official email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Contact number is required';
    } else if (!/^[0-9+\s\-()]{7,20}$/.test(formData.phone.trim())) {
      errs.phone = 'Valid phone number is required';
    }
    if (!formData.institution.trim()) errs.institution = 'Institution name is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      organization: formData.institution.trim(),
      college: formData.institution.trim(),
      role: formData.role,
      preferredModule: formData.preferredModule,
      service: `Demo - ${formData.preferredModule}`,
      subject: `Demo Request: ${formData.institution.trim()} (${formData.preferredModule})`,
      message: `Institutional demo requested by ${formData.name.trim()} (${formData.role}) from ${formData.institution.trim()}.\nRole: ${formData.role}\nPreferred Module: ${formData.preferredModule}\nContact Phone: ${formData.phone.trim()}`,
      _hp: formData._hp || '',
      source: 'CampusCorpo Demo Modal'
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // Not a JSON response
      }

      if (response.ok && data.success) {
        setSubmittedSnapshot({ ...payload });
        setFormData({
          name: '',
          email: '',
          phone: '',
          institution: '',
          role: 'Placement Officer',
          preferredModule: 'Placement Management',
          _hp: ''
        });
        setErrors({});
        setSubmitted(true);
      } else {
        let message = data?.error;
        if (!message) {
          if (response.status === 404) {
            message = 'API endpoint (/api/send) not found. If running locally with Vite, please restart "npm run dev".';
          } else if (response.status === 500) {
            message = 'SMTP server error occurred while sending demo request. Please check your Titan Mail credentials.';
          } else {
            message = `Submission returned status ${response.status}. Please try again.`;
          }
        }
        setSubmitError(message);
      }
    } catch (err) {
      setSubmitError('Network error: Unable to reach email server. Please check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrors({});
    setSubmitError(null);
    setSubmittedSnapshot(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center p-2 mx-auto mb-4 shadow-sm">
                  <img src="/campuscorpo-mark.png" alt="CampusCorpo" className="h-full w-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-neutral-950">
                  Demo Request Dispatched
                </h3>
                <p className="text-sm text-neutral-600 mt-2 max-w-sm mx-auto">
                  Your demo enquiry for <span className="font-semibold text-neutral-950">{submittedSnapshot?.organization}</span> has been transmitted via Titan SMTP. Our team will contact you at <span className="font-semibold text-neutral-950">{submittedSnapshot?.email}</span>.
                </p>
                <div className="mt-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 text-left space-y-1">
                  <div><span className="font-medium text-neutral-800">Lead:</span> {submittedSnapshot?.name} ({submittedSnapshot?.role})</div>
                  <div><span className="font-medium text-neutral-800">Email:</span> {submittedSnapshot?.email}</div>
                  <div><span className="font-medium text-neutral-800">Phone:</span> {submittedSnapshot?.phone}</div>
                  <div><span className="font-medium text-neutral-800">Module:</span> {submittedSnapshot?.preferredModule}</div>
                </div>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full py-2.5 px-4 bg-neutral-950 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shadow-xs">
                    <img src="/campuscorpo-mark.png" alt="CampusCorpo" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded">
                      Enterprise Demo
                    </span>
                    <h3 className="text-xl sm:text-[22px] font-semibold text-neutral-950 mt-0.5">
                      Get a CampusCorpo Demo
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-5 -mt-2 font-normal">
                  Experience our Placement, Faculty, and Student management workflows.
                </p>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs sm:text-[13px] text-red-700">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Honeypot field for anti-spam bots */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex="-1"
                    autoComplete="off"
                    value={formData._hp}
                    onChange={handleChange}
                    className="hidden opacity-0 absolute -z-10 pointer-events-none"
                    aria-hidden="true"
                  />

                  <div>
                    <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      disabled={submitting}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dr. Rajesh / Prof. Sharma"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100 ${errors.name ? 'border-red-500' : 'border-neutral-300'
                        }`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        disabled={submitting}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="placement@university.edu"
                        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100 ${errors.email ? 'border-red-500' : 'border-neutral-300'
                          }`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        disabled={submitting}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 90800 07926"
                        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100 ${errors.phone ? 'border-red-500' : 'border-neutral-300'
                          }`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      name="institution"
                      disabled={submitting}
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="e.g. Apex Institute of Engineering"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100 ${errors.institution ? 'border-red-500' : 'border-neutral-300'
                        }`}
                    />
                    {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                        Your Role
                      </label>
                      <select
                        name="role"
                        disabled={submitting}
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100"
                      >
                        <option>Placement Officer</option>
                        <option>Dean / Principal</option>
                        <option>HOD / Faculty</option>
                        <option>Campus Administrator</option>
                        <option>Student Representative</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1">
                        Primary Interest
                      </label>
                      <select
                        name="preferredModule"
                        disabled={submitting}
                        value={formData.preferredModule}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100"
                      >
                        {MODULE_OPTIONS.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={submitting ? {} : { scale: 1.01 }}
                      whileTap={submitting ? {} : { scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-neutral-950 text-white font-medium text-sm rounded-xl hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Dispatching Request...</span>
                        </>
                      ) : (
                        <span>Schedule Personalized Demo</span>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
