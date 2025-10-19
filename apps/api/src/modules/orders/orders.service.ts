import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
  AssignDriverDto,
  OrderStatus,
} from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a new order with items
   */
  async createOrder(createOrderDto: CreateOrderDto) {
    const { items, ...orderData } = createOrderDto;

    // Validate merchant and location exist
    const merchantLocation = await this.prisma.merchantLocation.findFirst({
      where: {
        id: orderData.merchantLocationId,
        merchantId: orderData.merchantId,
        isActive: true,
      },
      include: {
        merchant: true,
      },
    });

    if (!merchantLocation) {
      throw new NotFoundException(
        'Merchant location not found or inactive',
      );
    }

    // Validate all services belong to the merchant
    const serviceIds = items.map((item) => item.serviceId);
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        merchantId: orderData.merchantId,
        isActive: true,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        'One or more services not found or inactive',
      );
    }

    // Validate addresses belong to customer
    const addresses = await this.prisma.address.findMany({
      where: {
        id: {
          in: [orderData.pickupAddressId, orderData.deliveryAddressId],
        },
        customerId: orderData.customerId,
      },
    });

    if (addresses.length !== 2 && orderData.pickupAddressId !== orderData.deliveryAddressId) {
      throw new BadRequestException('Invalid pickup or delivery address');
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const service = services.find((s: any) => s.id === item.serviceId);
      if (!service) {
        throw new BadRequestException(`Service ${item.serviceId} not found`);
      }

      const unitPrice = service.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        serviceId: item.serviceId,
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        specialInstructions: item.specialInstructions,
        photoUrl: item.photoUrl,
      };
    });

    // Calculate dynamic pricing based on fulfillment mode
    const fulfillmentMode = orderData.fulfillmentMode || 'FULL_SERVICE';
    const pricingResult = this.calculateDynamicPricing(subtotal, fulfillmentMode);

    const serviceFee = pricingResult.serviceFee;
    const deliveryFee = pricingResult.deliveryFee;
    const selfServiceDiscount = pricingResult.selfServiceDiscount;
    const taxAmount = (subtotal + serviceFee + deliveryFee - selfServiceDiscount) * 0.0875; // 8.75% tax
    const totalAmount = subtotal + serviceFee + deliveryFee + taxAmount - selfServiceDiscount;

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    try {
      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (prisma: any) => {
        const newOrder = await prisma.order.create({
          data: {
            orderNumber,
            customerId: orderData.customerId,
            merchantId: orderData.merchantId,
            merchantLocationId: orderData.merchantLocationId,
            pickupAddressId: orderData.pickupAddressId,
            deliveryAddressId: orderData.deliveryAddressId,
            type: orderData.type || 'ON_DEMAND',
            status: 'PENDING_PAYMENT',
            subtotal,
            serviceFee,
            deliveryFee,
            taxAmount,
            tip: 0,
            discount: 0,
            totalAmount,
            scheduledPickupAt: orderData.scheduledPickupAt
              ? new Date(orderData.scheduledPickupAt)
              : null,
            scheduledDeliveryAt: orderData.scheduledDeliveryAt
              ? new Date(orderData.scheduledDeliveryAt)
              : null,
            specialInstructions: orderData.specialInstructions,
            customerNotes: orderData.customerNotes,
          },
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            merchant: true,
            merchantLocation: true,
            pickupAddress: true,
            deliveryAddress: true,
          },
        });

        // Create order items
        await prisma.orderItem.createMany({
          data: orderItems.map((item) => ({
            orderId: newOrder.id,
            ...item,
          })),
        });

        // Create initial status history
        await prisma.orderStatusHistory.create({
          data: {
            orderId: newOrder.id,
            status: 'PENDING_PAYMENT',
            notes: 'Order created',
          },
        });

        return newOrder;
      });

      // Fetch complete order with items
      const completeOrder = await this.findOrderById(order.id);

      // Emit real-time event to merchant
      this.eventsGateway.emitOrderCreated(completeOrder);

      return completeOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  /**
   * Get order by ID with all relationships
   */
  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        merchant: true,
        merchantLocation: true,
        pickupDriver: true,
        deliveryDriver: true,
        pickupAddress: true,
        deliveryAddress: true,
        items: {
          include: {
            service: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Get orders with filtering and pagination
   */
  async findOrders(query: OrderQueryDto) {
    const {
      customerId,
      merchantId,
      driverId,
      status,
      page = 1,
      limit = 20,
    } = query;

    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;
    if (driverId) {
      where.OR = [
        { pickupDriverId: driverId },
        { deliveryDriverId: driverId },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
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
            },
          },
          pickupDriver: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          deliveryDriver: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          items: {
            select: {
              itemName: true,
              quantity: true,
              totalPrice: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition (basic validation)
    this.validateStatusTransition(order.status as OrderStatus, updateDto.status);

    const previousStatus = order.status;

    try {
      const [updatedOrder] = await this.prisma.$transaction([
        this.prisma.order.update({
          where: { id },
          data: {
            status: updateDto.status,
            actualPickupAt:
              updateDto.status === OrderStatus.PICKED_UP
                ? new Date()
                : order.actualPickupAt,
            actualDeliveryAt:
              updateDto.status === OrderStatus.DELIVERED
                ? new Date()
                : order.actualDeliveryAt,
          },
          include: {
            customer: true,
            merchant: true,
            items: true,
            statusHistory: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        }),
        this.prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: updateDto.status,
            notes: updateDto.notes,
            latitude: updateDto.latitude,
            longitude: updateDto.longitude,
          },
        }),
      ]);

      // Emit real-time status change event
      this.eventsGateway.emitOrderStatusChanged(updatedOrder, previousStatus);

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new InternalServerErrorException('Failed to update order status');
    }
  }

  /**
   * Assign driver to order
   */
  async assignDriver(orderId: string, assignDto: AssignDriverDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify driver exists and is available
    const driver = await this.prisma.driver.findUnique({
      where: { id: assignDto.driverId },
    });

    if (!driver) {
      throw new NotFoundException(
        `Driver with ID ${assignDto.driverId} not found`,
      );
    }

    if (driver.status !== 'AVAILABLE') {
      throw new BadRequestException('Driver is not available');
    }

    const updateData: any = {};
    if (assignDto.assignmentType === 'pickup') {
      updateData.pickupDriverId = assignDto.driverId;
    } else {
      updateData.deliveryDriverId = assignDto.driverId;
    }

    // Update order status if this is the first assignment
    if (order.status === 'PAYMENT_CONFIRMED') {
      updateData.status = 'DRIVER_ASSIGNED';
    }

    const updatedOrder = await this.prisma.$transaction(async (prisma: any) => {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          customer: true,
          merchant: true,
          pickupDriver: true,
          deliveryDriver: true,
        },
      });

      // Create status history if status changed
      if (updateData.status) {
        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'DRIVER_ASSIGNED',
            notes: `Driver assigned for ${assignDto.assignmentType}`,
          },
        });
      }

      return updated;
    });

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only allow cancellation of orders that haven't been picked up
    const cancellableStatuses = [
      'PENDING_PAYMENT',
      'PAYMENT_CONFIRMED',
      'DRIVER_ASSIGNED',
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order in ${order.status} status`,
      );
    }

    const cancelledOrder = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          customer: true,
          merchant: true,
          items: true,
        },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          notes: reason || 'Order cancelled',
        },
      }),
    ]);

    return cancelledOrder[0];
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
    return orderNumber;
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [
        OrderStatus.PAYMENT_CONFIRMED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PAYMENT_CONFIRMED]: [
        OrderStatus.DRIVER_ASSIGNED,
        OrderStatus.AWAITING_CUSTOMER_DROPOFF,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DRIVER_ASSIGNED]: [
        OrderStatus.PICKED_UP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT_TO_MERCHANT],
      [OrderStatus.IN_TRANSIT_TO_MERCHANT]: [OrderStatus.RECEIVED_BY_MERCHANT],
      [OrderStatus.RECEIVED_BY_MERCHANT]: [OrderStatus.IN_PROCESS],
      [OrderStatus.IN_PROCESS]: [
        OrderStatus.READY_FOR_DELIVERY,
        OrderStatus.READY_FOR_CUSTOMER_PICKUP,
      ],
      [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.AWAITING_CUSTOMER_DROPOFF]: [OrderStatus.RECEIVED_BY_MERCHANT, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: [OrderStatus.PICKED_UP_BY_CUSTOMER],
      [OrderStatus.PICKED_UP_BY_CUSTOMER]: [OrderStatus.REFUNDED],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Calculate dynamic pricing based on fulfillment mode
   */
  private calculateDynamicPricing(subtotal: number, fulfillmentMode: string) {
    const serviceFee = subtotal * 0.1; // 10% service fee
    const baseDeliveryFee = 5.0;
    let deliveryFee = baseDeliveryFee;
    let selfServiceDiscount = 0;

    switch (fulfillmentMode) {
      case 'CUSTOMER_DROPOFF_PICKUP':
        // Full self-service: no delivery fee + 10% discount
        deliveryFee = 0;
        selfServiceDiscount = subtotal * 0.10;
        break;

      case 'CUSTOMER_DROPOFF_DRIVER_DELIVERY':
      case 'DRIVER_PICKUP_CUSTOMER_PICKUP':
        // Hybrid: 50% delivery fee
        deliveryFee = baseDeliveryFee * 0.50;
        break;

      case 'FULL_SERVICE':
      default:
        // Full service: 100% delivery fee
        deliveryFee = baseDeliveryFee;
        break;
    }

    return {
      serviceFee,
      deliveryFee,
      selfServiceDiscount,
    };
  }

  /**
   * Confirm customer drop-off (self-service)
   */
  async confirmDropoff(orderId: string, confirmDto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate order is in AWAITING_CUSTOMER_DROPOFF status
    if (order.status !== 'AWAITING_CUSTOMER_DROPOFF') {
      throw new BadRequestException(
        `Cannot confirm drop-off for order in ${order.status} status`,
      );
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async (prisma: any) => {
        // Update order with dropoff confirmation
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'RECEIVED_BY_MERCHANT',
            dropoffConfirmed: true,
            dropoffConfirmedAt: new Date(),
            customerDropoffTime: new Date(),
            confirmationPhotoUrls: confirmDto.photoUrls || [],
          },
          include: {
            customer: true,
            merchant: true,
            merchantLocation: true,
            items: true,
          },
        });

        // Create status history
        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'RECEIVED_BY_MERCHANT',
            notes: confirmDto.notes || 'Customer confirmed drop-off',
            latitude: confirmDto.latitude,
            longitude: confirmDto.longitude,
          },
        });

        return updated;
      });

      // Emit real-time event to merchant
      this.eventsGateway.emitOrderStatusChanged(updatedOrder, 'AWAITING_CUSTOMER_DROPOFF');

      return updatedOrder;
    } catch (error) {
      console.error('Error confirming drop-off:', error);
      throw new InternalServerErrorException('Failed to confirm drop-off');
    }
  }

  /**
   * Confirm customer pickup (self-service)
   */
  async confirmPickup(orderId: string, confirmDto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate order is in READY_FOR_CUSTOMER_PICKUP status
    if (order.status !== 'READY_FOR_CUSTOMER_PICKUP') {
      throw new BadRequestException(
        `Cannot confirm pickup for order in ${order.status} status`,
      );
    }

    try {
      const updatedOrder = await this.prisma.$transaction(async (prisma: any) => {
        // Update order with pickup confirmation
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PICKED_UP_BY_CUSTOMER',
            pickupConfirmed: true,
            pickupConfirmedAt: new Date(),
            customerPickupTime: new Date(),
            actualDeliveryAt: new Date(),
            confirmationPhotoUrls: [
              ...(order.confirmationPhotoUrls || []),
              ...(confirmDto.photoUrls || []),
            ],
          },
          include: {
            customer: true,
            merchant: true,
            merchantLocation: true,
            items: true,
          },
        });

        // Create status history
        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'PICKED_UP_BY_CUSTOMER',
            notes: confirmDto.notes || 'Customer confirmed pickup',
            latitude: confirmDto.latitude,
            longitude: confirmDto.longitude,
          },
        });

        return updated;
      });

      // Emit real-time event
      this.eventsGateway.emitOrderStatusChanged(updatedOrder, 'READY_FOR_CUSTOMER_PICKUP');

      return updatedOrder;
    } catch (error) {
      console.error('Error confirming pickup:', error);
      throw new InternalServerErrorException('Failed to confirm pickup');
    }
  }
}
