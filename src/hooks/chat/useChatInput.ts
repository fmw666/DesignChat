/**
 * @file useChatInput.ts
 * @description Hook for managing chat input state and message sending logic
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useRef, useCallback } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Internal Libraries ---
// --- Hooks ---
import { useModel } from '@/hooks/model';
// --- Services ---
import { modelApiManager } from '@/services/api';
import type { Chat, Message, Results } from '@/services/chat';
import { modelManager, type ImageModel } from '@/services/model';
// --- Types ---
import type { DesignImage, SelectedModel } from '@/types/chat';
// --- Utils ---
import { eventBus, EVENT_NEED_SIGN_IN } from '@/utils/eventBus';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface StreamResponse {
  role: 'assistant' | 'StreamClosed';
  status: 'streaming' | 'image';
  content: string;
}

interface UseChatInputProps {
  user: any;
  currentChat: Chat | null;
  selectedModels: SelectedModel[];
  designImage: DesignImage | null;
  onSendMessage: (message: Message) => Promise<void>;
  onUpdateMessageResults: (messageId: string, results: Results, updateInDatabase?: boolean) => Promise<void>;
  onCreateNewChat: (title: string, initialMessages: Message[]) => Promise<Chat | null> | Promise<null>;
  onNavigate: (path: string) => void;
  onSetInput: (input: string) => void;
  onSetIsGenerating: (isGenerating: boolean) => void;
  onSetIsSending: (isSending: boolean) => void;
  onScrollToBottom: (showLoading?: boolean) => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const TEXTAREA_MAX_HEIGHT = 200;
const STREAM_UPDATE_INTERVAL = 1000;
const STREAM_MAX_RETRIES = 5;

// =================================================================================================
// Hook
// =================================================================================================

export const useChatInput = ({
  user,
  currentChat,
  selectedModels,
  designImage,
  onSendMessage,
  onUpdateMessageResults,
  onCreateNewChat,
  onNavigate,
  onSetInput,
  onSetIsGenerating,
  onSetIsSending,
  onScrollToBottom,
}: UseChatInputProps) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { modelConfigs } = useModel();

  // =================================================================================================
  // Stream Processing
  // =================================================================================================

  const processStreamResponse = useCallback(async (message: Message, stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedContent = '';
    let retryCount = 0;
    let lastUpdateTime = Date.now();

    try {
      for (;;) {
        try {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let endIndex;
          while ((endIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, endIndex).trim();
            buffer = buffer.slice(endIndex + 1);

            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const response: StreamResponse = JSON.parse(jsonStr.replace(/'/g, '"'));

                if (response.role === 'assistant') {
                  if (response.status === 'streaming') {
                    accumulatedContent += response.content;
                    const now = Date.now();
                    if (now - lastUpdateTime >= STREAM_UPDATE_INTERVAL) {
                      message.results.images['gpt-4o-image'][0].text = accumulatedContent;
                      await onUpdateMessageResults(message.id, { ...message.results, images: { 'gpt-4o-image': [message.results.images['gpt-4o-image'][0] ] } }, true);
                      lastUpdateTime = now;
                    } else {
                      message.results.images['gpt-4o-image'][0].text = accumulatedContent;
                    }
                  } else if (response.status === 'image') {
                    const updatedResults = {
                      ...message.results,
                      images: {
                        'gpt-4o-image': [{
                          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          url: `https://cdn.designgpt.art/${response.content}`,
                          text: null, error: null, errorMessage: null, isGenerating: false
                        }]
                      }
                    };
                    message.results = updatedResults;
                    await onUpdateMessageResults(message.id, updatedResults, true);
                  }
                }
              } catch (e) {
                console.error('Error parsing stream data:', e, 'Line:', line);
              }
            } else if (line === 'event: close') {
              const finalContent = accumulatedContent || t('chat.generation.success');
              message.results.images['gpt-4o-image'][0].text = finalContent;
              await onUpdateMessageResults(message.id, { ...message.results, images: { 'gpt-4o-image': [message.results.images['gpt-4o-image'][0] ] } }, true);
              console.log('Stream closed normally.');
            }
          }
        } catch (error) {
          if (error instanceof TypeError && error.message === 'network error' && retryCount < STREAM_MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying network error... (${retryCount}/${STREAM_MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      const errorResults = {
        ...message.results,
        images: { 'gpt-4o-image': [{ ...message.results.images['gpt-4o-image'][0], error: '生成失败', errorMessage, isGenerating: false }] }
      };
      message.results = errorResults;
      await onUpdateMessageResults(message.id, errorResults, true);
    } finally {
      reader.releaseLock();
    }
  }, [t, onUpdateMessageResults]);

  // =================================================================================================
  // Message Sending
  // =================================================================================================

  const handleSendMessage = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      eventBus.emit(EVENT_NEED_SIGN_IN);
      return;
    }

    onSetIsSending(true);
    const currentInput = textareaRef.current?.value || '';
    const currentModels = designImage ? [{ id: 'gpt-4o-image', name: 'gpt-4o-image', count: 1 }] : selectedModels;

    try {
      const totalCount = currentModels.reduce((sum, model) => sum + model.count, 0);
      const initialResults: Results = {
        status: {
          success: 0,
          failed: 0,
          total: totalCount,
          generating: totalCount
        },
        images: designImage ? {} : currentModels.reduce((acc, model) => ({
          ...acc,
          [model.name]: Array(model.count).fill(null).map((_, index) => ({
            id: `img_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
            url: null, text: null, error: null, errorMessage: null, isGenerating: true, createdAt: null
          }))
        }), {})
      };
      
      const message: Message = {
        id: `msg_${Date.now()}`,
        content: currentInput,
        models: currentModels,
        results: initialResults,
        createdAt: new Date().toISOString(),
        userImage: designImage ? {
          url: designImage.url,
          alt: designImage.alt || 'User uploaded image',
          referenceMessageId: designImage.referenceMessageId,
          referenceResultId: designImage.referenceResultId,
        } : undefined
      };
      
      let chat: Chat | null = currentChat;
      if (!chat) {
        const title = currentInput.slice(0, 10) + (currentInput.length > 10 ? '...' : '');
        chat = await onCreateNewChat(title, [message]);
        if (!chat) throw new Error('Failed to create new chat');
        onNavigate(`/chat/${chat.id}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        await onSendMessage(message);
      }

      // 重置状态
      onSetInput('');
      onSetIsSending(false);
      onSetIsGenerating(true);
      onScrollToBottom(false);
      
      if (designImage) {
        const requestBody = {
          messages: [{ role: "user", content: [{ type: "text", text: currentInput }, { type: "image_url", image_url: { url: designImage.url } }] }]
        };
        try {
          const response = await fetch('https://invo-one-ajzmkpolem.cn-shenzhen.fcapp.run/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          if (!response.ok || !response.body) throw new Error(`HTTP error! status: ${response.status}`);
          await processStreamResponse(message, response.body);
        } catch (error) {
          console.error('Error in design mode:', error);
          const errorMessage = error instanceof Error ? error.message : '生成失败';
          message.results.images['gpt-4o-image'][0] = { ...message.results.images['gpt-4o-image'][0], error: '生成失败', errorMessage, isGenerating: false };
          await onUpdateMessageResults(message.id, message.results, true);
        }
      } else {
        const updatePromises = currentModels.map(async ({ id, name, count }) => {
          const model: ImageModel | undefined = modelManager.getModelById(id);

          if (!model) {
            const errorMessage = `模型未找到: ${name}`;
            message.results.status.generating -= count;
            message.results.status.failed += count;
            
            // 创建错误结果
            const errorResults = Array(count).fill(null).map((_, index) => ({
              id: `img_${Date.now()}_error_${index}_${Math.random().toString(36).substring(2, 9)}`,
              url: null, text: null, error: '生成失败', errorMessage, isGenerating: false, createdAt: undefined
            }));
            
            // 立即更新 UI 显示错误状态
            const updatedImages = { ...message.results.images };
            updatedImages[name] = errorResults;
            message.results.images = updatedImages;
            onUpdateMessageResults(message.id, { ...message.results, images: updatedImages }, true);
            
            return { [name]: errorResults };
          }

          try {
            return new Promise<{ [key: string]: any[] }>((resolve) => {
              // 初始化结果数组，创建正确数量的占位符
              const results: any[] = Array(count).fill(null).map((_, index) => ({
                id: `img_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 9)}`,
                url: null,
                text: null,
                error: null,
                errorMessage: null,
                isGenerating: true,
                createdAt: null,
              }));

              const streamRequest = {
                count,
                onProgress: (result: any, index: number, total: number) => {
                  console.log(`流式生成进度: ${name} - ${index + 1}/${total}`, result);
                  
                  // 更新对应索引位置的结果，而不是重新设置整个数组
                  results[index] = {
                    id: results[index].id, // 保持原有的ID
                    url: result.imageUrl || null,
                    text: result.text || null,
                    error: result.success ? null : (result.error || '生成失败'),
                    errorMessage: result.error || null,
                    isGenerating: false,
                    createdAt: result.createdAt,
                  };
                  
                  // 更新状态计数
                  if (result.success) {
                    message.results.status.success++;
                  } else {
                    message.results.status.failed++;
                  }
                  message.results.status.generating--;
                  
                  // 更新消息结果，保持其他模型的结果不变
                  const updatedImages = { ...message.results.images };
                  updatedImages[name] = [...results]; // 使用展开运算符创建新数组
                  message.results.images = updatedImages;
                  
                  // 立即更新UI显示当前结果
                  onUpdateMessageResults(message.id, { ...message.results, images: updatedImages }, true);
                },
                onComplete: (response: any) => {
                  console.log(`流式生成完成: ${name}`, response);
                  resolve({ [name]: results });
                },
                onError: (error: Error) => {
                  console.error(`流式生成出错: ${name}`, error);
                  const errorMessage = error.message || '未知原因';
                  
                  // 将所有未完成的结果标记为错误
                  const errorResults = results.map((result) => ({
                    ...result,
                    url: null,
                    text: null,
                    error: '生成失败',
                    errorMessage,
                    isGenerating: false,
                  }));
                  
                  message.results.status.generating -= count;
                  message.results.status.failed += count;
                  
                  // 立即更新 UI 显示错误状态
                  const updatedImages = { ...message.results.images };
                  updatedImages[name] = errorResults;
                  message.results.images = updatedImages;
                  onUpdateMessageResults(message.id, { ...message.results, images: updatedImages }, true);
                  
                  resolve({ [name]: errorResults });
                },
              };

              // 获取模型配置
              const modelConfig = modelConfigs.find(config => config.model_id === model.group);
              
              // 使用统一的流式生成方法
              modelApiManager.generateImageStream(
                model.id,
                { prompt: currentInput, count },
                streamRequest,
                modelConfig
              );
            });
          } catch (error) {
            console.error(`Error generating images for model ${id}:`, error);
            const errorMessage = error instanceof Error ? error.message : '生成失败';
            message.results.status.generating -= count;
            message.results.status.failed += count;
            
            // 创建错误结果
            const errorResults = Array(count).fill(null).map((_, index) => ({
              id: `img_${Date.now()}_error_${index}_${Math.random().toString(36).substring(2, 9)}`,
              url: null, text: null, error: '生成失败', errorMessage, isGenerating: false, createdAt: undefined
            }));
            
            // 立即更新 UI 显示错误状态
            const updatedImages = { ...message.results.images };
            updatedImages[name] = errorResults;
            message.results.images = updatedImages;
            onUpdateMessageResults(message.id, { ...message.results, images: updatedImages }, true);
            
            return { [name]: errorResults };
          }
        });

        for (const promise of updatePromises) {
          await promise;
        }
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      onSetInput(currentInput);
    } finally {
      onSetIsSending(false);
      onSetIsGenerating(false);
    }
  }, [user, selectedModels, designImage, currentChat, onCreateNewChat, onNavigate, onSendMessage, onUpdateMessageResults, processStreamResponse, onSetInput, onSetIsSending, onSetIsGenerating, onScrollToBottom, modelConfigs]);

  // =================================================================================================
  // Keyboard Events
  // =================================================================================================

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleSendMessage(e as FormEvent);
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const newValue = value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd);
      onSetInput(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }
  }, [handleSendMessage, onSetInput]);

  // =================================================================================================
  // Textarea Auto-resize
  // =================================================================================================

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onSetInput(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [onSetInput]);

  // =================================================================================================
  // Return Values
  // =================================================================================================

  return {
    textareaRef,
    handleSendMessage,
    handleInputKeyDown,
    handleInputChange,
  };
};
