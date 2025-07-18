/**
 * @file ChatMessage.tsx
 * @description Renders a single chat message, including user input and AI response with images and actions.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

// --- Third-party Libraries ---
import { SparklesIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import remarkGfm from 'remark-gfm';

// --- Internal Libraries ---
// --- Components ---
import TextModal from '@/components/features/chat/TextModal';
import { ImagePreview } from '@/components/shared/common/ImagePreview';
// --- Services ---
import type { ImageResult, Message, Chat } from '@/services/chat';
// --- Store ---
import { useAuthStore } from '@/store/authStore';
// --- Types ---
import type { SelectedImage } from '@/types/chat';
// --- Utils ---
import { getAvatarClasses, getAvatarSizeClasses } from '@/utils/avatar';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ChatMessageProps {
  message: Message;
  userAvatar: string;
  currentChat: Chat | null;
  onEnterDesign?: (image: SelectedImage) => void;
  onJumpToReference?: (messageId: string, resultId: string) => void;
}

interface ImageResultItemProps {
  result: ImageResult;
  messageCreatedAt: string;
  onClick: () => void;
  onTextClick?: (text: string) => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const GENERATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

// =================================================================================================
// Utility Components
// =================================================================================================

const ImageResultItem: FC<ImageResultItemProps> = ({ result, messageCreatedAt, onClick, onTextClick }) => {
  const { t } = useTranslation();
  const isTimedOut =
    result.isGenerating &&
    Date.now() - new Date(messageCreatedAt).getTime() > GENERATION_TIMEOUT_MS;

  return (
    <div
      data-result-id={result.id}
      className="group relative aspect-square min-w-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]"
      onClick={onClick}
    >
      {result.isGenerating ? (
        isTimedOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30">
            <div className="flex flex-col items-center gap-2 p-4">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
                {t('chat.generation.timeout')}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('common.generating')}
              </span>
            </div>
          </div>
        )
      ) : result.error || result.errorMessage ? (
        result.text ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 transition-colors cursor-pointer"
            onClick={() => onTextClick?.(result.text!)}
          >
            <div className="flex flex-col items-center gap-1 px-4 max-w-[90%] max-h-[90%] overflow-y-auto">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-1 w-full text-left">
                <span className="text-sm text-blue-700 dark:text-blue-300 text-center font-medium block">
                  {t('chat.response.text')}
                </span>
                <div className="text-xs text-blue-600 dark:text-blue-400 break-words leading-relaxed max-h-32 overflow-y-auto cursor-pointer rounded transition-colors">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 自定义 Markdown 组件样式
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-blue-600 dark:text-blue-400">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-blue-700 dark:text-blue-300">{children}</strong>,
                      em: ({ children }) => <em className="italic text-blue-600 dark:text-blue-400">{children}</em>,
                      code: ({ children }) => <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      pre: ({ children }) => <pre className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-xs font-mono overflow-x-auto">{children}</pre>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-blue-600 dark:text-blue-400">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold text-blue-800 dark:text-blue-200 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">{children}</h3>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-300 dark:border-blue-600 pl-3 italic text-blue-600 dark:text-blue-400">{children}</blockquote>,
                    }}
                  >
                    {result.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center cursor-default bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex flex-col items-center gap-2 p-4 max-w-[90%] max-h-[90%] overflow-y-auto">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
            <div className="space-y-1 w-full text-left">
              <span className="text-sm text-red-600 text-center dark:text-red-400 font-medium block">
                {t('errors.generationFailed')}
              </span>
              <p className="text-xs text-red-500 dark:text-red-400 break-words">
                {result.errorMessage}
              </p>
            </div>
          </div>
        </div>
        )
      ) : result.url ? (
        <img
          src={result.url}
          alt="Generated image"
          className="w-full h-full object-contain transition-transform group-hover:scale-105 cursor-pointer"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</span>
        </div>
      )}
    </div>
  );
};

// =================================================================================================
// Component
// =================================================================================================

export const ChatMessage: FC<ChatMessageProps> = ({ 
  message, 
  userAvatar, 
  currentChat,
  onEnterDesign,
  onJumpToReference,
}) => {
  // --- State and Refs ---
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isHiddenModelInfo, setIsHiddenModelInfo] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');

  // --- Hooks ---
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // --- Logic and Event Handlers ---
  const getOriginalMessageContent = useCallback((referenceMessageId: string | null): string => {
    if (!referenceMessageId || !currentChat) return '';
    
    const originalMessage = currentChat.messages.find(msg => msg.id === referenceMessageId);
    return originalMessage?.content || '';
  }, [currentChat]);

  const handleJumpToReference = useCallback((messageId: string, resultId: string) => {
    onJumpToReference?.(messageId, resultId);
  }, [onJumpToReference]);

  const handleImageClick = useCallback((image: SelectedImage) => {
    if (image.url) {
      setSelectedImage(image);
    }
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleEnterDesign = useCallback(() => {
    if (selectedImage) {
      onEnterDesign?.(selectedImage);
      setSelectedImage(null);
    }
  }, [onEnterDesign, selectedImage]);

  const handleTextClick = useCallback((text: string) => {
    console.log('text', text);
    setSelectedText(text);
    setIsTextModalOpen(true);
  }, []);

  const handleCloseTextModal = useCallback(() => {
    setIsTextModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isTextModalOpen) {
      const timer = setTimeout(() => setSelectedText(''), 300);
      return () => clearTimeout(timer);
    }
  }, [isTextModalOpen]);

  // --- Side Effects ---
  useEffect(() => {
    setIsHiddenModelInfo(user?.user_metadata?.hide_model_info ?? false);
  }, [user]);

  // --- Render Logic ---
  return (
    <>
      {/* Image preview modal */}
      {selectedImage && (
        <ImagePreview
          message={message}
          originalContent={selectedImage.isReference 
            ? getOriginalMessageContent(message.userImage?.referenceMessageId || null)
            : message.content
          }
          isReference={selectedImage.isReference}
          initialImageId={selectedImage.id!}
          onClose={handleClosePreview}
          alt="Message image preview"
          onDesignClick={handleEnterDesign}
        />
      )}

      {/* Text response modal */}
      <TextModal
        isOpen={isTextModalOpen}
        onClose={handleCloseTextModal}
        title={t('chat.response.text')}
        text={selectedText}
      />

      <div className="flex flex-col mb-6">
        {/* User message */}
        <div className="flex justify-end p-3">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="flex-1 text-right">
              <div className="inline-block bg-indigo-600 text-white text-left rounded-lg px-4 py-2">
                <p className="text-sm">{message.content}</p>
              </div>
              {/* User message images */}
              {message.userImage?.url && (
                <div className="mt-3 flex flex-col items-end gap-2">
                  <div
                    className="group relative aspect-square w-48 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                    onClick={() => handleImageClick({
                      id: message.userImage?.referenceResultId || 'user',
                      url: message.userImage?.url || null,
                      messageId: message.userImage?.referenceMessageId || null,
                      resultId: message.userImage?.referenceResultId || null,
                      isReference: true,
                    })}
                  >
                    <img
                      src={message.userImage.url}
                      alt={message.userImage.alt || 'User uploaded image'}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {message.userImage?.referenceMessageId && message.userImage?.referenceResultId && (
                      <button
                        onClick={() => handleJumpToReference(message.userImage!.referenceMessageId!, message.userImage!.referenceResultId!)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full transition-colors hover:bg-white dark:hover:bg-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        {t('chat.jumpToReference')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.userImage ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}> 
                  <span>{userAvatar}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start p-3">
          <div className={"flex items-start gap-3 max-w-8xl"}>
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.userImage ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}>
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              {/* AI text response */}
              <div className="inline-block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 mb-3">
                {message.userImage && (
                  <div className="mb-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    【{t('chat.input.designMode')}】
                  </div>
                )}
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {message.results.status?.total > 0 ? (
                    <>
                      {message.results.status?.generating > 0 
                        ? t('chat.generation.generating')
                        : message.results.status?.failed === message.results.status?.total
                          ? t('chat.generation.failed')
                          : message.results.status?.failed > 0
                            ? t('chat.generation.partialSuccess')
                            : t('chat.generation.success')
                      }
                      {isHiddenModelInfo && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({Object.values(message.results.images).flat().length} {t('chat.images')})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {t('chat.generation.noResults')}
                    </>
                  )}
                </p>
              </div>

              {/* AI image results */}
              {isHiddenModelInfo ? (
                // 隐藏模型信息模式下的图片展示
                <div className="mb-4">
                  <div className="grid grid-cols-1 [@media(min-width:508px)_and_(max-width:639px)]:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 min-w-[300px]">
                    {Object.values(message.results.images)
                      .flat()
                      .map((result, index) => (
                        <ImageResultItem
                          key={`${result.id}-${index}`}
                          result={result}
                          messageCreatedAt={message.createdAt}
                          onClick={() => handleImageClick({
                            id: result.id,
                            url: result.url,
                            messageId: message.id,
                            resultId: result.id,
                            isReference: false,
                          })}
                          onTextClick={handleTextClick}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                // 显示模型信息模式下的图片展示
                Object.entries(message.results.images).map(([modelId, results], index) => (
                  <div key={modelId} className="mb-4">
                    {!message.userImage && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500 dark:to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            {index + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <span className="text-indigo-600 dark:text-indigo-400">{modelId}</span>
                          <span className="text-gray-400 dark:text-gray-600">•</span>
                          <span className="text-gray-400 dark:text-gray-500">
                            {results.length} {t('chat.images')}
                          </span>
                        </h4>
                      </div>
                    )}
                    <div className="grid grid-cols-1 [@media(min-width:508px)_and_(max-width:639px)]:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 min-w-[300px]">
                      {results.map((result, resultIndex) => (
                        <ImageResultItem
                          key={`${result.id}-${resultIndex}`}
                          result={result}
                          messageCreatedAt={message.createdAt}
                          onClick={() => handleImageClick({
                            id: result.id,
                            url: result.url,
                            messageId: message.id,
                            resultId: result.id,
                            isReference: false,
                          })}
                          onTextClick={handleTextClick}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ChatMessage;
