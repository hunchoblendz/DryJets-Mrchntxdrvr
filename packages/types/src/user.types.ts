/**
 * User-related types for DryJets platform
 */

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

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  loyaltyPoints: number;
  preferredDetergent?: string;
  preferredFoldOption?: 'HANGER' | 'FOLD';
  preferredStarchLevel?: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
}

export interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  status: 'OFFLINE' | 'AVAILABLE' | 'BUSY' | 'ON_BREAK';
  vehicleType: 'CAR' | 'VAN' | 'TRUCK' | 'MOTORCYCLE' | 'BICYCLE';
  vehiclePlate: string;
  currentLatitude?: number;
  currentLongitude?: number;
  totalEarnings: number;
  totalTrips: number;
  rating: number;
  ratingCount: number;
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'DRY_CLEANER' | 'LAUNDROMAT' | 'BOTH';
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  ratingCount: number;
  verified: boolean;
}
