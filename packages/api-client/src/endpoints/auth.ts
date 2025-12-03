/**
 * Auth API Endpoints
 */

import { getApiClient } from '../client';
import type {
  LoginParams,
  RegisterParams,
  AuthResponse,
  AuthUser,
  ApiResponse,
} from '../types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: (params: LoginParams) =>
    getApiClient().post<AuthResponse>('/auth/login', params),

  /**
   * Register a new user
   */
  register: (params: RegisterParams) =>
    getApiClient().post<AuthResponse>('/auth/register', params),

  /**
   * Logout (invalidate token)
   */
  logout: () => getApiClient().post('/auth/logout'),

  /**
   * Get current user profile
   */
  me: () => getApiClient().get<ApiResponse<AuthUser>>('/auth/me'),

  /**
   * Refresh access token
   */
  refresh: (refreshToken: string) =>
    getApiClient().post<AuthResponse>('/auth/refresh', { refreshToken }),

  /**
   * Request password reset email
   */
  forgotPassword: (email: string) =>
    getApiClient().post('/auth/forgot-password', { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token: string, password: string) =>
    getApiClient().post('/auth/reset-password', { token, password }),

  /**
   * Verify email with token
   */
  verifyEmail: (token: string) =>
    getApiClient().post('/auth/verify-email', { token }),

  /**
   * Resend verification email
   */
  resendVerification: (email: string) =>
    getApiClient().post('/auth/resend-verification', { email }),

  /**
   * Change password (authenticated)
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    getApiClient().post('/auth/change-password', {
      currentPassword,
      newPassword,
    }),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<AuthUser>) =>
    getApiClient().patch<ApiResponse<AuthUser>>('/auth/profile', data),
};
