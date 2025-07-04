/**
 * @file ScrollingOverlay.tsx
 * @description ScrollingOverlay component, displays a loading overlay when content is scrolling or loading.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC } from 'react';

// 2. Third-party Libraries
import { useTranslation } from 'react-i18next';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ScrollingOverlayProps {
  /** Indicates if the loading process has timed out, showing the refresh button. */
  hasTimedOut: boolean;
  /** Callback function to trigger a refresh action. */
  onRefresh: () => void;
}

// =================================================================================================
// Component
// =================================================================================================

export const ScrollingOverlay: FC<ScrollingOverlayProps> = ({ hasTimedOut, onRefresh }) => {
  // --- Hooks ---
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-200 dark:border-t-indigo-400" />
        <span className="text-sm text-gray-600 dark:text-gray-200">{t('chat.loading.loadingMessages')}</span>
        {hasTimedOut && (
          <button
            onClick={onRefresh}
            className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-200 animate-fadeIn hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('chat.loading.refresh')}
          </button>
        )}
      </div>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ScrollingOverlay;
