/**
 * @file useMenuItems.ts
 * @description Hook for generating menu items configuration.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useCallback } from 'react';

// --- Core-related Libraries ---
import { useLocation } from 'react-router-dom';

// --- Third-party Libraries ---
import { 
  UserIcon, 
  Cog6ToothIcon, 
  PhotoIcon, 
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  to?: string;
  isLink?: boolean;
  isDanger?: boolean;
  showCondition?: () => boolean;
}

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useMenuItems = (
  onProfileClick: () => void,
  onSettingsClick: () => void,
  onSignOut: () => void,
  closeMenu?: () => void
): MenuItem[] => {
  // --- Hooks ---
  const location = useLocation();
  
  // --- Logic and Event Handlers ---
  const isAssetsPage = location.pathname.startsWith('/assets');

  const handleProfileClick = useCallback(() => {
    onProfileClick();
    closeMenu?.();
  }, [onProfileClick, closeMenu]);

  const handleSettingsClick = useCallback(() => {
    onSettingsClick();
    closeMenu?.();
  }, [onSettingsClick, closeMenu]);

  // --- Return menu items configuration ---
  return [
    {
      id: 'profile',
      icon: UserIcon,
      label: 'profile.title',
      onClick: handleProfileClick,
    },
    {
      id: 'settings',
      icon: Cog6ToothIcon,
      label: 'settings.title',
      onClick: handleSettingsClick,
    },
    {
      id: 'assets',
      icon: PhotoIcon,
      label: 'assets.title',
      to: '/assets',
      isLink: true,
      showCondition: () => !isAssetsPage,
    },
    {
      id: 'logout',
      icon: ArrowRightOnRectangleIcon,
      label: 'auth.logout',
      onClick: onSignOut,
      isDanger: true,
    },
  ];
};
