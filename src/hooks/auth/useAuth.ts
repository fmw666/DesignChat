/**
 * @file useAuth.ts
 * @description Hook for managing authentication state and operations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// =================================================================================================
// Hook Definition
// =================================================================================================

export const useAuth = () => {
  const {
    user,
    isInitialized,
    initialize,
    isLoading,
    signOut,
    sendVerificationCode,
    verifyCode
  } = useAuthStore();

  // --- Side Effects ---
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // --- Return Values ---
  return {
    // State
    user,
    isLoading,
    isInitialized,
    
    // Operations
    signOut,
    sendVerificationCode,
    verifyCode
  };
};
