// src/pages/ContentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Star, Download, Globe, HardDrive, Play, Share, Heart, ArrowLeft } from 'lucide-react';
import { contentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const ContentPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentAPI.getById(id);
        setContent(response.data);
        // Preload the backdrop image
        const img = new Image();
        img.src = response.data.backdropUrl || response.data.posterUrl;
        img.onload = () => setImageLoaded(true);
        
        // Check if content is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(response.data.id));
      } catch (err) {
        setError('Content not found');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter(favId => favId !== content.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } else {
      favorites.push(content.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"
          ></motion.div>
          <p className="text-white text-lg font-medium">Loading content...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center px-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-2xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Oops!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Content not found'}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
            >
              <ArrowLeft size={18} className="mr-2" />
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-12">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-50 p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 group touch-manipulation"
        aria-label="Go back"
      >
        <ArrowLeft size={20} className="text-white group-hover:scale-110 transition-transform md:size-6" />
      </motion.button>
      
      {/* Hero Section with Backdrop */}
      <div 
        className="h-80 md:h-96 relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${content.backdropUrl || content.posterUrl})` }}
      >
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-white border-t-transparent"
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        
        <motion.div 
          initial="hidden"
          animate={imageLoaded ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-8"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              variants={slideUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight"
            >
              {content.title}
            </motion.h1>
            
            <motion.div 
              variants={staggerChildren}
              className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6"
            >
              <motion.div 
                variants={scaleUp}
                className="flex items-center text-xs md:text-sm text-gray-200 bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full"
              >
                <Calendar size={14} className="mr-1 md:size-4" />
                {formatDate(content.releaseDate)}
              </motion.div>
              {content.runtime && (
                <motion.div 
                  variants={scaleUp}
                  className="flex items-center text-xs md:text-sm text-gray-200 bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full"
                >
                  <Clock size={14} className="mr-1 md:size-4" />
                  {formatRuntime(content.runtime)}
                </motion.div>
              )}
              <motion.div 
                variants={scaleUp}
                className="flex items-center text-xs md:text-sm text-gray-200 bg-white/10 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full"
                >
                <Star size={14} className="text-yellow-400 mr-1 md:size-4" />
                {content.rating || 'N/A'}
              </motion.div>
              <motion.span 
                variants={scaleUp}
                className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs md:text-sm rounded-full"
              >
                {content.type}
              </motion.span>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              className="flex gap-2 md:gap-4"
            >
              <motion.button 
                variants={scaleUp}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(192, 38, 211, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg transition-all duration-300 flex items-center touch-manipulation text-sm md:text-base"
              >
                <Play size={18} className="mr-1 md:mr-2 md:size-5" />
                Watch Trailer
              </motion.button>
              
              <motion.button 
                variants={scaleUp}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-lg transition-all duration-300 touch-manipulation"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <motion.div
                  animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart 
                    size={20} 
                    className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'} md:size-6`} 
                  />
                </motion.div>
              </motion.button>
              
              <motion.button 
                variants={scaleUp}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={shareContent}
                className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-lg transition-all duration-300 relative touch-manipulation"
                aria-label="Share content"
              >
                <Share size={20} className="text-white md:size-6" />
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md"
                    >
                      Copied!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Content Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-4 md:p-6 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6 md:mb-8"
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
                <motion.span 
                  initial={{ backgroundSize: "0% 100%" }}
                  animate={{ backgroundSize: "100% 100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent bg-no-repeat bg-[length:0%_100%]"
                >
                  Description
                </motion.span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                {content.description}
              </p>
            </motion.div>

            {content.genres && content.genres.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6 md:mb-8"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                  <motion.span 
                    initial={{ backgroundSize: "0% 100%" }}
                    animate={{ backgroundSize: "100% 100%" }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                    className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent bg-no-repeat bg-[length:0%_100%]"
                  >
                    Genres
                  </motion.span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {content.genres.map((genre, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + (index * 0.1) }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-100 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer"
                    >
                      {genre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {content.cast && content.cast.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-6 md:mb-8"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                  <motion.span 
                    initial={{ backgroundSize: "0% 100%" }}
                    animate={{ backgroundSize: "100% 100%" }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
                    className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent bg-no-repeat bg-[length:0%_100%]"
                  >
                    Cast
                  </motion.span>
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {content.cast.map((actor, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + (index * 0.1) }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-800 dark:text-blue-100 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer"
                    >
                      {actor}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {content.availability && content.availability.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                  <motion.span 
                    initial={{ backgroundSize: "0% 100%" }}
                    animate={{ backgroundSize: "100% 100%" }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
                    className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent bg-no-repeat bg-[length:0%_100%]"
                  >
                    Download Options
                  </motion.span>
                </h2>
                <div className="space-y-3 md:space-y-4">
                  {content.availability.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + (index * 0.1) }}
                      whileHover={{ y: -3 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 transition-all duration-300 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:border-violet-300 dark:hover:border-violet-500 hover:shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">{option.label}</h3>
                          <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2 gap-2">
                            {option.sourceType === 'TelegramBot' && 
                              <div className="flex items-center bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
                                <Globe size={12} className="mr-1 text-blue-600 dark:text-blue-300 md:size-3.5" />
                                <span className="text-blue-600 dark:text-blue-300">Telegram</span>
                              </div>
                            }
                            {option.sourceType === 'SelfHosted' && 
                              <div className="flex items-center bg-green-100 dark:bg-green-900 px-2 py-1 rounded-md">
                                <HardDrive size={12} className="mr-1 text-green-600 dark:text-green-300 md:size-3.5" />
                                <span className="text-green-600 dark:text-green-300">Self-Hosted</span>
                              </div>
                            }
                            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">{option.language}</span>
                            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-md">
                              {option.quality || 'Unknown quality'}
                            </span>
                            {option.size && (
                              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-md">
                                {option.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-violet-500/30 text-sm md:text-base mt-3 md:mt-0 touch-manipulation w-full md:w-auto justify-center"
                        >
                          <Download size={16} className="mr-1 md:mr-2 md:size-4" />
                          Download
                        </motion.a>
                      </div>
                      {option.licenseNote && (
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-3 p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {option.licenseNote}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  ); 
};

export default ContentPage;