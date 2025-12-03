/**
 * Drivers API Endpoints
 */

import { getApiClient } from '../client';
import type {
  Driver,
  DriverListParams,
  NearbyDriverParams,
  GeoLocation,
  ApiResponse,
} from '../types';

export const driversApi = {
  /**
   * List drivers with optional filters
   */
  list: (params?: DriverListParams) =>
    getApiClient().get<ApiResponse<Driver[]>>('/drivers', { params }),

  /**
   * Get driver by ID
   */
  getById: (id: string) =>
    getApiClient().get<ApiResponse<Driver>>(`/drivers/${id}`),

  /**
   * Get nearby available drivers
   */
  nearby: (params: NearbyDriverParams) =>
    getApiClient().get<ApiResponse<Driver[]>>('/drivers/nearby', { params }),

  /**
   * Update driver status (online, offline, busy, etc.)
   */
  updateStatus: (driverId: string, status: 'OFFLINE' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK') =>
    getApiClient().patch<ApiResponse<Driver>>(`/drivers/${driverId}/status`, {
      status,
    }),

  /**
   * Update driver location (GPS coordinates)
   */
  updateLocation: (driverId: string, location: GeoLocation) =>
    getApiClient().patch<ApiResponse<Driver>>(`/drivers/${driverId}/location`, location),

  /**
   * Accept an available order
   */
  acceptOrder: (driverId: string, orderId: string) =>
    getApiClient().post<ApiResponse<any>>(`/drivers/${driverId}/accept-order`, {
      orderId,
    }),

  /**
   * Reject/decline an order
   */
  rejectOrder: (driverId: string, orderId: string, reason?: string) =>
    getApiClient().post<ApiResponse<any>>(`/drivers/${driverId}/reject-order`, {
      orderId,
      reason,
    }),

  /**
   * Mark order as picked up
   */
  markPickedUp: (driverId: string, orderId: string) =>
    getApiClient().post<ApiResponse<any>>(`/drivers/${driverId}/mark-picked-up`, {
      orderId,
    }),

  /**
   * Mark order as delivered
   */
  markDelivered: (driverId: string, orderId: string, signature?: string) =>
    getApiClient().post<ApiResponse<any>>(`/drivers/${driverId}/mark-delivered`, {
      orderId,
      signature,
    }),

  /**
   * Get active orders for a driver
   */
  getActiveOrders: (driverId: string) =>
    getApiClient().get<ApiResponse<any[]>>(`/drivers/${driverId}/active-orders`),

  /**
   * Get driver earnings
   */
  getEarnings: (driverId: string, params?: { startDate?: string; endDate?: string }) =>
    getApiClient().get<ApiResponse<any>>(`/drivers/${driverId}/earnings`, { params }),

  /**
   * Get driver stats (total deliveries, rating, etc.)
   */
  getStats: (driverId: string) =>
    getApiClient().get<ApiResponse<any>>(`/drivers/${driverId}/stats`),
};
