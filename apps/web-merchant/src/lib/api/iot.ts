/**
 * IoT API Service
 * Handles all IoT-related API calls
 */

import { apiClient } from './client';
import { enhanceMockEquipment, type UIEquipment } from './transforms';

export interface Equipment {
  id: string;
  merchantId: string;
  name: string;
  type: 'WASHER' | 'DRYER' | 'PRESSER' | 'OTHER';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: Date;
  isIotEnabled: boolean;
  iotDeviceId?: string;
  status: 'OPERATIONAL' | 'WARNING' | 'ERROR' | 'OFFLINE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Telemetry {
  id: string;
  equipmentId: string;
  deviceId: string;
  timestamp: Date;
  powerWatts?: number;
  temperature?: number;
  vibration?: number;
  humidity?: number;
  waterLiters?: number;
  cycleCount?: number;
  isRunning: boolean;
  healthScore?: number;
  efficiencyScore?: number;
  createdAt: Date;
}

export interface TelemetryHistory {
  telemetry: Telemetry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  recommendations?: string[];
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceOptimization {
  equipmentId: string;
  period: string;
  energyUsageKwh: number;
  waterUsageLiters: number;
  estimatedEnergyCost: number;
  estimatedWaterCost: number;
  recommendations: Array<{
    type: 'ENERGY' | 'WATER' | 'SCHEDULING' | 'MAINTENANCE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    title: string;
    description: string;
    potentialSavings: number;
    estimatedImpact: string;
  }>;
  potentialMonthlySavings: number;
}

/**
 * Mock equipment data for development
 */
function getMockEquipment(): Equipment[] {
  return [
    {
      id: '1',
      merchantId: 'merchant-1',
      name: 'Industrial Washer #1',
      type: 'WASHER',
      manufacturer: 'Maytag',
      model: 'MAH8700A',
      serialNumber: 'WM-2023-001',
      installDate: new Date('2023-01-15'),
      isIotEnabled: true,
      iotDeviceId: 'device-001',
      status: 'OPERATIONAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      merchantId: 'merchant-1',
      name: 'Commercial Dryer #1',
      type: 'DRYER',
      manufacturer: 'Speed Queen',
      model: 'SDGN80',
      serialNumber: 'DR-2023-001',
      installDate: new Date('2023-02-20'),
      isIotEnabled: true,
      iotDeviceId: 'device-002',
      status: 'WARNING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      merchantId: 'merchant-1',
      name: 'Pressing Machine #1',
      type: 'PRESSER',
      manufacturer: 'Forenta',
      model: 'HP45',
      serialNumber: 'PR-2023-001',
      installDate: new Date('2023-03-10'),
      isIotEnabled: true,
      iotDeviceId: 'device-003',
      status: 'OPERATIONAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      merchantId: 'merchant-1',
      name: 'Washer #2',
      type: 'WASHER',
      manufacturer: 'Maytag',
      model: 'MAH8700A',
      serialNumber: 'WM-2023-002',
      installDate: new Date('2023-04-05'),
      isIotEnabled: false,
      status: 'OFFLINE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

/**
 * Get all equipment for a merchant (with UI-friendly data)
 */
export async function getEquipment(merchantId: string): Promise<UIEquipment[]> {
  try {
    const response = await apiClient.get(`/api/v1/iot/equipment`, {
      params: { merchantId },
    });
    // TODO: Transform API data with telemetry and alerts
    return response.data;
  } catch (error: any) {
    // Fallback to mock data if API is not available or requires auth
    if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
      console.warn('Using mock equipment data (API requires authentication or is unavailable)');
      const mockEquipment = getMockEquipment();
      // Transform mock equipment to include computed UI fields
      return mockEquipment.map(eq => enhanceMockEquipment(eq));
    }
    throw error;
  }
}

/**
 * Get equipment by ID
 */
export async function getEquipmentById(id: string): Promise<Equipment> {
  const response = await apiClient.get(`/api/v1/iot/equipment/${id}`);
  return response.data;
}

/**
 * Get current telemetry for equipment
 */
export async function getCurrentTelemetry(equipmentId: string): Promise<Telemetry | null> {
  try {
    const response = await apiClient.get(`/api/v1/iot/equipment/${equipmentId}/telemetry`);
    return response.data;
  } catch (error) {
    // Return null if no telemetry available
    return null;
  }
}

/**
 * Get telemetry history for equipment
 */
export async function getTelemetryHistory(
  equipmentId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<TelemetryHistory> {
  const response = await apiClient.get(`/api/v1/iot/equipment/${equipmentId}/telemetry/history`, {
    params,
  });
  return response.data;
}

/**
 * Get maintenance alerts for equipment
 */
export async function getMaintenanceAlerts(
  equipmentId: string,
  params?: {
    isResolved?: boolean;
    severity?: string;
  }
): Promise<MaintenanceAlert[]> {
  const response = await apiClient.get(`/api/v1/iot/equipment/${equipmentId}/alerts`, {
    params,
  });
  return response.data;
}

/**
 * Get all alerts for a merchant
 */
export async function getAllAlerts(
  merchantId: string,
  params?: {
    isResolved?: boolean;
    severity?: string;
  }
): Promise<MaintenanceAlert[]> {
  const response = await apiClient.get(`/api/v1/iot/alerts`, {
    params: { merchantId, ...params },
  });
  return response.data;
}

/**
 * Acknowledge/resolve an alert
 */
export async function resolveAlert(alertId: string): Promise<MaintenanceAlert> {
  const response = await apiClient.patch(`/api/v1/iot/alerts/${alertId}/resolve`);
  return response.data;
}

/**
 * Get resource optimization recommendations
 */
export async function getResourceOptimization(
  equipmentId: string,
  period: '7d' | '30d' | '90d' = '30d'
): Promise<ResourceOptimization> {
  const response = await apiClient.get(`/api/v1/iot/equipment/${equipmentId}/optimization`, {
    params: { period },
  });
  return response.data;
}

/**
 * Enable IoT for equipment
 */
export async function enableIoT(equipmentId: string): Promise<{ apiKey: string; deviceId: string }> {
  const response = await apiClient.post(`/api/v1/iot/equipment/${equipmentId}/enable`);
  return response.data;
}

/**
 * Disable IoT for equipment
 */
export async function disableIoT(equipmentId: string): Promise<void> {
  await apiClient.post(`/api/v1/iot/equipment/${equipmentId}/disable`);
}