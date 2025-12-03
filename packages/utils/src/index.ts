/**
 * @dryjets/utils - Shared Utility Functions
 *
 * Common utilities used across the DryJets platform
 */

// Order code utilities
export {
  generateOrderShortCode,
  parseOrderShortCode,
  isValidShortCode,
  formatOrderId,
} from './order-code';

// Formatting utilities
export {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatPhoneNumber,
  formatAddress,
  formatDistance,
  formatDuration,
} from './format';

// Validation utilities
export {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidZipCode,
  validateOrderItems,
} from './validation';

// Constants
export {
  ORDER_STATUSES,
  DELIVERY_STATUSES,
  PAYMENT_METHODS,
  SERVICE_TYPES,
  ITEM_CATEGORIES,
  USER_ROLES,
} from './constants';

// Type exports
export type { OrderStatus, DeliveryStatus, PaymentMethod, ServiceType, UserRole } from './constants';
