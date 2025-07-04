/**
 * @file CardAssetsGrid.tsx
 * @description Card assets grid component for displaying assets in card layout.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useCallback } from 'react';

// 2. Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// 3. Internal Components
import ImageLoader from '@/components/shared/common/ImageLoader';

// 4. Internal Types
import type { Asset } from '@/services/assets';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface CardAssetsGridProps {
  assets: Asset[];
  filterKey: string;
  onImageClick: (asset: Asset, imageUrl: string, imageId: string) => void;
  onGoToConversation: (chatId: string, e: React.MouseEvent) => void;
}

// =================================================================================================
// Component
// =================================================================================================

const CardAssetsGrid: FC<CardAssetsGridProps> = ({
  assets,
  filterKey,
  onImageClick,
  onGoToConversation
}) => {
  // --- Hooks ---
  const { t } = useTranslation();

  // --- Event Handlers ---
  const handleImageClick = useCallback((asset: Asset, imageUrl: string, imageId: string) => {
    onImageClick(asset, imageUrl, imageId);
  }, [onImageClick]);

  const handleGoToConversation = useCallback((chatId: string, e: React.MouseEvent) => {
    onGoToConversation(chatId, e);
  }, [onGoToConversation]);

  // --- Render Logic ---
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
      <AnimatePresence mode="wait">
        {assets.map((asset, index) => {
          // 获取该 asset 中所有成功的图片
          const successImages: Array<{ url: string; id: string; modelName: string }> = [];
          if (asset.results?.images) {
            Object.entries(asset.results.images).forEach(([modelName, images]) => {
              images.forEach((image) => {
                if (image.url) {
                  successImages.push({
                    url: image.url,
                    id: image.id,
                    modelName
                  });
                }
              });
            });
          }

          return (
            <motion.div
              key={`${filterKey}-${asset.id}`}
              className="relative w-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              style={{ transformOrigin: 'left' }}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: index * 0.05
              }}
              layout
              whileHover={{ 
                y: -2,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-800 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 ease-out w-full">
                {/* Card Header - User Input and Time */}
                <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
                  {/* User Input Text */}
                  <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                    {asset.content}
                  </h3>
                  
                  {/* Time and Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(asset.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    
                    {/* Actions Row */}
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {successImages.length} 张
                      </span>
                      <motion.button
                        onClick={(e) => handleGoToConversation(asset.chat_id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 ease-out"
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                        }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        {t('assets.goToConversation')}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Card Content - Images Row */}
                <div className="p-4">
                  {successImages.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm">无成功图片</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      {successImages.map((image, imageIndex) => (
                        <motion.div
                          key={`${filterKey}-${image.id}`}
                          className="flex-shrink-0 relative aspect-square w-32 sm:w-40 overflow-hidden rounded-lg cursor-pointer group/image"
                          onClick={() => handleImageClick(asset, image.url, image.id)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            ease: [0.25, 0.46, 0.45, 0.94],
                            delay: (index * 0.05) + (imageIndex * 0.05)
                          }}
                          whileHover={{ 
                            scale: 1.03,
                            transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                          }}
                          whileTap={{ 
                            scale: 0.97,
                            transition: { duration: 0.1 }
                          }}
                        >
                          <ImageLoader
                            src={image.url}
                            alt={`${asset.content} - ${image.modelName}`}
                            className="group-hover/image:scale-105"
                            aspectRatio="square"
                            showLoadingSpinner={true}
                          />
                          {/* Image Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 ease-out" />
                          
                          {/* Model Name Badge */}
                          <div className="absolute bottom-1 left-1">
                            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium bg-black/60 rounded-full text-white/90 border border-white/10">
                              {image.modelName}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default CardAssetsGrid;
