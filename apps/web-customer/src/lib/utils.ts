import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getOrderStatusColor(status: OrderStatus): string {
  const statusColors: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-800',
    DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-800',
    PICKED_UP: 'bg-purple-100 text-purple-800',
    IN_TRANSIT_TO_MERCHANT: 'bg-purple-100 text-purple-800',
    RECEIVED_BY_MERCHANT: 'bg-orange-100 text-orange-800',
    IN_PROCESS: 'bg-orange-100 text-orange-800',
    READY_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
    OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function getNextOrderStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
    PAYMENT_CONFIRMED: ['DRIVER_ASSIGNED', 'CANCELLED'],
    DRIVER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT_TO_MERCHANT', 'CANCELLED'],
    IN_TRANSIT_TO_MERCHANT: ['RECEIVED_BY_MERCHANT', 'CANCELLED'],
    RECEIVED_BY_MERCHANT: ['IN_PROCESS'],
    IN_PROCESS: ['READY_FOR_DELIVERY'],
    READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: ['REFUNDED'],
    REFUNDED: [],
  };
  return statusFlow[currentStatus] || [];
}
