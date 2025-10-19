/**
 * React Query hooks for IoT data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as iotApi from '../api/iot';

/**
 * Hook to fetch all equipment for a merchant
 */
export function useEquipment(merchantId: string) {
  return useQuery({
    queryKey: ['equipment', merchantId],
    queryFn: () => iotApi.getEquipment(merchantId),
    enabled: !!merchantId,
  });
}

/**
 * Hook to fetch equipment by ID
 */
export function useEquipmentById(equipmentId: string) {
  return useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => iotApi.getEquipmentById(equipmentId),
    enabled: !!equipmentId,
  });
}

/**
 * Hook to fetch current telemetry
 */
export function useCurrentTelemetry(equipmentId: string) {
  return useQuery({
    queryKey: ['telemetry', 'current', equipmentId],
    queryFn: () => iotApi.getCurrentTelemetry(equipmentId),
    enabled: !!equipmentId,
    refetchInterval: 30000, // Refetch every 30 seconds for near real-time data
  });
}

/**
 * Hook to fetch telemetry history
 */
export function useTelemetryHistory(
  equipmentId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ['telemetry', 'history', equipmentId, params],
    queryFn: () => iotApi.getTelemetryHistory(equipmentId, params),
    enabled: !!equipmentId,
  });
}

/**
 * Hook to fetch maintenance alerts for equipment
 */
export function useMaintenanceAlerts(
  equipmentId: string,
  params?: {
    isResolved?: boolean;
    severity?: string;
  }
) {
  return useQuery({
    queryKey: ['alerts', equipmentId, params],
    queryFn: () => iotApi.getMaintenanceAlerts(equipmentId, params),
    enabled: !!equipmentId,
  });
}

/**
 * Hook to fetch all alerts for a merchant
 */
export function useAllAlerts(
  merchantId: string,
  params?: {
    isResolved?: boolean;
    severity?: string;
  }
) {
  return useQuery({
    queryKey: ['alerts', 'all', merchantId, params],
    queryFn: () => iotApi.getAllAlerts(merchantId, params),
    enabled: !!merchantId,
  });
}

/**
 * Hook to fetch resource optimization
 */
export function useResourceOptimization(
  equipmentId: string,
  period: '7d' | '30d' | '90d' = '30d'
) {
  return useQuery({
    queryKey: ['optimization', equipmentId, period],
    queryFn: () => iotApi.getResourceOptimization(equipmentId, period),
    enabled: !!equipmentId,
  });
}

/**
 * Mutation to resolve an alert
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => iotApi.resolveAlert(alertId),
    onSuccess: () => {
      // Invalidate alerts queries to refetch
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

/**
 * Mutation to enable IoT for equipment
 */
export function useEnableIoT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: string) => iotApi.enableIoT(equipmentId),
    onSuccess: (_, equipmentId) => {
      // Invalidate equipment queries to refetch
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

/**
 * Mutation to disable IoT for equipment
 */
export function useDisableIoT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: string) => iotApi.disableIoT(equipmentId),
    onSuccess: (_, equipmentId) => {
      // Invalidate equipment queries to refetch
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}