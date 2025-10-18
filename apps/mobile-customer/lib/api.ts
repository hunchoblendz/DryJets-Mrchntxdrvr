import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  // In a real app, get token from secure storage
  const token = null; // AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateOrderItem {
  serviceId: string;
  itemName: string;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateOrderDto {
  customerId: string;
  merchantId: string;
  merchantLocationId: string;
  type: 'ON_DEMAND' | 'SCHEDULED';
  pickupAddressId: string;
  deliveryAddressId: string;
  scheduledPickupAt?: string;
  specialInstructions?: string;
  items: CreateOrderItem[];
}

// Orders API
export const ordersApi = {
  create: (data: CreateOrderDto) => api.post('/orders', data),

  list: (customerId: string, params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params: { customerId, ...params } }),

  getById: (id: string) => api.get(`/orders/${id}`),
};

// Merchants API
export const merchantsApi = {
  list: (params?: { city?: string; verified?: boolean }) =>
    api.get('/merchants', { params }),

  getById: (id: string) => api.get(`/merchants/${id}`),

  getServices: (merchantId: string) => api.get(`/merchants/${merchantId}/services`),

  getLocations: (merchantId: string) => api.get(`/merchants/${merchantId}/locations`),
};

// Customer Addresses API
export const addressesApi = {
  list: (customerId: string) =>
    api.get(`/customers/${customerId}/addresses`),

  create: (customerId: string, data: any) =>
    api.post(`/customers/${customerId}/addresses`, data),
};
