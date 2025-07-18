/**
 * @file chatStore.ts
 * @description Chat store for managing chat conversations and messages.
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Third-party Libraries ---
import { create } from 'zustand';

// --- Internal Libraries ---
// --- Services ---
import { assetsService, type Asset } from '@/services/assets';
import { authService } from '@/services/auth/authService';
import { chatService } from '@/services/chat';
import type { Chat, Message } from '@/services/chat';
// --- Stores ---
import { useAssetsStore } from '@/store/assetsStore';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface ChatState {
  // --- State ---
  chats: Chat[];
  currentChat: Chat | null;
  isArchivedChat: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // --- State Setters ---
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  setCurrentChat: (currentChat: Chat | null) => void;
  setIsArchivedChat: (isArchivedChat: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // --- Operations ---
  initialize: () => Promise<void>;
  createNewChat: (title?: string, initialMessages?: Message[]) => Promise<Chat | null>;
  addMessage: (message: Message) => Promise<void>;
  updateMessageResults: (messageId: string, results: Message['results'], updateInDatabase?: boolean) => Promise<void>;
  toggleImageFavorite: (messageId: string, imageId: string, isFavorite: boolean) => Promise<void>;
  switchChatById: (chatId: string | null) => void;
  switchChat: (chat: Chat | null, isArchivedChat?: boolean) => void;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  getArchivedChatById: (chatId: string) => Promise<Chat | null>;
  unarchiveChat: (chatId: string) => Promise<void>;
  archiveChat: (chatId: string) => Promise<void>;
  archiveAllChats: () => Promise<void>;
  deleteAllChats: () => Promise<void>;
  unarchiveAllChats: () => Promise<void>;
  deleteAllArchivedChats: () => Promise<void>;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_CHATS: Chat[] = [];
const DEFAULT_CURRENT_CHAT: Chat | null = null;
const DEFAULT_IS_INITIALIZED = false;
const DEFAULT_IS_LOADING = false;
const DEFAULT_CHAT_TITLE = '新对话';
const DEFAULT_INITIAL_MESSAGES: Message[] = [];

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Chat store for managing chat conversations and messages
 * Provides chat CRUD operations, message management, and state persistence
 */
