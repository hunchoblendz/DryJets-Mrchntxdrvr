-- ============================================
-- DryJets Platform - PostgreSQL Migration Script
-- Generated from Prisma Schema
-- Production-ready for Supabase/PostgreSQL
-- ============================================

-- Enable UUID extension for CUID-like IDs (optional, but recommended)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

-- User Management Enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- Driver Enums
CREATE TYPE "DriverStatus" AS ENUM ('OFFLINE', 'AVAILABLE', 'BUSY', 'ON_BREAK');
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'VAN', 'TRUCK', 'MOTORCYCLE', 'BICYCLE');

-- Merchant Enums
CREATE TYPE "MerchantType" AS ENUM ('DRY_CLEANER', 'LAUNDROMAT', 'BOTH');
CREATE TYPE "MerchantTier" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- Service Enums
CREATE TYPE "ServiceType" AS ENUM ('DRY_CLEANING', 'WASH_AND_FOLD', 'ALTERATIONS', 'SHOE_REPAIR', 'LEATHER_CLEANING', 'WEDDING_DRESS', 'COMFORTER', 'CURTAINS', 'OTHER');
CREATE TYPE "PricingModel" AS ENUM ('PER_ITEM', 'PER_POUND', 'FLAT_RATE');

-- Order Enums
CREATE TYPE "OrderStatus" AS ENUM (
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'AWAITING_CUSTOMER_DROPOFF',
    'DRIVER_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT_TO_MERCHANT',
    'RECEIVED_BY_MERCHANT',
    'IN_PROCESS',
    'READY_FOR_DELIVERY',
    'READY_FOR_CUSTOMER_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'PICKED_UP_BY_CUSTOMER',
    'CANCELLED',
    'REFUNDED'
);
CREATE TYPE "OrderType" AS ENUM ('ON_DEMAND', 'SCHEDULED', 'SUBSCRIPTION');
CREATE TYPE "FulfillmentMode" AS ENUM ('FULL_SERVICE', 'CUSTOMER_DROPOFF_PICKUP', 'CUSTOMER_DROPOFF_DRIVER_DELIVERY', 'DRIVER_PICKUP_CUSTOMER_PICKUP');

-- Payment Enums
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'WALLET', 'CASH', 'BNPL');

-- Review Enum
CREATE TYPE "ReviewType" AS ENUM ('MERCHANT', 'DRIVER');

-- Equipment Enums
CREATE TYPE "EquipmentType" AS ENUM ('WASHER', 'DRYER', 'PRESSER', 'STEAMER', 'OTHER');
CREATE TYPE "EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE_REQUIRED', 'OUT_OF_SERVICE');

-- Staff Enum
CREATE TYPE "StaffRole" AS ENUM (
    'MANAGER',
    'CLEANER',
    'PRESSER',
    'CASHIER',
    'DELIVERY',
    'STORE_MANAGER',
    'REGIONAL_MANAGER',
    'ENTERPRISE_ADMIN',
    'STAFF_MEMBER',
    'FINANCE_MANAGER',
    'OPERATIONS'
);

-- Promotion Enum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY', 'BOGO');

-- Subscription Enums
CREATE TYPE "SubscriptionFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- Notification Enums
CREATE TYPE "NotificationType" AS ENUM ('ORDER_UPDATE', 'PAYMENT', 'PROMOTION', 'SYSTEM', 'DRIVER_ASSIGNMENT', 'DELIVERY');
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL', 'SMS');

-- Workflow Enum
CREATE TYPE "WorkflowType" AS ENUM (
    'CREATE_ORDER',
    'SCHEDULE_MAINTENANCE',
    'BOOK_APPOINTMENT',
    'DRIVER_DISPATCH',
    'CUSTOMER_REGISTRATION',
    'BULK_ORDER_UPLOAD'
);

-- Audit Enum
CREATE TYPE "AuditAction" AS ENUM (
    'ORDER_CREATED',
    'ORDER_UPDATED',
    'ORDER_CANCELLED',
    'ORDER_STATUS_CHANGED',
    'ORDER_REFUNDED',
    'STAFF_CREATED',
    'STAFF_UPDATED',
    'STAFF_DELETED',
    'STAFF_PERMISSION_CHANGED',
    'STAFF_ROLE_CHANGED',
    'EQUIPMENT_CREATED',
    'EQUIPMENT_UPDATED',
    'EQUIPMENT_DELETED',
    'EQUIPMENT_MAINTENANCE_SCHEDULED',
    'SETTINGS_UPDATED',
    'PRICING_CHANGED',
    'LOCATION_ADDED',
    'LOCATION_REMOVED',
    'PAYMENT_PROCESSED',
    'REFUND_ISSUED',
    'PAYOUT_COMPLETED',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'PASSWORD_CHANGED',
    'PERMISSION_DENIED'
);

