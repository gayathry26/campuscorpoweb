import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Send, Clock, Loader2 } from 'lucide-react';
import { companyDetails } from '../data/websiteData';

const API_ENDPOINT = '/api/send';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    _hp: '' // Honeypot field for spam bot protection
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedDetails, setSubmittedDetails] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.organization.trim()) {
      errs.organization = 'College or organization name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Official email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s\-()]{7,20}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid contact phone number';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your enquiry';
    } else if (formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (submitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: formData.name.trim(),
      organization: formData.organization.trim(),
      college: formData.organization.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
      service: formData.subject.trim(),
      message: formData.message.trim(),
      _hp: formData._hp || '',
      source: 'Website Contact Form'
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
        // Response was not JSON (e.g. HTML 404 from dev server without API handler)
      }

      if (response.ok && data.success) {
        // Capture details for genuine confirmation screen
        setSubmittedDetails({ ...payload });

        // Clear form after successful submission
        setFormData({
          name: '',
          organization: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          _hp: ''
        });
        setErrors({});
        setIsSubmitted(true);
      } else {
        let errorMsg = data?.error;
        if (!errorMsg) {
          if (response.status === 404) {
            errorMsg = 'API endpoint (/api/send) not found. If running locally with Vite, please restart "npm run dev".';
          } else if (response.status === 500) {
            errorMsg = 'SMTP server error occurred while sending email. Please check your Titan Mail credentials.';
          } else {
            errorMsg = `Submission returned status ${response.status}. Please check your information or try again.`;
          }
        }
        setSubmitError(errorMsg);
      }
    } catch (err) {
      setSubmitError('Network error: Unable to reach email server. Please check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      organization: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      _hp: ''
    });
    setErrors({});
    setSubmitError(null);
    setSubmittedDetails(null);
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-4">
            Institutional Connect
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[30px] font-bold text-neutral-950 tracking-tight">
            Bring Your Entire Campus Into One Platform.
          </h2>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed font-normal">
            See how CampusCorpo simplifies institutional management and placement operations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Contact Information (5 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 bg-neutral-50 p-8 sm:p-10 rounded-2xl border border-neutral-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center shadow-xs">
                  <img src="/campuscorpo-mark.png" alt="CampusCorpo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-950 leading-tight">
                    CampusCorpo Relations
                  </h3>
                  <span className="text-xs text-neutral-500 font-medium">Higher Education Solutions</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-8 font-normal">
                Our team assists universities, colleges, and placement cells with architecture planning, deployment timelines, and student data onboarding.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase">General Inquiries</div>
                    <a href={`mailto:${companyDetails.email}`} className="text-sm font-semibold text-neutral-950 hover:underline">
                      {companyDetails.email}
                    </a>
                    <div className="text-xs text-neutral-400 mt-0.5">Quick response guaranteed</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase">Direct Helpline</div>
                    <a href={`tel:${companyDetails.phoneRaw || companyDetails.phone}`} className="text-sm font-semibold text-neutral-950 hover:underline">
                      {companyDetails.phone}
                    </a>
                    <div className="text-xs text-neutral-400 mt-0.5">Mon – Fri, 9:00 AM – 6:30 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase">Office Location</div>
                    <p className="text-sm font-semibold text-neutral-950">
                      {companyDetails.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <Clock className="h-4 w-4 text-neutral-950" />
                <span>Response SLA: Within 1 Business Day</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Institutional pilot demonstrations can also be scheduled via Google Meet or Zoom.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Contact & Demo Form (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-subtle"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="py-10 text-center"
                >
                  <div className="h-16 w-16 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-950">
                    Enquiry Delivered Successfully
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto mt-2 leading-relaxed font-normal">
                    Thank you, <span className="font-semibold text-neutral-950">{submittedDetails?.name}</span>. Your enquiry for <span className="font-semibold text-neutral-950">{submittedDetails?.organization}</span> has been transmitted directly to our inbox. Our institutional team will get back to you shortly.
                  </p>

                  {/* Submission Summary Card */}
                  {submittedDetails && (
                    <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs sm:text-[13px] max-w-md mx-auto space-y-1.5">
                      <div className="font-semibold text-neutral-800 uppercase text-xs mb-2 border-b border-neutral-200 pb-1 tracking-wider">
                        Verified Dispatch Details:
                      </div>
                      <div><span className="text-neutral-500 font-medium">Contact:</span> {submittedDetails.email} | {submittedDetails.phone}</div>
                      <div><span className="text-neutral-500 font-medium">College / Org:</span> {submittedDetails.organization}</div>
                      <div><span className="text-neutral-500 font-medium">Subject:</span> {submittedDetails.subject}</div>
                      <div><span className="text-neutral-500 font-medium">Message:</span> {submittedDetails.message}</div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="px-5 py-2.5 text-sm font-medium bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                    >
                      Send Another Message
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  noValidate 
                  className="space-y-4"
                >
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
                    <h3 className="text-xl sm:text-[22px] font-semibold text-neutral-950 mb-1">
                      Request an Institutional Demo
                    </h3>
                    <p className="text-sm text-neutral-600 mb-6 font-normal">
                      Fill in your details below to receive a personalized walkthrough for your campus.
                    </p>
                  </div>

                  {/* Server Error Banner */}
                  {submitError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-[13px] text-red-700"
                    >
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Unable to send enquiry: </span>
                        <span>{submitError}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                        Your Full Name <span className="text-neutral-950">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        disabled={submitting}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Rajesh Kumar"
                        className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                          errors.name ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* College / Organization */}
                    <div>
                      <label htmlFor="organization" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                        College / Organization <span className="text-neutral-950">*</span>
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        disabled={submitting}
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="e.g. National Institute of Tech"
                        className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                          errors.organization ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                        }`}
                      />
                      {errors.organization && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.organization}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Official Email */}
                    <div>
                      <label htmlFor="email" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                        Official Email Address <span className="text-neutral-950">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        disabled={submitting}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@university.edu"
                        className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                          errors.email ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                        Phone Number <span className="text-neutral-950">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        disabled={submitting}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 90800 07926"
                        className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                          errors.phone ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject / Service Field */}
                  <div>
                    <label htmlFor="subject" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                      Subject / Service <span className="text-neutral-950">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      disabled={submitting}
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. New Website Enquiry – CampusCorpo"
                      className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                        errors.subject ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-[13px] sm:text-sm font-medium text-neutral-700 mb-1.5">
                      Message / Requirements <span className="text-neutral-950">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      disabled={submitting}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your campus size, departments, placement cycle, and any specific modules you need..."
                      className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-colors resize-none disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                        errors.message ? 'border-red-500 bg-red-50/20' : 'border-neutral-300'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button with Loading Indicator and Duplicate Prevention */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={submitting ? {} : { scale: 1.01 }}
                      whileTap={submitting ? {} : { scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Sending Enquiry via Titan Mailer...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Demo Request</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                    <p className="mt-3 text-center text-xs text-neutral-400">
                      We respect your institutional privacy. Secure Titan SMTP Transmission.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