export const useChatStore = create<ChatState>((set, get) => ({
  // --- Initial State ---
  chats: DEFAULT_CHATS,
  currentChat: DEFAULT_CURRENT_CHAT,
  isArchivedChat: false,
  isLoading: DEFAULT_IS_LOADING,
  isInitialized: DEFAULT_IS_INITIALIZED,

  // --- State Setters ---
  setChats: (chats) => set({
    chats: typeof chats === 'function' ? chats(get().chats) : chats,
  }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setIsArchivedChat: (isArchivedChat) => set({ isArchivedChat }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  // --- Operations ---
  /**
   * Initialize chat store and load user's chats
   */
  initialize: async () => {
    const { isInitialized } = get();
    
    if (isInitialized || get().isLoading) {
      return;
    }

    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const userChats = await chatService.getUserChats();

      set(state => ({
        ...state,
        chats: userChats,
        isLoading: false,
        isInitialized: true
      }));
    } catch (error) {
      console.error('Error initializing chats:', error);
      set(state => ({
        ...state,
        chats: [],
        isLoading: false,
        isInitialized: true
      }));
    }
  },

  /**
   * Create a new chat conversation
   * @param title - Chat title (defaults to '新对话')
   * @param initialMessages - Initial messages for the chat
   * @returns Created chat object or null if failed
   */
  createNewChat: async (
    title: string = DEFAULT_CHAT_TITLE, 
    initialMessages: Message[] = DEFAULT_INITIAL_MESSAGES
  ) => {
    const { setChats, setCurrentChat } = get();
    try {
      const newChat = await chatService.createChat(title, initialMessages);
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  },

  /**
   * Add a message to the current chat
   * @param message - Message to add
   */
  addMessage: async (message: Message) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return;

    try {
      const updatedChat = await chatService.addMessage(currentChat, message);
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  /**
   * Update message results (images, etc.)
   * @param messageId - ID of the message to update
   * @param results - New results to set
   * @param updateInDatabase - Whether to persist changes to database
   */
  updateMessageResults: async (
    messageId: string, 
    results: Message['results'], 
    updateInDatabase: boolean = true
  ) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return;

    try {
      // 1. Update local state
      const updatedMessages = currentChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, results } : msg
      );

      // 2. Create updated chat object
      const updatedChat = {
        ...currentChat,
        messages: updatedMessages
      };

      // 3. Update local state
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));

      // 4. Update database if requested
      if (updateInDatabase) {
        await chatService.updateChat(currentChat.id, {
          messages: updatedMessages
        });

        const user = authService.getCurrentUserSync();
        if (!user) return;

        const message = currentChat.messages.find(msg => msg.id === messageId);
        if (!message) return;

        await assetsService.createOrUpdateAsset({
          chat_id: currentChat.id,
          message_id: messageId,
          results: results,
          user_id: user.id,
          models: message.models || [],
          content: message.content || '',
          user_image: message.userImage || null
        } as Omit<Asset, 'id' | 'created_at'>);

        // 同步更新 assetsStore
        const { addOrUpdateAsset } = useAssetsStore.getState();
        const updatedAsset: Asset = {
          id: '', // 这个值会被数据库生成，这里只是占位符
          chat_id: currentChat.id,
          message_id: messageId,
          results: results,
          user_id: user.id,
          models: message.models || [],
          content: message.content || '',
          created_at: new Date().toISOString(),
          user_image: message.userImage || {
            url: null,
            referenceMessageId: null,
            referenceResultId: null
          }
        };
        addOrUpdateAsset(updatedAsset);
      }
    } catch (error) {
      console.error('Error updating message results:', error);
    }
  },

  /**
   * Switch to a different chat
   * @param chatId - ID of the chat to switch to (null to clear current chat)
   */
  switchChatById: (chatId: string | null) => {
    const { chats, setCurrentChat, setIsArchivedChat } = get();
    if (chatId === null) {
      setCurrentChat(null);
      setIsArchivedChat(false);
    } else {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
        setIsArchivedChat(false);
      }
    }
  },

  /**
   * Switch to a different chat
   * @param chat - Chat object to switch to
   */
  switchChat: (chat: Chat | null, isArchivedChat: boolean = false) => {
    const { setCurrentChat, setIsArchivedChat } = get();
    setCurrentChat(chat);
    setIsArchivedChat(isArchivedChat);
  },

  /**
   * Delete a chat conversation
   * @param chatId - ID of the chat to delete
   */
  deleteChat: async (chatId: string) => {
    const { chats, currentChat, setChats, setCurrentChat } = get();
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Switch to another chat if current chat was deleted
      if (currentChat?.id === chatId) {
        setCurrentChat(chats.find(chat => chat.id !== chatId) || null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  },

  /**
   * Toggle image favorite status
   * @param messageId - ID of the message
   * @param imageId - ID of the image
   * @param isFavorite - New favorite status
   */
  toggleImageFavorite: async (messageId: string, imageId: string, isFavorite: boolean) => {
    const { currentChat, setCurrentChat, setChats } = get();
    if (!currentChat) return;

    try {
      // 1. Try to update database
      await chatService.toggleImageFavorite(currentChat.id, messageId, imageId, isFavorite);

      // 2. Update local state
      const updatedMessages = currentChat.messages.map(msg => {
        if (msg.id !== messageId) return msg;
        
        // Update the specific image's favorite status in results
        const newResults = {
          ...msg.results,
          images: Object.fromEntries(
            Object.entries(msg.results.images).map(([model, imgs]) => [
              model,
              imgs.map(img =>
                img.id === imageId ? { ...img, isFavorite } : img
              ),
            ])
          ),
        };
        
        return { ...msg, results: newResults };
      });

      const updatedChat = {
        ...currentChat,
        messages: updatedMessages
      };

      // 3. Update local state immediately for responsive UI
      setCurrentChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));

      // 同步更新 assetsStore
      const { addOrUpdateAsset } = useAssetsStore.getState();
      const message = currentChat.messages.find(msg => msg.id === messageId);
      if (message) {
        const user = authService.getCurrentUserSync();
        const updatedAsset: Asset = {
          id: '', // 占位符，实际 ID 会在数据库中生成
          chat_id: currentChat.id,
          message_id: messageId,
          results: message.results,
          user_id: user?.id || '',
          models: message.models || [],
          content: message.content || '',
          created_at: message.createdAt,
          user_image: message.userImage || {
            url: null,
            referenceMessageId: null,
            referenceResultId: null
          }
        };
        addOrUpdateAsset(updatedAsset);
      }
    } catch (error) {
      console.error('Error toggling image favorite:', error);
      throw error;
    }
  },

  /**
   * Get archived chat by ID
   * @param chatId - ID of the archived chat
   * @returns Archived chat object or null if not found
   */
  getArchivedChatById: async (chatId: string) => {
    const { setIsArchivedChat } = get();
    try {
      const archivedChat = await chatService.getChat(chatId);
      if (archivedChat) {
        setIsArchivedChat(true);
      }
      return archivedChat;
    } catch (error) {
      console.error('Error getting archived chat:', error);
      setIsArchivedChat(false);
      return null;
    }
  },

  unarchiveChat: async (chatId: string) => {
    const { setChats, setCurrentChat, setIsArchivedChat } = get();
    try {
      await chatService.unarchiveChat(chatId);
      // 重新加载聊天列表以包含取消归档的聊天
      const userChats = await chatService.getUserChats();
      setChats(userChats);
      // 找到取消归档的聊天并设置为当前聊天
      const unarchivedChat = userChats.find(chat => chat.id === chatId);
      if (unarchivedChat) {
        setCurrentChat(unarchivedChat);
      }
      setIsArchivedChat(false);
    } catch (error) {
      console.error('Error unarchiving chat:', error);
    }
  },

  archiveChat: async (chatId: string) => {
    const { setChats, setCurrentChat } = get();
    try {
      await chatService.archiveChat(chatId);
      // 重新加载聊天列表以移除已归档的聊天
      const userChats = await chatService.getUserChats();
      setChats(userChats);
      
      // 如果当前聊天被归档，切换到其他聊天
      const currentChat = get().currentChat;
      if (currentChat?.id === chatId) {
        if (userChats.length > 0) {
          setCurrentChat(userChats[0]);
        } else {
          setCurrentChat(null);
        }
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  },

  archiveAllChats: async () => {
    const { setChats, setCurrentChat } = get();
    try {
      await chatService.archiveAllChats();
      // 重新加载聊天列表以移除所有聊天
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Error archiving all chats:', error);
    }
  },

  deleteAllChats: async () => {
    const { setChats, setCurrentChat } = get();
    try {
      await chatService.deleteAllChats();
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Error deleting all chats:', error);
    }
  },

  unarchiveAllChats: async () => {
    const { setChats, setIsArchivedChat } = get();
    try {
      await chatService.unarchiveAllChats();
      
      // 添加小延迟确保数据库更新完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 重新加载聊天列表以包含所有聊天
      const userChats = await chatService.getUserChats();
      setChats(userChats);
      
      // 如果当前聊天被归档，切换到其他聊天
      const currentChat = get().currentChat;
      if (currentChat?.id) {
        setIsArchivedChat(false);
      }
    } catch (error) {
      console.error('Error unarchiving all chats:', error);
    }
  },

  deleteAllArchivedChats: async () => {
    const { setChats, setCurrentChat } = get();
    try {
      await chatService.deleteAllArchivedChats();
      setChats([]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Error deleting all archived chats:', error);
    }
  },

  renameChat: async (chatId: string, newTitle: string) => {
    const { chats, setChats, setCurrentChat, currentChat } = get();
    try {
      // 调用后端服务更新数据库
      const updatedChat = await chatService.updateChat(chatId, { title: newTitle });
      
      // 更新本地状态
      const updatedChats = chats.map(chat =>
        chat.id === chatId ? updatedChat : chat
      );
      setChats(updatedChats);
      
      // 如果当前聊天被重命名，也要更新当前聊天
      if (currentChat?.id === chatId) {
        setCurrentChat(updatedChat);
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw error;
    }
  }
}));
