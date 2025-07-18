/**
 * @file index.ts
 * @description Tests index page
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Core-related Libraries ---
import { Link } from 'react-router-dom';

// --- Third-party Libraries ---
import { motion } from 'framer-motion';

// =================================================================================================
// Constants
// =================================================================================================

const SPRING_STIFFNESS = 120;
const SPRING_DAMPING = 10;
const ANIMATION_DELAYS = {
  TITLE: 0.2,
  LINKS: 0.5,
};

// =================================================================================================
// Component
// =================================================================================================

const TestsIndex: FC = () => {
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-8 text-center">
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: SPRING_STIFFNESS,
            damping: SPRING_DAMPING,
            delay: ANIMATION_DELAYS.TITLE,
          }}
          className="mb-8 text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
        >
          Tests
        </motion.h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: SPRING_STIFFNESS,
            delay: ANIMATION_DELAYS.LINKS,
          }}
          className="space-y-6"
        >
          <Link
            to="/test/chat"
            className="block rounded-full bg-indigo-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Test Chat
          </Link>
          <Link
            to="/test/storage"
            className="block rounded-full bg-purple-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-purple-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Test Storage
          </Link>
          <Link
            to="/test/supabase"
            className="block rounded-full bg-pink-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-pink-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Test Supabase
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default TestsIndex;
