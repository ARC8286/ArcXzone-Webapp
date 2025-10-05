import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar, Clock, Star, Download, Globe, HardDrive, ArrowLeft, Flag, Zap 
} from 'lucide-react';
import { contentAPI } from '../services/api'; // Assuming this API is available
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

// Component for a single download card
const DownloadCard = ({ option, index }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + (index * 0.1), type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(124, 58, 237, 0.3)" }}
      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 transition-all duration-300 bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-gray-800 dark:to-gray-900 shadow-xl cursor-pointer"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-3">
        
        {/* Title and Metadata */}
        <div className="flex-1 space-y-2">
          <h3 className="font-extrabold text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
            {option.label}
          </h3>
          <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-600 dark:text-gray-300 gap-2">
            
            {/* Language Highlight (Prominent) */}
            <div className="flex items-center bg-indigo-100 dark:bg-indigo-900 px-3 py-1.5 rounded-full font-bold shadow-md">
              <Flag size={14} className="mr-1 text-indigo-600 dark:text-indigo-300 md:size-4" />
              <span className="text-indigo-600 dark:text-indigo-300">{option.language}</span>
            </div>

            {/* Source Type Badge */}
            {option.sourceType === 'TelegramBot' && 
              <div className="flex items-center bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full">
                <Globe size={14} className="mr-1 text-blue-600 dark:text-blue-300 md:size-4" />
                <span className="text-blue-600 dark:text-blue-300">Telegram</span>
              </div>
            }
            {option.sourceType === 'SelfHosted' && 
              <div className="flex items-center bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-full">
                <HardDrive size={14} className="mr-1 text-green-600 dark:text-green-300 md:size-4" />
                <span className="text-green-600 dark:text-green-300">Self-Hosted</span>
              </div>
            }
            
            {/* Quality and Size Badges */}
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-full font-medium">
              <Zap size={14} className="inline mr-1" />
              {option.quality || 'Unknown Quality'}
            </span>
            {option.size && (
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full font-mono">
                {option.size}
              </span>
            )}
          </div>
        </div>

        {/* Download Button */}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:from-purple-700 hover:to-indigo-700 text-sm md:text-base mt-3 md:mt-0 w-full md:w-auto justify-center whitespace-nowrap"
        >
          <Download size={18} className="mr-2 md:size-5" />
          Get Download
        </motion.a>
      </div>
      
      {/* License Note */}
      {option.licenseNote && (
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-violet-500">
          <span className="font-semibold mr-1">Category:</span> {option.licenseNote}
        </p>
      )}
    </motion.div>
  );
};


const ContentPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
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
        
      } catch (err) {
        setError('Content not found or API error.');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-900 dark:bg-black pb-12 font-sans">
      
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 group touch-manipulation shadow-lg"
        aria-label="Go back"
      >
        <ArrowLeft size={20} className="text-white group-hover:scale-110 transition-transform md:size-6" />
      </motion.button>
      
      {/* Hero Section: Purely Visual Background */}
      <div 
        className="h-[40vh] min-h-[250px] relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${content.backdropUrl || content.posterUrl})` }}
      >
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-white border-t-transparent"
              ></motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-black/50 to-black/20"></div>
        
        {/* Placeholder for content area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8"></div>
      </div>

      {/* Main Content Details Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          
          {/* Vertical Poster Column (Desktop/Tablet) - Takes up 4/12 width on large screens */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="md:col-span-4 lg:col-span-4 hidden md:block"
          >
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700/50 transform hover:scale-[1.02] transition-transform duration-300">
              <img 
                src={content.posterUrl || content.backdropUrl} 
                alt={`${content.title} Poster`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Details Column - Takes up 8/12 width on large screens to properly adjust beside poster */}
          <div className="md:col-span-12 lg:col-span-8"> 
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-6 md:p-8 lg:p-10"
            >
              
              {/* 1. Title and Metadata Section (High-Visibility) */}
              <motion.div 
                variants={slideUp}
                className="mb-8 md:mb-10 pb-4 border-b border-gray-200 dark:border-gray-700"
              >
                 {/* Mobile Poster (Visible on small screens) */}
                <div className="md:hidden mb-6 flex justify-center">
                    <div className="w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-xl border-2 border-gray-300 dark:border-gray-700">
                        <img 
                            src={content.posterUrl || content.backdropUrl} 
                            alt={`${content.title} Poster`} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                  {content.title}
                </h1>
                
                <motion.div 
                  variants={staggerChildren}
                  className="flex flex-wrap items-center gap-3 md:gap-4"
                >
                  <motion.div 
                    variants={scaleUp}
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    <Calendar size={16} className="mr-2 text-violet-500" />
                    {formatDate(content.releaseDate)}
                  </motion.div>
                  {content.runtime && (
                    <motion.div 
                      variants={scaleUp}
                      className="flex items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full font-medium"
                    >
                      <Clock size={16} className="mr-2 text-violet-500" />
                      {formatRuntime(content.runtime)}
                    </motion.div>
                  )}
                  <motion.div 
                    variants={scaleUp}
                    className="flex items-center text-sm text-gray-900 bg-yellow-400 px-3 py-1.5 rounded-full font-extrabold"
                    >
                    <Star size={16} className="text-gray-900 mr-2" />
                    {content.rating || 'N/A'}
                  </motion.div>
                  <motion.span 
                    variants={scaleUp}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm rounded-full font-bold"
                  >
                    {content.type}
                  </motion.span>
                </motion.div>
              </motion.div>

              {/* 2. Synopsis Section */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-8 md:mb-10"
              >
                <h2 className="text-2xl font-extrabold mb-4">
                  <span 
                    className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
                  >
                    Synopsis
                  </span>
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                  {content.description}
                </p>
              </motion.div>

              {/* 3. Genres Section */}
              {content.genres && content.genres.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mb-8 md:mb-10"
                >
                  <h2 className="text-2xl font-extrabold mb-4">
                    <span 
                      className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
                    >
                      Genres
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((genre, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-100 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        {genre}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. Cast Section */}
              {content.cast && content.cast.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <h2 className="text-2xl font-extrabold mb-4">
                    <span 
                      className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"
                    >
                      Starring Cast
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {content.cast.map((actor, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        {actor}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Download Options Section */}
        {content.availability && content.availability.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 md:mt-12"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 text-center">
              <span 
                className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent"
              >
                📥 Premium Download Options
              </span>
            </h2>
            <div className="space-y-4 md:space-y-6">
              {content.availability.map((option, index) => (
                <DownloadCard key={index} option={option} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  ); 
};

export default ContentPage;