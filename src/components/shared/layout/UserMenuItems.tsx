/**
 * @file UserMenuItems.tsx
 * @description 用户菜单组件，提供菜单项配置和组件用于用户菜单。
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { forwardRef } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Internal Libraries ---
// --- Hooks ---
import type { MenuItem } from '@/hooks/ui/useMenuItems';

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
const menuItemClasses = {
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

// Divider component
export const MenuDivider: FC = () => (
  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
);

// =================================================================================================
// Default Export
// =================================================================================================

export default MenuItemComponent;
