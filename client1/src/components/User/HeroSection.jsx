// src/components/User/HeroSection.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../Common/SearchBar';

const HeroSection = ({ onSearch }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="relative min-h-[50vh] sm:min-h-[60vh] overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(99, 102, 241, 0.5) 0%, 
            rgba(147, 51, 234, 0.3) 35%, 
            rgba(219, 39, 119, 0.2) 70%, 
            transparent 100%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.5) 0%, rgba(147, 51, 234, 0.3) 35%, rgba(219, 39, 119, 0.2) 70%, transparent 100%)`,
            `radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.5) 0%, rgba(147, 51, 234, 0.3) 35%, rgba(219, 39, 119, 0.2) 70%, transparent 100%)`,
            `radial-gradient(circle at 40% 80%, rgba(99, 102, 241, 0.5) 0%, rgba(147, 51, 234, 0.3) 35%, rgba(219, 39, 119, 0.2) 70%, transparent 100%)`,
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Additional Blur Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] w-full">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 sm:space-y-6 w-full"
          >
            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-2 w-full">
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white 
                         leading-tight break-words px-2"
                style={{
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}
              >
                <span className="block">Discover Amazing Content</span>
              </motion.h1>

              <motion.div
                className="h-1 w-16 sm:w-24 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 
                         mx-auto rounded-full"
                animate={{
                  scaleX: [0.5, 1, 0.5],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Subheading */}
            <motion.div variants={itemVariants} className="w-full px-2 sm:px-4">
              <p className="text-sm sm:text-base text-white/80 
                          max-w-2xl mx-auto leading-relaxed font-light break-words">
                Find your favorite movies, web series, and anime all in one place
              </p>
            </motion.div>

            {/* Search Bar Container */}
            <motion.div variants={itemVariants} className="pt-2 sm:pt-4 w-full">
              <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
                <SearchBar 
                  onSearch={onSearch}
                  placeholder="Search movies, web series, anime..."
                />
              </div>
            </motion.div>

            {/* Quick Access Tags */}
            <motion.div variants={itemVariants} className="pt-2 sm:pt-4 w-full px-2 sm:px-4">
              <p className="text-white/70 text-xs mb-2 font-medium text-center">
                Popular searches:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-xl mx-auto">
                {[
                  'Action Movies',
                  'Netflix Series',
                  'Anime',
                  'Comedy',
                  'Sci-Fi',
                  'Thriller'
                ].map((tag, index) => (
                  <motion.button
                    key={tag}
                    className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm 
                             text-white text-xs rounded-full border border-white/20
                             hover:bg-white/20 hover:border-white/40 hover:scale-105
                             transition-all duration-200 font-medium whitespace-nowrap
                             focus:outline-none focus:ring-2 focus:ring-white/30"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;