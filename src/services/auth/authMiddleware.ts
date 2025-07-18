/**
 * @file authMiddleware.ts
 * @description AuthMiddleware singleton for checking Supabase authentication and session validity.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

import { supabase } from '@/services/api/supabase';
import { authService } from '@/services/auth/authService';

// =================================================================================================
// Class Definition
// =================================================================================================

export class AuthMiddleware {
  // --------------------------------------------------------------------------------
  // Singleton Instance
  // --------------------------------------------------------------------------------
  private static instance: AuthMiddleware;

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  // --------------------------------------------------------------------------------
  // Auth Check Logic
  // --------------------------------------------------------------------------------
  public async checkAuth(): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // 清除本地用户状态
        authService.signOut();
        return false;
      }

      // 验证 token 是否过期
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        // token 过期，清除本地用户状态
        authService.signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }
}
