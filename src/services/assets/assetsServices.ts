/**
 * @file assetsServices.ts
 * @description AssetsService for managing asset records and database operations, supporting pagination.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { supabase } from '@/services/api/supabase';

// =================================================================================================
// Constants
// =================================================================================================

const ASSETS_TABLE_NAME = import.meta.env.VITE_SUPABASE_ASSETS_TABLE_NAME || 'assets';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface Model {
  id: string;
  name: string;
  count: number;
}

interface ImageResult {
  id: string;
  url: string | null;
  text: string | null;
  error: string | null;
  errorMessage: string | null;
  isGenerating?: boolean;
  createdAt?: string;
  isFavorite?: boolean;
}

interface Results {
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

// 注意：除了 Asset 多了 chat_id 和 message_id 外，其他字段与 Message 的结构完全一致

export interface Asset {
  id: string;
  user_id: string;
  chat_id: string;
  message_id: string;
  models: Model[];
  content: string;
  results: Results;
  created_at: string;
  user_image: {
    url: string | null;
    alt?: string;
    referenceMessageId: string | null;
    referenceResultId: string | null;
  };
}

export interface PaginatedAssets {
  data: Asset[];
  count: number;
  page: number;
  pageSize: number;
}

// =================================================================================================
// Class Definition
// =================================================================================================

export class AssetsService {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: AssetsService;
  private constructor() {}
  public static getInstance(): AssetsService {
    if (!AssetsService.instance) {
      AssetsService.instance = new AssetsService();
    }
    return AssetsService.instance;
  }

  // --------------------------------------------------------------------------------
  // Assets public Methods
  // --------------------------------------------------------------------------------
  /** 获取 Asset 总数 */
  public getAssetCount(asset: Asset): number {
    return asset.results.status.total;
  }

  // --------------------------------------------------------------------------------
  // Assets CRUD Methods
  // --------------------------------------------------------------------------------

  /** 分页获取 assets 列表 */
  public async getAssetsList(page: number = 1, pageSize: number = 20): Promise<PaginatedAssets> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from(ASSETS_TABLE_NAME)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  /** 创建新 asset */
  public async createAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> {
    try {
      const { data, error } = await supabase
        .from(ASSETS_TABLE_NAME)
        .insert([asset])
        .select()
        .single();
      if (error) throw error;
      return data as Asset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  }

  /** 创建或更新 asset */
  public async createOrUpdateAsset(asset: Omit<Asset, 'id' | 'created_at'>): Promise<Asset> {
    try {
      // 使用 upsert 操作，基于 chat_id 和 message_id 的唯一约束
      // 这样可以避免竞态条件，确保原子性操作
      const { data, error } = await supabase
        .from(ASSETS_TABLE_NAME)
        .upsert([asset], {
          onConflict: 'chat_id,message_id', // 指定冲突检测的列
          ignoreDuplicates: false // 不忽略重复，而是更新
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Asset;
    } catch (error) {
      console.error('Error creating or updating asset:', error);
      throw error;
    }
  }

  /** 更新 asset 的 results */
  public async updateAssetResults(chatId: string, messageId: string, newResults: Results): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from(ASSETS_TABLE_NAME)
        .update({ results: newResults })
        .eq('chat_id', chatId)
        .eq('message_id', messageId)
        .select();
      
      if (error) throw error;
      
      // 如果没有找到记录，返回 null
      if (!data || data.length === 0) {
        console.warn(`No asset found for chat_id: ${chatId}, message_id: ${messageId}`);
        return null;
      }
      
      return data[0] as Asset;
    } catch (error) {
      console.error('Error updating asset results:', error);
      throw error;
    }
  }
}

// =================================================================================================
// Singleton Export
// =================================================================================================

export const assetsService = AssetsService.getInstance();
