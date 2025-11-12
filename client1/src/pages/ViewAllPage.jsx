// src/components/User/ViewAllPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import ContentCard from '../components/Common/ContentCard';
import { ChevronLeft, Filter, Grid, List, X, Loader, Calendar } from 'lucide-react';

// Configuration
const ITEMS_PER_PAGE = 50;

// Component to display when data is loading
const ContentSkeleton = ({ viewMode }) => {
  const CardSkeleton = () => (
    <div className={`rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse ${
      viewMode === 'grid' 
        ? 'aspect-[2/3] shadow-md' 
        : 'h-32 shadow-sm'
    }`}></div>
  );
  
  const gridClasses = viewMode === 'grid' 
    ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6"
    : "grid grid-cols-1 gap-4 md:gap-6";

  return (
    <div className={gridClasses}>
      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

const ViewAllPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = queryParams.get('type') || 'latest';
  
  const typeTitles = useMemo(() => ({
    latest: 'Latest Releases',
    movie: 'Movies',
    webseries: 'Web Series',
    anime: 'Anime'
  }), []);

  const typeIcons = useMemo(() => ({
    latest: <Calendar size={20} className="mr-2" />,
    movie: '🎬',
    webseries: '📺',
    anime: '🇯🇵'
  }), []);

  // API Call function
  const fetchContent = useCallback(async (pageNum, reset = false) => {
    try {
      setLoading(true);
      
      // For latest content, always sort by releaseDate in descending order
      const isLatest = type === 'latest';
      const defaultSort = isLatest ? 'releaseDate' : sortBy;
      const defaultOrder = isLatest ? 'desc' : sortOrder;
      
      const sortParam = `${defaultOrder === 'desc' ? '-' : ''}${defaultSort}`;
      
      // Build query parameters
      const queryParams = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sort: sortParam
      };

      // Add type filter only if it's not 'latest'
      if (!isLatest) {
        queryParams.type = type;
      }

      const response = await contentAPI.getAll(queryParams);
      
      if (reset) {
        setContent(response.data.contents || []);
      } else {
        setContent(prev => [...prev, ...(response.data.contents || [])]);
      }
      
      const totalPages = response.data.pages || 1;
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching content:', error);
      if (reset) setContent([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [type, sortBy, sortOrder]);

  // Effect to refetch when filters/type change
  useEffect(() => {
    fetchContent(1, true);
  }, [type, sortBy, sortOrder, fetchContent]);

  // Load More logic
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchContent(page + 1);
    }
  };

  // Sort change handler
  const handleSortChange = (newSortBy) => {
    if (type === 'latest') {
      // For latest content, only allow changing between releaseDate and other options
      // but maintain descending order for releaseDate
      if (newSortBy === 'releaseDate') {
        setSortOrder('desc');
      }
      setSortBy(newSortBy);
    } else {
      if (sortBy === newSortBy) {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
      } else {
        setSortBy(newSortBy);
        setSortOrder('desc');
      }
    }
  };

  // Filter by type handler
  const handleTypeFilter = (newType) => {
    const newParams = new URLSearchParams();
    newParams.set('type', newType);
    navigate(`/content?${newParams.toString()}`);
    
    // Reset to default sort when switching to latest
    if (newType === 'latest') {
      setSortBy('releaseDate');
      setSortOrder('desc');
    }
  };

  const isInitialLoading = loading && content.length === 0;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8 h-8">
            {/* Header placeholder */}
          </div>
          <ContentSkeleton viewMode={viewMode} />
          <div className="mt-8 text-center">
            <div className="animate-spin inline-block h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const SortButton = ({ sortOption, label }) => {
    const isLatest = type === 'latest';
    const isActive = sortBy === sortOption;
    const isDisabled = isLatest && sortOption === 'createdAt'; // Don't show createdAt for latest
    
    if (isDisabled) return null;
    
    return (
      <button
        onClick={() => handleSortChange(sortOption)}
        disabled={isDisabled}
        className={`px-3 py-1 rounded-full text-sm capitalize transition duration-150 ease-in-out flex items-center ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {label}
        {isActive && (
          <span className="ml-2 font-bold">
            {sortOrder === 'desc' ? '↓' : '↑'}
            {isLatest && sortOption === 'releaseDate' && ' (Latest)'}
          </span>
        )}
      </button>
    );
  };

  const TypeFilterButton = ({ filterType, label, icon }) => (
    <button
      onClick={() => handleTypeFilter(filterType)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out flex items-center ${
        type === filterType
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mr-4 p-2 rounded-full transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center">
              {typeIcons[type]}
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {typeTitles[type]}
              </h1>
            </div>
            <span className="hidden sm:inline-block ml-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full text-sm font-medium">
              {content.length} {content.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150 ease-in-out md:hidden"
              aria-label="Open Filters"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition duration-150 ease-in-out ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Grid View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition duration-150 ease-in-out ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Type Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <TypeFilterButton filterType="latest" label="Latest Releases" icon={typeIcons.latest} />
          <TypeFilterButton filterType="movie" label="Movies" icon={typeIcons.movie} />
          <TypeFilterButton filterType="webseries" label="Web Series" icon={typeIcons.webseries} />
          <TypeFilterButton filterType="anime" label="Anime" icon={typeIcons.anime} />
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden md:flex items-center space-x-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <Filter size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300 font-medium flex-shrink-0">Sort by:</span>
          <div className="flex flex-wrap gap-3">
            <SortButton sortOption="releaseDate" label="Release Date" />
            <SortButton sortOption="rating" label="Rating" />
            <SortButton sortOption="title" label="Title" />
            {type !== 'latest' && <SortButton sortOption="createdAt" label="Added Date" />}
          </div>
        </div>
        
        {/* Mobile Filter Panel */}
        {isFilterPanelOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden">
            <div className="w-64 bg-white dark:bg-gray-800 shadow-2xl h-full p-4 transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Filter size={20} className="mr-2 text-indigo-600" /> Filters & Sort
                </h3>
                <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Content Type</h4>
              <div className="flex flex-col space-y-2 mb-6">
                <TypeFilterButton filterType="latest" label="Latest Releases" icon={typeIcons.latest} />
                <TypeFilterButton filterType="movie" label="Movies" icon={typeIcons.movie} />
                <TypeFilterButton filterType="webseries" label="Web Series" icon={typeIcons.webseries} />
                <TypeFilterButton filterType="anime" label="Anime" icon={typeIcons.anime} />
              </div>

              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
              <div className="flex flex-col space-y-3">
                <SortButton sortOption="releaseDate" label="Release Date" />
                <SortButton sortOption="rating" label="Rating" />
                <SortButton sortOption="title" label="Title" />
                {type !== 'latest' && <SortButton sortOption="createdAt" label="Added Date" />}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">View Mode</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => { setViewMode('grid'); setIsFilterPanelOpen(false); }}
                    className={`p-2 rounded-lg transition duration-150 ease-in-out flex items-center justify-center w-1/2 ${
                      viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Grid size={20} className="mr-2" /> Grid
                  </button>
                  <button
                    onClick={() => { setViewMode('list'); setIsFilterPanelOpen(false); }}
                    className={`p-2 rounded-lg transition duration-150 ease-in-out flex items-center justify-center w-1/2 ${
                      viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <List size={20} className="mr-2" /> List
                  </button>
                </div>
              </div>

              {/* Info message for latest content */}
              {type === 'latest' && (
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Latest releases are sorted by release date to show newest content first.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Grid/List */}
        {content.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6"
                : "grid grid-cols-1 gap-4 md:gap-6"
            }>
              {content.map((item) => (
                <ContentCard 
                  key={item._id} 
                  content={item} 
                  viewMode={viewMode}
                />
              ))}
              {/* Show skeleton while appending data */}
              {loading && <ContentSkeleton viewMode={viewMode} />}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin mr-2" /> Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No {typeTitles[type]} Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              It looks like there's no content available for this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllPage;