// src/components/Common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSearch } from '../../contexts/SearchContext';
import { 
  Search, 
  Film, 
  Tv, 
  Play, 
  TrendingUp,
  Plus,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchPortal from './SearchPortal';

const Navbar = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { openSearch } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRequestContent = () => {
    navigate('/request-content');
  };

  // Navigation items
  const navigationItems = [
    { name: 'Movies', icon: Film, path: '/content?type=movie' },
    { name: 'TV Series', icon: Tv, path: '/content?type=webseries' },
    { name: 'Anime', icon: Play, path: '/content?type=anime' },
    { name: 'New & Popular', icon: TrendingUp, path: '/content?type=latest' },
  ];

  // Custom ArcXzone Logo Component
  const ArcXzoneLogo = () => (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width="40" height="40" viewBox="0 0 200 200" className="text-indigo-600 dark:text-indigo-400">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <circle cx="100" cy="100" r="90" fill="rgba(0,0,0,0.1)" className="dark:fill-gray-800" />
        
        <motion.path
          d="M60,60 L140,140 M140,60 L60,140"
          stroke="url(#gradient)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        <motion.path
          d="M100,30 A70,70 0 1,1 100,170 A70,70 0 1,1 100,30"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeDasharray="10,5"
          initial={{ pathLength: 0, rotate: -180 }}
          animate={{ pathLength: 1, rotate: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </svg>
    </motion.div>
  );

  // Theme Toggle Button
  const ThemeToggleButton = () => (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 p-1 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white dark:bg-yellow-200 shadow-lg flex items-center justify-center"
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        animate={{
          x: isDark ? 24 : 0,
          rotate: isDark ? 360 : 0
        }}
      >
        {isDark ? (
          <Moon size={12} className="text-indigo-800" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );

  const navVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg' 
            : 'bg-white dark:bg-gray-900'
        }`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section: Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <ArcXzoneLogo />
                <motion.span 
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                  whileHover={{ scale: 1.05 }}
                >
                  ArcXzone
                </motion.span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium relative group"
                  >
                    {item.icon && <item.icon size={16} className="inline mr-2" />}
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button - LARGER only on desktop, normal on mobile */}
              <motion.button
                onClick={openSearch}
                className="group relative flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Search"
              >
                {/* Desktop: Larger search with input field */}
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg pl-10 pr-4 py-2.5 w-64 transition-all duration-300 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 cursor-text">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Search movies, series...</span>
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <kbd className="hidden lg:inline-flex items-center border border-gray-300 dark:border-gray-600 rounded px-1.5 text-xs font-sans text-gray-500 dark:text-gray-400">⌘K</kbd>
                    </div>
                  </div>
                </div>

                {/* Mobile: Icon only */}
                <div className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Search size={20} />
                </div>
              </motion.button>

              {/* Request Content Button - Desktop only */}
              <motion.button
                onClick={handleRequestContent}
                className="hidden lg:flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-md transition-all font-medium text-sm shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} className="mr-2" />
                Request
              </motion.button>

              {/* Theme Toggle */}
              <ThemeToggleButton />

              {/* Admin Panel Button (Desktop only) */}
              {isAuthenticated && isAdmin && location.pathname !== '/admin' && (
                <Link
                  to="/admin"
                  className="hidden lg:block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  Admin
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - EXACTLY as before, unchanged */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {item.icon && <item.icon size={20} className="mr-3" />}
                    {item.name}
                  </Link>
                ))}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleRequestContent();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                  >
                    <Plus size={20} className="mr-3" />
                    Request Content
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Portal */}
      <SearchPortal />
    </>
  );
};

export default Navbar;