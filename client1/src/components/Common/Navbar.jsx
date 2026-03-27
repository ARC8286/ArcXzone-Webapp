// src/components/Common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Crown
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
  const [isNavigatingToFooter, setIsNavigatingToFooter] = useState(false);
  const navigationTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleRequestContent = () => {
    navigate('/request-content');
    setIsMobileMenuOpen(false);
  };

  const scrollToFooter = () => {
    // Try to find footer
    let footer = document.querySelector('footer');
    
    // If footer not found immediately, wait a bit and try again
    if (!footer) {
      const checkFooter = setInterval(() => {
        footer = document.querySelector('footer');
        if (footer) {
          clearInterval(checkFooter);
          footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
          setIsNavigatingToFooter(false);
        }
      }, 100);
      
      // Stop checking after 3 seconds
      setTimeout(() => {
        clearInterval(checkFooter);
        setIsNavigatingToFooter(false);
      }, 3000);
    } else {
      footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setIsNavigatingToFooter(false);
    }
  };

  const handleFollowUs = () => {
    setIsNavigatingToFooter(true);
    
    // Check if we're on the homepage
    if (location.pathname === '/') {
      // If on homepage, just scroll to footer
      scrollToFooter();
    } else {
      // If on any other page, navigate to homepage first
      navigate('/');
      
      // Wait for navigation and page render, then scroll to footer
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        scrollToFooter();
      }, 500);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // If already on homepage, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage
      navigate('/');
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
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
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogoClick}
    >
      <svg width="36" height="36" viewBox="0 0 200 200" className="text-indigo-600 dark:text-indigo-400">
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
      className="relative w-10 h-5 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 p-1 transition-all duration-300 flex-shrink-0"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
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
          x: isDark ? 18 : 0,
          rotate: isDark ? 360 : 0
        }}
      >
        {isDark ? (
          <Moon size={10} className="text-indigo-800" />
        ) : (
          <Sun size={10} className="text-yellow-500" />
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left Section: Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 cursor-pointer" onClick={handleLogoClick}>
              <ArcXzoneLogo />
              <motion.span 
                className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                whileHover={{ scale: 1.05 }}
              >
                ArcXzone
              </motion.span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium relative group whitespace-nowrap"
                >
                  {item.icon && <item.icon size={16} className="inline mr-2" />}
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Button */}
              <motion.button
                onClick={openSearch}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Search"
              >
                {/* Desktop: Larger search with input field */}
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 transition-all duration-300 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 cursor-text">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Search...</span>
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <kbd className="hidden lg:inline-flex items-center border border-gray-300 dark:border-gray-600 rounded px-1.5 text-xs font-sans text-gray-500 dark:text-gray-400">⌘K</kbd>
                    </div>
                  </div>
                </div>

                {/* Tablet & Mobile: Icon only */}
                <div className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Search size={20} />
                </div>
              </motion.button>

              {/* Request Button - Desktop with text */}
              <motion.button
                onClick={handleRequestContent}
                className="hidden md:flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-md transition-all font-medium text-sm shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={14} className="mr-1.5" />
                Request
              </motion.button>

              {/* Follow Us Button - Desktop with original styling but premium colors */}
              <motion.button
                onClick={handleFollowUs}
                disabled={isNavigatingToFooter}
                className="hidden md:flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md transition-all font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users size={14} className="mr-1.5" />
                Follow Us
              </motion.button>

              {/* Follow Us Button - Mobile with premium look and text (kept exactly as working) */}
              <motion.button
                onClick={handleFollowUs}
                disabled={isNavigatingToFooter}
                className="md:hidden flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-all font-medium text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Follow Us"
              >
                <Crown size={12} className="mr-1.5" />
                <span>Follow Us</span>
              </motion.button>

              {/* Theme Toggle */}
              <ThemeToggleButton />

              {/* Admin Panel Button */}
              {isAuthenticated && isAdmin && location.pathname !== '/admin' && (
                <Link
                  to="/admin"
                  className="hidden md:block px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-medium whitespace-nowrap"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Portal */}
      <SearchPortal />
    </>
  );
};

export default Navbar;