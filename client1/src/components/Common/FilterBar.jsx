// src/components/Common/FilterBar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Film, Tv, Play } from 'lucide-react';

const FilterBar = ({ activeFilter = 'all', onFilterChange, resultCount = 0, showResults = false }) => {
  const filters = [
    { 
      id: 'all', 
      label: 'All', 
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500',
      hoverColor: 'hover:from-cyan-600 hover:to-blue-600'
    },
    { 
      id: 'movie', 
      label: 'Movie', 
      icon: Film,
      color: 'from-indigo-500 to-purple-500',
      hoverColor: 'hover:from-indigo-600 hover:to-purple-600'
    },
    { 
      id: 'webseries', 
      label: 'TV Show', 
      icon: Tv,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600'
    },
    { 
      id: 'anime', 
      label: 'Anime', 
      icon: Play,
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'hover:from-pink-600 hover:to-rose-600'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="flex items-center justify-center gap-2 sm:gap-3 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
                rounded-full font-medium text-xs sm:text-sm
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'text-white shadow-lg scale-105' 
                  : 'text-gray-300 hover:text-white hover:scale-105 shadow-md'
                }
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background Gradient */}
              <motion.div
                className={`
                  absolute inset-0 rounded-full bg-gradient-to-r ${filter.color}
                  transition-opacity duration-300
                  ${isActive ? 'opacity-100' : 'opacity-30'}
                `}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.3,
                  scale: isActive ? 1 : 0.95
                }}
                whileHover={{ opacity: isActive ? 1 : 0.5 }}
              />

              {/* Active Glow Effect */}
              {isActive && (
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${filter.color} blur-md -z-10`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                />
              )}

              {/* Icon */}
              <Icon className="w-4 h-4 sm:w-4 sm:h-4 relative z-10" />

              {/* Label */}
              <span className="relative z-10 font-semibold whitespace-nowrap">
                {filter.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Results Count Display */}
      {showResults && (
        <motion.div
          className="text-center pb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-gray-300">
            {resultCount > 0 ? (
              <>
                <span className="font-semibold text-white">{resultCount}</span> result{resultCount !== 1 ? 's' : ''} found
              </>
            ) : (
              <span className="text-gray-400">No results found</span>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FilterBar;