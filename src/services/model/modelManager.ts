/**
 * @file modelService.ts
 * @description ModelService singleton for managing image generation models and their configuration.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { ImageModelWithDate as ImageModel, ModelGroupType, GroupConfig } from '@/config/models.types';
import { getAllModels, getGroupConfig, getAllGroupConfigs } from '@/config/modelsLoader';

// =================================================================================================
// Type Definitions
// =================================================================================================

export type { ModelGroupType, ImageModelWithDate as ImageModel, GroupConfig } from '@/config/models.types';

// =================================================================================================
// Class Definition
// =================================================================================================

export class ModelManager {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: ModelManager;
  private models: ImageModel[];

  private constructor() {
    this.models = getAllModels();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  // --------------------------------------------------------------------------------
  // Model Query Methods
  // --------------------------------------------------------------------------------

  /** 获取所有模型 */
  public getAllModels(): ImageModel[] {
    return this.models;
  }

  /** 获取指定类别的模型 */
  public getModelsByCategory(category: string): ImageModel[] {
    return this.models.filter(model => model.category === category);
  }

  /** 获取所有类别 */
  public getAllCategories(): string[] {
    return [...new Set(this.models.map(model => model.category))];
  }

  /** 根据ID获取模型 */
  public getModelById(id: string): ImageModel | undefined {
    return this.models.find(model => model.id === id);
  }

  /** 获取模型演示 */
  public getModelDemo(modelId: string) {
    const model = this.models.find(m => m.id === modelId);
    return model?.demo;
  }

  /** 获取模型配置 */
  public getModelConfig(model: ImageModel): GroupConfig {
    return getGroupConfig(model.group);
  }

  /** 获取模型配置 by modelGroup */
  public getModelConfigByGroup(group: ModelGroupType): GroupConfig {
    return getGroupConfig(group);
  }

  /** 获取所有组配置 */
  public getAllGroupConfigs(): Record<ModelGroupType, GroupConfig> {
    return getAllGroupConfigs();
  }

  /** 检查模型是否可用 */
  public isModelAvailable(modelId: string): boolean {
    const model = this.getModelById(modelId);
    if (!model) {
      return false;
    }
    
    // 检查模型组配置是否存在
    const groupConfig = this.getModelConfigByGroup(model.group);
    if (!groupConfig) {
      return false;
    }
    
    return true;
  }

  /** 检查模型组是否可用 */
  public isGroupAvailable(group: ModelGroupType): boolean {
    const groupConfig = this.getModelConfigByGroup(group);
    return !!groupConfig;
  }

  /** 获取模型状态信息 */
  public getModelStatus(modelId: string): {
    available: boolean;
    model?: ImageModel;
    groupConfig?: GroupConfig;
    error?: string;
  } {
    const model = this.getModelById(modelId);
    if (!model) {
      return {
        available: false,
        error: `模型不存在: ${modelId}`
      };
    }

    const groupConfig = this.getModelConfigByGroup(model.group);
    if (!groupConfig) {
      return {
        available: false,
        model,
        error: `模型组配置不存在: ${model.group}`
      };
    }

    return {
      available: true,
      model,
      groupConfig
    };
  }
}

// =================================================================================================
// Singleton Export
// =================================================================================================

export const modelManager = ModelManager.getInstance();
