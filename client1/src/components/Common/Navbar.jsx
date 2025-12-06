// src/components/Common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, LogOut, Film, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // ✅ Single handler so redirect works same everywhere
  const handleRequestContentClick = () => {
    navigate('/request-content');
  };

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
        
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="rgba(0,0,0,0.1)" className="dark:fill-gray-800" />
        
        {/* Main X design */}
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
        
        {/* Arc surrounding the X */}
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

  // Unique Theme Toggle Button Component
  const ThemeToggleButton = () => (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 p-1 transition-all duration-300 shadow-md"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={{
        background: isDark 
          ? "linear-gradient(to right, #4F46E5, #7C3AED)" 
          : "linear-gradient(to right, #818CF8, #A78BFA)"
      }}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white dark:bg-yellow-200 shadow-lg flex items-center justify-center"
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        animate={{
          x: isDark ? 26 : 0,
          rotate: isDark ? 360 : 0
        }}
      >
        <motion.div
          initial={false}
          animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Sun size={14} className="text-yellow-500" />
        </motion.div>
        <motion.div
          className="absolute"
          initial={false}
          animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Moon size={14} className="text-indigo-800" />
        </motion.div>
      </motion.div>
      
      {/* Background stars for dark mode */}
      <AnimatePresence>
        {isDark && (
          <>
            <motion.div
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
              style={{ top: '25%', left: '30%' }}
            />
            <motion.div
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2 }}
              style={{ top: '60%', left: '50%' }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20 
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (i) => ({ 
      y: 0, 
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      }
    })
  };

  return (
    <motion.nav 
      className={`sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-md'}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <ArcXzoneLogo />
              <motion.span 
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                whileHover={{ scale: 1.05 }}
              >
                ArcXzone
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Request Content Button (Desktop) */}
            <motion.div
              custom={0}
              variants={itemVariants}
            >
              <button
                type="button"
                onClick={handleRequestContentClick}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <Send size={16} className="mr-2" />
                Request Content
              </button>
            </motion.div>

            <motion.div
              custom={1}
              variants={itemVariants}
            >
              <ThemeToggleButton />
            </motion.div>

            {isAuthenticated && isAdmin && location.pathname !== '/admin' && (
              <motion.div
                custom={2}
                variants={itemVariants}
              >
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Admin Panel
                </Link>
              </motion.div>
            )}

            {isAuthenticated && (
              <motion.button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                custom={3}
                variants={itemVariants}
              >
                <LogOut size={20} />
              </motion.button>
            )}
          </div>

          {/* Mobile Navigation (No Menu, Proper Buttons) */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Request Content Button (Mobile with text) */}
            <button
              type="button"
              onClick={handleRequestContentClick}
              className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <Send size={16} className="mr-1.5" />
              <span>Request</span>
            </button>

            <ThemeToggleButton />

            {isAuthenticated && isAdmin && location.pathname !== '/admin' && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex items-center px-2 py-1.5 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Film size={16} className="mr-1" />
                <span>Admin</span>
              </button>
            )}

            {isAuthenticated && (
              <motion.button
                type="button"
                onClick={handleLogout}
                className="flex items-center px-2 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-500/60 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} className="mr-1" />
                <span>Sign Out</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
