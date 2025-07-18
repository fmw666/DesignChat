/**
 * @file useChatScroll.ts
 * @description Hook for managing chat scrolling behavior
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useRef, useCallback, useEffect } from 'react';

// --- Internal Libraries ---
// --- Services ---
import type { Chat } from '@/services/chat';

// =================================================================================================
// Hook Definition
// =================================================================================================

interface UseChatScrollOptions {
  setIsScrolling?: (v: boolean) => void;
  setIsShowLoading?: (v: boolean) => void;
  setHasLoadingTimedOut?: (v: boolean) => void;
}

const SCROLL_TIMEOUT = 8000;

export const useChatScroll = (
  currentChat: Chat | null,
  options?: UseChatScrollOptions
) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const optionsRef = useRef(options);
  
  // 更新 optionsRef
  useEffect(() => {
    optionsRef.current = options;
  });

  const scrollMessagesToBottom = useCallback(
    (showLoading: boolean = true) => {
      if (!currentChat?.messages.length) {
        optionsRef.current?.setIsScrolling?.(false);
        optionsRef.current?.setHasLoadingTimedOut?.(false);
        return;
      }

      optionsRef.current?.setIsScrolling?.(true);
      optionsRef.current?.setIsShowLoading?.(showLoading);
      optionsRef.current?.setHasLoadingTimedOut?.(false);

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (optionsRef.current?.setHasLoadingTimedOut) {
        loadingTimeoutRef.current = setTimeout(() => optionsRef.current?.setHasLoadingTimedOut?.(true), SCROLL_TIMEOUT);
      }

      // 获取所有图片，包括成功、错误和生成中的
      const allImages = currentChat.messages.flatMap(msg =>
        Object.values(msg.results?.images || {}).flat()
      );
      // 过滤出有 URL 的成功图片
      const successImages = allImages.filter(img => img?.url);
      // 检查是否有任何图片（成功、错误或生成中）
      const hasAnyImages = allImages.length > 0;

      const finishScroll = () => {
        optionsRef.current?.setIsScrolling?.(false);
        optionsRef.current?.setHasLoadingTimedOut?.(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      };

      if (!hasAnyImages) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(finishScroll, 500);
        }, 100);
        return;
      }

      // 设置图片获取超时时间（如 5 秒）
      const IMAGE_LOAD_TIMEOUT = 5000;

      if (successImages.length > 0) {
        // Promise.race 超时处理
        const imageLoadPromises = successImages.map(img => {
          if (!img.url) return Promise.resolve();
          return new Promise((resolve) => {
            const image = new window.Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = img.url as string;
          });
        });

        // 超时 Promise
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, IMAGE_LOAD_TIMEOUT));

        Promise.race([
          Promise.all(imageLoadPromises),
          timeoutPromise
        ]).then(() => {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(finishScroll, 500);
          }, 100);
        });
      } else {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(finishScroll, 500);
        }, 100);
      }
    },
    [currentChat]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  return {
    messagesEndRef,
    scrollMessagesToBottom,
  };
};
