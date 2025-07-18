/**
 * @file SettingsModal.tsx
 * @description Modal component for user settings including theme, language, and model configuration
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useEffect, useState, useMemo, useCallback } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { MoonIcon, GlobeAltIcon, SunIcon, InformationCircleIcon, Cog6ToothIcon, ServerIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import { ConfirmDialogOptimized as ConfirmDialog } from '@/components/shared/common/ConfirmDialog/ConfirmDialogOptimized';
import { Modal } from '@/components/shared/common/Modal';
// --- Hooks ---
import { useChatSettings } from '@/hooks/chat';
// --- Services ---
import { authService } from '@/services/auth';
// --- Store ---
import { useAuthStore } from '@/store/authStore';
// --- Styles ---
import { useThemeStore } from '@/styles/theme';

// --- Relative Imports ---
import ArchivedChatsModal from './ArchivedChatsModal';
import ModelConfigModal from './ModelConfigModal';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'models' | 'data';

interface TabItem {
  id: TabType;
  label: string;
  icon: typeof SunIcon;
}

// =================================================================================================
// Component
// =================================================================================================

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // --- State and Refs ---
  const [isUpdatingModelInfo, setIsUpdatingModelInfo] = useState(false);
  const [isHideModelInfo, setIsHideModelInfo] = useState(false);
  const [showModelConfigModal, setShowModelConfigModal] = useState(false);
  const [showArchivedChatsModal, setShowArchivedChatsModal] = useState(false);
  const [showArchiveAllConfirm, setShowArchiveAllConfirm] = useState(false);
  const [isArchivingAll, setIsArchivingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // --- Hooks ---
  const { theme, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthStore();
  const { handleArchiveAllChats, handleDeleteAllChats } = useChatSettings();

  // --- Logic and Event Handlers ---
  const handleToggleModelInfo = useCallback(async () => {
    if (isUpdatingModelInfo) return;
    
    setIsUpdatingModelInfo(true);
    try {
      const newValue = !(user?.user_metadata?.hide_model_info ?? false);
      const updatedUser = await authService.updateUserMetadata({
        ...user?.user_metadata,
        hide_model_info: newValue
      });
      setUser(updatedUser);
      toast.success(t('settings.modelInfo.updated'));
    } catch (error) {
      console.error('Error updating model info visibility:', error);
      toast.error(t('settings.modelInfo.updateFailed'));
    } finally {
      setIsUpdatingModelInfo(false);
    }
  }, [isUpdatingModelInfo, user?.user_metadata, setUser, t]);

  const _handleArchiveAllChats = useCallback(async () => {
    setIsArchivingAll(true);
    try {
      await handleArchiveAllChats();
      toast.success(t('settings.data.archiveAllSuccess'));
      setShowArchiveAllConfirm(false);
    } catch (error) {
      console.error('Error archiving all chats:', error);
      toast.error(t('settings.data.archiveAllError'));
    } finally {
      setIsArchivingAll(false);
    }
  }, [handleArchiveAllChats, t]);

  const _handleDeleteAllChats = useCallback(async () => {
    setIsDeletingAll(true);
    try {
      await handleDeleteAllChats();
      toast.success(t('settings.data.deleteAllSuccess'));
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting all chats:', error);
      toast.error(t('settings.data.deleteAllError'));
    } finally {
      setIsDeletingAll(false);
    }
  }, [handleDeleteAllChats, t]);

  // --- Side Effects ---
  useEffect(() => {
    setIsHideModelInfo(user?.user_metadata?.hide_model_info ?? false);
  }, [user]);

  // --- Render Logic ---
  // Get configured models count
  const configuredModelsCount = useMemo(() => {
    return user?.user_metadata?.modelConfigs 
      ? Object.values(user.user_metadata.modelConfigs).filter((config: any) => 
          config.enabled && config.apiKey && config.apiSecret
        ).length 
      : 0;
  }, [user?.user_metadata?.modelConfigs]);

  // Tab configuration
  const tabs: TabItem[] = useMemo(() => [
    { id: 'general', label: t('settings.tabs.general'), icon: SunIcon },
    { id: 'models', label: t('settings.tabs.models'), icon: Cog6ToothIcon },
    { id: 'data', label: t('settings.tabs.data'), icon: ServerIcon },
  ], [t]);

  // Render tab content
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3 pr-2"
          >
            {/* Theme settings */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-indigo-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.theme.title')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{theme === 'light' ? t('settings.theme.light') : t('settings.theme.dark')}</div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                role="switch"
                aria-checked={theme === 'dark'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language settings */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.language.title')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {i18n.language === 'en' ? t('settings.language.en') : t('settings.language.zh')}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t('common.change')}
              </button>
            </div>

            {/* Model info display settings */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <InformationCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.modelInfo.title')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isHideModelInfo ? t('settings.modelInfo.hidden') : t('settings.modelInfo.visible')}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleModelInfo}
                disabled={isUpdatingModelInfo}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  !isHideModelInfo ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                role="switch"
                aria-checked={!isHideModelInfo}
              >
                {isUpdatingModelInfo ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      !isHideModelInfo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                )}
              </button>
            </div>
          </motion.div>
        );

      case 'models':
        return (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3 pr-2"
          >
            {/* Model configuration */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Cog6ToothIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.modelConfig.title')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {configuredModelsCount > 0 
                      ? t('settings.modelConfig.configured', { count: configuredModelsCount })
                      : t('settings.modelConfig.notConfigured')
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModelConfigModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {t('settings.modelConfig.configureButton')}
              </button>
            </div>
          </motion.div>
        );

      case 'data':
        return (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3 pr-2"
          >
            {/* Archived chats management */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <ServerIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.data.archivedChats')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('settings.data.archivedChatsDescription')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowArchivedChatsModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {t('settings.data.manage')}
              </button>
            </div>

            {/* Archive all chats */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <ServerIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.data.archiveAllChats')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('settings.data.archiveAllChatsDescription')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowArchiveAllConfirm(true)}
                disabled={isArchivingAll}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isArchivingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('settings.data.archiveAllLoading')}
                  </>
                ) : (
                  t('settings.data.archiveAll')
                )}
              </button>
            </div>

            {/* Delete all chats */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <ServerIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.data.deleteAllChats')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('settings.data.deleteAllChatsDescription')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                disabled={isDeletingAll}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('settings.data.deleteAllLoading')}
                  </>
                ) : (
                  t('settings.data.deleteAll')
                )}
              </button>
            </div>

          </motion.div>
        );

      default:
        return null;
    }
  }, [activeTab, theme, toggleTheme, t, i18n, isHideModelInfo, handleToggleModelInfo, isUpdatingModelInfo, configuredModelsCount, setShowModelConfigModal, setShowArchivedChatsModal, isArchivingAll, setShowArchiveAllConfirm, setShowDeleteAllConfirm, isDeletingAll]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('settings.title')}
        maxWidth="2xl"
        className='w-[640px]'
        closeOnBackdropClick={true}
        zIndex={998}
      >
        {/* Tab navigation and content */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-1 h-auto md:h-80">
          {/* Tab navigation - Top on md screens, left on larger screens */}
          <div className="md:w-36 flex-shrink-0">
            <nav className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Vertical separator - Only show on larger screens */}
          <div className="hidden md:block relative flex-shrink-0">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="w-4"></div>
          </div>

          {/* Right content area */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>
      </Modal>

      {/* Model Configuration Modal */}
      <ModelConfigModal
        isOpen={showModelConfigModal}
        onClose={() => setShowModelConfigModal(false)}
      />

      {/* Archived Chats Modal */}
      <ArchivedChatsModal
        isOpen={showArchivedChatsModal}
        onClose={() => setShowArchivedChatsModal(false)}
      />

      {/* Archive All Chats Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showArchiveAllConfirm}
        onClose={() => setShowArchiveAllConfirm(false)}
        onConfirm={_handleArchiveAllChats}
        title={t('settings.data.archiveAllTitle')}
        message={t('settings.data.archiveAllMessage')}
        confirmText={t('settings.data.archiveAll')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
        isLoading={isArchivingAll}
      />

      {/* Delete All Chats Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={_handleDeleteAllChats}
        title={t('settings.data.deleteAllTitle')}
        message={t('settings.data.deleteAllMessage')}
        confirmText={t('settings.data.deleteAll')}
        cancelText={t('common.cancel')}
        type="danger"
        maxWidth="md"
        isLoading={isDeletingAll}
      />
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default SettingsModal;
