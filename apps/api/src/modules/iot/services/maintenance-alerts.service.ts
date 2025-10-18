import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  AlertSeverity,
  AlertStatus,
  EquipmentType,
  MaintenanceAlertType,
} from '@prisma/client';

interface TelemetryData {
  powerWatts?: number;
  waterLiters?: number;
  temperature?: number;
  vibration?: number;
  cycleCount?: number;
  isRunning?: boolean;
  healthScore?: number;
  efficiencyScore?: number;
}

interface EquipmentData {
  id: string;
  merchantId: string;
  type: EquipmentType;
  lastMaintenanceDate?: Date;
  purchaseDate?: Date;
}

interface AlertTrigger {
  type: MaintenanceAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation: string;
  triggerData: Record<string, any>;
}

@Injectable()
export class MaintenanceAlertsService {
  private readonly logger = new Logger(MaintenanceAlertsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze telemetry and equipment data to generate alerts
   */
  async analyzeAndCreateAlerts(
    telemetry: TelemetryData,
    equipment: EquipmentData,
  ): Promise<void> {
    const alerts = this.detectAnomalies(telemetry, equipment);

    // Create alerts that don't already exist
    for (const alert of alerts) {
      await this.createAlertIfNotExists(equipment, alert);
    }
  }

  /**
   * Detect anomalies and generate alert triggers
   */
  private detectAnomalies(
    telemetry: TelemetryData,
    equipment: EquipmentData,
  ): AlertTrigger[] {
    const alerts: AlertTrigger[] = [];

    // 1. High Vibration Detection
    if (telemetry.vibration !== undefined && telemetry.vibration > 5.0) {
      alerts.push({
        type: MaintenanceAlertType.HIGH_VIBRATION,
        severity:
          telemetry.vibration > 7.0 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        title: 'High Vibration Detected',
        description: `Equipment is experiencing abnormally high vibration levels (${telemetry.vibration.toFixed(1)}/10). This may indicate imbalance, worn bearings, or loose components.`,
        recommendation:
          'Check for load imbalance. Inspect mounting bolts and floor leveling. Consider professional inspection if vibration persists.',
        triggerData: {
          vibration: telemetry.vibration,
          threshold: 5.0,
        },
      });
    }

    // 2. High Temperature Detection
    if (telemetry.temperature !== undefined) {
      const tempAlert = this.checkTemperatureAnomaly(
        telemetry.temperature,
        equipment.type,
      );
      if (tempAlert) {
        alerts.push(tempAlert);
      }
    }

    // 3. Preventive Maintenance Scheduling
    if (equipment.lastMaintenanceDate) {
      const maintenanceAlert = this.checkMaintenanceSchedule(
        equipment.lastMaintenanceDate,
      );
      if (maintenanceAlert) {
        alerts.push(maintenanceAlert);
      }
    }

    // 4. Low Efficiency Detection
    if (
      telemetry.efficiencyScore !== undefined &&
      telemetry.efficiencyScore < 70
    ) {
      alerts.push({
        type: MaintenanceAlertType.LOW_EFFICIENCY,
        severity:
          telemetry.efficiencyScore < 50
            ? AlertSeverity.HIGH
            : AlertSeverity.MEDIUM,
        title: 'Low Equipment Efficiency',
        description: `Equipment efficiency has dropped to ${telemetry.efficiencyScore}%. This may result in higher utility costs and longer cycle times.`,
        recommendation:
          'Check for clogged filters, lint buildup, or water inlet issues. Consider running a maintenance cycle or professional cleaning.',
        triggerData: {
          efficiencyScore: telemetry.efficiencyScore,
          threshold: 70,
        },
      });
    }

    // 5. Power Spike Detection
    if (telemetry.powerWatts !== undefined) {
      const powerAlert = this.checkPowerAnomaly(
        telemetry.powerWatts,
        equipment.type,
      );
      if (powerAlert) {
        alerts.push(powerAlert);
      }
    }

    // 6. Cycle Count Based Maintenance
    if (telemetry.cycleCount !== undefined) {
      const cycleAlert = this.checkCycleBasedMaintenance(
        telemetry.cycleCount,
        equipment.lastMaintenanceDate,
      );
      if (cycleAlert) {
        alerts.push(cycleAlert);
      }
    }

    return alerts;
  }

  private checkTemperatureAnomaly(
    temperature: number,
    equipmentType: EquipmentType,
  ): AlertTrigger | null {
    const thresholds: Record<string, { max: number; critical: number }> = {
      WASHER: { max: 75, critical: 85 },
      DRYER: { max: 85, critical: 100 },
      STEAMER: { max: 130, critical: 150 },
      PRESSER: { max: 190, critical: 220 },
    };

    const threshold = thresholds[equipmentType];
    if (!threshold) return null;

    if (temperature > threshold.critical) {
      return {
        type: MaintenanceAlertType.HIGH_TEMPERATURE,
        severity: AlertSeverity.CRITICAL,
        title: 'Critical Temperature Detected',
        description: `Equipment temperature (${temperature}°C) has exceeded critical threshold (${threshold.critical}°C). Risk of equipment damage or fire hazard.`,
        recommendation:
          'IMMEDIATE ACTION REQUIRED: Shut down equipment. Check thermostat, heating elements, and ventilation. Contact service technician immediately.',
        triggerData: {
          temperature,
          threshold: threshold.critical,
          equipmentType,
        },
      };
    } else if (temperature > threshold.max) {
      return {
        type: MaintenanceAlertType.HIGH_TEMPERATURE,
        severity: AlertSeverity.HIGH,
        title: 'High Temperature Warning',
        description: `Equipment temperature (${temperature}°C) is higher than recommended (${threshold.max}°C). May reduce equipment lifespan.`,
        recommendation:
          'Check ventilation and air filters. Ensure adequate clearance around equipment. Monitor temperature closely.',
        triggerData: {
          temperature,
          threshold: threshold.max,
          equipmentType,
        },
      };
    }

    return null;
  }

  private checkMaintenanceSchedule(
    lastMaintenanceDate: Date,
  ): AlertTrigger | null {
    const daysSince = Math.floor(
      (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Recommended maintenance every 90 days
    if (daysSince > 120) {
      return {
        type: MaintenanceAlertType.PREVENTIVE_MAINTENANCE,
        severity: daysSince > 180 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        title: 'Maintenance Overdue',
        description: `Equipment maintenance is overdue by ${daysSince - 90} days. Last maintenance was ${daysSince} days ago.`,
        recommendation:
          'Schedule professional maintenance to prevent unexpected breakdowns and ensure optimal performance.',
        triggerData: {
          daysSince,
          lastMaintenanceDate: lastMaintenanceDate.toISOString(),
        },
      };
    } else if (daysSince > 80) {
      return {
        type: MaintenanceAlertType.PREVENTIVE_MAINTENANCE,
        severity: AlertSeverity.LOW,
        title: 'Maintenance Due Soon',
        description: `Equipment maintenance is due in ${90 - daysSince} days.`,
        recommendation:
          'Schedule maintenance appointment to avoid service interruption.',
        triggerData: {
          daysSince,
          lastMaintenanceDate: lastMaintenanceDate.toISOString(),
        },
      };
    }

    return null;
  }

  private checkPowerAnomaly(
    powerWatts: number,
    equipmentType: EquipmentType,
  ): AlertTrigger | null {
    const expectedPower: Record<string, number> = {
      WASHER: 2000,
      DRYER: 3000,
      PRESSER: 1500,
      STEAMER: 1800,
    };

    const expected = expectedPower[equipmentType];
    if (!expected) return null;

    // Alert if using 50% more power than expected
    if (powerWatts > expected * 1.5) {
      return {
        type: MaintenanceAlertType.POWER_SPIKE,
        severity: AlertSeverity.MEDIUM,
        title: 'Excessive Power Consumption',
        description: `Equipment is consuming ${powerWatts}W, which is ${Math.round(((powerWatts - expected) / expected) * 100)}% higher than expected (${expected}W).`,
        recommendation:
          'Check for mechanical resistance, worn parts, or electrical issues. May indicate motor problems or component failure.',
        triggerData: {
          powerWatts,
          expectedPower: expected,
          excessPercentage: Math.round(
            ((powerWatts - expected) / expected) * 100,
          ),
        },
      };
    }

    return null;
  }

  private checkCycleBasedMaintenance(
    cycleCount: number,
    lastMaintenanceDate?: Date,
  ): AlertTrigger | null {
    // Recommend filter replacement every 500 cycles
    if (cycleCount % 500 === 0 && cycleCount > 0) {
      return {
        type: MaintenanceAlertType.FILTER_REPLACEMENT,
        severity: AlertSeverity.LOW,
        title: 'Filter Replacement Recommended',
        description: `Equipment has completed ${cycleCount} cycles. Filter replacement is recommended for optimal performance.`,
        recommendation:
          'Replace lint filters, water filters, and clean ventilation systems.',
        triggerData: {
          cycleCount,
          milestone: 500,
        },
      };
    }

    return null;
  }

  /**
   * Create alert only if a similar one doesn't already exist
   */
  private async createAlertIfNotExists(
    equipment: EquipmentData,
    alert: AlertTrigger,
  ): Promise<void> {
    // Check if an open alert of the same type already exists
    const existingAlert = await this.prisma.maintenanceAlert.findFirst({
      where: {
        equipmentId: equipment.id,
        type: alert.type,
        status: {
          in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED],
        },
      },
    });

    if (existingAlert) {
      this.logger.debug(
        `Alert of type ${alert.type} already exists for equipment ${equipment.id}`,
      );
      return;
    }

    // Create new alert
    await this.prisma.maintenanceAlert.create({
      data: {
        equipmentId: equipment.id,
        merchantId: equipment.merchantId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        recommendation: alert.recommendation,
        triggerData: alert.triggerData,
      },
    });

    this.logger.log(
      `Created ${alert.severity} alert for equipment ${equipment.id}: ${alert.title}`,
    );

    // TODO: Send notification to merchant via NotificationsService
  }

  /**
   * Get all alerts for a merchant
   */
  async getMerchantAlerts(
    merchantId: string,
    filters?: {
      status?: AlertStatus;
      severity?: AlertSeverity;
      type?: MaintenanceAlertType;
      equipmentId?: string;
    },
  ) {
    const where: any = { merchantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.type) where.type = filters.type;
    if (filters?.equipmentId) where.equipmentId = filters.equipmentId;

    return this.prisma.maintenanceAlert.findMany({
      where,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, notes?: string) {
    return this.prisma.maintenanceAlert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution: string) {
    return this.prisma.maintenanceAlert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  /**
   * Auto-resolve alerts when telemetry returns to normal
   */
  async autoResolveIfNormal(equipment: EquipmentData, telemetry: TelemetryData) {
    // Get open alerts for this equipment
    const openAlerts = await this.prisma.maintenanceAlert.findMany({
      where: {
        equipmentId: equipment.id,
        status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
      },
    });

    for (const alert of openAlerts) {
      let shouldResolve = false;
      let resolution = '';

      switch (alert.type) {
        case MaintenanceAlertType.HIGH_VIBRATION:
          if (telemetry.vibration && telemetry.vibration < 4.0) {
            shouldResolve = true;
            resolution = `Vibration returned to normal levels (${telemetry.vibration.toFixed(1)}/10)`;
          }
          break;

        case MaintenanceAlertType.HIGH_TEMPERATURE:
          if (telemetry.temperature && telemetry.temperature < 80) {
            shouldResolve = true;
            resolution = `Temperature returned to normal (${telemetry.temperature}°C)`;
          }
          break;

        case MaintenanceAlertType.LOW_EFFICIENCY:
          if (
            telemetry.efficiencyScore &&
            telemetry.efficiencyScore > 75
          ) {
            shouldResolve = true;
            resolution = `Efficiency improved to ${telemetry.efficiencyScore}%`;
          }
          break;
      }

      if (shouldResolve) {
        await this.resolveAlert(alert.id, `Auto-resolved: ${resolution}`);
        this.logger.log(`Auto-resolved alert ${alert.id}: ${resolution}`);
      }
    }
  }
}
