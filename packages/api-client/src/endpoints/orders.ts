/**
 * Orders API Endpoints
 */

import { getApiClient } from '../client';
import type {
  Order,
  OrderListParams,
  OrderStatus,
  ApiResponse,
} from '../types';

export const ordersApi = {
  /**
   * List orders with optional filters
   */
  list: (params?: OrderListParams) =>
    getApiClient().get<ApiResponse<Order[]>>('/orders', { params }),

  /**
   * Get order by ID
   */
  getById: (id: string) =>
    getApiClient().get<ApiResponse<Order>>(`/orders/${id}`),

  /**
   * Get order by short code (e.g., "DJ-1234")
   */
  getByShortCode: (shortCode: string) =>
    getApiClient().get<ApiResponse<Order>>(`/orders/code/${shortCode}`),

  /**
   * Create a new order
   */
  create: (data: {
    customerId: string;
    merchantId: string;
    merchantLocationId?: string;
    pickupAddressId?: string;
    deliveryAddressId?: string;
    fulfillmentMode?: string;
    items: Array<{
      serviceId: string;
      quantity: number;
      priceOverride?: number;
    }>;
    specialInstructions?: string;
  }) => getApiClient().post<ApiResponse<Order>>('/orders', data),

  /**
   * Update order status
   */
  updateStatus: (id: string, status: OrderStatus, notes?: string) =>
    getApiClient().patch<ApiResponse<Order>>(`/orders/${id}/status`, {
      status,
      notes,
    }),

  /**
   * Assign a driver to an order
   */
  assignDriver: (
    orderId: string,
    driverId: string,
    role: 'pickup' | 'delivery' = 'pickup',
    notes?: string
  ) =>
    getApiClient().patch<ApiResponse<Order>>(`/orders/${orderId}/assign-driver`, {
      driverId,
      role,
      notes,
    }),

  /**
   * Auto-assign the best available driver
   */
  autoAssignDriver: (orderId: string) =>
    getApiClient().post<ApiResponse<{ order: Order; driver: any }>>(
      `/orders/${orderId}/auto-assign-driver`
    ),

  /**
   * Customer confirms drop-off at merchant (self-service)
   */
  confirmDropoff: (orderId: string) =>
    getApiClient().post<ApiResponse<Order>>(`/orders/${orderId}/confirm-dropoff`),

  /**
   * Customer confirms pickup (self-service)
   */
  confirmPickup: (orderId: string) =>
    getApiClient().post<ApiResponse<Order>>(`/orders/${orderId}/confirm-pickup`),

  /**
   * Cancel an order
   */
  cancel: (orderId: string, reason?: string) =>
    getApiClient().post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, {
      reason,
    }),

  /**
   * Get order status history
   */
  getStatusHistory: (orderId: string) =>
    getApiClient().get<ApiResponse<any[]>>(`/orders/${orderId}/history`),

  /**
   * Get orders for a specific customer
   */
  getByCustomer: (customerId: string, params?: Omit<OrderListParams, 'customerId'>) =>
    getApiClient().get<ApiResponse<Order[]>>('/orders', {
      params: { ...params, customerId },
    }),

  /**
   * Get orders for a specific merchant
   */
  getByMerchant: (merchantId: string, params?: Omit<OrderListParams, 'merchantId'>) =>
    getApiClient().get<ApiResponse<Order[]>>('/orders', {
      params: { ...params, merchantId },
    }),

  /**
   * Get orders assigned to a specific driver
   */
  getByDriver: (driverId: string, params?: Omit<OrderListParams, 'driverId'>) =>
    getApiClient().get<ApiResponse<Order[]>>('/orders', {
      params: { ...params, driverId },
    }),
};
