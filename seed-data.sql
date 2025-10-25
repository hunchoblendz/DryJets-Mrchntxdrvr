-- ============================================
-- DryJets Platform - SQL Seed Data Script
-- Production-ready for Supabase/PostgreSQL
-- Generated from Prisma Seed File
-- ============================================
--
-- This script populates the database with sample data:
-- - 2 Customers (John Doe, Jane Smith)
-- - 2 Merchants (Sparkle Dry Cleaners, Fresh Press Laundromat)
-- - 2 Drivers (Mike Johnson, Sarah Williams)
-- - Sample Orders with various statuses
-- - Equipment with IoT capabilities
-- - Services, addresses, and more
--
-- All users have password: password123
-- Bcrypt hash: $2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2
-- ============================================

-- Ensure we have UUID extension enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CLEAR EXISTING DATA (Optional - Uncomment to reset)
-- ============================================
-- TRUNCATE TABLE "OrderItem" CASCADE;
-- TRUNCATE TABLE "OrderStatusHistory" CASCADE;
-- TRUNCATE TABLE "Order" CASCADE;
-- TRUNCATE TABLE "EquipmentTelemetryLog" CASCADE;
-- TRUNCATE TABLE "MaintenanceAlert" CASCADE;
-- TRUNCATE TABLE "EquipmentTelemetry" CASCADE;
-- TRUNCATE TABLE "Equipment" CASCADE;
-- TRUNCATE TABLE "Service" CASCADE;
-- TRUNCATE TABLE "MerchantLocation" CASCADE;
-- TRUNCATE TABLE "Merchant" CASCADE;
-- TRUNCATE TABLE "Driver" CASCADE;
-- TRUNCATE TABLE "Address" CASCADE;
-- TRUNCATE TABLE "Customer" CASCADE;
-- TRUNCATE TABLE "User" CASCADE;

-- ============================================
-- USERS
-- ============================================
-- Password for all users: password123
-- Bcrypt hash: $2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2

-- Customer 1: John Doe
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_customer1_johndoe',
    'john.doe@example.com',
    '+14155551234',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'CUSTOMER',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Customer 2: Jane Smith
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_customer2_janesmith',
    'jane.smith@example.com',
    '+14155555678',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'CUSTOMER',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Driver 1: Mike Johnson
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_driver1_mikejohnson',
    'driver.mike@example.com',
    '+14155559876',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'DRIVER',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Driver 2: Sarah Williams
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_driver2_sarahwilliams',
    'driver.sarah@example.com',
    '+14155557890',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'DRIVER',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Merchant 1: Sparkle Dry Cleaners
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_merchant1_sparkledry',
    'owner@sparkledry.com',
    '+14155552345',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'MERCHANT',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Merchant 2: Fresh Press Laundromat
