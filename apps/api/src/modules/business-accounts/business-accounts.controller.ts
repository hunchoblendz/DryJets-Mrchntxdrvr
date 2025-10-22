import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessAccountsService } from './business-accounts.service';
import {
  CreateBusinessAccountDto,
  UpdateBusinessAccountDto,
  InviteTeamMemberDto,
  CreateRecurringOrderDto,
} from './dto';

@ApiTags('business-accounts')
@Controller('business-accounts')
// @UseGuards(JwtAuthGuard) // TODO: Add auth guard
// @ApiBearerAuth()
export class BusinessAccountsController {
  constructor(private readonly businessAccountsService: BusinessAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new business account' })
  @ApiResponse({ status: 201, description: 'Business account created successfully' })
  @ApiResponse({ status: 409, description: 'User already has a business account' })
  create(@Body() createDto: CreateBusinessAccountDto) {
    return this.businessAccountsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all business accounts (admin only)' })
  @ApiResponse({ status: 200, description: 'List of business accounts' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.businessAccountsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get business account by user ID' })
  @ApiResponse({ status: 200, description: 'Business account found' })
  @ApiResponse({ status: 404, description: 'Business account not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.businessAccountsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business account by ID' })
  @ApiResponse({ status: 200, description: 'Business account found' })
  @ApiResponse({ status: 404, description: 'Business account not found' })
  findOne(@Param('id') id: string) {
    return this.businessAccountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update business account' })
  @ApiResponse({ status: 200, description: 'Business account updated successfully' })
  @ApiResponse({ status: 404, description: 'Business account not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBusinessAccountDto,
  ) {
    return this.businessAccountsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete business account' })
  @ApiResponse({ status: 204, description: 'Business account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Business account not found' })
  remove(@Param('id') id: string) {
    return this.businessAccountsService.remove(id);
  }

  // ===== Team Management =====

  @Post(':id/team/invite')
  @ApiOperation({ summary: 'Invite a team member' })
  @ApiResponse({ status: 201, description: 'Team member invited successfully' })
  @ApiResponse({ status: 409, description: 'Team member already exists' })
  inviteTeamMember(
    @Param('id') businessId: string,
    @Body() inviteDto: InviteTeamMemberDto,
  ) {
    return this.businessAccountsService.inviteTeamMember(businessId, inviteDto);
  }

  @Get(':id/team')
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'List of team members' })
  getTeamMembers(
    @Param('id') businessId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.businessAccountsService.getTeamMembers(
      businessId,
      activeOnly !== 'false',
    );
  }

  @Patch(':id/team/:memberId')
  @ApiOperation({ summary: 'Update team member' })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  updateTeamMember(
    @Param('id') businessId: string,
    @Param('memberId') memberId: string,
    @Body() updateData: Partial<InviteTeamMemberDto>,
  ) {
    return this.businessAccountsService.updateTeamMember(businessId, memberId, updateData);
  }

  @Delete(':id/team/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove team member' })
  @ApiResponse({ status: 204, description: 'Team member removed successfully' })
  removeTeamMember(
    @Param('id') businessId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.businessAccountsService.removeTeamMember(businessId, memberId);
  }

  // ===== Recurring Orders =====

  @Post(':id/recurring-orders')
  @ApiOperation({ summary: 'Create recurring order schedule' })
  @ApiResponse({ status: 201, description: 'Recurring order created successfully' })
  createRecurringOrder(@Body() createDto: CreateRecurringOrderDto) {
    return this.businessAccountsService.createRecurringOrder(createDto);
  }

  @Get(':id/recurring-orders')
  @ApiOperation({ summary: 'Get recurring orders' })
  @ApiResponse({ status: 200, description: 'List of recurring orders' })
  getRecurringOrders(
    @Param('id') businessId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.businessAccountsService.getRecurringOrders(
      businessId,
      activeOnly !== 'false',
    );
  }

  @Patch('recurring-orders/:id')
  @ApiOperation({ summary: 'Update recurring order' })
  @ApiResponse({ status: 200, description: 'Recurring order updated successfully' })
  updateRecurringOrder(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateRecurringOrderDto>,
  ) {
    return this.businessAccountsService.updateRecurringOrder(id, updateData);
  }

  @Delete('recurring-orders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel recurring order' })
  @ApiResponse({ status: 204, description: 'Recurring order canceled successfully' })
  cancelRecurringOrder(@Param('id') id: string) {
    return this.businessAccountsService.cancelRecurringOrder(id);
  }

  // ===== Utility Endpoints =====

  @Get(':id/can-place-order/:userId')
  @ApiOperation({ summary: 'Check if user can place orders for this business' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  async canPlaceOrder(
    @Param('id') businessId: string,
    @Param('userId') userId: string,
  ) {
    const canPlace = await this.businessAccountsService.canPlaceOrder(businessId, userId);
    return { canPlaceOrder: canPlace };
  }

  @Get(':id/check-spend-limit/:amount')
  @ApiOperation({ summary: 'Check if order amount is within monthly spend limit' })
  @ApiResponse({ status: 200, description: 'Spend limit check result' })
  async checkSpendLimit(
    @Param('id') businessId: string,
    @Param('amount') amount: string,
  ) {
    const withinLimit = await this.businessAccountsService.checkSpendLimit(
      businessId,
      parseFloat(amount),
    );
    return { withinLimit };
  }
}
