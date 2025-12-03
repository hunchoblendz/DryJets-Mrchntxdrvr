/**
 * API Client Types
 *
 * Shared type definitions for API requests and responses
 */

// Order Types
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT_TO_MERCHANT'
  | 'RECEIVED_BY_MERCHANT'
  | 'IN_PROCESS'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'AWAITING_CUSTOMER_DROPOFF'
  | 'AWAITING_CUSTOMER_PICKUP';

export type FulfillmentMode =
  | 'FULL_SERVICE'
  | 'CUSTOMER_DROPOFF_PICKUP'
  | 'CUSTOMER_DROPOFF_DRIVER_DELIVERY'
  | 'DRIVER_PICKUP_CUSTOMER_PICKUP';

export interface Order {
  id: string;
  orderNumber: string;
  shortCode: string;
  status: OrderStatus;
  customerId: string;
  merchantId: string;
  merchantLocationId?: string;
  pickupDriverId?: string;
  deliveryDriverId?: string;
  pickupAddressId?: string;
  deliveryAddressId?: string;
  fulfillmentMode: FulfillmentMode;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  merchantId?: string;
  customerId?: string;
  driverId?: string;
}

// Driver Types
export type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK';

export interface Driver {
  id: string;
  userId: string;
  status: DriverStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  vehicleType?: string;
  vehiclePlate?: string;
  rating: number;
  totalDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

export interface DriverListParams {
  status?: DriverStatus;
  limit?: number;
}

export interface NearbyDriverParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}

// Merchant Types
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantLocation {
  id: string;
  merchantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  category?: string;
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListParams {
  orderId?: string;
  customerId?: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

export interface CreatePaymentIntentParams {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface CreateRefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface MerchantOnboardParams {
  merchantId: string;
  email: string;
  returnUrl: string;
  refreshUrl: string;
}

// Customer Types
export interface Customer {
  id: string;
  userId: string;
  defaultAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  customerId: string;
  label?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'DRIVER' | 'MERCHANT' | 'ADMIN' | 'ENTERPRISE' | 'BUSINESS';
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'DRIVER' | 'MERCHANT';
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Delivery Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface DeliveryEta {
  estimatedPickup: string;
  estimatedDelivery: string;
  distanceKm: number;
  durationMinutes: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
