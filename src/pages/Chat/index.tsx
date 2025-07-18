/**
 * @file index.ts
 * @description Chat page index file
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useParams } from 'react-router-dom';

// --- Relative Imports ---
import ChatInterface from './ChatInterface';
import ChatLayout from './ChatLayout';

// =================================================================================================
// Component
// =================================================================================================

const Chat: FC = () => {
  const { chatId } = useParams();

  return (
    <ChatLayout>
      <ChatInterface chatId={ chatId as string } />
    </ChatLayout>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default Chat;
