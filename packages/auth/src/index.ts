/**
 * @dryjets/auth - Authentication Package
 *
 * Provides Supabase authentication utilities for DryJets platform
 * Works with both client-side (browser) and server-side (Next.js API routes, middleware)
 */

// Types
export * from './types';

// Client utilities
export { createBrowserClient, getSession, signIn, signOut, signUp, resetPassword } from './client';

// Server utilities
export { createServerClient, getServerSession, validateSession } from './server';

// React hooks
export { useAuth, useUser, useSession, AuthProvider } from './hooks';

// Middleware helper
export { authMiddleware, protectedRoute } from './middleware';
