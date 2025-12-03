/**
 * useNetworkStatus - Simple cloud-only network status hook
 *
 * Provides basic online/offline detection for cloud-first apps.
 * No sync queues, no offline storage - just network status monitoring.
 */

import { create } from 'zustand';

export type NetworkStatus = 'online' | 'offline';

export interface NetworkState {
  /** Current network status */
  status: NetworkStatus;
  /** Whether the app is online */
  isOnline: boolean;
  /** Set network status */
  setStatus: (status: NetworkStatus) => void;
}

/**
 * Simple network status store
 */
export const useNetworkStore = create<NetworkState>((set) => ({
  status: typeof window !== 'undefined' && navigator.onLine ? 'online' : 'offline',
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  setStatus: (status: NetworkStatus) =>
    set({ status, isOnline: status === 'online' }),
}));

/**
 * Hook to use network status with automatic event listeners
 */
export function useNetworkStatus() {
  const { status, isOnline, setStatus } = useNetworkStore();

  return {
    status,
    isOnline,
    setStatus,
  };
}

/**
 * Initialize network status monitoring
 * Call this once in your app's root component
 */
export function initNetworkMonitoring(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    useNetworkStore.getState().setStatus('online');
  };

  const handleOffline = () => {
    useNetworkStore.getState().setStatus('offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Set initial status
  if (navigator.onLine) {
    useNetworkStore.getState().setStatus('online');
  } else {
    useNetworkStore.getState().setStatus('offline');
  }

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Get network status display info for UI
 */
export function getNetworkStatusDisplay(status: NetworkStatus): {
  label: string;
  color: string;
  icon: 'online' | 'offline';
} {
  switch (status) {
    case 'online':
      return {
        label: 'Online',
        color: '#00B7A5', // Success teal
        icon: 'online',
      };
    case 'offline':
      return {
        label: 'Offline',
        color: '#FF3B30', // Danger red
        icon: 'offline',
      };
    default:
      return {
        label: 'Unknown',
        color: '#718096', // Gray
        icon: 'offline',
      };
  }
}
