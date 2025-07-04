/**
 * @file ChatLayout.tsx
 * @description ChatLayout component, provides the layout wrapper for chat pages.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, ReactNode } from 'react';

// 2. Internal Components
import BaseLayout from '@/components/shared/layout/BaseLayout';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ChatLayoutProps {
  children: ReactNode;
}

// =================================================================================================
// Component
// =================================================================================================

const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  // --- Render Logic ---
  return (
    <BaseLayout type="chat">
      {children}
    </BaseLayout>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ChatLayout; 
