/**
 * @file ChatHistory.tsx
 * @description Component that displays chat history with grouped conversations by time periods
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, useState, useMemo, useCallback } from 'react';

// 2. Third-party Libraries
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrashIcon, EllipsisHorizontalIcon, PencilIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

// 3. Internal Hooks
import { useChat } from '@/hooks/chat';

// 4. Internal Services
import { Chat } from '@/services/chat';

// 5. Internal Components
import { ConfirmDialog } from '@/components/shared/common/ConfirmDialog';
import { useContextMenu } from '@/providers/ContextMenuProvider';
import RenameChatModal from '@/components/shared/modals/RenameChatModal';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface GroupedChats {
  [key: string]: Chat[];
}

interface ChatHistoryProps {
  // Component props if needed in the future
}

// =================================================================================================
// Constants
// =================================================================================================

const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const ANIMATION_VARIANTS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  item: {
    hover: { scale: 1.01 },
    tap: { scale: 0.99 }
  }
};

// =================================================================================================
// Utility Functions
// =================================================================================================

/**
 * Checks if a date is within the last N days
 * @param date - The date to check
 * @param days - Number of days to check against
 * @returns boolean - True if within the specified days
 */
const isWithinLastDays = (date: Date, days: number): boolean => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / MILLISECONDS_PER_DAY);
  return diffDays <= days;
};

/**
 * Checks if a date is within the last 7 days
 * @param date - The date to check
 * @returns boolean - True if within last 7 days
 */
const isWithinLast7Days = (date: Date): boolean => isWithinLastDays(date, DAYS_IN_WEEK);

/**
 * Checks if a date is within the last 30 days
 * @param date - The date to check
 * @returns boolean - True if within last 30 days
 */
const isWithinLast30Days = (date: Date): boolean => isWithinLastDays(date, DAYS_IN_MONTH);

// =================================================================================================
// Component
// =================================================================================================

