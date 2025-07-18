/**
 * @file useChatSettings.ts
 * @description Hook for managing chat settings state and operations
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useCallback } from 'react';

// --- Internal Libraries ---
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
// --- Stores ---
import { useChatStore } from '@/store/chatStore';

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useChatSettings = () => {
  const { user } = useAuth();
  const { archiveAllChats, deleteAllChats } = useChatStore();

  const handleArchiveAllChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      await archiveAllChats();
    } catch (error) {
      console.error('Error archiving all chats:', error);
      throw error;
    }
  }, [user?.id, archiveAllChats]);

  const handleDeleteAllChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      await deleteAllChats();
    } catch (error) {
      console.error('Error deleting all chats:', error);
      throw error;
    }
  }, [user?.id, deleteAllChats]);

  return {
    handleArchiveAllChats,
    handleDeleteAllChats,
  };
};
