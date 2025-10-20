import React, { createContext, useEffect, useRef, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import {
  initializeSocket,
  disconnectSocket,
  subscribeToOrder,
  subscribeToDriver,
  SOCKET_EVENTS,
} from './socket-client';
import { useAuthStore, useOrdersStore, useNotificationsStore } from '../store';
import { Order, Driver, NotificationType } from '../../types';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToOrderTracking: (orderId: string) => void;
  unsubscribeFromOrderTracking: (orderId: string) => void;
}

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const socketRef = useRef<Socket | null>(null);
  const activeSubscriptionsRef = useRef<Set<string>>(new Set());

  const { token } = useAuthStore();
  const { updateOrder, addOrder } = useOrdersStore();
  const { addNotification } = useNotificationsStore();

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const connectSocket = async () => {
      try {
        const socketInstance = await initializeSocket(token);
        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Set up event listeners
        socketInstance.on('connect', () => {
          console.log('Realtime connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('Realtime disconnected');
          setIsConnected(false);
        });

        // Order events
        socketInstance.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (order: Order) => {
          console.log('Order status changed:', order.id);
          updateOrder(order);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: order.customerId,
            type: NotificationType.ORDER_UPDATE,
            title: 'Order Update',
            body: `Your order is now ${order.status}`,
            data: { orderId: order.id },
            read: false,
            actionUrl: `/orders/${order.id}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.ORDER_CONFIRMED, (order: Order) => {
          console.log('Order confirmed:', order.id);
          updateOrder(order);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: order.customerId,
            type: NotificationType.ORDER_UPDATE,
            title: 'Order Confirmed',
            body: `${order.merchant?.businessName} confirmed your order`,
            data: { orderId: order.id },
            read: false,
            actionUrl: `/orders/${order.id}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.ORDER_READY, (order: Order) => {
          console.log('Order ready:', order.id);
          updateOrder(order);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: order.customerId,
            type: NotificationType.ORDER_UPDATE,
            title: 'Order Ready',
            body: 'Your order is ready for pickup/delivery',
            data: { orderId: order.id },
            read: false,
            actionUrl: `/orders/${order.id}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.ORDER_COMPLETED, (order: Order) => {
          console.log('Order completed:', order.id);
          updateOrder(order);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: order.customerId,
            type: NotificationType.REVIEW_REQUEST,
            title: 'Order Delivered',
            body: 'Your order has been delivered successfully',
            data: { orderId: order.id },
            read: false,
            actionUrl: `/reviews/create/${order.id}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.DRIVER_ASSIGNED, (data: { orderId: string; driver: Driver }) => {
          console.log('Driver assigned:', (data.driver as any)?.id);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: (data.driver as any)?.customerId || 'unknown',
            type: NotificationType.ORDER_UPDATE,
            title: 'Driver Assigned',
            body: `${(data.driver as any)?.name || 'Your driver'} is on the way (${(data.driver as any)?.rating || 4.8}⭐)`,
            data: { driverId: (data.driver as any)?.id, orderId: data.orderId },
            read: false,
            actionUrl: `/orders/${data.orderId}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, (data: { orderId: string; location: { latitude: number; longitude: number } }) => {
          console.log('Driver location updated:', data);
          // Location update - component will fetch fresh data
        });

        socketInstance.on(SOCKET_EVENTS.DRIVER_ARRIVING_SOON, (data: { orderId: string; eta: string }) => {
          console.log('Driver arriving soon:', data);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: 'system',
            type: NotificationType.ORDER_UPDATE,
            title: 'Driver Arriving Soon',
            body: `Driver will arrive in ${data.eta}`,
            data: { orderId: data.orderId },
            read: false,
            actionUrl: `/orders/${data.orderId}`,
            createdAt: new Date().toISOString(),
          });
        });

        socketInstance.on(SOCKET_EVENTS.DRIVER_ARRIVED, (data: { orderId: string }) => {
          console.log('Driver arrived:', data.orderId);
          addNotification({
            id: `notification-${Date.now()}`,
            userId: 'system',
            type: NotificationType.ORDER_UPDATE,
            title: 'Driver Arrived',
            body: 'Your driver has arrived at your location',
            data: { orderId: data.orderId },
            read: false,
            actionUrl: `/orders/${data.orderId}`,
            createdAt: new Date().toISOString(),
          });
        });

        // Generic notification event
        socketInstance.on(SOCKET_EVENTS.NOTIFICATION_SENT, (notification: any) => {
          console.log('Notification received:', notification);
          addNotification({
            id: notification.id || `notification-${Date.now()}`,
            userId: notification.userId || 'system',
            type: notification.type || NotificationType.ORDER_UPDATE,
            title: notification.title,
            body: notification.body || notification.message,
            data: notification.data || {},
            read: false,
            actionUrl: notification.actionUrl || null,
            createdAt: new Date().toISOString(),
          });
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      // Cleanup on unmount
      disconnectSocket();
      activeSubscriptionsRef.current.clear();
    };
  }, [token, updateOrder, addOrder, addNotification]);

  const subscribeToOrderTracking = (orderId: string) => {
    if (socket?.connected && !activeSubscriptionsRef.current.has(orderId)) {
      subscribeToOrder(orderId);
      activeSubscriptionsRef.current.add(orderId);
    }
  };

  const unsubscribeFromOrderTracking = (orderId: string) => {
    if (socket?.connected && activeSubscriptionsRef.current.has(orderId)) {
      socket.emit('unsubscribe:order', orderId);
      activeSubscriptionsRef.current.delete(orderId);
    }
  };

  const value: RealtimeContextType = {
    socket,
    isConnected,
    subscribeToOrderTracking,
    unsubscribeFromOrderTracking,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = (): RealtimeContextType => {
  const context = React.useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};
