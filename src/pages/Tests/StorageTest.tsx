/**
 * @file StorageTestPage.tsx
 * @description Storage 测试页面
 * @author AI Assistant
 */

import React from 'react';
import StorageTestComponent from '@/components/tests/storage/StorageTestComponent';

const StorageTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <StorageTestComponent />
      </div>
    </div>
  );
};

export default StorageTest;
