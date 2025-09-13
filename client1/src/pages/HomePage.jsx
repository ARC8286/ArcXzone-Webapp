// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroSection from '../components/User/HeroSection';
import CategorySection from '../components/User/CategorySection';
import ContentCard from '../components/Common/ContentCard';
import ViewAllPage from './ViewAllPage';
import { contentAPI } from '../services/api';

const HomePage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (results, isEnterPressed = false) => {
    setSearchResults(results);
    if (isEnterPressed) {
      setSearchPerformed(true);
    }
  };

  const filteredResults = searchResults.filter(item => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/content"
          element={<ViewAllPage />}
        />
        <Route
          path="/"
          element={
            <>
              <HeroSection onSearch={handleSearch} />
              
              {searchPerformed && searchResults.length > 0 ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="flex space-x-4 mb-8">
                    {['all', 'movie', 'webseries', 'anime'].map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full capitalize ${
                          activeCategory === category
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        } transition-colors`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredResults.map(content => (
                        <ContentCard key={content._id} content={content} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                      No results found for this category.
                    </div>
                  )}
                </div>
              ) : (
                <CategorySection />
              )}
            </>
          } 
        />
      </Routes>
    </div>
  );
};

export default HomePage;