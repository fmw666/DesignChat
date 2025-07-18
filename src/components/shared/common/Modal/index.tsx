/**
 * @file Modal/index.tsx
 * @description A robust, accessible, and nested-ready Modal component using Headless UI and React Portals.
 * It solves common issues with nested modals like event propagation and scroll locking by using a global, reactive modal stack.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { Fragment, ReactNode, useEffect, useState, useRef, useSyncExternalStore } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { createPortal } from 'react-dom';

// --- Third-party Libraries ---
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// --- Relative Imports ---
import { modalStackStore } from './modalStack';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  showBackdrop?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  zIndex?: number;
}

// =================================================================================================
// Constants
// =================================================================================================

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

// =================================================================================================
// Component
// =================================================================================================

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  maxWidth = 'md',
  showBackdrop = true,
  closeOnBackdropClick = true,
  className = '',
  zIndex = 999,
}) => {
  // --- State and Refs ---
  const [mounted, setMounted] = useState(false);
  // A unique, stable ID for each modal instance, created only once.
  const modalId = useRef(Math.random());

  // --- Hooks ---
  // Subscribe to the external modal stack store to get reactive updates.
  // This is the key to ensuring the modal is aware of its place in the stack.
  const stack = useSyncExternalStore(modalStackStore.subscribe, modalStackStore.getSnapshot);

  // --- Logic and Event Handlers ---
  // Check if this is the topmost modal based on the reactive stack state.
  const isTopmostModal = stack.length > 0 && stack[stack.length - 1] === modalId.current;

  // --- Side Effects ---
  // Effect for handling client-side-only portal rendering.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for managing this modal's presence in the global stack.
  // It pushes its ID when it opens and cleans up by popping its ID when it closes or unmounts.
  useEffect(() => {
    if (isOpen) {
      const id = modalId.current;
      modalStackStore.push(id);
      return () => {
        modalStackStore.pop(id);
      };
    }
  }, [isOpen]);

  // Effect for preventing body scroll when any modal is open.
  // This is more robust than a simple isOpen check as it accounts for nested modals.
  useEffect(() => {
    if (stack.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Ensure scroll is restored if the last modal unmounts.
    return () => {
      if (modalStackStore.getSnapshot().length === 0) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [stack]);

  // --- Render Logic ---
  const modalContent = (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative"
        style={{ zIndex }}
        // This is the crucial part: Headless UI's `onClose` handles backdrop clicks and Escape key presses.
        // We only allow it to trigger the `onClose` prop if this is the topmost modal and backdrop clicks are enabled.
        // For any other modal, it does nothing, preventing event leakage.
        onClose={isTopmostModal && closeOnBackdropClick ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {showBackdrop && (
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          )}
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all ${maxWidthClasses[maxWidth]} ${className}`}
              >
                {/* Header */}
                {showCloseButton && (
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                )}
                {/* Content area */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  // To prevent SSR errors, we only render the portal on the client-side after the component has mounted.
  if (!mounted) {
    return null;
  }
  
  // Use createPortal to render the modal at the top level of the DOM, avoiding z-index and clipping issues.
  return createPortal(modalContent, document.body);
};
