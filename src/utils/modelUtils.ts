/**
 * @file modelUtils.ts
 * @description Model utility functions for image model management and selection.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Internal Types
import type { ImageModel } from '@/services/model';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface SelectedModel {
  id: string;
  count: number;
  category: string;
  name: string;
}

export interface ModelsByCategory {
  [category: string]: ImageModel[];
}

export interface LatestModelsByCategory {
  [category: string]: ImageModel;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_MODEL_COUNTS = {
  '豆包': 4,
  'OpenAI': 2,
  'default': 1,
} as const;

const FALLBACK_PUBLISH_DATE = 0;

// =================================================================================================
// Utility Functions
// =================================================================================================

/**
 * Get the latest model for each category based on publish date
 * @param models - Array of all available image models
 * @returns Object mapping category names to their latest models
 */
export const getLatestModelsByCategory = (models: ImageModel[]): LatestModelsByCategory => {
  const latestModels: LatestModelsByCategory = {};
  
  // Group models by category
  const modelsByCategory = models.reduce((acc, model) => {
    const category = model.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as ModelsByCategory);

  // Get the latest model for each category (sorted by publish date)
  Object.entries(modelsByCategory).forEach(([category, categoryModels]) => {
    // Sort by publish date (newest first)
    const sortedModels = categoryModels.sort((a, b) => {
      const dateA = new Date(a.publishDate || FALLBACK_PUBLISH_DATE);
      const dateB = new Date(b.publishDate || FALLBACK_PUBLISH_DATE);
      return dateB.getTime() - dateA.getTime();
    });

    if (sortedModels.length > 0) {
      latestModels[category] = sortedModels[0];
    }
  });

  return latestModels;
};

/**
 * Get default selected models with appropriate counts for each category
 * @param models - Array of all available image models
 * @returns Array of selected models with their counts and metadata
 */
export const getDefaultSelectedModels = (models: ImageModel[]): SelectedModel[] => {
  const latestModels = getLatestModelsByCategory(models);
  
  return Object.values(latestModels).map(model => {
    const count = DEFAULT_MODEL_COUNTS[model.category as keyof typeof DEFAULT_MODEL_COUNTS] || DEFAULT_MODEL_COUNTS.default;
    
    return {
      id: model.id,
      count,
      category: model.category,
      name: model.name,
    };
  });
};
