/**
 * @file useArchivedChats.ts
 * @description Hook for managing archived chats state and operations
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

export const useArchivedChats = () => {
  const { user } = useAuth();
  const {
    unarchiveChat,
    unarchiveAllChats,
    deleteAllArchivedChats
  } = useChatStore();

  const handleUnarchiveChat = useCallback(async (chatId: string) => {
    if (!user?.id) return;
    try {
      await unarchiveChat(chatId);
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      throw error;
    }
  }, [user?.id, unarchiveChat]);

  const handleUnarchiveAllChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      await unarchiveAllChats();
    } catch (error) {
      console.error('Error unarchiving all chats:', error);
      throw error;
    }
  }, [user?.id, unarchiveAllChats]);

  const handleDeleteAllArchivedChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      await deleteAllArchivedChats();
    } catch (error) {
      console.error('Error deleting all archived chats:', error);
      throw error;
    }
  }, [user?.id, deleteAllArchivedChats]);

  return {
    handleUnarchiveChat,
    handleUnarchiveAllChats,
    handleDeleteAllArchivedChats,
  };
};
