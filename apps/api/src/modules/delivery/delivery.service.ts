import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  UpdateDriverLocationDto,
  CalculateETADto,
  AssignDriverDto,
  DeliveryTrackingDto,
  ETAResponseDto,
} from './dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get real-time tracking info for an order
   */
  async getOrderTracking(orderId: string): Promise<DeliveryTrackingDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        merchant: {
          select: {
            businessName: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Calculate ETA if driver is assigned and en route
    let eta: ETAResponseDto | null = null;
    if (order.driver && order.driver.currentLatitude && order.driver.currentLongitude) {
      const destination = this.getDestinationForStatus(order);
      if (destination) {
        eta = await this.calculateETA({
          originLat: Number(order.driver.currentLatitude),
          originLng: Number(order.driver.currentLongitude),
          destLat: destination.lat,
          destLng: destination.lng,
        });
      }
    }

    return {
      orderId: order.id.toString(),
      shortCode: order.shortCode || `DJ-${order.id}`,
      status: order.status,
      pickup: {
        address: order.merchant?.address || 'Unknown',
        lat: Number(order.merchant?.latitude) || 0,
        lng: Number(order.merchant?.longitude) || 0,
        name: order.merchant?.businessName || 'Merchant',
      },
      dropoff: {
        address: order.deliveryAddress || 'Unknown',
        lat: Number(order.deliveryLatitude) || 0,
        lng: Number(order.deliveryLongitude) || 0,
        name: `${order.customer?.user?.firstName || ''} ${order.customer?.user?.lastName || ''}`.trim() || 'Customer',
      },
      driver: order.driver
        ? {
            id: order.driver.id,
            name: `${order.driver.user?.firstName || ''} ${order.driver.user?.lastName || ''}`.trim(),
            phone: order.driver.user?.phone || undefined,
            currentLocation: order.driver.currentLatitude && order.driver.currentLongitude
              ? {
                  lat: Number(order.driver.currentLatitude),
                  lng: Number(order.driver.currentLongitude),
                }
              : null,
            lastLocationUpdate: order.driver.lastLocationUpdate || undefined,
          }
        : null,
      eta,
      timeline: await this.getOrderTimeline(order.id.toString()),
    };
  }

  /**
   * Update driver location
   */
  async updateDriverLocation(
    driverId: string,
    dto: UpdateDriverLocationDto,
  ): Promise<{ success: boolean }> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException(`Driver ${driverId} not found`);
    }

    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLatitude: dto.lat,
        currentLongitude: dto.lng,
        lastLocationUpdate: new Date(),
      },
    });

    // Optional: Emit WebSocket event for real-time updates
    // this.eventsGateway.emitDriverLocationUpdate(driverId, dto);

    return { success: true };
  }

  /**
   * Get driver's current location
   */
  async getDriverLocation(
    driverId: string,
  ): Promise<{ lat: number; lng: number; lastUpdate: Date } | null> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        currentLatitude: true,
        currentLongitude: true,
        lastLocationUpdate: true,
      },
    });

    if (!driver || !driver.currentLatitude || !driver.currentLongitude) {
      return null;
    }

    return {
      lat: Number(driver.currentLatitude),
      lng: Number(driver.currentLongitude),
      lastUpdate: driver.lastLocationUpdate || new Date(),
    };
  }

  /**
   * Calculate ETA using Haversine formula (fallback when Google Maps unavailable)
   */
  async calculateETA(dto: CalculateETADto): Promise<ETAResponseDto> {
    // Haversine formula for straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(dto.destLat - dto.originLat);
    const dLng = this.toRad(dto.destLng - dto.originLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(dto.originLat)) *
        Math.cos(this.toRad(dto.destLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Estimate time based on average driving speed (30 km/h in urban areas)
    const averageSpeed = 30; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    // Add buffer for traffic (20%)
    const adjustedMinutes = Math.ceil(timeInMinutes * 1.2);

    return {
      minutes: adjustedMinutes,
      distance: `${distance.toFixed(1)} km`,
      distanceMeters: Math.round(distance * 1000),
      estimatedArrival: new Date(Date.now() + adjustedMinutes * 60 * 1000),
    };
  }

  /**
   * Assign a driver to an order
   */
  async assignDriver(orderId: string, dto: AssignDriverDto): Promise<DeliveryTrackingDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });

    if (!driver) {
      throw new NotFoundException(`Driver ${dto.driverId} not found`);
    }

    if (!driver.isAvailable) {
      throw new BadRequestException('Driver is not available');
    }

    // Update order with assigned driver
    await this.prisma.order.update({
      where: { id: BigInt(orderId) },
      data: {
        driverId: dto.driverId,
        status: 'ASSIGNED',
      },
    });

    // Mark driver as busy
    await this.prisma.driver.update({
      where: { id: dto.driverId },
      data: { isAvailable: false },
    });

    // Log timeline event
    await this.addTimelineEvent(orderId, 'ASSIGNED', 'Driver assigned to order');

    return this.getOrderTracking(orderId);
  }

  /**
   * Update order delivery status
   */
  async updateDeliveryStatus(
    orderId: string,
    status: string,
    note?: string,
  ): Promise<DeliveryTrackingDto> {
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: BigInt(orderId) },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    });

    // Log timeline event
    await this.addTimelineEvent(orderId, status, note);

    // If delivered, mark driver as available
    if (status === 'DELIVERED' && order.driverId) {
      await this.prisma.driver.update({
        where: { id: order.driverId },
        data: { isAvailable: true },
      });
    }

    return this.getOrderTracking(orderId);
  }

  /**
   * Get available drivers near a location
   */
  async getAvailableDrivers(lat: number, lng: number, radiusKm: number = 10) {
    const drivers = await this.prisma.driver.findMany({
      where: {
        isAvailable: true,
        isVerified: true,
        currentLatitude: { not: null },
        currentLongitude: { not: null },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Filter by distance
    const nearbyDrivers = drivers
      .map((driver) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          Number(driver.currentLatitude),
          Number(driver.currentLongitude),
        );
        return { ...driver, distance };
      })
      .filter((driver) => driver.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyDrivers.map((driver) => ({
      id: driver.id,
      name: `${driver.user?.firstName || ''} ${driver.user?.lastName || ''}`.trim(),
      phone: driver.user?.phone,
      rating: driver.rating || 0,
      distance: `${driver.distance.toFixed(1)} km`,
      location: {
        lat: Number(driver.currentLatitude),
        lng: Number(driver.currentLongitude),
      },
    }));
  }

  // Private helpers

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getDestinationForStatus(order: any): { lat: number; lng: number } | null {
    switch (order.status) {
      case 'ASSIGNED':
        // Driver going to pickup
        return {
          lat: Number(order.merchant?.latitude),
          lng: Number(order.merchant?.longitude),
        };
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        // Driver going to dropoff
        return {
          lat: Number(order.deliveryLatitude),
          lng: Number(order.deliveryLongitude),
        };
      default:
        return null;
    }
  }

  private async getOrderTimeline(orderId: string) {
    // For now, return basic timeline based on order status
    // In production, this would query a separate timeline/events table
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
        deliveredAt: true,
      },
    });

    if (!order) return [];

    const timeline = [
      {
        status: 'PENDING',
        timestamp: order.createdAt,
        label: 'Order placed',
      },
    ];

    // Add more events based on status
    if (['CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.status)) {
      timeline.push({
        status: 'CONFIRMED',
        timestamp: order.updatedAt,
        label: 'Order confirmed',
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: 'DELIVERED',
        timestamp: order.deliveredAt,
        label: 'Order delivered',
      });
    }

    return timeline;
  }

  private async addTimelineEvent(orderId: string, status: string, note?: string) {
    // In a full implementation, this would insert into a timeline events table
    // For now, we just log
    console.log(`[Timeline] Order ${orderId}: ${status} - ${note || ''}`);
  }
}
