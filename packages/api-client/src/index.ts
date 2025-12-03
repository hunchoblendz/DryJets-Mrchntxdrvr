/**
 * @dryjets/api-client
 *
 * Unified API client for all DryJets applications
 *
 * Usage:
 * ```typescript
 * import { ordersApi, driversApi, setTokenGetter } from '@dryjets/api-client';
 *
 * // Set up token retrieval (do once at app init)
 * setTokenGetter(() => localStorage.getItem('auth_token'));
 *
 * // Use API endpoints
 * const orders = await ordersApi.list({ status: 'PENDING' });
 * ```
 */

// Client
export {
  createApiClient,
  getApiClient,
  resetApiClient,
  setTokenGetter,
  api,
} from './client';
export type { TokenGetter } from './client';

// Endpoints
export { ordersApi } from './endpoints/orders';
export { driversApi } from './endpoints/drivers';
export { merchantsApi } from './endpoints/merchants';
export { customersApi } from './endpoints/customers';
export { authApi } from './endpoints/auth';
export { paymentsApi } from './endpoints/payments';
export { deliveryApi } from './endpoints/delivery';

// Types
export type {
  // Order types
  Order,
  OrderStatus,
  OrderListParams,
  FulfillmentMode,
  // Driver types
  Driver,
  DriverStatus,
  DriverListParams,
  NearbyDriverParams,
  // Merchant types
  Merchant,
  MerchantLocation,
  Service,
  // Customer types
  Customer,
  Address,
  // Payment types
  Payment,
  PaymentStatus,
  PaymentListParams,
  CreatePaymentIntentParams,
  ConfirmPaymentParams,
  CreateRefundParams,
  MerchantOnboardParams,
  // Auth types
  AuthUser,
  LoginParams,
  RegisterParams,
  AuthResponse,
  // Delivery types
  GeoLocation,
  DeliveryEta,
  // API types
  ApiResponse,
  ApiError,
} from './types';
