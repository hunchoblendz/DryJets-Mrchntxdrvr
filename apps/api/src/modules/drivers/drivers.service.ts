import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import {
  CreateDriverDto,
  UpdateDriverDto,
  UpdateDriverLocationDto,
  DriverQueryDto,
  FindNearbyDriversDto,
} from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  // ============================================
  // DRIVER CRUD OPERATIONS
  // ============================================

  async createDriver(userId: string, createDriverDto: CreateDriverDto) {
    // Check if driver already exists for this user
    const existingDriver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (existingDriver) {
      throw new ConflictException('Driver profile already exists for this user');
    }

    const driver = await this.prisma.driver.create({
      data: {
        userId,
        firstName: createDriverDto.firstName,
        lastName: createDriverDto.lastName,
        status: 'OFFLINE',
        vehicleType: createDriverDto.vehicleType,
        vehicleMake: createDriverDto.vehicleMake,
        vehicleModel: createDriverDto.vehicleModel,
        vehiclePlate: createDriverDto.vehiclePlate,
        vehicleColor: createDriverDto.vehicleColor,
        licenseNumber: createDriverDto.licenseNumber,
        licenseExpiry: new Date(createDriverDto.licenseExpiry),
        backgroundCheckStatus: 'PENDING',
        insuranceVerified: false,
        totalEarnings: 0,
        totalTrips: 0,
        rating: 0,
        ratingCount: 0,
      } as any,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    return driver;
  }

  async findDrivers(query: DriverQueryDto) {
    const { page = 1, limit = 20, status, vehicleType, backgroundCheckStatus, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    if (backgroundCheckStatus) {
      where.backgroundCheckStatus = backgroundCheckStatus;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { vehiclePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              status: true,
            },
          },
          _count: {
            select: {
              pickups: true,
              deliveries: true,
              reviews: true,
            },
          },
        },
        orderBy: [{ status: 'asc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      data: drivers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDriverById(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true,
          },
        },
        pickups: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        deliveries: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            pickups: true,
            deliveries: true,
            reviews: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async findDriverByUserId(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        pickups: {
          where: {
            status: {
              notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        deliveries: {
          where: {
            status: {
              notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            pickups: true,
            deliveries: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver not found for user ${userId}`);
    }

    return driver;
  }

  async updateDriver(id: string, updateDriverDto: UpdateDriverDto) {
    await this.findDriverById(id);

    const updateData: any = { ...updateDriverDto };

    if (updateDriverDto.licenseExpiry) {
      updateData.licenseExpiry = new Date(updateDriverDto.licenseExpiry);
    }

    const driver = await this.prisma.driver.update({
      where: { id },
      data: updateData as any,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    return driver;
  }

  async deleteDriver(id: string) {
    await this.findDriverById(id);

    // Check if driver has active orders
    const activeOrders = await this.prisma.order.count({
      where: {
        OR: [{ pickupDriverId: id }, { deliveryDriverId: id }],
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
        },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        'Cannot delete driver with active orders. Please complete or reassign all orders first.',
      );
    }

    await this.prisma.driver.delete({
      where: { id },
    });

    return { message: 'Driver deleted successfully' };
  }

  // ============================================
  // LOCATION OPERATIONS
  // ============================================

  async updateDriverLocation(id: string, updateLocationDto: UpdateDriverLocationDto) {
    await this.findDriverById(id);

    const driver = await this.prisma.driver.update({
      where: { id },
      data: {
        currentLatitude: updateLocationDto.latitude,
        currentLongitude: updateLocationDto.longitude,
        ...(updateLocationDto.status && { status: updateLocationDto.status }),
      } as any,
    });

    return driver;
  }

  async findNearbyDrivers(findNearbyDto: FindNearbyDriversDto) {
    const { latitude, longitude, radiusMeters = 5000, limit = 10, vehicleType } = findNearbyDto;

    // Use raw SQL for geospatial query
    // Haversine formula to calculate distance
    const drivers = await this.prisma.$queryRaw<any[]>`
      SELECT
        d.*,
        (
          6371000 * acos(
            cos(radians(${latitude})) *
            cos(radians(d."currentLatitude")) *
            cos(radians(d."currentLongitude") - radians(${longitude})) +
            sin(radians(${latitude})) *
            sin(radians(d."currentLatitude"))
          )
        ) as distance
      FROM "Driver" d
      WHERE
        d.status = 'AVAILABLE'
        AND d."backgroundCheckStatus" = 'APPROVED'
        AND d."currentLatitude" IS NOT NULL
        AND d."currentLongitude" IS NOT NULL
        ${vehicleType ? `AND d."vehicleType" = '${vehicleType}'` : ''}
      HAVING
        (
          6371000 * acos(
            cos(radians(${latitude})) *
            cos(radians(d."currentLatitude")) *
            cos(radians(d."currentLongitude") - radians(${longitude})) +
            sin(radians(${latitude})) *
            sin(radians(d."currentLatitude"))
          )
        ) <= ${radiusMeters}
      ORDER BY distance ASC
      LIMIT ${limit}
    `;

    return drivers.map((driver) => ({
      ...driver,
      distance: Math.round(driver.distance), // Round to nearest meter
    }));
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getDriverStats(id: string) {
    await this.findDriverById(id);

    const [pickupStats, deliveryStats, todayOrders, weekOrders] = await Promise.all([
      this.prisma.order.aggregate({
        where: { pickupDriverId: id },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: { deliveryDriverId: id },
        _count: true,
      }),
      this.prisma.order.count({
        where: {
          OR: [{ pickupDriverId: id }, { deliveryDriverId: id }],
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.order.count({
        where: {
          OR: [{ pickupDriverId: id }, { deliveryDriverId: id }],
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        totalEarnings: true,
        totalTrips: true,
        rating: true,
        ratingCount: true,
      },
    });

    return {
      totalPickups: pickupStats._count,
      totalDeliveries: deliveryStats._count,
      totalTrips: driver!.totalTrips,
      totalEarnings: driver!.totalEarnings,
      rating: driver!.rating,
      ratingCount: driver!.ratingCount,
      todayOrders,
      weekOrders,
    };
  }

  // ============================================
  // ORDER ASSIGNMENT
  // ============================================

  async getActiveOrders(driverId: string) {
    await this.findDriverById(driverId);

    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
        },
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
        merchant: {
          select: {
            businessName: true,
          },
        },
        merchantLocation: {
          select: {
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        pickupAddress: true,
        deliveryAddress: true,
      },
      orderBy: { scheduledPickupAt: 'asc' },
    });

    return orders;
  }

  // ============================================
  // DRIVER AVAILABILITY
  // ============================================

  async updateAvailability(driverId: string, isAvailable: boolean) {
    const driver = await this.findDriverById(driverId);

    // Check if driver has active orders before going offline
    if (!isAvailable) {
      const activeOrders = await this.prisma.order.count({
        where: {
          OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
          status: {
            notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
          },
        },
      });

      if (activeOrders > 0) {
        throw new BadRequestException(
          'Cannot go offline with active orders. Please complete all deliveries first.',
        );
      }
    }

    const newStatus = isAvailable ? 'AVAILABLE' : 'OFFLINE';

    return this.prisma.driver.update({
      where: { id: driverId },
      data: {
        status: newStatus,
        lastActiveAt: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  // ============================================
  // ORDER WORKFLOW
  // ============================================

  async acceptOrder(driverId: string, orderId: string, notes?: string) {
    const driver = await this.findDriverById(driverId);

    // Verify driver is available
    if (driver.status !== 'AVAILABLE' && driver.status !== 'BUSY') {
      throw new BadRequestException('Driver must be available to accept orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { merchant: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order is in correct state for assignment
    const validStatuses = ['PENDING_ASSIGNMENT', 'CONFIRMED', 'READY_FOR_PICKUP'];
    if (!validStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be accepted in ${order.status} status`,
      );
    }

    // Check if order already has a driver
    if (order.pickupDriverId && order.pickupDriverId !== driverId) {
      throw new BadRequestException('Order already assigned to another driver');
    }

    // Update order with driver assignment
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        pickupDriverId: driverId,
        deliveryDriverId: driverId, // In simple model, same driver does pickup & delivery
        status: 'ASSIGNED_TO_DRIVER',
      },
      include: {
        customer: true,
        merchant: true,
        pickupAddress: true,
        deliveryAddress: true,
        merchantLocation: true,
      },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'ASSIGNED_TO_DRIVER',
        notes: notes || `Order accepted by driver ${driver.firstName} ${driver.lastName}`,
      },
    });

    // Update driver status to BUSY
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'BUSY' },
    });

    return updatedOrder;
  }

  async markPickedUp(driverId: string, orderId: string, notes?: string) {
    const driver = await this.findDriverById(driverId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify driver is assigned to this order
    if (order.pickupDriverId !== driverId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    // Verify order status
    if (order.status !== 'ASSIGNED_TO_DRIVER' && order.status !== 'READY_FOR_PICKUP') {
      throw new BadRequestException(
        `Order cannot be picked up in ${order.status} status`,
      );
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PICKED_UP',
        actualPickupAt: new Date(),
      },
      include: {
        customer: true,
        merchant: true,
        pickupAddress: true,
        deliveryAddress: true,
      },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'PICKED_UP',
        notes: notes || 'Order picked up from merchant',
      },
    });

    return updatedOrder;
  }

  async markDelivered(driverId: string, orderId: string, notes?: string) {
    const driver = await this.findDriverById(driverId);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        merchant: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify driver is assigned to this order
    if (order.deliveryDriverId !== driverId) {
      throw new BadRequestException('You are not assigned to this order');
    }

    // Verify order status
    if (order.status !== 'PICKED_UP' && order.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException(
        `Order cannot be delivered in ${order.status} status`,
      );
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        actualDeliveryAt: new Date(),
      },
      include: {
        customer: true,
        merchant: true,
        pickupAddress: true,
        deliveryAddress: true,
      },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'DELIVERED',
        notes: notes || 'Order delivered to customer',
      },
    });

    // Calculate and record earnings
    await this.recordDriverEarnings(driverId, orderId, order);

    // Update driver stats
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        totalTrips: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });

    // Check if driver has more active orders, if not set to AVAILABLE
    const remainingOrders = await this.prisma.order.count({
      where: {
        OR: [{ pickupDriverId: driverId }, { deliveryDriverId: driverId }],
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
        },
      },
    });

    if (remainingOrders === 0) {
      await this.prisma.driver.update({
        where: { id: driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updatedOrder;
  }

  // ============================================
  // EARNINGS
  // ============================================

  async recordDriverEarnings(driverId: string, orderId: string, order: any) {
    // Simple earnings calculation:
    // Base delivery fee + distance-based fee
    const baseDeliveryFee = 5.0; // $5 base
    const perKmRate = 1.5; // $1.50 per km

    // For simplicity, assume 5km average distance if not calculated
    const estimatedDistance = 5;
    const deliveryFee = baseDeliveryFee + estimatedDistance * perKmRate;

    // Platform takes 20% commission
    const platformFee = deliveryFee * 0.2;
    const driverEarning = deliveryFee - platformFee;

    // Create earning record
    await this.prisma.driverEarning.create({
      data: {
        driverId,
        orderId,
        amount: driverEarning,
        type: 'DELIVERY',
        status: 'PENDING',
        description: `Delivery for order ${order.orderNumber}`,
      },
    });

    // Update driver total earnings
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        totalEarnings: { increment: driverEarning },
      },
    });

    return {
      deliveryFee,
      platformFee,
      driverEarning,
    };
  }

  async getDriverEarnings(
    driverId: string,
    params?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    await this.findDriverById(driverId);

    const { status, startDate, endDate, page = 1, limit = 50 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = { driverId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [earnings, total, summary] = await Promise.all([
      this.prisma.driverEarning.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driverEarning.count({ where }),
      this.prisma.driverEarning.groupBy({
        by: ['status'],
        where: { driverId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalEarnings =
      summary.find((s) => s.status === 'PAID')?._sum.amount || 0;
    const pendingEarnings =
      summary.find((s) => s.status === 'PENDING')?._sum.amount || 0;
    const totalTrips = summary.reduce((sum, s) => sum + s._count, 0);

    return {
      data: earnings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalEarnings,
        pendingEarnings,
        totalTrips,
      },
    };
  }

  // ============================================
  // INTELLIGENT DRIVER ASSIGNMENT
  // ============================================

  /**
   * Automatically assign the best available driver to an order
   * Considers: distance, availability, rating, current workload
   */
  async assignDriverToOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        merchantLocation: true,
        pickupAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order already has a driver
    if (order.pickupDriverId) {
      throw new BadRequestException('Order already has a driver assigned');
    }

    // Get pickup location coordinates
    const pickupLat = order.merchantLocation?.latitude || order.pickupAddress?.latitude;
    const pickupLng = order.merchantLocation?.longitude || order.pickupAddress?.longitude;

    if (!pickupLat || !pickupLng) {
      throw new BadRequestException('Order location coordinates not available');
    }

    // Find available drivers
    const availableDrivers = await this.prisma.driver.findMany({
      where: {
        status: { in: ['AVAILABLE', 'BUSY'] },
        backgroundCheckStatus: 'APPROVED',
        currentLatitude: { not: null },
        currentLongitude: { not: null },
      },
      include: {
        pickups: {
          where: {
            status: {
              notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
            },
          },
        },
        deliveries: {
          where: {
            status: {
              notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
            },
          },
        },
      },
    });

    if (availableDrivers.length === 0) {
      throw new BadRequestException('No available drivers found');
    }

    // Score each driver based on multiple factors
    const scoredDrivers = availableDrivers.map((driver) => {
      // Calculate distance (Haversine formula)
      const distance = this.calculateDistance(
        pickupLat,
        pickupLng,
        driver.currentLatitude!,
        driver.currentLongitude!,
      );

      // Count active orders
      const activeOrders = driver.pickups.length + driver.deliveries.length;

      // Calculate scores (lower is better)
      const distanceScore = distance; // Weight: 1.0
      const workloadScore = activeOrders * 5; // Each active order = 5km penalty
      const ratingBonus = (5 - (driver.rating || 3)) * 2; // Higher rating = lower score

      const totalScore = distanceScore + workloadScore + ratingBonus;

      return {
        driver,
        distance,
        activeOrders,
        rating: driver.rating || 0,
        totalScore,
      };
    });

    // Sort by score (ascending - lower is better)
    scoredDrivers.sort((a, b) => a.totalScore - b.totalScore);

    // Assign to best driver
    const bestDriver = scoredDrivers[0].driver;

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        pickupDriverId: bestDriver.id,
        deliveryDriverId: bestDriver.id,
        status: 'ASSIGNED_TO_DRIVER',
      },
      include: {
        customer: true,
        merchant: true,
        pickupAddress: true,
        deliveryAddress: true,
        merchantLocation: true,
      },
    });

    // Create status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'ASSIGNED_TO_DRIVER',
        notes: `Auto-assigned to driver ${bestDriver.firstName} ${bestDriver.lastName} (${scoredDrivers[0].distance.toFixed(1)}km away)`,
      },
    });

    // Update driver status to BUSY if not already
    if (bestDriver.status === 'AVAILABLE') {
      await this.prisma.driver.update({
        where: { id: bestDriver.id },
        data: { status: 'BUSY' },
      });
    }

    // Emit real-time driver assigned event
    this.eventsGateway.emitDriverAssigned(updatedOrder, {
      id: bestDriver.id,
      name: `${bestDriver.firstName} ${bestDriver.lastName}`,
      phone: bestDriver.phone,
      rating: bestDriver.rating,
      vehicleType: bestDriver.vehicleType,
    });

    return {
      order: updatedOrder,
      assignedDriver: {
        id: bestDriver.id,
        firstName: bestDriver.firstName,
        lastName: bestDriver.lastName,
        distance: scoredDrivers[0].distance,
        rating: bestDriver.rating,
      },
      alternativeDrivers: scoredDrivers.slice(1, 4).map((sd) => ({
        id: sd.driver.id,
        firstName: sd.driver.firstName,
        lastName: sd.driver.lastName,
        distance: sd.distance,
        rating: sd.rating,
        activeOrders: sd.activeOrders,
      })),
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find available orders for a driver to accept
   * Returns orders sorted by distance from driver's current location
   */
  async findAvailableOrdersForDriver(driverId: string, radiusKm: number = 10) {
    const driver = await this.findDriverById(driverId);

    if (!driver.currentLatitude || !driver.currentLongitude) {
      throw new BadRequestException('Driver location not available');
    }

    // Find orders that need drivers
    const orders = await this.prisma.order.findMany({
      where: {
        pickupDriverId: null,
        status: {
          in: ['CONFIRMED', 'READY_FOR_PICKUP', 'PENDING_ASSIGNMENT'],
        },
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        merchant: {
          select: {
            businessName: true,
          },
        },
        merchantLocation: {
          select: {
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        pickupAddress: true,
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate distance and filter by radius
    const ordersWithDistance = orders
      .map((order) => {
        const pickupLat =
          order.merchantLocation?.latitude || order.pickupAddress?.latitude;
        const pickupLng =
          order.merchantLocation?.longitude || order.pickupAddress?.longitude;

        if (!pickupLat || !pickupLng) {
          return null;
        }

        const distance = this.calculateDistance(
          driver.currentLatitude!,
          driver.currentLongitude!,
          pickupLat,
          pickupLng,
        );

        return {
          ...order,
          distanceKm: distance,
        };
      })
      .filter((order) => order !== null && order.distanceKm <= radiusKm)
      .sort((a, b) => a!.distanceKm - b!.distanceKm);

    return ordersWithDistance;
  }
}
