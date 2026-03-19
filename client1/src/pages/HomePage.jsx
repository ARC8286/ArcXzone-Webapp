// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import CategorySection from '../components/User/CategorySection';
import HeroSection from '../components/User/HeroSection';
import { useSearch } from '../contexts/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCard from '../components/Common/ContentCard';

const HomePage = () => {
  const { searchResults, searchQuery, searchCategory, setSearchCategory } = useSearch();
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    setShowSearchResults(searchResults.length > 0 && searchQuery.length > 0);
  }, [searchResults, searchQuery]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'movie', name: 'Movies' },
    { id: 'series', name: 'Series' },
    { id: 'anime', name: 'Anime' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Banner */}
      <HeroSection />
      
      {/* Search Results Section */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-7xl mx-auto px-4 lg:px-8 py-8"
          >
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Results for "{searchQuery}"
                </h2>
                <span className="text-gray-600 dark:text-gray-400">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSearchCategory(category.id)}
                    className={`px-4 py-2 rounded-full capitalize transition-all ${
                      searchCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {searchResults
              .filter(item => searchCategory === 'all' || item.type === searchCategory)
              .length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {searchResults
                  .filter(item => searchCategory === 'all' || item.type === searchCategory)
                  .map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ContentCard 
                        content={item} 
                        variant="netflix"
                      />
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No {searchCategory === 'all' ? '' : searchCategory} results found for "{searchQuery}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Content Sections */}
      {!showSearchResults && <CategorySection />}
    </div>
  );
};

export default HomePage;