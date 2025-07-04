/**
 * @file UserMenuItems.tsx
 * @description 用户菜单组件，提供菜单项配置和组件用于用户菜单。
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { FC, forwardRef, useCallback } from 'react';

// 2. Third-party Libraries
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
// Constants
// =================================================================================================

const MENU_ITEM_BASE_CLASSES = "flex w-full items-center px-4 py-2 text-sm transition-colors";
const MENU_ITEM_DEFAULT_CLASSES = "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800";
const MENU_ITEM_ACTIVE_CLASSES = "bg-gray-50 dark:bg-gray-800";
const MENU_ITEM_DANGER_CLASSES = "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800";
const MENU_ITEM_ICON_CLASSES = "w-4 h-4 mr-2";
const MENU_ITEM_ICON_DEFAULT_CLASSES = "text-gray-500 dark:text-gray-400";
const MENU_ITEM_ICON_DANGER_CLASSES = "text-red-500 dark:text-red-400";

// =================================================================================================
// Component
// =================================================================================================

// Menu item style classes
export const menuItemClasses = {
  base: MENU_ITEM_BASE_CLASSES,
  default: MENU_ITEM_DEFAULT_CLASSES,
  active: MENU_ITEM_ACTIVE_CLASSES,
  danger: MENU_ITEM_DANGER_CLASSES,
  icon: MENU_ITEM_ICON_CLASSES,
  iconDefault: MENU_ITEM_ICON_DEFAULT_CLASSES,
  iconDanger: MENU_ITEM_ICON_DANGER_CLASSES,
};

// Menu item component - using forwardRef to support Headless UI ref passing
export const MenuItemComponent = forwardRef<HTMLElement, {
  item: MenuItem;
  active: boolean;
}>(({ item, active }, ref) => {
  // --- Hooks ---
  const { t } = useTranslation();
  
  // --- Logic and Event Handlers ---
  const className = `${menuItemClasses.base} ${
    active ? menuItemClasses.active : ''
  } ${
    item.isDanger ? menuItemClasses.danger : menuItemClasses.default
  }`;

  const iconClassName = `${menuItemClasses.icon} ${
    item.isDanger ? menuItemClasses.iconDanger : menuItemClasses.iconDefault
  }`;

  // --- Render Logic ---
  if (item.isLink && item.to) {
    return (
      <Link to={item.to} className={className} ref={ref as React.Ref<HTMLAnchorElement>}>
        <item.icon className={iconClassName} />
        {t(item.label)}
      </Link>
    );
  }

  return (
    <button onClick={item.onClick} className={className} ref={ref as React.Ref<HTMLButtonElement>}>
      <item.icon className={iconClassName} />
      {t(item.label)}
    </button>
  );
});

MenuItemComponent.displayName = 'MenuItemComponent';

// Menu item configuration hook
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

// Divider component
export const MenuDivider: FC = () => (
  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
);

// =================================================================================================
// Default Export
// =================================================================================================

export default MenuItemComponent;
