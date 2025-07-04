/**
 * @file ChatInterface.tsx
 * @description ChatInterface component, responsible for the main chat UI, message handling, and user interaction.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { useState, useCallback, FC, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// 2. Third-party Libraries
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// 3. Services and Utilities
import { getAvatarText } from '@/utils/avatar';

// 4. Hooks
import { useAuth } from '@/hooks/auth';
import { useChat, useChatInput, useChatScroll, useChatNavigation } from '@/hooks/chat';
import { useImagePreview } from '@/hooks/ui';

// 5. Components
import ChatTitle from '@/components/features/chat/ChatTitle';
import { NewChatGuide } from '@/components/features/chat/NewChatGuide';
import { ChatMessage } from '@/components/features/chat/ChatMessage';
import { ChatInput } from '@/components/features/chat/ChatInput';
import { ArchivedChatInterface } from '@/components/features/chat/ArchivedChatInterface';
import { SuccessToast } from '@/components/features/chat/SuccessToast';
import ChatLoading from './ChatLoading';
import ScrollingOverlay from './ScrollingOverlay';
import { ImagePreview } from '@/components/shared/common/ImagePreview';

// 6. Types
import type { Message } from '@/services/chat';
import type { SelectedModel } from '@/types/chat';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ChatInterfaceProps {
  chatId?: string;
}

// =================================================================================================
// Constants
// =================================================================================================

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth <= 768;

// =================================================================================================
// Component
// =================================================================================================

export const ChatInterface: FC<ChatInterfaceProps> = ({ chatId }) => {
  // --------------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------------
  
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --------------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------------

  const { t } = useTranslation();
  const { user, isLoading: userLoading, isInitialized: userInitialized } = useAuth();
  const {
    chats,
    currentChat,
    isArchivedChat,
    isLoading: chatLoading,
    isInitialized: chatInitialized,
    addMessage,
    updateMessageResults,
    createNewChat,
    getArchivedChatById,
    unarchiveChat,
    switchChatById,
    switchChat,
  } = useChat();

  // Custom hooks
  const { messagesEndRef, scrollMessagesToBottom } = useChatScroll(currentChat, {
    setIsScrolling,
    setIsShowLoading,
    setHasLoadingTimedOut,
  });
  
  const { navigate } = useChatNavigation({
    chatId,
    user,
    userLoading,
    userInitialized,
    chats,
    currentChat,
    chatLoading,
    chatInitialized,
    isArchivedChat,
    switchChatById,
    getArchivedChatById,
    switchChat,
  });

  const {
    designImage,
    isDesignImageMenuVisible,
    selectedImage,
    handleDesignModeEnter,
    handleDesignImageClose,
    handleSelectedImageClose,
    handleEnterDesignFromPreview,
    handleReferenceJump,
    setDesignImage,
  } = useImagePreview({ currentChat, user });

  // Create wrapper functions to handle type compatibility
  const handleSendMessageWrapper = useCallback(async (message: Message) => {
    if (user) {
      await addMessage(message);
    }
  }, [user, addMessage]);

  const handleUpdateMessageResultsWrapper = useCallback(async (messageId: string, results: any, updateInDatabase?: boolean) => {
    if (user) {
      await updateMessageResults(messageId, results, updateInDatabase);
    }
  }, [user, updateMessageResults]);

  const handleCreateNewChatWrapper = useCallback(async (title: string, initialMessages: Message[]) => {
    if (user) {
      return await createNewChat(title, initialMessages);
    }
    return null;
  }, [user, createNewChat]);

  const {
    textareaRef,
    handleSendMessage,
    handleInputKeyDown,
    handleInputChange,
  } = useChatInput({
    user,
    currentChat,
    selectedModels,
    designImage,
    onSendMessage: handleSendMessageWrapper,
    onUpdateMessageResults: handleUpdateMessageResultsWrapper,
    onCreateNewChat: handleCreateNewChatWrapper,
    onNavigate: navigate,
    onSetInput: setInput,
    onSetIsGenerating: setIsGenerating,
    onSetIsSending: setIsSending,
    onScrollToBottom: scrollMessagesToBottom,
  });

  // --------------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------------

  const handleRefresh = useCallback(() => {
    setHasLoadingTimedOut(false);
    scrollMessagesToBottom();
  }, [scrollMessagesToBottom]);

  const handleUnarchiveChat = useCallback(async () => {
    if (!currentChat) return;
    
    try {
      setIsUnarchiving(true);
      await unarchiveChat(currentChat.id);
      // 取消归档后，store 会自动更新状态和聊天列表
      // 添加短暂的成功反馈
      setTimeout(() => {
        setIsUnarchiving(false);
        // 延迟显示成功提示，确保状态切换完成
        setTimeout(() => {
          setShowSuccessToast(true);
        }, 300);
      }, 500);
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      setIsUnarchiving(false);
    }
  }, [currentChat, unarchiveChat]);

  // --------------------------------------------------------------------------------
  // Side Effects
  // --------------------------------------------------------------------------------

  useEffect(() => {
    scrollMessagesToBottom();
  }, [currentChat?.id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSending || isGenerating) {
        e.preventDefault();
        e.returnValue = t('chat.generation.leaveWarning');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSending, isGenerating, t]);

  // 监听归档状态变化，重置成功提示
  useEffect(() => {
    if (!isArchivedChat) {
      setShowSuccessToast(false);
    }
  }, [isArchivedChat]);

  // 重置设计图片状态
  useEffect(() => {
    setDesignImage(null);
  }, [currentChat?.id, setDesignImage]);

  // --------------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------------

  if (chatLoading) {
    return <ChatLoading />;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ChatTitle />

      <div className="flex-1 overflow-y-auto p-4 relative bg-gray-50 dark:bg-gray-800">
        {(isScrolling && isShowLoading) && (
          <ScrollingOverlay
            hasTimedOut={hasLoadingTimedOut}
            onRefresh={handleRefresh}
          />
        )}

        {!user || !currentChat || !currentChat.messages.length ? (
          <NewChatGuide />
        ) : (
          <>
            {currentChat.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                userAvatar={getAvatarText(user)}
                currentChat={currentChat}
                onEnterDesign={handleDesignModeEnter}
                onJumpToReference={handleReferenceJump}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Success Toast */}
      <SuccessToast
        show={showSuccessToast}
        onHide={() => setShowSuccessToast(false)}
        message={t('chat.archived.unarchiveSuccess')}
      />
      
      <AnimatePresence mode="wait">
        {isArchivedChat ? (
          // 归档聊天状态 - 显示取消归档界面
          <motion.div
            key="archived"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ArchivedChatInterface
              isUnarchiving={isUnarchiving}
              onUnarchiveChat={handleUnarchiveChat}
            />
          </motion.div>
        ) : (
          // 正常聊天状态 - 显示输入界面
          <motion.div
            key="normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <ChatInput
              input={input}
              selectedModels={selectedModels}
              designImage={designImage}
              isGenerating={isGenerating}
              isSending={isSending}
              user={user}
              textareaRef={textareaRef}
              onInputChange={handleInputChange}
              onInputKeyDown={handleInputKeyDown}
              onSendMessage={handleSendMessage}
              onModelChange={setSelectedModels}
              onDesignImageClose={handleDesignImageClose}
              isDesignImageMenuVisible={isDesignImageMenuVisible}
              isMobile={IS_MOBILE}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Preview Modal for Design Image */}
      {selectedImage && (
        <ImagePreview
          message={{
            id: selectedImage.imageId,
            content: selectedImage.asset.content,
            createdAt: selectedImage.asset.created_at,
            models: selectedImage.asset.models,
            results: selectedImage.asset.results,
            userImage: selectedImage.asset.user_image,
          }}
          initialImageId={selectedImage.imageId}
          isReference={false}
          onClose={handleSelectedImageClose}
          onDesignClick={handleEnterDesignFromPreview}
          alt={selectedImage.asset.content}
        />
      )}
    </div>
  );
};

export default ChatInterface;
