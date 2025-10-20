import { apiClient } from './api-client';
import {
  Order,
  Merchant,
  MerchantLocation,
  Service,
  Address,
  Customer,
  Review,
  Subscription,
  WardrobeItem,
  FavoriteMerchant,
  CreateOrderRequest,
  ConfirmDropoffRequest,
  ConfirmPickupRequest,
  PromoCode,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ============================================
// AUTHENTICATION
// ============================================

export const authApi = {
  // Phone login/signup with OTP
  requestPhoneOtp: (phone: string) =>
    apiClient.client.post('/auth/phone/request-otp', { phone }),

  verifyPhoneOtp: (phone: string, code: string) =>
    apiClient.client.post('/auth/phone/verify', { phone, code }),

  // Social login
  verifySocialToken: (provider: 'google' | 'apple', token: string) =>
    apiClient.client.post('/auth/social/verify', { provider, token }),

  // Logout
  logout: () => apiClient.client.post('/auth/logout', {}),

  // Get current session
  getSession: () => apiClient.client.get('/auth/session'),
};

// ============================================
// CUSTOMERS
// ============================================

export const customersApi = {
  // Get customer profile
  getProfile: (customerId: string) =>
    apiClient.client.get<ApiResponse<Customer>>(`/customers/${customerId}`),

  // Update customer profile
  updateProfile: (customerId: string, data: Partial<Customer>) =>
    apiClient.client.patch<ApiResponse<Customer>>(`/customers/${customerId}`, data),

  // Get customer addresses
  getAddresses: (customerId: string) =>
    apiClient.client.get<ApiResponse<Address[]>>(`/customers/${customerId}/addresses`),

  // Create address
  createAddress: (customerId: string, data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.client.post<ApiResponse<Address>>(`/customers/${customerId}/addresses`, data),

  // Update address
  updateAddress: (customerId: string, addressId: string, data: Partial<Address>) =>
    apiClient.client.patch<ApiResponse<Address>>(
      `/customers/${customerId}/addresses/${addressId}`,
      data,
    ),

  // Delete address
  deleteAddress: (customerId: string, addressId: string) =>
    apiClient.client.delete(`/customers/${customerId}/addresses/${addressId}`),

  // Set default address
  setDefaultAddress: (customerId: string, addressId: string) =>
    apiClient.client.patch<ApiResponse<Address>>(
      `/customers/${customerId}/addresses/${addressId}/default`,
      {},
    ),
};

// ============================================
// MERCHANTS
// ============================================

export const merchantsApi = {
  // List merchants with filters
  list: (params?: {
    city?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    query?: string;
    sort?: 'distance' | 'rating' | 'newest';
    limit?: number;
    page?: number;
  }) =>
    apiClient.client.get<ApiResponse<PaginatedResponse<Merchant>>>('/merchants', { params }),

  // Get merchant details
  getById: (merchantId: string) =>
    apiClient.client.get<ApiResponse<Merchant>>(`/merchants/${merchantId}`),

  // Get merchant services
  getServices: (merchantId: string) =>
    apiClient.client.get<ApiResponse<Service[]>>(`/merchants/${merchantId}/services`),

  // Get merchant locations
  getLocations: (merchantId: string) =>
    apiClient.client.get<ApiResponse<MerchantLocation[]>>(`/merchants/${merchantId}/locations`),

  // Get merchant location details
  getLocationById: (merchantId: string, locationId: string) =>
    apiClient.client.get<ApiResponse<MerchantLocation>>(
      `/merchants/${merchantId}/locations/${locationId}`,
    ),

  // Check availability for self-service
  checkAvailability: (merchantId: string, locationId: string, dateTime: string) =>
    apiClient.client.get<ApiResponse<{ available: boolean; nextAvailable?: string }>>(
      `/merchants/${merchantId}/locations/${locationId}/availability`,
      {
        params: { dateTime },
      },
    ),

  // Get merchant reviews
  getReviews: (merchantId: string, params?: { page?: number; limit?: number }) =>
    apiClient.client.get<ApiResponse<PaginatedResponse<Review>>>(
      `/merchants/${merchantId}/reviews`,
      { params },
    ),
};

// ============================================
// ORDERS
// ============================================

export const ordersApi = {
  // Create order
  create: (data: CreateOrderRequest) =>
    apiClient.client.post<ApiResponse<Order>>('/orders', data),

  // Get order details
  getById: (orderId: string) =>
    apiClient.client.get<ApiResponse<Order>>(`/orders/${orderId}`),

  // List customer orders
  list: (customerId: string, params?: { status?: string; limit?: number; page?: number }) =>
    apiClient.client.get<ApiResponse<PaginatedResponse<Order>>>('/orders', {
      params: { customerId, ...params },
    }),

  // Update order status
  updateStatus: (orderId: string, status: string) =>
    apiClient.client.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status }),

  // Confirm drop-off (self-service)
  confirmDropoff: (data: ConfirmDropoffRequest) =>
    apiClient.client.post<ApiResponse<Order>>('/orders/confirm-dropoff', data),

  // Confirm pickup (self-service)
  confirmPickup: (data: ConfirmPickupRequest) =>
    apiClient.client.post<ApiResponse<Order>>('/orders/confirm-pickup', data),

  // Cancel order
  cancel: (orderId: string, reason: string) =>
    apiClient.client.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason }),

  // Track order (for real-time updates)
  getTracking: (orderId: string) =>
    apiClient.client.get<
      ApiResponse<{
        status: string;
        driver?: { name: string; latitude: number; longitude: number };
        estimatedArrival: string;
      }>
    >(`/orders/${orderId}/tracking`),
};

