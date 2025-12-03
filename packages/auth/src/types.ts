/**
 * Authentication Types
 */

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'MERCHANT' | 'ADMIN' | 'ENTERPRISE';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  merchantId?: string;
  driverId?: string;
  customerId?: string;
  enterpriseId?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult<T = AuthSession> {
  data: T | null;
  error: AuthError | null;
}

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirectUrl?: string;
  cookieName?: string;
}
