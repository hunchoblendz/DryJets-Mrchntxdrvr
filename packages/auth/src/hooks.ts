/**
 * React Authentication Hooks
 *
 * Provides React hooks and context for authentication state
 */

'use client';

import * as React from 'react';
import { createBrowserClient, getSession, signIn, signOut } from './client';
import type { AuthUser, AuthSession, SignInCredentials, AuthResult } from './types';

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResult<AuthSession>>;
  signOut: () => Promise<AuthResult<null>>;
  refreshSession: () => Promise<void>;
}

// Create context
const AuthContext = React.createContext<AuthContextType | null>(null);

// Provider props
interface AuthProviderProps {
  children: React.ReactNode;
  initialSession?: AuthSession | null;
}

/**
 * AuthProvider - Wrap your app to provide auth context
 */
export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const [session, setSession] = React.useState<AuthSession | null>(initialSession);
  const [isLoading, setIsLoading] = React.useState(!initialSession);

  // Initialize auth state
  React.useEffect(() => {
    const initAuth = async () => {
      if (initialSession) {
        setIsLoading(false);
        return;
      }

      const result = await getSession();
      if (result.data) {
        setSession(result.data);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [initialSession]);

  // Listen for auth state changes
  React.useEffect(() => {
    const client = createBrowserClient();

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else if (supabaseSession) {
          const result = await getSession();
          if (result.data) {
            setSession(result.data);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in handler
  const handleSignIn = React.useCallback(async (credentials: SignInCredentials) => {
    setIsLoading(true);
    const result = await signIn(credentials);
    if (result.data) {
      setSession(result.data);
    }
    setIsLoading(false);
    return result;
  }, []);

  // Sign out handler
  const handleSignOut = React.useCallback(async () => {
    setIsLoading(true);
    const result = await signOut();
    if (!result.error) {
      setSession(null);
    }
    setIsLoading(false);
    return result;
  }, []);

  // Refresh session
  const refreshSession = React.useCallback(async () => {
    const result = await getSession();
    if (result.data) {
      setSession(result.data);
    }
  }, []);

  const value: AuthContextType = {
    user: session?.user || null,
    session,
    isLoading,
    isAuthenticated: !!session,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

/**
 * useAuth - Main auth hook
 * Provides access to auth state and methods
 */
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * useUser - Quick access to current user
 */
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * useSession - Quick access to current session
 */
export function useSession(): AuthSession | null {
  const { session } = useAuth();
  return session;
}

/**
 * useRequireAuth - Redirect if not authenticated
 * Use in pages that require authentication
 */
export function useRequireAuth(redirectUrl: string = '/login'): {
  user: AuthUser | null;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = redirectUrl;
    }
  }, [user, isLoading, redirectUrl]);

  return { user, isLoading };
}

/**
 * useRequireRole - Check if user has required role
 */
export function useRequireRole(
  allowedRoles: string[],
  redirectUrl: string = '/unauthorized'
): {
  user: AuthUser | null;
  isLoading: boolean;
  hasRole: boolean;
} {
  const { user, isLoading } = useAuth();
  const hasRole = user ? allowedRoles.includes(user.role) : false;

  React.useEffect(() => {
    if (!isLoading && user && !hasRole) {
      window.location.href = redirectUrl;
    }
  }, [user, isLoading, hasRole, redirectUrl]);

  return { user, isLoading, hasRole };
}
