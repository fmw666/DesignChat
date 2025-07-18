/**
 * @file ModelConfigModal.tsx
 * @description Modal component for configuring AI model settings with expandable details
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { CheckCircleIcon, XCircleIcon, ChevronRightIcon, EyeIcon, EyeSlashIcon, InformationCircleIcon, Cog6ToothIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import { Modal } from '@/components/shared/common/Modal';
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
import { useModel } from '@/hooks/model';
// --- Services ---
import { TestStatus } from '@/services/model';

// --- Relative Imports ---
import ModelDetailModal from './ModelDetailModal';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ModelConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  arkApiKey?: string;
  systemPrompt: string;
  testStatus: number | null; // 0: not tested, 1: testing, 2: tested failed, 3: tested passed
  isTesting: boolean;
  isExpanded: boolean;
  showApiKey: boolean;
  showApiSecret: boolean;
  showArkApiKey?: boolean;
  isEditing: boolean;
  tempApiKey: string;
  tempApiSecret: string;
  tempArkApiKey?: string;
  tempSystemPrompt: string;
}

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_MODELS: Omit<ModelConfig, 'isExpanded' | 'showApiKey' | 'showApiSecret' | 'showArkApiKey' | 'isEditing' | 'tempApiKey' | 'tempApiSecret' | 'tempArkApiKey' | 'tempSystemPrompt'>[] = [
  {
    id: 'doubao',
    name: '豆包',
    enabled: false,
    apiKey: '',
    apiSecret: '',
    arkApiKey: '',
    systemPrompt: '',
    testStatus: TestStatus.NOT_TESTED,
    isTesting: false,
  },
  {
    id: 'tongyi',
    name: '通义万相',
    enabled: false,
    apiKey: '',
    apiSecret: '',
    systemPrompt: '',
    testStatus: TestStatus.NOT_TESTED,
    isTesting: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    enabled: false,
    apiKey: '',
    apiSecret: '', // 保持字段但不渲染
    systemPrompt: '',
    testStatus: TestStatus.NOT_TESTED,
    isTesting: false,
  }
];

const TEST_DELAY_MS = 2000;
const SUCCESS_RATE = 0.7; // 70% success rate for testing

// =================================================================================================
// Component
// =================================================================================================

export const ModelConfigModal: FC<ModelConfigModalProps> = ({ isOpen, onClose }) => {
  // --- State and Refs ---
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModelForDetail, setSelectedModelForDetail] = useState<string | null>(null);

  // --- Hooks ---
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    modelConfigs,
    toggleModelEnabled,
    updateModelTestStatus,
    updateModelConfigJson
  } = useModel();

  // --- Logic and Event Handlers ---
  const initializeModels = useCallback(() => {
    const initializedModels = DEFAULT_MODELS.map(model => ({
      ...model,
      isExpanded: false,
      showApiKey: false,
      showApiSecret: false,
      showArkApiKey: false,
      isEditing: false,
      tempApiKey: model.apiKey,
      tempApiSecret: model.apiSecret,
      tempArkApiKey: model.arkApiKey ?? '',
      tempSystemPrompt: model.systemPrompt,
    }));
    setModels(initializedModels);
  }, []);

  const loadModelConfigs = useCallback(() => {
    setModels(prevModels =>
      prevModels.map(model => {
        const modelConfig = modelConfigs.find(mc => mc.model_id === model.id);
        if (modelConfig) {
          return {
            ...model,
            enabled: modelConfig.enabled ?? false,
            apiKey: modelConfig.config_json?.api_key ?? '',
            apiSecret: modelConfig.config_json?.api_secret ?? '',
            arkApiKey: modelConfig.config_json?.ark_api_key ?? '',
            systemPrompt: modelConfig.config_json?.system_prompt ?? '',
            testStatus: modelConfig.test_status,
            tempApiKey: modelConfig.config_json?.api_key ?? '',
            tempApiSecret: modelConfig.config_json?.api_secret ?? '',
            tempArkApiKey: modelConfig.config_json?.ark_api_key ?? '',
            tempSystemPrompt: modelConfig.config_json?.system_prompt ?? '',
          };
        }
        return model;
      })
    );
  }, [modelConfigs]);

  const handleModelToggle = useCallback((modelId: string, enabled: boolean) => {
    toggleModelEnabled(modelId, enabled)
  }, [toggleModelEnabled]);

  const handleModelConfigChange = useCallback((modelId: string, field: 'apiKey' | 'apiSecret' | 'arkApiKey' | 'systemPrompt', value: string) => {
    setModels(models => models.map(model => model.id === modelId ? { ...model, [field]: value, testStatus: TestStatus.NOT_TESTED } : model));
  }, []);

  const handleTestConnection = useCallback(async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    if (model.id === 'openai') {
      if (!model.apiKey) {
        toast.error(t('settings.models.testConnectionError'));
        return;
      }
    } else if (model.id === 'doubao') {
      if (!model.apiKey || !model.apiSecret || !model.arkApiKey) {
        toast.error(t('settings.models.testConnectionError'));
        return;
      }
    } else {
      if (!model.apiKey || !model.apiSecret) {
        toast.error(t('settings.models.testConnectionError'));
        return;
      }
    }
    setModels(prevModels =>
      prevModels.map(m =>
        m.id === modelId ? { ...m, isTesting: true, testStatus: TestStatus.TESTING } : m
      )
    );
    try {
      await new Promise(resolve => setTimeout(resolve, TEST_DELAY_MS));
      const isSuccess = Math.random() > (1 - SUCCESS_RATE);
      const testStatus = isSuccess ? TestStatus.TESTED_PASSED : TestStatus.TESTED_FAILED;
      updateModelTestStatus(modelId, testStatus);
      setModels(prevModels =>
        prevModels.map(m =>
          m.id === modelId ? { ...m, isTesting: false, testStatus } : m
        )
      );
      if (isSuccess) {
        toast.success(t('settings.models.testConnectionSuccess'));
      } else {
        toast.error(t('settings.models.testConnectionFailed'));
      }
    } catch (error) {
      setModels(prevModels =>
        prevModels.map(m =>
          m.id === modelId ? { ...m, isTesting: false, testStatus: TestStatus.TESTED_FAILED } : m
        )
      );
      toast.error(t('settings.models.testConnectionError'));
    }
  }, [models, t, updateModelTestStatus]);

  const handleToggleExpand = useCallback((modelId: string) => {
    const currentModel = models.find(m => m.id === modelId);
    const willExpand = !currentModel?.isExpanded;
    
    if (willExpand) {
      // 立即展开
      setModels(prevModels => 
        prevModels.map(m => ({
          ...m,
          isExpanded: m.id === modelId ? true : false,
        }))
      );
    } else {
      setModels(prevModels => 
        prevModels.map(m => ({
          ...m,
          isExpanded: false,
          // 只有在不处于编辑状态时才重置编辑状态
          ...(m.id === modelId && !m.isEditing ? {
            isEditing: false,
            tempApiKey: m.apiKey,
            tempApiSecret: m.apiSecret,
            tempArkApiKey: m.arkApiKey ?? '',
            tempSystemPrompt: m.systemPrompt,
          } : {})
        }))
      );
    }
  }, [models]);

  const handleToggleApiKeyVisibility = useCallback((modelId: string, field: 'showApiKey' | 'showApiSecret' | 'showArkApiKey') => {
    setModels(prevModels => 
      prevModels.map(m => 
        m.id === modelId ? { ...m, [field]: !m[field] } : m
      )
    );
  }, []);

  const handleShowModelDetail = useCallback((modelId: string) => {
    setSelectedModelForDetail(modelId);
  }, []);

  const handleCloseModelDetail = useCallback(() => {
    setSelectedModelForDetail(null);
  }, []);

  const handleStartEditing = useCallback((modelId: string) => {
    setModels(prevModels => 
      prevModels.map(m => {
        const updatedModel = m.id === modelId ? { 
          ...m, 
          isEditing: true,
          tempApiKey: m.apiKey,
          tempApiSecret: m.apiSecret,
          tempArkApiKey: m.arkApiKey ?? '',
          tempSystemPrompt: m.systemPrompt,
        } : m;
        return updatedModel;
      })
    );
  }, []);

  const handleCancelEditing = useCallback((modelId: string) => {
    setModels(prevModels => 
      prevModels.map(m => 
        m.id === modelId ? { 
          ...m, 
          isEditing: false,
          tempApiKey: m.apiKey,
          tempApiSecret: m.apiSecret,
          tempArkApiKey: m.arkApiKey ?? '',
          tempSystemPrompt: m.systemPrompt,
        } : m
      )
    );
  }, []);

  const handleSaveEditing = useCallback(async (modelId: string) => {
    if (!user?.id) return;
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    const updatedModels = models.map(m => 
      m.id === modelId ? { 
        ...m, 
        isEditing: false,
        apiKey: m.tempApiKey,
        apiSecret: m.tempApiSecret,
        arkApiKey: m.tempArkApiKey ?? '',
        systemPrompt: m.tempSystemPrompt,
        testStatus: TestStatus.NOT_TESTED, // Reset connection status when config changes
      } : m
    );
    setModels(updatedModels);
    try {
      const updatedModel = updatedModels.find(m => m.id === modelId);
      if (updatedModel) {
        const configJson: any = {
          api_key: updatedModel.apiKey,
          api_secret: updatedModel.apiSecret,
          system_prompt: updatedModel.systemPrompt,
        };
        if (modelId === 'doubao') {
          configJson.ark_api_key = updatedModel.arkApiKey;
        }
        updateModelConfigJson(modelId, configJson);
      }
      toast.success(t('settings.models.configUpdated'));
    } catch (error) {
      console.error('Error updating model config:', error);
      toast.error(t('settings.models.configUpdateFailed'));
    }
  }, [models, user, t, updateModelConfigJson]);

  const handleTempConfigChange = useCallback((modelId: string, field: 'tempApiKey' | 'tempApiSecret' | 'tempArkApiKey' | 'tempSystemPrompt', value: string) => {
    setModels(prevModels => 
      prevModels.map(m => 
        m.id === modelId ? { ...m, [field]: value } : m
      )
    );
  }, []);

  // --- Side Effects ---
  useEffect(() => {
    if (isOpen) {
      initializeModels();
      loadModelConfigs();
    }
  }, [isOpen, initializeModels, loadModelConfigs]);

  // --- Render Logic ---
  // Render API field (hidden/visible)
  const renderApiField = useCallback((model: ModelConfig, field: 'apiKey' | 'apiSecret' | 'arkApiKey', showField: 'showApiKey' | 'showApiSecret' | 'showArkApiKey') => {
    const value = model.isEditing ? model[field === 'apiKey' ? 'tempApiKey' : field === 'apiSecret' ? 'tempApiSecret' : 'tempArkApiKey'] : model[field];
    const isVisible = model[showField] ?? false;
    const isDisabled = !model.isEditing;
    return (
      <div className="relative">
        <div className="flex items-center">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {field === 'apiKey' ? (
              <KeyIcon className="h-4 w-4 text-gray-400" />
            ) : field === 'apiSecret' ? (
              <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <KeyIcon className="h-4 w-4 text-green-400" />
            )}
          </div>
          <input
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(e) => {
              if (model.isEditing) {
                handleTempConfigChange(model.id, field === 'apiKey' ? 'tempApiKey' : field === 'apiSecret' ? 'tempApiSecret' : 'tempArkApiKey', e.target.value);
              } else {
                handleModelConfigChange(model.id, field, e.target.value);
              }
            }}
            disabled={isDisabled}
            placeholder={
              field === 'apiKey'
                ? t('settings.models.table.apiKeyPlaceholder')
                : field === 'apiSecret'
                ? t('settings.models.table.apiSecretPlaceholder')
                : 'Ark API Key'
            }
            className={`block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => handleToggleApiKeyVisibility(model.id, showField)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          >
            {isVisible ? (
              <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>
    );
  }, [handleTempConfigChange, handleModelConfigChange, t, handleToggleApiKeyVisibility]);

  // Render status badge
  const renderStatusBadge = useCallback((model: ModelConfig) => {
    if (model.isTesting) {
      return (
        <div className="flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {t('settings.models.table.testing')}
          </span>
        </div>
      );
    }
    
    if (model.testStatus === null || model.testStatus === TestStatus.NOT_TESTED) {
      return (
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('settings.models.table.notTested')}
          </span>
        </div>
      );
    }
    
    if (model.testStatus === TestStatus.TESTED_PASSED) {
      return (
        <div className="flex items-center px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
          <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            {t('settings.models.table.connected')}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
        <XCircleIcon className="w-3 h-3 text-red-500 mr-1" />
        <span className="text-xs font-medium text-red-700 dark:text-red-300">
          {t('settings.models.table.failed')}
        </span>
      </div>
    );
  }, [t]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('settings.modelConfig.modalTitle')}
        maxWidth="4xl"
        closeOnBackdropClick={true}
        zIndex={999}
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl">
                <Cog6ToothIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  {t('settings.models.configurationTitle')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.models.configurationDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid gap-6">
            {models.map((model) => (
              <motion.div
                key={model.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Model Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleModelToggle(model.id, !model.enabled)}
                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          model.enabled 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={model.enabled}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                            model.enabled ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Model Info */}
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                          {model.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {model.enabled ? t('settings.models.enabled') : t('settings.models.disabled')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Badge */}
                      {renderStatusBadge(model)}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(model.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {model.isTesting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              {t('settings.models.table.testing')}
                            </>
                          ) : (
                            t('settings.models.table.testButton')
                          )}
                        </button>

                        <button
                          onClick={() => handleShowModelDetail(model.id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <InformationCircleIcon className="w-4 h-4 mr-2" />
                          {t('settings.models.table.modelDetail')}
                        </button>

                        <button
                          onClick={() => handleToggleExpand(model.id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <motion.div
                            animate={{ rotate: model.isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="mr-2"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </motion.div>
                          {model.isExpanded ? (
                            t('settings.models.table.hideDetails')
                          ) : (
                            t('settings.models.table.showDetails')
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence mode="wait">
                  {model.isExpanded && (
                    <motion.div
                      key={`${model.id}-details`}
                      initial={{ opacity: 0, maxHeight: 0 }}
                      animate={{ opacity: 1, maxHeight: 500 }}
                      exit={{ opacity: 0, maxHeight: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: "easeInOut"
                      }}
                      className="bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
                    >
                      <div className="p-6 space-y-6">
                        {/* Edit Mode Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('settings.models.configurationDetails')}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!model.isEditing ? (
                              <button
                                onClick={() => handleStartEditing(model.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t('settings.models.edit')}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCancelEditing(model.id)}
                                  className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  {t('settings.models.cancel')}
                                </button>
                                <button
                                  onClick={() => handleSaveEditing(model.id)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {t('settings.models.save')}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Configuration Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* API Key */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t('settings.models.table.apiKey')}
                            </label>
                            {renderApiField(model, 'apiKey', 'showApiKey')}
                          </div>

                          {/* API Secret */}
                          {model.id !== 'openai' && (
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('settings.models.table.apiSecret')}
                              </label>
                              {renderApiField(model, 'apiSecret', 'showApiSecret')}
                            </div>
                          )}

                          {/* Ark API Key */}
                          {model.id === 'doubao' && (
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Ark API Key
                              </label>
                              {renderApiField(model, 'arkApiKey', 'showArkApiKey')}
                            </div>
                          )}
                        </div>

                        {/* System Prompt */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('settings.models.table.systemPrompt')}
                            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                              {t('settings.models.table.systemPromptHint')}
                            </span>
                          </label>
                          <textarea
                            value={model.isEditing ? model.tempSystemPrompt : model.systemPrompt}
                            onChange={(e) => {
                              if (model.isEditing) {
                                handleTempConfigChange(model.id, 'tempSystemPrompt', e.target.value);
                              } else {
                                handleModelConfigChange(model.id, 'systemPrompt', e.target.value);
                              }
                            }}
                            disabled={!model.isEditing}
                            placeholder={t('settings.models.table.systemPromptPlaceholder')}
                            rows={4}
                            className={`block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 ${
                              !model.isEditing ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Model Detail Modal */}
      <ModelDetailModal
        isOpen={!!selectedModelForDetail}
        onClose={handleCloseModelDetail}
        modelId={selectedModelForDetail || ''}
      />
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ModelConfigModal;
