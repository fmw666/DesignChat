/**
 * @file auth.ts
 * @description Shared types for auth functionality
 * @author fmw666@github
 * @date 2025-07-17
 */

// =================================================================================================
// Auth Types
// =================================================================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    display_name?: string;
    hide_model_info?: boolean;
    [key: string]: any;
  };
}

export interface AuthError {
  message: string;
  status?: number;
}
