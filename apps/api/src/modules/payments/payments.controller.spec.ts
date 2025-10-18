import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController (Integration)', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    createPaymentIntent: jest.fn(),
    confirmPayment: jest.fn(),
    createRefund: jest.fn(),
    findPaymentById: jest.fn(),
    findPayments: jest.fn(),
    createMerchantConnectAccount: jest.fn(),
    handleWebhook: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payments/intent', () => {
    it('should create payment intent with valid data', async () => {
      const createDto = {
        orderId: 'order-123',
        amount: 5000,
        currency: 'usd',
      };

      const mockResponse = {
        paymentId: 'payment-123',
        clientSecret: 'pi_test_secret',
      };

      mockPaymentsService.createPaymentIntent.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/payments/intent')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(mockPaymentsService.createPaymentIntent).toHaveBeenCalledWith(
        createDto,
      );
    });

    it('should return 400 when orderId is missing', async () => {
      const invalidDto = {
        amount: 5000,
        currency: 'usd',
      };

      await request(app.getHttpServer())
        .post('/payments/intent')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when amount is below minimum', async () => {
      const invalidDto = {
        orderId: 'order-123',
        amount: 10, // Below 50 cent minimum
        currency: 'usd',
      };

      await request(app.getHttpServer())
        .post('/payments/intent')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 when currency is missing', async () => {
      const invalidDto = {
        orderId: 'order-123',
        amount: 5000,
      };

      await request(app.getHttpServer())
        .post('/payments/intent')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /payments/confirm', () => {
    it('should confirm payment with valid data', async () => {
      const confirmDto = {
        paymentIntentId: 'pi_test_123',
      };

      const mockPayment = {
        id: 'payment-123',
        status: 'SUCCEEDED',
        amount: 50,
      };

      mockPaymentsService.confirmPayment.mockResolvedValue(mockPayment);

      const response = await request(app.getHttpServer())
        .post('/payments/confirm')
        .send(confirmDto)
        .expect(201);

      expect(response.body).toEqual(mockPayment);
      expect(mockPaymentsService.confirmPayment).toHaveBeenCalledWith(
        confirmDto,
      );
    });

    it('should return 400 when paymentIntentId is missing', async () => {
      await request(app.getHttpServer())
        .post('/payments/confirm')
        .send({})
        .expect(400);
    });
  });

  describe('POST /payments/refund', () => {
    it('should create refund with valid data', async () => {
      const refundDto = {
        paymentId: 'payment-123',
        amount: 5000,
        reason: 'requested_by_customer',
      };

      const mockRefund = {
        id: 'refund-123',
        paymentId: 'payment-123',
        amount: 50,
        status: 'REFUNDED',
      };

      mockPaymentsService.createRefund.mockResolvedValue(mockRefund);

      const response = await request(app.getHttpServer())
        .post('/payments/refund')
        .send(refundDto)
        .expect(201);

      expect(response.body).toEqual(mockRefund);
      expect(mockPaymentsService.createRefund).toHaveBeenCalledWith(refundDto);
    });

    it('should return 400 when paymentId is missing', async () => {
      const invalidDto = {
        amount: 5000,
        reason: 'requested_by_customer',
      };

      await request(app.getHttpServer())
        .post('/payments/refund')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /payments', () => {
    it('should return paginated payments', async () => {
      const mockResult = {
        data: [
          { id: 'payment-1', amount: 50, status: 'SUCCEEDED' },
          { id: 'payment-2', amount: 75, status: 'PENDING' },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockPaymentsService.findPayments.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .get('/payments')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(mockPaymentsService.findPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      );
    });

    it('should filter payments by orderId', async () => {
      const mockResult = {
        data: [{ id: 'payment-1', orderId: 'order-123' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      mockPaymentsService.findPayments.mockResolvedValue(mockResult);

      await request(app.getHttpServer())
        .get('/payments')
        .query({ orderId: 'order-123' })
        .expect(200);

      expect(mockPaymentsService.findPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-123',
          page: 1,
          limit: 20,
        }),
      );
    });

    it('should filter payments by status', async () => {
      const mockResult = {
        data: [{ id: 'payment-1', status: 'SUCCEEDED' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      mockPaymentsService.findPayments.mockResolvedValue(mockResult);

      await request(app.getHttpServer())
        .get('/payments')
        .query({ status: 'SUCCEEDED' })
        .expect(200);

      expect(mockPaymentsService.findPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SUCCEEDED',
          page: 1,
          limit: 20,
        }),
      );
    });
  });

  describe('GET /payments/:id', () => {
    it('should return payment by id', async () => {
      const mockPayment = {
        id: 'payment-123',
        orderId: 'order-123',
        amount: 50,
        status: 'SUCCEEDED',
        order: {
          id: 'order-123',
          orderNumber: 'ORD-001',
        },
      };

      mockPaymentsService.findPaymentById.mockResolvedValue(mockPayment);

      const response = await request(app.getHttpServer())
        .get('/payments/payment-123')
        .expect(200);

      expect(response.body).toEqual(mockPayment);
      expect(mockPaymentsService.findPaymentById).toHaveBeenCalledWith(
        'payment-123',
      );
    });

    it('should return 404 when payment not found', async () => {
      mockPaymentsService.findPaymentById.mockRejectedValue(
        new Error('Payment not found'),
      );

      await request(app.getHttpServer())
        .get('/payments/non-existent')
        .expect(500);
    });
  });

  describe('POST /payments/merchant/onboard', () => {
    it('should create merchant connect account', async () => {
      const onboardDto = {
        merchantId: 'merchant-123',
        email: 'merchant@example.com',
        returnUrl: 'http://localhost:3002/onboarding/return',
        refreshUrl: 'http://localhost:3002/onboarding/refresh',
      };

      const mockResult = {
        accountId: 'acct_123',
        accountLinkUrl: 'https://connect.stripe.com/setup',
      };

      mockPaymentsService.createMerchantConnectAccount.mockResolvedValue(
        mockResult,
      );

      const response = await request(app.getHttpServer())
        .post('/payments/merchant/onboard')
        .send(onboardDto)
        .expect(201);

      expect(response.body).toEqual(mockResult);
      expect(
        mockPaymentsService.createMerchantConnectAccount,
      ).toHaveBeenCalledWith(onboardDto);
    });

    it('should return 400 when merchantId is missing', async () => {
      const invalidDto = {
        email: 'merchant@example.com',
        returnUrl: 'http://localhost:3002/onboarding/return',
        refreshUrl: 'http://localhost:3002/onboarding/refresh',
      };

      await request(app.getHttpServer())
        .post('/payments/merchant/onboard')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /payments/webhooks/stripe', () => {
    it('should handle webhook with valid signature', async () => {
      const mockWebhookResult = { received: true };
      mockPaymentsService.handleWebhook.mockResolvedValue(mockWebhookResult);

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .set('stripe-signature', 'test_signature')
        .send({ type: 'payment_intent.succeeded' })
        .expect(201);

      expect(response.body).toEqual(mockWebhookResult);
    });

    it('should return 400 when stripe-signature header is missing', async () => {
      mockPaymentsService.handleWebhook.mockRejectedValue(
        new Error('No signature provided'),
      );

      await request(app.getHttpServer())
        .post('/payments/webhooks/stripe')
        .send({ type: 'payment_intent.succeeded' })
        .expect(500);
    });
  });
});
