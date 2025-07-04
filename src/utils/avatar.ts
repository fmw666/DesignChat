/**
 * @file avatar.ts
 * @description Avatar utility functions for user avatar display and styling.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

// 1. Internal Types
import { User } from '@/services/api';

// =================================================================================================
// Type Definitions
// =================================================================================================

export type AvatarSize = 'sm' | 'md' | 'lg';

// =================================================================================================
// Constants
// =================================================================================================

const AVATAR_SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-24 h-24 text-4xl',
} as const;

const AVATAR_BASE_CLASSES = 'rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg';

const FALLBACK_AVATAR_TEXT = '?';

// =================================================================================================
// Utility Functions
// =================================================================================================

/**
 * Get user avatar display text (first letter of name or email)
 * @param user - User object or null
 * @returns Avatar display text (first letter uppercase)
 */
export const getAvatarText = (user: User | null): string => {
  if (!user) return FALLBACK_AVATAR_TEXT;
  
  // Priority: display_name first letter
  const displayName = user.user_metadata?.display_name;
  if (displayName) {
    return displayName.charAt(0).toUpperCase();
  }
  
  // Fallback: email username first letter
  return user.email.split('@')[0].charAt(0).toUpperCase();
};

/**
 * Get user avatar base style classes
 * @returns Avatar base style classes string
 */
export const getAvatarClasses = (): string => {
  return AVATAR_BASE_CLASSES;
};

/**
 * Get user avatar size-specific style classes
 * @param size - Size type: 'sm' | 'md' | 'lg'
 * @returns Size-specific style classes string
 */
export const getAvatarSizeClasses = (size: AvatarSize = 'md'): string => {
  return AVATAR_SIZE_CLASSES[size];
};
