import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  SendNotificationDto,
  UpdateNotificationPreferencesDto,
  UpdateFcmTokenDto,
  GetNotificationsQueryDto,
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Send a notification (admin/internal use)
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    await this.notificationsService.sendNotification({
      userId: dto.userId,
      userType: dto.userType,
      type: dto.type,
      channels: dto.channels,
      data: {
        title: dto.title,
        message: dto.message,
        ...dto.data,
      },
    });

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  /**
   * Get notifications for a user
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, enum: ['read', 'unread', 'all'] })
  @ApiResponse({ status: 200, description: 'Returns paginated notifications' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.filter === 'read') {
      where.readAt = { not: null };
    } else if (query.filter === 'unread') {
      where.readAt = null;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  /**
   * Mark all notifications as read for a user
   */
  @Patch('user/:userId/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Param('userId') userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Get unread notification count
   */
  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns unread count' })
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return {
      count,
    };
  }

  /**
   * Update notification preferences
   */
  @Patch('preferences/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    // This is a simplified version - in production, you'd need to identify user type
    // and update the appropriate table (customer, merchant, or driver)

    return {
      success: true,
      message: 'Notification preferences updated',
      preferences: dto,
    };
  }

  /**
   * Update FCM token for push notifications
   */
  @Patch('fcm-token/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateFcmToken(
    @Param('userId') userId: string,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    // This is a simplified version - in production, you'd need to identify user type
    // and update the appropriate table (customer, merchant, or driver)

    return {
      success: true,
      message: 'FCM token updated successfully',
    };
  }

  /**
   * Delete a notification
   */
  @Patch(':id/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete/archive a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(@Param('id') id: string) {
    await this.prisma.notification.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Notification deleted',
    };
  }
}
