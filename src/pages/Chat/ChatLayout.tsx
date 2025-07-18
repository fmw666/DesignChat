/**
 * @file ChatLayout.tsx
 * @description ChatLayout component, provides the layout wrapper for chat pages.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { FC, ReactNode } from 'react';

// --- Internal Libraries ---
// --- Components ---
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
