/**
 * @file AssetsInterface.tsx
 * @description Asset management interface with grid layouts and preview modals.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useState, useCallback, useMemo } from 'react';

// 2. Third-party Libraries

// 3. Internal Components
import { ImagePreview } from '@/components/shared/common/ImagePreview';
import EmptyState from '@/components/shared/common/EmptyState';
import AssetsLoading from './AssetsLoading';
import FlatAssetsGrid from '@/components/features/assets/FlatAssetsGrid';
import CardAssetsGrid from '@/components/features/assets/CardAssetsGrid';

// 4. Internal Hooks and Types
import { useAssets } from '@/hooks/assets';
import type { Asset } from '@/services/assets';
import { DisplayAsset } from '@/store/assetsStore';

// =================================================================================================
// Component
// =================================================================================================

const AssetsInterface: FC = () => {
  // --- State and Refs ---
  const [selectedImage, setSelectedImage] = useState<{ asset: Asset; imageUrl: string; imageId: string } | null>(null);
  const [selectedFlatImage, setSelectedFlatImage] = useState<DisplayAsset | null>(null);

  // --- Hooks ---
  const {
    filteredAssets,
    filteredFlatAssets,
    selectedCategory,
    selectedTags,
    isFlatMode,
    isDetailMode,
    isLoading
  } = useAssets();

  // --- Generate unique filter key ---
  const filterKey = useMemo(() => {
    const filterData = {
      category: selectedCategory,
      tags: selectedTags.sort(),
      mode: isFlatMode ? 'flat' : 'card'
    };
    return JSON.stringify(filterData);
  }, [selectedCategory, selectedTags, isFlatMode]);

  // --- Logic and Event Handlers ---
  const handleImageClick = useCallback((asset: Asset, imageUrl: string, imageId: string) => {
    setSelectedImage({ asset, imageUrl, imageId });
  }, []);

  const handleFlatImageClick = useCallback((asset: DisplayAsset) => {
    setSelectedFlatImage(asset);
  }, []);

  const handleGoToConversation = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `/chat/${chatId}`;
    window.open(url, '_blank');
  }, []);

  // --- Render Logic ---
  if (isLoading) {
    return <AssetsLoading />;
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Enhanced Masonry Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 dark:from-gray-900 dark:to-gray-800 dark:bg-gray-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]">
        <div className="w-full">
          {isFlatMode ? (
            // 扁平化模式
            filteredFlatAssets.length === 0 ? (
              <EmptyState />
            ) : (
              <FlatAssetsGrid
                assets={filteredFlatAssets}
                filterKey={filterKey}
                isDetailMode={isDetailMode}
                onAssetClick={handleFlatImageClick}
              />
            )
          ) : (
            // 卡片模式
            filteredAssets.length === 0 ? (
              <EmptyState />
            ) : (
              <CardAssetsGrid
                assets={filteredAssets}
                filterKey={filterKey}
                onImageClick={handleImageClick}
                onGoToConversation={handleGoToConversation}
              />
            )
          )}
        </div>
      </div>
      
      {/* Image Preview Modal - Asset Mode */}
      {selectedImage && (
        <ImagePreview
          message={{
            id: selectedImage.imageId,
            content: selectedImage.asset.content,
            createdAt: selectedImage.asset.created_at,
            models: selectedImage.asset.models,
            results: selectedImage.asset.results,
          }}
          isReference={false}
          onClose={() => setSelectedImage(null)}
          alt={selectedImage.asset.content}
        />
      )}

      {/* Image Preview Modal - Flat Mode */}
      {selectedFlatImage && (
        <ImagePreview
          message={{
            id: selectedFlatImage.id,
            content: selectedFlatImage.title,
            createdAt: selectedFlatImage.createdAt,
            models: [],
            results: {
              images: {
                'gpt-4o-image': [],
              },
              status: {
                generating: 0,
                success: 0,
                failed: 0,
                total: 0,
              },
            },
          }}
          isReference={false}
          onClose={() => setSelectedFlatImage(null)}
          alt={selectedFlatImage.title}
        />
      )}
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default AssetsInterface;
