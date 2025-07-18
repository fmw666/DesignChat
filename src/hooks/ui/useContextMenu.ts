/**
 * @file useContextMenu.ts
 * @description Hook for accessing the ContextMenu context. Must be used within a ContextMenuProvider.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { createContext, useContext } from 'react';

// --- Internal Libraries ---
// --- Components ---
import { MenuItem } from '@/components/shared/common/ContextMenu';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface ContextMenuContextType {
  openMenu: (items: MenuItem[], position: { x: number; y: number }, anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  closeMenu: () => void;
  isOpen: boolean;
  items: MenuItem[];
  position: { x: number; y: number };
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// =================================================================================================
// Context
// =================================================================================================

export const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

// =================================================================================================
// Hooks
// =================================================================================================
export const useContextMenu = (): ContextMenuContextType => {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
