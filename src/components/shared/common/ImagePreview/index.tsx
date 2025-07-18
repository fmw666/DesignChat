/**
 * @file ImagePreview.tsx
 * @description ImagePreview component, provides a modal interface for viewing and interacting with images.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { XMarkIcon, DocumentDuplicateIcon, PencilSquareIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { StarIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import { ImageViewer } from '@/components/shared/common/ImageViewer';
import { Modal } from '@/components/shared/common/Modal';
// --- Hooks ---
import { useChat } from '@/hooks/chat';
// --- Services ---
import type { Message } from '@/services/chat';
// --- Utils ---
import { copyToClipboard } from '@/utils/clipboard';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ImagePreviewProps {
  message: Message;
  originalContent?: string;
  initialImageId?: string;
  isReference: boolean;
  onClose: () => void;
  alt?: string;
  onDesignClick?: (imageInfo?: { url: string; id: string; messageId: string }) => void;
}

interface ImageInfo {
  url: string;
  id: string;
  messageId: string;
  userPrompt: string;
  model: string;
  createdAt: string;
  error?: string;
  errorMessage?: string;
  isUser?: boolean;
  isFavorite?: boolean;
}

// =================================================================================================
// Constants
// =================================================================================================

const ANIMATION_DURATION = 0.25;
const MODAL_MAX_WIDTH = '6xl';

// =================================================================================================
// Component
// =================================================================================================

export const ImagePreview: FC<ImagePreviewProps> = ({
  message,
  originalContent,
  initialImageId,
  isReference,
  onClose,
  alt = 'Preview',
  onDesignClick,
}) => {
  // --- State and Refs ---
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showViewer, setShowViewer] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [isDesignLoading, setIsDesignLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // --- Hooks ---
  const { t } = useTranslation();
  const { toggleImageFavorite } = useChat();

  // --- Logic and Event Handlers ---
  const images = useMemo(() => {
    const arr: ImageInfo[] = [];
    if (isReference) {
      arr.push({
        url: message.userImage?.url || '',
        id: message.userImage?.referenceResultId || '',
        messageId: message.userImage?.referenceMessageId || '',
        userPrompt: message.content,
        model: '*reference*',
        createdAt: message.createdAt,
        isUser: true,
      });
    } else {
      Object.entries(message.results.images).forEach(([model, imgs]) => {
        imgs.forEach(img => {
        if (img.url) {
          arr.push({
            url: img.url,
            id: img.id,
            messageId: message.id,
            userPrompt: message.content,
            model,
            createdAt: img.createdAt || message.createdAt,
            error: img.error || undefined,
            errorMessage: img.errorMessage || undefined,
            isFavorite: img.isFavorite,
          });
        }})
      })
    }
    return arr;
  }, [message, isReference]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialImageId) return 0;
    const idx = images.findIndex(img => img.id === initialImageId);
    return idx >= 0 ? idx : 0;
  });

  const imageInfo = images[currentIndex];
  const isFavorite = imageInfo?.isFavorite ?? false;

  const handleCopy = useCallback(async (text: string, type: 'user' | 'ai') => {
    if (isCopyLoading) return;
    
    setIsCopyLoading(true);
    const result = await copyToClipboard(text);
    
    if (result.success) {
      toast.success(type === 'user' ? t('imagePreview.userPromptCopied') : t('imagePreview.aiPromptCopied'));
    } else {
      toast.error(t('imagePreview.copyFailed'));
    }
    
    setIsCopyLoading(false);
  }, [t, isCopyLoading]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleViewerOpen = useCallback(() => {
    setShowViewer(true);
  }, []);

  const handleViewerClose = useCallback(() => {
    setShowViewer(false);
  }, []);

  const handleFavorite = useCallback(async () => {
    if (!imageInfo || !message.id || isFavoriteLoading) return;
    
    const newFavorite = !isFavorite;
    setIsFavoriteLoading(true);
    
    try {
      await toggleImageFavorite(message.id, imageInfo.id, newFavorite);
    } catch (err) {
      toast.error(t('imagePreview.favoriteFailed'));
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [imageInfo, message.id, isFavorite, isFavoriteLoading, toggleImageFavorite, t]);

  const handleDownload = useCallback(async () => {
    if (isDownloadLoading || !imageInfo?.url) return;
    
    setIsDownloadLoading(true);
    try {
      // 创建临时 a 标签进行下载
      const link = document.createElement('a');
      link.href = imageInfo.url;
      
      // 从 URL 中提取文件名，如果没有则使用默认名称
      const urlParts = imageInfo.url.split('/');
      const fileName = urlParts[urlParts.length - 1] || `image-${imageInfo.id}.jpg`;
      
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // 添加到 DOM，触发下载，然后移除
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      toast.error(t('imagePreview.downloadFailed'));
    } finally {
      setIsDownloadLoading(false);
    }
  }, [isDownloadLoading, imageInfo, t]);

  const handleDesignClick = useCallback(async () => {
    if (isDesignLoading || !onDesignClick) return;
    
    setIsDesignLoading(true);
    try {
      await onDesignClick(imageInfo);
    } catch (err) {
      toast.error(t('imagePreview.designFailed'));
    } finally {
      setIsDesignLoading(false);
    }
  }, [isDesignLoading, onDesignClick, t, imageInfo]);

  // --- Side Effects ---
  useEffect(() => {
    setImageSize({ width: 0, height: 0 }); // 每次切换图片先重置
    if (!imageInfo?.url) return;

    const img = new window.Image();
    img.src = imageInfo.url;
    img.onload = () => {
      setImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
  }, [imageInfo?.url]);

  // --- Render Logic ---
  if (!imageInfo) return null;

  return (
    <>
      {showViewer && (
        <ImageViewer
          src={imageInfo.url}
          alt={alt}
          onClose={handleViewerClose}
        />
      )}

      <Modal
        isOpen={!!imageInfo}
        onClose={onClose}
        maxWidth={MODAL_MAX_WIDTH}
        showCloseButton={false}
        className="!p-0 !w-fit !max-w-[80vw]"
        zIndex={998}
      >
        <div className="relative flex h-fit w-full flex-col bg-white dark:bg-gray-900 md:flex-row">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/90 p-2 text-gray-600 backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Left side - Image preview */}
          <div 
            ref={containerRef}
            className="relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden bg-gray-100 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-gray-900 dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]"
            onClick={handleViewerOpen}
          >
            <img
              ref={imageRef}
              src={imageInfo.url}
              alt={alt}
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Right side - Information panel */}
          <div className="relative flex w-full flex-col border-t bg-white dark:bg-gray-900 md:h-auto md:w-80 md:border-t-0 md:border-l md:border-gray-200 lg:w-96 dark:md:border-gray-800">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-5 lg:p-6 min-w-[300px] w-[inherit]">
              {/* Thumbnail grid */}
              {images.length > 1 && (
                <div className="relative mb-2 overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-200/30 dark:bg-gray-900 dark:ring-gray-800/30">
                  <div className="h-full max-h-42 overflow-y-auto p-3 md:p-4 w-fit">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          className={`group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none md:h-18 md:w-18
                            ${idx === currentIndex
                              ? 'scale-105 border-indigo-500 shadow-lg'
                              : 'border-transparent shadow-md hover:scale-105 hover:shadow-xl'}
                          `}
                          onClick={() => handleThumbnailClick(idx)}
                          tabIndex={0}
                          aria-label={t('imagePreview.previewImage', { index: idx + 1 })}
                        >
                          {/* Index badge */}
                          <span className={`absolute left-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold
                            ${idx === currentIndex ? 'bg-indigo-600 text-white shadow' : 'border border-gray-300 bg-white/80 text-gray-700'}
                          `}>
                            {idx + 1}
                          </span>
                          <img
                            src={img.url}
                            alt={alt}
                            className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-110 group-active:scale-100"
                            draggable={false}
                          />
                          {idx === currentIndex && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                              <svg className="h-6 w-6 drop-shadow-md text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/10" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Information card */}
              <div className="relative flex flex-col overflow-y-auto rounded-xl bg-white shadow ring-1 ring-gray-200/30 dark:bg-gray-900 dark:ring-gray-800/30">
                {/* Prompts Section */}
                <div className="border-b border-gray-100 p-4 dark:border-gray-800">
                  <div className="mb-4 last:mb-0">
                    <div className="mb-2 flex items-center gap-2">
                      <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t('imagePreview.userPrompt')}</h3>
                    </div>
                    <div className="group relative">
                      <div
                        className="
                          max-h-32 overflow-y-auto rounded-2xl bg-indigo-50 px-3 py-3 md:py-2.5 text-xs font-medium text-gray-500 scrollbar-thin scrollbar-thumb-indigo-200 dark:bg-indigo-900/30 dark:text-gray-400 dark:scrollbar-thumb-indigo-800 md:text-sm
                        "
                        style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                      >
                        {imageInfo.userPrompt || t('imagePreview.noUserPrompt')}
                      </div>
                      {imageInfo.userPrompt && (
                        <motion.button
                          onClick={() => handleCopy(imageInfo.userPrompt, 'user')}
                          disabled={isCopyLoading}
                          className="absolute bottom-1.5 right-1.5 rounded-lg bg-white/50 p-1.5 text-gray-500/70 shadow-sm transition-all duration-200 hover:bg-white/90 hover:shadow-md hover:text-indigo-500 dark:bg-gray-800/50 dark:text-gray-400/70 dark:hover:bg-gray-800/90 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: isCopyLoading ? 1 : 1.05 }}
                          whileTap={{ scale: isCopyLoading ? 1 : 0.95 }}
                        >
                          {isCopyLoading ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reference Card: 单独展示用户图片 */}
                {message.userImage?.url && !isReference && (
                  <div className="border-b border-gray-100 p-4 dark:border-gray-800 flex flex-col gap-2">
                    <div className="mb-2 flex items-center gap-2">
                      <PencilSquareIcon className="h-4 w-4 text-fuchsia-500" />
                      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t('imagePreview.userUploadedImage')}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={message.userImage.url}
                        alt={message.userImage.alt || t('imagePreview.noDescription')}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-800 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{message.userImage.alt || t('imagePreview.noDescription')}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('imagePreview.created')}: {new Date(message.createdAt).toLocaleString()}</div>
                        {message.userImage.referenceMessageId && message.userImage.referenceResultId && (
                          <button
                            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                            onClick={() => {
                              // 可根据需要实现跳转引用逻辑
                              // handleJumpToReference(message.userImage.referenceMessageId!, message.userImage.referenceResultId!)
                            }}
                          >
                            <ArrowPathIcon className="h-3.5 w-3.5" />
                            {t('chat.jumpToReference')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference Information Card: 显示被引用图片的信息 */}
                {isReference && (
                  <div className="border-b border-gray-100 p-4 dark:border-gray-800">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm">{t('imagePreview.referencedImage')}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-gradient-to-r from-amber-50/90 to-orange-50/90 p-3 ring-1 ring-amber-200/50 dark:from-amber-900/30 dark:to-orange-900/30 dark:ring-amber-800/50">
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">{t('imagePreview.originalMessage')}</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {originalContent || t('imagePreview.noOriginalMessage')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Animated information section */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={imageInfo.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: ANIMATION_DURATION }}
                  >
                    <div className="bg-gradient-to-br from-gray-50/50 to-white p-4 dark:from-gray-800/30 dark:to-gray-900/30">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.model')}</div>
                          <div className="rounded-md bg-gradient-to-r from-indigo-50/90 to-indigo-100/90 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200/50 dark:from-indigo-900/30 dark:to-indigo-800/30 dark:text-indigo-300 dark:ring-indigo-800/50">{imageInfo.model}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.created')}</div>
                          <div className="rounded-md bg-gradient-to-r from-emerald-50/90 to-emerald-100/90 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/50 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-300 dark:ring-emerald-800/50">
                            {new Date(imageInfo.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('imagePreview.aspectRatio')}</div>
                          <div className="rounded-md bg-gradient-to-r from-purple-50/90 to-purple-100/90 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-200/50 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 dark:ring-purple-800/50 min-w-[60px] flex items-center justify-center">
                            {imageSize.width && imageSize.height ? (
                              `${imageSize.width}:${imageSize.height}`
                            ) : (
                              <ArrowPathIcon className="h-4 w-4 animate-spin text-purple-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Action buttons */}
                <div className="justify-between rounded-b-xl border-t border-gray-100 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className={`flex gap-2 ${isReference ? 'w-[30%]' : 'w-[60%]'}`}>
                    {/* Download */}
                    <button
                      onClick={handleDownload}
                      disabled={isDownloadLoading}
                      className="group flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-sm font-medium text-white shadow transition-all hover:from-indigo-600 hover:to-purple-700 disabled:opacity-75 disabled:cursor-not-allowed"
                      title={t('imagePreview.download')}
                    >
                      {isDownloadLoading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      )}
                    </button>
                    {/* Favorite */}
                    {!isReference && (
                      <button
                        className={`group flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium shadow transition-all
                          ${isFavorite
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500'}
                          ${isFavoriteLoading ? 'opacity-75 cursor-not-allowed' : ''}
                        `}
                        onClick={handleFavorite}
                        disabled={isFavoriteLoading}
                        title={isFavorite ? t('imagePreview.favorited') : t('imagePreview.favorite')}
                      >
                        {isFavoriteLoading ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <StarIcon className={`h-5 w-5 ${isFavorite ? 'text-white drop-shadow-sm' : 'text-gray-400 group-hover:text-amber-500'}`} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom design button */}
            <div className="sticky bottom-0 left-0 z-10 w-full justify-items-center bg-gradient-to-t from-white/90 to-transparent p-4 pointer-events-none dark:from-gray-900/90">
              <motion.button
                onClick={handleDesignClick}
                disabled={isDesignLoading}
                className="
                  group pointer-events-auto relative flex items-center gap-2 overflow-hidden rounded-full
                  bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3 text-base font-semibold text-white shadow-md
                  transition-all duration-200 hover:from-indigo-600 hover:to-purple-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  disabled:opacity-75 disabled:cursor-not-allowed
                "
                whileHover={{ scale: isDesignLoading ? 1 : 1.03 }}
                whileTap={{ scale: isDesignLoading ? 1 : 0.97 }}
              >
                {isDesignLoading ? (
                  <ArrowPathIcon className="mr-1 h-5 w-5 animate-spin" />
                ) : (
                  <PencilSquareIcon className="mr-1 h-5 w-5" />
                )}
                {isDesignLoading ? t('imagePreview.enteringDesign') : t('chat.enterDesign')}
              </motion.button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ImagePreview;
