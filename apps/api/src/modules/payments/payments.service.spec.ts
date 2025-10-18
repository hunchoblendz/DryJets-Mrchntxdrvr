import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';

// Mock Stripe at the module level
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: jest.fn(),
      },
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      refunds: {
        create: jest.fn(),
      },
      accounts: {
        create: jest.fn(),
      },
      accountLinks: {
        create: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };
  });
});

describe('PaymentsService (Unit)', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    payment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    merchant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock_key';
      if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_mock_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPaymentById', () => {
    it('should return payment with order details', async () => {
      const mockPayment = {
        id: 'payment-123',
        orderId: 'order-123',
        amount: 50,
        currency: 'USD',
        status: 'SUCCEEDED',
        order: {
          id: 'order-123',
          orderNumber: 'ORD-001',
          customer: {
            id: 'customer-123',
            firstName: 'John',
            lastName: 'Doe',
          },
          merchant: {
            id: 'merchant-123',
            businessName: 'Test Merchant',
          },
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findPaymentById('payment-123');

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        include: expect.objectContaining({
          order: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if payment does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.findPaymentById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPayments', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          amount: 50,
          status: 'SUCCEEDED',
        },
        {
          id: 'payment-2',
          amount: 75,
          status: 'PENDING',
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);
      mockPrismaService.payment.count.mockResolvedValue(2);

      const result = await service.findPayments({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockPayments);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter payments by order ID', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      await service.findPayments({ orderId: 'order-123' });

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderId: 'order-123',
          }),
        }),
      );
    });

    it('should filter payments by status', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      await service.findPayments({ status: 'SUCCEEDED' });

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUCCEEDED',
          }),
        }),
      );
    });

    it('should filter payments by customer ID', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      await service.findPayments({ customerId: 'customer-123' });

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            order: {
              customerId: 'customer-123',
            },
          }),
        }),
      );
    });
  });

  describe('createPaymentIntent', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const dto = {
        orderId: 'non-existent',
        amount: 5000,
        currency: 'usd',
      };

      await expect(service.createPaymentIntent(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment already exists', async () => {
      const mockOrder = {
        id: 'order-123',
        customerId: 'customer-123',
        customer: {
          user: {
            email: 'test@example.com',
          },
        },
      };

      const existingPayment = {
        id: 'payment-123',
        status: 'PENDING',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.payment.findFirst.mockResolvedValue(existingPayment);

      const dto = {
        orderId: 'order-123',
        amount: 5000,
        currency: 'usd',
      };

      await expect(service.createPaymentIntent(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmPayment', () => {
    it('should throw InternalServerErrorException if payment does not exist', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      const dto = {
        paymentIntentId: 'pi_test_123',
      };

      await expect(service.confirmPayment(dto)).rejects.toThrow(
        'Failed to confirm payment',
      );
    });

    it('should update payment and order status when payment intent succeeded', async () => {
      const mockPayment = {
        id: 'payment-123',
        orderId: 'order-123',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test_123',
        order: {
          id: 'order-123',
          status: 'PENDING_PAYMENT',
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);

      // Mock Stripe retrieve method
      const mockStripe = (service as any).stripe;
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: 'SUCCEEDED',
        processedAt: new Date(),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockPayment.order,
        status: 'PAYMENT_CONFIRMED',
      });
      mockPrismaService.orderStatusHistory.create.mockResolvedValue({});

      const dto = {
        paymentIntentId: 'pi_test_123',
      };

      const result = await service.confirmPayment(dto);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        data: {
          status: 'SUCCEEDED',
          processedAt: expect.any(Date),
        },
      });

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'PAYMENT_CONFIRMED' },
      });

      expect(mockPrismaService.orderStatusHistory.create).toHaveBeenCalled();
    });
  });

  describe('createRefund', () => {
    it('should throw NotFoundException if payment does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const dto = {
        paymentId: 'non-existent',
        amount: 5000,
        reason: 'requested_by_customer',
      };

      await expect(service.createRefund(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment not succeeded', async () => {
      const mockPayment = {
        id: 'payment-123',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_test_123',
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const dto = {
        paymentId: 'payment-123',
        amount: 5000,
        reason: 'requested_by_customer',
      };

      await expect(service.createRefund(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already refunded', async () => {
      const mockPayment = {
        id: 'payment-123',
        status: 'REFUNDED',
        stripePaymentIntentId: 'pi_test_123',
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const dto = {
        paymentId: 'payment-123',
        amount: 5000,
        reason: 'requested_by_customer',
      };

      await expect(service.createRefund(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createMerchantConnectAccount', () => {
    it('should throw NotFoundException if merchant does not exist', async () => {
      mockPrismaService.merchant.findUnique.mockResolvedValue(null);

      const dto = {
        merchantId: 'non-existent',
        email: 'merchant@example.com',
        country: 'US',
        businessType: 'individual' as const,
      };

      await expect(service.createMerchantConnectAccount(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
