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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import {
  CreateMerchantDto,
  UpdateMerchantDto,
  MerchantQueryDto,
  CreateMerchantLocationDto,
  UpdateMerchantLocationDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto/merchant.dto';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  // ============================================
  // MERCHANT ENDPOINTS
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201, description: 'Merchant created successfully' })
  @ApiResponse({ status: 409, description: 'Merchant already exists for this user' })
  async createMerchant(@Body() createMerchantDto: CreateMerchantDto) {
    // In a real app, userId would come from JWT token
    // For now, we'll use a placeholder
    const userId = 'placeholder-user-id';
    return this.merchantsService.createMerchant(userId, createMerchantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchants with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated merchants list' })
  async findMerchants(@Query() query: MerchantQueryDto) {
    return this.merchantsService.findMerchants(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by ID' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Returns merchant details' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async findMerchantById(@Param('id') id: string) {
    return this.merchantsService.findMerchantById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant updated successfully' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async updateMerchant(@Param('id') id: string, @Body() updateMerchantDto: UpdateMerchantDto) {
    return this.merchantsService.updateMerchant(id, updateMerchantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete merchant with active orders' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async deleteMerchant(@Param('id') id: string) {
    return this.merchantsService.deleteMerchant(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get merchant statistics' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Returns merchant statistics' })
  async getMerchantStats(@Param('id') id: string) {
    return this.merchantsService.getMerchantStats(id);
  }

  // ============================================
  // MERCHANT LOCATION ENDPOINTS
  // ============================================

  @Post(':id/locations')
  @ApiOperation({ summary: 'Add a new location for merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  async createMerchantLocation(
    @Param('id') merchantId: string,
    @Body() createLocationDto: CreateMerchantLocationDto,
  ) {
    return this.merchantsService.createMerchantLocation(merchantId, createLocationDto);
  }

  @Get(':id/locations')
  @ApiOperation({ summary: 'Get all locations for merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Returns merchant locations' })
  async findMerchantLocations(@Param('id') merchantId: string) {
    return this.merchantsService.findMerchantLocations(merchantId);
  }

  @Get(':id/locations/:locationId')
  @ApiOperation({ summary: 'Get specific location details' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Returns location details' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findMerchantLocationById(
    @Param('id') merchantId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.merchantsService.findMerchantLocationById(merchantId, locationId);
  }

  @Put(':id/locations/:locationId')
  @ApiOperation({ summary: 'Update merchant location' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async updateMerchantLocation(
    @Param('id') merchantId: string,
    @Param('locationId') locationId: string,
    @Body() updateLocationDto: UpdateMerchantLocationDto,
  ) {
    return this.merchantsService.updateMerchantLocation(merchantId, locationId, updateLocationDto);
  }

  @Delete(':id/locations/:locationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete merchant location' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete location' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async deleteMerchantLocation(
    @Param('id') merchantId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.merchantsService.deleteMerchantLocation(merchantId, locationId);
  }

  // ============================================
  // SERVICE ENDPOINTS
  // ============================================

  @Post(':id/services')
  @ApiOperation({ summary: 'Add a new service for merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  async createService(
    @Param('id') merchantId: string,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.merchantsService.createService(merchantId, createServiceDto);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get all services for merchant' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns merchant services' })
  async findMerchantServices(
    @Param('id') merchantId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.merchantsService.findMerchantServices(merchantId, includeInactive);
  }

  @Get(':id/services/:serviceId')
  @ApiOperation({ summary: 'Get specific service details' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Returns service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findServiceById(
    @Param('id') merchantId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.merchantsService.findServiceById(merchantId, serviceId);
  }

  @Put(':id/services/:serviceId')
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async updateService(
    @Param('id') merchantId: string,
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.merchantsService.updateService(merchantId, serviceId, updateServiceDto);
  }

  @Delete(':id/services/:serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete service used in active orders' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async deleteService(
    @Param('id') merchantId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.merchantsService.deleteService(merchantId, serviceId);
  }
}
