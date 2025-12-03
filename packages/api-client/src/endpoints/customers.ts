/**
 * Customers API Endpoints
 */

import { getApiClient } from '../client';
import type {
  Customer,
  Address,
  ApiResponse,
} from '../types';

export const customersApi = {
  /**
   * Get customer by ID
   */
  getById: (id: string) =>
    getApiClient().get<ApiResponse<Customer>>(`/customers/${id}`),

  /**
   * Get current customer profile (authenticated)
   */
  me: () => getApiClient().get<ApiResponse<Customer>>('/customers/me'),

  /**
   * Update customer profile
   */
  update: (id: string, data: Partial<Customer>) =>
    getApiClient().put<ApiResponse<Customer>>(`/customers/${id}`, data),

  // Address Management
  addresses: {
    /**
     * Get all addresses for a customer
     */
    list: (customerId: string) =>
      getApiClient().get<ApiResponse<Address[]>>(`/customers/${customerId}/addresses`),

    /**
     * Get address by ID
     */
    getById: (customerId: string, addressId: string) =>
      getApiClient().get<ApiResponse<Address>>(
        `/customers/${customerId}/addresses/${addressId}`
      ),

    /**
     * Create a new address
     */
    create: (customerId: string, data: Omit<Address, 'id' | 'customerId'>) =>
      getApiClient().post<ApiResponse<Address>>(
        `/customers/${customerId}/addresses`,
        data
      ),

    /**
     * Update an address
     */
    update: (customerId: string, addressId: string, data: Partial<Address>) =>
      getApiClient().put<ApiResponse<Address>>(
        `/customers/${customerId}/addresses/${addressId}`,
        data
      ),

    /**
     * Delete an address
     */
    delete: (customerId: string, addressId: string) =>
      getApiClient().delete(`/customers/${customerId}/addresses/${addressId}`),

    /**
     * Set address as default
     */
    setDefault: (customerId: string, addressId: string) =>
      getApiClient().patch<ApiResponse<Address>>(
        `/customers/${customerId}/addresses/${addressId}/default`
      ),
  },

  // Favorites
  favorites: {
    /**
     * Get favorite merchants
     */
    getMerchants: (customerId: string) =>
      getApiClient().get<ApiResponse<any[]>>(`/customers/${customerId}/favorites/merchants`),

    /**
     * Add merchant to favorites
     */
    addMerchant: (customerId: string, merchantId: string) =>
      getApiClient().post<ApiResponse<any>>(
        `/customers/${customerId}/favorites/merchants`,
        { merchantId }
      ),

    /**
     * Remove merchant from favorites
     */
    removeMerchant: (customerId: string, merchantId: string) =>
      getApiClient().delete(
        `/customers/${customerId}/favorites/merchants/${merchantId}`
      ),
  },

  // Reviews
  reviews: {
    /**
     * Get reviews by customer
     */
    list: (customerId: string) =>
      getApiClient().get<ApiResponse<any[]>>(`/customers/${customerId}/reviews`),

    /**
     * Create a review for an order
     */
    create: (
      customerId: string,
      data: {
        orderId: string;
        merchantRating?: number;
        driverRating?: number;
        comment?: string;
      }
    ) =>
      getApiClient().post<ApiResponse<any>>(
        `/customers/${customerId}/reviews`,
        data
      ),
  },
};