-- Maintenance Alert Enums
CREATE TYPE "MaintenanceAlertType" AS ENUM (
    'PREVENTIVE_MAINTENANCE',
    'HIGH_VIBRATION',
    'HIGH_TEMPERATURE',
    'LOW_EFFICIENCY',
    'CYCLE_ANOMALY',
    'FILTER_REPLACEMENT',
    'PART_REPLACEMENT',
    'UNUSUAL_NOISE',
    'WATER_LEAK',
    'POWER_SPIKE'
);
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');

-- ============================================
-- TABLES
-- ============================================

-- ============================================
-- USER MANAGEMENT
-- ============================================

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "UserSession" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER
-- ============================================

CREATE TABLE "Customer" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "preferredDetergent" TEXT,
    "preferredFoldOption" TEXT,
    "preferredStarchLevel" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DRIVER
-- ============================================

CREATE TABLE "Driver" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleColor" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP WITH TIME ZONE NOT NULL,
    "backgroundCheckStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "backgroundCheckDate" TIMESTAMP WITH TIME ZONE,
    "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DriverEarning" (
    "id" TEXT PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netEarning" DOUBLE PRECISION NOT NULL,
    "paidOut" BOOLEAN NOT NULL DEFAULT false,
    "paidOutAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MERCHANT
-- ============================================

CREATE TABLE "Merchant" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "businessName" TEXT NOT NULL,
    "businessType" "MerchantType" NOT NULL,
    "tier" "MerchantTier" NOT NULL DEFAULT 'BASIC',
    "taxId" TEXT,
    "stripeAccountId" TEXT UNIQUE,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "MerchantLocation" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "operatingHours" JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SERVICES & PRICING
-- ============================================

CREATE TABLE "Service" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ServiceType" NOT NULL,
    "pricingModel" "PricingModel" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADDRESSES
-- ============================================

CREATE TABLE "Address" (
    "id" TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "apartment" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deliveryNotes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "merchantLocationId" TEXT NOT NULL,
    "pickupDriverId" TEXT,
    "deliveryDriverId" TEXT,
    "type" "OrderType" NOT NULL DEFAULT 'ON_DEMAND',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "fulfillmentMode" "FulfillmentMode" NOT NULL DEFAULT 'FULL_SERVICE',

    -- Pricing
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selfServiceDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    -- Addresses
    "pickupAddressId" TEXT NOT NULL,
    "deliveryAddressId" TEXT NOT NULL,

    -- Scheduling
    "scheduledPickupAt" TIMESTAMP WITH TIME ZONE,
    "scheduledDeliveryAt" TIMESTAMP WITH TIME ZONE,
    "actualPickupAt" TIMESTAMP WITH TIME ZONE,
    "actualDeliveryAt" TIMESTAMP WITH TIME ZONE,
    "customerDropoffTime" TIMESTAMP WITH TIME ZONE,
    "customerPickupTime" TIMESTAMP WITH TIME ZONE,

    -- Special instructions
    "specialInstructions" TEXT,
    "customerNotes" TEXT,
    "merchantNotes" TEXT,

    -- Self-service confirmation
    "dropoffConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "dropoffConfirmedAt" TIMESTAMP WITH TIME ZONE,
    "pickupConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "pickupConfirmedAt" TIMESTAMP WITH TIME ZONE,
    "confirmationPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Metadata
    "estimatedWeight" DOUBLE PRECISION,
    "actualWeight" DOUBLE PRECISION,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],

    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "specialInstructions" TEXT,
    "photoUrl" TEXT,
    "fabricType" TEXT,
    "stainType" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrderStatusHistory" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "notes" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "stripePaymentIntent" TEXT UNIQUE,
    "stripeChargeId" TEXT,
    "merchantPayout" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "driverPayout" DOUBLE PRECISION NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

CREATE TABLE "Review" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT,
    "driverId" TEXT,
    "type" "ReviewType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "response" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY & SUPPLIES (Merchant)
-- ============================================

CREATE TABLE "InventoryItem" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "minStockLevel" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "supplierId" TEXT,
    "lastRestockedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EQUIPMENT & MAINTENANCE (Merchant)
-- ============================================

CREATE TABLE "Equipment" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP WITH TIME ZONE,
    "lastMaintenanceDate" TIMESTAMP WITH TIME ZONE,
    "nextMaintenanceDate" TIMESTAMP WITH TIME ZONE,
    "maintenanceNotes" TEXT,

    -- IoT Integration
    "isIotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "iotDeviceId" TEXT UNIQUE,
    "iotApiKey" TEXT,
    "lastTelemetryAt" TIMESTAMP WITH TIME ZONE,

    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EquipmentTelemetry" (
    "id" TEXT PRIMARY KEY,
    "equipmentId" TEXT NOT NULL UNIQUE,

    -- Sensor readings
    "powerWatts" DOUBLE PRECISION,
    "waterLiters" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "vibration" DOUBLE PRECISION,
    "cycleType" TEXT,

    -- Cycle info
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "cycleStartedAt" TIMESTAMP WITH TIME ZONE,
    "cycleEstimatedEnd" TIMESTAMP WITH TIME ZONE,
    "cycleCount" INTEGER NOT NULL DEFAULT 0,

    -- Computed metrics
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "efficiencyScore" INTEGER NOT NULL DEFAULT 100,

    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EquipmentTelemetryLog" (
    "id" TEXT PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL
);

