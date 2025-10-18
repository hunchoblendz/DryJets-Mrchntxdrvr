import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../common/prisma/prisma.service';

export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_READY_FOR_PICKUP = 'ORDER_READY_FOR_PICKUP',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  ORDER_PICKED_UP = 'ORDER_PICKED_UP',
  ORDER_IN_TRANSIT = 'ORDER_IN_TRANSIT',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYOUT_PROCESSED = 'PAYOUT_PROCESSED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

interface NotificationPayload {
  userId: string;
  userType: 'customer' | 'merchant' | 'driver';
  type: NotificationType;
  channels: NotificationChannel[];
  data: {
    title: string;
    message: string;
    orderId?: string;
    orderNumber?: string;
    actionUrl?: string;
    [key: string]: any;
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private twilioClient: twilio.Twilio | null = null;
  private sendgridInitialized = false;
  private firebaseInitialized = false;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeServices();
  }

  /**
   * Initialize third-party notification services
   */
  private initializeServices(): void {
    // Initialize SendGrid
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendgridKey) {
      sgMail.setApiKey(sendgridKey);
      this.sendgridInitialized = true;
      this.logger.log('SendGrid initialized successfully');
    } else {
      this.logger.warn('SendGrid API key not found - email notifications disabled');
    }

    // Initialize Twilio
    const twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (twilioAccountSid && twilioAuthToken) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
      this.logger.log('Twilio initialized successfully');
    } else {
      this.logger.warn('Twilio credentials not found - SMS notifications disabled');
    }

    // Initialize Firebase Admin
    const firebaseCredentials = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (firebaseCredentials) {
      try {
        const serviceAccount = JSON.parse(firebaseCredentials);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase:', error);
      }
    } else {
      this.logger.warn('Firebase credentials not found - push notifications disabled');
    }
  }

  /**
   * Send notification through multiple channels
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          phone: true,
          customer: {
            select: {
              fcmToken: true,
              notificationPreferences: true,
            },
          },
          merchant: {
            select: {
              fcmToken: true,
              notificationPreferences: true,
            },
          },
          driver: {
            select: {
              fcmToken: true,
              notificationPreferences: true,
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User not found: ${payload.userId}`);
        return;
      }

      // Get notification preferences
      const preferences = this.getUserPreferences(user, payload.userType);

      // Store notification in database
      const notification = await this.prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.data.title,
          message: payload.data.message,
          data: payload.data as any,
          channels: payload.channels,
          status: 'PENDING',
        },
      });

      // Send through each channel
      const promises: Promise<any>[] = [];

      if (payload.channels.includes(NotificationChannel.EMAIL) &&
          preferences?.email !== false &&
          user.email) {
        promises.push(
          this.sendEmail(
            user.email,
            payload.data.title,
            payload.data.message,
            payload.type,
            payload.data,
          ).catch((error) => {
            this.logger.error(`Email failed for ${user.email}:`, error);
          }),
        );
      }

      if (payload.channels.includes(NotificationChannel.SMS) &&
          preferences?.sms !== false &&
          user.phone) {
        promises.push(
          this.sendSMS(user.phone, payload.data.message).catch((error) => {
            this.logger.error(`SMS failed for ${user.phone}:`, error);
          }),
        );
      }

      if (payload.channels.includes(NotificationChannel.PUSH) &&
          preferences?.push !== false) {
        const fcmToken = this.getFcmToken(user, payload.userType);
        if (fcmToken) {
          promises.push(
            this.sendPushNotification(
              fcmToken,
              payload.data.title,
              payload.data.message,
              payload.data,
            ).catch((error) => {
              this.logger.error(`Push notification failed:`, error);
            }),
          );
        }
      }

      // Wait for all notifications to complete
      await Promise.all(promises);

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      this.logger.log(
        `Notification sent successfully: ${payload.type} to user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification using SendGrid
   */
  private async sendEmail(
    to: string,
    subject: string,
    textContent: string,
    type: NotificationType,
    data: any,
  ): Promise<void> {
    if (!this.sendgridInitialized) {
      this.logger.warn('SendGrid not initialized - skipping email');
      return;
    }

    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@dryjets.com';
    const htmlContent = this.generateEmailHtml(type, data);

    const msg = {
      to,
      from: fromEmail,
      subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(`SendGrid error:`, error.response?.body || error);
      throw error;
    }
  }

  /**
   * Send SMS notification using Twilio
   */
  private async sendSMS(to: string, message: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not initialized - skipping SMS');
      return;
    }

    const fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    if (!fromPhone) {
      this.logger.warn('Twilio phone number not configured');
      return;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: fromPhone,
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error('Twilio error:', error);
      throw error;
    }
  }

  /**
   * Send push notification using Firebase Cloud Messaging
   */
  private async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: any,
  ): Promise<void> {
    if (!this.firebaseInitialized) {
      this.logger.warn('Firebase not initialized - skipping push notification');
      return;
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        // Convert all values to strings for FCM
        ...(data.orderId && { orderId: String(data.orderId) }),
        ...(data.orderNumber && { orderNumber: String(data.orderNumber) }),
      },
      token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'dryjets_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      await admin.messaging().send(message);
      this.logger.log(`Push notification sent to token: ${token.substring(0, 20)}...`);
    } catch (error) {
      this.logger.error('FCM error:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailHtml(type: NotificationType, data: any): string {
    const baseStyle = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .order-details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    `;

    const header = `
      <div class="header">
        <h1>🚗 DryJets</h1>
        <p>Premium Dry Cleaning & Laundry Service</p>
      </div>
    `;

    const footer = `
      <div class="footer">
        <p>DryJets - Your trusted laundry service</p>
        <p>Questions? Contact us at support@dryjets.com</p>
        <p>&copy; ${new Date().getFullYear()} DryJets. All rights reserved.</p>
      </div>
    `;

    let content = '';

    switch (type) {
      case NotificationType.ORDER_CREATED:
        content = `
          <h2>Order Confirmed! 🎉</h2>
          <p>Thank you for your order. We've received your request and will process it shortly.</p>
          <div class="order-details">
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Total:</strong> $${data.totalAmount?.toFixed(2)}<br>
            <strong>Status:</strong> ${data.status}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">View Order</a>` : ''}
        `;
        break;

      case NotificationType.DRIVER_ASSIGNED:
        content = `
          <h2>Driver Assigned! 🚗</h2>
          <p>Your order has been assigned to a driver and will be picked up soon.</p>
          <div class="order-details">
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Driver:</strong> ${data.driverName}<br>
            <strong>Rating:</strong> ⭐ ${data.driverRating}/5
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Track Order</a>` : ''}
        `;
        break;

      case NotificationType.ORDER_PICKED_UP:
        content = `
          <h2>Order Picked Up! 📦</h2>
          <p>Your items have been picked up and are on their way to our facility.</p>
          <div class="order-details">
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Picked up at:</strong> ${new Date().toLocaleString()}
          </div>
        `;
        break;

      case NotificationType.ORDER_DELIVERED:
        content = `
          <h2>Order Delivered! ✅</h2>
          <p>Your order has been successfully delivered. Thank you for using DryJets!</p>
          <div class="order-details">
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Delivered at:</strong> ${new Date().toLocaleString()}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Rate Your Experience</a>` : ''}
        `;
        break;

      case NotificationType.PAYMENT_RECEIVED:
        content = `
          <h2>Payment Received! 💳</h2>
          <p>We've received your payment. Thank you!</p>
          <div class="order-details">
            <strong>Order Number:</strong> ${data.orderNumber}<br>
            <strong>Amount:</strong> $${data.amount?.toFixed(2)}<br>
            <strong>Payment Method:</strong> ${data.paymentMethod}
          </div>
        `;
        break;

      default:
        content = `
          <h2>${data.title}</h2>
          <p>${data.message}</p>
        `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyle}
      </head>
      <body>
        <div class="container">
          ${header}
          <div class="content">
            ${content}
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get user notification preferences
   */
  private getUserPreferences(user: any, userType: string): any {
    switch (userType) {
      case 'customer':
        return user.customer?.notificationPreferences;
      case 'merchant':
        return user.merchant?.notificationPreferences;
      case 'driver':
        return user.driver?.notificationPreferences;
      default:
        return null;
    }
  }

  /**
   * Get FCM token for user
   */
  private getFcmToken(user: any, userType: string): string | null {
    switch (userType) {
      case 'customer':
        return user.customer?.fcmToken;
      case 'merchant':
        return user.merchant?.fcmToken;
      case 'driver':
        return user.driver?.fcmToken;
      default:
        return null;
    }
  }

  /**
   * Helper method: Notify on order created
   */
  async notifyOrderCreated(order: any): Promise<void> {
    // Notify customer
    await this.sendNotification({
      userId: order.customer.userId,
      userType: 'customer',
      type: NotificationType.ORDER_CREATED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
      data: {
        title: 'Order Confirmed',
        message: `Your order #${order.orderNumber} has been confirmed!`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });

    // Notify merchant
    await this.sendNotification({
      userId: order.merchant.userId,
      userType: 'merchant',
      type: NotificationType.ORDER_CREATED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS],
      data: {
        title: 'New Order Received',
        message: `New order #${order.orderNumber} from ${order.customer.firstName} ${order.customer.lastName}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  }

  /**
   * Helper method: Notify on driver assigned
   */
  async notifyDriverAssigned(order: any, driver: any): Promise<void> {
    // Notify customer
    await this.sendNotification({
      userId: order.customer.userId,
      userType: 'customer',
      type: NotificationType.DRIVER_ASSIGNED,
      channels: [NotificationChannel.PUSH, NotificationChannel.SMS],
      data: {
        title: 'Driver Assigned',
        message: `${driver.firstName} will pick up your order soon!`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        driverName: `${driver.firstName} ${driver.lastName}`,
        driverRating: driver.rating,
      },
    });

    // Notify driver
    await this.sendNotification({
      userId: driver.userId,
      userType: 'driver',
      type: NotificationType.DRIVER_ASSIGNED,
      channels: [NotificationChannel.PUSH, NotificationChannel.SMS],
      data: {
        title: 'New Pickup Assigned',
        message: `You've been assigned to order #${order.orderNumber}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });
  }

  /**
   * Helper method: Notify on order status change
   */
  async notifyOrderStatusChanged(order: any, newStatus: string): Promise<void> {
    let title = '';
    let message = '';
    let channels: NotificationChannel[] = [NotificationChannel.PUSH];

    switch (newStatus) {
      case 'READY_FOR_PICKUP':
        title = 'Order Ready for Pickup';
        message = `Order #${order.orderNumber} is ready for pickup!`;
        channels = [NotificationChannel.PUSH, NotificationChannel.SMS];
        break;
      case 'PICKED_UP':
        title = 'Order Picked Up';
        message = `Your order #${order.orderNumber} has been picked up`;
        break;
      case 'IN_TRANSIT':
        title = 'Order In Transit';
        message = `Your order #${order.orderNumber} is on the way!`;
        break;
      case 'DELIVERED':
        title = 'Order Delivered';
        message = `Order #${order.orderNumber} has been delivered!`;
        channels = [NotificationChannel.EMAIL, NotificationChannel.PUSH];
        break;
      default:
        title = 'Order Status Updated';
        message = `Order #${order.orderNumber} status: ${newStatus}`;
    }

    await this.sendNotification({
      userId: order.customer.userId,
      userType: 'customer',
      type: newStatus as NotificationType,
      channels,
      data: {
        title,
        message,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: newStatus,
      },
    });
  }
}
