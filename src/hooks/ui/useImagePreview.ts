/**
 * @file useImagePreview.ts
 * @description Hook for managing image preview state and operations
 * @author fmw666@github
 */

import { useState, useCallback } from 'react';
import type { Asset } from '@/services/assets';
import type { Chat, Message } from '@/services/chat';
import type { SelectedImage, DesignImage } from '@/types/chat';

// =================================================================================================
// Types
// =================================================================================================

interface UseImagePreviewProps {
    currentChat: Chat | null;
    user: any;
  }

// =================================================================================================
// Hook
// =================================================================================================


export const useImagePreview = ({ currentChat, user }: UseImagePreviewProps) => {
  const [designImage, setDesignImage] = useState<DesignImage | null>(null);
  const [isDesignImageMenuVisible, setIsDesignImageMenuVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ asset: Asset; imageUrl: string; imageId: string } | null>(null);

  const handleDesignModeEnter = useCallback((image: SelectedImage) => {
    setDesignImage({
      url: image.url || null,
      referenceMessageId: image.messageId || null,
      referenceResultId: image.resultId || null,
    });
  }, []);

  const handleDesignModeExit = useCallback(() => {
    setDesignImage(null);
  }, []);

  const handleDesignImagePreview = useCallback(() => {
    if (!designImage?.url) return;

    // 查找包含这个图片的消息
    let targetMessage: Message | null = null;
    let targetImageId: string | null = null;
    let targetImageIndex: number = 0;

    // 首先在当前聊天中查找
    if (currentChat) {
      for (const message of currentChat.messages) {
        // 检查用户上传的图片
        if (message.userImage?.url === designImage.url) {
          targetMessage = message;
          targetImageId = message.userImage?.referenceResultId || 'user';
          targetImageIndex = 0; // 用户图片通常是第一个
          console.log('Found user image:', { targetImageId, targetImageIndex });
          break;
        }
        
        // 检查 AI 生成的图片
        let imageIndex = 0;
        for (const [modelId, results] of Object.entries(message.results.images)) {
          for (const result of results) {
            if (result.url === designImage.url) {
              targetMessage = message;
              targetImageId = result.id;
              targetImageIndex = imageIndex;
              console.log('Found AI image:', { targetImageId, targetImageIndex, modelId });
              break;
            }
            imageIndex++;
          }
          if (targetMessage) break;
        }
        if (targetMessage) break;
      }
    }

    // 如果找到了消息，显示 ImagePreview
    if (targetMessage) {
      console.log('Opening ImagePreview with:', { targetImageId, targetImageIndex });
      
      // 创建符合 Asset 接口的对象
      const asset: Asset = {
        id: targetMessage.id,
        user_id: user?.id || '',
        chat_id: currentChat?.id || '',
        message_id: targetMessage.id,
        content: targetMessage.content,
        created_at: targetMessage.createdAt,
        models: targetMessage.models,
        results: targetMessage.results,
        user_image: targetMessage.userImage || {
          url: null,
          alt: undefined,
          referenceMessageId: null,
          referenceResultId: null,
        },
      };

      // 设置选中的图片状态，这会触发 ImagePreview 显示
      setSelectedImage({
        asset,
        imageUrl: designImage.url,
        imageId: targetImageId || 'unknown',
      });
    } else {
      console.log('No matching message found, falling back to simple preview');
      // 如果没找到相关消息，显示简单的图片预览
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (isMobile) {
        if (!isDesignImageMenuVisible) {
          setIsDesignImageMenuVisible(true);
          setTimeout(() => setIsDesignImageMenuVisible(false), 2000);
        } else {
          setIsDesignImageMenuVisible(false);
        }
      }
    }
  }, [designImage, currentChat, isDesignImageMenuVisible, user]);

  const handleDesignImageClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleDesignModeExit();
    setIsDesignImageMenuVisible(false);
  }, [handleDesignModeExit]);

  const handleSelectedImageClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleEnterDesignFromPreview = useCallback((currentImageInfo?: { url: string; id: string; messageId: string }) => {
    if (selectedImage) {
      // 从 ImagePreview 进入设计模式
      // 如果提供了当前图片信息，使用它；否则使用默认的 selectedImage
      const imageUrl = currentImageInfo?.url || selectedImage.imageUrl;
      const imageId = currentImageInfo?.id || selectedImage.imageId;
      const messageId = currentImageInfo?.messageId || selectedImage.asset.message_id;
      
      console.log('Entering design mode with:', {
        currentImageInfo,
        selectedImage: {
          imageUrl: selectedImage.imageUrl,
          imageId: selectedImage.imageId,
          messageId: selectedImage.asset.message_id
        },
        final: {
          imageUrl,
          imageId,
          messageId
        }
      });
      
      setDesignImage({
        url: imageUrl,
        alt: selectedImage.asset.content,
        referenceMessageId: messageId,
        referenceResultId: imageId,
      });
      setSelectedImage(null); // 关闭 ImagePreview
    }
  }, [selectedImage]);

  const handleReferenceJump = useCallback((messageId: string, resultId: string) => {
    console.log('handleReferenceJump', messageId, resultId);
    const resultElement = document.querySelector(`[data-result-id="${resultId}"]`);
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      resultElement.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'z-10');
      setTimeout(() => {
        resultElement.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'z-10');
      }, 2000);
    }
  }, []);

  return {
    designImage,
    isDesignImageMenuVisible,
    selectedImage,
    handleDesignModeEnter,
    handleDesignModeExit,
    handleDesignImagePreview,
    handleDesignImageClose,
    handleSelectedImageClose,
    handleEnterDesignFromPreview,
    handleReferenceJump,
    setDesignImage,
  };
};
