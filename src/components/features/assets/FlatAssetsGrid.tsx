/**
 * @file FlatAssetsGrid.tsx
 * @description Flat assets grid component for displaying images in masonry layout.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useCallback, useRef } from 'react';
import type { FC } from 'react';

// --- Third-party Libraries ---
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import ImageLoader from '@/components/shared/common/ImageLoader';
// --- Store ---
import { DisplayAsset } from '@/store/assetsStore';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface FlatAssetsGridProps {
  assets: DisplayAsset[];
  filterKey: string;
  isDetailMode: boolean;
  onAssetClick: (asset: DisplayAsset) => void;
}

// =================================================================================================
// Animation Constants
// =================================================================================================

const ANIMATION_CONFIG = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94],
  staggerDelay: 0.05,
  hoverDuration: 0.3,
  tapDuration: 0.1
};

// =================================================================================================
// Component
// =================================================================================================

const FlatAssetsGrid: FC<FlatAssetsGridProps> = ({
  assets,
  filterKey,
  isDetailMode,
  onAssetClick
}) => {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Event Handlers ---
  const handleAssetClick = useCallback((asset: DisplayAsset) => {
    onAssetClick(asset);
  }, [onAssetClick]);

  // --- Animation Variants ---
  const cardVariants = {
    // 出现动画：从左边展开
    enter: {
      scaleX: 0,
      opacity: 0,
      filter: 'blur(8px)',
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
      transformOrigin: 'left'
    },
    // 正常状态
    center: {
      scaleX: 1,
      opacity: 1,
      filter: 'blur(0px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      transformOrigin: 'left'
    },
    // 消失动画：从右边折叠
    exit: {
      scaleX: 0,
      opacity: 0,
      filter: 'blur(8px)',
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
      transformOrigin: 'right'
    }
  };

  // --- Render Logic ---
  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-2 [@media(min-width:508px)_and_(max-width:639px)]:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 [@media(min-width:940px)_and_(max-width:1023px)]:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 w-full"
    >
      <AnimatePresence mode="wait">
        {assets.map((asset, index) => (
          <motion.div
            key={`${filterKey}-${asset.id}`}
            className="relative w-full"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            transition={{
              duration: ANIMATION_CONFIG.duration,
              ease: ANIMATION_CONFIG.ease,
              delay: index * ANIMATION_CONFIG.staggerDelay
            }}
            layout
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            <div
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-800 cursor-pointer transition-all duration-500 ease-out w-full"
              onClick={() => handleAssetClick(asset)}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden w-full">
                {asset.url ? (
                  <ImageLoader
                    src={asset.url}
                    alt={asset.title}
                    className="group-hover:scale-105"
                    aspectRatio="square"
                    showLoadingSpinner={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">图片加载失败</p>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Gradient Overlay */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 ease-out ${
                    isDetailMode ? 'opacity-100 group-hover:opacity-0' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDetailMode ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut'
                  }}
                />
              </div>
              
              {/* Content Overlay */}
              <motion.div 
                className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-end transition-all duration-500 ease-out ${
                  isDetailMode ? 'opacity-100 group-hover:opacity-0' : 'opacity-0 group-hover:opacity-100'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isDetailMode ? 1 : 0, 
                  y: isDetailMode ? 0 : 20 
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1 + 0.2 
                }}
              >
                <motion.div 
                  className={`transform transition-transform duration-500 ease-out ${
                    isDetailMode ? 'translate-y-0 group-hover:translate-y-2' : 'translate-y-2 group-hover:translate-y-0'
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + 0.3 
                  }}
                >
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2 drop-shadow-lg">
                    {asset.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {asset.tags.map((tag, tagIndex) => (
                      <motion.span
                        key={tag}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-white/20 backdrop-blur-md rounded-full text-white/90 border border-white/10"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.1 + 0.4 + tagIndex * 0.05 
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default FlatAssetsGrid;
