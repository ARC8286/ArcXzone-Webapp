// src/components/Admin/AvailabilityForm.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AvailabilityForm = ({ contentId, onSave, onCancel, initialData }) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    label: '',
    quality: '',
    language: '',
    size: '',
    sourceType: 'Official',
    url: '',
    region: '',
    licenseNote: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form with initialData when it changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || '',
        quality: initialData.quality || '',
        language: initialData.language || '',
        size: initialData.size || '',
        sourceType: initialData.sourceType || 'Official',
        url: initialData.url || '',
        region: initialData.region || '',
        licenseNote: initialData.licenseNote || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.language.trim()) newErrors.language = 'Language is required';
    if (!formData.sourceType) newErrors.sourceType = 'Source type is required';
    if (!formData.url.trim()) newErrors.url = 'URL is required';
    
    // Validate URL format
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    const availabilityData = {
      ...formData,
      quality: formData.quality || null
    };

    try {
      await onSave(availabilityData);
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Availability' : 'Add Availability'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label *
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className={`w-full rounded-md border ${
                  errors.label ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="e.g., Official Streaming, Telegram Link"
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.label}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language *
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className={`w-full rounded-md border ${
                  errors.language ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="e.g., English, Hindi, Japanese"
              />
              {errors.language && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.language}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quality
              </label>
              <select
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Quality</option>
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1.2GB, 500MB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Type *
              </label>
              <select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleInputChange}
                className={`w-full rounded-md border ${
                  errors.sourceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="Official">Official</option>
                <option value="SelfHosted">Self-Hosted</option>
                <option value="TelegramBot">Telegram Bot</option>
              </select>
              {errors.sourceType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sourceType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className={`w-full rounded-md border ${
                  errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="https://example.com/download"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., US, Global, India"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Note
              </label>
              <textarea
                name="licenseNote"
                value={formData.licenseNote}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any license information or notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')} Availability
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityForm;