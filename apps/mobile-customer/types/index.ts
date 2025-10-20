// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  loyaltyPoints: number;
  preferredDetergent: string | null;
  preferredFoldOption: 'HANGER' | 'FOLD' | null;
  preferredStarchLevel: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY' | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ADDRESS TYPES
// ============================================

export interface Address {
  id: string;
  customerId: string;
  label: string; // "Home", "Work", "Gym"
  streetAddress: string;
  apartment: string | null;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  instructions: string | null; // "Ring doorbell", "Leave at door"
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MERCHANT TYPES
// ============================================

export enum MerchantType {
  DRY_CLEANER = 'DRY_CLEANER',
  LAUNDROMAT = 'LAUNDROMAT',
  ALTERATIONS = 'ALTERATIONS',
  SHOE_REPAIR = 'SHOE_REPAIR',
  BOTH = 'BOTH',
}

export interface Merchant {
  id: string;
  businessName: string;
  businessType: MerchantType;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: number;
  ratingCount: number;
  verified: boolean;
  featured: boolean;
  ecoFriendly: boolean;
  sameDayService: boolean;
  contactlessPickup: boolean;
  priceRange: '$$' | '$$$' | '$$$$';
  createdAt: string;
  locations?: MerchantLocation[];
  services?: Service[];
}

export interface MerchantLocation {
  id: string;
  merchantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  isPrimary: boolean;
  operatingHours: OperatingHours[];
  distance?: number; // Calculated client-side
}

export interface OperatingHours {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  isClosed: boolean;
}

// ============================================
// SERVICE TYPES
// ============================================

export enum ServiceCategory {
  DRY_CLEANING = 'DRY_CLEANING',
  WASH_AND_FOLD = 'WASH_AND_FOLD',
  ALTERATIONS = 'ALTERATIONS',
  SHOE_REPAIR = 'SHOE_REPAIR',
  LEATHER_CARE = 'LEATHER_CARE',
  SPECIALTY = 'SPECIALTY',
}

export interface Service {
  id: string;
  merchantId: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  basePrice: number;
  unit: 'ITEM' | 'POUND' | 'BAG'; // "per item", "per lb", "per bag"
  estimatedTurnaround: number; // hours
  available: boolean;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ORDER TYPES
// ============================================

export enum OrderType {
  ON_DEMAND = 'ON_DEMAND',
  SCHEDULED = 'SCHEDULED',
}

export enum FulfillmentMode {
  FULL_SERVICE = 'FULL_SERVICE', // Driver pickup + delivery
  CUSTOMER_DROPOFF_PICKUP = 'CUSTOMER_DROPOFF_PICKUP', // Customer drops off & picks up
  CUSTOMER_DROPOFF_DRIVER_DELIVERY = 'CUSTOMER_DROPOFF_DRIVER_DELIVERY', // Hybrid
  DRIVER_PICKUP_CUSTOMER_PICKUP = 'DRIVER_PICKUP_CUSTOMER_PICKUP', // Hybrid
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'CUSTOMER_DROPPED_OFF'
  | 'IN_PROCESS'
  | 'READY_FOR_DELIVERY'
  | 'READY_FOR_CUSTOMER_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CUSTOMER_PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  merchantId: string;
  merchantLocationId: string;
  type: OrderType;
  fulfillmentMode: FulfillmentMode;
  status: OrderStatus;

  // Addresses
  pickupAddressId: string | null;
  deliveryAddressId: string | null;
  pickupAddress?: Address;
  deliveryAddress?: Address;

  // Scheduling
  scheduledPickupAt: string | null;
  scheduledDeliveryAt: string | null;
  actualPickupAt: string | null;
  actualDeliveryAt: string | null;

  // Driver info
  pickupDriverId: string | null;
  deliveryDriverId: string | null;
  pickupDriver?: Driver;
  deliveryDriver?: Driver;

  // Pricing
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  tax: number;
  tip: number;
  totalAmount: number;

  // Items and instructions
  items: OrderItem[];
  specialInstructions: string | null;

  // Confirmations (self-service)
  dropoffConfirmationPhoto: string | null;
  dropoffConfirmedAt: string | null;
  pickupConfirmationPhoto: string | null;
  pickupConfirmedAt: string | null;

  // Relations
  merchant?: Merchant;
  customer?: Customer;

  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string | null;
  service?: Service;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  ratingCount: number;
  vehicleType: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehiclePlate: string;
  vehicleColor: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  profileImage: string | null;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  customerId: string;
  orderId: string;
  merchantId: string | null;
  driverId: string | null;
  rating: number;
  comment: string | null;
  photos: string[];
  tags: string[]; // ["Fast", "Affordable", "High Quality"]
  merchantResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// WARDROBE TYPES
// ============================================

export interface WardrobeItem {
  id: string;
  customerId: string;
  name: string;
  category: string; // "Suit", "Dress", "Coat", "Shoes"
  fabricType: string | null; // "Wool", "Cotton", "Leather"
  color: string | null;
  brand: string | null;
  imageUrl: string | null;
  careInstructions: string | null;
  lastCleanedAt: string | null;
  cleaningFrequency: number | null; // days
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export enum SubscriptionFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export interface Subscription {
  id: string;
  customerId: string;
  merchantId: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextOrderDate: string;
  defaultItems: SubscriptionItem[];
  defaultPickupAddressId: string;
  defaultDeliveryAddressId: string;
  discount: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  serviceId: string;
  quantity: number;
}

// ============================================
// PROMO CODE TYPES
// ============================================

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
}

// ============================================
// FAVORITE MERCHANT TYPES
// ============================================

export interface FavoriteMerchant {
  id: string;
  customerId: string;
  merchantId: string;
  nickname: string | null; // "Home Store", "Work Dry Cleaner"
  isHomeStore: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
  merchant?: Merchant;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PROMOTION = 'PROMOTION',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateOrderRequest {
  customerId: string;
  merchantId: string;
  merchantLocationId: string;
  type: OrderType;
  fulfillmentMode: FulfillmentMode;
  pickupAddressId: string | null;
  deliveryAddressId: string | null;
  scheduledPickupAt: string | null;
  specialInstructions: string | null;
  items: {
    serviceId: string;
    itemName: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  promoCode?: string;
}

export interface ConfirmDropoffRequest {
  orderId: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  notes: string | null;
}

export interface ConfirmPickupRequest {
  orderId: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  notes: string | null;
}
