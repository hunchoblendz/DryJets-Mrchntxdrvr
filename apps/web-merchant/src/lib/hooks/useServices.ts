/**
 * React Query hooks for Services API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  type Service,
  type CreateServiceDTO,
  type UpdateServiceDTO,
} from '../api/services';

/**
 * Query keys for services
 */
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (merchantId: string) => [...serviceKeys.lists(), merchantId] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (merchantId: string, serviceId: string) =>
    [...serviceKeys.details(), merchantId, serviceId] as const,
};

/**
 * Hook to fetch all services for a merchant
 */
export function useServices(merchantId: string) {
  return useQuery({
    queryKey: serviceKeys.list(merchantId),
    queryFn: () => getServices(merchantId),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single service by ID
 */
export function useServiceById(merchantId: string, serviceId: string) {
  return useQuery({
    queryKey: serviceKeys.detail(merchantId, serviceId),
    queryFn: () => getServiceById(merchantId, serviceId),
    enabled: !!merchantId && !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new service
 */
export function useCreateService(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDTO) => createService(merchantId, data),
    onSuccess: () => {
      // Invalidate services list to refetch
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(merchantId) });
    },
  });
}

/**
 * Hook to update a service
 */
export function useUpdateService(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateServiceDTO }) =>
      updateService(merchantId, serviceId, data),
    onSuccess: (data, variables) => {
      // Invalidate specific service detail
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(merchantId, variables.serviceId),
      });
      // Invalidate services list
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(merchantId) });
    },
  });
}

/**
 * Hook to delete a service
 */
export function useDeleteService(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(merchantId, serviceId),
    onSuccess: () => {
      // Invalidate services list
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(merchantId) });
    },
  });
}

/**
 * Hook to toggle service active status
 */
export function useToggleServiceStatus(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) =>
      toggleServiceStatus(merchantId, serviceId, isActive),
    onSuccess: (data, variables) => {
      // Invalidate specific service detail
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(merchantId, variables.serviceId),
      });
      // Invalidate services list
      queryClient.invalidateQueries({ queryKey: serviceKeys.list(merchantId) });
    },
  });
}