// src/components/User/ViewAllPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import ContentCard from '../components/Common/ContentCard';
import { ChevronLeft, Filter, Grid, List, X, Loader, Calendar, Bell, MessageSquare, Eye } from 'lucide-react';

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
  const [requestButtonClicked, setRequestButtonClicked] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = queryParams.get('type') || 'latest';
  
  const typeTitles = useMemo(() => ({
    latest: 'Latest Releases',
    requested: 'Requested Content',
    movie: 'Movies',
    webseries: 'Web Series',
    anime: 'Anime'
  }), []);

  const typeIcons = useMemo(() => ({
    latest: <Calendar size={20} className="mr-2" />,
    requested: <Bell size={20} className="mr-2" />,
    movie: '🎬',
    webseries: '📺',
    anime: '🇯🇵'
  }), []);

  const typeDescriptions = useMemo(() => ({
    latest: 'All the latest movies, series, and anime',
    requested: 'Content requested by users - newest requests first',
    movie: 'Collection of all movies',
    webseries: 'Browse all web series',
    anime: 'Complete anime collection'
  }), []);

  // API Call function with requested content filtering
  const fetchContent = useCallback(async (pageNum, reset = false) => {
    try {
      setLoading(true);
      
      // For latest content, always sort by releaseDate in descending order
      // For requested content, sort by createdAt in descending order
      const isLatest = type === 'latest';
      const isRequested = type === 'requested';
      
      let defaultSort = sortBy;
      let defaultOrder = sortOrder;
      
      if (isLatest) {
        defaultSort = 'releaseDate';
        defaultOrder = 'desc';
      } else if (isRequested) {
        // For requested content, default sort by createdAt (newest first)
        defaultSort = sortBy === 'title' || sortBy === 'rating' ? sortBy : 'createdAt';
        defaultOrder = sortOrder;
      }
      
      const sortParam = `${defaultOrder === 'desc' ? '-' : ''}${defaultSort}`;
      
      // Build query parameters
      const queryParams = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        sort: sortParam
      };

      // For requested content, we need to fetch all and filter by slug
      if (isRequested) {
        queryParams.limit = 1200; // Fetch more for filtering
      } else if (!isLatest) {
        queryParams.type = type;
      }

      const response = await contentAPI.getAll(queryParams);
      
      let filteredContent = response.data.contents || [];
      
      // Filter for requested content if type is 'requested'
      if (isRequested) {
        filteredContent = filteredContent.filter(item => 
          item.slug && item.slug.toLowerCase().startsWith('request')
        );
        
        // Sort requested content by creation date (newest first)
        filteredContent.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || a.releaseDate);
          const dateB = new Date(b.createdAt || b.updatedAt || b.releaseDate);
          return dateB - dateA;
        });
        
        // Apply pagination manually for requested content
        const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        filteredContent = filteredContent.slice(startIndex, endIndex);
        
        // Update hasMore based on filtered content
        const totalFiltered = response.data.contents.filter(item => 
          item.slug && item.slug.toLowerCase().startsWith('request')
        ).length;
        setHasMore(endIndex < totalFiltered);
      } else {
        const totalPages = response.data.pages || 1;
        setHasMore(pageNum < totalPages);
      }
      
      if (reset) {
        setContent(filteredContent);
      } else {
        setContent(prev => [...prev, ...filteredContent]);
      }
      
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
    const isLatest = type === 'latest';
    const isRequested = type === 'requested';
    
    if (isLatest) {
      // For latest content, only allow changing between releaseDate and other options
      if (newSortBy === 'releaseDate') {
        setSortOrder('desc');
      }
      setSortBy(newSortBy);
    } else if (isRequested) {
      // For requested content, handle sort changes normally
      if (sortBy === newSortBy) {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
      } else {
        setSortBy(newSortBy);
        setSortOrder('desc');
      }
    } else {
      // For other types
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
    
    // Reset to default sort when switching types
    if (newType === 'latest') {
      setSortBy('releaseDate');
      setSortOrder('desc');
    } else if (newType === 'requested') {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
  };

  // Handle request content button
  const handleRequestContent = () => {
    setRequestButtonClicked(true);
    // Navigate to request content page
    setTimeout(() => {
      navigate('/request-content');
    }, 300);
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
    const isRequested = type === 'requested';
    const isActive = sortBy === sortOption;
    
    // Don't show createdAt for latest (except requested)
    if (isLatest && sortOption === 'createdAt' && !isRequested) return null;
    
    return (
      <button
        onClick={() => handleSortChange(sortOption)}
        className={`px-3 py-1 rounded-full text-sm capitalize transition duration-150 ease-in-out flex items-center ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {label}
        {isActive && (
          <span className="ml-2 font-bold">
            {sortOrder === 'desc' ? '↓' : '↑'}
            {isLatest && sortOption === 'releaseDate' && ' (Latest)'}
            {isRequested && sortOption === 'createdAt' && ' (Newest)'}
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
            <div>
              <div className="flex items-center">
                {typeIcons[type]}
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {typeTitles[type]}
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {typeDescriptions[type]}
              </p>
            </div>
            <span className="hidden sm:inline-block ml-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full text-sm font-medium">
              {content.length} {content.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Request Content Button for requested section */}
            {type === 'requested' && (
              <button
                onClick={handleRequestContent}
                disabled={requestButtonClicked}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium flex items-center px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <MessageSquare size={18} className="mr-2" />
                {requestButtonClicked ? 'Redirecting...' : 'Request More'}
              </button>
            )}
            
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
          <TypeFilterButton filterType="requested" label="Requested" icon={typeIcons.requested} />
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
            {type === 'requested' && <SortButton sortOption="createdAt" label="Request Date" />}
            <SortButton sortOption="rating" label="Rating" />
            <SortButton sortOption="title" label="Title" />
            {type !== 'latest' && type !== 'requested' && <SortButton sortOption="createdAt" label="Added Date" />}
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
                <TypeFilterButton filterType="requested" label="Requested" icon={typeIcons.requested} />
                <TypeFilterButton filterType="movie" label="Movies" icon={typeIcons.movie} />
                <TypeFilterButton filterType="webseries" label="Web Series" icon={typeIcons.webseries} />
                <TypeFilterButton filterType="anime" label="Anime" icon={typeIcons.anime} />
              </div>

              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
              <div className="flex flex-col space-y-3">
                <SortButton sortOption="releaseDate" label="Release Date" />
                {type === 'requested' && <SortButton sortOption="createdAt" label="Request Date" />}
                <SortButton sortOption="rating" label="Rating" />
                <SortButton sortOption="title" label="Title" />
                {type !== 'latest' && type !== 'requested' && <SortButton sortOption="createdAt" label="Added Date" />}
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
                      : 'bg-gray-200 dark:bg-gray-700 text-gray:700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <List size={20} className="mr-2" /> List
                  </button>
                </div>
              </div>

              {/* Info messages */}
              <div className="mt-6 space-y-3">
                {type === 'latest' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Latest releases are sorted by release date to show newest content first.
                    </p>
                  </div>
                )}
                
                {type === 'requested' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Requested content shows items requested by users. Newest requests appear first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requested Content Notice */}
        {type === 'requested' && content.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center">
              <Bell size={20} className="text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                  Requested Content
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  These are items requested by our users. The newest requests appear first. 
                  Want something else? Use the "Request More" button!
                </p>
              </div>
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
                <div key={item._id} className="relative">
                  <ContentCard 
                    content={item} 
                    viewMode={viewMode}
                  />
                  {/* Requested badge */}
                  {type === 'requested' && item.slug?.toLowerCase().startsWith('request') && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Requested
                    </div>
                  )}
                </div>
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
            <div className="max-w-md mx-auto">
              {type === 'requested' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <MessageSquare size={32} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Requested Content Yet
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be the first to request content! Let us know what you'd like to see.
                  </p>
                  <button
                    onClick={handleRequestContent}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
                  >
                    <MessageSquare size={20} className="mr-2" />
                    Request Content
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    No {typeTitles[type]} Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    It looks like there's no content available for this category yet.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllPage;