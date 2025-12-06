// src/components/Admin/RequestManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Filter, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, 
  Edit, Trash2, RefreshCw, Download, MoreVertical, ChevronLeft, ChevronRight,
  MessageSquare, Flag, TrendingUp, TrendingDown
} from 'lucide-react';
import { requestAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/usedebounce';

const RequestManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    contentType: 'all',
    priority: 'all'
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [bulkSelection, setBulkSelection] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.contentType !== 'all' && { contentType: filters.contentType }),
        ...(filters.priority !== 'all' && { priority: filters.priority })
      };

      const response = await requestAPI.getAll(params);
      
      setRequests(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200', icon: Clock },
      approved: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200', icon: XCircle },
      duplicate: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300', icon: AlertCircle },
      fulfilled: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      high: { color: 'text-red-600 dark:text-red-400', icon: Flag },
      medium: { color: 'text-yellow-600 dark:text-yellow-400', icon: TrendingUp },
      low: { color: 'text-green-600 dark:text-green-400', icon: TrendingDown }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    const Icon = config.icon;

    return (
      <div className={`flex items-center ${config.color}`}>
        <Icon size={14} className="mr-1" />
        <span className="text-sm font-medium capitalize">{priority}</span>
      </div>
    );
  };

  // Content type badge component
  const ContentTypeBadge = ({ type }) => {
    const typeConfig = {
      movie: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200', label: 'Movie' },
      webseries: { color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200', label: 'Web Series' },
      anime: { color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200', label: 'Anime' }
    };

    const config = typeConfig[type] || typeConfig.movie;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Handle request selection
  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Handle edit
  const handleEditClick = (request) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      adminNotes: request.adminNotes || '',
      priority: request.priority
    });
    setShowEditModal(true);
  };

  // Handle update
  const handleUpdateRequest = async () => {
    try {
      await requestAPI.update(selectedRequest.id, editForm);
      await fetchRequests();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  // Handle delete
  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await requestAPI.delete(id);
        await fetchRequests();
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  // Handle bulk selection
  const handleBulkSelect = (id) => {
    setBulkSelection(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    try {
      // In a real implementation, you would have a bulk update endpoint
      for (const id of bulkSelection) {
        await requestAPI.update(id, { status });
      }
      await fetchRequests();
      setBulkSelection([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk updating:', error);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const response = await requestAPI.getAll({ limit: 1000 });
      const data = response.data.data || [];
      
      const headers = ['ID', 'Content Name', 'Year', 'Content Type', 'Requested By', 'Status', 'Priority', 'Created At', 'Admin Notes'];
      const csvRows = [
        headers.join(','),
        ...data.map(item => [
          item.id,
          `"${item.contentName}"`,
          item.yearOfRelease,
          item.contentType,
          `"${item.requestedBy}"`,
          item.status,
          item.priority,
          new Date(item.createdAt).toISOString(),
          `"${item.adminNotes || ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requests_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading skeleton
  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage content requests from users ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRequests}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {bulkSelection.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
                  <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                    {bulkSelection.length}
                  </span>
                </div>
                <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                  {bulkSelection.length} request{bulkSelection.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Set status...</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
                
                <button
                  onClick={() => {
                    setBulkSelection([]);
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="duplicate">Duplicate</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <select
              value={filters.contentType}
              onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="webseries">Web Series</option>
              <option value="anime">Anime</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="contentName">Content Name</option>
              <option value="yearOfRelease">Release Year</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-8">
                  <input
                    type="checkbox"
                    checked={bulkSelection.length === requests.length && requests.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelection(requests.map(r => r.id));
                      } else {
                        setBulkSelection([]);
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => (
                <tr 
                  key={request.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleSelectRequest(request)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={bulkSelection.includes(request.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleBulkSelect(request.id);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {request.contentName}
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {request.yearOfRelease}
                          </span>
                          <ContentTypeBadge type={request.contentType} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={14} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {request.requestedBy}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={request.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {formatDate(request.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(request)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {requests.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try a different search term' : 'No requests have been submitted yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRequest.contentName}
                    </h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <ContentTypeBadge type={selectedRequest.contentType} />
                      <StatusBadge status={selectedRequest.status} />
                      <PriorityBadge priority={selectedRequest.priority} />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Release Year
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedRequest.yearOfRelease}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Requested By
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium flex items-center">
                        <User size={16} className="mr-2" />
                        {selectedRequest.requestedBy}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Created At
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        IP Address
                      </h3>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {selectedRequest.createdIp || 'N/A'}
                      </p>
                    </div>
                    
                    {selectedRequest.adminNotes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                          <MessageSquare size={16} className="mr-2" />
                          Admin Notes
                        </h3>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {selectedRequest.adminNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditClick(selectedRequest);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Request Modal */}
      <AnimatePresence>
        {showEditModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Edit Request
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="duplicate">Duplicate</option>
                      <option value="fulfilled">Fulfilled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={editForm.adminNotes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add notes or comments..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRequest}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Update Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestManager;