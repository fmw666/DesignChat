/**
 * @file ContextMenu.tsx
 * @description Global context menu component that can be positioned anywhere on the screen
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { createPortal } from 'react-dom';

// --- Third-party Libraries ---
import { motion, AnimatePresence } from 'framer-motion';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  position: { x: number; y: number };
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// =================================================================================================
// Component
// =================================================================================================

export const ContextMenu: FC<ContextMenuProps> = ({
  isOpen,
  onClose,
  items,
  position,
  anchor = 'bottom-right'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuDimensions, setMenuDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    const handleResize = () => {
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Add scroll listeners to all scrollable elements
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      // Measure menu dimensions after it's rendered
      setTimeout(() => {
        if (menuRef.current) {
          const rect = menuRef.current.getBoundingClientRect();
          setMenuDimensions({ width: rect.width, height: rect.height });
        }
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);

  // Calculate final position based on anchor and screen boundaries
  const getFinalPosition = () => {
    const { x, y } = position;
    const { width, height } = menuDimensions;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let finalX = x;
    let finalY = y;

    // Adjust based on anchor
    switch (anchor) {
      case 'top-left':
        finalX = x;
        finalY = y;
        break;
      case 'top-right':
        finalX = x - width;
        finalY = y;
        break;
      case 'bottom-left':
        finalX = x;
        finalY = y - height;
        break;
      case 'bottom-right':
        finalX = x - width;
        finalY = y - height;
        break;
    }

    // Ensure menu stays within screen bounds
    if (finalX < 0) finalX = 0;
    if (finalY < 0) finalY = 0;
    if (finalX + width > screenWidth) finalX = screenWidth - width;
    if (finalY + height > screenHeight) finalY = screenHeight - height;

    return { x: finalX, y: finalY };
  };

  const finalPosition = getFinalPosition();

  // Animation variants based on anchor
  const getAnimationVariants = () => {
    const baseVariants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    };

    switch (anchor) {
      case 'top-left':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: -10 },
          animate: { ...baseVariants.animate, y: 0 },
          exit: { ...baseVariants.exit, y: -10 }
        };
      case 'top-right':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: -10 },
          animate: { ...baseVariants.animate, y: 0 },
          exit: { ...baseVariants.exit, y: -10 }
        };
      case 'bottom-left':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: 10 },
          animate: { ...baseVariants.animate, y: 0 },
          exit: { ...baseVariants.exit, y: 10 }
        };
      case 'bottom-right':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: 10 },
          animate: { ...baseVariants.animate, y: 0 },
          exit: { ...baseVariants.exit, y: 10 }
        };
      default:
        return baseVariants;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-[9999] min-w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
        style={{
          left: finalPosition.x,
          top: finalPosition.y
        }}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              if (!item.disabled && !item.loading) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled || item.loading}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
              item.danger 
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ backgroundColor: (item.disabled || item.loading) ? undefined : 'rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: (item.disabled || item.loading) ? 1 : 0.98 }}
          >
            {item.icon && (
              <item.icon className={`w-4 h-4 flex-shrink-0 ${
                item.danger ? 'text-red-600 dark:text-red-400' : ''
              }`} />
            )}
            <span className="flex-1 text-left">{item.label}</span>
            {item.loading && (
              <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${
                item.danger ? 'border-red-500' : 'border-gray-500'
              }`} />
            )}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default ContextMenu;
