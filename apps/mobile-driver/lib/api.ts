import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  // TODO: Get token from secure storage
  const token = null; // Will be implemented with auth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Driver API
export const driverApi = {
  // Get driver profile
  getProfile: (driverId: string) => api.get(`/drivers/${driverId}`),

  // Update driver availability
  updateAvailability: (driverId: string, isAvailable: boolean) =>
    api.patch(`/drivers/${driverId}/availability`, { isAvailable }),

  // Update driver location
  updateLocation: (driverId: string, latitude: number, longitude: number) =>
    api.patch(`/drivers/${driverId}/location`, {
      latitude,
      longitude,
      status: 'AVAILABLE',
    }),

  // Get active orders
  getActiveOrders: (driverId: string) => api.get(`/drivers/${driverId}/orders`),

  // Get available orders nearby
  getAvailableOrders: (driverId: string, radiusKm?: number) =>
    api.get(`/drivers/${driverId}/available-orders`, {
      params: { radiusKm },
    }),

  // Accept an order
  acceptOrder: (driverId: string, orderId: string, notes?: string) =>
    api.post(`/drivers/${driverId}/orders/${orderId}/accept`, { notes }),

  // Mark order as picked up
  markPickedUp: (driverId: string, orderId: string, notes?: string) =>
    api.post(`/drivers/${driverId}/orders/${orderId}/pickup`, { notes }),

  // Mark order as delivered
  markDelivered: (driverId: string, orderId: string, notes?: string) =>
    api.post(`/drivers/${driverId}/orders/${orderId}/deliver`, { notes }),

  // Get earnings
  getEarnings: (
    driverId: string,
    params?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) => api.get(`/drivers/${driverId}/earnings`, { params }),

  // Get statistics
  getStats: (driverId: string) => api.get(`/drivers/${driverId}/stats`),
};

// Orders API
export const ordersApi = {
  getById: (orderId: string) => api.get(`/orders/${orderId}`),
};
