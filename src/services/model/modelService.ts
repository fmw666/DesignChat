/**
 * @file modelService.ts
 * @description ModelService for managing model configuration records and database operations.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

import { supabase } from '@/services/api/supabase';

// =================================================================================================
// Constants
// =================================================================================================

const MODEL_CONFIGS_TABLE_NAME = import.meta.env.VITE_SUPABASE_MODEL_TABLE_NAME || 'model_configs';

// =================================================================================================
// Type Definitions
// =================================================================================================

// 测试状态枚举
export enum TestStatus {
  NOT_TESTED = 0,
  TESTING = 1,
  TESTED_FAILED = 2,
  TESTED_PASSED = 3
}

// 配置JSON结构
export interface ModelConfigJson {
  api_key?: string;
  api_secret?: string;
  system_prompt?: string;
  [key: string]: any; // 允许其他配置项
}

export interface ModelConfig {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string | null;
  model_id: string | null; // 'doubao', 'tongyi', etc.
  enabled: boolean | null;
  test_status: number | null; // 0: not tested, 1: testing, 2: tested failed, 3: tested passed
  last_tested_at: string | null;
  config_json: ModelConfigJson | null; // 存储 API key, secret, system prompt 等配置
}

export interface CreateModelConfig {
  user_id: string;
  name: string;
  model_id: string;
  enabled?: boolean;
  test_status?: number;
  config_json?: ModelConfigJson;
}

export interface UpdateModelConfig {
  name?: string;
  enabled?: boolean;
  test_status?: number;
  last_tested_at?: string | null;
  config_json?: ModelConfigJson;
}

// =================================================================================================
// Class Definition
// =================================================================================================

export class ModelConfigService {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: ModelConfigService;
  private constructor() {}
  public static getInstance(): ModelConfigService {
    if (!ModelConfigService.instance) {
      ModelConfigService.instance = new ModelConfigService();
    }
    return ModelConfigService.instance;
  }

  // --------------------------------------------------------------------------------
  // Model Config public Methods
  // --------------------------------------------------------------------------------

  /** 从配置JSON中获取API密钥 */
  public getApiKey(config: ModelConfig): string | undefined {
    return config.config_json?.api_key;
  }

  /** 从配置JSON中获取API密钥 */
  public getApiSecret(config: ModelConfig): string | undefined {
    return config.config_json?.api_secret;
  }

  /** 从配置JSON中获取系统提示词 */
  public getSystemPrompt(config: ModelConfig): string | undefined {
    return config.config_json?.system_prompt;
  }

  // --------------------------------------------------------------------------------
  // Model Config CRUD Methods
  // --------------------------------------------------------------------------------

  /** 获取用户的所有模型配置 */
  public async getAllModelConfigs(userId: string): Promise<ModelConfig[]> {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');

      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching all model configs:', error);
      throw error;
    }
  }

  /** 创建或更新模型配置 */
  public async createOrUpdateModelConfig(config: CreateModelConfig): Promise<ModelConfig> {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');

      // 使用 upsert 操作，基于 user_id 和 model_id 的唯一约束
      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .upsert([config], {
          onConflict: 'user_id,model_id', // 指定冲突检测的列
          ignoreDuplicates: false // 不忽略重复，而是更新
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as ModelConfig;
    } catch (error) {
      console.error('Error creating or updating model config:', error);
      throw error;
    }
  }

  /** 更新模型配置 */
  public async updateModelConfig(
    userId: string, 
    modelId: string, 
    updates: UpdateModelConfig
  ): Promise<ModelConfig | null> {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');

      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .update(updates)
        .eq('user_id', userId)
        .eq('model_id', modelId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data as ModelConfig;
    } catch (error) {
      console.error('Error updating model config:', error);
      throw error;
    }
  }

  /** 更新模型连接状态 */
  public async updateModelConnectionStatus(
    userId: string, 
    modelId: string, 
    testStatus: TestStatus
  ): Promise<ModelConfig | null> {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');

      const updates: UpdateModelConfig = {
        test_status: testStatus,
        last_tested_at: testStatus !== TestStatus.NOT_TESTED ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .update(updates)
        .eq('user_id', userId)
        .eq('model_id', modelId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data as ModelConfig;
    } catch (error) {
      console.error('Error updating model connection status:', error);
      throw error;
    }
  }

  /** 更新模型配置JSON */
  public async updateModelConfigJson(
    userId: string,
    modelId: string,
    configJson: ModelConfigJson
  ): Promise<ModelConfig | null> {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');

      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .update({ config_json: configJson })
        .eq('user_id', userId)
        .eq('model_id', modelId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, create a new config
          const { data, error } = await supabase
            .from(MODEL_CONFIGS_TABLE_NAME)
            .insert({
              user_id: userId,
              model_id: modelId,
              name: modelId,
              enabled: false,
              test_status: TestStatus.NOT_TESTED,
              config_json: configJson
            })
            .select()
            .single();
          if (error) throw error;
          return data as ModelConfig;
        }
        throw error;
      }
      
      return data as ModelConfig;
    } catch (error) {
      console.error('Error updating model config JSON:', error);
      throw error;
    }
  }

  /** 创建默认模型配置 */
  public async createDefaultModelConfigs(userId: string): Promise<ModelConfig[]> {
    if (!supabase) throw new Error('Supabase client is not initialized');

    const defaultConfigs: CreateModelConfig[] = [
      {
        user_id: userId,
        model_id: 'doubao',
        name: '豆包',
        enabled: false,
        test_status: TestStatus.NOT_TESTED,
        config_json: {
          api_key: '',
          api_secret: '',
          system_prompt: ''
        }
      },
      {
        user_id: userId,
        model_id: 'tongyi',
        name: '通义万相',
        enabled: false,
        test_status: TestStatus.NOT_TESTED,
        config_json: {
          api_key: '',
          api_secret: '',
          system_prompt: ''
        }
      }
    ];

    try {
      const { data, error } = await supabase
        .from(MODEL_CONFIGS_TABLE_NAME)
        .upsert(defaultConfigs, {
          onConflict: 'user_id,model_id',
          ignoreDuplicates: true
        })
        .select();
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error creating default model configs:', error);
      throw error;
    }
  }
}

// =================================================================================================
// Singleton Export
// =================================================================================================

export const modelConfigService = ModelConfigService.getInstance(); 