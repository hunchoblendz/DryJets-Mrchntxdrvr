import * as Notifications from 'expo-notifications';
import { PushNotification, NotificationType, notificationMessages } from './notificationTypes';

// ============================================
// NOTIFICATIONS MANAGER
// ============================================

export class NotificationsManager {
  private static instance: NotificationsManager;

  private constructor() {
    this.setupNotifications();
  }

  static getInstance(): NotificationsManager {
    if (!NotificationsManager.instance) {
      NotificationsManager.instance = new NotificationsManager();
    }
    return NotificationsManager.instance;
  }

  private setupNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register device token for push notifications
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID,
        })
      ).data;
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  /**
   * Handle incoming notification
   */
  handleNotification(notification: PushNotification): void {
    const message = notificationMessages[notification.type];

    if (!message) {
      console.warn(`Unknown notification type: ${notification.type}`);
      return;
    }

    const title = message.title;
    const body = message.body(notification.data);

    this.showLocalNotification(title, body, {
      data: notification.data,
      orderId: notification.orderId,
    });
  }

  /**
   * Show local notification
   */
  async showLocalNotification(
    title: string,
    body: string,
    options?: {
      data?: Record<string, any>;
      orderId?: string;
      sound?: boolean;
      badge?: number;
    }
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: options?.data || {},
          badge: options?.badge || 1,
          sound: options?.sound !== false ? 'default' : null,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Get notification listener
   */
  onNotification(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationResponseReceivedListener(
      ({ notification }) => {
        callback(notification);
      }
    );
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Cancel notification by ID
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }
}

// Lazy initialization - defer singleton creation until first use
// This prevents early initialization issues with Hermes engine
let _notificationsManager: NotificationsManager | null = null;

export const getNotificationsManager = (): NotificationsManager => {
  if (!_notificationsManager) {
    _notificationsManager = NotificationsManager.getInstance();
  }
  return _notificationsManager;
};

// Maintain backward compatibility with existing code
export const notificationsManager = {
  get initNotifications() {
    return getNotificationsManager().initNotifications;
  },
  get requestPermissions() {
    return getNotificationsManager().requestPermissions;
  },
  get handleNotification() {
    return getNotificationsManager().handleNotification;
  },
  get scheduleNotification() {
    return getNotificationsManager().scheduleNotification;
  },
  get updateNotificationPreferences() {
    return getNotificationsManager().updateNotificationPreferences;
  },
  get getNotificationPreferences() {
    return getNotificationsManager().getNotificationPreferences;
  },
  get sendLocalNotification() {
    return getNotificationsManager().sendLocalNotification;
  },
  get cancelNotification() {
    return getNotificationsManager().cancelNotification;
  },
} as NotificationsManager;
