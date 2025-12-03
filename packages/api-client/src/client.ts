/**
 * API Client - Core client configuration
 *
 * Platform-agnostic axios client factory with auth interceptors
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError } from './types';

// Get base URL based on environment
function getBaseUrl(): string {
  // Check for environment variables in different contexts
  if (typeof process !== 'undefined' && process.env) {
    // Node.js / Next.js server-side
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      'http://localhost:3000/api/v1'
    );
  }
  // Browser fallback
  return 'http://localhost:3000/api/v1';
}

// Token getter type - platform-agnostic
export type TokenGetter = () => Promise<string | null> | string | null;

// Default token getter for web (can be overridden)
let defaultTokenGetter: TokenGetter = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Set the default token getter function
 * Call this in your app's initialization to set platform-specific token retrieval
 */
export function setTokenGetter(getter: TokenGetter): void {
  defaultTokenGetter = getter;
}

/**
 * Create a configured API client instance
 */
export function createApiClient(tokenGetter?: TokenGetter): AxiosInstance {
  const getToken = tokenGetter || defaultTokenGetter;

  const client = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    async (config) => {
      const token = await Promise.resolve(getToken());
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Emit event for apps to handle (redirect to login, etc.)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dryjets:unauthorized'));
        }
      }

      // Handle network errors
      if (!error.response) {
        console.error('[API Client] Network error:', error.message);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dryjets:network-error'));
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Default client instance (lazy initialized)
let defaultClient: AxiosInstance | null = null;

/**
 * Get the default API client instance
 * Lazily creates the client on first use
 */
export function getApiClient(): AxiosInstance {
  if (!defaultClient) {
    defaultClient = createApiClient();
  }
  return defaultClient;
}

/**
 * Reset the default client (useful for testing or token changes)
 */
export function resetApiClient(): void {
  defaultClient = null;
}

// Export the default client getter as 'api' for convenience
export const api = {
  get client() {
    return getApiClient();
  },
};
