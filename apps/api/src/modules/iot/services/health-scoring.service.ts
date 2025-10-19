import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

interface TelemetryData {
  powerWatts?: number;
  waterLiters?: number;
  temperature?: number;
  vibration?: number;
  cycleCount?: number;
  isRunning?: boolean;
}

interface EquipmentData {
  type: string;
  lastMaintenanceDate?: Date;
  purchaseDate?: Date;
}

interface HealthScoreResult {
  healthScore: number;
  efficiencyScore: number;
  issues: string[];
}

@Injectable()
export class HealthScoringService {
  private readonly logger = new Logger(HealthScoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate equipment health score based on telemetry data
   * Score range: 0-100 (100 = perfect health)
   */
  calculateHealthScore(
    telemetry: TelemetryData,
    equipment: EquipmentData,
  ): HealthScoreResult {
    let healthScore = 100;
    const issues: string[] = [];

    // 1. Vibration scoring (weight: 30%)
    if (telemetry.vibration !== undefined) {
      const vibrationPenalty = this.calculateVibrationPenalty(
        telemetry.vibration,
      );
      healthScore -= vibrationPenalty;
      if (vibrationPenalty > 10) {
        issues.push(`High vibration detected (${telemetry.vibration.toFixed(1)})`);
      }
    }

    // 2. Temperature scoring (weight: 20%)
    if (telemetry.temperature !== undefined && equipment.type === 'DRYER') {
      const tempPenalty = this.calculateTemperaturePenalty(
        telemetry.temperature,
        equipment.type,
      );
      healthScore -= tempPenalty;
      if (tempPenalty > 10) {
        issues.push(`Abnormal temperature (${telemetry.temperature}°C)`);
      }
    }

    // 3. Maintenance age scoring (weight: 25%)
    if (equipment.lastMaintenanceDate) {
      const maintenancePenalty = this.calculateMaintenancePenalty(
        equipment.lastMaintenanceDate,
      );
      healthScore -= maintenancePenalty;
      if (maintenancePenalty > 15) {
        const daysSince = Math.floor(
          (Date.now() - equipment.lastMaintenanceDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        issues.push(`Maintenance overdue (${daysSince} days since last service)`);
      }
    }

    // 4. Cycle count scoring (weight: 15%)
    if (telemetry.cycleCount !== undefined) {
      const cyclePenalty = this.calculateCyclePenalty(telemetry.cycleCount);
      healthScore -= cyclePenalty;
    }

    // 5. Equipment age scoring (weight: 10%)
    if (equipment.purchaseDate) {
      const agePenalty = this.calculateAgePenalty(equipment.purchaseDate);
      healthScore -= agePenalty;
    }

    // Ensure score is within bounds
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(
      telemetry,
      equipment,
    );

    return {
      healthScore: Math.round(healthScore),
      efficiencyScore: Math.round(efficiencyScore),
      issues,
    };
  }

  private calculateVibrationPenalty(vibration: number): number {
    // Normal: 0-2, Acceptable: 2-4, High: 4-6, Critical: 6+
    if (vibration <= 2) return 0;
    if (vibration <= 4) return (vibration - 2) * 5; // 0-10 penalty
    if (vibration <= 6) return 10 + (vibration - 4) * 10; // 10-30 penalty
    return 30 + (vibration - 6) * 15; // 30+ penalty
  }

  private calculateTemperaturePenalty(
    temperature: number,
    equipmentType: string,
  ): number {
    // Expected ranges by equipment type
    const expectedRanges: Record<string, { min: number; max: number }> = {
      WASHER: { min: 20, max: 70 },
      DRYER: { min: 50, max: 80 },
      STEAMER: { min: 80, max: 120 },
      PRESSER: { min: 100, max: 180 },
    };

    const range = expectedRanges[equipmentType] || { min: 20, max: 100 };

    if (temperature >= range.min && temperature <= range.max) {
      return 0; // Within normal range
    }

    // Calculate how far outside the range
    const deviation = Math.max(
      range.min - temperature,
      temperature - range.max,
    );
    return Math.min(30, deviation * 0.5); // Max 30 point penalty
  }

  private calculateMaintenancePenalty(lastMaintenanceDate: Date): number {
    const daysSince = Math.floor(
      (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Recommended maintenance every 90 days
    if (daysSince <= 90) return 0;
    if (daysSince <= 120) return (daysSince - 90) * 0.3; // 0-9 penalty
    if (daysSince <= 180) return 9 + (daysSince - 120) * 0.5; // 9-39 penalty
    return Math.min(50, 39 + (daysSince - 180) * 0.2); // Max 50 penalty
  }

  private calculateCyclePenalty(cycleCount: number): number {
    // Higher cycle count = more wear and tear
    if (cycleCount < 1000) return 0;
    if (cycleCount < 5000) return (cycleCount - 1000) * 0.001; // 0-4 penalty
    if (cycleCount < 10000) return 4 + (cycleCount - 5000) * 0.002; // 4-14 penalty
    return Math.min(20, 14 + (cycleCount - 10000) * 0.001); // Max 20 penalty
  }

  private calculateAgePenalty(purchaseDate: Date): number {
    const years =
      (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (years < 2) return 0;
    if (years < 5) return (years - 2) * 2; // 0-6 penalty
    if (years < 10) return 6 + (years - 5) * 3; // 6-21 penalty
    return Math.min(30, 21 + (years - 10) * 2); // Max 30 penalty
  }

  private calculateEfficiencyScore(
    telemetry: TelemetryData,
    equipment: EquipmentData,
  ): number {
    let efficiencyScore = 100;

    // Power efficiency (weight: 50%)
    if (telemetry.powerWatts !== undefined) {
      const expectedPower = this.getExpectedPower(
        equipment.type,
        telemetry.isRunning,
      );
      if (expectedPower && telemetry.powerWatts > expectedPower * 1.2) {
        // Using 20% more power than expected
        const excessPower =
          ((telemetry.powerWatts - expectedPower) / expectedPower) * 100;
        efficiencyScore -= Math.min(50, excessPower);
      }
    }

    // Water efficiency (weight: 30%)
    if (telemetry.waterLiters !== undefined && equipment.type === 'WASHER') {
      const expectedWater = 50; // Typical wash cycle
      if (telemetry.waterLiters > expectedWater * 1.3) {
        // Using 30% more water than expected
        const excessWater =
          ((telemetry.waterLiters - expectedWater) / expectedWater) * 100;
        efficiencyScore -= Math.min(30, excessWater * 0.3);
      }
    }

    // Cycle time efficiency (weight: 20%)
    // Could be implemented with historical data tracking
    // For now, not implemented

    return Math.max(0, Math.min(100, efficiencyScore));
  }

  private getExpectedPower(
    equipmentType: string,
    isRunning?: boolean,
  ): number | null {
    if (!isRunning) return null;

    const expectedPowerMap: Record<string, number> = {
      WASHER: 2000, // 2kW
      DRYER: 3000, // 3kW
      PRESSER: 1500, // 1.5kW
      STEAMER: 1800, // 1.8kW
    };

    return expectedPowerMap[equipmentType] || null;
  }

  /**
   * Determine if equipment needs immediate attention
   */
  needsImmediateAttention(healthScore: number, issues: string[]): boolean {
    return healthScore < 60 || issues.length >= 3;
  }

  /**
   * Get health status label
   */
  getHealthStatus(
    healthScore: number,
  ): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' {
    if (healthScore >= 90) return 'EXCELLENT';
    if (healthScore >= 75) return 'GOOD';
    if (healthScore >= 60) return 'FAIR';
    if (healthScore >= 40) return 'POOR';
    return 'CRITICAL';
  }
}
