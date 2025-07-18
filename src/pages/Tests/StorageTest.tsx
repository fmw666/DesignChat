/**
 * @file StorageTestPage.tsx
 * @description Storage 测试页面
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Internal Libraries ---
// --- Components ---
import StorageTestComponent from '@/components/tests/storage/StorageTestComponent';

// =================================================================================================
// Component
// =================================================================================================

const StorageTest: FC = () => {
  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <StorageTestComponent />
      </div>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default StorageTest;
