// src/components/Common/ContentCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Eye, Bookmark, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContentCard = ({ content, viewMode = 'grid', isInSlider = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [popupSide, setPopupSide] = useState('right'); // 'right' or 'left'
  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const posterUrl = content?.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image';

  // Calculate rating percentage for circular progress bar
  const ratingPercentage = content?.rating ? (content.rating / 10) * 100 : 0;

  const handleCardClick = () => {
    navigate(`/content/${content?._id || ''}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      
      // Calculate position for the popup to ensure it stays within viewport
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Determine which side to show the popup on
        const cardCenterX = rect.left + (rect.width / 2);
        const shouldShowOnRight = cardCenterX < viewportWidth / 2;
        setPopupSide(shouldShowOnRight ? 'right' : 'left');
        
        let left, top;
        
        if (shouldShowOnRight) {
          // Position to the right of the card
          left = rect.right + 10;
          // Adjust if popup would go off the right edge of the screen
          if (left + 240 > viewportWidth) {
            left = viewportWidth - 250; // 240px width + some padding
          }
        } else {
          // Position to the left of the card
          left = rect.left - 240 - 10;
          // Adjust if popup would go off the left edge of the screen
          if (left < 10) {
            left = 10;
          }
        }
        
        // Center vertically relative to the card
        top = rect.top + (rect.height / 2) - 90; // 180px height / 2
        
        // Adjust if popup would go off the top edge of the screen
        if (top < 10) {
          top = 10;
        }
        
        // Adjust if popup would go off the bottom edge of the screen
        if (top + 180 > window.innerHeight) {
          top = window.innerHeight - 190;
        }
        
        setPopupPosition({ top, left });
      }
    }
  };

  const handleMouseLeave = (e) => {
    // Check if mouse is leaving to the popup
    if (popupRef.current && popupRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  const handlePopupMouseLeave = () => {
    setIsHovered(false);
  };

  // List View Layout (Compact)
  if (viewMode === 'list') {
    return (
      <motion.div 
        className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group cursor-pointer h-28 md:h-24 transition-all duration-200 hover:shadow-md"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onClick={handleCardClick}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {/* Image - Made smaller */}
        <div className="w-20 md:w-16 flex-shrink-0 relative">
          <img
            src={posterUrl}
            alt={content?.title || 'No Title'}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="p-3 flex-1 flex flex-col justify-between overflow-hidden">
          <div className="overflow-hidden">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
              {content?.title || 'Untitled'}
            </h3>
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {content?.description || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(content?.genres || []).slice(0, 2).map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-xs rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              <span>{content?.releaseDate ? new Date(content.releaseDate).getFullYear() : 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Star size={12} className="text-yellow-500 mr-1 fill-current" />
              {content?.rating || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View Layout
  return (
    <>
      <motion.div 
        ref={cardRef}
        className="relative bg-transparent rounded-xl overflow-hidden group h-full flex flex-col cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {/* Card Image with Overlay Effects */}
        <div className="relative overflow-hidden aspect-[2/3] rounded-xl mx-auto w-10/12">
          <motion.img
            src={posterUrl}
            alt={content?.title || 'No Title'}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Only show date on the poster, title is moved below the poster */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {content?.releaseDate ? new Date(content.releaseDate).getFullYear() : 'N/A'}
            </div>
          </div>
          
          {/* Content Type Badge - Only show on hover for desktop */}
          <AnimatePresence>
            {isHovered && !isMobile && (
              <motion.div 
                className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm bg-opacity-90 capitalize"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {content?.type || 'Unknown'}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Rating Circle - Only show on hover for desktop */}
          <AnimatePresence>
            {isHovered && !isMobile && (
              <motion.div 
                className="absolute top-2 right-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={content?.rating >= 7 ? "#10b981" : content?.rating >= 5 ? "#eab308" : "#ef4444"}
                      strokeWidth="3"
                      strokeDasharray={`${ratingPercentage}, 100`}
                      className="transition-all duration-800 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">
                    {content?.rating ? content.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hover Action Buttons - Only show on hover for desktop */}
          <AnimatePresence>
            {isHovered && !isMobile && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button 
                  className="bg-white text-indigo-600 p-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/content/${content?._id || ''}`);
                  }}
                >
                  <Play size={16} fill="currentColor" />
                </motion.button>
                
                <motion.button 
                  className="bg-gray-800/80 text-white p-2 rounded-full shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBookmarkClick}
                >
                  <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Title - Moved below the poster */}
        <div className="p-2">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-center">
            {content?.title || 'Untitled'}
          </h3>
        </div>
      </motion.div>

      {/* Side Popup for Desktop */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            ref={popupRef}
            className="fixed z-50 bg-gray-900 rounded-lg shadow-xl overflow-hidden w-60"
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
            }}
            initial={{ opacity: 0, scale: 0.95, x: popupSide === 'right' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: popupSide === 'right' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onMouseLeave={handlePopupMouseLeave}
          >
            {/* Popup Image */}
            <div className="relative aspect-video">
              <img
                src={content?.backdropUrl || posterUrl}
                alt={content?.title || 'No Title'}
                className="w-full h-full object-cover"
              />
              
              {/* Title and Year in Popup */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm line-clamp-1">
                    {content?.title || 'Untitled'}
                  </h3>
                  <span className="bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                    {content?.releaseDate ? new Date(content.releaseDate).getFullYear() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Star size={14} className="text-yellow-500 mr-1 fill-current" />
                  <span className="text-xs font-medium text-white">
                    {content?.rating || 'N/A'}
                  </span>
                </div>
                
                {content?.runtime !== undefined && (
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock size={12} className="mr-1" />
                    <span>{formatRuntime(content.runtime)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {(content?.genres || []).slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <p className="text-xs text-gray-300 line-clamp-3">
                {content?.description || 'No description available.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Slider Component for Content Cards
export const ContentSlider = ({ title, contents, viewMode = 'grid' }) => {
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    
    const scrollAmount = isMobile 
      ? sliderRef.current.offsetWidth * 0.7 
      : sliderRef.current.offsetWidth * 0.6;
    
    const newScrollLeft = sliderRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    
    sliderRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
    
    // Update arrow visibility after a short delay to allow for smooth scrolling
    setTimeout(() => {
      if (sliderRef.current) {
        setShowLeftArrow(sliderRef.current.scrollLeft > 0);
        setShowRightArrow(
          sliderRef.current.scrollLeft < 
          sliderRef.current.scrollWidth - sliderRef.current.offsetWidth - 10
        );
      }
    }, 300);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    
    setShowLeftArrow(sliderRef.current.scrollLeft > 0);
    setShowRightArrow(
      sliderRef.current.scrollLeft < 
      sliderRef.current.scrollWidth - sliderRef.current.offsetWidth - 10
    );
  };

  // Add CSS to hide scrollbar globally
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative mb-8 w-full">
      {title && (
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-4 sm:px-6 lg:px-8">
          {title}
        </h2>
      )}
      
      <div className="relative">
        {/* Left Arrow - Only show on desktop or when needed on mobile */}
        <AnimatePresence>
          {showLeftArrow && !isMobile && (
            <motion.button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full shadow-lg hover:bg-black/90 transition-all backdrop-blur-sm"
              onClick={() => scroll('left')}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Right Arrow - Only show on desktop or when needed on mobile */}
        <AnimatePresence>
          {showRightArrow && !isMobile && (
            <motion.button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 text-white p-2 rounded-full shadow-lg hover:bg-black/90 transition-all backdrop-blur-sm"
              onClick={() => scroll('right')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Slider Content */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8"
          style={{
            scrollSnapType: isMobile ? 'x mandatory' : 'none',
            scrollPadding: '0 24px'
          }}
        >
          <div className="inline-flex space-x-4 md:space-x-6 pb-4">
            {contents.map((item, index) => (
              <div
                key={item._id || index}
                className="flex-none"
                style={{
                  width: viewMode === 'list' ? '260px' : '140px',
                  scrollSnapAlign: isMobile ? 'start' : 'none'
                }}
              >
                <ContentCard content={item} viewMode={viewMode} isInSlider={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
