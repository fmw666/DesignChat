/**
 * @file ProtectedRoute.tsx
 * @description Route guard for authenticated pages, with animated loading and fallback UI.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC, ReactNode } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

// --- Third-party Libraries ---
import { motion } from 'framer-motion';

// --- Internal Libraries ---
// --- Hooks ---
import { useAuth } from '@/hooks/auth';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ProtectedRouteProps {
  children: ReactNode;
}

// =================================================================================================
// Component
// =================================================================================================

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  // --- Hooks ---
  const { t } = useTranslation();
  const { user, isInitialized, isLoading } = useAuth();

  // --- Render Logic ---
  if (!isInitialized || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          {/* Loading animation */}
          <motion.div
            className="relative flex flex-col items-center gap-4 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo animation */}
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.div>
            {/* Loading text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('common.loading')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('chat.loading.subtitle')}
              </p>
            </motion.div>
            {/* Loading progress bar */}
            <motion.div
              className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ProtectedRoute;
