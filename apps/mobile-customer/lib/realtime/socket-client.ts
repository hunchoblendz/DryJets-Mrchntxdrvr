import io, { Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const initializeSocket = async (token: string): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  try {
    // Hermes-compatible socket initialization with fallback transports
    socket = io(API_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Transports are ordered by preference - websocket first, fall back to polling if needed
      // Hermes engine handles this without issue, but we add error handling for safety
      transports: ['websocket', 'polling'],
      // Hermes-specific optimizations
      maxHttpBufferSize: 1e6, // 1MB - safe for Hermes memory
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket.io error:', error);
      // Log Hermes-specific errors if available
      if (error instanceof Error && error.stack) {
        console.error('Socket error stack:', error.stack);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      // Attempt fallback to polling if WebSocket fails
      if (socket && !socket.connected) {
        try {
          console.log('Attempting fallback to polling transport...');
          socket.io.opts.transports = ['polling'];
        } catch (e) {
          console.error('Failed to set polling fallback:', e);
        }
      }
    });

    return socket;
  } catch (error) {
    // Hermes-safe error handling for socket initialization
    console.error('Failed to initialize socket:', error);
    if (error instanceof Error) {
      console.error('Socket init error:', error.message);
    }
    throw error;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Subscribe to order updates
export const subscribeToOrder = (orderId: string): void => {
  if (!socket?.connected) {
    console.warn('Socket not connected, cannot subscribe to order');
    return;
  }
  socket.emit('subscribe:order', orderId);
};

// Unsubscribe from order updates
export const unsubscribeFromOrder = (orderId: string): void => {
  if (!socket?.connected) return;
  socket.emit('unsubscribe:order', orderId);
};

// Subscribe to driver updates
export const subscribeToDriver = (driverId: string): void => {
  if (!socket?.connected) {
    console.warn('Socket not connected, cannot subscribe to driver');
    return;
  }
  socket.emit('subscribe:driver', driverId);
};

// Unsubscribe from driver updates
export const unsubscribeFromDriver = (driverId: string): void => {
  if (!socket?.connected) return;
  socket.emit('unsubscribe:driver', driverId);
};

// Event listener types
export type SocketEventHandler = (data: any) => void;

// Register event listeners
export const on = (event: string, handler: SocketEventHandler): void => {
  if (!socket) return;
  socket.on(event, handler);
};

// Remove event listeners
export const off = (event: string, handler?: SocketEventHandler): void => {
  if (!socket) return;
  if (handler) {
    socket.off(event, handler);
  } else {
    socket.off(event);
  }
};

// Emit events
export const emit = (event: string, data?: any): void => {
  if (!socket?.connected) {
    console.warn(`Socket not connected, cannot emit ${event}`);
    return;
  }
  socket.emit(event, data);
};

// Socket events
export const SOCKET_EVENTS = {
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_READY: 'order:ready',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',

  // Driver events
  DRIVER_ASSIGNED: 'driver:assigned',
  DRIVER_LOCATION_UPDATED: 'driver:location-updated',
  DRIVER_ARRIVED_AT_MERCHANT: 'driver:arrived-at-merchant',
  DRIVER_LEFT_MERCHANT: 'driver:left-merchant',
  DRIVER_ARRIVING_SOON: 'driver:arriving-soon',
  DRIVER_ARRIVED: 'driver:arrived',

  // Notification events
  NOTIFICATION_SENT: 'notification:sent',
  NOTIFICATION_READ: 'notification:read',

  // Chat events (for future use)
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_SENT: 'message:sent',
  TYPING: 'typing',
  STOPPED_TYPING: 'stopped-typing',

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
} as const;
