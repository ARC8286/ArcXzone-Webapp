
  // src/components/User/CategorySection.jsx
  import React, { useState, useEffect, useRef } from 'react';
  import { Link } from 'react-router-dom';
  import { contentAPI } from '../../services/api';
  import ContentCard from '../Common/ContentCard';
  import { motion } from 'framer-motion';
  import { ChevronLeft, ChevronRight } from 'lucide-react';

  const CategorySection = () => {
    const [content, setContent] = useState({
      movie: [],
      webseries: [],
      anime: []
    });
    const [loading, setLoading] = useState(true);
    const [showArrows, setShowArrows] = useState({
      movie: { left: false, right: true },
      webseries: { left: false, right: true },
      anime: { left: false, right: true }
    });
    const containerRefs = useRef({
      movie: null,
      webseries: null,
      anime: null
    });

    useEffect(() => {
      const fetchContent = async () => {
        try {
          const [movies, webseries, anime] = await Promise.all([
            contentAPI.getAll({ type: 'movie', limit: 1200 }),
            contentAPI.getAll({ type: 'webseries', limit: 1200 }),
            contentAPI.getAll({ type: 'anime', limit: 1200   })
          ]);

          setContent({
            movie: movies.data.contents,
            webseries: webseries.data.contents,
            anime: anime.data.contents
          });
        } catch (error) {
          console.error('Error fetching content:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchContent();
    }, []);

    const checkScrollPosition = (type) => {
      const container = containerRefs.current[type];
      if (!container) return;
      
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      setShowArrows(prev => ({
        ...prev,
        [type]: {
          left: scrollLeft > 10,
          right: scrollLeft < scrollWidth - clientWidth - 10
        }
      }));
    };

    const handleScroll = (type, direction) => {
      const container = containerRefs.current[type];
      if (!container) return;
      
      const scrollAmount = container.offsetWidth * 0.8;
      const newPosition = direction === 'right' 
        ? container.scrollLeft + scrollAmount 
        : container.scrollLeft - scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    };

    const handleWheelScroll = (e, type) => {
      e.preventDefault();
      const container = containerRefs.current[type];
      if (container) {
        container.scrollLeft += e.deltaY;
        // Check scroll position after wheel scroll
        setTimeout(() => checkScrollPosition(type), 100);
      }
    };

    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full px-0 py-6 md:py-10 relative z-0">
        {[
          { type: 'movie', title: 'Movies', data: content.movie },
          { type: 'webseries', title: 'Web Series', data: content.webseries },
          { type: 'anime', title: 'Anime', data: content.anime }
        ].map((category) => (
          <motion.div 
            key={category.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16 last:mb-0"
          >
            <div className="flex justify-between items-center mb-4 md:mb-6 px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {category.title}
              </h2>
              <Link
                to={`/content?type=${category.type}`}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center text-sm md:text-base"
              >
                View All
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
            
            <div className="relative">
              {/* Left Arrow */}
              {showArrows[category.type].left && (
                <button 
                  onClick={() => handleScroll(category.type, 'left')}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-all"
                  aria-label={`Scroll ${category.type} left`}
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              {/* Right Arrow */}
              {showArrows[category.type].right && (
                <button 
                  onClick={() => handleScroll(category.type, 'right')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-all"
                  aria-label={`Scroll ${category.type} right`}
                >
                  <ChevronRight size={24} />
                </button>
              )}
              
              <div 
                ref={el => {
                  containerRefs.current[category.type] = el;
                  if (el) {
                    // Initial check for scroll position
                    setTimeout(() => checkScrollPosition(category.type), 100);
                  }
                }}
                id={`${category.type}-container`}
                className="flex overflow-x-auto pb-4 md:pb-6 scroll-smooth px-4 sm:px-6 lg:px-8 hide-scrollbar"
                onWheel={(e) => handleWheelScroll(e, category.type)}
                onScroll={() => checkScrollPosition(category.type)}
              >
                <div className="flex space-x-4 md:space-x-6 min-w-max">
                  {category.data.length > 0 ? (
                    category.data.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="w-28 sm:w-36 md:w-44 lg:w-48 flex-shrink-0"
                      >
                        <ContentCard content={item} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="w-full py-8 md:py-12 text-center text-gray-500 dark:text-gray-400">
                      No {category.type} content available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  export default CategorySection;