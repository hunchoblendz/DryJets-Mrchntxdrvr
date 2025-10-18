import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EquipmentType } from '@prisma/client';

interface ResourceUsageData {
  powerWatts: number;
  waterLiters?: number;
  cycleType?: string;
  timestamp: Date;
}

interface OptimizationRecommendation {
  type: 'ENERGY' | 'WATER' | 'SCHEDULING' | 'MAINTENANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  description: string;
  potentialSavings: {
    amount: number;
    unit: 'USD' | 'kWh' | 'Liters' | 'Hours';
    period: 'daily' | 'weekly' | 'monthly' | 'annually';
  };
  actionItems: string[];
}

interface ResourceMetrics {
  totalEnergyKwh: number;
  totalWaterLiters: number;
  totalCycles: number;
  averagePowerWatts: number;
  averageWaterPerCycle: number;
  peakUsageHours: number[];
  estimatedMonthlyCost: number;
}

@Injectable()
export class ResourceOptimizationService {
  private readonly logger = new Logger(ResourceOptimizationService.name);

  // Average utility rates (can be customized per merchant)
  private readonly ENERGY_RATE_PER_KWH = 0.13; // $0.13 per kWh (US average)
  private readonly WATER_RATE_PER_GALLON = 0.004; // $0.004 per gallon
  private readonly LITERS_PER_GALLON = 3.785;

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze resource usage and generate optimization recommendations
   */
  async generateOptimizationRecommendations(
    merchantId: string,
    equipmentId?: string,
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Get historical telemetry data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const telemetryLogs = await this.prisma.equipmentTelemetryLog.findMany({
      where: {
        ...(equipmentId && { equipmentId }),
        equipment: { merchantId },
        timestamp: { gte: thirtyDaysAgo },
      },
      include: {
        equipment: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    if (telemetryLogs.length === 0) {
      return recommendations;
    }

    // Calculate resource metrics
    const metrics = this.calculateResourceMetrics(telemetryLogs);

    // Generate recommendations based on analysis
    recommendations.push(...this.analyzeEnergyUsage(metrics, telemetryLogs));
    recommendations.push(...this.analyzeWaterUsage(metrics, telemetryLogs));
    recommendations.push(...this.analyzeSchedulingOpportunities(metrics));
    recommendations.push(...this.analyzeMaintenanceImpact(metrics));

    // Sort by potential savings
    return recommendations.sort(
      (a, b) => b.potentialSavings.amount - a.potentialSavings.amount,
    );
  }

  private calculateResourceMetrics(telemetryLogs: any[]): ResourceMetrics {
    let totalEnergyWh = 0;
    let totalWaterLiters = 0;
    let totalCycles = 0;
    let totalPower = 0;
    let cycleWater: number[] = [];
    const hourlyUsage: Record<number, number> = {};

    for (const log of telemetryLogs) {
      const data = log.data as any;

      if (data.powerWatts) {
        totalPower += data.powerWatts;
        // Assuming telemetry is sent every 5 minutes
        totalEnergyWh += (data.powerWatts * 5) / 60;

        // Track hourly usage
        const hour = new Date(log.timestamp).getHours();
        hourlyUsage[hour] = (hourlyUsage[hour] || 0) + data.powerWatts;
      }

      if (data.waterLiters) {
        totalWaterLiters += data.waterLiters;
        if (data.cycleType === 'WASH') {
          cycleWater.push(data.waterLiters);
        }
      }

      if (data.cycleCount) {
        totalCycles = Math.max(totalCycles, data.cycleCount);
      }
    }

    // Find peak usage hours (top 3)
    const peakUsageHours = Object.entries(hourlyUsage)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const averagePowerWatts = totalPower / telemetryLogs.length;
    const averageWaterPerCycle =
      cycleWater.length > 0
        ? cycleWater.reduce((a, b) => a + b, 0) / cycleWater.length
        : 0;

    const totalEnergyKwh = totalEnergyWh / 1000;
    const monthlyCostEnergy = totalEnergyKwh * this.ENERGY_RATE_PER_KWH;
    const monthlyCostWater =
      (totalWaterLiters / this.LITERS_PER_GALLON) *
      this.WATER_RATE_PER_GALLON;

    return {
      totalEnergyKwh,
      totalWaterLiters,
      totalCycles,
      averagePowerWatts,
      averageWaterPerCycle,
      peakUsageHours,
      estimatedMonthlyCost: monthlyCostEnergy + monthlyCostWater,
    };
  }

  private analyzeEnergyUsage(
    metrics: ResourceMetrics,
    telemetryLogs: any[],
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Check for excessive power consumption
    const avgPowerKw = metrics.averagePowerWatts / 1000;
    if (avgPowerKw > 2.5) {
      // Higher than average
      const potentialSavings = (avgPowerKw - 2.0) * 24 * 30 * this.ENERGY_RATE_PER_KWH;

      recommendations.push({
        type: 'ENERGY',
        priority: potentialSavings > 50 ? 'HIGH' : 'MEDIUM',
        title: 'High Energy Consumption Detected',
        description: `Your equipment is consuming an average of ${avgPowerKw.toFixed(1)}kW, which is above the industry average of 2.0kW. This may indicate inefficiencies.`,
        potentialSavings: {
          amount: Math.round(potentialSavings),
          unit: 'USD',
          period: 'monthly',
        },
        actionItems: [
          'Clean lint filters and ventilation systems',
          'Inspect heating elements for buildup',
          'Check for mechanical resistance or worn parts',
          'Consider upgrading to energy-efficient equipment',
          'Schedule professional energy audit',
        ],
      });
    }

    // Off-peak scheduling recommendation
    if (metrics.peakUsageHours.some((hour) => hour >= 12 && hour <= 18)) {
      // Operating during peak hours
      const offPeakSavings = metrics.totalEnergyKwh * 0.3 * 0.05; // 5% savings if 30% moved to off-peak

      recommendations.push({
        type: 'SCHEDULING',
        priority: 'MEDIUM',
        title: 'Shift Operations to Off-Peak Hours',
        description: `You're operating heavily during peak hours (${metrics.peakUsageHours.join(', ')}:00). Shifting some operations to off-peak hours (10pm-6am) can reduce energy costs.`,
        potentialSavings: {
          amount: Math.round(offPeakSavings * this.ENERGY_RATE_PER_KWH),
          unit: 'USD',
          period: 'monthly',
        },
        actionItems: [
          'Schedule bulk laundry processing after 10pm',
          'Pre-stage orders for early morning processing',
          'Negotiate time-of-use electricity rates with utility company',
          'Install smart timers for equipment startup',
        ],
      });
    }

    return recommendations;
  }

  private analyzeWaterUsage(
    metrics: ResourceMetrics,
    telemetryLogs: any[],
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    if (metrics.averageWaterPerCycle > 50) {
      // Above industry standard
      const excessWater = metrics.averageWaterPerCycle - 40; // Target 40L per cycle
      const monthlySavings =
        ((excessWater * metrics.totalCycles) / this.LITERS_PER_GALLON) *
        this.WATER_RATE_PER_GALLON;

      recommendations.push({
        type: 'WATER',
        priority: monthlySavings > 20 ? 'HIGH' : 'MEDIUM',
        title: 'Excessive Water Consumption',
        description: `Average water usage per cycle (${metrics.averageWaterPerCycle.toFixed(1)}L) exceeds industry best practices (40L). Reducing consumption can cut costs and support sustainability.`,
        potentialSavings: {
          amount: Math.round(monthlySavings),
          unit: 'USD',
          period: 'monthly',
        },
        actionItems: [
          'Check for water leaks in hoses and connections',
          'Calibrate water inlet valves',
          'Use optimal load sizes to maximize efficiency',
          'Install water reclamation system for rinse water reuse',
          'Upgrade to high-efficiency nozzles',
        ],
      });
    }

    return recommendations;
  }

  private analyzeSchedulingOpportunities(
    metrics: ResourceMetrics,
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Batch processing recommendation
    if (metrics.totalCycles > 200) {
      // High volume merchant
      const efficiencyGain = metrics.estimatedMonthlyCost * 0.1; // 10% improvement possible

      recommendations.push({
        type: 'SCHEDULING',
        priority: 'MEDIUM',
        title: 'Optimize Batch Processing',
        description: `With ${metrics.totalCycles} cycles per month, implementing strategic batch processing can improve equipment utilization and reduce energy costs.`,
        potentialSavings: {
          amount: Math.round(efficiencyGain),
          unit: 'USD',
          period: 'monthly',
        },
        actionItems: [
          'Group similar fabric types for consecutive processing',
          'Schedule full loads to avoid partial cycles',
          'Implement order consolidation system',
          'Train staff on efficient load management',
          'Use predictive scheduling based on order patterns',
        ],
      });
    }

    return recommendations;
  }

  private analyzeMaintenanceImpact(
    metrics: ResourceMetrics,
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Preventive maintenance for efficiency
    const maintenanceSavings = metrics.estimatedMonthlyCost * 0.15; // 15% improvement from good maintenance

    recommendations.push({
      type: 'MAINTENANCE',
      priority: 'MEDIUM',
      title: 'Preventive Maintenance for Efficiency',
      description: `Regular maintenance can improve equipment efficiency by 15-20%, reducing utility costs and extending equipment lifespan.`,
      potentialSavings: {
        amount: Math.round(maintenanceSavings),
        unit: 'USD',
        period: 'monthly',
      },
      actionItems: [
        'Clean lint filters weekly',
        'Inspect and lubricate moving parts quarterly',
        'Descale heating elements every 6 months',
        'Check electrical connections annually',
        'Schedule professional inspection every 90 days',
      ],
    });

    return recommendations;
  }

  /**
   * Calculate cost savings from implementing recommendations
   */
  calculatePotentialSavings(
    recommendations: OptimizationRecommendation[],
  ): {
    monthly: number;
    annually: number;
    breakdown: Record<string, number>;
  } {
    let monthlyTotal = 0;
    const breakdown: Record<string, number> = {};

    for (const rec of recommendations) {
      let monthlySavings = rec.potentialSavings.amount;

      // Convert to monthly if needed
      if (rec.potentialSavings.period === 'annually') {
        monthlySavings = monthlySavings / 12;
      } else if (rec.potentialSavings.period === 'weekly') {
        monthlySavings = monthlySavings * 4.33;
      } else if (rec.potentialSavings.period === 'daily') {
        monthlySavings = monthlySavings * 30;
      }

      monthlyTotal += monthlySavings;
      breakdown[rec.type] = (breakdown[rec.type] || 0) + monthlySavings;
    }

    return {
      monthly: Math.round(monthlyTotal),
      annually: Math.round(monthlyTotal * 12),
      breakdown,
    };
  }

  /**
   * Get resource usage summary for dashboard
   */
  async getResourceUsageSummary(merchantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const telemetryLogs = await this.prisma.equipmentTelemetryLog.findMany({
      where: {
        equipment: { merchantId },
        timestamp: { gte: startDate },
      },
    });

    const metrics = this.calculateResourceMetrics(telemetryLogs);

    return {
      period: { days, startDate, endDate: new Date() },
      energy: {
        totalKwh: Math.round(metrics.totalEnergyKwh * 100) / 100,
        averageKwPerDay:
          Math.round((metrics.totalEnergyKwh / days) * 100) / 100,
        estimatedCost:
          Math.round(
            metrics.totalEnergyKwh * this.ENERGY_RATE_PER_KWH * 100,
          ) / 100,
      },
      water: {
        totalLiters: Math.round(metrics.totalWaterLiters),
        averageLitersPerDay: Math.round(metrics.totalWaterLiters / days),
        averageLitersPerCycle:
          Math.round(metrics.averageWaterPerCycle * 100) / 100,
        estimatedCost:
          Math.round(
            ((metrics.totalWaterLiters / this.LITERS_PER_GALLON) *
              this.WATER_RATE_PER_GALLON) *
              100,
          ) / 100,
      },
      usage: {
        totalCycles: metrics.totalCycles,
        peakHours: metrics.peakUsageHours,
      },
      totalEstimatedCost:
        Math.round(metrics.estimatedMonthlyCost * (days / 30) * 100) / 100,
    };
  }
}
