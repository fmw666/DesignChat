/**
 * @file chatService.ts
 * @description ChatService singleton for managing chat records, messages, and database operations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { supabase } from '@/services/api/supabase';
import { assetsService } from '@/services/assets';
import { authService } from '@/services/auth/authService';

// =================================================================================================
// Constants
// =================================================================================================

const CHAT_TABLE_NAME = import.meta.env.VITE_SUPABASE_CHAT_TABLE_NAME || 'chat_msgs';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface Model {
  id: string;
  name: string;
  count: number;
}

export interface ImageResult {
  id: string;
  url: string | null;
  text: string | null;
  error: string | null;
  errorMessage: string | null;
  isGenerating?: boolean;
  createdAt?: string;
  isFavorite?: boolean;
}

export interface Results {
  images: {
    [key: string]: ImageResult[];
  };
  status: {
    success: number;
    failed: number;
    total: number;
    generating: number;
  };
}

export interface Message {
  id: string;
  models: Model[];
  content: string;
  results: Results;
  createdAt: string;
  userImage?: {
    url: string | null;
    alt?: string;
    referenceMessageId: string | null;
    referenceResultId: string | null;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  user_id: string;
}

// =================================================================================================
// Class Definition
// =================================================================================================

export class ChatService {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: ChatService;
  private constructor() {}
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // --------------------------------------------------------------------------------
  // Chat CRUD Methods
  // --------------------------------------------------------------------------------

  /** 获取用户的所有聊天记录 */
  public async getUserChats(): Promise<Chat[]> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not found');

      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const result = data.map(chat => ({ ...chat, messages: chat.messages || [] }));
      return result;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  /** 创建新聊天 */
  public async createChat(title: string = '新对话', initialMessages: Message[] = []): Promise<Chat> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .insert([{ user_id: currentUser.id, title, messages: initialMessages }])
        .select()
        .single();
      if (error) throw error;
      return { ...data, messages: data.messages || [] };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /** 更新聊天记录 */
  public async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    try {
      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update(updates)
        .eq('id', chatId)
        .select()
        .single();
      if (error) throw error;
      return { ...data, messages: data.messages || [] };
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  /** 添加消息到聊天 */
  public async addMessage(chat: Chat, message: Message): Promise<Chat> {
    try {
      const updatedMessages = [...(chat.messages || []), message];
      const title = chat.messages?.length === 0 ? message.content.slice(0, 30) : chat.title;
      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ messages: updatedMessages, title })
        .eq('id', chat.id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, messages: data.messages || [] };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /** 删除聊天 */
  public async deleteChat(chatId: string): Promise<void> {
    try {
      // 1. 先删除相关的 assets 记录
      const { error: assetsError } = await supabase
        .from('assets')
        .delete()
        .eq('chat_id', chatId);
      
      if (assetsError) {
        console.error('Error deleting assets:', assetsError);
      }

      // 2. 再删除 chat 记录
      const { error: chatError } = await supabase
        .from(CHAT_TABLE_NAME)
        .delete()
        .eq('id', chatId);
      
      if (chatError) throw chatError;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  /** 获取单个聊天 */
  public async getChat(chatId: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('*')
        .eq('id', chatId)
        .single();
      if (error) throw error;
      return data as Chat;
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  /** 取消归档聊天 */
  public async unarchiveChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ archived: false })
        .eq('id', chatId);
      if (error) throw error;
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      throw error;
    }
  }

  /** 归档聊天 */
  public async archiveChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ archived: true })
        .eq('id', chatId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error archiving chat:', error);
      throw error;
    }
  }

  /** 批量归档所有聊天 */
  public async archiveAllChats(): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ archived: true })
        .eq('user_id', currentUser.id)
        .eq('archived', false);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error archiving all chats:', error);
      throw error;
    }
  }

  /** 批量删除所有聊天 */
  public async deleteAllChats(): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      // 1. 先删除相关的 assets 记录（只删除未归档聊天的 assets）
      const { data: chatsToDelete, error: chatsError } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('archived', false);
      
      if (chatsError) throw chatsError;
      
      if (chatsToDelete && chatsToDelete.length > 0) {
        const chatIds = chatsToDelete.map(chat => chat.id);
        const { error: assetsError } = await supabase
          .from('assets')
          .delete()
          .in('chat_id', chatIds);
        
        if (assetsError) {
          console.error('Error deleting assets:', assetsError);
        }
      }

      // 2. 再删除所有未归档的聊天记录
      const { error: chatError } = await supabase
        .from(CHAT_TABLE_NAME)
        .delete()
        .eq('user_id', currentUser.id)
        .eq('archived', false);
      
      if (chatError) throw chatError;
    } catch (error) {
      console.error('Error deleting all chats:', error);
      throw error;
    }
  }

  /** 获取已归档的聊天 */
  public async getArchivedChats(): Promise<Chat[]> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not found');
      const { data, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('archived', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(chat => ({ ...chat, messages: chat.messages || [] }));
    } catch (error) {
      console.error('Error fetching archived chats:', error);
      throw error;
    }
  }

  /**
   * 切换图片收藏状态
   * @param chatId 聊天ID
   * @param messageId 消息ID
   * @param imageId 图片ID
   * @param isFavorite 是否收藏
   */
  public async toggleImageFavorite(chatId: string, messageId: string, imageId: string, isFavorite: boolean): Promise<Chat> {
    try {
      // 获取当前 chat
      const { data: chat, error } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('*')
        .eq('id', chatId)
        .single();
      if (error || !chat) throw error || new Error('Chat not found');
      
      // 找到对应 message 并修改其 results
      const messages = (chat.messages || []).map((msg: Message) => {
        if (msg.id !== messageId) return msg;
        
        // 修改 message 下的 image results
        const newResults: Results = {
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
      
      // 找到修改后的 message 的 results
      const updatedMessage = messages.find((msg: Message) => msg.id === messageId);
      if (!updatedMessage) throw new Error('Message not found');
      
      // 只传入 results 到 assets 表
      const updatedAsset = await assetsService.updateAssetResults(chatId, messageId, updatedMessage.results);
      if (!updatedAsset) {
        console.warn(`Failed to update asset results for chat_id: ${chatId}, message_id: ${messageId}`);
      }

      // 保存整个 messages 到 CHAT_TABLE_NAME
      const { data: updated, error: updateError } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ messages })
        .eq('id', chatId)
        .select()
        .single();
      if (updateError) throw updateError;
      
      return { ...updated, messages: updated.messages || [] };
    } catch (err) {
      console.error('Error toggling image favorite:', err);
      throw err;
    }
  }

  /** 批量取消归档所有聊天 */
  public async unarchiveAllChats(): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from(CHAT_TABLE_NAME)
        .update({ archived: false })
        .eq('user_id', currentUser.id)
        .eq('archived', true);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error unarchiving all chats:', error);
      throw error;
    }
  }

  /** 批量删除所有已归档聊天 */
  public async deleteAllArchivedChats(): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      // 1. 先删除相关的 assets 记录（只删除已归档聊天的 assets）
      const { data: chatsToDelete, error: chatsError } = await supabase
        .from(CHAT_TABLE_NAME)
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('archived', true);
      
      if (chatsError) throw chatsError;
      
      if (chatsToDelete && chatsToDelete.length > 0) {
        const chatIds = chatsToDelete.map(chat => chat.id);
        const { error: assetsError } = await supabase
          .from('assets')
          .delete()
          .in('chat_id', chatIds);
        
        if (assetsError) {
          console.error('Error deleting assets:', assetsError);
        }
      }

      // 2. 再删除所有已归档的聊天记录
      const { error: chatError } = await supabase
        .from(CHAT_TABLE_NAME)
        .delete()
        .eq('user_id', currentUser.id)
        .eq('archived', true);
      
      if (chatError) throw chatError;
    } catch (error) {
      console.error('Error deleting all archived chats:', error);
      throw error;
    }
  }
}

// =================================================================================================
// Singleton Export
// =================================================================================================

export const chatService = ChatService.getInstance();
