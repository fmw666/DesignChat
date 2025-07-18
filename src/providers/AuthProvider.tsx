/**
 * @file AuthProvider.tsx
 * @description AuthProvider component, provides authentication context and login modal.
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useEffect, useState, useCallback } from 'react';
import type { FC, ReactNode } from 'react';

// --- Internal Libraries ---
// --- Components ---
import { SignInModal } from '@/components/features/auth/SignInModal';
// --- Hooks ---
import { useAuth } from '@/hooks/auth';
import { AuthContext } from '@/hooks/ui';
// --- Utils ---
import { eventBus, EVENT_NEED_SIGN_IN } from '@/utils/eventBus';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// =================================================================================================
// Component
// =================================================================================================

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  // --------------------------------------------------------------------------------
  // State and Refs
  // --------------------------------------------------------------------------------
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const { user } = useAuth();

  // --------------------------------------------------------------------------------
  // Logic and Event Handlers
  // --------------------------------------------------------------------------------
  const handleNeedSignIn = useCallback(() => {
    if (!user) setShowSignInModal(true);
  }, [user]);

  const handleCloseModal = useCallback(() => {
    setShowSignInModal(false);
  }, []);

  const handleSignInSuccess = useCallback(() => {
    setShowSignInModal(false);
  }, []);

  // --------------------------------------------------------------------------------
  // Side Effects
  // --------------------------------------------------------------------------------
  useEffect(() => {
    if (user) setShowSignInModal(false);
  }, [user]);

  useEffect(() => {
    eventBus.on(EVENT_NEED_SIGN_IN, handleNeedSignIn);
    return () => {
      eventBus.off(EVENT_NEED_SIGN_IN, handleNeedSignIn);
    };
  }, [handleNeedSignIn]);

  // --------------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------------
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
      <SignInModal
        isOpen={showSignInModal}
        onClose={handleCloseModal}
        onSuccess={handleSignInSuccess}
      />
    </AuthContext.Provider>
  );
};
