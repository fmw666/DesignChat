/**
 * @file useChatSettings.ts
 * @description Hook for managing chat settings state and operations
 * @author fmw666@github
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/auth';
import { useChatStore } from '@/store/chatStore';

// =================================================================================================
// Hook
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
  }, [user?.id]);

  const handleDeleteAllChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      await deleteAllChats();
    } catch (error) {
      console.error('Error deleting all chats:', error);
      throw error;
    }
  }, [user?.id]);

  return {
    handleArchiveAllChats,
    handleDeleteAllChats,
  };
};
