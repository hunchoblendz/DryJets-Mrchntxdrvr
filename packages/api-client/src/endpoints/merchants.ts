/**
 * Merchants API Endpoints
 */

import { getApiClient } from '../client';
import type {
  Merchant,
  MerchantLocation,
  Service,
  ApiResponse,
} from '../types';

export const merchantsApi = {
  /**
   * Get merchant by ID
   */
  getById: (id: string) =>
    getApiClient().get<ApiResponse<Merchant>>(`/merchants/${id}`),

  /**
   * Update merchant profile
   */
  update: (id: string, data: Partial<Merchant>) =>
    getApiClient().put<ApiResponse<Merchant>>(`/merchants/${id}`, data),

  /**
   * Get merchant statistics
   */
  getStats: (id: string) =>
    getApiClient().get<ApiResponse<any>>(`/merchants/${id}/stats`),

  /**
   * Get merchant dashboard data
   */
  getDashboard: (id: string) =>
    getApiClient().get<ApiResponse<any>>(`/merchants/${id}/dashboard`),

  // Location Management
  locations: {
    /**
     * Get all locations for a merchant
     */
    list: (merchantId: string) =>
      getApiClient().get<ApiResponse<MerchantLocation[]>>(
        `/merchants/${merchantId}/locations`
      ),

    /**
     * Get location by ID
     */
    getById: (merchantId: string, locationId: string) =>
      getApiClient().get<ApiResponse<MerchantLocation>>(
        `/merchants/${merchantId}/locations/${locationId}`
      ),

    /**
     * Create a new location
     */
    create: (merchantId: string, data: Omit<MerchantLocation, 'id' | 'merchantId'>) =>
      getApiClient().post<ApiResponse<MerchantLocation>>(
        `/merchants/${merchantId}/locations`,
        data
      ),

    /**
     * Update a location
     */
    update: (merchantId: string, locationId: string, data: Partial<MerchantLocation>) =>
      getApiClient().put<ApiResponse<MerchantLocation>>(
        `/merchants/${merchantId}/locations/${locationId}`,
        data
      ),

    /**
     * Delete a location
     */
    delete: (merchantId: string, locationId: string) =>
      getApiClient().delete(`/merchants/${merchantId}/locations/${locationId}`),
  },

  // Service Management
  services: {
    /**
     * Get all services for a merchant
     */
    list: (merchantId: string, includeInactive?: boolean) =>
      getApiClient().get<ApiResponse<Service[]>>(`/merchants/${merchantId}/services`, {
        params: { includeInactive },
      }),

    /**
     * Get service by ID
     */
    getById: (merchantId: string, serviceId: string) =>
      getApiClient().get<ApiResponse<Service>>(
        `/merchants/${merchantId}/services/${serviceId}`
      ),

    /**
     * Create a new service
     */
    create: (merchantId: string, data: Omit<Service, 'id' | 'merchantId'>) =>
      getApiClient().post<ApiResponse<Service>>(
        `/merchants/${merchantId}/services`,
        data
      ),

    /**
     * Update a service
     */
    update: (merchantId: string, serviceId: string, data: Partial<Service>) =>
      getApiClient().put<ApiResponse<Service>>(
        `/merchants/${merchantId}/services/${serviceId}`,
        data
      ),

    /**
     * Delete a service
     */
    delete: (merchantId: string, serviceId: string) =>
      getApiClient().delete(`/merchants/${merchantId}/services/${serviceId}`),

    /**
     * Toggle service active status
     */
    toggleActive: (merchantId: string, serviceId: string) =>
      getApiClient().patch<ApiResponse<Service>>(
        `/merchants/${merchantId}/services/${serviceId}/toggle`
      ),
  },

  // Staff Management
  staff: {
    /**
     * Get all staff for a merchant
     */
    list: (merchantId: string) =>
      getApiClient().get<ApiResponse<any[]>>(`/merchants/${merchantId}/staff`),

    /**
     * Add staff member
     */
    add: (merchantId: string, data: { userId: string; role: string; permissions?: string[] }) =>
      getApiClient().post<ApiResponse<any>>(`/merchants/${merchantId}/staff`, data),

    /**
     * Update staff member
     */
    update: (merchantId: string, staffId: string, data: { role?: string; permissions?: string[] }) =>
      getApiClient().put<ApiResponse<any>>(
        `/merchants/${merchantId}/staff/${staffId}`,
        data
      ),

    /**
     * Remove staff member
     */
    remove: (merchantId: string, staffId: string) =>
      getApiClient().delete(`/merchants/${merchantId}/staff/${staffId}`),
  },

  // Equipment Management (IoT)
  equipment: {
    /**
     * Get all equipment for a merchant
     */
    list: (merchantId: string) =>
      getApiClient().get<ApiResponse<any[]>>(`/merchants/${merchantId}/equipment`),

    /**
     * Get equipment by ID
     */
    getById: (merchantId: string, equipmentId: string) =>
      getApiClient().get<ApiResponse<any>>(
        `/merchants/${merchantId}/equipment/${equipmentId}`
      ),

    /**
     * Get equipment telemetry data
     */
    getTelemetry: (merchantId: string, equipmentId: string, params?: { startDate?: string; endDate?: string }) =>
      getApiClient().get<ApiResponse<any[]>>(
        `/merchants/${merchantId}/equipment/${equipmentId}/telemetry`,
        { params }
      ),

    /**
     * Get equipment health score
     */
    getHealthScore: (merchantId: string, equipmentId: string) =>
      getApiClient().get<ApiResponse<{ score: number; status: string }>>(
        `/merchants/${merchantId}/equipment/${equipmentId}/health`
      ),
  },
};
