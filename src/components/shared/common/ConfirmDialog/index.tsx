/**
 * @file ConfirmDialog.tsx
 * @description ConfirmDialog component for user confirmation.
 * @author fmw666@github
 */

import { FC, useCallback, useMemo } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/shared/common/Modal';
import type { ConfirmDialogProps, ConfirmDialogType } from './types';

// --- Constants ---

const DEFAULT_CONFIRM_TEXT = '确认';
const DEFAULT_CANCEL_TEXT = '取消';

const TYPE_STYLES: Record<ConfirmDialogType, { icon: string; button: string }> = {
  danger: {
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus-visible:ring-red-500',
  },
  warning: {
    icon: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 focus-visible:ring-amber-500',
  },
  info: {
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus-visible:ring-blue-500',
  },
};

// --- Component Definition ---

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = DEFAULT_CONFIRM_TEXT,
  cancelText = DEFAULT_CANCEL_TEXT,
  type = 'warning',
  maxWidth = 'sm',
  isLoading = false
}) => {
  // Early return if modal is not open to prevent unnecessary rendering
  if (!isOpen) return null;
  // --- State and Refs ---
  // No states or refs

  // --- Hooks ---
  const { t } = useTranslation();

  // --- Logic and Event Handlers ---
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  // --- Side Effects ---
  // No side effects

  // --- Render Logic ---
  const styles = useMemo(() => TYPE_STYLES[type], [type]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      showCloseButton={false}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-6 w-6 ${styles.icon}`} />
        </div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {t('common.processing')}...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};
