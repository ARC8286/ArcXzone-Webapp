// src/components/Admin/ContentList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../../services/api';
import { Edit, Trash2, Eye, Search } from 'lucide-react';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContent();
  }, [currentPage, typeFilter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let response;
      
      // Check if the search API endpoint exists by testing it
      // If it returns 404, fall back to filtering on the client side
      if (searchTerm) {
        try {
          // Try to use the search API
          response = await contentAPI.search(searchTerm, typeFilter !== 'all' ? typeFilter : undefined, {
            page: currentPage,
            limit: 10
          });
        } catch (error) {
          if (error.response?.status === 404) {
            // If search endpoint doesn't exist, get all content and filter locally
            console.log('Search endpoint not found, filtering locally');
            const params = {
              page: currentPage,
              limit: 100, // Get more items to filter locally
              type: typeFilter !== 'all' ? typeFilter : undefined
            };
            const allResponse = await contentAPI.getAll(params);
            const filteredContent = allResponse.data.contents.filter(item => 
              item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // Set the filtered content and adjust pagination
            setContent(filteredContent);
            setTotalPages(1); // Local filtering doesn't support pagination well
            return;
          } else {
            throw error;
          }
        }
      } else {
        // Use regular content API when no search term
        const params = {
          page: currentPage,
          limit: 10,
          type: typeFilter !== 'all' ? typeFilter : undefined
        };
        response = await contentAPI.getAll(params);
      }
      
      // Handle different response structures
      const contents = response.data.contents || response.data || [];
      const pages = response.data.pages || 1;
      
      setContent(contents);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentAPI.delete(id);
      setContent(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContent();
  };

  // Add debounced search
  useEffect(() => {
    if (searchTerm) {
      const timerId = setTimeout(() => {
        setCurrentPage(1);
        fetchContent();
      }, 500); // 500ms debounce

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
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
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

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
                        {/* Safely access genres with fallback */}
                        {item.genres && item.genres.slice(0, 2).join(', ')}
                        {!item.genres && 'No genres'}
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
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
            No content found
          </div>
        )}
      </div>

      {/* Pagination - Only show if we're not doing client-side filtering */}
      {totalPages > 1 && !searchTerm && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50"
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