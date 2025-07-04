/**
 * @file useChat.ts
 * @description Hook for managing chat state and operations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useChatStore } from '@/store/chatStore';

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useChat = () => {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    isArchivedChat,
    isLoading,
    isInitialized,
    setChats,
    setCurrentChat,
    setIsInitialized,
    initialize,
    createNewChat,
    addMessage,
    updateMessageResults,
    toggleImageFavorite,
    switchChatById,
    switchChat,
    getArchivedChatById,
    unarchiveChat,
    archiveChat,
    archiveAllChats,
    deleteAllChats,
    unarchiveAllChats,
    deleteAllArchivedChats,
    deleteChat,
    renameChat
  } = useChatStore();

  // --- Side Effects ---
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    } else if (!user) {
      setChats([]);
      setCurrentChat(null);
      setIsInitialized(false);
    }
  }, [user, isInitialized, initialize, setChats, setCurrentChat, setIsInitialized]);

  // --- Return Values ---
  return {
    // State
    chats,
    currentChat,
    isArchivedChat,
    isLoading,
    isInitialized,
    
    // Setters
    setChats,
    setCurrentChat,
    
    // Operations (only available when user is logged in)
    initialize: user ? initialize : async () => {},
    createNewChat: user ? createNewChat : async () => null,
    addMessage: user ? addMessage : async () => null,
    updateMessageResults: user ? updateMessageResults : async () => {},
    toggleImageFavorite: user ? toggleImageFavorite : async () => {},
    switchChatById: user ? switchChatById : () => {},
    switchChat: user ? switchChat : () => {},
    getArchivedChatById: user ? getArchivedChatById : async () => null,
    unarchiveChat: user ? unarchiveChat : async () => {},
    archiveChat: user ? archiveChat : async () => {},
    archiveAllChats: user ? archiveAllChats : async () => {},
    deleteAllChats: user ? deleteAllChats : async () => {},
    deleteChat: user ? deleteChat : async () => {},
    renameChat: user ? renameChat : async () => {},
    unarchiveAllChats: user ? unarchiveAllChats : async () => {},
    deleteAllArchivedChats: user ? deleteAllArchivedChats : async () => {}
  };
};
