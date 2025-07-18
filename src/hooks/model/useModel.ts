/**
 * @file useModel.ts
 * @description Hook for managing model configurations state and operations.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useEffect } from 'react';

// --- Internal Libraries ---
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
// --- Stores ---
import { useModelStore } from '@/store/modelStore';

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useModel = () => {
  const { user, isInitialized: authIsInitialized } = useAuth();
  const {
    modelConfigs,
    availableModels,
    selectedCategory,
    selectedStatus,
    isLoading,
    isInitialized,
    setModelConfigs,
    setAvailableModels,
    setSelectedCategory,
    setSelectedStatus,
    initialize,
    filterModels,
    getEnabledAndTestedModels,
    generateCategoriesFromModels,
    calculateStatusCounts,
    toggleModelEnabled,
    updateModelTestStatus,
    updateModelConfigJson
  } = useModelStore();

  // --- Side Effects ---
  useEffect(() => {
    // 初始化：如果没有初始化过，则进行初始化
    if (authIsInitialized && !isInitialized) {
      initialize();
    }
  }, [authIsInitialized, isInitialized, initialize]);

  // --- Return Values ---
  return {
    // State
    modelConfigs,
    availableModels,
    selectedCategory,
    selectedStatus,
    isLoading,
    isInitialized,
    
    // Setters - 总是返回函数，即使没有用户登录
    setModelConfigs,
    setAvailableModels,
    setSelectedCategory,
    setSelectedStatus,
    
    // Operations (only available when user is logged in)
    filterModels: user ? filterModels : () => {},
    
    // Utilities
    initialize,
    getEnabledAndTestedModels,
    generateCategoriesFromModels,
    calculateStatusCounts,
    toggleModelEnabled,
    updateModelTestStatus,
    updateModelConfigJson
  };
};
