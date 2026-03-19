// src/contexts/SearchContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

const SearchProvider = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchCategory, setSearchCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    // Store current scroll position
    document.body.style.overflow = 'hidden';
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchCategory('all');
    document.body.style.overflow = 'auto';
  }, []);

  const addToHistory = useCallback((query) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [searchHistory]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchCategory('all');
  }, []);

  // Load search history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(savedHistory);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        searchHistory,
        addToHistory,
        clearSearch,
        searchCategory,
        setSearchCategory,
        isLoading,
        setIsLoading,
        featuredContent,
        setFeaturedContent
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;