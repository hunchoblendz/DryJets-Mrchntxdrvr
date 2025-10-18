import { PrismaClient } from '../../../node_modules/.prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  // Equipment tables (skip if not exist)
  try {
    await prisma.equipmentTelemetryLog.deleteMany();
  } catch (e) {
    console.log('  - Skipping equipmentTelemetryLog (table may not exist yet)');
  }
  try {
    await prisma.maintenanceAlert.deleteMany();
  } catch (e) {
    console.log('  - Skipping maintenanceAlert (table may not exist yet)');
  }
  try {
    await prisma.equipmentTelemetry.deleteMany();
  } catch (e) {
    console.log('  - Skipping equipmentTelemetry (table may not exist yet)');
  }
  try {
    await prisma.equipment.deleteMany();
  } catch (e) {
    console.log('  - Skipping equipment (table may not exist yet)');
  }
  await prisma.service.deleteMany();
  await prisma.merchantLocation.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // Create Customers
  // ============================================
  console.log('👤 Creating customers...');

  const customer1User = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      phone: '+14155551234',
      passwordHash: hashedPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      userId: customer1User.id,
      firstName: 'John',
      lastName: 'Doe',
      loyaltyPoints: 120,
      preferredFoldOption: 'HANGER',
      preferredStarchLevel: 'LIGHT',
    },
  });

  const customer2User = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      phone: '+14155555678',
      passwordHash: hashedPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      userId: customer2User.id,
      firstName: 'Jane',
      lastName: 'Smith',
      loyaltyPoints: 350,
      preferredFoldOption: 'FOLD',
    },
  });

  console.log(`✅ Created ${2} customers`);

  // ============================================
  // Create Addresses for Customers
  // ============================================
  console.log('📍 Creating addresses...');

  const address1 = await prisma.address.create({
    data: {
      customerId: customer1.id,
      label: 'Home',
      street: '123 Market Street',
      apartment: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      latitude: 37.7749,
      longitude: -122.4194,
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      customerId: customer1.id,
      label: 'Office',
      street: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
      latitude: 37.7849,
      longitude: -122.4094,
      isDefault: false,
    },
  });

  const address3 = await prisma.address.create({
    data: {
      customerId: customer2.id,
      label: 'Home',
      street: '789 Valencia Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      country: 'USA',
      latitude: 37.7599,
      longitude: -122.4214,
      isDefault: true,
    },
  });

  console.log(`✅ Created ${3} addresses`);

  // ============================================
  // Create Drivers
  // ============================================
  console.log('🚗 Creating drivers...');

  const driver1User = await prisma.user.create({
    data: {
      email: 'driver.mike@example.com',
      phone: '+14155559876',
      passwordHash: hashedPassword,
      role: 'DRIVER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      userId: driver1User.id,
      firstName: 'Mike',
      lastName: 'Johnson',
      status: 'AVAILABLE',
      vehicleType: 'CAR',
      vehicleMake: 'Toyota',
      vehicleModel: 'Prius',
      vehiclePlate: 'ABC123',
      vehicleColor: 'Blue',
      licenseNumber: 'DL123456789',
      licenseExpiry: new Date('2026-03-10'),
      backgroundCheckStatus: 'APPROVED',
      backgroundCheckDate: new Date('2024-01-15'),
      insuranceVerified: true,
      rating: 4.8,
      ratingCount: 245,
      totalTrips: 245,
      totalEarnings: 8500.50,
    },
  });

  const driver2User = await prisma.user.create({
    data: {
      email: 'driver.sarah@example.com',
      phone: '+14155557890',
      passwordHash: hashedPassword,
      role: 'DRIVER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      userId: driver2User.id,
      firstName: 'Sarah',
      lastName: 'Williams',
      status: 'AVAILABLE',
      vehicleType: 'CAR',
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehiclePlate: 'XYZ789',
      vehicleColor: 'White',
      licenseNumber: 'DL987654321',
      licenseExpiry: new Date('2027-11-25'),
      backgroundCheckStatus: 'APPROVED',
      backgroundCheckDate: new Date('2024-02-20'),
      insuranceVerified: true,
      rating: 4.9,
      ratingCount: 189,
      totalTrips: 189,
      totalEarnings: 6200.75,
    },
  });

  console.log(`✅ Created ${2} drivers`);

  // ============================================
  // Create Merchants
  // ============================================
  console.log('🏪 Creating merchants...');

  const merchant1User = await prisma.user.create({
    data: {
      email: 'owner@sparkledry.com',
      phone: '+14155552345',
      passwordHash: hashedPassword,
      role: 'MERCHANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const merchant1 = await prisma.merchant.create({
    data: {
      userId: merchant1User.id,
      businessName: 'Sparkle Dry Cleaners',
      businessType: 'DRY_CLEANER',
      tier: 'PRO',
      taxId: '12-3456789',
      rating: 4.7,
      ratingCount: 152,
      totalOrders: 450,
      totalRevenue: 28500.75,
      verified: true,
      stripeOnboarded: false,
    },
  });

  const merchantLocation1 = await prisma.merchantLocation.create({
    data: {
      merchantId: merchant1.id,
      name: 'Downtown Location',
      address: '321 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      latitude: 37.7899,
      longitude: -122.3999,
      phone: '+14155552345',
      email: 'downtown@sparkledry.com',
      isMain: true,
      isActive: true,
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '00:00', close: '00:00' },
      },
    },
  });

  const merchant2User = await prisma.user.create({
    data: {
      email: 'owner@freshpress.com',
      phone: '+14155553456',
      passwordHash: hashedPassword,
      role: 'MERCHANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      userId: merchant2User.id,
      businessName: 'Fresh Press Laundromat',
      businessType: 'LAUNDROMAT',
      tier: 'BASIC',
      taxId: '98-7654321',
      rating: 4.5,
      ratingCount: 89,
      totalOrders: 320,
      totalRevenue: 15800.50,
      verified: true,
      stripeOnboarded: false,
    },
  });

  const merchantLocation2 = await prisma.merchantLocation.create({
    data: {
      merchantId: merchant2.id,
      name: 'Main Location',
      address: '567 Folsom Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'USA',
      latitude: 37.7799,
      longitude: -122.3899,
      phone: '+14155553456',
      email: 'info@freshpress.com',
      isMain: true,
      isActive: true,
      operatingHours: {
        monday: { open: '07:00', close: '22:00' },
        tuesday: { open: '07:00', close: '22:00' },
        wednesday: { open: '07:00', close: '22:00' },
        thursday: { open: '07:00', close: '22:00' },
        friday: { open: '07:00', close: '22:00' },
        saturday: { open: '08:00', close: '22:00' },
        sunday: { open: '08:00', close: '20:00' },
      },
    },
  });

  console.log(`✅ Created ${2} merchants with locations`);

  // ============================================
  // Create Services
  // ============================================
  console.log('🧺 Creating services...');

  // Sparkle Dry Cleaners services
  const service1 = await prisma.service.create({
    data: {
      merchantId: merchant1.id,
      name: 'Dry Cleaning - Shirt',
      description: 'Professional dry cleaning for dress shirts',
      type: 'DRY_CLEANING',
      pricingModel: 'PER_ITEM',
      basePrice: 5.99,
      estimatedTime: 2880, // 2 days in minutes
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      merchantId: merchant1.id,
      name: 'Dry Cleaning - Suit',
      description: 'Premium dry cleaning for suits (jacket + pants)',
      type: 'DRY_CLEANING',
      pricingModel: 'PER_ITEM',
      basePrice: 18.99,
      estimatedTime: 2880, // 2 days in minutes
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      merchantId: merchant1.id,
      name: 'Dry Cleaning - Dress',
      description: 'Expert dry cleaning for dresses',
      type: 'DRY_CLEANING',
      pricingModel: 'PER_ITEM',
      basePrice: 14.99,
      estimatedTime: 2880, // 2 days in minutes
      isActive: true,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      merchantId: merchant1.id,
      name: 'Alterations',
      description: 'Professional tailoring and alterations',
      type: 'ALTERATIONS',
      pricingModel: 'PER_ITEM',
      basePrice: 25.00,
      estimatedTime: 7200, // 5 days in minutes
      isActive: true,
    },
  });

  // Fresh Press Laundromat services
  const service5 = await prisma.service.create({
    data: {
      merchantId: merchant2.id,
      name: 'Wash & Fold',
      description: 'Full-service wash, dry, and fold',
      type: 'WASH_AND_FOLD',
      pricingModel: 'PER_POUND',
      basePrice: 1.99,
      estimatedTime: 1440, // 1 day in minutes
      isActive: true,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      merchantId: merchant2.id,
      name: 'Comforter Cleaning',
      description: 'Deep cleaning for comforters and bedding',
      type: 'COMFORTER',
      pricingModel: 'PER_ITEM',
      basePrice: 35.00,
      estimatedTime: 4320, // 3 days in minutes
      isActive: true,
    },
  });

  console.log(`✅ Created ${6} services`);

  // ============================================
  // Create Equipment (for IoT/ML features)
  // ============================================
  console.log('🔧 Creating equipment...');

  await prisma.equipment.create({
    data: {
      merchantId: merchant1.id,
      name: 'Industrial Washer #1',
      type: 'WASHER',
      manufacturer: 'Electrolux',
      model: 'WH6-33',
      serialNumber: 'ELX-WASH-001',
      purchaseDate: new Date('2020-03-15'),
      lastMaintenanceDate: new Date('2024-09-01'),
      nextMaintenanceDate: new Date('2024-12-01'),
      status: 'OPERATIONAL',
      isIotEnabled: true,
      iotDeviceId: 'ESP32-WASH-001',
    },
  });

  await prisma.equipment.create({
    data: {
      merchantId: merchant1.id,
      name: 'Commercial Dryer #1',
      type: 'DRYER',
      manufacturer: 'Speed Queen',
      model: 'SDESXRGS173TW01',
      serialNumber: 'SQ-DRY-001',
      purchaseDate: new Date('2020-03-15'),
      lastMaintenanceDate: new Date('2024-08-15'),
      nextMaintenanceDate: new Date('2024-11-15'),
      status: 'OPERATIONAL',
      isIotEnabled: true,
      iotDeviceId: 'ESP32-DRY-001',
    },
  });

  await prisma.equipment.create({
    data: {
      merchantId: merchant1.id,
      name: 'Pressing Machine #1',
      type: 'PRESSER',
      manufacturer: 'Sankosha',
      model: 'DF-6100',
      serialNumber: 'SNK-PRESS-001',
      purchaseDate: new Date('2021-06-10'),
      lastMaintenanceDate: new Date('2024-07-20'),
      nextMaintenanceDate: new Date('2024-10-20'),
      status: 'OPERATIONAL',
      isIotEnabled: true,
      iotDeviceId: 'ESP32-PRESS-001',
    },
  });

  await prisma.equipment.create({
    data: {
      merchantId: merchant2.id,
      name: 'Industrial Washer #2',
      type: 'WASHER',
      manufacturer: 'Maytag',
      model: 'MHN33PDAWW',
      serialNumber: 'MAY-WASH-002',
      purchaseDate: new Date('2019-11-20'),
      lastMaintenanceDate: new Date('2024-08-01'),
      nextMaintenanceDate: new Date('2024-11-01'),
      status: 'OPERATIONAL',
      isIotEnabled: false,
    },
  });

  console.log(`✅ Created ${4} equipment items`);

  // ============================================
  // Create Sample Order
  // ============================================
  console.log('📦 Creating sample order...');

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-001',
      customerId: customer1.id,
      merchantId: merchant1.id,
      merchantLocationId: merchantLocation1.id,
      pickupDriverId: driver1.id,
      deliveryDriverId: driver1.id,
      type: 'ON_DEMAND',
      status: 'DELIVERED',
      subtotal: 24.98,
      taxAmount: 2.25,
      serviceFee: 3.50,
      deliveryFee: 5.00,
      tip: 5.00,
      discount: 0,
      totalAmount: 40.73,
      pickupAddressId: address1.id,
      deliveryAddressId: address1.id,
      scheduledPickupAt: new Date('2024-10-15T10:00:00Z'),
      scheduledDeliveryAt: new Date('2024-10-17T15:00:00Z'),
      actualPickupAt: new Date('2024-10-15T10:15:00Z'),
      actualDeliveryAt: new Date('2024-10-17T14:45:00Z'),
      specialInstructions: 'Please handle with care - silk items',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        serviceId: service1.id,
        itemName: 'Dress Shirt',
        quantity: 2,
        unitPrice: 5.99,
        totalPrice: 11.98,
        specialInstructions: 'Light starch on collars',
      },
      {
        orderId: order1.id,
        serviceId: service3.id,
        itemName: 'Evening Dress',
        quantity: 1,
        unitPrice: 14.99,
        totalPrice: 14.99,
      },
    ],
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order1.id, status: 'PENDING_PAYMENT', createdAt: new Date('2024-10-15T09:00:00Z') },
      { orderId: order1.id, status: 'PAYMENT_CONFIRMED', createdAt: new Date('2024-10-15T09:05:00Z') },
      { orderId: order1.id, status: 'DRIVER_ASSIGNED', createdAt: new Date('2024-10-15T09:30:00Z') },
      { orderId: order1.id, status: 'PICKED_UP', createdAt: new Date('2024-10-15T10:15:00Z') },
      { orderId: order1.id, status: 'IN_PROCESS', createdAt: new Date('2024-10-15T11:00:00Z') },
      { orderId: order1.id, status: 'READY_FOR_DELIVERY', createdAt: new Date('2024-10-17T12:00:00Z') },
      { orderId: order1.id, status: 'OUT_FOR_DELIVERY', createdAt: new Date('2024-10-17T13:00:00Z') },
      { orderId: order1.id, status: 'DELIVERED', createdAt: new Date('2024-10-17T14:45:00Z') },
    ],
  });

  console.log(`✅ Created 1 sample order with items and status history`);

  // ============================================
  // Summary
  // ============================================
  console.log('\n✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${2} Customers`);
  console.log(`   - ${3} Addresses`);
  console.log(`   - ${2} Drivers`);
  console.log(`   - ${2} Merchants`);
  console.log(`   - ${2} Merchant Locations`);
  console.log(`   - ${6} Services`);
  console.log(`   - ${4} Equipment Items (3 IoT-enabled)`);
  console.log(`   - ${1} Sample Order (with items and status history)`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Customer 1: john.doe@example.com / password123');
  console.log('   Customer 2: jane.smith@example.com / password123');
  console.log('   Driver 1: driver.mike@example.com / password123');
  console.log('   Driver 2: driver.sarah@example.com / password123');
  console.log('   Merchant 1: owner@sparkledry.com / password123');
  console.log('   Merchant 2: owner@freshpress.com / password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
