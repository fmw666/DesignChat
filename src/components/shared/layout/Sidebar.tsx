/**
 * @file Sidebar.tsx
 * @description 响应式侧边栏，支持聊天与资产分类切换，集成新建按钮与 Logo。
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useCallback } from 'react';
import type { FC } from 'react';

// --- Core-related Libraries ---
import { useNavigate } from 'react-router-dom';

// --- Third-party Libraries ---
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import AssetsCategory from '@/components/features/assets/AssetsCategory';
import ChatHistory from '@/components/features/chat/ChatHistory';
import { Logo } from '@/components/shared/common/Logo';
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
// --- Utils ---
import { eventBus, EVENT_NEED_SIGN_IN } from '@/utils/eventBus';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface SidebarProps {
  type?: 'chat' | 'assets';
}

// =================================================================================================
// Constants
// =================================================================================================

const NEW_CHAT_ROUTE = '/chat/new';

// =================================================================================================
// Component
// =================================================================================================

const Sidebar: FC<SidebarProps> = ({ type = 'chat' }) => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Logic and Event Handlers ---
  const handleNewClick = useCallback(() => {
    if (!user) {
      eventBus.emit(EVENT_NEED_SIGN_IN);
      return;
    }
    navigate(NEW_CHAT_ROUTE);
  }, [user, navigate]);

  // --- Render Logic ---
  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <Logo />
      {/* New Button */}
      <div className="px-4 mb-4">
        <motion.button
          onClick={handleNewClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </motion.button>
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {type === 'chat' ? <ChatHistory /> : <AssetsCategory />}
      </div>
    </aside>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default Sidebar; 
