/**
 * Payments API Endpoints
 */

import { getApiClient } from '../client';
import type {
  Payment,
  PaymentListParams,
  CreatePaymentIntentParams,
  ConfirmPaymentParams,
  CreateRefundParams,
  MerchantOnboardParams,
  ApiResponse,
} from '../types';

export const paymentsApi = {
  /**
   * List payments with optional filters
   */
  list: (params?: PaymentListParams) =>
    getApiClient().get<ApiResponse<Payment[]>>('/payments', { params }),

  /**
   * Get payment by ID
   */
  getById: (id: string) =>
    getApiClient().get<ApiResponse<Payment>>(`/payments/${id}`),

  /**
   * Create a payment intent (Stripe)
   */
  createIntent: (data: CreatePaymentIntentParams) =>
    getApiClient().post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>(
      '/payments/intent',
      data
    ),

  /**
   * Confirm a payment
   */
  confirm: (data: ConfirmPaymentParams) =>
    getApiClient().post<ApiResponse<Payment>>('/payments/confirm', data),

  /**
   * Create a refund
   */
  refund: (data: CreateRefundParams) =>
    getApiClient().post<ApiResponse<Payment>>('/payments/refund', data),

  /**
   * Get payment for an order
   */
  getByOrder: (orderId: string) =>
    getApiClient().get<ApiResponse<Payment>>(`/payments/order/${orderId}`),

  // Stripe Connect (for merchants)
  connect: {
    /**
     * Onboard a merchant to Stripe Connect
     */
    onboard: (data: MerchantOnboardParams) =>
      getApiClient().post<ApiResponse<{ url: string }>>(
        '/payments/merchant/onboard',
        data
      ),

    /**
     * Get merchant's Stripe account status
     */
    getStatus: (merchantId: string) =>
      getApiClient().get<ApiResponse<{ accountId: string; status: string; payoutsEnabled: boolean }>>(
        `/payments/merchant/${merchantId}/status`
      ),

    /**
     * Get merchant's payout history
     */
    getPayouts: (merchantId: string, params?: { startDate?: string; endDate?: string }) =>
      getApiClient().get<ApiResponse<any[]>>(`/payments/merchant/${merchantId}/payouts`, {
        params,
      }),

    /**
     * Create a manual payout to merchant
     */
    createPayout: (merchantId: string, amount: number) =>
      getApiClient().post<ApiResponse<any>>(`/payments/merchant/${merchantId}/payout`, {
        amount,
      }),
  },
};
