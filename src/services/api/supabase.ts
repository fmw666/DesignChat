/**
 * @file supabase.ts
 * @description Supabase client initialization and user/auth type definitions.
 * @author fmw666@github
 */

// =================================================================================================
// Imports
// =================================================================================================

import { createClient } from '@supabase/supabase-js';

// =================================================================================================
// Environment Variables & Client
// =================================================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =================================================================================================
// Type Definitions
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
