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

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  serviceFee: number;
  deliveryFee: number;
  createdAt: string;
  scheduledPickupAt?: string;
  actualPickupAt?: string;
  actualDeliveryAt?: string;
  merchant?: {
    businessName: string;
  };
  pickupDriver?: {
    firstName: string;
    lastName: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  service?: Service;
}

export interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  rating: number;
  ratingCount: number;
  verified: boolean;
  locations?: MerchantLocation[];
}

export interface MerchantLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: string;
  pricingModel: string;
  basePrice: number;
  estimatedTime?: number;
  isActive: boolean;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}