export const ChatHistory: FC<ChatHistoryProps> = ({ }) => {
  // --- State ---
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<Chat | null>(null);

  // --- Hooks ---
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    chats,
    currentChat,
    isLoading,
    switchChatById,
    deleteChat,
    archiveChat,
    renameChat
  } = useChat();
  const { openMenu } = useContextMenu();

  // --- Logic and Event Handlers ---
  // Get current language's date-fns locale
  const dateLocale = i18n.language === 'zh' ? zhCN : enUS;

  // Group chats by time periods using useMemo for performance
  const groupedChats = useMemo(() => {
    if (!chats.length) return {};

    return chats.reduce<GroupedChats>((groups, chat) => {
      let groupKey: string;
      const date = new Date(chat.created_at);

      if (isToday(date)) {
        groupKey = t('history.today');
      } else if (isYesterday(date)) {
        groupKey = t('history.yesterday');
      } else if (isWithinLast7Days(date)) {
        groupKey = t('history.inSevenDays');
      } else if (isWithinLast30Days(date)) {
        groupKey = t('history.inThirtyDays');
      } else if (isThisYear(date)) {
        groupKey = format(date, 'yyyy-MM', { locale: dateLocale });
      } else {
        groupKey = format(date, 'yyyy', { locale: dateLocale });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
      return groups;
    }, {});
  }, [chats, t, dateLocale]);

  // Sort group keys in chronological order using useMemo
  const sortedGroupKeys = useMemo(() => {
    const today = t('history.today');
    const yesterday = t('history.yesterday');
    const sevenDays = t('history.inSevenDays');
    const thirtyDays = t('history.inThirtyDays');

    return Object.keys(groupedChats).sort((a, b) => {
      if (a === today) return -1;
      if (b === today) return 1;
      if (a === yesterday) return -1;
      if (b === yesterday) return 1;
      if (a === sevenDays) return -1;
      if (b === sevenDays) return 1;
      if (a === thirtyDays) return -1;
      if (b === thirtyDays) return 1;
      return b.localeCompare(a);
    });
  }, [groupedChats, t]);

  const handleChatClick = useCallback((chatId: string) => {
    switchChatById(chatId);
    navigate(`/chat/${chatId}`);
  }, [switchChatById, navigate]);

  const handleConfirmDelete = useCallback(async () => {
    if (!chatToDelete) return;
    
    setIsDeleting(chatToDelete);
    try {
      await deleteChat(chatToDelete);
      if (currentChat?.id === chatToDelete) {
        switchChatById(null);
        navigate('/chat/new');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setIsDeleting(null);
      setChatToDelete(null);
    }
  }, [chatToDelete, deleteChat, currentChat, switchChatById, navigate]);

  const handleCancelDelete = useCallback(() => {
    setChatToDelete(null);
  }, []);

  const handleRename = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setChatToRename(chat);
    }
  }, [chats]);

  const handleRenameConfirm = useCallback(async (newTitle: string) => {
    if (!chatToRename) return;
    
    try {
      await renameChat(chatToRename.id, newTitle);
    } catch (error) {
      console.error('Error renaming chat:', error);
      throw error;
    }
  }, [chatToRename, renameChat]);

  const handleRenameClose = useCallback(() => {
    setChatToRename(null);
  }, []);

  const handleArchive = useCallback(async (chatId: string) => {
    setIsArchiving(chatId);
    try {
      await archiveChat(chatId);
      // chatStore 会自动处理聊天列表更新和切换
      // 如果当前聊天被归档，需要导航到新聊天
      if (currentChat?.id === chatId) {
        switchChatById(null);
      }
    } catch (error) {
      console.error('Error archiving chat:', error);
    } finally {
      setIsArchiving(null);
    }
  }, [archiveChat, currentChat, chats, navigate]);

  const handleDelete = useCallback((chatId: string) => {
    setChatToDelete(chatId);
  }, []);

  const handleMenuClick = useCallback((e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right,
      y: rect.bottom
    };

    const menuItems = [
      {
        id: 'rename',
        label: t('history.actions.rename'),
        icon: PencilIcon,
        onClick: () => handleRename(chat.id),
        disabled: false
      },
      {
        id: 'archive',
        label: t('history.actions.archive'),
        icon: ArchiveBoxIcon,
        onClick: () => handleArchive(chat.id),
        disabled: isArchiving === chat.id,
        loading: isArchiving === chat.id
      },
      {
        id: 'delete',
        label: t('history.actions.delete'),
        icon: TrashIcon,
        onClick: () => handleDelete(chat.id),
        disabled: isDeleting === chat.id,
        loading: isDeleting === chat.id,
        danger: true
      }
    ];

    openMenu(menuItems, position, 'top-left');
  }, [t, isArchiving, isDeleting, handleRename, handleArchive, handleDelete, openMenu]);

  // --- Side Effects ---
  // No side effects needed for this component

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat history list - using new scrollbar styles, adding bottom padding to avoid user menu overlap */}
      <div className="h-[calc(100%-80px)] overflow-y-auto pl-4 pr-2">
        <AnimatePresence>
          {sortedGroupKeys.map((groupKey) => (
            <motion.div
              key={groupKey}
              variants={ANIMATION_VARIANTS.container}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mb-6"
            >
              <h3 className="text-xs font-medium text-gray-500 mb-3 px-2 sticky top-0 bg-white dark:bg-gray-900 py-1.5 z-10 border-b border-gray-100 dark:border-gray-800">
                {groupKey}
              </h3>
              <div className="space-y-1">
                {groupedChats[groupKey].map((chat) => {
                  const isItemLoading = isDeleting === chat.id || isArchiving === chat.id;
                  
                  return (
                    <motion.div
                      key={chat.id}
                      onClick={() => !isItemLoading && handleChatClick(chat.id)}
                      className={`group relative w-full text-left px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isItemLoading
                          ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                          : currentChat?.id === chat.id
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-900 dark:text-indigo-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      variants={ANIMATION_VARIANTS.item}
                      whileHover={isItemLoading ? {} : "hover"}
                      whileTap={isItemLoading ? {} : "tap"}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {isItemLoading ? (
                              <span className="flex items-center gap-1">
                                <motion.div
                                  className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                {isDeleting === chat.id ? t('history.deleting') : t('history.archiving')}
                              </span>
                            ) : (
                              chat.messages[0]?.content || t('history.noMessages')
                            )}
                          </div>
                        </div>
                        <div className="relative ml-2">
                          <button
                            onClick={(e) => !isItemLoading && handleMenuClick(e, chat)}
                            disabled={isItemLoading}
                            className={`p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50 ${
                              isItemLoading
                                ? 'cursor-not-allowed'
                                : currentChat?.id === chat.id 
                                  ? 'group-hover:bg-white/50 dark:group-hover:bg-gray-900/50' 
                                  : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                            }`}
                          >
                            {isItemLoading ? (
                              <motion.div
                                className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            ) : (
                              <EllipsisHorizontalIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p className="text-sm">{t('history.noChats')}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!chatToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('history.deleteTitle')}
        message={t('history.deleteMessage')}
        confirmText={t('history.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
      />

      <RenameChatModal
        isOpen={!!chatToRename}
        onClose={handleRenameClose}
        onConfirm={handleRenameConfirm}
        chat={chatToRename}
      />
    </div>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ChatHistory;
