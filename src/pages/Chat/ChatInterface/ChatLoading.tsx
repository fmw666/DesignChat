/**
 * @file ChatLoading.tsx
 * @description ChatLoading component, displays a loading screen while chat data is being initialized.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { SparklesIcon } from '@heroicons/react/24/solid';

// =================================================================================================
// Constants
// =================================================================================================

const ANIMATION_DURATION = '1s';

// =================================================================================================
// Component
// =================================================================================================

export const ChatLoading: FC = () => {
  // --- Hooks ---
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-gray-900">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-pulse rounded-full border-4 border-indigo-100 dark:border-indigo-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <SparklesIcon 
            className="h-6 w-6 animate-bounce transform-gpu text-indigo-600 dark:text-indigo-400" 
            style={{ animation: `bounce ${ANIMATION_DURATION} infinite` }} 
          />
        </div>
      </div>

      <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">
        {t('chat.loading.title')}
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('chat.loading.subtitle')}
      </p>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ChatLoading;
