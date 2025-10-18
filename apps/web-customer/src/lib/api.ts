import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Orders API
export const ordersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    merchantId?: string;
  }) => api.get('/orders', { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }),

  assignDriver: (orderId: string, driverId: string, notes?: string) =>
    api.patch(`/orders/${orderId}/assign-driver`, { driverId, notes }),
};

// Merchants API
export const merchantsApi = {
  getById: (id: string) => api.get(`/merchants/${id}`),

  update: (id: string, data: any) => api.put(`/merchants/${id}`, data),

  getStats: (id: string) => api.get(`/merchants/${id}/stats`),

  getLocations: (id: string) => api.get(`/merchants/${id}/locations`),

  getServices: (id: string, includeInactive?: boolean) =>
    api.get(`/merchants/${id}/services`, { params: { includeInactive } }),

  createService: (merchantId: string, data: any) =>
    api.post(`/merchants/${merchantId}/services`, data),

  updateService: (merchantId: string, serviceId: string, data: any) =>
    api.put(`/merchants/${merchantId}/services/${serviceId}`, data),

  deleteService: (merchantId: string, serviceId: string) =>
    api.delete(`/merchants/${merchantId}/services/${serviceId}`),
};

// Drivers API
export const driversApi = {
  list: (params?: { status?: string; limit?: number }) =>
    api.get('/drivers', { params }),

  nearby: (latitude: number, longitude: number, radiusMeters?: number) =>
    api.get('/drivers/nearby', {
      params: { latitude, longitude, radiusMeters },
    }),
};

// Payments API
export const paymentsApi = {
  createIntent: (data: {
    orderId: string;
    amount: number;
    currency: string;
    customerId?: string;
    description?: string;
  }) => api.post('/payments/intent', data),

  confirmPayment: (data: { paymentIntentId: string; paymentMethodId?: string }) =>
    api.post('/payments/confirm', data),

  getById: (id: string) => api.get(`/payments/${id}`),

  list: (params?: {
    orderId?: string;
    customerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/payments', { params }),

  refund: (data: { paymentId: string; amount?: number; reason?: string }) =>
    api.post('/payments/refund', data),
};
