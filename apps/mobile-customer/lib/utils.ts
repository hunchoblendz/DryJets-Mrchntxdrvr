import { formatDistanceToNow, format } from 'date-fns';
import { OrderStatus, FulfillmentMode } from '../types';

// ============================================
// DATE & TIME UTILITIES
// ============================================

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date) => {
  return format(new Date(date), 'hh:mm a');
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatTimeForPicker = (date: string | Date) => {
  return format(new Date(date), 'HH:mm');
};

// ============================================
// CURRENCY & PRICING
// ============================================

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const parsePrice = (price: string): number => {
  return parseFloat(price.replace(/[^0-9.-]/g, ''));
};

export const calculateTax = (subtotal: number, taxRate: number = 0.08) => {
  return subtotal * taxRate;
};

export const calculateDiscount = (
  subtotal: number,
  discountType: 'PERCENTAGE' | 'FIXED',
  discountValue: number,
) => {
  if (discountType === 'PERCENTAGE') {
    return (subtotal * discountValue) / 100;
  }
  return discountValue;
};

// ============================================
// ORDER UTILITIES
// ============================================

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    PAYMENT_CONFIRMED: 'Payment Confirmed',
    DRIVER_ASSIGNED: 'Driver Assigned',
    PICKED_UP: 'Picked Up',
    CUSTOMER_DROPPED_OFF: 'Dropped Off',
    IN_PROCESS: 'In Process',
    READY_FOR_DELIVERY: 'Ready for Delivery',
    READY_FOR_CUSTOMER_PICKUP: 'Ready for Pickup',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CUSTOMER_PICKED_UP: 'Picked Up',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING_PAYMENT: '#FFB700',
    PAYMENT_CONFIRMED: '#0084FF',
    DRIVER_ASSIGNED: '#9B59B6',
    PICKED_UP: '#00BDA7',
    CUSTOMER_DROPPED_OFF: '#00BDA7',
    IN_PROCESS: '#FF8C00',
    READY_FOR_DELIVERY: '#10B759',
    READY_FOR_CUSTOMER_PICKUP: '#10B759',
    OUT_FOR_DELIVERY: '#0084FF',
    DELIVERED: '#10B759',
    CUSTOMER_PICKED_UP: '#10B759',
    COMPLETED: '#10B759',
    CANCELLED: '#FF1C00',
    REFUNDED: '#FF1C00',
  };
  return colors[status] || '#6B7280';
};

export const isOrderActive = (status: OrderStatus): boolean => {
  const activeStatuses: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'DRIVER_ASSIGNED',
    'PICKED_UP',
    'CUSTOMER_DROPPED_OFF',
    'IN_PROCESS',
    'READY_FOR_DELIVERY',
    'READY_FOR_CUSTOMER_PICKUP',
    'OUT_FOR_DELIVERY',
  ];
  return activeStatuses.includes(status);
};

export const isOrderCompletable = (status: OrderStatus): boolean => {
  return status === 'READY_FOR_DELIVERY' || status === 'READY_FOR_CUSTOMER_PICKUP';
};

export const getOrderProgressPercentage = (status: OrderStatus): number => {
  const progressMap: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 10,
    PAYMENT_CONFIRMED: 20,
    DRIVER_ASSIGNED: 30,
    PICKED_UP: 40,
    CUSTOMER_DROPPED_OFF: 45,
    IN_PROCESS: 60,
    READY_FOR_DELIVERY: 75,
    READY_FOR_CUSTOMER_PICKUP: 75,
    OUT_FOR_DELIVERY: 85,
    DELIVERED: 95,
    CUSTOMER_PICKED_UP: 95,
    COMPLETED: 100,
    CANCELLED: 0,
    REFUNDED: 0,
  };
  return progressMap[status] || 0;
};

export const calculateETA = (estimatedTime: string | Date, status: OrderStatus): string => {
  if (status === 'DELIVERED' || status === 'COMPLETED' || status === 'CANCELLED') {
    return 'Order Completed';
  }

  const eta = new Date(estimatedTime);
  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'ETA Passed';
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }

  return `${diffMins}m`;
};

// ============================================
// FULFILLMENT MODE UTILITIES
// ============================================

export const getFulfillmentModeLabel = (mode: FulfillmentMode): string => {
  const labels: Record<FulfillmentMode, string> = {
    FULL_SERVICE: 'Full Service',
    CUSTOMER_DROPOFF_PICKUP: 'Drop-off & Pick-up',
    CUSTOMER_DROPOFF_DRIVER_DELIVERY: 'Drop-off & Delivery',
    DRIVER_PICKUP_CUSTOMER_PICKUP: 'Pick-up & Collect',
  };
  return labels[mode];
};

export const getFulfillmentModeDescription = (mode: FulfillmentMode): string => {
  const descriptions: Record<FulfillmentMode, string> = {
    FULL_SERVICE: 'We pick up & deliver',
    CUSTOMER_DROPOFF_PICKUP: 'You drop off & pick up',
    CUSTOMER_DROPOFF_DRIVER_DELIVERY: 'You drop off, we deliver',
    DRIVER_PICKUP_CUSTOMER_PICKUP: 'We pick up, you collect',
  };
  return descriptions[mode];
};

export const calculateFulfillmentModeFee = (
  mode: FulfillmentMode,
  baseDeliveryFee: number = 5,
): number => {
  const feeMap: Record<FulfillmentMode, number> = {
    FULL_SERVICE: baseDeliveryFee,
    CUSTOMER_DROPOFF_PICKUP: 0,
    CUSTOMER_DROPOFF_DRIVER_DELIVERY: baseDeliveryFee * 0.5,
    DRIVER_PICKUP_CUSTOMER_PICKUP: baseDeliveryFee * 0.5,
  };
  return feeMap[mode];
};

export const calculateFulfillmentModeDiscount = (
  mode: FulfillmentMode,
  subtotal: number,
): number => {
  // Only CUSTOMER_DROPOFF_PICKUP gets discount
  if (mode === FulfillmentMode.CUSTOMER_DROPOFF_PICKUP) {
    return subtotal * 0.1; // 10% discount
  }
  return 0;
};

// ============================================
// DISTANCE & LOCATION
// ============================================

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number) => deg * (Math.PI / 180);

export const formatDistance = (miles: number): string => {
  if (miles < 0.1) {
    return '< 0.1 mi';
  }
  return `${miles.toFixed(1)} mi`;
};

// ============================================
// STRING UTILITIES
// ============================================

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

// ============================================
// ARRAY & OBJECT UTILITIES
// ============================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const group = String(item[key]);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) {
      return false;
    }
    seen.add(val);
    return true;
  });
};

// ============================================
// VALIDATION UTILITIES
// ============================================

export const validateAddress = (address: {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}): boolean => {
  return (
    address.streetAddress.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.zipCode.trim().length >= 5
  );
};

// ============================================
// ERROR HANDLING
// ============================================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An error occurred. Please try again.';
};

// ============================================
// RETRY LOGIC
// ============================================

export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
  } = {},
): Promise<T> => {
  const { maxRetries = 3, delay = 1000, backoff = true } = options;

  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, i) : delay;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};
