/**
 * DryJets Hooks Package - Index
 *
 * Centralized exports for all React hooks
 */

// Network Status Hook (cloud-only, simplified)
export {
  useNetworkStatus,
  useNetworkStore,
  initNetworkMonitoring,
  getNetworkStatusDisplay,
} from './useNetworkStatus';
export type { NetworkStatus, NetworkState } from './useNetworkStatus';

// Keyboard Shortcuts Hook
export * from './useKeyboardShortcuts';
