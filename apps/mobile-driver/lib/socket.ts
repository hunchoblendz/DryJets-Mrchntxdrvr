import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Connect to the Socket.io server
   */
  async connect(driverId: string): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    try {
      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('[Socket] No auth token found');
        throw new Error('Authentication token not found');
      }

      console.log('[Socket] Connecting to:', `${SOCKET_URL}/events`);

      this.socket = io(`${SOCKET_URL}/events`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers(driverId);
    } catch (error) {
      console.error('[Socket] Connection error:', error);
      throw error;
    }
  }

  /**
   * Set up socket event handlers
   */
  private setupEventHandlers(driverId: string): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully');
      this.reconnectAttempts = 0;

      // Subscribe to driver's personal room
      this.emit('subscribeToDriver', { driverId });
    });

    this.socket.on('connected', (data) => {
      console.log('[Socket] Server confirmed connection:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Server error:', error);
    });

    // Real-time events from server
    this.socket.on('order:assigned', (data) => {
      console.log('[Socket] Order assigned:', data);
      this.triggerListeners('order:assigned', data);
    });

    this.socket.on('order:statusChanged', (data) => {
      console.log('[Socket] Order status changed:', data);
      this.triggerListeners('order:statusChanged', data);
    });

    this.socket.on('order:available', (data) => {
      console.log('[Socket] New order available:', data);
      this.triggerListeners('order:available', data);
    });

    this.socket.on('notification', (data) => {
      console.log('[Socket] Notification received:', data);
      this.triggerListeners('notification', data);
    });

    this.socket.on('driver:locationUpdate', (data) => {
      console.log('[Socket] Location update confirmed:', data);
      this.triggerListeners('driver:locationUpdate', data);
    });
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data, (response: any) => {
      if (response?.event === 'error') {
        console.error('[Socket] Server error response:', response.data);
      }
    });
  }

  /**
   * Send driver location update
   */
  sendLocationUpdate(driverId: string, latitude: number, longitude: number, orderId?: string): void {
    this.emit('driverLocationUpdate', {
      driverId,
      latitude,
      longitude,
      orderId,
    });
  }

  /**
   * Subscribe to an order room
   */
  subscribeToOrder(orderId: string): void {
    this.emit('subscribeToOrder', { orderId });
  }

  /**
   * Unsubscribe from an order room
   */
  unsubscribeFromOrder(orderId: string): void {
    this.emit('unsubscribeFromOrder', { orderId });
  }

  /**
   * Add a listener for a specific event
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  /**
   * Trigger all listeners for an event
   */
  private triggerListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Socket] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }

    // Clear all listeners
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
