// src/components/User/HeroSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Download, Volume2, VolumeX, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../../services/api';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [featuredContent, setFeaturedContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // pause auto-rotate on hover
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const response = await contentAPI.getAll({ limit: 10, sort: '-rating' });
        setFeaturedContent(response.data.contents);
      } catch (error) {
        console.error('Failed to fetch featured content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedContent();
  }, []);

  // Auto-rotate featured content — pauses when user hovers
  useEffect(() => {
    if (featuredContent.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [featuredContent.length, isPaused]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  }, [featuredContent.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
  }, [featuredContent.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePrev, handleNext]);

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handlePlayClick = (id) => navigate(`/content/${id}`);

  // Download navigates to the content detail page (same as original "More Info")
  const handleDownloadClick = (id) => navigate(`/content/${id}`);

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="relative h-[70vh] lg:h-[85vh] bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:via-black dark:to-black animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const currentContent = featuredContent[currentIndex];

  /* ─── Empty state ─── */
  if (!currentContent) {
    return (
      <div className="relative h-[70vh] lg:h-[85vh] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:via-black dark:to-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ArcXzone
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your gateway to unlimited entertainment
          </p>
        </div>
      </div>
    );
  }

  /* ─── Genre badges (up to 3) ─── */
  const genres = currentContent.genres?.slice(0, 3) ?? [];

  return (
    <div
      className="relative h-[70vh] lg:h-[85vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Video / Image ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${currentContent._id}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {currentContent.trailerUrl ? (
            <ReactPlayer
              url={currentContent.trailerUrl}
              playing={isPlaying}
              muted={isMuted}
              loop
              width="100%"
              height="100%"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <img
              src={currentContent.backdropUrl || currentContent.posterUrl}
              alt={currentContent.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative h-full flex items-center px-4 lg:px-12">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContent._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="space-y-5"
            >
              {/* Genre tags */}
              {genres.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs font-semibold uppercase tracking-widest text-indigo-300 border border-indigo-500/50 px-2 py-0.5 rounded"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl">
                {currentContent.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-3">
                {currentContent.rating && (
                  <div className="flex items-center bg-yellow-500/20 border border-yellow-400/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 mr-1.5 fill-current" />
                    <span className="font-bold text-yellow-300 text-sm">
                      {currentContent.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {currentContent.releaseDate && (
                  <span className="text-gray-300 text-sm">
                    {new Date(currentContent.releaseDate).getFullYear()}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider text-white">
                  {currentContent.type}
                </span>
                {currentContent.runtime && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatRuntime(currentContent.runtime)}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-base lg:text-lg text-gray-300 line-clamp-3 max-w-xl leading-relaxed">
                {currentContent.description}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Play Now */}
                <button
                  onClick={() => handlePlayClick(currentContent._id)}
                  className="flex items-center gap-2 px-7 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/30"
                >
                  <Play size={20} fill="currentColor" />
                  Play Now
                </button>

                {/* Download — redirects to content detail page */}
                <button
                  onClick={() => handleDownloadClick(currentContent._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 backdrop-blur-sm shadow-lg shadow-black/30"
                >
                  <Download size={20} />
                  Download
                </button>

                {/* Mute toggle (only when trailer is present) */}
                {currentContent.trailerUrl && (
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation dots ── */}
      {featuredContent.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredContent.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-gray-500 hover:bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Arrow navigation (desktop only, hidden until hover) ── */}
      {featuredContent.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/75 text-white rounded-full transition-all hidden lg:flex opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/75 text-white rounded-full transition-all hidden lg:flex opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* ── Progress bar (auto-rotate indicator) ── */}
      {featuredContent.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            key={currentIndex}
            className="h-full bg-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
};

export default HeroSection;