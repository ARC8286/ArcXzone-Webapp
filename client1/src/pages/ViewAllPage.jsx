// src/pages/ViewAllPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import ContentCard from '../components/Common/ContentCard';
import { ChevronLeft, Filter, Grid, List, Search, X } from 'lucide-react';

const ViewAllPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'movie';
  
  const typeTitles = {
    movie: 'Movies',
    webseries: 'Web Series',
    anime: 'Anime'
  };

  const sortOptions = [
    { value: 'releaseDate', label: 'Release Date' },
    { value: 'rating', label: 'Rating' },
    { value: 'title', label: 'Title' },
    { value: 'views', label: 'Popularity' }
  ];

  // Debounce function for search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Initial content fetch
  useEffect(() => {
    if (!isSearchMode) {
      fetchContent(1, true);
    }
  }, [type, sortBy, sortOrder, isSearchMode]);

  // Search effect with debounce
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchTerm.trim()) {
        setIsSearchMode(true);
        performSearch(searchTerm);
      } else {
        setIsSearchMode(false);
        fetchContent(1, true);
      }
    }, 500);

    debouncedSearch();

    return () => {
      clearTimeout(debouncedSearch);
    };
  }, [searchTerm, type]);

  const fetchContent = async (pageNum, reset = false) => {
    try {
      setLoading(reset);
      const response = await contentAPI.getAll({
        type,
        page: pageNum,
        limit: 20,
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      });
      
      if (reset) {
        setContent(response.data.contents || []);
      } else {
        setContent(prev => [...prev, ...(response.data.contents || [])]);
      }
      
      setHasMore(pageNum < (response.data.pages || 0));
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      setSearchLoading(true);
      setLoading(true);
      
      // Use the search API from contentAPI
      const response = await contentAPI.search(query, type);
      
      // Handle different possible response structures
      const searchResults = response.data?.results || response.data?.contents || response.data || [];
      
      setContent(searchResults);
      setHasMore(false); // Search results are typically paginated differently
      setPage(1);
    } catch (error) {
      console.error('Error searching content:', error);
      setContent([]);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && !isSearchMode) {
      fetchContent(page + 1);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setShowFilters(false);
    
    // If in search mode, re-search with new sorting
    if (isSearchMode && searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    fetchContent(1, true);
  };

  // Sort content locally if in search mode (since search API might not support sorting)
  const sortedContent = React.useMemo(() => {
    if (!isSearchMode) return content;
    
    const sorted = [...content].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'rating':
          aValue = parseFloat(a.rating || 0);
          bValue = parseFloat(b.rating || 0);
          break;
        case 'releaseDate':
          aValue = new Date(a.releaseDate || 0);
          bValue = new Date(b.releaseDate || 0);
          break;
        case 'views':
          aValue = parseInt(a.views || 0);
          bValue = parseInt(b.views || 0);
          break;
        default:
          return 0;
      }
      
      if (sortBy === 'title') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  }, [content, sortBy, sortOrder, isSearchMode]);

  if (loading && content.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {searchLoading ? `Searching ${typeTitles[type]}...` : `Loading ${typeTitles[type]}...`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {isSearchMode && searchTerm ? `Search: "${searchTerm}"` : typeTitles[type]}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedContent.length} {sortedContent.length === 1 ? 'item' : 'items'}
                  {isSearchMode && searchTerm && ` found for "${searchTerm}"`}
                </p>
              </div>
            </div>
            
            {/* View Mode Toggle - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${typeTitles[type].toLowerCase()}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <Filter size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Sort & Filter
              </span>
            </div>
            <ChevronLeft 
              size={20} 
              className={`transform transition-transform text-gray-500 ${showFilters ? 'rotate-90' : '-rotate-90'}`} 
            />
          </button>
        </div>

        {/* Filters Panel */}
        <div className={`mb-6 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <span className="ml-2 font-bold">
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle - Mobile */}
              <div className="flex md:hidden items-center justify-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Grid size={16} />
                  <span className="text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <List size={16} />
                  <span className="text-sm">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {isSearchMode && searchTerm && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              {sortedContent.length > 0 
                ? `Found ${sortedContent.length} result${sortedContent.length !== 1 ? 's' : ''} for "${searchTerm}"`
                : `No results found for "${searchTerm}"`
              }
              <button
                onClick={clearSearch}
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium underline"
              >
                Clear search
              </button>
            </p>
          </div>
        )}

        {/* Content Grid */}
        {sortedContent.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4"
                : "grid grid-cols-1 gap-4"
            }>
              {sortedContent.map((item, index) => (
                <div
                  key={item._id || item.id || index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ContentCard 
                    content={item} 
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button - Only show for non-search results */}
            {!isSearchMode && hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg font-medium"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                <Search size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {isSearchMode ? 'No Search Results' : `No ${typeTitles[type]} Found`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isSearchMode && searchTerm 
                  ? `No results found for "${searchTerm}". Try different keywords or check the spelling.`
                  : `No ${type} content available at the moment.`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ViewAllPage;