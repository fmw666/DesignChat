/**
 * @file ContextMenuProvider.tsx
 * @description Global context menu provider that manages menu state
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { type FC, useState, type ReactNode } from 'react';

// --- Internal Libraries ---
// --- Components ---
import ContextMenu, { MenuItem } from '@/components/shared/common/ContextMenu';
// --- Hooks ---
import { ContextMenuContext } from '@/hooks/ui/useContextMenu';

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
// Default Export
// =================================================================================================

export default ContextMenuProvider;
