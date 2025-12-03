/**
 * Middleware Utilities
 *
 * Helper functions for Next.js middleware authentication
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Create Supabase client for middleware
 */
function createMiddlewareClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, response };
}

/**
 * Auth middleware options
 */
interface AuthMiddlewareOptions {
  /** Routes that don't require authentication */
  publicRoutes?: string[];
  /** Routes that require specific roles */
  roleProtectedRoutes?: Record<string, string[]>;
  /** URL to redirect unauthenticated users */
  loginUrl?: string;
  /** URL to redirect unauthorized users */
  unauthorizedUrl?: string;
}

/**
 * Create auth middleware
 *
 * Usage in middleware.ts:
 * ```ts
 * import { authMiddleware } from '@dryjets/auth/middleware';
 *
 * export default authMiddleware({
 *   publicRoutes: ['/', '/login', '/signup'],
 *   roleProtectedRoutes: {
 *     '/admin': ['ADMIN'],
 *     '/merchant': ['MERCHANT', 'ADMIN'],
 *   },
 * });
 * ```
 */
export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    publicRoutes = ['/', '/login', '/signup', '/auth'],
    roleProtectedRoutes = {},
    loginUrl = '/login',
    unauthorizedUrl = '/unauthorized',
  } = options;

  return async function middleware(request: NextRequest) {
    const { supabase, response } = createMiddlewareClient(request);
    const pathname = request.nextUrl.pathname;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session and route is protected, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL(loginUrl, request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If session exists, check role-protected routes
    if (session) {
      const userRole = session.user.user_metadata?.role || 'CUSTOMER';

      for (const [routePattern, allowedRoles] of Object.entries(roleProtectedRoutes)) {
        if (pathname.startsWith(routePattern)) {
          if (!allowedRoles.includes(userRole)) {
            return NextResponse.redirect(new URL(unauthorizedUrl, request.url));
          }
          break;
        }
      }
    }

    return response;
  };
}

/**
 * Protect a specific route in API handlers
 *
 * Usage in API route:
 * ```ts
 * import { protectedRoute } from '@dryjets/auth/middleware';
 *
 * export const GET = protectedRoute(['MERCHANT', 'ADMIN'], async (request, user) => {
 *   // Handle request with authenticated user
 * });
 * ```
 */
export function protectedRoute(
  allowedRoles: string[] = [],
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async function (request: NextRequest) {
    const { supabase } = createMiddlewareClient(request);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.user_metadata?.role || 'CUSTOMER';

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      role: userRole,
      ...session.user.user_metadata,
    };

    return handler(request, user);
  };
}
