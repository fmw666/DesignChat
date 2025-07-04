/**
 * @file useAssets.ts
 * @description Hook for managing assets state and operations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useAssetsStore } from '@/store/assetsStore';

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useAssets = () => {
  const { user } = useAuth();
  const {
    assets,
    filteredAssets,
    filteredFlatAssets,
    selectedCategory,
    selectedTags,
    isFlatMode,
    isDetailMode,
    isLoading,
    isInitialized,
    setAssets,
    setFilteredAssets,
    setFilteredFlatAssets,
    setSelectedCategory,
    setSelectedTags,
    setIsFlatMode,
    setIsDetailMode,
    setIsInitialized,
    initialize,
    refreshAssets,
    filterAssets,
    convertAssetToDisplayAsset,
    generateTagsFromAssets,
    calculateCategoryCounts
  } = useAssetsStore();

  // --- Side Effects ---
  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    } else if (!user) {
      setAssets([]);
      setFilteredAssets([]);
      setFilteredFlatAssets([]);
      setSelectedCategory('all');
      setSelectedTags([]);
      setIsFlatMode(false);
      setIsDetailMode(false);
      setIsInitialized(false);
    }
  }, [user, isInitialized, initialize, setAssets, setFilteredAssets, setFilteredFlatAssets, setSelectedCategory, setSelectedTags, setIsFlatMode, setIsDetailMode, setIsInitialized]);

  // --- Return Values ---
  return {
    // State
    assets,
    filteredAssets,
    filteredFlatAssets,
    selectedCategory,
    selectedTags,
    isFlatMode,
    isDetailMode,
    isLoading,
    isInitialized,
    
    // Setters - 总是返回函数，即使没有用户登录
    setAssets,
    setFilteredAssets,
    setFilteredFlatAssets,
    setSelectedCategory,
    setSelectedTags,
    setIsFlatMode,
    setIsDetailMode,
    
    // Operations (only available when user is logged in)
    initialize: user ? initialize : async () => {},
    refreshAssets: user ? refreshAssets : async () => {},
    filterAssets: user ? filterAssets : () => {},
    
    // Utilities
    convertAssetToDisplayAsset,
    generateTagsFromAssets,
    calculateCategoryCounts
  };
};
