/**
 * @file useAuthContext.ts
 * @description Auth context hook
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { createContext, useContext } from 'react';

// --- Internal Libraries ---
// --- Types ---
import type { User } from '@/types/auth';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface AuthContextType {
  user: User | null;
}

// =================================================================================================
// Context
// =================================================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =================================================================================================
// Hooks
// =================================================================================================

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a AuthProvider');
  }
  return context;
};
