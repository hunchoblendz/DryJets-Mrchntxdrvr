import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { HealthScoringService } from './services/health-scoring.service';
import { MaintenanceAlertsService } from './services/maintenance-alerts.service';
import { ResourceOptimizationService } from './services/resource-optimization.service';
import { SubmitTelemetryDto, EnableIotDto } from './dto/telemetry.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(
    private prisma: PrismaService,
    private healthScoringService: HealthScoringService,
    private maintenanceAlertsService: MaintenanceAlertsService,
    private resourceOptimizationService: ResourceOptimizationService,
  ) {}

  /**
   * Submit telemetry data from IoT device
   */
  async submitTelemetry(telemetryDto: SubmitTelemetryDto, apiKey?: string) {
    // Find equipment by ID or IoT device ID
    const equipment = await this.findEquipmentForTelemetry(
      telemetryDto.equipmentId,
      apiKey,
    );

    if (!equipment.isIotEnabled) {
      throw new BadRequestException(
        'IoT is not enabled for this equipment. Please enable IoT integration first.',
      );
    }

    // Get or create telemetry record
    let telemetry = await this.prisma.equipmentTelemetry.findUnique({
      where: { equipmentId: equipment.id },
    });

    // Calculate health and efficiency scores
    const scores = this.healthScoringService.calculateHealthScore(
      {
        powerWatts: telemetryDto.powerWatts,
        waterLiters: telemetryDto.waterLiters,
        temperature: telemetryDto.temperature,
        vibration: telemetryDto.vibration,
        cycleCount: telemetry?.cycleCount || 0,
        isRunning: telemetryDto.isRunning,
      },
      {
        type: equipment.type,
        lastMaintenanceDate: equipment.lastMaintenanceDate || undefined,
        purchaseDate: equipment.purchaseDate || undefined,
      },
    );

    // Increment cycle count if machine just started running
    let newCycleCount = telemetry?.cycleCount || 0;
    if (telemetryDto.isRunning && telemetry && !telemetry.isRunning) {
      newCycleCount += 1;
    }

    // Update or create telemetry
    telemetry = await this.prisma.equipmentTelemetry.upsert({
      where: { equipmentId: equipment.id },
      update: {
        powerWatts: telemetryDto.powerWatts,
        waterLiters: telemetryDto.waterLiters,
        temperature: telemetryDto.temperature,
        vibration: telemetryDto.vibration,
        cycleType: telemetryDto.cycleType,
        isRunning: telemetryDto.isRunning ?? false,
        cycleStartedAt: telemetryDto.cycleStartedAt
          ? new Date(telemetryDto.cycleStartedAt)
          : undefined,
        cycleEstimatedEnd: telemetryDto.cycleEstimatedEnd
          ? new Date(telemetryDto.cycleEstimatedEnd)
          : undefined,
        cycleCount: newCycleCount,
        healthScore: scores.healthScore,
        efficiencyScore: scores.efficiencyScore,
      },
      create: {
        equipmentId: equipment.id,
        powerWatts: telemetryDto.powerWatts,
        waterLiters: telemetryDto.waterLiters,
        temperature: telemetryDto.temperature,
        vibration: telemetryDto.vibration,
        cycleType: telemetryDto.cycleType,
        isRunning: telemetryDto.isRunning ?? false,
        cycleStartedAt: telemetryDto.cycleStartedAt
          ? new Date(telemetryDto.cycleStartedAt)
          : undefined,
        cycleEstimatedEnd: telemetryDto.cycleEstimatedEnd
          ? new Date(telemetryDto.cycleEstimatedEnd)
          : undefined,
        cycleCount: newCycleCount,
        healthScore: scores.healthScore,
        efficiencyScore: scores.efficiencyScore,
      },
    });

    // Store historical log for analytics
    await this.prisma.equipmentTelemetryLog.create({
      data: {
        equipmentId: equipment.id,
        data: {
          ...telemetryDto,
          healthScore: scores.healthScore,
          efficiencyScore: scores.efficiencyScore,
          cycleCount: newCycleCount,
        },
      },
    });

    // Update equipment lastTelemetryAt
    await this.prisma.equipment.update({
      where: { id: equipment.id },
      data: { lastTelemetryAt: new Date() },
    });

    // Analyze for maintenance alerts
    await this.maintenanceAlertsService.analyzeAndCreateAlerts(
      {
        ...telemetryDto,
        cycleCount: newCycleCount,
        healthScore: scores.healthScore,
        efficiencyScore: scores.efficiencyScore,
      },
      {
        id: equipment.id,
        merchantId: equipment.merchantId,
        type: equipment.type,
        lastMaintenanceDate: equipment.lastMaintenanceDate || undefined,
        purchaseDate: equipment.purchaseDate || undefined,
      },
    );

    // Auto-resolve alerts if telemetry returned to normal
    await this.maintenanceAlertsService.autoResolveIfNormal(
      {
        id: equipment.id,
        merchantId: equipment.merchantId,
        type: equipment.type,
      },
      {
        ...telemetryDto,
        healthScore: scores.healthScore,
        efficiencyScore: scores.efficiencyScore,
      },
    );

    this.logger.log(
      `Telemetry received for equipment ${equipment.id} | Health: ${scores.healthScore} | Efficiency: ${scores.efficiencyScore}`,
    );

    return {
      success: true,
      telemetry,
      healthStatus:
        this.healthScoringService.getHealthStatus(scores.healthScore),
      issues: scores.issues,
    };
  }

  /**
   * Get current telemetry for equipment
   */
  async getCurrentTelemetry(equipmentId: string, merchantId: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id: equipmentId, merchantId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    const telemetry = await this.prisma.equipmentTelemetry.findUnique({
      where: { equipmentId: equipment.id },
    });

    if (!telemetry) {
      return null;
    }

    return {
      ...telemetry,
      healthStatus:
        this.healthScoringService.getHealthStatus(telemetry.healthScore),
    };
  }

  /**
   * Get telemetry history
   */
  async getTelemetryHistory(
    equipmentId: string,
    merchantId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id: equipmentId, merchantId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    const where: any = { equipmentId: equipment.id };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const logs = await this.prisma.equipmentTelemetryLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      timestamp: log.timestamp,
      data: log.data,
    }));
  }

  /**
   * Enable IoT for equipment
   */
  async enableIot(
    equipmentId: string,
    merchantId: string,
    enableIotDto: EnableIotDto,
  ) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id: equipmentId, merchantId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Check if IoT device ID is already in use
    if (enableIotDto.iotDeviceId) {
      const existing = await this.prisma.equipment.findUnique({
        where: { iotDeviceId: enableIotDto.iotDeviceId },
      });

      if (existing && existing.id !== equipmentId) {
        throw new BadRequestException('IoT device ID already in use');
      }
    }

    // Generate API key for device authentication
    const iotApiKey = this.generateApiKey();

    const updated = await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        isIotEnabled: true,
        iotDeviceId: enableIotDto.iotDeviceId,
        iotApiKey,
        manufacturer: enableIotDto.manufacturer || equipment.manufacturer,
        model: enableIotDto.model || equipment.model,
      },
    });

    return {
      success: true,
      equipment: updated,
      apiKey: iotApiKey,
      webhookUrl: `${process.env.API_BASE_URL || 'https://api.dryjets.com'}/api/v1/iot/telemetry`,
    };
  }

  /**
   * Disable IoT for equipment
   */
  async disableIot(equipmentId: string, merchantId: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id: equipmentId, merchantId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        isIotEnabled: false,
        iotApiKey: null,
      },
    });

    return { success: true, message: 'IoT disabled successfully' };
  }

  /**
   * Get equipment list with IoT status
   */
  async getMerchantEquipment(merchantId: string) {
    const equipment = await this.prisma.equipment.findMany({
      where: { merchantId },
      include: {
        telemetry: true,
        _count: {
          select: {
            maintenanceAlerts: {
              where: { status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return equipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      status: eq.status,
      isIotEnabled: eq.isIotEnabled,
      lastTelemetryAt: eq.lastTelemetryAt,
      healthScore: eq.telemetry?.healthScore,
      healthStatus: eq.telemetry?.healthScore
        ? this.healthScoringService.getHealthStatus(eq.telemetry.healthScore)
        : null,
      efficiencyScore: eq.telemetry?.efficiencyScore,
      isRunning: eq.telemetry?.isRunning || false,
      openAlerts: eq._count.maintenanceAlerts,
      lastMaintenanceDate: eq.lastMaintenanceDate,
      nextMaintenanceDate: eq.nextMaintenanceDate,
    }));
  }

  /**
   * Find equipment for telemetry submission
   */
  private async findEquipmentForTelemetry(
    identifier: string,
    apiKey?: string,
  ) {
    // Try by equipment ID first
    let equipment = await this.prisma.equipment.findUnique({
      where: { id: identifier },
    });

    // Try by IoT device ID if not found
    if (!equipment) {
      equipment = await this.prisma.equipment.findUnique({
        where: { iotDeviceId: identifier },
      });
    }

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Validate API key if provided
    if (apiKey && equipment.iotApiKey !== apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return equipment;
  }

  /**
   * Generate secure API key for IoT devices
   */
  private generateApiKey(): string {
    return `iot_${randomBytes(32).toString('hex')}`;
  }
}