INSERT INTO "User" (
    "id",
    "email",
    "phone",
    "passwordHash",
    "role",
    "status",
    "emailVerified",
    "phoneVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_merchant2_freshpress',
    'owner@freshpress.com',
    '+14155553456',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwk/JdNCLw5XJPEaW8U0HjQBQ2',
    'MERCHANT',
    'ACTIVE',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMERS
-- ============================================

INSERT INTO "Customer" (
    "id",
    "userId",
    "firstName",
    "lastName",
    "loyaltyPoints",
    "preferredFoldOption",
    "preferredStarchLevel",
    "createdAt",
    "updatedAt"
) VALUES (
    'customer1_johndoe',
    'user_customer1_johndoe',
    'John',
    'Doe',
    120,
    'HANGER',
    'LIGHT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Customer" (
    "id",
    "userId",
    "firstName",
    "lastName",
    "loyaltyPoints",
    "preferredFoldOption",
    "createdAt",
    "updatedAt"
) VALUES (
    'customer2_janesmith',
    'user_customer2_janesmith',
    'Jane',
    'Smith',
    350,
    'FOLD',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- ADDRESSES
-- ============================================

-- John Doe - Home (Default)
INSERT INTO "Address" (
    "id",
    "customerId",
    "label",
    "street",
    "apartment",
    "city",
    "state",
    "zipCode",
    "country",
    "latitude",
    "longitude",
    "isDefault",
    "createdAt",
    "updatedAt"
) VALUES (
    'address1_john_home',
    'customer1_johndoe',
    'Home',
    '123 Market Street',
    'Apt 4B',
    'San Francisco',
    'CA',
    '94102',
    'USA',
    37.7749,
    -122.4194,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- John Doe - Office
INSERT INTO "Address" (
    "id",
    "customerId",
    "label",
    "street",
    "city",
    "state",
    "zipCode",
    "country",
    "latitude",
    "longitude",
    "isDefault",
    "createdAt",
    "updatedAt"
) VALUES (
    'address2_john_office',
    'customer1_johndoe',
    'Office',
    '456 Market Street',
    'San Francisco',
    'CA',
    '94103',
    'USA',
    37.7849,
    -122.4094,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Jane Smith - Home (Default)
INSERT INTO "Address" (
    "id",
    "customerId",
    "label",
    "street",
    "city",
    "state",
    "zipCode",
    "country",
    "latitude",
    "longitude",
    "isDefault",
    "createdAt",
    "updatedAt"
) VALUES (
    'address3_jane_home',
    'customer2_janesmith',
    'Home',
    '789 Valencia Street',
    'San Francisco',
    'CA',
    '94110',
    'USA',
    37.7599,
    -122.4214,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- DRIVERS
-- ============================================

-- Driver 1: Mike Johnson
INSERT INTO "Driver" (
    "id",
    "userId",
    "firstName",
    "lastName",
    "status",
    "vehicleType",
    "vehicleMake",
    "vehicleModel",
    "vehiclePlate",
    "vehicleColor",
    "licenseNumber",
    "licenseExpiry",
    "backgroundCheckStatus",
    "backgroundCheckDate",
    "insuranceVerified",
    "rating",
    "ratingCount",
    "totalTrips",
    "totalEarnings",
    "createdAt",
    "updatedAt"
) VALUES (
    'driver1_mikejohnson',
    'user_driver1_mikejohnson',
    'Mike',
    'Johnson',
    'AVAILABLE',
    'CAR',
    'Toyota',
    'Prius',
    'ABC123',
    'Blue',
    'DL123456789',
    '2026-03-10 00:00:00+00',
    'APPROVED',
    '2024-01-15 00:00:00+00',
    true,
    4.8,
    245,
    245,
    8500.50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Driver 2: Sarah Williams
INSERT INTO "Driver" (
    "id",
    "userId",
    "firstName",
    "lastName",
    "status",
    "vehicleType",
    "vehicleMake",
    "vehicleModel",
    "vehiclePlate",
    "vehicleColor",
    "licenseNumber",
    "licenseExpiry",
    "backgroundCheckStatus",
    "backgroundCheckDate",
    "insuranceVerified",
    "rating",
    "ratingCount",
    "totalTrips",
    "totalEarnings",
    "createdAt",
    "updatedAt"
) VALUES (
    'driver2_sarahwilliams',
    'user_driver2_sarahwilliams',
    'Sarah',
    'Williams',
    'AVAILABLE',
    'CAR',
    'Honda',
    'Civic',
    'XYZ789',
    'White',
    'DL987654321',
    '2027-11-25 00:00:00+00',
    'APPROVED',
    '2024-02-20 00:00:00+00',
    true,
    4.9,
    189,
    189,
    6200.75,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- MERCHANTS
-- ============================================

-- Merchant 1: Sparkle Dry Cleaners
INSERT INTO "Merchant" (
    "id",
    "userId",
    "businessName",
    "businessType",
    "tier",
    "taxId",
    "rating",
    "ratingCount",
    "totalOrders",
    "totalRevenue",
    "verified",
    "stripeOnboarded",
    "createdAt",
    "updatedAt"
) VALUES (
    'merchant1_sparkledry',
    'user_merchant1_sparkledry',
    'Sparkle Dry Cleaners',
    'DRY_CLEANER',
    'PRO',
    '12-3456789',
    4.7,
    152,
    450,
    28500.75,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Merchant 2: Fresh Press Laundromat
INSERT INTO "Merchant" (
    "id",
    "userId",
    "businessName",
    "businessType",
    "tier",
    "taxId",
    "rating",
    "ratingCount",
    "totalOrders",
    "totalRevenue",
    "verified",
    "stripeOnboarded",
    "createdAt",
    "updatedAt"
) VALUES (
    'merchant2_freshpress',
    'user_merchant2_freshpress',
    'Fresh Press Laundromat',
    'LAUNDROMAT',
    'BASIC',
    '98-7654321',
    4.5,
    89,
    320,
    15800.50,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- MERCHANT LOCATIONS
-- ============================================

-- Sparkle Dry Cleaners - Downtown Location
INSERT INTO "MerchantLocation" (
    "id",
    "merchantId",
    "name",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "latitude",
    "longitude",
    "phone",
    "email",
    "isMain",
    "isActive",
    "operatingHours",
    "createdAt",
    "updatedAt"
) VALUES (
    'location1_sparkle_downtown',
    'merchant1_sparkledry',
    'Downtown Location',
    '321 Mission Street',
    'San Francisco',
    'CA',
    '94105',
    'USA',
    37.7899,
    -122.3999,
    '+14155552345',
    'downtown@sparkledry.com',
    true,
    true,
    '{
        "monday": {"open": "08:00", "close": "18:00"},
        "tuesday": {"open": "08:00", "close": "18:00"},
        "wednesday": {"open": "08:00", "close": "18:00"},
        "thursday": {"open": "08:00", "close": "18:00"},
        "friday": {"open": "08:00", "close": "18:00"},
        "saturday": {"open": "09:00", "close": "17:00"},
        "sunday": {"open": "00:00", "close": "00:00"}
    }'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Fresh Press Laundromat - Main Location
INSERT INTO "MerchantLocation" (
    "id",
    "merchantId",
    "name",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "latitude",
    "longitude",
    "phone",
    "email",
    "isMain",
    "isActive",
    "operatingHours",
    "createdAt",
    "updatedAt"
) VALUES (
    'location2_freshpress_main',
    'merchant2_freshpress',
    'Main Location',
    '567 Folsom Street',
    'San Francisco',
    'CA',
    '94107',
    'USA',
    37.7799,
    -122.3899,
    '+14155553456',
    'info@freshpress.com',
    true,
    true,
    '{
        "monday": {"open": "07:00", "close": "22:00"},
        "tuesday": {"open": "07:00", "close": "22:00"},
        "wednesday": {"open": "07:00", "close": "22:00"},
        "thursday": {"open": "07:00", "close": "22:00"},
        "friday": {"open": "07:00", "close": "22:00"},
        "saturday": {"open": "08:00", "close": "22:00"},
        "sunday": {"open": "08:00", "close": "20:00"}
    }'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- SERVICES
-- ============================================

-- Sparkle Dry Cleaners Services

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service1_sparkle_shirt',
    'merchant1_sparkledry',
    'Dry Cleaning - Shirt',
    'Professional dry cleaning for dress shirts',
    'DRY_CLEANING',
    'PER_ITEM',
    5.99,
    2880,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service2_sparkle_suit',
    'merchant1_sparkledry',
    'Dry Cleaning - Suit',
    'Premium dry cleaning for suits (jacket + pants)',
    'DRY_CLEANING',
    'PER_ITEM',
    18.99,
    2880,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service3_sparkle_dress',
    'merchant1_sparkledry',
    'Dry Cleaning - Dress',
    'Expert dry cleaning for dresses',
    'DRY_CLEANING',
    'PER_ITEM',
    14.99,
    2880,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service4_sparkle_alterations',
    'merchant1_sparkledry',
    'Alterations',
    'Professional tailoring and alterations',
    'ALTERATIONS',
    'PER_ITEM',
    25.00,
    7200,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Fresh Press Laundromat Services

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service5_freshpress_washfold',
    'merchant2_freshpress',
    'Wash & Fold',
    'Full-service wash, dry, and fold',
    'WASH_AND_FOLD',
    'PER_POUND',
    1.99,
    1440,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Service" (
    "id",
    "merchantId",
    "name",
    "description",
    "type",
    "pricingModel",
    "basePrice",
    "estimatedTime",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'service6_freshpress_comforter',
    'merchant2_freshpress',
    'Comforter Cleaning',
    'Deep cleaning for comforters and bedding',
    'COMFORTER',
    'PER_ITEM',
    35.00,
    4320,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- EQUIPMENT
-- ============================================

-- Sparkle Dry Cleaners Equipment

INSERT INTO "Equipment" (
    "id",
    "merchantId",
    "name",
    "type",
    "manufacturer",
    "model",
    "serialNumber",
    "purchaseDate",
    "lastMaintenanceDate",
    "nextMaintenanceDate",
    "status",
    "isIotEnabled",
    "iotDeviceId",
    "createdAt",
    "updatedAt"
) VALUES (
    'equipment1_sparkle_washer1',
    'merchant1_sparkledry',
    'Industrial Washer #1',
    'WASHER',
    'Electrolux',
    'WH6-33',
    'ELX-WASH-001',
    '2020-03-15 00:00:00+00',
    '2024-09-01 00:00:00+00',
    '2024-12-01 00:00:00+00',
    'OPERATIONAL',
    true,
    'ESP32-WASH-001',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Equipment" (
    "id",
    "merchantId",
    "name",
    "type",
    "manufacturer",
    "model",
    "serialNumber",
    "purchaseDate",
    "lastMaintenanceDate",
    "nextMaintenanceDate",
    "status",
    "isIotEnabled",
    "iotDeviceId",
    "createdAt",
    "updatedAt"
) VALUES (
    'equipment2_sparkle_dryer1',
    'merchant1_sparkledry',
    'Commercial Dryer #1',
    'DRYER',
    'Speed Queen',
    'SDESXRGS173TW01',
    'SQ-DRY-001',
    '2020-03-15 00:00:00+00',
    '2024-08-15 00:00:00+00',
    '2024-11-15 00:00:00+00',
    'OPERATIONAL',
    true,
    'ESP32-DRY-001',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "Equipment" (
    "id",
    "merchantId",
    "name",
    "type",
    "manufacturer",
    "model",
    "serialNumber",
    "purchaseDate",
    "lastMaintenanceDate",
    "nextMaintenanceDate",
    "status",
    "isIotEnabled",
    "iotDeviceId",
    "createdAt",
    "updatedAt"
) VALUES (
    'equipment3_sparkle_presser1',
    'merchant1_sparkledry',
    'Pressing Machine #1',
    'PRESSER',
    'Sankosha',
    'DF-6100',
    'SNK-PRESS-001',
    '2021-06-10 00:00:00+00',
    '2024-07-20 00:00:00+00',
    '2024-10-20 00:00:00+00',
    'OPERATIONAL',
    true,
    'ESP32-PRESS-001',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Fresh Press Laundromat Equipment

INSERT INTO "Equipment" (
    "id",
    "merchantId",
    "name",
    "type",
    "manufacturer",
    "model",
    "serialNumber",
    "purchaseDate",
    "lastMaintenanceDate",
    "nextMaintenanceDate",
    "status",
    "isIotEnabled",
    "createdAt",
    "updatedAt"
) VALUES (
    'equipment4_freshpress_washer2',
    'merchant2_freshpress',
    'Industrial Washer #2',
    'WASHER',
    'Maytag',
    'MHN33PDAWW',
    'MAY-WASH-002',
    '2019-11-20 00:00:00+00',
    '2024-08-01 00:00:00+00',
    '2024-11-01 00:00:00+00',
    'OPERATIONAL',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- EQUIPMENT TELEMETRY (for IoT-enabled equipment)
-- ============================================

-- Industrial Washer #1 Telemetry
INSERT INTO "EquipmentTelemetry" (
    "id",
    "equipmentId",
    "powerWatts",
    "waterLiters",
    "temperature",
    "vibration",
    "cycleType",
    "isRunning",
    "cycleStartedAt",
    "cycleEstimatedEnd",
    "cycleCount",
    "healthScore",
    "efficiencyScore",
    "updatedAt"
) VALUES (
    'telemetry1_washer1',
    'equipment1_sparkle_washer1',
    2500.5,
    45.2,
    65.8,
    0.3,
    'HEAVY_DUTY',
    true,
    CURRENT_TIMESTAMP - INTERVAL '25 minutes',
    CURRENT_TIMESTAMP + INTERVAL '5 minutes',
    1247,
    95,
    92,
    CURRENT_TIMESTAMP
);

-- Commercial Dryer #1 Telemetry
INSERT INTO "EquipmentTelemetry" (
    "id",
    "equipmentId",
    "powerWatts",
    "temperature",
    "vibration",
    "cycleType",
    "isRunning",
    "cycleStartedAt",
    "cycleEstimatedEnd",
    "cycleCount",
    "healthScore",
    "efficiencyScore",
    "updatedAt"
) VALUES (
    'telemetry2_dryer1',
    'equipment2_sparkle_dryer1',
    3200.0,
    85.5,
    0.4,
    'NORMAL',
    true,
    CURRENT_TIMESTAMP - INTERVAL '15 minutes',
    CURRENT_TIMESTAMP + INTERVAL '25 minutes',
    1589,
    88,
    85,
    CURRENT_TIMESTAMP
);

-- Pressing Machine #1 Telemetry
INSERT INTO "EquipmentTelemetry" (
    "id",
    "equipmentId",
    "powerWatts",
    "temperature",
    "vibration",
    "isRunning",
    "cycleCount",
    "healthScore",
    "efficiencyScore",
    "updatedAt"
) VALUES (
    'telemetry3_presser1',
    'equipment3_sparkle_presser1',
    1500.0,
    180.0,
    0.1,
    false,
    892,
    97,
    94,
    CURRENT_TIMESTAMP
);

-- ============================================
-- EQUIPMENT TELEMETRY LOGS (Sample historical data)
-- ============================================

-- Washer telemetry logs
INSERT INTO "EquipmentTelemetryLog" (
    "id",
    "equipmentId",
    "timestamp",
    "data"
) VALUES
(
    'log1_washer_001',
    'equipment1_sparkle_washer1',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    '{"powerWatts": 2450.0, "waterLiters": 42.5, "temperature": 63.2, "vibration": 0.25, "cycleType": "NORMAL", "isRunning": true}'::jsonb
),
(
    'log2_washer_002',
    'equipment1_sparkle_washer1',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    '{"powerWatts": 2520.0, "waterLiters": 46.8, "temperature": 67.1, "vibration": 0.32, "cycleType": "HEAVY_DUTY", "isRunning": true}'::jsonb
),
(
    'log3_washer_003',
    'equipment1_sparkle_washer1',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    '{"powerWatts": 2500.5, "waterLiters": 45.2, "temperature": 65.8, "vibration": 0.3, "cycleType": "HEAVY_DUTY", "isRunning": true}'::jsonb
);

-- Dryer telemetry logs
INSERT INTO "EquipmentTelemetryLog" (
    "id",
    "equipmentId",
    "timestamp",
    "data"
) VALUES
(
    'log4_dryer_001',
    'equipment2_sparkle_dryer1',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    '{"powerWatts": 3100.0, "temperature": 82.5, "vibration": 0.35, "cycleType": "NORMAL", "isRunning": true}'::jsonb
),
(
    'log5_dryer_002',
    'equipment2_sparkle_dryer1',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    '{"powerWatts": 3250.0, "temperature": 87.2, "vibration": 0.42, "cycleType": "HIGH_HEAT", "isRunning": true}'::jsonb
);

-- ============================================
-- MAINTENANCE ALERTS
-- ============================================

-- Sample maintenance alert for washer
INSERT INTO "MaintenanceAlert" (
    "id",
    "equipmentId",
    "merchantId",
    "type",
    "severity",
    "title",
    "description",
    "recommendation",
    "triggerData",
    "status",
    "createdAt"
) VALUES (
    'alert1_washer_vibration',
    'equipment1_sparkle_washer1',
    'merchant1_sparkledry',
    'HIGH_VIBRATION',
    'MEDIUM',
    'Elevated Vibration Detected',
    'Washer #1 is showing vibration levels above normal threshold (0.3 vs 0.2 normal)',
    'Schedule inspection of drum bearings and check load balance. May need bearing replacement within 30 days.',
    '{"vibration": 0.3, "threshold": 0.2, "duration_minutes": 45}'::jsonb,
    'ACKNOWLEDGED',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);

-- Sample preventive maintenance alert
INSERT INTO "MaintenanceAlert" (
    "id",
    "equipmentId",
    "merchantId",
    "type",
    "severity",
    "title",
    "description",
    "recommendation",
    "status",
    "createdAt"
) VALUES (
    'alert2_dryer_maintenance',
    'equipment2_sparkle_dryer1',
    'merchant1_sparkledry',
    'PREVENTIVE_MAINTENANCE',
    'LOW',
    'Scheduled Maintenance Due',
    'Commercial Dryer #1 is approaching scheduled maintenance date',
    'Schedule routine maintenance including lint trap cleaning, belt inspection, and temperature calibration.',
    'OPEN',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
);

-- ============================================
-- ORDERS
-- ============================================

-- Order 1: Completed order for John Doe
INSERT INTO "Order" (
    "id",
    "orderNumber",
    "customerId",
    "merchantId",
    "merchantLocationId",
    "pickupDriverId",
    "deliveryDriverId",
    "type",
    "status",
    "fulfillmentMode",
    "subtotal",
    "taxAmount",
    "serviceFee",
    "deliveryFee",
    "tip",
    "discount",
    "selfServiceDiscount",
    "totalAmount",
    "pickupAddressId",
    "deliveryAddressId",
    "scheduledPickupAt",
    "scheduledDeliveryAt",
    "actualPickupAt",
    "actualDeliveryAt",
    "specialInstructions",
    "createdAt",
    "updatedAt"
) VALUES (
    'order1_john_delivered',
    'ORD-2024-001',
    'customer1_johndoe',
    'merchant1_sparkledry',
    'location1_sparkle_downtown',
    'driver1_mikejohnson',
    'driver1_mikejohnson',
    'ON_DEMAND',
    'DELIVERED',
    'FULL_SERVICE',
    24.98,
    2.25,
    3.50,
    5.00,
    5.00,
    0,
    0,
    40.73,
    'address1_john_home',
    'address1_john_home',
    '2024-10-15 10:00:00+00',
    '2024-10-17 15:00:00+00',
    '2024-10-15 10:15:00+00',
    '2024-10-17 14:45:00+00',
    'Please handle with care - silk items',
    '2024-10-15 09:00:00+00',
    '2024-10-17 14:45:00+00'
);

-- Order 2: In-process order for Jane Smith
INSERT INTO "Order" (
    "id",
    "orderNumber",
    "customerId",
    "merchantId",
    "merchantLocationId",
    "pickupDriverId",
    "deliveryDriverId",
    "type",
    "status",
    "fulfillmentMode",
    "subtotal",
    "taxAmount",
    "serviceFee",
    "deliveryFee",
    "tip",
    "discount",
    "selfServiceDiscount",
    "totalAmount",
    "pickupAddressId",
    "deliveryAddressId",
    "scheduledPickupAt",
    "scheduledDeliveryAt",
    "actualPickupAt",
    "specialInstructions",
    "createdAt",
    "updatedAt"
) VALUES (
    'order2_jane_inprocess',
    'ORD-2024-002',
    'customer2_janesmith',
    'merchant2_freshpress',
    'location2_freshpress_main',
    'driver2_sarahwilliams',
    'driver2_sarahwilliams',
    'ON_DEMAND',
    'IN_PROCESS',
    'FULL_SERVICE',
    39.80,
    3.58,
    4.00,
    5.00,
    0,
    0,
    0,
    52.38,
    'address3_jane_home',
    'address3_jane_home',
    '2024-10-20 14:00:00+00',
    '2024-10-21 17:00:00+00',
    '2024-10-20 14:20:00+00',
    NULL,
    'Heavy comforter - extra care needed',
    '2024-10-20 13:00:00+00',
    CURRENT_TIMESTAMP
);

-- Order 3: Recent order awaiting pickup
INSERT INTO "Order" (
    "id",
    "orderNumber",
    "customerId",
    "merchantId",
    "merchantLocationId",
    "type",
    "status",
    "fulfillmentMode",
    "subtotal",
    "taxAmount",
    "serviceFee",
    "deliveryFee",
    "tip",
    "discount",
    "selfServiceDiscount",
    "totalAmount",
    "pickupAddressId",
    "deliveryAddressId",
    "scheduledPickupAt",
    "scheduledDeliveryAt",
    "createdAt",
    "updatedAt"
) VALUES (
    'order3_john_pending',
    'ORD-2024-003',
    'customer1_johndoe',
    'merchant1_sparkledry',
    'location1_sparkle_downtown',
    'ON_DEMAND',
    'PAYMENT_CONFIRMED',
    'FULL_SERVICE',
    37.98,
    3.42,
    4.00,
    5.00,
    0,
    0,
    0,
    50.40,
    'address2_john_office',
    'address2_john_office',
    '2024-10-24 16:00:00+00',
    '2024-10-26 10:00:00+00',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- ORDER ITEMS
-- ============================================

-- Order 1 Items
INSERT INTO "OrderItem" (
    "id",
    "orderId",
    "serviceId",
    "itemName",
    "quantity",
    "unitPrice",
    "totalPrice",
    "specialInstructions",
    "createdAt"
) VALUES
(
    'orderitem1_order1_shirt',
    'order1_john_delivered',
    'service1_sparkle_shirt',
    'Dress Shirt',
    2,
    5.99,
    11.98,
    'Light starch on collars',
    '2024-10-15 09:00:00+00'
),
(
    'orderitem2_order1_dress',
    'order1_john_delivered',
    'service3_sparkle_dress',
    'Evening Dress',
    1,
    14.99,
    14.99,
    NULL,
    '2024-10-15 09:00:00+00'
);

-- Order 2 Items
INSERT INTO "OrderItem" (
    "id",
    "orderId",
    "serviceId",
    "itemName",
    "quantity",
    "unitPrice",
    "totalPrice",
    "createdAt"
) VALUES
(
    'orderitem3_order2_washfold',
    'order2_jane_inprocess',
    'service5_freshpress_washfold',
    'Wash & Fold',
    20,
    1.99,
    39.80,
    '2024-10-20 13:00:00+00'
);

-- Order 3 Items
INSERT INTO "OrderItem" (
    "id",
    "orderId",
    "serviceId",
    "itemName",
    "quantity",
    "unitPrice",
    "totalPrice",
    "createdAt"
) VALUES
(
    'orderitem4_order3_suit',
    'order3_john_pending',
    'service2_sparkle_suit',
    'Business Suit',
    2,
    18.99,
    37.98,
    CURRENT_TIMESTAMP
);

-- ============================================
-- ORDER STATUS HISTORY
-- ============================================

-- Order 1 Status History (Completed)
INSERT INTO "OrderStatusHistory" (
    "id",
    "orderId",
    "status",
    "createdAt"
) VALUES
(
    'status1_order1_pending',
    'order1_john_delivered',
    'PENDING_PAYMENT',
    '2024-10-15 09:00:00+00'
),
(
    'status2_order1_confirmed',
    'order1_john_delivered',
    'PAYMENT_CONFIRMED',
    '2024-10-15 09:05:00+00'
),
(
    'status3_order1_assigned',
    'order1_john_delivered',
    'DRIVER_ASSIGNED',
    '2024-10-15 09:30:00+00'
),
(
    'status4_order1_pickedup',
    'order1_john_delivered',
    'PICKED_UP',
    '2024-10-15 10:15:00+00'
),
(
    'status5_order1_inprocess',
    'order1_john_delivered',
    'IN_PROCESS',
    '2024-10-15 11:00:00+00'
),
(
    'status6_order1_ready',
    'order1_john_delivered',
    'READY_FOR_DELIVERY',
    '2024-10-17 12:00:00+00'
),
(
    'status7_order1_outfor',
    'order1_john_delivered',
    'OUT_FOR_DELIVERY',
    '2024-10-17 13:00:00+00'
),
(
    'status8_order1_delivered',
    'order1_john_delivered',
    'DELIVERED',
    '2024-10-17 14:45:00+00'
);

-- Order 2 Status History (In Process)
INSERT INTO "OrderStatusHistory" (
    "id",
    "orderId",
    "status",
    "createdAt"
) VALUES
(
    'status9_order2_pending',
    'order2_jane_inprocess',
    'PENDING_PAYMENT',
    '2024-10-20 13:00:00+00'
),
(
    'status10_order2_confirmed',
    'order2_jane_inprocess',
    'PAYMENT_CONFIRMED',
    '2024-10-20 13:05:00+00'
),
(
    'status11_order2_assigned',
    'order2_jane_inprocess',
    'DRIVER_ASSIGNED',
    '2024-10-20 13:45:00+00'
),
(
    'status12_order2_pickedup',
    'order2_jane_inprocess',
    'PICKED_UP',
    '2024-10-20 14:20:00+00'
),
(
    'status13_order2_inprocess',
    'order2_jane_inprocess',
    'IN_PROCESS',
    '2024-10-20 15:00:00+00'
);

-- Order 3 Status History (Awaiting Pickup)
INSERT INTO "OrderStatusHistory" (
    "id",
    "orderId",
    "status",
    "createdAt"
) VALUES
(
    'status14_order3_pending',
    'order3_john_pending',
    'PENDING_PAYMENT',
    CURRENT_TIMESTAMP - INTERVAL '5 minutes'
),
(
    'status15_order3_confirmed',
    'order3_john_pending',
    'PAYMENT_CONFIRMED',
    CURRENT_TIMESTAMP
);

-- ============================================
-- PAYMENTS
-- ============================================

-- Payment for Order 1 (Completed)
INSERT INTO "Payment" (
    "id",
    "orderId",
    "customerId",
    "merchantId",
    "amount",
    "currency",
    "status",
    "paymentMethod",
    "stripePaymentIntent",
    "merchantPayout",
    "platformFee",
    "driverPayout",
    "refundAmount",
    "createdAt",
    "updatedAt"
) VALUES (
    'payment1_order1',
    'order1_john_delivered',
    'customer1_johndoe',
    'merchant1_sparkledry',
    40.73,
    'USD',
    'SUCCEEDED',
    'CARD',
    'pi_1234567890abcdef',
    32.58,
    4.07,
    4.08,
    0,
    '2024-10-15 09:05:00+00',
    '2024-10-15 09:05:00+00'
);

-- Payment for Order 2 (Processing)
INSERT INTO "Payment" (
    "id",
    "orderId",
    "customerId",
    "merchantId",
    "amount",
    "currency",
    "status",
    "paymentMethod",
    "stripePaymentIntent",
    "merchantPayout",
    "platformFee",
    "driverPayout",
    "refundAmount",
    "createdAt",
    "updatedAt"
) VALUES (
    'payment2_order2',
    'order2_jane_inprocess',
    'customer2_janesmith',
    'merchant2_freshpress',
    52.38,
    'USD',
    'SUCCEEDED',
    'CARD',
    'pi_0987654321fedcba',
    41.90,
    5.24,
    5.24,
    0,
    '2024-10-20 13:05:00+00',
    '2024-10-20 13:05:00+00'
);

-- Payment for Order 3 (Recent)
INSERT INTO "Payment" (
    "id",
    "orderId",
    "customerId",
    "merchantId",
    "amount",
    "currency",
    "status",
    "paymentMethod",
    "stripePaymentIntent",
    "merchantPayout",
    "platformFee",
    "driverPayout",
    "refundAmount",
    "createdAt",
    "updatedAt"
) VALUES (
    'payment3_order3',
    'order3_john_pending',
    'customer1_johndoe',
    'merchant1_sparkledry',
    50.40,
    'USD',
    'SUCCEEDED',
    'CARD',
    'pi_abcdef1234567890',
    40.32,
    5.04,
    5.04,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================
-- REVIEWS
-- ============================================

-- Review for Order 1 - Merchant
INSERT INTO "Review" (
    "id",
    "orderId",
    "customerId",
    "merchantId",
    "type",
    "rating",
    "comment",
    "isPublic",
    "createdAt",
    "updatedAt"
) VALUES (
    'review1_order1_merchant',
    'order1_john_delivered',
    'customer1_johndoe',
    'merchant1_sparkledry',
    'MERCHANT',
    5,
    'Excellent service! My dress shirts look brand new and the silk dress was handled perfectly. Will definitely use again.',
    true,
    '2024-10-17 15:00:00+00',
    '2024-10-17 15:00:00+00'
);

-- Review for Order 1 - Driver
INSERT INTO "Review" (
    "id",
    "orderId",
    "customerId",
    "driverId",
    "type",
    "rating",
    "comment",
    "isPublic",
    "createdAt",
    "updatedAt"
) VALUES (
    'review2_order1_driver',
    'order1_john_delivered',
    'customer1_johndoe',
    'driver1_mikejohnson',
    'DRIVER',
    5,
    'Mike was very professional and punctual. Great communication throughout the delivery.',
    true,
    '2024-10-17 15:05:00+00',
    '2024-10-17 15:05:00+00'
);

-- ============================================
-- DRIVER EARNINGS
-- ============================================

-- Earnings for Driver 1 (Order 1)
INSERT INTO "DriverEarning" (
    "id",
    "driverId",
    "orderId",
    "amount",
    "tip",
    "bonus",
    "surge",
    "platformFee",
    "netEarning",
    "paidOut",
    "paidOutAt",
    "createdAt"
) VALUES (
    'earning1_driver1_order1',
    'driver1_mikejohnson',
    'order1_john_delivered',
    5.00,
    5.00,
    0,
    0,
    0.50,
    9.50,
    true,
    '2024-10-20 00:00:00+00',
    '2024-10-17 14:45:00+00'
);

-- Earnings for Driver 2 (Order 2) - Not paid out yet
INSERT INTO "DriverEarning" (
    "id",
    "driverId",
    "orderId",
    "amount",
    "tip",
    "bonus",
    "surge",
    "platformFee",
    "netEarning",
    "paidOut",
    "createdAt"
) VALUES (
    'earning2_driver2_order2',
    'driver2_sarahwilliams',
    'order2_jane_inprocess',
    5.00,
    0,
    0,
    0,
    0.50,
    4.50,
    false,
    '2024-10-20 14:20:00+00'
);

-- ============================================
-- NOTIFICATIONS (Sample)
-- ============================================

-- Notification for John Doe - Order delivered
INSERT INTO "Notification" (
    "id",
    "userId",
    "type",
    "channel",
    "title",
    "message",
    "data",
    "isRead",
    "sentAt",
    "readAt"
) VALUES (
    'notif1_john_delivered',
    'user_customer1_johndoe',
    'ORDER_UPDATE',
    'PUSH',
    'Order Delivered',
    'Your order ORD-2024-001 has been delivered successfully!',
    '{"orderId": "order1_john_delivered", "orderNumber": "ORD-2024-001"}'::jsonb,
    true,
    '2024-10-17 14:45:00+00',
    '2024-10-17 14:50:00+00'
);

-- Notification for Jane Smith - Order in process
INSERT INTO "Notification" (
    "id",
    "userId",
    "type",
    "channel",
    "title",
    "message",
    "data",
    "isRead",
    "sentAt"
) VALUES (
    'notif2_jane_inprocess',
    'user_customer2_janesmith',
    'ORDER_UPDATE',
    'PUSH',
    'Order Being Processed',
    'Your order ORD-2024-002 is now being cleaned. We''ll notify you when it''s ready!',
    '{"orderId": "order2_jane_inprocess", "orderNumber": "ORD-2024-002"}'::jsonb,
    false,
    '2024-10-20 15:00:00+00'
);

-- Notification for Mike - New delivery assignment
INSERT INTO "Notification" (
    "id",
    "userId",
    "type",
    "channel",
    "title",
    "message",
    "data",
    "isRead",
    "sentAt",
    "readAt"
) VALUES (
    'notif3_mike_assignment',
    'user_driver1_mikejohnson',
    'DRIVER_ASSIGNMENT',
    'PUSH',
    'New Pickup Assignment',
    'You have been assigned to pickup order ORD-2024-001',
    '{"orderId": "order1_john_delivered", "orderNumber": "ORD-2024-001"}'::jsonb,
    true,
    '2024-10-15 09:30:00+00',
    '2024-10-15 09:31:00+00'
);

-- ============================================
-- ANALYTICS EVENTS (Sample)
-- ============================================

INSERT INTO "AnalyticsEvent" (
    "id",
    "userId",
    "eventType",
    "eventData",
    "metadata",
    "ipAddress",
    "userAgent",
    "createdAt"
) VALUES
(
    'event1_john_order_created',
    'user_customer1_johndoe',
    'ORDER_CREATED',
    '{"orderId": "order1_john_delivered", "orderNumber": "ORD-2024-001", "totalAmount": 40.73}'::jsonb,
    '{"platform": "mobile", "appVersion": "1.2.3"}'::jsonb,
    '192.168.1.100',
    'DryJets-Mobile/1.2.3 (iOS 17.0)',
    '2024-10-15 09:00:00+00'
),
(
    'event2_jane_search',
    'user_customer2_janesmith',
    'SEARCH_MERCHANT',
    '{"query": "laundromat near me", "resultsCount": 5}'::jsonb,
    '{"platform": "mobile", "appVersion": "1.2.3"}'::jsonb,
    '192.168.1.101',
    'DryJets-Mobile/1.2.3 (Android 14)',
    '2024-10-20 12:45:00+00'
);

-- ============================================
-- SEED DATA SUMMARY
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'DryJets Seed Data Inserted Successfully!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 6 Users (2 Customers, 2 Drivers, 2 Merchants)';
    RAISE NOTICE '  - 2 Customers';
    RAISE NOTICE '  - 3 Addresses';
    RAISE NOTICE '  - 2 Drivers';
    RAISE NOTICE '  - 2 Merchants';
    RAISE NOTICE '  - 2 Merchant Locations';
    RAISE NOTICE '  - 6 Services';
    RAISE NOTICE '  - 4 Equipment Items (3 IoT-enabled)';
    RAISE NOTICE '  - 3 Equipment Telemetry Records';
    RAISE NOTICE '  - 5 Telemetry Logs';
    RAISE NOTICE '  - 2 Maintenance Alerts';
    RAISE NOTICE '  - 3 Orders (various statuses)';
    RAISE NOTICE '  - 4 Order Items';
    RAISE NOTICE '  - 15 Order Status History Records';
    RAISE NOTICE '  - 3 Payments';
    RAISE NOTICE '  - 2 Reviews';
    RAISE NOTICE '  - 2 Driver Earnings';
    RAISE NOTICE '  - 3 Notifications';
    RAISE NOTICE '  - 2 Analytics Events';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Test Credentials (Password: password123):';
    RAISE NOTICE '  Customer 1: john.doe@example.com';
    RAISE NOTICE '  Customer 2: jane.smith@example.com';
    RAISE NOTICE '  Driver 1: driver.mike@example.com';
    RAISE NOTICE '  Driver 2: driver.sarah@example.com';
    RAISE NOTICE '  Merchant 1: owner@sparkledry.com';
    RAISE NOTICE '  Merchant 2: owner@freshpress.com';
    RAISE NOTICE '==================================================';
END $$;
