// src/pages/RequestPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Film,
  Tv,
  Activity,
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { requestAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const RequestPage = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  const [formData, setFormData] = useState({
    contentName: '',
    yearOfRelease: currentYear,
    requestedBy: '',
    contentType: 'movie',
    priority: 'medium'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Toast / Popup for success & error
  const [toast, setToast] = useState({
    open: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: ''
  });

  const openToast = (type, title, message) => {
    setToast({ open: true, type, title, message });

    // Auto hide after 4 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }));
    }, 4000);
  };

  const getContentTypeIcon = (type, className = 'w-5 h-5') => {
    switch (type) {
      case 'movie':
        return <Film className={className} />;
      case 'webseries':
        return <Tv className={className} />;
      case 'anime':
        return <Activity className={className} />;
      default:
        return <Film className={className} />;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearOfRelease' ? Number(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contentName.trim()) {
      newErrors.contentName = 'Content name is required';
    } else if (formData.contentName.trim().length < 2) {
      newErrors.contentName = 'Content name must be at least 2 characters';
    }

    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Your name is required';
    } else if (formData.requestedBy.trim().length < 2) {
      newErrors.requestedBy = 'Name must be at least 2 characters';
    }

    if (!formData.yearOfRelease) {
      newErrors.yearOfRelease = 'Release year is required';
    } else if (
      Number.isNaN(formData.yearOfRelease) ||
      formData.yearOfRelease < 1900 ||
      formData.yearOfRelease > currentYear + 1
    ) {
      newErrors.yearOfRelease = `Please enter a valid year between 1900 and ${currentYear + 1}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        contentName: formData.contentName.trim(),
        yearOfRelease: formData.yearOfRelease,
        requestedBy: formData.requestedBy.trim(),
        contentType: formData.contentType,
        priority: formData.priority
      };

      const response = await requestAPI.create(payload);
      console.log('Request submitted:', response?.data);

      openToast(
        'success',
        'Request Submitted Successfully!',
        'Thank you for your request. Our team will review it soon.'
      );

      setFormData({
        contentName: '',
        yearOfRelease: currentYear,
        requestedBy: '',
        contentType: 'movie',
        priority: 'medium'
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to submit request. Please try again.';

      openToast('error', 'Submission Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    low: {
      label: 'Low',
      description: 'Nice to have, no rush',
      badge: 'Calm',
    },
    medium: {
      label: 'Medium',
      description: 'Important but not urgent',
      badge: 'Balanced',
    },
    high: {
      label: 'High',
      description: 'Very important / trending',
      badge: 'Top priority',
    },
  };

  const selectedPriority = priorityConfig[formData.priority];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* Toast popup */}
      <AnimatePresence>
        {toast.open && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed top-5 inset-x-4 sm:inset-x-auto sm:right-6 z-50 max-w-sm"
            aria-live="assertive"
          >
            <div
              className={`flex items-start gap-3 rounded-2xl border shadow-lg backdrop-blur bg-white/95 dark:bg-slate-900/90 px-4 py-3 ${
                toast.type === 'success'
                  ? 'border-emerald-300/70 dark:border-emerald-700/70'
                  : 'border-rose-300/70 dark:border-rose-700/70'
              }`}
            >
              <div className="mt-0.5">
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                  {toast.title}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToast(prev => ({ ...prev, open: false }))}
                className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ scale: 0.6, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 12 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl shadow-indigo-500/30 mb-4"
          >
            <Send className="w-9 h-9 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
            Request New Content
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Can&apos;t find a movie, web series, or anime you love?
            <span className="hidden sm:inline"> Tell us and we&apos;ll try to add it as soon as we can.</span>
          </p>
        </div>

        {/* Main layout: form + preview */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr),minmax(0,2.2fr)] items-start">
          {/* Left: form card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-xl shadow-slate-900/5 backdrop-blur-sm"
          >
            {/* Info strip */}
            <div className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-sky-50/40 to-transparent dark:from-indigo-900/40 dark:via-slate-900/40 px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>We review requests daily.</span>
                </div>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Popular titles get higher priority.
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-7 space-y-6">
              {/* Content Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                  Content Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="contentName"
                  value={formData.contentName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent transition-all ${
                    errors.contentName
                      ? 'border-rose-500/80'
                      : 'border-slate-300/80 dark:border-slate-600/80'
                  }`}
                  placeholder="e.g. Inception, Attack on Titan, Mirzapur"
                  autoComplete="off"
                />
                {errors.contentName && (
                  <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                    {errors.contentName}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                {/* Release Year */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    <Calendar className="inline w-4 h-4 mr-1.5" />
                    Release Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="yearOfRelease"
                    value={formData.yearOfRelease}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent ${
                      errors.yearOfRelease
                        ? 'border-rose-500/80'
                        : 'border-slate-300/80 dark:border-slate-600/80'
                    }`}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.yearOfRelease && (
                    <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                      {errors.yearOfRelease}
                    </p>
                  )}
                </div>

                {/* Content Type */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Content Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['movie', 'webseries', 'anime'].map(type => {
                      const isActive = formData.contentType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({ ...prev, contentType: type }))
                          }
                          className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                            isActive
                              ? 'border-indigo-500/90 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 shadow-sm shadow-indigo-500/20'
                              : 'border-slate-300/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          {getContentTypeIcon(type, 'w-5 h-5 mb-1')}
                          <span className="capitalize">
                            {type === 'webseries' ? 'Web Series' : type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Your Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                  <User className="inline w-4 h-4 mr-1.5" />
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="requestedBy"
                  value={formData.requestedBy}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent transition-all ${
                    errors.requestedBy
                      ? 'border-rose-500/80'
                      : 'border-slate-300/80 dark:border-slate-600/80'
                  }`}
                  placeholder="Enter your name"
                  autoComplete="off"
                />
                {errors.requestedBy && (
                  <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                    {errors.requestedBy}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Priority Level
                  </label>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    High priority requests are reviewed first
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: 'low',
                      label: 'Low',
                      color: 'text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      value: 'medium',
                      label: 'Medium',
                      color: 'text-amber-600 dark:text-amber-400',
                    },
                    {
                      value: 'high',
                      label: 'High',
                      color: 'text-rose-600 dark:text-rose-400',
                    },
                  ].map(priority => {
                    const isSelected = formData.priority === priority.value;
                    return (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({ ...prev, priority: priority.value }))
                        }
                        className={`flex flex-col items-center justify-center rounded-2xl border px-2 py-3 text-xs sm:text-sm transition-all ${
                          isSelected
                            ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className={`text-base sm:text-lg font-bold ${priority.color}`}>
                          {isSelected ? '●' : '○'}
                        </div>
                        <span className="mt-1.5 font-medium">{priority.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-sm sm:text-base px-6 py-3.5 sm:py-4 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:from-indigo-700 hover:via-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-75 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white border-b-transparent animate-spin" />
                      Submitting your request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  By submitting, you confirm that this request is for personal viewing only
                  and agree to our terms &amp; privacy policy.
                </p>
              </div>
            </form>
          </motion.div>

          {/* Right: live preview / info card (hidden on very small screens) */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="hidden lg:block"
          >
            <div className="sticky top-24 space-y-5">
              {/* Preview card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 shadow-xl shadow-slate-900/10 p-5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  {getContentTypeIcon(formData.contentType, 'w-4 h-4')}
                  Live Request Preview
                </h3>
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Title
                      </p>
                      <p className="mt-1 text-base font-semibold line-clamp-2">
                        {formData.contentName || 'Your requested content name will appear here'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium capitalize">
                      {formData.contentType === 'webseries' ? 'Web Series' : formData.contentType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Release Year
                      </p>
                      <p className="font-semibold">{formData.yearOfRelease}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Requested By
                      </p>
                      <p className="font-semibold truncate">
                        {formData.requestedBy || 'Not provided yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        Priority
                      </p>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px]">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            formData.priority === 'low'
                              ? 'bg-emerald-400'
                              : formData.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span className="font-medium capitalize">
                          {selectedPriority.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      <p>{selectedPriority.badge}</p>
                      <p className="mt-0.5">{selectedPriority.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-900 text-slate-50 p-5 space-y-3 shadow-xl shadow-slate-900/20">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400" />
                  How requests are handled
                </h3>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li>• We prioritise new and trending titles requested by multiple users.</li>
                  <li>• Availability depends on official licensing &amp; region restrictions.</li>
                  <li>• You can submit multiple requests, but avoid exact duplicates.</li>
                  <li>• Once added, it will appear in your content library/search.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestPage;
