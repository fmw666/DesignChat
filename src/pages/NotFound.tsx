/**
 * @file NotFound.tsx
 * @description NotFound component, displays a 404 error page with animated ghost and countdown redirect.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useEffect, useState, useCallback } from 'react';

// 2. Third-party Libraries
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// =================================================================================================
// Type Definitions
// =================================================================================================

// No additional types needed for this component

// =================================================================================================
// Constants
// =================================================================================================

const COUNTDOWN_INITIAL = 5;
const COUNTDOWN_INTERVAL = 1000; // 1 second
const GHOST_ANIMATION_DURATION = 2.5;
const GHOST_ANIMATION_Y_OFFSET = -15;
const SPRING_STIFFNESS = 120;
const SPRING_DAMPING = 10;
const SPRING_STIFFNESS_SECONDARY = 100;
const ANIMATION_DELAYS = {
  TITLE: 0.2,
  SUBTITLE: 0.4,
  DESCRIPTION: 0.6,
  COUNTDOWN: 0.8,
  BUTTON: 1.0,
};

// =================================================================================================
// Components
// =================================================================================================

// Cute ghost SVG component with floating animation
const CuteGhost: FC = () => (
  <motion.div
    animate={{ y: [0, GHOST_ANIMATION_Y_OFFSET, 0] }}
    transition={{ 
      duration: GHOST_ANIMATION_DURATION, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    }}
    className="mb-8 drop-shadow-lg"
  >
    <svg 
      width="120" 
      height="120" 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M10 60C10 32.3858 32.3858 10 60 10C87.6142 10 110 32.3858 110 60V100H95C95 100 90 95 85 100H70C70 100 65 95 60 100H45C45 100 40 95 35 100H20C20 100 15 95 10 100V60Z" 
        fill="url(#paint0_linear_notfound_ghost)" 
        stroke="#E5E7EB" 
        strokeWidth="2"
      />
      <circle cx="45" cy="55" r="5" fill="#4B5563"/>
      <circle cx="75" cy="55" r="5" fill="#4B5563"/>
      <path 
        d="M50 75C55 85 65 85 70 75" 
        stroke="#4B5563" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <defs>
        <linearGradient 
          id="paint0_linear_notfound_ghost" 
          x1="60" 
          y1="10" 
          x2="60" 
          y2="100" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#F9FAFB" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

// =================================================================================================
// Main Component
// =================================================================================================

const NotFound: FC = () => {
  // --- State and Refs ---
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);

  // --- Hooks ---
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- Logic and Event Handlers ---
  const handleCountdownComplete = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // --- Side Effects ---
  useEffect(() => {
    if (countdown === 0) {
      handleCountdownComplete();
      return;
    }
    
    const timer = setTimeout(() => setCountdown(c => c - 1), COUNTDOWN_INTERVAL);
    return () => clearTimeout(timer);
  }, [countdown, handleCountdownComplete]);

  // --- Render Logic ---
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-8 text-center">
        <CuteGhost />
        
        <motion.h1 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: SPRING_STIFFNESS, 
            damping: SPRING_DAMPING, 
            delay: ANIMATION_DELAYS.TITLE 
          }}
          className="mb-4 text-8xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
        >
          404
        </motion.h1>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: SPRING_STIFFNESS_SECONDARY, 
            delay: ANIMATION_DELAYS.SUBTITLE 
          }}
          className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-200"
        >
          {t('notFound.title')}
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: SPRING_STIFFNESS_SECONDARY, 
            delay: ANIMATION_DELAYS.DESCRIPTION 
          }}
          className="mb-6 text-gray-600 dark:text-gray-400"
        >
          {t('notFound.subtitle')}
        </motion.p>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: SPRING_STIFFNESS_SECONDARY, 
            delay: ANIMATION_DELAYS.COUNTDOWN 
          }}
          className="mb-8 font-medium text-indigo-600 dark:text-indigo-400"
        >
          {countdown > 0 
            ? t('notFound.countdown', { count: countdown }) 
            : t('notFound.redirecting')
          }
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: SPRING_STIFFNESS_SECONDARY, 
            delay: ANIMATION_DELAYS.BUTTON 
          }}
        >
          <Link
            to="/"
            className="rounded-full bg-indigo-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('notFound.goHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default NotFound;
