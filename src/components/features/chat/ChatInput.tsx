/**
 * @file ChatInput.tsx
 * @description Chat input component with textarea, send button, and input hints
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { FormEvent } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

// --- Internal Libraries ---
// --- Types ---
import type { SelectedModel, DesignImage } from '@/types/chat';

// --- Relative Imports ---
import { ModelDrawer } from './ModelDrawer';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ChatInputProps {
  input: string;
  selectedModels: SelectedModel[];
  designImage: DesignImage | null;
  isGenerating: boolean;
  isSending: boolean;
  user: any;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (e: FormEvent) => void;
  onModelChange: (models: SelectedModel[]) => void;
  onDesignImageClose: (e: React.MouseEvent) => void;
  isDesignImageMenuVisible: boolean;
  isMobile: boolean;
}

// =================================================================================================
// Component
// =================================================================================================

export const ChatInput: FC<ChatInputProps> = ({
  input,
  selectedModels,
  designImage,
  isGenerating,
  isSending,
  user,
  textareaRef,
  onInputChange,
  onInputKeyDown,
  onSendMessage,
  onModelChange,
  onDesignImageClose,
  isDesignImageMenuVisible,
  isMobile,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-t border-primary-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800 backdrop-blur-sm p-4">
      {designImage ? (
        <div className="flex items-center gap-3">
          <div
            className="group relative flex items-center gap-3 cursor-pointer ml-3"
            onClick={() => {
              // Handle design image preview
            }}
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-200 group-hover:shadow-md">
              <img
                src={designImage?.url || ''}
                alt={designImage?.alt || 'Design reference'} 
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('chat.input.designTitle')}
              </span>
            </div>
            <button
              onClick={onDesignImageClose}
              className={`absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 ${
                isMobile
                  ? isDesignImageMenuVisible
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="Close design image"
            >
              <svg className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <ModelDrawer
          selectedModels={selectedModels}
          onModelChange={onModelChange}
          disabled={isGenerating}
        />
      )}
      
      <form onSubmit={onSendMessage} className="mt-4">
        <div className="relative flex items-center">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              placeholder={
                isGenerating ? t('chat.placeholderGenerating')
                : user ? (window.innerWidth < 768 ? t('chat.placeholderShort') : t('chat.placeholder'))
                : t('chat.placeholderLogin')
              }
              disabled={isSending || isGenerating}
              className={`w-full max-h-[200px] py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-hidden ease-in-out ${
                (isSending || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || (selectedModels.length === 0 && !designImage && !user?.user_metadata?.hide_model_info) || isSending || isGenerating}
              className="absolute right-2 bottom-2 p-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-500 disabled:text-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg disabled:hover:bg-transparent"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              ) : isGenerating ? (
                <SparklesIcon className="h-5 w-5 animate-pulse text-indigo-500" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-2">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('chat.input.enterToSend')}
            </span>
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {t('chat.input.ctrlEnterToNewLine')}
            </span>
            {designImage ? (
              <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                <SparklesIcon className="h-4 w-4 mr-1" />
                {t('chat.input.designMode', '图片编辑模式')}
              </span>
            ) : (
              <>
                {!(user?.user_metadata?.hide_model_info ?? false) && selectedModels.length > 0 && (
                  <span className="flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    {t('chat.input.selectedModels', { count: selectedModels.length })}
                  </span>
                )}
                {isGenerating && (
                  <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                    <SparklesIcon className="h-4 w-4 mr-1 animate-pulse" />
                    {t('chat.input.generating')}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {input.length > 0 && t('chat.input.characterCount', { count: input.length })}
          </div>
        </div>
      </form>
    </div>
  );
}; 