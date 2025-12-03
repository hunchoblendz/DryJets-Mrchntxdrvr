import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import {
  UpdateDriverLocationDto,
  CalculateETADto,
  AssignDriverDto,
  UpdateStatusDto,
  DeliveryTrackingDto,
  ETAResponseDto,
  AvailableDriverDto,
} from './dto';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * Get real-time tracking info for an order
   */
  @Get('track/:orderId')
  @ApiOperation({ summary: 'Get real-time tracking info for an order' })
  @ApiResponse({ status: 200, description: 'Order tracking info', type: DeliveryTrackingDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderTracking(@Param('orderId') orderId: string): Promise<DeliveryTrackingDto> {
    return this.deliveryService.getOrderTracking(orderId);
  }

  /**
   * Update driver's current location
   */
  @Post('driver/:driverId/location')
  @ApiOperation({ summary: "Update driver's current location" })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async updateDriverLocation(
    @Param('driverId') driverId: string,
    @Body() dto: UpdateDriverLocationDto,
  ): Promise<{ success: boolean }> {
    return this.deliveryService.updateDriverLocation(driverId, dto);
  }

  /**
   * Get driver's current location
   */
  @Get('driver/:driverId/location')
  @ApiOperation({ summary: "Get driver's current location" })
  @ApiResponse({ status: 200, description: 'Driver location' })
  async getDriverLocation(
    @Param('driverId') driverId: string,
  ): Promise<{ lat: number; lng: number; lastUpdate: Date } | null> {
    return this.deliveryService.getDriverLocation(driverId);
  }

  /**
   * Calculate ETA between two points
   */
  @Post('eta')
  @ApiOperation({ summary: 'Calculate ETA between two points' })
  @ApiResponse({ status: 200, description: 'ETA calculation', type: ETAResponseDto })
  async calculateETA(@Body() dto: CalculateETADto): Promise<ETAResponseDto> {
    return this.deliveryService.calculateETA(dto);
  }

  /**
   * Assign a driver to an order
   */
  @Post('order/:orderId/assign')
  @ApiOperation({ summary: 'Assign a driver to an order' })
  @ApiResponse({ status: 200, description: 'Driver assigned successfully', type: DeliveryTrackingDto })
  @ApiResponse({ status: 404, description: 'Order or driver not found' })
  @ApiResponse({ status: 400, description: 'Driver not available' })
  async assignDriver(
    @Param('orderId') orderId: string,
    @Body() dto: AssignDriverDto,
  ): Promise<DeliveryTrackingDto> {
    return this.deliveryService.assignDriver(orderId, dto);
  }

  /**
   * Update delivery status
   */
  @Put('order/:orderId/status')
  @ApiOperation({ summary: 'Update delivery status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: DeliveryTrackingDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  async updateDeliveryStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<DeliveryTrackingDto> {
    return this.deliveryService.updateDeliveryStatus(orderId, dto.status, dto.note);
  }

  /**
   * Get available drivers near a location
   */
  @Get('drivers/available')
  @ApiOperation({ summary: 'Get available drivers near a location' })
  @ApiResponse({ status: 200, description: 'List of available drivers', type: [AvailableDriverDto] })
  async getAvailableDrivers(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ): Promise<AvailableDriverDto[]> {
    return this.deliveryService.getAvailableDrivers(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : undefined,
    );
  }
}
