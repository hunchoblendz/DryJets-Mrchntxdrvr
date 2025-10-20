import { useEffect, useCallback } from 'react';
import { useRealtime } from './RealtimeProvider';
import { on, off, SOCKET_EVENTS, SocketEventHandler } from './socket-client';
import { useOrdersStore } from '../store';
import { Order } from '../../types';

interface UseOrderTrackingOptions {
  orderId: string;
  enabled?: boolean;
}

interface OrderTrackingState {
  order: Order | null;
  isLoading: boolean;
  error: Error | null;
}

export const useOrderTracking = ({ orderId, enabled = true }: UseOrderTrackingOptions) => {
  const { subscribeToOrderTracking, unsubscribeFromOrderTracking, isConnected } = useRealtime();
  const { getOrderById } = useOrdersStore();

  const order = getOrderById(orderId);

  // Subscribe to order updates when component mounts
  useEffect(() => {
    if (!enabled || !isConnected || !orderId) return;

    subscribeToOrderTracking(orderId);

    return () => {
      unsubscribeFromOrderTracking(orderId);
    };
  }, [orderId, enabled, isConnected, subscribeToOrderTracking, unsubscribeFromOrderTracking]);

  // Set up listeners for order status changes
  useEffect(() => {
    if (!enabled) return;

    const handleOrderStatusChanged: SocketEventHandler = (updatedOrder: Order) => {
      if (updatedOrder.id === orderId) {
        console.log('Order status updated via socket:', updatedOrder.status);
      }
    };

    const handleOrderReady: SocketEventHandler = (updatedOrder: Order) => {
      if (updatedOrder.id === orderId) {
        console.log('Order ready for delivery:', updatedOrder.id);
      }
    };

    const handleOrderCompleted: SocketEventHandler = (updatedOrder: Order) => {
      if (updatedOrder.id === orderId) {
        console.log('Order completed:', updatedOrder.id);
      }
    };

    on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
    on(SOCKET_EVENTS.ORDER_READY, handleOrderReady);
    on(SOCKET_EVENTS.ORDER_COMPLETED, handleOrderCompleted);

    return () => {
      off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
      off(SOCKET_EVENTS.ORDER_READY, handleOrderReady);
      off(SOCKET_EVENTS.ORDER_COMPLETED, handleOrderCompleted);
    };
  }, [orderId, enabled]);

  return {
    order,
    isConnected,
    isLoading: !order,
  };
};

interface UseDriverTrackingOptions {
  driverId?: string;
  enabled?: boolean;
}

export const useDriverTracking = ({ driverId, enabled = true }: UseDriverTrackingOptions) => {
  const { socket, isConnected } = useRealtime();

  const handleDriverLocationUpdate = useCallback((data: { driverId: string; latitude: number; longitude: number }) => {
    if (data.driverId === driverId) {
      console.log('Driver location updated:', data);
    }
  }, [driverId]);

  useEffect(() => {
    if (!enabled || !isConnected || !driverId) return;

    // Subscribe to driver
    socket?.emit('subscribe:driver', driverId);

    // Listen for location updates
    on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, handleDriverLocationUpdate);

    return () => {
      socket?.emit('unsubscribe:driver', driverId);
      off(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, handleDriverLocationUpdate);
    };
  }, [driverId, enabled, isConnected, socket, handleDriverLocationUpdate]);

  return {
    isConnected,
  };
};

interface UseOrderNotificationsOptions {
  orderId: string;
  enabled?: boolean;
}

export const useOrderNotifications = ({ orderId, enabled = true }: UseOrderNotificationsOptions) => {
  const { isConnected } = useRealtime();

  useEffect(() => {
    if (!enabled || !isConnected || !orderId) return;

    const handleOrderConfirmed: SocketEventHandler = (data) => {
      if (data.orderId === orderId) {
        console.log('Order confirmed - notification sent');
      }
    };

    const handleDriverArriving: SocketEventHandler = (data) => {
      if (data.orderId === orderId) {
        console.log('Driver arriving - notification sent');
      }
    };

    const handleDriverArrived: SocketEventHandler = (data) => {
      if (data.orderId === orderId) {
        console.log('Driver arrived - notification sent');
      }
    };

    on(SOCKET_EVENTS.ORDER_CONFIRMED, handleOrderConfirmed);
    on(SOCKET_EVENTS.DRIVER_ARRIVING_SOON, handleDriverArriving);
    on(SOCKET_EVENTS.DRIVER_ARRIVED, handleDriverArrived);

    return () => {
      off(SOCKET_EVENTS.ORDER_CONFIRMED, handleOrderConfirmed);
      off(SOCKET_EVENTS.DRIVER_ARRIVING_SOON, handleDriverArriving);
      off(SOCKET_EVENTS.DRIVER_ARRIVED, handleDriverArrived);
    };
  }, [orderId, enabled, isConnected]);

  return {
    isConnected,
  };
};
