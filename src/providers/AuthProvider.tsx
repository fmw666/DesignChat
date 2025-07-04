/**
 * @file AuthProvider.tsx
 * @description AuthProvider component, provides authentication context and login modal.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Core Libraries
import { createContext, useEffect, useState, FC, ReactNode, useCallback } from 'react';

// 2. Components
import { SignInModal } from '@/components/features/auth/SignInModal';

// 3. Hooks
import { useAuth } from '@/hooks/auth';

// 4. Services and Utilities
import { User } from '@/services/api';

import { eventBus, EVENT_NEED_SIGN_IN } from '@/utils/eventBus';


// =================================================================================================
// Type Definitions
// =================================================================================================

interface AuthContextType {
  user: User | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

// =================================================================================================
// Component
// =================================================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
