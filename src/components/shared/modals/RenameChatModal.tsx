/**
 * @file RenameChatModal.tsx
 * @description Modal component for renaming chat conversations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useState, useEffect, useRef } from 'react';

// 2. Third-party Libraries
import { useTranslation } from 'react-i18next';

// 3. Internal Types
import type { Chat } from '@/services/chat';

// 4. Internal Components
import { Modal } from '@/components/shared/common/Modal';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface RenameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTitle: string) => Promise<void>;
  chat: Chat | null;
  isLoading?: boolean;
}

// =================================================================================================
// Constants
// =================================================================================================

const MAX_TITLE_LENGTH = 13;

// =================================================================================================
// Component
// =================================================================================================

const RenameChatModal: FC<RenameChatModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chat,
  isLoading = false
}) => {
  // --- State ---
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Refs ---
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Hooks ---
  const { t } = useTranslation();

  // --- Effects ---
  useEffect(() => {
    if (isOpen && chat) {
      setNewTitle(chat.title);
    }
  }, [isOpen, chat]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // 延迟聚焦，确保动画完成
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- Event Handlers ---
  const handleConfirm = async () => {
    if (!newTitle.trim() || isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(newTitle.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming chat:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    onClose();
  };

  // --- Render Logic ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('history.rename.title')}
      maxWidth="sm"
      showCloseButton={true}
      closeOnBackdropClick={true}
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label htmlFor="chat-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('history.rename.label')}
          </label>
          <input
            ref={inputRef}
            id="chat-title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_TITLE_LENGTH}
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={t('history.rename.placeholder')}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('history.rename.characterCount', { count: newTitle.length, max: MAX_TITLE_LENGTH })}
            </span>
            {newTitle.length > MAX_TITLE_LENGTH * 0.8 && (
              <span className="text-xs text-orange-500">
                {t('history.rename.tooLong')}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!newTitle.trim() || isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('history.rename.renaming')}
              </>
            ) : (
              t('common.confirm')
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default RenameChatModal;
