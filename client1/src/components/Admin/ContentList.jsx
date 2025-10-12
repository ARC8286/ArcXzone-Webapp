// src/components/Admin/ContentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../../services/api';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { useDebounce } from '../../hooks/usedebounce';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  
  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 800); // Increased to 800ms

  // Memoized fetch function with request cancellation
  const fetchContent = useCallback(async (abortController) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const query = debouncedSearchTerm;
      const type = typeFilter !== 'all' ? typeFilter : undefined;
      
      const requestOptions = {
        page: currentPage,
        limit: 10
      };

      // Add abort signal to prevent outdated requests
      if (abortController) {
        requestOptions.signal = abortController.signal;
      }

      if (query) {
        try {
          response = await contentAPI.search(query, type, requestOptions);
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Request was cancelled');
            return;
          }
          
          if (error.response?.status === 404) {
            console.log('Search endpoint not found, filtering locally');
            const params = {
              ...requestOptions,
              limit: 50, // Reduced from 100 to avoid rate limits
              type: type
            };
            
            const allResponse = await contentAPI.getAll(params);
            if (abortController?.signal.aborted) return;
            
            const filteredContent = allResponse.data.contents.filter(item => 
              item.title.toLowerCase().includes(query.toLowerCase())
            );
            
            setContent(filteredContent);
            setTotalPages(1);
            return;
          } else if (error.response?.status === 429) {
            setError('Too many requests. Please wait a moment and try again.');
            return;
          } else {
            throw error;
          }
        }
      } else {
        response = await contentAPI.getAll({
          ...requestOptions,
          type: type
        });
      }
      
      if (abortController?.signal.aborted) return;
      
      const contents = response.data.contents || response.data || [];
      const pages = response.data.pages || response.data.totalPages || 1;
      
      setContent(contents);
      setTotalPages(pages);
      
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      console.error('Error fetching content:', error);
      
      if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please wait before making more requests.');
      } else {
        setError('Failed to load content. Please try again.');
      }
      setContent([]);
    } finally {
      if (!abortController?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [debouncedSearchTerm, typeFilter, currentPage]);

  // Fetch content with request cancellation
  useEffect(() => {
    const abortController = new AbortController();
    
    fetchContent(abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchContent]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentAPI.delete(id);
      // Refetch content after deletion
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait before deleting again.');
      } else {
        alert('Failed to delete content');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    setError(null);
    fetchContent();
  };

  // Show loading only for initial load
  if (loading && content.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manage Content
        </h1>
        <Link
          to="/admin/add-content"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New Content
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex justify-between items-center">
            <div className="text-red-800 dark:text-red-200">{error}</div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 disabled:opacity-50"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="webseries">Web Series</option>
              <option value="anime">Anime</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Loading overlay for subsequent loads */}
      <div className="relative">
        {loading && content.length > 0 && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Content Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {content.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={item.posterUrl}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x60?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.genres?.slice(0, 2).join(', ') || 'No genres'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 capitalize">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.rating || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/content/${item._id}`}
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/edit-content/${item._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={loading}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {content.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {error ? 'Failed to load content' : 'No content found'}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  } disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ContentList;