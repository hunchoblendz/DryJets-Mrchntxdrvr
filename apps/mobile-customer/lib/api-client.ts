import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Get token from secure storage
          const storedToken = await SecureStore.getItemAsync('auth_token');
          if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`;
          }
        } catch (error) {
          console.error('Error retrieving auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          await this.clearAuth();
          // Trigger logout event - implement with your state management
        }
        return Promise.reject(error);
      },
    );
  }

  async setAuthToken(token: string) {
    this.token = token;
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  async clearAuth() {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  get client() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
