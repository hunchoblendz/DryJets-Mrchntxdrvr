import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { IotService } from './iot.service';
import { MaintenanceAlertsService } from './services/maintenance-alerts.service';
import { ResourceOptimizationService } from './services/resource-optimization.service';
import {
  SubmitTelemetryDto,
  GetTelemetryHistoryDto,
  EnableIotDto,
  TelemetryResponse,
} from './dto/telemetry.dto';
import {
  GetAlertsQueryDto,
  AcknowledgeAlertDto,
  ResolveAlertDto,
  MaintenanceAlertResponse,
} from './dto/maintenance-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('IoT & Equipment Telemetry')
@Controller('iot')
export class IotController {
  constructor(
    private readonly iotService: IotService,
    private readonly maintenanceAlertsService: MaintenanceAlertsService,
    private readonly resourceOptimizationService: ResourceOptimizationService,
  ) {}

  // ============================================
  // TELEMETRY ENDPOINTS
  // ============================================

  @Post('telemetry')
  @ApiOperation({
    summary: 'Submit telemetry data from IoT device',
    description:
      'Endpoint for IoT devices to send sensor data. Can be authenticated with API key or equipment ID.',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'IoT device API key',
    required: false,
  })
  @ApiResponse({ status: 201, description: 'Telemetry received successfully' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async submitTelemetry(
    @Body() submitTelemetryDto: SubmitTelemetryDto,
    @Headers('x-api-key') apiKey?: string,
  ) {
    return this.iotService.submitTelemetry(submitTelemetryDto, apiKey);
  }

  @Get('equipment/:equipmentId/telemetry')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current telemetry for equipment',
    description: 'Returns the latest sensor readings and health metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Current telemetry data',
    type: TelemetryResponse,
  })
  async getCurrentTelemetry(
    @Param('equipmentId') equipmentId: string,
    @Request() req: any,
  ) {
    // Extract merchantId from JWT token (assuming user.merchant.id is available)
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.iotService.getCurrentTelemetry(equipmentId, merchantId);
  }

  @Get('equipment/:equipmentId/telemetry/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get telemetry history',
    description: 'Returns historical sensor data for analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Telemetry history',
  })
  async getTelemetryHistory(
    @Param('equipmentId') equipmentId: string,
    @Query() query: GetTelemetryHistoryDto,
    @Request() req: any,
  ) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.iotService.getTelemetryHistory(
      equipmentId,
      merchantId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
    );
  }

  // ============================================
  // EQUIPMENT IOT MANAGEMENT
  // ============================================

  @Post('equipment/:equipmentId/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enable IoT for equipment',
    description: 'Generates API key and enables IoT data collection',
  })
  @ApiResponse({
    status: 200,
    description: 'IoT enabled successfully',
  })
  async enableIot(
    @Param('equipmentId') equipmentId: string,
    @Body() enableIotDto: EnableIotDto,
    @Request() req: any,
  ) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.iotService.enableIot(equipmentId, merchantId, enableIotDto);
  }

  @Post('equipment/:equipmentId/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Disable IoT for equipment',
    description: 'Disables IoT data collection and invalidates API key',
  })
  @ApiResponse({
    status: 200,
    description: 'IoT disabled successfully',
  })
  async disableIot(@Param('equipmentId') equipmentId: string, @Request() req: any) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.iotService.disableIot(equipmentId, merchantId);
  }

  @Get('equipment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get merchant equipment list',
    description: 'Returns all equipment with IoT status and health metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipment list',
  })
  async getMerchantEquipment(@Request() req: any) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.iotService.getMerchantEquipment(merchantId);
  }

  // ============================================
  // MAINTENANCE ALERTS
  // ============================================

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get maintenance alerts',
    description: 'Returns maintenance alerts for merchant equipment',
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance alerts',
    type: [MaintenanceAlertResponse],
  })
  async getAlerts(@Query() query: GetAlertsQueryDto, @Request() req: any) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.maintenanceAlertsService.getMerchantAlerts(merchantId, query);
  }

  @Patch('alerts/:alertId/acknowledge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Acknowledge alert',
    description: 'Mark alert as acknowledged',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert acknowledged',
  })
  async acknowledgeAlert(
    @Param('alertId') alertId: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
  ) {
    return this.maintenanceAlertsService.acknowledgeAlert(
      alertId,
      acknowledgeDto.notes,
    );
  }

  @Patch('alerts/:alertId/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resolve alert',
    description: 'Mark alert as resolved with resolution notes',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert resolved',
  })
  async resolveAlert(
    @Param('alertId') alertId: string,
    @Body() resolveDto: ResolveAlertDto,
  ) {
    return this.maintenanceAlertsService.resolveAlert(
      alertId,
      resolveDto.resolution,
    );
  }

  // ============================================
  // RESOURCE OPTIMIZATION
  // ============================================

  @Get('optimization/recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get optimization recommendations',
    description:
      'Returns AI-powered recommendations to reduce energy and water costs',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimization recommendations',
  })
  async getOptimizationRecommendations(
    @Query('equipmentId') equipmentId: string | undefined,
    @Request() req: any,
  ) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    const recommendations =
      await this.resourceOptimizationService.generateOptimizationRecommendations(
        merchantId,
        equipmentId,
      );

    const savings =
      this.resourceOptimizationService.calculatePotentialSavings(
        recommendations,
      );

    return {
      recommendations,
      potentialSavings: savings,
    };
  }

  @Get('optimization/usage-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get resource usage summary',
    description: 'Returns energy and water usage metrics for dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource usage summary',
  })
  async getResourceUsageSummary(
    @Query('days') days: string = '30',
    @Request() req: any,
  ) {
    const merchantId = req.user.merchantId || req.user.merchant?.id;
    return this.resourceOptimizationService.getResourceUsageSummary(
      merchantId,
      parseInt(days, 10),
    );
  }
}
