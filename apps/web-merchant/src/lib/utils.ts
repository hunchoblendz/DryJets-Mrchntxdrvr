import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-800',
    DRIVER_ASSIGNED: 'bg-purple-100 text-purple-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    IN_TRANSIT_TO_MERCHANT: 'bg-cyan-100 text-cyan-800',
    RECEIVED_BY_MERCHANT: 'bg-teal-100 text-teal-800',
    IN_PROCESS: 'bg-orange-100 text-orange-800',
    READY_FOR_DELIVERY: 'bg-lime-100 text-lime-800',
    OUT_FOR_DELIVERY: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getOrderStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
}

export function getNextOrderStatuses(currentStatus: string): string[] {
  const statusFlow: Record<string, string[]> = {
    PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
    PAYMENT_CONFIRMED: ['DRIVER_ASSIGNED', 'CANCELLED'],
    DRIVER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT_TO_MERCHANT'],
    IN_TRANSIT_TO_MERCHANT: ['RECEIVED_BY_MERCHANT'],
    RECEIVED_BY_MERCHANT: ['IN_PROCESS'],
    IN_PROCESS: ['READY_FOR_DELIVERY'],
    READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  }
  return statusFlow[currentStatus] || []
}
