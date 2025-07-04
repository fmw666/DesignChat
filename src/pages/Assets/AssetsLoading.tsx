/**
 * @file AssetsLoading.tsx
 * @description Loading spinner for asset grid/image loading in asset management UI.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC } from 'react';

// 2. Third-party Libraries
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// =================================================================================================
// Type Definitions
// =================================================================================================

// No props needed for this loading component

// =================================================================================================
// Constants
// =================================================================================================

const LOADING_TEXT = '图片加载中...';

// =================================================================================================
// Component
// =================================================================================================

const AssetsLoading: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[240px] py-12 w-full" role="status" aria-live="polite">
      <ArrowPathIcon className="h-14 w-14 text-indigo-500 animate-spin mb-4" />
      <span className="text-base font-medium text-gray-500 dark:text-gray-300 select-none" aria-label={LOADING_TEXT}>
        {LOADING_TEXT}
      </span>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default AssetsLoading;
