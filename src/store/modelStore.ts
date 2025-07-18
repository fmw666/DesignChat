/**
 * @file modelStore.ts
 * @description Model store for managing user model configurations and filtering.
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
import { modelManager, type ImageModel } from '@/services/model/modelManager';
import { ModelConfigJson, modelConfigService, TestStatus, type ModelConfig } from '@/services/model/modelService';

// --- Relative Imports ---
import { useAuthStore } from './authStore';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface AvailableModel extends ImageModel {
  isEnabled: boolean;
  testStatus: TestStatus;
}

export interface ModelState {
  // --- State ---
  modelConfigs: ModelConfig[];
  availableModels: AvailableModel[];
  selectedCategory: string;
  selectedStatus: string;
  isLoading: boolean;
  isInitialized: boolean;

  // --- State Setters ---
  setModelConfigs: (configs: ModelConfig[] | ((prev: ModelConfig[]) => ModelConfig[])) => void;
  setAvailableModels: (models: AvailableModel[]) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;

  // --- Operations ---
  initialize: () => Promise<void>;
  filterModels: () => void;
  getEnabledAndTestedModels: () => AvailableModel[];
  generateCategoriesFromModels: (models: AvailableModel[]) => Array<{ id: string; name: string; count: number }>;
  calculateStatusCounts: (configs: ModelConfig[]) => Record<string, number>;
  updateModelConfig: (modelId: string, updatedConfig: ModelConfig) => void;
  addOrUpdateModelConfig: (config: ModelConfig) => void;
  toggleModelEnabled: (modelId: string, enabled: boolean) => Promise<void>;
  updateModelTestStatus: (modelId: string, testStatus: TestStatus) => void;
  updateModelConfigJson: (modelId: string, updatedConfigJson: ModelConfigJson) => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_MODEL_CONFIGS: ModelConfig[] = [];
const DEFAULT_AVAILABLE_MODELS: AvailableModel[] = [];
const DEFAULT_SELECTED_CATEGORY = 'all';
const DEFAULT_SELECTED_STATUS = 'all';
const DEFAULT_IS_INITIALIZED = false;
const DEFAULT_IS_LOADING = false;

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Model store for managing user model configurations and filtering
 * Provides model config CRUD operations, filtering, and state persistence
 */
