'use client';

/**
 * useNetworkStatus Hook - Cloud Only
 *
 * Simple network detection without offline storage or sync queues.
 * For cloud-first architecture - all operations require online connectivity.
 */

import { useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'offline';

interface NetworkStatusData {
  status: NetworkStatus;
  isOnline: boolean;
}

export function useNetworkStatus(): NetworkStatusData {
  const [status, setStatus] = useState<NetworkStatus>('online');

  useEffect(() => {
    // Initial status check
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
    };

    updateStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus('online');
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    status,
    isOnline: status === 'online',
  };
}
