// src/components/Common/SearchPortal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import { 
  Search, X, Loader2, Film, Tv, Play, Star, Calendar, 
  Clock, TrendingUp, History, Zap, Award, ExternalLink,
  Mic, Frown, Send, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../../services/api';
import { useDebounce } from '../../hooks/usedebounce';

const SearchPortal = () => {
  const { 
    isSearchOpen, 
    closeSearch, 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setSearchResults, 
    addToHistory,
    searchHistory,
    isLoading,
    setIsLoading,
    featuredContent,
    setFeaturedContent
  } = useSearch();
  
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [trendingSearches] = useState([
    'Stranger Things',
    'Avatar',
    'Demon Slayer',
    'Inception',
    'Death Note',
    'Family Man'
  ]);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setSearchQuery(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsVoiceSearchActive(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsVoiceSearchActive(false);
        };
      }
    }
  }, []);

  // Load featured content
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await contentAPI.getAll({ limit: 6 });
        setFeaturedContent(response.data.contents);
      } catch (error) {
        console.error('Failed to load featured content:', error);
      }
    };
    
    if (isSearchOpen && featuredContent.length === 0) {
      loadFeatured();
    }
  }, [isSearchOpen, featuredContent.length]);

  // Handle search
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery.trim());
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery]);

  // Focus input when portal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen) return;

      if (e.key === 'Escape') {
        closeSearch();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const totalItems = searchResults.length + (searchQuery.length === 0 ? featuredContent.length : 0);
        if (totalItems === 0) return;

        if (e.key === 'ArrowDown') {
          setSelectedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          );
        } else {
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          );
        }
      }

      if (e.key === 'Enter' && selectedIndex >= 0) {
        if (selectedIndex < searchResults.length) {
          handleSelect(searchResults[selectedIndex]._id);
        } else if (searchQuery.length === 0) {
          const featuredIndex = selectedIndex - searchResults.length;
          handleSelect(featuredContent[featuredIndex]._id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchResults, selectedIndex, featuredContent, searchQuery]);

  const performSearch = async (query) => {
    setIsLoading(true);
    try {
      const response = await contentAPI.search(query);
      setSearchResults(response.data);
      addToHistory(query);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id) => {
    navigate(`/content/${id}`);
    closeSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleTrendingClick = (query) => {
    setSearchQuery(query);
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current) {
      setIsVoiceSearchActive(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceSearchActive(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getContentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'movie': return <Film className="w-4 h-4 text-red-500" />;
      case 'series': return <Tv className="w-4 h-4 text-blue-500" />;
      case 'anime': return <Play className="w-4 h-4 text-purple-500" />;
      default: return <Film className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleRequestContent = () => {
    navigate('/request-content');
    closeSearch();
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
          />

          {/* Search Container - Responsive and Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-4 top-[10%] md:top-[15%] lg:top-20 mx-auto w-auto md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-4xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl z-[101] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header - Responsive */}
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center w-full">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mr-3" />
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for movies, series, anime... with min. 3 char"
                      className="w-full bg-transparent text-white text-base sm:text-xl placeholder-gray-500 focus:outline-none pr-16 sm:pr-20"
                      autoComplete="off"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
                      >
                        <X size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                    
                    {/* Voice Search Button */}
                    {recognitionRef.current && (
                      <button
                        onClick={isVoiceSearchActive ? stopVoiceSearch : startVoiceSearch}
                        className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-1 ${
                          isVoiceSearchActive 
                            ? 'text-red-500 animate-pulse' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title={isVoiceSearchActive ? "Stop voice search" : "Start voice search"}
                      >
                        <Mic size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={closeSearch}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex-shrink-0 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Search Content - Responsive */}
            <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-red-600" />
                  <span className="ml-3 text-gray-300 text-sm sm:text-base">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {searchResults.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelect(item._id)}
                        className={`flex items-start sm:items-center p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                          selectedIndex === index 
                            ? 'bg-red-900/30 border border-red-800' 
                            : 'hover:bg-gray-800/50 border border-transparent'
                        }`}
                      >
                        <div className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            {getContentIcon(item.type)}
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                              {item.title}
                            </h4>
                            <span className="text-gray-400 text-xs sm:text-sm">
                              {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                            {item.rating && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
                                {item.rating}
                              </div>
                            )}
                            {item.runtime && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                {formatRuntime(item.runtime)}
                              </div>
                            )}
                            <span className="capitalize px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-800 rounded text-xs">
                              {item.type}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 hidden sm:block">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : searchQuery.length === 0 ? (
                <div className="p-4 sm:p-8">
                  {/* Trending Searches */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <h3 className="text-base sm:text-lg font-semibold text-white">Trending Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleTrendingClick(search)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors text-xs sm:text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <h3 className="text-base sm:text-lg font-semibold text-white">Recent Searches</h3>
                      </div>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleTrendingClick(item)}
                            className="flex items-center justify-between w-full p-2 sm:p-3 hover:bg-gray-800/50 rounded-lg transition-colors"
                          >
                            <span className="text-gray-300 text-sm sm:text-base truncate">{item}</span>
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured Content */}
                  {featuredContent.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                        <h3 className="text-base sm:text-lg font-semibold text-white">Featured Today</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {featuredContent.map((item, index) => (
                          <div
                            key={item._id || index}
                            onClick={() => handleSelect(item._id)}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-gray-800">
                              {item.posterUrl ? (
                                <img
                                  src={item.posterUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h4 className="text-white text-xs sm:text-sm font-medium truncate">
                              {item.title || 'Untitled'}
                            </h4>
                            <p className="text-gray-400 text-xs">
                              {item.type || 'Movie'} • {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 sm:p-12">
                  <Frown className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">
                    No results found
                  </h3>
                  <p className="text-gray-400 text-center mb-6 max-w-md text-sm sm:text-base">
                    We couldn't find any matches for "{searchQuery}"
                  </p>
                  <button
                    onClick={handleRequestContent}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Request this content
                  </button>
                </div>
              )}
            </div>

            {/* Footer Help Text - Hidden on small screens */}
            {(searchResults.length > 0 || searchQuery.length === 0) && (
              <div className="hidden sm:block px-6 py-3 border-t border-gray-800 bg-gray-900/50">
                <p className="text-xs text-gray-500 text-center">
                  ↑↓ Navigate • Enter Select • Esc Close
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchPortal;