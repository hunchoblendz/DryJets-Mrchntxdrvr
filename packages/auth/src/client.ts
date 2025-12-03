/**
 * Browser/Client-side Authentication
 *
 * Use these functions in React components and client-side code
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import type { AuthUser, AuthSession, SignInCredentials, SignUpCredentials, AuthResult } from './types';

let browserClient: SupabaseClient | null = null;

/**
 * Create or get the browser Supabase client
 * Uses singleton pattern to avoid multiple instances
 */
export function createBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<AuthResult<AuthSession>> {
  try {
    const client = createBrowserClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      return { data: null, error: { code: error.name, message: error.message } };
    }

    if (!data.session) {
      return { data: null, error: null };
    }

    return {
      data: transformSession(data.session),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInCredentials): Promise<AuthResult<AuthSession>> {
  try {
    const client = createBrowserClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { data: null, error: { code: error.name, message: error.message } };
    }

    if (!data.session) {
      return { data: null, error: { code: 'NO_SESSION', message: 'No session returned' } };
    }

    return {
      data: transformSession(data.session),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(credentials: SignUpCredentials): Promise<AuthResult<AuthSession>> {
  try {
    const client = createBrowserClient();
    const { data, error } = await client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          phone: credentials.phone,
          role: credentials.role || 'CUSTOMER',
        },
      },
    });

    if (error) {
      return { data: null, error: { code: error.name, message: error.message } };
    }

    if (!data.session) {
      // Email confirmation required
      return {
        data: null,
        error: { code: 'CONFIRMATION_REQUIRED', message: 'Please check your email to confirm your account' },
      };
    }

    return {
      data: transformSession(data.session),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult<null>> {
  try {
    const client = createBrowserClient();
    const { error } = await client.auth.signOut();

    if (error) {
      return { data: null, error: { code: error.name, message: error.message } };
    }

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult<null>> {
  try {
    const client = createBrowserClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { data: null, error: { code: error.name, message: error.message } };
    }

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: { code: 'UNKNOWN', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

/**
 * Transform Supabase session to our AuthSession type
 */
function transformSession(session: Session): AuthSession {
  const user = session.user;
  const metadata = user.user_metadata || {};

  return {
    user: {
      id: user.id,
      email: user.email || '',
      phone: user.phone,
      firstName: metadata.first_name,
      lastName: metadata.last_name,
      role: metadata.role || 'CUSTOMER',
      merchantId: metadata.merchant_id,
      driverId: metadata.driver_id,
      customerId: metadata.customer_id,
      enterpriseId: metadata.enterprise_id,
      avatarUrl: metadata.avatar_url,
      emailVerified: !!user.email_confirmed_at,
      phoneVerified: !!user.phone_confirmed_at,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    },
    accessToken: session.access_token,
    refreshToken: session.refresh_token || '',
    expiresAt: session.expires_at || 0,
  };
}
