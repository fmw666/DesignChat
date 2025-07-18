/**
 * @file App.tsx
 * @description Main application entry point with routing and providers setup.
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import type { FC } from 'react';

// --- Third-party Libraries ---
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Internal Libraries ---
// --- Components ---
import ProtectedRoute from '@/components/features/auth/ProtectedRoute';
import CustomToaster from '@/components/shared/common/CustomToaster';
// --- Pages ---
import Assets from '@/pages/Assets';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import TestsIndex from '@/pages/Tests';
import ChatTest from '@/pages/Tests/ChatTest';
import StorageTest from '@/pages/Tests/StorageTest';
import SupabaseTest from '@/pages/Tests/SupabaseTest';
// --- Providers ---
import { AuthProvider } from '@/providers/AuthProvider';
import ContextMenuProvider from '@/providers/ContextMenuProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// =================================================================================================
// Constants
// =================================================================================================

const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  CHAT_NEW: '/chat/new',
  CHAT_WITH_ID: '/chat/:chatId',
  TESTS: '/tests',
  TEST_CHAT: '/test/chat',
  TEST_STORAGE: '/test/storage',
  TEST_SUPABASE: '/test/supabase',
  ASSETS: '/assets',
  WILDCARD: '*',
} as const;

// =================================================================================================
// Component
// =================================================================================================

const App: FC = () => {
  // --- Render Logic ---
  return (
    <ThemeProvider>
      <AuthProvider>
        <ContextMenuProvider>
          <CustomToaster />
          <Routes>
            {/* Redirect root to new chat */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CHAT_NEW} replace />} />
            
            {/* Redirect /chat to new chat */}
            <Route path={ROUTES.CHAT} element={<Navigate to={ROUTES.CHAT_NEW} replace />} />
            
            {/* Chat routes */}
            <Route path={ROUTES.CHAT_WITH_ID} element={<Chat />} />
            
            {/* Protected assets route */}
            <Route path={ROUTES.ASSETS} element={<ProtectedRoute><Assets /></ProtectedRoute>} />

            {/* Tests route */}
            <Route path={ROUTES.TESTS} element={<TestsIndex />} />

            {/* Test route */}
            <Route path={ROUTES.TEST_CHAT} element={<ChatTest />} />

            {/* Storage test route */}
            <Route path={ROUTES.TEST_STORAGE} element={<StorageTest />} />
            
            {/* Supabase test route */}
            <Route path={ROUTES.TEST_SUPABASE} element={<SupabaseTest />} />

            {/* 404 catch-all route */}
            <Route path={ROUTES.WILDCARD} element={<NotFound />} />
          </Routes>
        </ContextMenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default App;
