/**
 * @file authStore.ts
 * @description Authentication store for managing user authentication state and operations.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Third-party Libraries
import { create } from 'zustand';

// 2. Internal Services
import type { User } from '@/services/api';
import { authService } from '@/services/auth/authService';

// =================================================================================================
// Type Definitions
// =================================================================================================

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const DEFAULT_USER = null;
const DEFAULT_IS_INITIALIZED = false;
const DEFAULT_IS_LOADING = false;

// =================================================================================================
// Store Configuration
// =================================================================================================

/**
 * Authentication store for managing user authentication state
 * Provides user management, authentication operations, and state persistence
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // --- Initial State ---
  user: DEFAULT_USER,
  isInitialized: DEFAULT_IS_INITIALIZED,
  isLoading: DEFAULT_IS_LOADING,

  // --- State Setters ---
  setUser: (user: User | null) => set({ user }),
  setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  // --- Authentication Operations ---
  /**
   * Initialize authentication state and set up auth state listener
   */
  initialize: async () => {
    // Return early if already initialized or currently loading
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
      console.error('Error initializing auth:', error);
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
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Send verification code to user's email
   * @param email - User's email address
   */
  sendVerificationCode: async (email: string) => {
    try {
      await authService.sendEmailVerification(email);
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  },

  /**
   * Verify email verification code
   * @param email - User's email address
   * @param code - Verification code
   */
  verifyCode: async (email: string, code: string) => {
    try {
      await authService.verifyEmailCode(email, code);
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  },

  /**
   * Update user's display name
   * @param displayName - New display name
   */
  updateDisplayName: async (displayName: string) => {
    const { setUser } = get();
    try {
      const updatedUser = await authService.updateUserMetadata({ 
        display_name: displayName 
      });
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  },
}));
