import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import {
  CreateDriverDto,
  UpdateDriverDto,
  UpdateDriverLocationDto,
  DriverQueryDto,
  FindNearbyDriversDto,
} from './dto/driver.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // ============================================
  // DRIVER CRUD ENDPOINTS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Driver created successfully' })
  @ApiResponse({ status: 409, description: 'Driver already exists for this user' })
  async createDriver(@Body() createDriverDto: CreateDriverDto) {
    // In a real app, userId would come from JWT token
    const userId = 'placeholder-user-id';
    return this.driversService.createDriver(userId, createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated drivers list' })
  async findDrivers(@Query() query: DriverQueryDto) {
    return this.driversService.findDrivers(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby available drivers' })
  @ApiResponse({ status: 200, description: 'Returns nearby drivers sorted by distance' })
  async findNearbyDrivers(@Query() query: FindNearbyDriversDto) {
    return this.driversService.findNearbyDrivers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Returns driver details' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async findDriverById(@Param('id') id: string) {
    return this.driversService.findDriverById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async updateDriver(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.updateDriver(id, updateDriverDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete driver with active orders' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async deleteDriver(@Param('id') id: string) {
    return this.driversService.deleteDriver(id);
  }

  // ============================================
  // LOCATION ENDPOINTS
  // ============================================

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update driver location and status' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async updateDriverLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateDriverLocationDto,
  ) {
    return this.driversService.updateDriverLocation(id, updateLocationDto);
  }

  // ============================================
  // STATISTICS ENDPOINTS
  // ============================================

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Returns driver statistics' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async getDriverStats(@Param('id') id: string) {
    return this.driversService.getDriverStats(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get active orders for driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Returns active orders' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async getActiveOrders(@Param('id') id: string) {
    return this.driversService.getActiveOrders(id);
  }

  // ============================================
  // AVAILABILITY ENDPOINTS
  // ============================================

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Toggle driver availability' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver availability updated' })
  @ApiResponse({ status: 400, description: 'Cannot go offline with active orders' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.driversService.updateAvailability(id, body.isAvailable);
  }

  // ============================================
  // ORDER WORKFLOW ENDPOINTS
  // ============================================

  @Post(':id/orders/:orderId/accept')
  @ApiOperation({ summary: 'Accept an order' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order accepted successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be accepted' })
  @ApiResponse({ status: 404, description: 'Driver or order not found' })
  async acceptOrder(
    @Param('id') driverId: string,
    @Param('orderId') orderId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.driversService.acceptOrder(driverId, orderId, body?.notes);
  }

  @Post(':id/orders/:orderId/pickup')
  @ApiOperation({ summary: 'Mark order as picked up' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order marked as picked up' })
  @ApiResponse({ status: 400, description: 'Order cannot be picked up' })
  @ApiResponse({ status: 404, description: 'Driver or order not found' })
  async markPickedUp(
    @Param('id') driverId: string,
    @Param('orderId') orderId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.driversService.markPickedUp(driverId, orderId, body?.notes);
  }

  @Post(':id/orders/:orderId/deliver')
  @ApiOperation({ summary: 'Mark order as delivered' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order marked as delivered' })
  @ApiResponse({ status: 400, description: 'Order cannot be delivered' })
  @ApiResponse({ status: 404, description: 'Driver or order not found' })
  async markDelivered(
    @Param('id') driverId: string,
    @Param('orderId') orderId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.driversService.markDelivered(driverId, orderId, body?.notes);
  }

  // ============================================
  // EARNINGS ENDPOINTS
  // ============================================

  @Get(':id/earnings')
  @ApiOperation({ summary: 'Get driver earnings' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Returns driver earnings' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async getDriverEarnings(
    @Param('id') id: string,
    @Query() query?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const params = {
      ...query,
      startDate: query?.startDate ? new Date(query.startDate) : undefined,
      endDate: query?.endDate ? new Date(query.endDate) : undefined,
    };
    return this.driversService.getDriverEarnings(id, params);
  }

  // ============================================
  // DRIVER ASSIGNMENT ENDPOINTS
  // ============================================

  @Get(':id/available-orders')
  @ApiOperation({ summary: 'Get available orders for driver to accept' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Returns available orders sorted by distance' })
  @ApiResponse({ status: 400, description: 'Driver location not available' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async getAvailableOrders(
    @Param('id') driverId: string,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.driversService.findAvailableOrdersForDriver(
      driverId,
      radiusKm || 10,
    );
  }
}
