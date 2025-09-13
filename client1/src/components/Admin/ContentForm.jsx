// src/components/Admin/ContentForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI, availabilityAPI } from '../../services/api';
import { ArrowLeft, Save, Plus, X, Download, Edit, Trash2, Calendar, Clock, Star, Users, Tag, Film } from 'lucide-react';
import AvailabilityForm from './AvailabilityForm';

const ContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const [newContentId, setNewContentId] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'movie',
    title: '',
    slug: '',
    description: '',
    releaseDate: '',
    runtime: '',
    genres: [],
    rating: '',
    director: '',
    cast: [],
    posterUrl: '',
    backdropUrl: '',
    tags: []
  });

  const [newGenre, setNewGenre] = useState('');
  const [newCast, setNewCast] = useState('');
  const [newTag, setNewTag] = useState('');
  const [availabilityData, setAvailabilityData] = useState([]);

  // Fetch content data and availabilities
  useEffect(() => {
    if (isEditing) {
      const fetchContentData = async () => {
        try {
          setLoading(true);
          const contentResponse = await contentAPI.getById(id);
          
          const content = contentResponse.data;
          setFormData({
            type: content.type || 'movie',
            title: content.title || '',
            slug: content.slug || '',
            description: content.description || '',
            releaseDate: content.releaseDate ? content.releaseDate.split('T')[0] : '',
            runtime: content.runtime || '',
            genres: content.genres || [],
            rating: content.rating || '',
            director: content.director || '',
            cast: content.cast || [],
            posterUrl: content.posterUrl || '',
            backdropUrl: content.backdropUrl || '',
            tags: content.tags || []
          });

          // Load availabilities
          await fetchAvailabilities();
        } catch (error) {
          console.error('Error fetching content:', error);
          setError('Failed to load content');
        } finally {
          setLoading(false);
        }
      };
      fetchContentData();
    }
  }, [id, isEditing]);

  // Fetch availabilities for the content
  const fetchAvailabilities = async () => {
    if (!id) return;
    
    try {
      setLoadingAvailabilities(true);
      const response = await availabilityAPI.getByContentId(id);
      setAvailabilities(response.data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      setError('Failed to load availability options');
    } finally {
      setLoadingAvailabilities(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = (field, value, setValue) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSaveAvailability = async (availabilityData) => {
    try {
      setLoading(true);
      if (editingAvailability) {
        // Update existing availability
        const response = await availabilityAPI.update(
          id,
          editingAvailability._id,
          availabilityData
        );
        setAvailabilities(prev => 
          prev.map(a => a._id === editingAvailability._id ? response.data : a)
        );
        setSuccess('Availability updated successfully!');
      } else {
        // Add new availability
        const contentId = isEditing ? id : newContentId;
        if (!contentId) {
          // If we're adding availability to new content (not saved yet)
          setAvailabilityData(prev => [...prev, availabilityData]);
          setSuccess('Availability will be saved with the content');
        } else {
          // If content already exists
          const response = await availabilityAPI.create(contentId, availabilityData);
          setAvailabilities(prev => [...prev, response.data]);
          setSuccess('Availability added successfully!');
        }
      }
      
      setShowAvailabilityForm(false);
      setEditingAvailability(null);
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAvailability = (availability) => {
    setEditingAvailability(availability);
    setShowAvailabilityForm(true);
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) return;

    try {
      setLoading(true);
      await availabilityAPI.delete(id, availabilityId);
      setAvailabilities(prev => prev.filter(a => a._id !== availabilityId));
      setSuccess('Availability deleted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Failed to delete availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API
      const dataToSubmit = {
        ...formData,
        runtime: formData.runtime ? parseInt(formData.runtime) : 0,
        rating: formData.rating ? parseFloat(formData.rating) : 0
      };

      let response;
      if (isEditing) {
        response = await contentAPI.update(id, dataToSubmit);
        setSuccess('Content updated successfully!');
      } else {
        response = await contentAPI.create(dataToSubmit);
        setSuccess('Content created successfully!');
        setNewContentId(response.data._id);
        
        // Save availability data if any was added before content creation
        if (availabilityData.length > 0) {
          for (const availability of availabilityData) {
            await availabilityAPI.create(response.data._id, availability);
          }
          setAvailabilityData([]);
          setSuccess('Content and availability options created successfully!');
        }
        
        // Don't redirect immediately, let the user see the success message
        setTimeout(() => {
          navigate(`/admin/content/${response.data._id}/edit`);
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading && isEditing) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/admin/content')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Loading Content...
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showAvailabilityForm && (
        <AvailabilityForm
          contentId={isEditing ? id : newContentId}
          onSave={handleSaveAvailability}
          onCancel={() => {
            setShowAvailabilityForm(false);
            setEditingAvailability(null);
          }}
          initialData={editingAvailability}
        />
      )}

      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/content')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Content' : 'Add New Content'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-100 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Film size={16} className="inline mr-2" />
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="movie">Movie</option>
                <option value="webseries">Web Series</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter content title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="unique-content-slug"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar size={16} className="inline mr-2" />
                Release Date *
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock size={16} className="inline mr-2" />
                Runtime (minutes)
              </label>
              <input
                type="number"
                name="runtime"
                value={formData.runtime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="120"
                min="1"
              />
              {formData.runtime && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatRuntime(formData.runtime)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Star size={16} className="inline mr-2" />
                Rating (0-10)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="8.5"
              />
            </div>
          </div>

          {/* Right Column - Media and Lists */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Director
              </label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Director name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poster URL *
              </label>
              <input
                type="url"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/poster.jpg"
                required
              />
              {formData.posterUrl && (
                <div className="mt-2">
                  <img
                    src={formData.posterUrl}
                    alt="Poster preview"
                    className="h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Backdrop URL
              </label>
              <input
                type="url"
                name="backdropUrl"
                value={formData.backdropUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/backdrop.jpg"
              />
              {formData.backdropUrl && (
                <div className="mt-2">
                  <img
                    src={formData.backdropUrl}
                    alt="Backdrop preview"
                    className="h-20 object-cover rounded-md border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genres *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-sm rounded-md"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeItem('genres', index)}
                      className="ml-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Add genre"
                  className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addItem('genres', newGenre, setNewGenre)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter content description..."
            required
          />
        </div>

        {/* Cast and Tags - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Cast */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Users size={16} className="inline mr-2" />
              Cast
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.cast.map((actor, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md"
                >
                  {actor}
                  <button
                    type="button"
                    onClick={() => removeItem('cast', index)}
                    className="ml-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newCast}
                onChange={(e) => setNewCast(e.target.value)}
                placeholder="Add cast member"
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addItem('cast', newCast, setNewCast)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag size={16} className="inline mr-2" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeItem('tags', index)}
                    className="ml-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addItem('tags', newTag, setNewTag)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Add Availability Button for New Content */}
        {!isEditing && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAvailabilityForm(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              <Plus size={16} className="mr-2" />
              Add Availability Option
            </button>
            {availabilityData.length > 0 && (
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                  {availabilityData.length} availability option(s) will be saved with this content
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {loading ? 'Saving...' : (isEditing ? 'Update Content' : 'Create Content')}
          </button>
        </div>
      </form>

      {/* Availability Management Section */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Download size={20} className="inline mr-2" />
              Download Availability
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchAvailabilities}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                disabled={loadingAvailabilities}
                title="Refresh availability list"
              >
                {loadingAvailabilities ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Refresh'
                )}
              </button>
              <button
                onClick={() => setShowAvailabilityForm(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
              >
                <Plus size={16} className="mr-2" />
                Add Availability
              </button>
            </div>
          </div>

          {loadingAvailabilities ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading availabilities...</p>
            </div>
          ) : availabilities.length > 0 ? (
            <div className="space-y-4">
              {availabilities.map((availability) => (
                <div
                  key={availability._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {availability.label}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="capitalize">{availability.sourceType}</span>
                        {availability.quality && ` • ${availability.quality}`}
                        {availability.language && ` • ${availability.language}`}
                        {availability.size && ` • ${availability.size}`}
                        {availability.region && ` • ${availability.region}`}
                      </div>
                      {availability.licenseNote && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {availability.licenseNote}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={availability.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Test URL"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleEditAvailability(availability)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAvailability(availability._id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Download size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No availability options added yet</p>
              <p className="text-sm">Click "Add Availability" to add download options for this content.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentForm;