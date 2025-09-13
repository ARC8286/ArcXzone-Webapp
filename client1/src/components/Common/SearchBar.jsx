// src/components/Common/SearchBar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Film, Tv, Play, Star, Calendar, ChevronRight, Mic, Image } from "lucide-react";
import { contentAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/usedebounce";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";

const SearchBar = ({ placeholder = "Search movies, webseries, anime...", onSearch, compact = false }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isVoiceSearchAvailable, setIsVoiceSearchAvailable] = useState(false);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const recognitionRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Check if voice search is available
  useEffect(() => {
    setIsVoiceSearchAvailable('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if (isVoiceSearchAvailable) {
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
          setQuery(transcript);
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
  }, [isVoiceSearchAvailable]);

  // Handle search with debounced query
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      handleSearch(debouncedQuery.trim());
    } else {
      setResults([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useClickOutside(containerRef, () => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  });

  const handleSearch = async (q) => {
    setLoading(true);
    try {
      const response = await contentAPI.search(q);
      setResults(response.data);
      setShowDropdown(true);
      setSelectedIndex(-1);
      
      // Pass results to parent without triggering category display
      if (onSearch) {
        onSearch(response.data, false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterSearch = async () => {
    if (query.trim().length === 0) return;
    
    setLoading(true);
    try {
      const response = await contentAPI.search(query.trim());
      setResults(response.data);
      setShowDropdown(false);
      setSelectedIndex(-1);
      
      // Pass results to parent with flag indicating Enter was pressed
      if (onSearch) {
        onSearch(response.data, true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    
    // Clear parent search results if callback provided
    if (onSearch) {
      onSearch([], false);
    }
  };

  const handleSelect = (id) => {
    clearSearch();
    setIsFocused(false);
    navigate(`/content/${id}`);
  };

  const handleKeyDown = (e) => {
    const totalItems = calculateTotalItems();
    
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]._id);
      } else {
        handleEnterSearch();
      }
    }
    
    if (!showDropdown || totalItems === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        scrollToSelectedItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : totalItems - 1);
        scrollToSelectedItem();
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const calculateTotalItems = () => {
    return results.length;
  };

  const scrollToSelectedItem = () => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const getContentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'movie':
        return <Film className="w-4 h-4 text-indigo-500" />;
      case 'webseries':
      case 'series':
        return <Tv className="w-4 h-4 text-purple-500" />;
      case 'anime':
        return <Play className="w-4 h-4 text-pink-500" />;
      default:
        return <Film className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.trim().length >= 2 && results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const startVoiceSearch = () => {
    if (isVoiceSearchAvailable && recognitionRef.current) {
      setIsVoiceSearchActive(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceSearch = () => {
    if (isVoiceSearchAvailable && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceSearchActive(false);
    }
  };

  const handleImageError = (id) => {
    setImageLoadErrors(prev => ({ ...prev, [id]: true }));
  };

  // Generate placeholder color based on content ID for consistent fallbacks
  const getPlaceholderColor = (id) => {
    const colors = [
      '6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', 'ef4444', '3b82f6'
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Custom hook for keyboard navigation
  useKeyboardNavigation({
    containerRef,
    dropdownRef,
    showDropdown,
    selectedIndex,
    setSelectedIndex,
    itemCount: calculateTotalItems(),
    onSelect: () => {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]._id);
      }
    }
  });

  return (
    <div 
      className={`relative ${compact ? 'w-full' : 'w-full max-w-2xl mx-auto'}`} 
      ref={containerRef}
    >
      {/* Search Input Container */}
      <div className="relative">
        <motion.div
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 ease-out ${
            isFocused ? 'shadow-2xl shadow-indigo-500/25 ring-2 ring-indigo-500/50' : 
            'shadow-lg hover:shadow-xl hover:shadow-indigo-500/10'
          } ${compact ? 'rounded-xl' : 'rounded-2xl'}`}
          whileTap={{ scale: 0.99 }}
        >
          {/* Animated Gradient Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"
            animate={{ 
              opacity: isFocused ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Animated Border Glow */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl"
            animate={{ 
              opacity: isFocused ? 0.15 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          
          <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md m-[1.5px] ${compact ? 'rounded-xl' : 'rounded-2xl'}`}>
            {/* Search Icon */}
            <motion.div
              className="absolute inset-y-0 left-0 flex items-center pl-4 z-10"
              animate={{ 
                scale: isFocused ? 1.1 : 1,
                color: isFocused ? '#6366f1' : '#9ca3af'
              }}
              transition={{ duration: 0.2 }}
            >
              <Search className="h-5 w-5" />
            </motion.div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`
                w-full pl-12 pr-16 py-4 bg-transparent text-gray-900 dark:text-white 
                placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none
                transition-all duration-300 ${compact ? 'text-sm py-3' : 'text-base sm:text-lg'} font-medium
                ${isFocused ? 'placeholder-gray-400' : ''}
              `}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Voice Search Button */}
            {isVoiceSearchAvailable && (
              <motion.button
                type="button"
                onClick={isVoiceSearchActive ? stopVoiceSearch : startVoiceSearch}
                className={`absolute inset-y-0 right-0 flex items-center pr-12
                         text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 
                         transition-colors duration-200 z-10 p-1 rounded-full
                         hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                         ${isVoiceSearchActive ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isVoiceSearchActive ? "Stop voice search" : "Start voice search"}
              >
                <Mic size={18} />
              </motion.button>
            )}

            {/* Clear Button */}
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-4
                           text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                           transition-colors duration-200 z-10 p-1 rounded-full
                           hover:bg-red-50 dark:hover:bg-red-900/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  className="absolute inset-y-0 right-0 flex items-center pr-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showDropdown && query.length >= 2 && (
          <motion.div
            ref={dropdownRef}
            className="fixed mt-2 bg-white/95 dark:bg-gray-800/95 
                     rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50
                     z-50 backdrop-blur-md custom-scrollbar"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
              maxHeight: 'min(480px, 60vh)',
              overflowY: 'auto',
              width: containerRef.current?.offsetWidth || 'auto',
              top: containerRef.current ? containerRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
              left: containerRef.current ? containerRef.current.getBoundingClientRect().left + window.scrollX : 0,
            }}
          >
            {/* Search Results Section */}
            <>
              {/* Results Header */}
              {!loading && results.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-750/30">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-900 uppercase tracking-wider">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <motion.div 
                  className="p-6 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-indigo-600" />
                  </motion.div>
                  <span className="text-gray-600 dark:text-gray-300 mt-2">Searching...</span>
                </motion.div>
              )}

              {/* Results */}
              {!loading && (
                <div className="overflow-y-auto">
                  {results.length > 0 ? (
                    results.map((item, index) => {
                      const offsetIndex = index;
                      const placeholderColor = getPlaceholderColor(item._id);
                      const hasImageError = imageLoadErrors[item._id];
                      
                      return (
                        <motion.div
                          key={item._id}
                          data-index={offsetIndex}
                          onClick={() => handleSelect(item._id)}
                          className={`
                            flex items-start space-x-3 p-4 cursor-pointer transition-all duration-200
                            border-b border-gray-100 dark:border-gray-700/30 last:border-b-0 overflow-hidden
                            ${selectedIndex === offsetIndex 
                              ? 'bg-indigo-50/80 dark:bg-indigo-900/20' 
                              : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/30'
                            }
                          `}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {/* Thumbnail with Gradient Overlay */}
                          <div className="relative flex-shrink-0 group">
                            <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden shadow-md bg-gray-200 dark:bg-gray-700">
                              {!hasImageError ? (
                                <>
                                  <img
                                    src={item.posterUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                    onError={() => handleImageError(item._id)}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                                  <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: `#${placeholderColor}20` }}
                                  >
                                    <Image className="w-6 h-6 text-gray-500" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Content Type Badge */}
                            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm">
                              {item.type?.charAt(0)}
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-start space-x-2 mb-1">
                              {getContentIcon(item.type)}
                              <h4 className="text-gray-900 dark:text-white font-semibold 
                                          text-sm sm:text-base line-clamp-2 break-words">
                                {item.title}
                              </h4>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{new Date(item.releaseDate).getFullYear()}</span>
                              </div>
                              
                              {item.rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                                  <span className="font-medium">{item.rating}</span>
                                </div>
                              )}
                              
                              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs capitalize">
                                {item.type}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 
                                          line-clamp-2 break-words">
                                {item.description}
                              </p>
                            )}
                            
                            {/* Genres */}
                            {item.genres && item.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.genres.slice(0, 3).map(genre => (
                                  <span 
                                    key={genre}
                                    className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Arrow Icon */}
                          <motion.div
                            className="flex-shrink-0 text-gray-400 dark:text-gray-500 mt-2"
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      className="p-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 
                                  rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        No results found for "{query}"
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Try searching with different keywords or check the spelling
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </>

            {/* Footer Hint */}
            {!loading && results.length > 0 && (
              <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-750/30 border-t border-gray-100 dark:border-gray-700/50">
                <p className="text-xs text-gray-400 dark:text-gray-900 text-center">
                  ↑↓ Navigate • Enter Select • Esc Close
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.8);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;