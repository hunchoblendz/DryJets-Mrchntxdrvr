/**
 * Server-side Authentication
 *
 * Use these functions in Next.js API routes, Server Components, and middleware
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { AuthUser, AuthSession, AuthResult } from './types';

/**
 * Create a server-side Supabase client
 * Must be called within a request context (API route, Server Component, or middleware)
 */
export async function createServerClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Get the current session from server-side
 */
export async function getServerSession(): Promise<AuthResult<AuthSession>> {
  try {
    const client = await createServerClient();
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
 * Validate that a session exists and optionally check role
 */
export async function validateSession(
  requiredRoles?: string[],
): Promise<{ valid: boolean; user: AuthUser | null; error: string | null }> {
  const { data: session, error } = await getServerSession();

  if (error || !session) {
    return { valid: false, user: null, error: 'Not authenticated' };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(session.user.role)) {
      return { valid: false, user: session.user, error: 'Insufficient permissions' };
    }
  }

  return { valid: true, user: session.user, error: null };
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
