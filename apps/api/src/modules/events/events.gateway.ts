import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * WebSocket Gateway for real-time events
 *
 * Handles:
 * - Order lifecycle events (created, status changes)
 * - Driver location updates
 * - Real-time notifications
 *
 * Room structure:
 * - `order:{orderId}` - All parties involved in an order (customer, merchant, driver)
 * - `driver:{driverId}` - Driver-specific updates
 * - `merchant:{merchantId}` - Merchant-specific updates
 * - `customer:{customerId}` - Customer-specific updates
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle client connection with JWT authentication
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // Store user info in socket data
      client.data.userId = payload.sub;
      client.data.userType = payload.userType; // 'customer', 'merchant', 'driver'
      client.data.email = payload.email;

      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.email}, Type: ${payload.userType})`
      );

      // Auto-join user to their personal room
      const userRoom = `${payload.userType}:${payload.sub}`;
      await client.join(userRoom);

      this.logger.log(`Client ${client.id} joined room: ${userRoom}`);

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to real-time server',
        userId: payload.sub,
        userType: payload.userType,
      });
    } catch (error: any) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error?.message || 'Unknown error');
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id} (User: ${client.data.email || 'unknown'})`
    );
  }

  /**
   * Client subscribes to an order room
   */
  @SubscribeMessage('subscribeToOrder')
  async handleSubscribeToOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    const orderRoom = `order:${orderId}`;

    await client.join(orderRoom);
    this.logger.log(
      `Client ${client.id} (${client.data.email}) subscribed to order: ${orderId}`
    );

    return {
      event: 'subscribedToOrder',
      data: { orderId, room: orderRoom },
    };
  }

  /**
   * Client unsubscribes from an order room
   */
  @SubscribeMessage('unsubscribeFromOrder')
  async handleUnsubscribeFromOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    const orderRoom = `order:${orderId}`;

    await client.leave(orderRoom);
    this.logger.log(
      `Client ${client.id} (${client.data.email}) unsubscribed from order: ${orderId}`
    );

    return {
      event: 'unsubscribedFromOrder',
      data: { orderId },
    };
  }

  /**
   * Driver sends location update
   */
  @SubscribeMessage('driverLocationUpdate')
  async handleDriverLocationUpdate(
    @MessageBody() data: {
      driverId: string;
      latitude: number;
      longitude: number;
      orderId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { driverId, latitude, longitude, orderId } = data;

    // Verify client is the driver
    if (client.data.userType !== 'driver' || client.data.userId !== driverId) {
      return {
        event: 'error',
        data: { message: 'Unauthorized location update' },
      };
    }

    // Broadcast to all listeners in driver's room
    this.server.to(`driver:${driverId}`).emit('driver:locationUpdate', {
      driverId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });

    // If driver is working on an order, broadcast to order room
    if (orderId) {
      this.server.to(`order:${orderId}`).emit('driver:locationUpdate', {
        driverId,
        orderId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.debug(
      `Driver ${driverId} location updated: (${latitude}, ${longitude})`
    );

    return {
      event: 'locationUpdateReceived',
      data: { success: true },
    };
  }

  /**
   * Emit order created event to merchant
   */
  emitOrderCreated(order: any) {
    const merchantRoom = `merchant:${order.merchantId}`;

    this.server.to(merchantRoom).emit('order:created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.customerId,
        name: order.customer?.name,
      },
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });

    this.logger.log(`Order created event emitted to merchant ${order.merchantId}`);

    // Send multi-channel notifications
    this.notificationsService.notifyOrderCreated(order).catch((error) => {
      this.logger.error('Failed to send order created notifications:', error);
    });
  }

  /**
   * Emit order status changed event
   */
  emitOrderStatusChanged(order: any, previousStatus: string) {
    const orderRoom = `order:${order.id}`;

    const eventData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      previousStatus,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all parties in order room
    this.server.to(orderRoom).emit('order:statusChanged', eventData);

    // Also send to individual user rooms
    if (order.customerId) {
      this.server.to(`customer:${order.customerId}`).emit('order:statusChanged', eventData);
    }
    if (order.merchantId) {
      this.server.to(`merchant:${order.merchantId}`).emit('order:statusChanged', eventData);
    }
    if (order.pickupDriverId) {
      this.server.to(`driver:${order.pickupDriverId}`).emit('order:statusChanged', eventData);
    }

    this.logger.log(
      `Order ${order.id} status changed: ${previousStatus} -> ${order.status}`
    );

    // Send multi-channel notifications for status changes
    this.notificationsService.notifyOrderStatusChanged(order, order.status).catch((error) => {
      this.logger.error('Failed to send order status change notifications:', error);
    });
  }

  /**
   * Emit driver assigned event
   */
  emitDriverAssigned(order: any, driver: any) {
    const orderRoom = `order:${order.id}`;
    const customerRoom = `customer:${order.customerId}`;
    const driverRoom = `driver:${driver.id}`;

    const eventData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        rating: driver.rating,
        vehicleType: driver.vehicleType,
      },
      timestamp: new Date().toISOString(),
    };

    // Notify customer
    this.server.to(customerRoom).emit('driver:assigned', eventData);

    // Notify order room
    this.server.to(orderRoom).emit('driver:assigned', eventData);

    // Notify driver
    this.server.to(driverRoom).emit('order:assigned', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      pickupLocation: order.merchantLocation,
      deliveryLocation: order.deliveryAddress,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Driver ${driver.id} assigned to order ${order.id}`
    );

    // Send multi-channel notifications for driver assignment
    this.notificationsService.notifyDriverAssigned(order, driver).catch((error) => {
      this.logger.error('Failed to send driver assigned notifications:', error);
    });
  }

  /**
   * Emit new order available for drivers (in radius)
   */
  emitNewOrderAvailableForDrivers(order: any, eligibleDriverIds: string[]) {
    eligibleDriverIds.forEach((driverId) => {
      const driverRoom = `driver:${driverId}`;
      this.server.to(driverRoom).emit('order:available', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        pickupLocation: order.merchantLocation,
        deliveryLocation: order.deliveryAddress,
        estimatedEarnings: order.driverEarnings,
        distance: order.distance,
        timestamp: new Date().toISOString(),
      });
    });

    this.logger.log(
      `New order ${order.id} broadcast to ${eligibleDriverIds.length} eligible drivers`
    );
  }

  /**
   * Emit general notification to user
   */
  emitNotification(userId: string, userType: string, notification: any) {
    const userRoom = `${userType}:${userId}`;

    this.server.to(userRoom).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Notification sent to ${userType} ${userId}: ${notification.type}`
    );
  }
}
