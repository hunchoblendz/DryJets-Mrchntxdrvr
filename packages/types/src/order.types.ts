/**
 * Order-related types for DryJets platform
 */

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT_TO_MERCHANT = 'IN_TRANSIT_TO_MERCHANT',
  RECEIVED_BY_MERCHANT = 'RECEIVED_BY_MERCHANT',
  IN_PROCESS = 'IN_PROCESS',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  ON_DEMAND = 'ON_DEMAND',
  SCHEDULED = 'SCHEDULED',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  merchantId: string;
  merchantLocationId: string;
  pickupDriverId?: string;
  deliveryDriverId?: string;
  type: OrderType;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  serviceFee: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  totalAmount: number;
  pickupAddressId: string;
  deliveryAddressId: string;
  scheduledPickupAt?: Date;
  scheduledDeliveryAt?: Date;
  actualPickupAt?: Date;
  actualDeliveryAt?: Date;
  specialInstructions?: string;
  customerNotes?: string;
  merchantNotes?: string;
  estimatedWeight?: number;
  actualWeight?: number;
  photoUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  photoUrl?: string;
  fabricType?: string;
  stainType?: string;
}

export interface CreateOrderDTO {
  merchantId: string;
  merchantLocationId: string;
  type: OrderType;
  pickupAddressId: string;
  deliveryAddressId: string;
  scheduledPickupAt?: Date;
  scheduledDeliveryAt?: Date;
  specialInstructions?: string;
  items: {
    serviceId: string;
    itemName: string;
    description?: string;
    quantity: number;
    specialInstructions?: string;
    photoUrl?: string;
  }[];
}
