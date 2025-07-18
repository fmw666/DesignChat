/**
 * @file EmptyState.tsx
 * @description Reusable empty state component for displaying when no data is available.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Third-party Libraries ---
import { motion } from 'framer-motion';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

// =================================================================================================
// Component
// =================================================================================================

const EmptyState: FC<EmptyStateProps> = ({
  title = '暂无符合条件的素材',
  description = '请尝试调整筛选条件',
  icon,
  className = ''
}) => {
  // --- Default Icon ---
  const defaultIcon = (
    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  // --- Render Logic ---
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center h-64 text-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </motion.div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default EmptyState;
