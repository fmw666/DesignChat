/**
 * @file useChatScroll.ts
 * @description Hook for managing chat scrolling behavior
 * @author fmw666@github
 */

import { useRef, useCallback, useEffect } from 'react';
import type { Chat } from '@/services/chat';

// =================================================================================================
// Hook
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

  const scrollMessagesToBottom = useCallback(
    (showLoading: boolean = true) => {
      if (!currentChat?.messages.length) {
        options?.setIsScrolling?.(false);
        options?.setHasLoadingTimedOut?.(false);
        return;
      }

      options?.setIsScrolling?.(true);
      options?.setIsShowLoading?.(showLoading);
      options?.setHasLoadingTimedOut?.(false);

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (options?.setHasLoadingTimedOut) {
        loadingTimeoutRef.current = setTimeout(() => options.setHasLoadingTimedOut?.(true), SCROLL_TIMEOUT);
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
        options?.setIsScrolling?.(false);
        options?.setHasLoadingTimedOut?.(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      };

      if (!hasAnyImages) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(finishScroll, 500);
        }, 100);
        return;
      }

      if (successImages.length > 0) {
        Promise.all(
          successImages.map(img => {
            if (!img.url) return Promise.resolve();
            return new Promise((resolve) => {
              const image = new Image();
              image.onload = resolve;
              image.onerror = resolve;
              image.src = img.url as string;
            });
          })
        ).then(() => {
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
    [currentChat, options]
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
