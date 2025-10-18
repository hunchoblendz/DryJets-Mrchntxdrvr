import { Module } from '@nestjs/common';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { HealthScoringService } from './services/health-scoring.service';
import { MaintenanceAlertsService } from './services/maintenance-alerts.service';
import { ResourceOptimizationService } from './services/resource-optimization.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [IotController],
  providers: [
    IotService,
    HealthScoringService,
    MaintenanceAlertsService,
    ResourceOptimizationService,
    PrismaService,
  ],
  exports: [
    IotService,
    HealthScoringService,
    MaintenanceAlertsService,
    ResourceOptimizationService,
  ],
})
export class IotModule {}
