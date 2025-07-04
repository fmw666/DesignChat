/**
 * @file BaseSidebar.tsx
 * @description 响应式基础侧边栏布局，支持移动端与桌面端自适应，集成用户菜单。
 * @author fmw666@github
 */

// --- Imports ---
import { FC, useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

// --- Type Definitions ---
interface BaseSidebarProps {
  type: 'chat' | 'assets';
}

// --- Constants ---
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTH = 256; // 64 * 4 = 256px (w-64)

// --- Component Definition ---
const BaseSidebar: FC<BaseSidebarProps> = ({ type }) => {
  // --- State and Refs ---
  const [isMobileWidth, setIsMobileWidth] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // --- Logic and Event Handlers ---
  const handleResize = useCallback(() => {
    setIsMobileWidth(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // --- Side Effects ---
  useEffect(() => {
    handleResize(); // 初始化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- Render Logic ---
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端菜单按钮 - 在 md 断点以下显示，与标题垂直居中对齐 */}
      <div className="fixed top-0 left-0 h-14 z-40 md:hidden flex items-center px-4">
        <button
          type="button"
          className="group relative rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 ease-in-out shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/50"
          onClick={handleOpenSidebar}
        >
          <span className="sr-only">打开侧边栏</span>
          <Bars3Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
          {/* 悬停时的光晕效果 */}
          <span className="absolute inset-0 rounded-lg bg-indigo-50/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/10 transition-colors duration-200" />
        </button>
      </div>
      {/* 移动端侧边栏遮罩层 */}
      <Transition
        show={isMobileSidebarOpen}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
        onClick={handleCloseSidebar}
      />
      {/* 侧边栏 - 根据屏幕宽度决定定位方式 */}
      <Transition
        show={isMobileWidth ? isMobileSidebarOpen : true}
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
        className={
          isMobileWidth ? 'fixed inset-y-0 left-0 z-50' : 'relative'
        }
      >
        <div
          className="w-64 h-full backdrop-blur-sm dark:border-gray-800 flex-shrink-0 transition-all duration-300 relative shadow-md"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <Sidebar type={type} />
          {/* User Info at Bottom - 使用 fixed 定位确保在最上层 */}
          <div
            className={`${
              isMobileWidth ? 'fixed bottom-0 left-0' : 'absolute bottom-0 left-0'
            } w-64 p-4 border-t border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900 backdrop-blur-sm z-[1000]`}
            style={{ width: SIDEBAR_WIDTH }}
          >
            <UserMenu />
          </div>
        </div>
      </Transition>
    </div>
  );
};

// --- Default Export ---
export default BaseSidebar; 
