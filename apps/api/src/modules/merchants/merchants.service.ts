import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateMerchantDto,
  UpdateMerchantDto,
  MerchantQueryDto,
  CreateMerchantLocationDto,
  UpdateMerchantLocationDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto/merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // MERCHANT OPERATIONS
  // ============================================

  async createMerchant(userId: string, createMerchantDto: CreateMerchantDto) {
    // Check if merchant already exists for this user
    const existingMerchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (existingMerchant) {
      throw new ConflictException('Merchant profile already exists for this user');
    }

    const merchant = await this.prisma.merchant.create({
      data: {
        userId,
        businessName: createMerchantDto.businessName,
        businessType: createMerchantDto.businessType,
        taxId: createMerchantDto.taxId,
        tier: 'BASIC',
        stripeOnboarded: false,
        totalOrders: 0,
        totalRevenue: 0,
        rating: 0,
        ratingCount: 0,
        verified: false,
      },
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

    return merchant;
  }

  async findMerchants(query: MerchantQueryDto) {
    const { page = 1, limit = 20, businessType, city, state, verified, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (businessType) {
      where.businessType = businessType;
    }

    if (verified !== undefined) {
      where.verified = verified;
    }

    if (search) {
      where.businessName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by city/state through locations
    if (city || state) {
      where.locations = {
        some: {
          ...(city && { city }),
          ...(state && { state }),
          isActive: true,
        },
      };
    }

    const [merchants, total] = await Promise.all([
      this.prisma.merchant.findMany({
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
          locations: {
            where: { isActive: true },
            take: 1,
            orderBy: { isMain: 'desc' },
          },
          _count: {
            select: {
              services: true,
              orders: true,
            },
          },
        },
        orderBy: [{ verified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      data: merchants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMerchantById(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            status: true,
          },
        },
        locations: {
          where: { isActive: true },
          orderBy: { isMain: 'desc' },
        },
        services: {
          where: { isActive: true },
          orderBy: { type: 'asc' },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    return merchant;
  }

  async findMerchantByUserId(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: { isMain: 'desc' },
        },
        services: {
          where: { isActive: true },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant not found for user ${userId}`);
    }

    return merchant;
  }

  async updateMerchant(id: string, updateMerchantDto: UpdateMerchantDto) {
    await this.findMerchantById(id);

    const merchant = await this.prisma.merchant.update({
      where: { id },
      data: updateMerchantDto,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        locations: {
          where: { isActive: true },
        },
      },
    });

    return merchant;
  }

  async deleteMerchant(id: string) {
    await this.findMerchantById(id);

    // Check if merchant has active orders
    const activeOrders = await this.prisma.order.count({
      where: {
        merchantId: id,
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
        },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        'Cannot delete merchant with active orders. Please complete or cancel all orders first.',
      );
    }

    await this.prisma.merchant.delete({
      where: { id },
    });

    return { message: 'Merchant deleted successfully' };
  }

  // ============================================
  // MERCHANT LOCATION OPERATIONS
  // ============================================

  async createMerchantLocation(merchantId: string, createLocationDto: CreateMerchantLocationDto) {
    await this.findMerchantById(merchantId);

    // If this is set as main location, unset other main locations
    if (createLocationDto.isMain) {
      await this.prisma.merchantLocation.updateMany({
        where: { merchantId, isMain: true },
        data: { isMain: false },
      });
    }

    const location = await this.prisma.merchantLocation.create({
      data: {
        merchantId,
        ...createLocationDto,
        isActive: true,
      } as any,
    });

    return location;
  }

  async findMerchantLocations(merchantId: string) {
    await this.findMerchantById(merchantId);

    const locations = await this.prisma.merchantLocation.findMany({
      where: { merchantId },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });

    return locations;
  }

  async findMerchantLocationById(merchantId: string, locationId: string) {
    const location = await this.prisma.merchantLocation.findFirst({
      where: {
        id: locationId,
        merchantId,
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    return location;
  }

  async updateMerchantLocation(
    merchantId: string,
    locationId: string,
    updateLocationDto: UpdateMerchantLocationDto,
  ) {
    await this.findMerchantLocationById(merchantId, locationId);

    // If this is being set as main location, unset other main locations
    if (updateLocationDto.isMain) {
      await this.prisma.merchantLocation.updateMany({
        where: { merchantId, isMain: true, id: { not: locationId } },
        data: { isMain: false },
      });
    }

    const location = await this.prisma.merchantLocation.update({
      where: { id: locationId },
      data: updateLocationDto,
    });

    return location;
  }

  async deleteMerchantLocation(merchantId: string, locationId: string) {
    const location = await this.findMerchantLocationById(merchantId, locationId);

    // Check if this is the only active location
    const activeLocationsCount = await this.prisma.merchantLocation.count({
      where: { merchantId, isActive: true },
    });

    if (activeLocationsCount === 1 && location.isActive) {
      throw new BadRequestException(
        'Cannot delete the only active location. Add another location first.',
      );
    }

    // Check for active orders at this location
    const activeOrders = await this.prisma.order.count({
      where: {
        merchantLocationId: locationId,
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
        },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        'Cannot delete location with active orders. Please complete or cancel all orders first.',
      );
    }

    await this.prisma.merchantLocation.delete({
      where: { id: locationId },
    });

    return { message: 'Location deleted successfully' };
  }

  // ============================================
  // SERVICE OPERATIONS
  // ============================================

  async createService(merchantId: string, createServiceDto: CreateServiceDto) {
    await this.findMerchantById(merchantId);

    const service = await this.prisma.service.create({
      data: {
        merchantId,
        ...createServiceDto,
      } as any,
    });

    return service;
  }

  async findMerchantServices(merchantId: string, includeInactive = false) {
    await this.findMerchantById(merchantId);

    const where: any = { merchantId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const services = await this.prisma.service.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return services;
  }

  async findServiceById(merchantId: string, serviceId: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        merchantId,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return service;
  }

  async updateService(merchantId: string, serviceId: string, updateServiceDto: UpdateServiceDto) {
    await this.findServiceById(merchantId, serviceId);

    const service = await this.prisma.service.update({
      where: { id: serviceId },
      data: updateServiceDto as any,
    });

    return service;
  }

  async deleteService(merchantId: string, serviceId: string) {
    await this.findServiceById(merchantId, serviceId);

    // Check if service is used in any active orders
    const activeOrderItems = await this.prisma.orderItem.count({
      where: {
        serviceId,
        order: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
          },
        },
      },
    });

    if (activeOrderItems > 0) {
      throw new BadRequestException(
        'Cannot delete service used in active orders. Consider deactivating it instead.',
      );
    }

    await this.prisma.service.delete({
      where: { id: serviceId },
    });

    return { message: 'Service deleted successfully' };
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getMerchantStats(merchantId: string) {
    await this.findMerchantById(merchantId);

    const [totalOrders, totalRevenue, activeServices, locationCount, recentOrders] =
      await Promise.all([
        this.prisma.order.count({
          where: { merchantId },
        }),
        this.prisma.order.aggregate({
          where: {
            merchantId,
            status: { in: ['DELIVERED'] },
          },
          _sum: {
            totalAmount: true,
          },
        }),
        this.prisma.service.count({
          where: { merchantId, isActive: true },
        }),
        this.prisma.merchantLocation.count({
          where: { merchantId, isActive: true },
        }),
        this.prisma.order.findMany({
          where: { merchantId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeServices,
      locationCount,
      recentOrders,
    };
  }
}
