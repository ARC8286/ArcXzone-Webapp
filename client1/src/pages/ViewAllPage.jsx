// src/pages/ViewAllPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import ContentCard from '../components/Common/ContentCard';
import { ChevronLeft, Filter, Grid, List } from 'lucide-react';

const ViewAllPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'movie';
  
  const typeTitles = {
    movie: 'Movies',
    webseries: 'Web Series',
    anime: 'Anime'
  };

  useEffect(() => {
    fetchContent(1, true);
  }, [type, sortBy, sortOrder]);

  const fetchContent = async (pageNum, reset = false) => {
    try {
      setLoading(true);
      const response = await contentAPI.getAll({
        type,
        page: pageNum,
        limit: 20,
        sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      });
      
      if (reset) {
        setContent(response.data.contents);
      } else {
        setContent(prev => [...prev, ...response.data.contents]);
      }
      
      setHasMore(pageNum < response.data.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
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
  };

  if (loading && content.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mr-4"
          >
            <ChevronLeft size={24} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All {typeTitles[type]}
          </h1>
          <span className="ml-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full text-sm">
            {content.length} items
          </span>
        </div>

        {/* Filters and View Options */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Filter size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="text-gray-700 dark:text-gray-300">Sort by:</span>
            {['releaseDate', 'rating', 'title'].map((sortOption) => (
              <button
                key={sortOption}
                onClick={() => handleSortChange(sortOption)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  sortBy === sortOption
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {sortOption === 'releaseDate' ? 'Date' : 
                 sortOption === 'rating' ? 'Rating' : 'Title'}
                {sortBy === sortOption && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {content.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                : "grid grid-cols-1 gap-4 md:gap-6"
            }>
              {content.map((item) => (
                <ContentCard 
                  key={item._id} 
                  content={item} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No {type} content available.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllPage;