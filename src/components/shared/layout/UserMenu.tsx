/**
 * @file UserMenu.tsx
 * @description 用户菜单组件，提供下拉菜单用于用户操作和个人信息管理。
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { Fragment, useState, useCallback, useRef } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

// --- Internal Libraries ---
// --- Components ---
import { SettingsModal } from '@/components/features/user/SettingsModal';
import { UserProfileModal } from '@/components/features/user/UserProfileModal';
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
import { useMenuItems } from '@/hooks/ui/useMenuItems';
// --- Utils ---
import { getAvatarClasses, getAvatarSizeClasses, getAvatarText } from '@/utils/avatar';
import { EVENT_NEED_SIGN_IN, eventBus } from '@/utils/eventBus';

// --- Relative Imports ---
import { MenuItemComponent, MenuDivider } from './UserMenuItems';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface UserMenuProps {
  isCollapsed?: boolean;
}

// =================================================================================================
// Component
// =================================================================================================

const UserMenu: FC<UserMenuProps> = ({ isCollapsed }) => {
  // --- State and Refs ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const closeRef = useRef<() => void>(() => {});

  // --- Hooks ---
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  // --- Logic and Event Handlers ---
  const handleProfileClick = useCallback(() => {
    setIsProfileOpen(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const handleProfileClose = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleLoginClick = useCallback(() => {
    eventBus.emit(EVENT_NEED_SIGN_IN);
  }, []);

  const menuItems = useMenuItems(handleProfileClick, handleSettingsClick, handleSignOut, () => closeRef.current());

  // --- Render Logic ---
  if (!user) {
    return (
      <button
        onClick={handleLoginClick}
        className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        {!isCollapsed && (
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('auth.login')}</span>
        )}
      </button>
    );
  }

  return (
    <>
      <Menu as="div" className="relative">
        {({ open, close }) => {
          closeRef.current = close;

          return (
            <>
              <Menu.Button
                className={`flex w-full items-center gap-2 rounded-lg p-2 transition-colors ${
                  open
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 font-medium text-white shadow-sm dark:from-indigo-400 dark:to-purple-400">
                  <div className={`${getAvatarClasses()} ${getAvatarSizeClasses('sm')}`}>
                    <span>
                      {getAvatarText(user)}
                    </span>
                  </div>
                </div>
                {!isCollapsed && (
                  <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                    {user.email || t('auth.notLogin')}
                  </span>
                )}
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute bottom-full left-0 mb-2 w-48 origin-bottom-left rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:ring-white/10 z-[1000]">
                  {menuItems.map((item, index) => {
                    // Check if this menu item should be shown
                    if (item.showCondition && !item.showCondition()) {
                      return null;
                    }

                    // Add divider before logout button
                    const shouldAddDivider = item.id === 'logout' && index > 0;

                    return (
                      <Fragment key={item.id}>
                        {shouldAddDivider && <MenuDivider />}
                        <Menu.Item>
                          {({ active }) => (
                            <MenuItemComponent item={item} active={active} />
                          )}
                        </Menu.Item>
                      </Fragment>
                    );
                  })}
                </Menu.Items>
              </Transition>
            </>
          );
        }}
      </Menu>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={handleProfileClose}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
      />
    </>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default UserMenu;
