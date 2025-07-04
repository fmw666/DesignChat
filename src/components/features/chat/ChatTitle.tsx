/**
 * @file ChatTitle.tsx
 * @description ChatTitle component, provides an editable title interface for chat conversations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { useEffect, useRef, useState, useCallback } from 'react';

// 2. Third-party Libraries
import { useTranslation } from 'react-i18next';
import { CheckIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

// 3. Internal Hooks
import { useAuth } from '@/hooks/auth';
import { useChat } from '@/hooks/chat';

// 4. Internal Services
import { chatService } from '@/services/chat';

// =================================================================================================
// Constants
// =================================================================================================

const MAX_TITLE_LENGTH = 13;
const INPUT_MAX_LENGTH = 13;

// =================================================================================================
// Component
// =================================================================================================

export const ChatTitle = () => {
  // --- State and Refs ---
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // --- Hooks ---
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentChat, setCurrentChat, chats, setChats } = useChat();

  // --- Logic and Event Handlers ---
  const handleTitleEdit = useCallback(() => {
    if (currentChat) {
      setEditedTitle(currentChat.title);
      setIsEditingTitle(true);
    }
  }, [currentChat]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setEditedTitle(value);
    }
  }, []);

  const handleTitleSave = useCallback(async () => {
    if (!currentChat || !editedTitle.trim()) return;

    // If title hasn't changed, just close edit mode
    if (editedTitle.trim() === currentChat.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const updatedChat = await chatService.updateChat(currentChat.id, {
        title: editedTitle.trim()
      });
      
      if (updatedChat) {
        // Update local state
        const updatedChats = chats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        );
        setChats(
          updatedChats.map(chat => ({
            ...chat,
            title: chat.title
          }))
        );
        setCurrentChat({
          ...currentChat,
          title: updatedChat.title
        });
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
      // Restore original title on error
      setEditedTitle(currentChat.title);
    } finally {
      setIsEditingTitle(false);
    }
  }, [currentChat, editedTitle, chats, setChats, setCurrentChat]);

  const handleTitleCancel = useCallback(() => {
    setIsEditingTitle(false);
    setEditedTitle('');
  }, []);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  }, [handleTitleSave, handleTitleCancel]);

  // --- Side Effects ---
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      setIsEditingTitle(false);
      setEditedTitle('');
    }
  }, [currentChat?.id]);

  // --- Render Logic ---
  if (!user || !currentChat?.title) {
    return null;
  }

  return (
    <div
      className="flex h-14 items-center justify-center border-b border-gray-200 bg-white/50 px-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800 group"
      style={{
        zIndex: isEditingTitle ? 1000 : 0
      }}
    >
      <div className="relative w-full max-w-md">
        {isEditingTitle ? (
          <div className="flex animate-fadeIn items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-lg font-medium text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder={t('chat.title.placeholder')}
                maxLength={INPUT_MAX_LENGTH}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 transition-opacity duration-200">
                {t('chat.title.characterCount', { count: editedTitle.length })}
              </div>
            </div>
            <button
              onClick={handleTitleSave}
              className="rounded-lg p-1 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900 dark:hover:text-green-500"
              title={t('common.save')}
            >
              <CheckIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleTitleCancel}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-500"
              title={t('common.cancel')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg">
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {currentChat.title}
            </h1>
            <button
              onClick={handleTitleEdit}
              className="rounded-lg p-1 text-gray-400 opacity-0 transition-colors hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-gray-900 dark:hover:text-gray-500"
              title={t('chat.title.edit')}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ChatTitle;
