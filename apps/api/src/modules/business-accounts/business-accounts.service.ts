import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateBusinessAccountDto,
  UpdateBusinessAccountDto,
  InviteTeamMemberDto,
  CreateRecurringOrderDto,
} from './dto';

@Injectable()
export class BusinessAccountsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new business account
   */
  async create(createDto: CreateBusinessAccountDto) {
    // Check if user already has a business account
    const existing = await this.prisma.businessAccount.findUnique({
      where: { userId: createDto.userId },
    });

    if (existing) {
      throw new ConflictException('User already has a business account');
    }

    return this.prisma.businessAccount.create({
      data: createDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all business accounts (admin only)
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.businessAccount.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
            },
          },
          _count: {
            select: {
              orders: true,
              teamMembers: true,
              invoices: true,
              recurringOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.businessAccount.count(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get business account by ID
   */
  async findOne(id: string) {
    const account = await this.prisma.businessAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        teamMembers: {
          where: { isActive: true },
          orderBy: { invitedAt: 'desc' },
        },
        recurringOrders: {
          where: { isActive: true },
        },
        _count: {
          select: {
            orders: true,
            invoices: true,
            addresses: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Business account #${id} not found`);
    }

    return account;
  }

  /**
   * Get business account by user ID
   */
  async findByUserId(userId: string) {
    const account = await this.prisma.businessAccount.findUnique({
      where: { userId },
      include: {
        teamMembers: {
          where: { isActive: true },
        },
        recurringOrders: {
          where: { isActive: true },
        },
        _count: {
          select: {
            orders: true,
            invoices: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Business account not found for this user');
    }

    return account;
  }

  /**
   * Update business account
   */
  async update(id: string, updateDto: UpdateBusinessAccountDto) {
    await this.findOne(id); // Check existence

    return this.prisma.businessAccount.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete business account
   */
  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.businessAccount.delete({
      where: { id },
    });
  }

  /**
   * Invite team member
   */
  async inviteTeamMember(businessId: string, inviteDto: InviteTeamMemberDto) {
    const account = await this.findOne(businessId);

    // Check if email already exists in team
    const existing = await this.prisma.teamMember.findUnique({
      where: {
        businessId_email: {
          businessId,
          email: inviteDto.email,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Team member with this email already exists');
    }

    return this.prisma.teamMember.create({
      data: {
        ...inviteDto,
        businessId,
      },
    });
  }

  /**
   * Get team members for a business
   */
  async getTeamMembers(businessId: string, activeOnly: boolean = true) {
    await this.findOne(businessId); // Check existence

    return this.prisma.teamMember.findMany({
      where: {
        businessId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });
  }

  /**
   * Update team member
   */
  async updateTeamMember(businessId: string, memberId: string, updateData: Partial<InviteTeamMemberDto>) {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        id: memberId,
        businessId,
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: updateData,
    });
  }

  /**
   * Remove team member
   */
  async removeTeamMember(businessId: string, memberId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        id: memberId,
        businessId,
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });
  }

  /**
   * Create recurring order
   */
  async createRecurringOrder(createDto: CreateRecurringOrderDto) {
    await this.findOne(createDto.businessId); // Check existence

    return this.prisma.recurringOrder.create({
      data: createDto,
    });
  }

  /**
   * Get recurring orders for a business
   */
  async getRecurringOrders(businessId: string, activeOnly: boolean = true) {
    await this.findOne(businessId); // Check existence

    return this.prisma.recurringOrder.findMany({
      where: {
        businessId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        nextScheduledDate: 'asc',
      },
    });
  }

  /**
   * Update recurring order
   */
  async updateRecurringOrder(id: string, updateData: Partial<CreateRecurringOrderDto>) {
    return this.prisma.recurringOrder.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Cancel recurring order
   */
  async cancelRecurringOrder(id: string) {
    return this.prisma.recurringOrder.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Check if user can place orders (permissions)
   */
  async canPlaceOrder(businessId: string, userId: string): Promise<boolean> {
    const account = await this.prisma.businessAccount.findUnique({
      where: { id: businessId },
    });

    if (!account) {
      return false;
    }

    // If user is the account owner
    if (account.userId === userId) {
      return true;
    }

    // Check if user is a team member with permission
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        businessId_email: {
          businessId,
          email: user.email,
        },
      },
    });

    return teamMember?.isActive && teamMember?.canPlaceOrders;
  }

  /**
   * Check monthly spend limit
   */
  async checkSpendLimit(businessId: string, orderAmount: number): Promise<boolean> {
    const account = await this.findOne(businessId);

    if (!account.monthlySpendLimit) {
      return true; // No limit set
    }

    // Calculate current month's spend
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTotal = await this.prisma.order.aggregate({
      where: {
        businessId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const currentSpend = monthlyTotal._sum.totalAmount || 0;
    return currentSpend + orderAmount <= account.monthlySpendLimit;
  }
}