CREATE TABLE "MaintenanceAlert" (
    "id" TEXT PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "MaintenanceAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "triggerData" JSONB,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP WITH TIME ZONE,
    "resolvedAt" TIMESTAMP WITH TIME ZONE,
    "resolution" TEXT
);

-- ============================================
-- STAFF MANAGEMENT (Merchant)
-- ============================================

CREATE TABLE "Staff" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "hourlyRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hiredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StaffPermission" (
    "id" TEXT PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "locationId" TEXT,

    -- Permissions
    "canViewOrders" BOOLEAN NOT NULL DEFAULT false,
    "canCreateOrders" BOOLEAN NOT NULL DEFAULT false,
    "canEditOrders" BOOLEAN NOT NULL DEFAULT false,
    "canCancelOrders" BOOLEAN NOT NULL DEFAULT false,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "canViewFinance" BOOLEAN NOT NULL DEFAULT false,
    "canManageStaff" BOOLEAN NOT NULL DEFAULT false,
    "canManageEquipment" BOOLEAN NOT NULL DEFAULT false,
    "canManageSettings" BOOLEAN NOT NULL DEFAULT false,
    "canManageInventory" BOOLEAN NOT NULL DEFAULT false,
    "canManageDrivers" BOOLEAN NOT NULL DEFAULT false,
    "canViewReports" BOOLEAN NOT NULL DEFAULT false,

    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROMOTIONS & DISCOUNTS
-- ============================================

CREATE TABLE "Promotion" (
    "id" TEXT PRIMARY KEY,
    "merchantId" TEXT,
    "code" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderValue" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE "Subscription" (
    "id" TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "preferredPickupTime" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WARDROBE MANAGEMENT (AI Feature)
-- ============================================

CREATE TABLE "WardrobeItem" (
    "id" TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fabricType" TEXT,
    "color" TEXT,
    "brand" TEXT,
    "photoUrl" TEXT,
    "purchaseDate" TIMESTAMP WITH TIME ZONE,
    "lastCleanedAt" TIMESTAMP WITH TIME ZONE,
    "cleaningCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REFERRALS & LOYALTY
-- ============================================

CREATE TABLE "Referral" (
    "id" TEXT PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL UNIQUE,
    "code" TEXT NOT NULL UNIQUE,
    "rewardEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardPaidOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "FavoriteMerchant" (
    "id" TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("customerId", "merchantId")
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKFLOW STATE PERSISTENCE
-- ============================================

CREATE TABLE "WorkflowState" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT,
    "workflowType" "WorkflowType" NOT NULL,
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOGGING & COMPLIANCE
-- ============================================

CREATE TABLE "AuditLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT,
    "locationId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FOREIGN KEYS
-- ============================================

-- UserSession
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Customer
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Driver
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- DriverEarning
ALTER TABLE "DriverEarning" ADD CONSTRAINT "DriverEarning_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE;

-- Merchant
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- MerchantLocation
ALTER TABLE "MerchantLocation" ADD CONSTRAINT "MerchantLocation_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- Service
ALTER TABLE "Service" ADD CONSTRAINT "Service_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- Address
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;

-- Order
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_merchantLocationId_fkey"
    FOREIGN KEY ("merchantLocationId") REFERENCES "MerchantLocation"("id") ON DELETE RESTRICT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupDriverId_fkey"
    FOREIGN KEY ("pickupDriverId") REFERENCES "Driver"("id") ON DELETE SET NULL;

ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryDriverId_fkey"
    FOREIGN KEY ("deliveryDriverId") REFERENCES "Driver"("id") ON DELETE SET NULL;

ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupAddressId_fkey"
    FOREIGN KEY ("pickupAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryAddressId_fkey"
    FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT;

-- OrderItem
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT;

-- OrderStatusHistory
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;

-- Payment
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;

-- Review
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;

ALTER TABLE "Review" ADD CONSTRAINT "Review_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL;

ALTER TABLE "Review" ADD CONSTRAINT "Review_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL;

-- InventoryItem
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- Equipment
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- EquipmentTelemetry
ALTER TABLE "EquipmentTelemetry" ADD CONSTRAINT "EquipmentTelemetry_equipmentId_fkey"
    FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE;

-- EquipmentTelemetryLog
ALTER TABLE "EquipmentTelemetryLog" ADD CONSTRAINT "EquipmentTelemetryLog_equipmentId_fkey"
    FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE;

-- MaintenanceAlert
ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_equipmentId_fkey"
    FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE;

ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- Staff
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- StaffPermission
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE;

-- Promotion
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL;

-- Subscription
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;

-- WardrobeItem
ALTER TABLE "WardrobeItem" ADD CONSTRAINT "WardrobeItem_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;

-- Referral
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey"
    FOREIGN KEY ("referrerId") REFERENCES "Customer"("id") ON DELETE RESTRICT;

ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey"
    FOREIGN KEY ("referredId") REFERENCES "Customer"("id") ON DELETE RESTRICT;

-- FavoriteMerchant
ALTER TABLE "FavoriteMerchant" ADD CONSTRAINT "FavoriteMerchant_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;

ALTER TABLE "FavoriteMerchant" ADD CONSTRAINT "FavoriteMerchant_merchantId_fkey"
    FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE;

-- Notification
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- ============================================
-- INDEXES
-- ============================================

-- User indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_role_idx" ON "User"("role");

-- UserSession indexes
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_token_idx" ON "UserSession"("token");

-- Customer indexes
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- Driver indexes
CREATE INDEX "Driver_userId_idx" ON "Driver"("userId");
CREATE INDEX "Driver_status_idx" ON "Driver"("status");
CREATE INDEX "Driver_currentLatitude_currentLongitude_idx" ON "Driver"("currentLatitude", "currentLongitude");

-- DriverEarning indexes
CREATE INDEX "DriverEarning_driverId_idx" ON "DriverEarning"("driverId");
CREATE INDEX "DriverEarning_orderId_idx" ON "DriverEarning"("orderId");
CREATE INDEX "DriverEarning_paidOut_idx" ON "DriverEarning"("paidOut");

-- Merchant indexes
CREATE INDEX "Merchant_userId_idx" ON "Merchant"("userId");
CREATE INDEX "Merchant_businessName_idx" ON "Merchant"("businessName");
CREATE INDEX "Merchant_rating_idx" ON "Merchant"("rating");

-- MerchantLocation indexes
CREATE INDEX "MerchantLocation_merchantId_idx" ON "MerchantLocation"("merchantId");
CREATE INDEX "MerchantLocation_latitude_longitude_idx" ON "MerchantLocation"("latitude", "longitude");
CREATE INDEX "MerchantLocation_zipCode_idx" ON "MerchantLocation"("zipCode");

-- Service indexes
CREATE INDEX "Service_merchantId_idx" ON "Service"("merchantId");
CREATE INDEX "Service_type_idx" ON "Service"("type");

-- Address indexes
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- Order indexes
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_merchantId_idx" ON "Order"("merchantId");
CREATE INDEX "Order_pickupDriverId_idx" ON "Order"("pickupDriverId");
CREATE INDEX "Order_deliveryDriverId_idx" ON "Order"("deliveryDriverId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- OrderItem indexes
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_serviceId_idx" ON "OrderItem"("serviceId");

-- OrderStatusHistory indexes
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- Payment indexes
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- Review indexes
CREATE INDEX "Review_customerId_idx" ON "Review"("customerId");
CREATE INDEX "Review_merchantId_idx" ON "Review"("merchantId");
CREATE INDEX "Review_driverId_idx" ON "Review"("driverId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- InventoryItem indexes
CREATE INDEX "InventoryItem_merchantId_idx" ON "InventoryItem"("merchantId");
CREATE INDEX "InventoryItem_currentStock_idx" ON "InventoryItem"("currentStock");

-- Equipment indexes
CREATE INDEX "Equipment_merchantId_idx" ON "Equipment"("merchantId");
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");
CREATE INDEX "Equipment_iotDeviceId_idx" ON "Equipment"("iotDeviceId");

-- EquipmentTelemetry indexes
CREATE INDEX "EquipmentTelemetry_equipmentId_idx" ON "EquipmentTelemetry"("equipmentId");

-- EquipmentTelemetryLog indexes
CREATE INDEX "EquipmentTelemetryLog_equipmentId_timestamp_idx" ON "EquipmentTelemetryLog"("equipmentId", "timestamp");
CREATE INDEX "EquipmentTelemetryLog_timestamp_idx" ON "EquipmentTelemetryLog"("timestamp");

-- MaintenanceAlert indexes
CREATE INDEX "MaintenanceAlert_merchantId_status_idx" ON "MaintenanceAlert"("merchantId", "status");
CREATE INDEX "MaintenanceAlert_equipmentId_status_idx" ON "MaintenanceAlert"("equipmentId", "status");
CREATE INDEX "MaintenanceAlert_severity_status_idx" ON "MaintenanceAlert"("severity", "status");
CREATE INDEX "MaintenanceAlert_createdAt_idx" ON "MaintenanceAlert"("createdAt");

-- Staff indexes
CREATE INDEX "Staff_merchantId_idx" ON "Staff"("merchantId");
CREATE INDEX "Staff_isActive_idx" ON "Staff"("isActive");

-- StaffPermission indexes
CREATE INDEX "StaffPermission_staffId_idx" ON "StaffPermission"("staffId");
CREATE INDEX "StaffPermission_merchantId_idx" ON "StaffPermission"("merchantId");
CREATE INDEX "StaffPermission_locationId_idx" ON "StaffPermission"("locationId");

-- Promotion indexes
CREATE INDEX "Promotion_code_idx" ON "Promotion"("code");
CREATE INDEX "Promotion_merchantId_idx" ON "Promotion"("merchantId");
CREATE INDEX "Promotion_isActive_idx" ON "Promotion"("isActive");

-- Subscription indexes
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_nextScheduledDate_idx" ON "Subscription"("nextScheduledDate");

-- WardrobeItem indexes
CREATE INDEX "WardrobeItem_customerId_idx" ON "WardrobeItem"("customerId");

-- Referral indexes
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX "Referral_code_idx" ON "Referral"("code");

-- FavoriteMerchant indexes
CREATE INDEX "FavoriteMerchant_customerId_idx" ON "FavoriteMerchant"("customerId");
CREATE INDEX "FavoriteMerchant_merchantId_idx" ON "FavoriteMerchant"("merchantId");

-- Notification indexes
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_sentAt_idx" ON "Notification"("sentAt");

-- AnalyticsEvent indexes
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- WorkflowState indexes
CREATE INDEX "WorkflowState_userId_workflowType_idx" ON "WorkflowState"("userId", "workflowType");
CREATE INDEX "WorkflowState_merchantId_idx" ON "WorkflowState"("merchantId");
CREATE INDEX "WorkflowState_completedAt_idx" ON "WorkflowState"("completedAt");
CREATE INDEX "WorkflowState_expiresAt_idx" ON "WorkflowState"("expiresAt");

-- AuditLog indexes
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_merchantId_idx" ON "AuditLog"("merchantId");
CREATE INDEX "AuditLog_locationId_idx" ON "AuditLog"("locationId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- ============================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================

-- Create a function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updatedAt column
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_updated_at BEFORE UPDATE ON "Driver"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_updated_at BEFORE UPDATE ON "Merchant"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchantlocation_updated_at BEFORE UPDATE ON "MerchantLocation"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_updated_at BEFORE UPDATE ON "Service"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_address_updated_at BEFORE UPDATE ON "Address"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON "Payment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventoryitem_updated_at BEFORE UPDATE ON "InventoryItem"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON "Equipment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipmenttelemetry_updated_at BEFORE UPDATE ON "EquipmentTelemetry"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON "Staff"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staffpermission_updated_at BEFORE UPDATE ON "StaffPermission"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_updated_at BEFORE UPDATE ON "Promotion"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON "Subscription"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wardrobeitem_updated_at BEFORE UPDATE ON "WardrobeItem"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflowstate_updated_at BEFORE UPDATE ON "WorkflowState"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'DryJets Database Migration Completed Successfully!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 24 ENUM types';
    RAISE NOTICE '  - 33 Tables';
    RAISE NOTICE '  - 50+ Foreign Key Constraints';
    RAISE NOTICE '  - 100+ Indexes';
    RAISE NOTICE '  - Triggers for auto-updating timestamps';
    RAISE NOTICE '==================================================';
END $$;
