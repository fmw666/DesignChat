/**
 * @file authStore.ts
 * @description Authentication store for managing user authentication state and operations.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Third-party Libraries ---
import { create } from 'zustand';

// --- Internal Libraries ---
// --- Services ---
import { authService } from '@/services/auth/authService';
// --- Types ---
import type { User } from '@/types/auth';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface AuthState {
  // --- State ---
  isInitialized: boolean;
  isLoading: boolean;
  user: User | null;

  // --- State Setters ---
  setIsInitialized: (isInitialized: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setUser: (user: User | null) => void;

  // --- Operations ---
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_IS_INITIALIZED = false;
const DEFAULT_IS_LOADING = false;
const DEFAULT_USER = null;

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Authentication store for managing user authentication state
 * Provides user management, authentication operations, and state persistence
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // --- Initial State ---
  isInitialized: DEFAULT_IS_INITIALIZED,
  isLoading: DEFAULT_IS_LOADING,
  user: DEFAULT_USER,

  // --- State Setters ---
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setUser: (user: User | null) => set({ user }),

  // --- Authentication Operations ---
  /**
   * Initialize authentication state and set up auth state listener
   * 1. check if already initialized or loading.
   * 2. load user info and set up auth state change listener.
   * 3. handle errors and ensure state consistency.
   */
  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    try {
      set(state => ({
        ...state,
        isLoading: true
      }));

      const user = await authService.getSession();
      
      set(state => ({
        ...state,
        user,
        isLoading: false,
        isInitialized: true
      }));
    } catch (error) {
      console.error('[AuthStore] Error initializing auth:', error);
      set(state => ({
        ...state,
        user: null,
        isLoading: false,
        isInitialized: true
      }));
    }

    // Set up authentication state change listener
    authService.onAuthStateChange((_event, session) => {
      if (session) {
        set(state => ({
          ...state,
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
            user_metadata: session.user.user_metadata
          }
        }));
      } else {
        set(state => ({
          ...state,
          user: null
        }));
      }
    });
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { setUser } = get();
    try {
      await authService.signOut();
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('[AuthStore] Error signing out:', error);
      throw error;
    }
  },

  /**
   * Send verification code to user's email
   */
  sendVerificationCode: async (email: string) => {
    try {
      await authService.sendEmailVerification(email);
    } catch (error) {
      console.error('[AuthStore] Error sending verification code:', error);
      throw error;
    }
  },

  /**
   * Verify email verification code
   */
  verifyCode: async (email: string, code: string) => {
    try {
      await authService.verifyEmailCode(email, code);
    } catch (error) {
      console.error('[AuthStore] Error verifying code:', error);
      throw error;
    }
  },

  /**
   * Update user's display name
   */
  updateDisplayName: async (displayName: string) => {
    const { setUser } = get();
    try {
      const updatedUser = await authService.updateUserMetadata({ 
        display_name: displayName 
      });
      setUser(updatedUser);
    } catch (error) {
      console.error('[AuthStore] Error updating display name:', error);
      throw error;
    }
  },
}));
