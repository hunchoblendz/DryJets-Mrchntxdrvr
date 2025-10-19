/**
 * Data transformation utilities
 * Maps API data to component-friendly formats
 */

import { Equipment as APIEquipment } from './iot';

export interface UIEquipment {
  id: string;
  name: string;
  type: string;
  status: string;
  isIotEnabled: boolean;
  lastTelemetryAt?: string;
  healthScore?: number;
  healthStatus?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  efficiencyScore?: number;
  isRunning: boolean;
  openAlerts: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

/**
 * Calculate health status label from health score
 */
function getHealthStatus(score: number | undefined): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' | undefined {
  if (score === undefined) return undefined;
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'FAIR';
  if (score >= 40) return 'POOR';
  return 'CRITICAL';
}

/**
 * Transform API equipment to UI equipment format
 */
export function transformEquipment(equipment: APIEquipment, telemetry?: any, alerts?: any[]): UIEquipment {
  const healthScore = telemetry?.healthScore;
  const openAlerts = alerts?.filter(a => !a.isResolved).length || 0;

  return {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    status: equipment.status,
    isIotEnabled: equipment.isIotEnabled,
    lastTelemetryAt: telemetry?.timestamp,
    healthScore,
    healthStatus: getHealthStatus(healthScore),
    efficiencyScore: telemetry?.efficiencyScore,
    isRunning: telemetry?.isRunning || false,
    openAlerts,
    lastMaintenanceDate: undefined, // TODO: Get from maintenance history
    nextMaintenanceDate: undefined, // TODO: Get from maintenance schedule
  };
}

/**
 * Transform mock equipment data to include computed fields
 */
export function enhanceMockEquipment(equipment: APIEquipment): UIEquipment {
  // Generate mock telemetry data based on equipment type
  const mockHealthScores = {
    '1': 87,
    '2': 74,
    '3': 95,
    '4': undefined,
  };

  const mockAlerts = {
    '1': 0,
    '2': 2,
    '3': 0,
    '4': 0,
  };

  const mockRunning = {
    '1': true,
    '2': false,
    '3': true,
    '4': false,
  };

  const healthScore = mockHealthScores[equipment.id as keyof typeof mockHealthScores];

  return {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    status: equipment.status,
    isIotEnabled: equipment.isIotEnabled,
    lastTelemetryAt: equipment.isIotEnabled ? new Date().toISOString() : undefined,
    healthScore,
    healthStatus: getHealthStatus(healthScore),
    efficiencyScore: healthScore ? healthScore + Math.floor(Math.random() * 10) - 5 : undefined,
    isRunning: mockRunning[equipment.id as keyof typeof mockRunning] || false,
    openAlerts: mockAlerts[equipment.id as keyof typeof mockAlerts] || 0,
    lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  };
}