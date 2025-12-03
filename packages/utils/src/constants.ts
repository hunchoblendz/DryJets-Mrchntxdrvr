/**
 * Shared Constants
 *
 * Common constants used across the DryJets platform
 */

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

// Delivery statuses
export const DELIVERY_STATUSES = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  ARRIVING: 'ARRIVING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETURNED: 'RETURNED',
} as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[keyof typeof DELIVERY_STATUSES];

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'CARD',
  CASH: 'CASH',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  INVOICE: 'INVOICE',
  BUSINESS_ACCOUNT: 'BUSINESS_ACCOUNT',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Service types
export const SERVICE_TYPES = {
  DRY_CLEANING: 'DRY_CLEANING',
  WASH_FOLD: 'WASH_FOLD',
  WASH_IRON: 'WASH_IRON',
  ALTERATIONS: 'ALTERATIONS',
  SPECIALTY: 'SPECIALTY',
  EXPRESS: 'EXPRESS',
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

// Item categories
export const ITEM_CATEGORIES = {
  SHIRT: 'SHIRT',
  PANTS: 'PANTS',
  DRESS: 'DRESS',
  SUIT: 'SUIT',
  COAT: 'COAT',
  JACKET: 'JACKET',
  SWEATER: 'SWEATER',
  BLOUSE: 'BLOUSE',
  SKIRT: 'SKIRT',
  TIE: 'TIE',
  BEDDING: 'BEDDING',
  CURTAINS: 'CURTAINS',
  LEATHER: 'LEATHER',
  WEDDING_DRESS: 'WEDDING_DRESS',
  OTHER: 'OTHER',
} as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[keyof typeof ITEM_CATEGORIES];

// User roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  DRIVER: 'DRIVER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Status display configurations
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending', color: 'gray', icon: 'clock' },
  CONFIRMED: { label: 'Confirmed', color: 'blue', icon: 'check' },
  PROCESSING: { label: 'Processing', color: 'yellow', icon: 'loader' },
  READY: { label: 'Ready', color: 'green', icon: 'package' },
  ASSIGNED: { label: 'Driver Assigned', color: 'blue', icon: 'user' },
  PICKED_UP: { label: 'Picked Up', color: 'purple', icon: 'truck' },
  IN_TRANSIT: { label: 'In Transit', color: 'blue', icon: 'navigation' },
  DELIVERED: { label: 'Delivered', color: 'green', icon: 'check-circle' },
  CANCELLED: { label: 'Cancelled', color: 'red', icon: 'x-circle' },
  REFUNDED: { label: 'Refunded', color: 'orange', icon: 'rotate-ccw' },
};

// Service type display configurations
export const SERVICE_TYPE_CONFIG: Record<ServiceType, { label: string; icon: string; description: string }> = {
  DRY_CLEANING: {
    label: 'Dry Cleaning',
    icon: 'sparkles',
    description: 'Professional dry cleaning for delicate garments',
  },
  WASH_FOLD: {
    label: 'Wash & Fold',
    icon: 'shirt',
    description: 'Laundry washed, dried, and neatly folded',
  },
  WASH_IRON: {
    label: 'Wash & Iron',
    icon: 'shirt',
    description: 'Laundry washed, dried, and professionally pressed',
  },
  ALTERATIONS: {
    label: 'Alterations',
    icon: 'scissors',
    description: 'Professional tailoring and alterations',
  },
  SPECIALTY: {
    label: 'Specialty Items',
    icon: 'star',
    description: 'Leather, suede, wedding dresses, and more',
  },
  EXPRESS: {
    label: 'Express Service',
    icon: 'zap',
    description: 'Same-day or next-day turnaround',
  },
};

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'America/New_York',
  PAGE_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ORDERS: '/api/orders',
  DELIVERY: '/api/delivery',
  DRIVERS: '/api/drivers',
  MERCHANTS: '/api/merchants',
  AUTH: '/api/auth',
  USERS: '/api/users',
} as const;