// ============================================
// REVIEWS
// ============================================

export const reviewsApi = {
  // Create review
  create: (orderId: string, data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.client.post<ApiResponse<Review>>(`/orders/${orderId}/reviews`, data),

  // Get review
  getById: (reviewId: string) =>
    apiClient.client.get<ApiResponse<Review>>(`/reviews/${reviewId}`),

  // Update review
  update: (reviewId: string, data: Partial<Review>) =>
    apiClient.client.patch<ApiResponse<Review>>(`/reviews/${reviewId}`, data),
};

// ============================================
// WARDROBE
// ============================================

export const wardrobeApi = {
  // List wardrobe items
  list: (customerId: string) =>
    apiClient.client.get<ApiResponse<WardrobeItem[]>>(`/customers/${customerId}/wardrobe`),

  // Create wardrobe item
  create: (customerId: string, data: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.client.post<ApiResponse<WardrobeItem>>(
      `/customers/${customerId}/wardrobe`,
      data,
    ),

  // Update wardrobe item
  update: (customerId: string, itemId: string, data: Partial<WardrobeItem>) =>
    apiClient.client.patch<ApiResponse<WardrobeItem>>(
      `/customers/${customerId}/wardrobe/${itemId}`,
      data,
    ),

  // Delete wardrobe item
  delete: (customerId: string, itemId: string) =>
    apiClient.client.delete(`/customers/${customerId}/wardrobe/${itemId}`),

  // Detect fabric type via AI
  detectFabric: (customerId: string, imageUrl: string) =>
    apiClient.client.post<ApiResponse<{ fabricType: string; confidence: number }>>(
      `/customers/${customerId}/wardrobe/detect-fabric`,
      { imageUrl },
    ),
};

// ============================================
// SUBSCRIPTIONS
// ============================================

export const subscriptionsApi = {
  // List subscriptions
  list: (customerId: string) =>
    apiClient.client.get<ApiResponse<Subscription[]>>(`/customers/${customerId}/subscriptions`),

  // Create subscription
  create: (customerId: string, data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.client.post<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions`,
      data,
    ),

  // Update subscription
  update: (customerId: string, subscriptionId: string, data: Partial<Subscription>) =>
    apiClient.client.patch<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions/${subscriptionId}`,
      data,
    ),

  // Pause subscription
  pause: (customerId: string, subscriptionId: string) =>
    apiClient.client.post<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions/${subscriptionId}/pause`,
      {},
    ),

  // Resume subscription
  resume: (customerId: string, subscriptionId: string) =>
    apiClient.client.post<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions/${subscriptionId}/resume`,
      {},
    ),

  // Cancel subscription
  cancel: (customerId: string, subscriptionId: string) =>
    apiClient.client.post<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions/${subscriptionId}/cancel`,
      {},
    ),

  // Skip next order
  skipNext: (customerId: string, subscriptionId: string) =>
    apiClient.client.post<ApiResponse<Subscription>>(
      `/customers/${customerId}/subscriptions/${subscriptionId}/skip-next`,
      {},
    ),
};

// ============================================
// FAVORITE MERCHANTS (HOME STORES)
// ============================================

export const favoriteMerchantsApi = {
  // List favorite merchants
  list: (customerId: string) =>
    apiClient.client.get<ApiResponse<FavoriteMerchant[]>>(
      `/customers/${customerId}/favorite-merchants`,
    ),

  // Add favorite merchant
  add: (customerId: string, merchantId: string, nickname?: string) =>
    apiClient.client.post<ApiResponse<FavoriteMerchant>>(
      `/customers/${customerId}/favorite-merchants`,
      { merchantId, nickname },
    ),

  // Update favorite merchant
  update: (customerId: string, favoriteId: string, data: Partial<FavoriteMerchant>) =>
    apiClient.client.patch<ApiResponse<FavoriteMerchant>>(
      `/customers/${customerId}/favorite-merchants/${favoriteId}`,
      data,
    ),

  // Remove favorite merchant
  remove: (customerId: string, favoriteId: string) =>
    apiClient.client.delete(
      `/customers/${customerId}/favorite-merchants/${favoriteId}`,
    ),

  // Set as home store
  setAsHomeStore: (customerId: string, favoriteId: string) =>
    apiClient.client.patch<ApiResponse<FavoriteMerchant>>(
      `/customers/${customerId}/favorite-merchants/${favoriteId}/set-home-store`,
      {},
    ),
};

// ============================================
// PROMO CODES
// ============================================

export const promoCodesApi = {
  // Validate promo code
  validate: (code: string, orderAmount: number) =>
    apiClient.client.post<ApiResponse<PromoCode>>('/promo-codes/validate', {
      code,
      orderAmount,
    }),

  // Get active promo codes
  getActive: () =>
    apiClient.client.get<ApiResponse<PromoCode[]>>('/promo-codes/active'),
};

// ============================================
// PAYMENTS
// ============================================

export const paymentsApi = {
  // Create payment intent
  createPaymentIntent: (orderId: string, amount: number) =>
    apiClient.client.post<ApiResponse<{ clientSecret: string; publishableKey: string }>>(
      '/payments/intent',
      { orderId, amount },
    ),

  // Confirm payment
  confirmPayment: (orderId: string, paymentMethodId: string) =>
    apiClient.client.post<ApiResponse<{ status: string }>>('/payments/confirm', {
      orderId,
      paymentMethodId,
    }),

  // Get payment methods
  getPaymentMethods: (customerId: string) =>
    apiClient.client.get('/payments/methods', { params: { customerId } }),
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationsApi = {
  // Register device token for push notifications
  registerDeviceToken: (customerId: string, deviceToken: string, platform: 'ios' | 'android') =>
    apiClient.client.post('/notifications/register', { customerId, deviceToken, platform }),

  // Get notifications
  list: (customerId: string, params?: { page?: number; limit?: number }) =>
    apiClient.client.get(`/notifications`, { params: { customerId, ...params } }),

  // Mark as read
  markAsRead: (notificationId: string) =>
    apiClient.client.patch(`/notifications/${notificationId}/read`, {}),

  // Update preferences
  updatePreferences: (customerId: string, preferences: Record<string, boolean>) =>
    apiClient.client.patch(`/customers/${customerId}/notification-preferences`, preferences),
};

// ============================================
// UPLOADS
// ============================================

export const uploadsApi = {
  // Upload image
  uploadImage: async (uri: string, fileName: string, mimeType: string = 'image/jpeg') => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    return apiClient.client.post<ApiResponse<{ url: string }>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ============================================
// DRIVERS
// ============================================

export const driversApi = {
  // Get driver details
  getById: (driverId: string) =>
    apiClient.client.get<ApiResponse<{ id: string; name: string; phone?: string; rating?: number; vehicleNumber?: string; currentLatitude?: number; currentLongitude?: number }>>(`/drivers/${driverId}`),

  // Get driver location (real-time)
  getLocation: (driverId: string) =>
    apiClient.client.get<ApiResponse<{ latitude: number; longitude: number }>>(
      `/drivers/${driverId}/location`
    ),

  // Update driver location
  updateLocation: (driverId: string, latitude: number, longitude: number) =>
    apiClient.client.patch<ApiResponse<{ success: boolean }>>(
      `/drivers/${driverId}/location`,
      { latitude, longitude }
    ),
};

export default {
  auth: authApi,
  customers: customersApi,
  merchants: merchantsApi,
  orders: ordersApi,
  reviews: reviewsApi,
  wardrobe: wardrobeApi,
  subscriptions: subscriptionsApi,
  favoriteMerchants: favoriteMerchantsApi,
  promoCodes: promoCodesApi,
  payments: paymentsApi,
  notifications: notificationsApi,
  uploads: uploadsApi,
  drivers: driversApi,
};
