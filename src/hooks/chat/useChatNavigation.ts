/**
 * @file useChatNavigation.ts
 * @description Hook for managing chat navigation and routing logic
 * @author fmw666@github
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chat } from '@/services/chat';

// =================================================================================================
// Types
// =================================================================================================

interface UseChatNavigationProps {
  chatId?: string;
  user: any;
  userLoading: boolean;
  userInitialized: boolean;
  chats: Chat[];
  currentChat: Chat | null;
  chatLoading: boolean;
  chatInitialized: boolean;
  isArchivedChat: boolean;
  switchChatById: (chatId: string | null) => void;
  getArchivedChatById: (chatId: string) => Promise<Chat | null>;
  switchChat: (chat: Chat | null, isArchivedChat?: boolean) => void;
}

// =================================================================================================
// Hook
// =================================================================================================

export const useChatNavigation = ({
  chatId,
  user,
  userLoading,
  userInitialized,
  chats,
  currentChat,
  chatLoading,
  chatInitialized,
  switchChatById,
  getArchivedChatById,
  switchChat,
}: UseChatNavigationProps) => {
  const navigate = useNavigate();

  // Handle user authentication redirects
  useEffect(() => {
    if (!userInitialized || userLoading) return;
    if (!user && chatId && chatId !== 'new') {
      switchChatById(null);
      navigate('/chat/new');
    }
  }, [user, chatId, userLoading, userInitialized, navigate, switchChatById]);

  // Handle chat navigation and archived chat detection
  useEffect(() => {
    if (!chatInitialized || chatLoading) return;

    const checkArchivedChat = async () => {
      if (!chatId || chatId === 'new') {
        if (currentChat) switchChatById(null);
      } else {
        if (currentChat?.id === chatId) return;
        const chatExists = chats.some(c => c.id === chatId);
        if (!chatExists) {
          // 尝试从归档的聊天中找
          const archivedChat = await getArchivedChatById(chatId);
          if (archivedChat) {
            switchChat(archivedChat, true);
            // getArchivedChatById 会自动设置 isArchivedChat 为 true
          } else {
            switchChat(null);
            navigate('/chat/new');
          }
        } else {
          // 如果聊天存在于当前列表中，说明不是归档聊天
          const chat = chats.find(c => c.id === chatId);
          if (chat) {
            switchChat(chat);
          }
        }
      }
    };

    checkArchivedChat();
  }, [chats, currentChat, chatLoading, chatInitialized, chatId, navigate, switchChatById, getArchivedChatById, switchChat]);

  // Handle beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (_: BeforeUnloadEvent) => {
      // This will be handled by the parent component
      // We'll pass the warning message here
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    navigate,
  };
};
