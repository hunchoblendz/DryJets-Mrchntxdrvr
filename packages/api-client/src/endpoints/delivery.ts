/**
 * Delivery API Endpoints
 *
 * Central delivery system orchestration endpoints
 */

import { getApiClient } from '../client';
import type {
  Order,
  GeoLocation,
  DeliveryEta,
  ApiResponse,
} from '../types';

export const deliveryApi = {
  /**
   * Create a delivery request (main entry point for order with delivery)
   */
  create: (data: {
    customerId: string;
    merchantId: string;
    merchantLocationId?: string;
    pickupAddressId: string;
    deliveryAddressId: string;
    items: Array<{
      serviceId: string;
      quantity: number;
    }>;
    fulfillmentMode?: string;
    priority?: 'NORMAL' | 'EXPRESS';
    specialInstructions?: string;
  }) =>
    getApiClient().post<ApiResponse<{
      order: Order;
      estimatedPickup: string;
      estimatedDelivery: string;
      assignedDriver?: any;
    }>>('/delivery', data),

  /**
   * Get delivery status and ETA
   */
  getStatus: (orderId: string) =>
    getApiClient().get<ApiResponse<{
      order: Order;
      driverLocation?: GeoLocation;
      eta: DeliveryEta;
    }>>(`/delivery/${orderId}/status`),

  /**
   * Update driver location (called by driver app)
   */
  updateDriverLocation: (data: GeoLocation & { driverId: string }) =>
    getApiClient().post('/delivery/driver-location', data),

  /**
   * Calculate ETA for a delivery
   */
  calculateEta: (data: {
    pickupLatitude: number;
    pickupLongitude: number;
    deliveryLatitude: number;
    deliveryLongitude: number;
    driverLatitude?: number;
    driverLongitude?: number;
  }) =>
    getApiClient().post<ApiResponse<DeliveryEta>>('/delivery/calculate-eta', data),

  /**
   * Get optimal route for delivery
   */
  getRoute: (data: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    waypoints?: Array<{ latitude: number; longitude: number }>;
  }) =>
    getApiClient().post<ApiResponse<{
      distance: number;
      duration: number;
      polyline: string;
      steps: any[];
    }>>('/delivery/route', data),

  /**
   * Subscribe to delivery updates (returns WebSocket info)
   */
  subscribe: (orderId: string) =>
    getApiClient().get<ApiResponse<{
      websocketUrl: string;
      room: string;
      token: string;
    }>>(`/delivery/${orderId}/subscribe`),

  // Driver actions
  driver: {
    /**
     * Accept a delivery assignment
     */
    accept: (orderId: string, driverId: string) =>
      getApiClient().post<ApiResponse<Order>>(`/delivery/${orderId}/accept`, {
        driverId,
      }),

    /**
     * Reject a delivery assignment
     */
    reject: (orderId: string, driverId: string, reason?: string) =>
      getApiClient().post<ApiResponse<any>>(`/delivery/${orderId}/reject`, {
        driverId,
        reason,
      }),

    /**
     * Mark items as picked up from merchant
     */
    markPickedUp: (orderId: string, driverId: string) =>
      getApiClient().post<ApiResponse<Order>>(`/delivery/${orderId}/picked-up`, {
        driverId,
      }),

    /**
     * Mark delivery as complete
     */
    markDelivered: (orderId: string, driverId: string, signature?: string) =>
      getApiClient().post<ApiResponse<Order>>(`/delivery/${orderId}/delivered`, {
        driverId,
        signature,
      }),

    /**
     * Report an issue with delivery
     */
    reportIssue: (orderId: string, driverId: string, issue: string, details?: string) =>
      getApiClient().post<ApiResponse<any>>(`/delivery/${orderId}/issue`, {
        driverId,
        issue,
        details,
      }),
  },

  // Zone management
  zones: {
    /**
     * Get available orders in a zone
     */
    getAvailableOrders: (zoneId: string) =>
      getApiClient().get<ApiResponse<Order[]>>(`/delivery/zones/${zoneId}/available`),

    /**
     * Get zone by coordinates
     */
    getByCoordinates: (latitude: number, longitude: number) =>
      getApiClient().get<ApiResponse<any>>('/delivery/zones/by-coordinates', {
        params: { latitude, longitude },
      }),
  },
};
