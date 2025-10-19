/**
 * React Query hooks for Orders API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  type OrderQueryParams,
  type OrderListItem,
  type Order,
} from '../api/orders';

/**
 * Query keys for orders
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderQueryParams) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to fetch orders list with filters
 */
export function useOrders(params: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrders(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrderById(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: string; note?: string }) =>
      updateOrderStatus(orderId, status, note),
    onSuccess: (data) => {
      // Invalidate and refetch order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      // Invalidate orders list to show updated status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelOrder(orderId, reason),
    onSuccess: (data) => {
      // Invalidate and refetch order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      // Invalidate orders list to show updated status
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}