export const useModelStore = create<ModelState>((set, get) => ({
  // --- Initial State ---
  modelConfigs: DEFAULT_MODEL_CONFIGS,
  availableModels: DEFAULT_AVAILABLE_MODELS,
  selectedCategory: DEFAULT_SELECTED_CATEGORY,
  selectedStatus: DEFAULT_SELECTED_STATUS,
  isLoading: DEFAULT_IS_LOADING,
  isInitialized: DEFAULT_IS_INITIALIZED,

  // --- State Setters ---
  setModelConfigs: (configs) => {
    const newConfigs = typeof configs === 'function' ? configs(get().modelConfigs) : configs;
    set({ modelConfigs: newConfigs });
  },
  setAvailableModels: (availableModels) => set({ availableModels }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  /**
   * Update a specific model config in the store (local only, no API call)
   */
  updateModelConfig: (modelId: string, updatedConfig: ModelConfig) => {
    const { modelConfigs, filterModels } = get();
    
    // Find and update the specific config
    const updatedConfigs = modelConfigs.map(config => 
      config.model_id === modelId ? updatedConfig : config
    );
    
    // Update available models with new config
    const allModels = modelManager.getAllModels();
    const availableModels: AvailableModel[] = allModels.map(model => {
      const userConfig = updatedConfigs.find(c => c.model_id === model.id);
      return {
        ...model,
        isEnabled: userConfig?.enabled ?? false,
        testStatus: userConfig?.test_status ?? TestStatus.NOT_TESTED
      };
    });
    
    set({ availableModels, modelConfigs: updatedConfigs });
    
    // Re-apply filtering to update filtered results
    setTimeout(() => filterModels(), 0);
  },

  updateModelConfigJson: (modelId: string, updatedConfigJson: ModelConfigJson) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { modelConfigs, filterModels } = get();
    const updatedConfigs = modelConfigs.map(config => config.model_id === modelId ? { ...config, config_json: updatedConfigJson } : config);
    set({ modelConfigs: updatedConfigs });
    modelConfigService.updateModelConfigJson(user.id, modelId, updatedConfigJson);
    setTimeout(() => filterModels(), 0);
  },

  /**
   * Add or update a model config in the store (local only, no API call)
   */
  addOrUpdateModelConfig: (config: ModelConfig) => {
    const { modelConfigs, setModelConfigs, filterModels } = get();
    
    // Check if config already exists
    const existingIndex = modelConfigs.findIndex(
      existing => existing.model_id === config.model_id
    );
    
    let updatedConfigs: ModelConfig[] = [];
    
    if (existingIndex >= 0) {
      // Update existing config
      updatedConfigs = modelConfigs.map((existing, index) => 
        index === existingIndex ? config : existing
      );
    } else {
      // Add new config at the beginning
      updatedConfigs = [config, ...modelConfigs];
    }
    
    // Update configs in store (local only)
    setModelConfigs(updatedConfigs);
    
    // Update available models with new config
    const allModels = modelManager.getAllModels();
    const availableModels: AvailableModel[] = allModels.map(model => {
      const userConfig = updatedConfigs.find(c => c.model_id === model.id);
      return {
        ...model,
        isEnabled: userConfig?.enabled ?? false,
        testStatus: userConfig?.test_status ?? TestStatus.NOT_TESTED
      };
    });
    
    set({ availableModels });
    
    // Re-apply filtering to update filtered results
    setTimeout(() => filterModels(), 0);
  },

  /**
   * Toggle model enabled status (local only, no API call)
   */
  toggleModelEnabled: async (modelId: string, enabled: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { availableModels, modelConfigs, filterModels } = get();
    
    // Find existing config or create new one
    const existingConfig = modelConfigs.find(c => c.model_id === modelId);
    const updatedConfig: ModelConfig = existingConfig 
      ? { ...existingConfig, enabled }
      : {
          id: '', // Will be set by backend if needed
          user_id: null, // Will be set by backend if needed
          name: null,
          model_id: modelId,
          enabled,
          test_status: TestStatus.NOT_TESTED,
          created_at: new Date().toISOString(),
          last_tested_at: null,
          config_json: null
        };
    
    // Update or add config
    const updatedConfigs = existingConfig
      ? modelConfigs.map(config => config.model_id === modelId ? updatedConfig : config)
      : [updatedConfig, ...modelConfigs];
    
    modelConfigService.updateModelConfig(user.id, modelId, { enabled });
    
    // Update available models with new config
    availableModels.forEach(model => {
      if (model.id === modelId) {
        model.isEnabled = enabled;
      }
    });
    
    set({
      availableModels,
      modelConfigs: updatedConfigs
    });
    
    // Re-apply filtering to update filtered results
    setTimeout(() => filterModels(), 0);
  },

  /**
   * Update model test status (local only, no API call)
   */
  updateModelTestStatus: (modelId: string, testStatus: TestStatus) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { modelConfigs, filterModels } = get();
    
    // Find existing config or create new one
    const existingConfig = modelConfigs.find(c => c.model_id === modelId);
    if (!existingConfig) return;

    const updatedConfig: ModelConfig = { ...existingConfig, test_status: testStatus };
    const updatedConfigs = modelConfigs.map(config => config.model_id === modelId ? updatedConfig : config);

    // Update available models with new config
    const allModels = modelManager.getAllModels();
    const availableModels: AvailableModel[] = allModels.map(model => {
      const userConfig = updatedConfigs.find(c => c.model_id === model.id);
      return {
        ...model,
        isEnabled: userConfig?.enabled ?? false,
        testStatus: userConfig?.test_status ?? TestStatus.NOT_TESTED
      };
    });

    modelConfigService.updateModelConnectionStatus(user.id, modelId, testStatus);
    
    set({
      availableModels,
      modelConfigs: updatedConfigs
    });
    
    // Re-apply filtering to update filtered results
    setTimeout(() => filterModels(), 0);
  },

  // --- Model Operations ---
  /**
   * Initialize model store and load user's model configurations
   * 1. check if the store is already initialized or currently loading
   * 2. check if the user is logged in
   * 3. load all models
   * 4. load user's model configurations
   * 5. merge model information and configuration information
   * 6. apply initial filtering
   */
  initialize: async () => {
    if (get().isLoading) return;

    // 检查用户是否已登录
    const { user, isLoading: authIsLoading, isInitialized: authIsInitialized } = useAuthStore.getState();
    if (authIsLoading || !authIsInitialized) return;

    set(state => ({
      ...state,
      isLoading: true
    }));
    
    // 获取所有可用模型
    const allModels = modelManager.getAllModels();

    if (!user) {
      const availableModels: AvailableModel[] = allModels.map(model => ({
        ...model,
        isEnabled: false,
        testStatus: TestStatus.NOT_TESTED
      }));
      set(state => ({
        ...state,
        modelConfigs: [],
        availableModels,
        isLoading: false,
        isInitialized: true
      }));
      return;
    }

    try {
      // 获取用户的模型配置
      await modelConfigService.createDefaultModelConfigs(user.id);
      const modelConfigs = await modelConfigService.getAllModelConfigs(user.id);
      
      // 合并模型信息和配置信息
      const availableModels: AvailableModel[] = allModels.map(model => {
        const userConfig = modelConfigs.find(c => c.model_id === model.group);
        return {
          ...model,
          isEnabled: userConfig?.enabled ?? false,
          testStatus: userConfig?.test_status ?? TestStatus.NOT_TESTED
        };
      });

      set(state => ({
        ...state,
        modelConfigs,
        availableModels,
        isLoading: false,
        isInitialized: true
      }));

      // Apply initial filtering
      get().filterModels();
    } catch (error) {
      console.error('Error initializing models:', error);
      set(state => ({
        ...state,
        modelConfigs: [],
        availableModels: [],
        isLoading: false,
        isInitialized: true
      }));
    }
  },

  /**
   * Get only enabled and test-passed models
   */
  getEnabledAndTestedModels: (): AvailableModel[] => {
    const { user } = useAuthStore.getState();
    // 如果用户未登录，则返回所有模型
    if (!user) return get().availableModels;
    const { availableModels } = get();
    return availableModels.filter(model => 
      model.isEnabled && model.testStatus === TestStatus.TESTED_PASSED
    );
  },

  /**
   * Generate categories from available models
   */
  generateCategoriesFromModels: (models: AvailableModel[]) => {
    const categoryCounts: Record<string, number> = {};
    
    models.forEach(model => {
      const category = model.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        id: category,
        name: category,
        count
      }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Calculate status counts from model configurations
   */
  calculateStatusCounts: (configs: ModelConfig[]) => {
    const counts = {
      all: configs.length,
      enabled: 0,
      disabled: 0,
      tested: 0,
      notTested: 0,
      passed: 0,
      failed: 0
    };

    configs.forEach(config => {
      if (config.enabled) {
        counts.enabled++;
      } else {
        counts.disabled++;
      }

      if (config.test_status === TestStatus.NOT_TESTED || config.test_status === null) {
        counts.notTested++;
      } else {
        counts.tested++;
      }

      if (config.test_status === TestStatus.TESTED_PASSED) {
        counts.passed++;
      } else if (config.test_status === TestStatus.TESTED_FAILED) {
        counts.failed++;
      }
    });

    return counts;
  },

  /**
   * Filter models based on current category and status
   */
  filterModels: () => {
    const { availableModels, selectedCategory, selectedStatus } = get();

    let filteredModels = availableModels;

    // 根据分类过滤
    if (selectedCategory !== 'all') {
      filteredModels = filteredModels.filter(model => 
        model.category === selectedCategory
      );
    }

    // 根据状态过滤
    if (selectedStatus !== 'all') {
      filteredModels = filteredModels.filter(model => {
        switch (selectedStatus) {
          case 'enabled':
            return model.isEnabled;
          case 'disabled':
            return !model.isEnabled;
          case 'tested':
            return model.testStatus !== TestStatus.NOT_TESTED;
          case 'notTested':
            return model.testStatus === TestStatus.NOT_TESTED;
          case 'passed':
            return model.testStatus === TestStatus.TESTED_PASSED;
          case 'failed':
            return model.testStatus === TestStatus.TESTED_FAILED;
          default:
            return true;
        }
      });
    }

    set({ availableModels: filteredModels });
  },
}));
