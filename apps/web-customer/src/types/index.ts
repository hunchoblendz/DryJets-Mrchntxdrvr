export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT_TO_MERCHANT'
  | 'RECEIVED_BY_MERCHANT'
  | 'IN_PROCESS'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderType = 'ON_DEMAND' | 'SCHEDULED';

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
  scheduledPickupAt?: string;
  scheduledDeliveryAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  specialInstructions?: string;
  customerNotes?: string;
  merchantNotes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    user?: {
      phone: string;
    };
  };
  merchant?: {
    businessName: string;
  };
  pickupDriver?: {
    firstName: string;
    lastName: string;
  };
  deliveryDriver?: {
    firstName: string;
    lastName: string;
  };
  pickupAddress?: Address;
  deliveryAddress?: Address;
  items?: OrderItem[];
  statusHistory?: StatusHistory[];
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
  service?: Service;
}

export interface StatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  type: string;
  pricingModel: string;
  basePrice: number;
  estimatedTime?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantStats {
  totalOrders: number;
  totalRevenue: number;
  activeServices: number;
  locationCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
  }>;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  vehicleType: string;
  vehiclePlate: string;
  rating: number;
}
