/**
 * Orders API Service
 * Handles all order-related API calls
 */

import { apiClient } from './client';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  serviceFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderSchedule {
  pickupScheduled: Date;
  deliveryScheduled: Date;
  pickupActual?: Date | null;
  deliveryActual?: Date | null;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderStatusHistoryEntry {
  status: string;
  timestamp: Date;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentMode: string;
  customerId: string;
  merchantId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  pricing: OrderPricing;
  addresses: {
    pickup: OrderAddress;
    delivery: OrderAddress;
  };
  schedule: OrderSchedule;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: OrderStatusHistoryEntry[];
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentMode: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  pickupScheduled: Date;
  deliveryScheduled: Date;
  createdAt: Date;
}

export interface OrderQueryParams {
  merchantId?: string;
  customerId?: string;
  driverId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Mock orders data for development
 */
function getMockOrders(): OrderListItem[] {
  return [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'IN_PROGRESS',
      fulfillmentMode: 'FULL_SERVICE',
      customerName: 'John Doe',
      itemCount: 3,
      totalAmount: 69.50,
      pickupScheduled: new Date('2024-10-20T10:00:00'),
      deliveryScheduled: new Date('2024-10-22T15:00:00'),
      createdAt: new Date('2024-10-18T09:30:00'),
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'PENDING',
      fulfillmentMode: 'CUSTOMER_DROPOFF_PICKUP',
      customerName: 'Jane Smith',
      itemCount: 2,
      totalAmount: 45.00,
      pickupScheduled: new Date('2024-10-21T14:00:00'),
      deliveryScheduled: new Date('2024-10-23T16:00:00'),
      createdAt: new Date('2024-10-19T11:00:00'),
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'READY_FOR_PICKUP',
      fulfillmentMode: 'CUSTOMER_DROPOFF_PICKUP',
      customerName: 'Bob Johnson',
      itemCount: 5,
      totalAmount: 89.99,
      pickupScheduled: new Date('2024-10-19T09:00:00'),
      deliveryScheduled: new Date('2024-10-21T10:00:00'),
      createdAt: new Date('2024-10-17T08:00:00'),
    },
  ];
}

function getMockOrderDetail(id: string): Order {
  return {
    id,
    orderNumber: 'ORD-2024-001',
    status: 'IN_PROGRESS',
    fulfillmentMode: 'FULL_SERVICE',
    customerId: 'cust-1',
    merchantId: 'merchant-1',
    customer: {
      id: 'cust-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 415 555 1234',
    },
    items: [
      { id: '1', name: 'Dress Shirt', quantity: 2, price: 8.99, total: 17.98 },
      { id: '2', name: 'Dress Pants', quantity: 1, price: 12.99, total: 12.99 },
      { id: '3', name: 'Suit Jacket', quantity: 1, price: 24.99, total: 24.99 },
    ],
    pricing: {
      subtotal: 55.96,
      tax: 5.04,
      serviceFee: 3.50,
      deliveryFee: 5.00,
      discount: 0,
      total: 69.50,
    },
    addresses: {
      pickup: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
      },
      delivery: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
      },
    },
    schedule: {
      pickupScheduled: new Date('2024-10-20T10:00:00'),
      deliveryScheduled: new Date('2024-10-22T15:00:00'),
      pickupActual: new Date('2024-10-20T10:15:00'),
      deliveryActual: null,
    },
    specialInstructions: 'Please handle with care - delicate fabrics',
    createdAt: new Date('2024-10-18T09:30:00'),
    updatedAt: new Date('2024-10-20T11:00:00'),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date('2024-10-18T09:30:00'), note: 'Order placed' },
      { status: 'CONFIRMED', timestamp: new Date('2024-10-18T09:35:00'), note: 'Order confirmed by merchant' },
      { status: 'PICKED_UP', timestamp: new Date('2024-10-20T10:15:00'), note: 'Items picked up by driver' },
      { status: 'IN_PROGRESS', timestamp: new Date('2024-10-20T11:00:00'), note: 'Cleaning in progress' },
    ],
  };
}

/**
 * Get all orders for a merchant with filtering
 */
export async function getOrders(params: OrderQueryParams): Promise<OrderListItem[]> {
  try {
    const response = await apiClient.get<OrdersResponse>('/api/v1/orders', { params });

    // Transform API response to OrderListItem format
    return response.data.orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      fulfillmentMode: order.fulfillmentMode,
      customerName: order.customer.name,
      itemCount: order.items.length,
      totalAmount: order.pricing.total,
      pickupScheduled: new Date(order.schedule.pickupScheduled),
      deliveryScheduled: new Date(order.schedule.deliveryScheduled),
      createdAt: new Date(order.createdAt),
    }));
  } catch (error: any) {
    // Fallback to mock data if API is not available or requires auth
    if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
      console.warn('Using mock orders data (API requires authentication or is unavailable)');
      return getMockOrders();
    }
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  try {
    const response = await apiClient.get<Order>(`/api/v1/orders/${id}`);

    // Transform date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      schedule: {
        ...response.data.schedule,
        pickupScheduled: new Date(response.data.schedule.pickupScheduled),
        deliveryScheduled: new Date(response.data.schedule.deliveryScheduled),
        pickupActual: response.data.schedule.pickupActual
          ? new Date(response.data.schedule.pickupActual)
          : null,
        deliveryActual: response.data.schedule.deliveryActual
          ? new Date(response.data.schedule.deliveryActual)
          : null,
      },
      statusHistory: response.data.statusHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
    };
  } catch (error: any) {
    // Fallback to mock data if API is not available or requires auth
    if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
      console.warn(`Using mock order detail for ID ${id} (API requires authentication or is unavailable)`);
      return getMockOrderDetail(id);
    }
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  note?: string
): Promise<Order> {
  const response = await apiClient.patch<Order>(`/api/v1/orders/${orderId}/status`, {
    status,
    note,
  });

  return {
    ...response.data,
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
    schedule: {
      ...response.data.schedule,
      pickupScheduled: new Date(response.data.schedule.pickupScheduled),
      deliveryScheduled: new Date(response.data.schedule.deliveryScheduled),
      pickupActual: response.data.schedule.pickupActual
        ? new Date(response.data.schedule.pickupActual)
        : null,
      deliveryActual: response.data.schedule.deliveryActual
        ? new Date(response.data.schedule.deliveryActual)
        : null,
    },
    statusHistory: response.data.statusHistory.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    })),
  };
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  const response = await apiClient.delete<Order>(`/api/v1/orders/${orderId}`, {
    data: { reason },
  });

  return response.data;
}