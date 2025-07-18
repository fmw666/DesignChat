/**
 * @file ArchivedChatsModal.tsx
 * @description Modal component for managing archived chats
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { ArchiveBoxIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import { ConfirmDialogOptimized as ConfirmDialog } from '@/components/shared/common/ConfirmDialog/ConfirmDialogOptimized';
import { Modal } from '@/components/shared/common/Modal';
// --- Hooks ---
import { useArchivedChats } from '@/hooks/chat';
// --- Services ---
import { chatService, type Chat } from '@/services/chat';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ArchivedChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GroupedArchivedChats {
  [key: string]: Chat[];
}

// =================================================================================================
// Component
// =================================================================================================

export const ArchivedChatsModal: FC<ArchivedChatsModalProps> = ({ isOpen, onClose }) => {
  // --- State and Refs ---
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUnarchiving, setIsUnarchiving] = useState<string | null>(null);
  const [showUnarchiveAllConfirm, setShowUnarchiveAllConfirm] = useState(false);
  const [isUnarchivingAll, setIsUnarchivingAll] = useState(false);
  const [showDeleteAllArchivedConfirm, setShowDeleteAllArchivedConfirm] = useState(false);
  const [isDeletingAllArchived, setIsDeletingAllArchived] = useState(false);

  // --- Hooks ---
  const { t, i18n } = useTranslation();
  const { handleUnarchiveChat, handleUnarchiveAllChats, handleDeleteAllArchivedChats } = useArchivedChats();

  // --- Computed Values ---
  // 全局加载状态：当任何批量操作正在进行时，禁用所有其他操作
  const isGlobalLoading = isUnarchivingAll || isDeletingAllArchived;

  // --- Logic and Event Handlers ---
  // Get current language's date-fns locale
  const dateLocale = i18n.language === 'zh' ? zhCN : enUS;

  // Load archived chats
  const loadArchivedChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const chats = await chatService.getArchivedChats();
      setArchivedChats(chats);
    } catch (error) {
      console.error('Error loading archived chats:', error);
      toast.error(t('settings.data.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Group archived chats by time periods
  const groupedArchivedChats = useMemo(() => {
    if (!archivedChats.length) return {};

    return archivedChats.reduce<GroupedArchivedChats>((groups, chat) => {
      let groupKey: string;
      const date = new Date(chat.created_at);

      if (isToday(date)) {
        groupKey = t('history.today');
      } else if (isYesterday(date)) {
        groupKey = t('history.yesterday');
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
  }, [archivedChats, t, dateLocale]);

  // Sort group keys in chronological order
  const sortedGroupKeys = useMemo(() => {
    const today = t('history.today');
    const yesterday = t('history.yesterday');

    return Object.keys(groupedArchivedChats).sort((a, b) => {
      if (a === today) return -1;
      if (b === today) return 1;
      if (a === yesterday) return -1;
      if (b === yesterday) return 1;
      return b.localeCompare(a);
    });
  }, [groupedArchivedChats, t]);

  const handleUnarchive = useCallback(async (chatId: string) => {
    setIsUnarchiving(chatId);
    try {
      await handleUnarchiveChat(chatId);
      await loadArchivedChats(); // Reload the list
      toast.success(t('settings.data.unarchiveSuccess'));
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      toast.error(t('settings.data.unarchiveError'));
    } finally {
      setIsUnarchiving(null);
    }
  }, [handleUnarchiveChat, loadArchivedChats, t]);

  const handleDelete = useCallback(async (chatId: string) => {
    setIsDeleting(chatId);
    try {
      await chatService.deleteChat(chatId);
      await loadArchivedChats(); // Reload the list
      toast.success(t('settings.data.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting archived chat:', error);
      toast.error(t('settings.data.deleteError'));
    } finally {
      setIsDeleting(null);
      setChatToDelete(null);
    }
  }, [loadArchivedChats, t]);

  const handleConfirmDelete = useCallback(() => {
    if (chatToDelete) {
      handleDelete(chatToDelete);
    }
  }, [chatToDelete, handleDelete]);

  const handleUnarchiveAll = useCallback(async () => {
    setIsUnarchivingAll(true);
    try {
      await handleUnarchiveAllChats();
      await loadArchivedChats(); // Reload the list
      toast.success(t('settings.data.unarchiveAllSuccess'));
      setShowUnarchiveAllConfirm(false);
    } catch (error) {
      console.error('Error unarchiving all chats:', error);
      toast.error(t('settings.data.unarchiveAllError'));
    } finally {
      setIsUnarchivingAll(false);
    }
  }, [handleUnarchiveAllChats, loadArchivedChats, t]);

  const handleDeleteAllArchived = useCallback(async () => {
    setIsDeletingAllArchived(true);
    try {
      await handleDeleteAllArchivedChats();
      await loadArchivedChats(); // Reload the list
      toast.success(t('settings.data.deleteAllArchivedSuccess'));
      setShowDeleteAllArchivedConfirm(false);
    } catch (error) {
      console.error('Error deleting all archived chats:', error);
      toast.error(t('settings.data.deleteAllArchivedError'));
    } finally {
      setIsDeletingAllArchived(false);
    }
  }, [handleDeleteAllArchivedChats, loadArchivedChats, t]);

  // --- Side Effects ---
  useEffect(() => {
    if (isOpen) {
      loadArchivedChats();
    }
  }, [isOpen, loadArchivedChats]);

  // --- Render Logic ---
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={isGlobalLoading ? () => {} : onClose}
        title={t('settings.data.archivedChatsTitle')}
        maxWidth="2xl"
        closeOnBackdropClick={!isGlobalLoading}
        zIndex={999}
      >
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut"
          }}
          className="space-y-4"
        >
          {/* Header with refresh button */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.data.archivedChatsCount', { count: archivedChats.length })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnarchiveAllConfirm(true)}
                disabled={isGlobalLoading || archivedChats.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnarchivingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    {t('settings.data.unarchiveAllLoading')}
                  </>
                ) : (
                  <>
                    <ArchiveBoxIcon className="w-4 h-4" />
                    {t('settings.data.unarchiveAll')}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteAllArchivedConfirm(true)}
                disabled={isGlobalLoading || archivedChats.length === 0}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAllArchived ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    {t('settings.data.deleteAllArchivedLoading')}
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    {t('settings.data.deleteAllArchived')}
                  </>
                )}
              </button>
              <button
                onClick={loadArchivedChats}
                disabled={isLoading || isGlobalLoading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </button>
            </div>
          </motion.div>

          {/* Archived chats list */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="max-h-96 overflow-y-auto space-y-4 pr-2"
          >
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center justify-center py-8"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </motion.div>
            ) : archivedChats.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <ArchiveBoxIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('settings.data.noArchivedChats')}</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedGroupKeys.map((groupKey, groupIndex) => (
                  <motion.div
                    key={groupKey}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: groupIndex * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="space-y-2"
                  >
                    {/* Date header */}
                    <motion.div 
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: groupIndex * 0.08 + 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {groupKey}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({groupedArchivedChats[groupKey].length} {t('history.item')})
                      </span>
                    </motion.div>

                    {/* Chat items */}
                    <div className="space-y-2 pl-3">
                      {groupedArchivedChats[groupKey].map((chat, chatIndex) => {
                        const isItemLoading = isDeleting === chat.id || isUnarchiving === chat.id;
                        
                        return (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -25, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -25, scale: 0.98 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: groupIndex * 0.08 + chatIndex * 0.03 + 0.15,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="group"
                          >
                            <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-200 ${
                              isItemLoading ? 'opacity-60' : ''
                            }`}>
                              <div className="flex-1 min-w-0 mr-3">
                                <div
                                  onClick={(_) => {
                                    if (isGlobalLoading) return;
                                    window.open(`/chat/${chat.id}`, '_blank');
                                    
                                    // if (e.ctrlKey || e.metaKey) {
                                    //   // Ctrl+Click or Cmd+Click: Open in new tab
                                    //   window.open(`/chat/${chat.id}`, '_blank');
                                    // } else {
                                    //   // Normal click: Navigate in current tab
                                    //   navigate(`/chat/${chat.id}`);
                                    // }
                                  }}
                                  className={`font-medium text-gray-900 dark:text-white truncate transition-colors duration-200 ${
                                    isGlobalLoading 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : 'hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'
                                  }`}
                                  title={isGlobalLoading ? '' : 'Click to open chat (Ctrl+Click for new tab)'}
                                >
                                  {chat.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                  {chat.messages[0]?.content || t('history.noMessages')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleUnarchive(chat.id)}
                                  disabled={isItemLoading || isGlobalLoading}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUnarchiving === chat.id ? (
                                    <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <ArchiveBoxIcon className="w-3 h-3" />
                                  )}
                                  {t('settings.data.unarchive')}
                                </button>
                                <button
                                  onClick={() => setChatToDelete(chat.id)}
                                  disabled={isItemLoading || isGlobalLoading}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isDeleting === chat.id ? (
                                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <TrashIcon className="w-3 h-3" />
                                  )}
                                  {t('common.delete')}
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
            )}
          </motion.div>
        </motion.div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('settings.data.deleteArchivedTitle')}
        message={t('settings.data.deleteArchivedMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
      />

      {/* Unarchive All Chats Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUnarchiveAllConfirm}
        onClose={isGlobalLoading ? () => {} : () => setShowUnarchiveAllConfirm(false)}
        onConfirm={handleUnarchiveAll}
        title={t('settings.data.unarchiveAllTitle')}
        message={t('settings.data.unarchiveAllMessage')}
        confirmText={t('settings.data.unarchiveAll')}
        cancelText={t('common.cancel')}
        type="warning"
        maxWidth="md"
        isLoading={isUnarchivingAll}
      />

      {/* Delete All Archived Chats Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllArchivedConfirm}
        onClose={isGlobalLoading ? () => {} : () => setShowDeleteAllArchivedConfirm(false)}
        onConfirm={handleDeleteAllArchived}
        title={t('settings.data.deleteAllArchivedTitle')}
        message={t('settings.data.deleteAllArchivedMessage')}
        confirmText={t('settings.data.deleteAllArchived')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
        isLoading={isDeletingAllArchived}
      />
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ArchivedChatsModal;
