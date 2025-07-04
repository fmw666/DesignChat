/**
 * @file ContextMenuProvider.tsx
 * @description Global context menu provider that manages menu state
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { type FC, createContext, useContext, useState, type ReactNode } from 'react';

import ContextMenu, { MenuItem } from '@/components/shared/common/ContextMenu';

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

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

// =================================================================================================
// Provider Component
// =================================================================================================

interface ContextMenuProviderProps {
  children: ReactNode;
}

export const ContextMenuProvider: FC<ContextMenuProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [anchor, setAnchor] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');

  const openMenu = (
    menuItems: MenuItem[], 
    menuPosition: { x: number; y: number }, 
    menuAnchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
  ) => {
    setItems(menuItems);
    setPosition(menuPosition);
    setAnchor(menuAnchor);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <ContextMenuContext.Provider
      value={{
        openMenu,
        closeMenu,
        isOpen,
        items,
        position,
        anchor
      }}
    >
      {children}
      <ContextMenu
        isOpen={isOpen}
        onClose={closeMenu}
        items={items}
        position={position}
        anchor={anchor}
      />
    </ContextMenuContext.Provider>
  );
};

// =================================================================================================
// Hook
// =================================================================================================

export const useContextMenu = (): ContextMenuContextType => {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ContextMenuProvider;
