/**
 * @file ImageLoader.tsx
 * @description Image loading component with loading state and error handling.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { motion } from 'framer-motion';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  loadingClassName?: string;
  errorClassName?: string;
  showLoadingSpinner?: boolean;
  aspectRatio?: 'square' | 'auto';
}

// =================================================================================================
// Component
// =================================================================================================

const ImageLoader: FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  loadingClassName = '',
  errorClassName = '',
  showLoadingSpinner = true,
  aspectRatio = 'auto'
}) => {
  // --- State ---
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // --- Hooks ---
  const { t } = useTranslation();

  // --- Side Effects ---
  useEffect(() => {
    if (!src) {
      setImageStatus('error');
      onError?.();
      return;
    }

    setImageStatus('loading');
    const img = new Image();
    
    img.onload = () => {
      setImageStatus('loaded');
      onLoad?.();
    };
    
    img.onerror = () => {
      setImageStatus('error');
      onError?.();
    };
    
    img.src = src;
  }, [src, onLoad, onError]);

  // --- Render Logic ---
  const renderLoadingState = () => (
    <div className={`absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${loadingClassName}`}>
      <div className="flex flex-col items-center gap-2">
        {showLoadingSpinner && (
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        )}
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          {t('common.loading')}
        </span>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${errorClassName}`}>
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">图片加载失败</p>
      </div>
    </div>
  );

  const renderImage = () => (
    <motion.img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover transition-transform duration-700 ease-out ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: imageStatus === 'loaded' ? 1 : 0 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      loading="lazy"
    />
  );

  return (
    <div className={`relative overflow-hidden ${aspectRatio === 'square' ? 'aspect-square' : ''}`}>
      {imageStatus === 'loading' && renderLoadingState()}
      {imageStatus === 'error' && renderErrorState()}
      {imageStatus === 'loaded' && renderImage()}
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ImageLoader;
