// src/components/Common/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    id: 'telegram',
    name: 'Telegram',
    url: 'https://t.me/arcxzoneteam', // replace with your link
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    textColor: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/50',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
    hoverText: 'hover:text-blue-600 dark:hover:text-blue-300',
    glowColor: 'hover:shadow-blue-500/20',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/arcxzoneteam/', // replace with your link
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    textColor: 'text-pink-500 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-950/50',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
    hoverText: 'hover:text-pink-600 dark:hover:text-pink-300',
    glowColor: 'hover:shadow-pink-500/20',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    url: 'https://x.com/ArcXzone54782', // replace with your link
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-700',
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    hoverBorder: 'hover:border-gray-400 dark:hover:border-gray-600',
    hoverText: 'hover:text-black dark:hover:text-white',
    glowColor: 'hover:shadow-gray-500/20',
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-6">

          {/* Brand */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-500 font-medium"
          >
            Follow For Latest Upadtes
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4 flex-wrap justify-center"
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.07 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full
                  border ${link.borderColor}
                  bg-white dark:bg-gray-900
                  ${link.textColor}
                  text-sm font-medium
                  transition-all duration-200
                  shadow-sm hover:shadow-md
                  ${link.hoverBg} ${link.hoverBorder} ${link.hoverText} ${link.glowColor}
                `}
              >
                <span className="inline-flex items-center justify-center">
                  {link.icon}
                </span>
                <span className="hidden sm:inline">{link.name}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="w-16 h-px bg-gray-200 dark:bg-gray-700" />

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-gray-400 dark:text-gray-600"
          >
            © {new Date().getFullYear()} Arxzone. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;