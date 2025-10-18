import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('OrdersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /orders', () => {
    it('should return paginated orders list', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({ limit: 10, page: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'DELIVERED' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].status).toBe('DELIVERED');
      }
    });

    it('should filter orders by merchant', async () => {
      const merchantId = 'cmgvgmqg8000k1asc969fv1l2';
      const response = await request(app.getHttpServer())
        .get('/orders')
        .query({ merchantId })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].merchantId).toBe(merchantId);
      }
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details with all relationships', async () => {
      // First get an order ID from the list
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/orders/${orderId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('orderNumber');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('totalAmount');
        expect(response.body).toHaveProperty('customer');
        expect(response.body).toHaveProperty('items');
      }
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /orders', () => {
    it('should create a new order with valid data', async () => {
      const createOrderDto = {
        customerId: 'cmgvgmqfe00021asc08qavn10',
        merchantId: 'cmgvgmqg8000k1asc969fv1l2',
        merchantLocationId: 'cmgvgmqga000m1ascxahik8fo',
        type: 'ON_DEMAND',
        pickupAddressId: 'cmgvgmqfo00071asca98wxsaa',
        deliveryAddressId: 'cmgvgmqfo00071asca98wxsaa',
        scheduledPickupAt: new Date(Date.now() + 86400000).toISOString(),
        items: [
          {
            serviceId: 'cmgvgmqgg000t1asc9btfwdo0',
            itemName: 'Test Shirt',
            quantity: 2,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.status).toBe('PENDING_PAYMENT');
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body.totalAmount).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        customerId: 'cmgvgmqfe00021asc08qavn10',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status', async () => {
      // Get an order first
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'PENDING_PAYMENT', limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .patch(`/orders/${orderId}/status`)
          .send({ status: 'PAYMENT_CONFIRMED' })
          .expect(200);

        expect(response.body.status).toBe('PAYMENT_CONFIRMED');
      }
    });

    it('should reject invalid status transitions', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'DELIVERED', limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        await request(app.getHttpServer())
          .patch(`/orders/${orderId}/status`)
          .send({ status: 'PENDING_PAYMENT' })
          .expect(400);
      }
    });

    it('should record status history when updating', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'PAYMENT_CONFIRMED', limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        await request(app.getHttpServer())
          .patch(`/orders/${orderId}/status`)
          .send({ status: 'DRIVER_ASSIGNED', notes: 'Test note' })
          .expect(200);

        const orderDetails = await request(app.getHttpServer())
          .get(`/orders/${orderId}`)
          .expect(200);

        expect(orderDetails.body.statusHistory).toBeDefined();
        expect(orderDetails.body.statusHistory.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PATCH /orders/:id/assign-driver', () => {
    it('should assign a driver to an order', async () => {
      // Get an order in PAYMENT_CONFIRMED status
      const orderResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'PAYMENT_CONFIRMED', limit: 1 });

      // Get an available driver
      const driverResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ status: 'AVAILABLE', limit: 1 });

      if (
        orderResponse.body.data.length > 0 &&
        driverResponse.body.data.length > 0
      ) {
        const orderId = orderResponse.body.data[0].id;
        const driverId = driverResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .patch(`/orders/${orderId}/assign-driver`)
          .send({ pickupDriverId: driverId })
          .expect(200);

        expect(response.body.pickupDriverId).toBe(driverId);
        expect(response.body.status).toBe('DRIVER_ASSIGNED');
      }
    });

    it('should reject assigning driver to wrong status order', async () => {
      const orderResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'DELIVERED', limit: 1 });

      const driverResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ status: 'AVAILABLE', limit: 1 });

      if (
        orderResponse.body.data.length > 0 &&
        driverResponse.body.data.length > 0
      ) {
        const orderId = orderResponse.body.data[0].id;
        const driverId = driverResponse.body.data[0].id;

        await request(app.getHttpServer())
          .patch(`/orders/${orderId}/assign-driver`)
          .send({ pickupDriverId: driverId })
          .expect(400);
      }
    });
  });

  describe('DELETE /orders/:id', () => {
    it('should cancel an order', async () => {
      // Get a cancellable order
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'PENDING_PAYMENT', limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .delete(`/orders/${orderId}`)
          .send({ reason: 'Customer requested cancellation' })
          .expect(200);

        expect(response.body.status).toBe('CANCELLED');
      }
    });

    it('should not cancel delivered orders', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/orders')
        .query({ status: 'DELIVERED', limit: 1 });

      if (listResponse.body.data.length > 0) {
        const orderId = listResponse.body.data[0].id;

        await request(app.getHttpServer())
          .delete(`/orders/${orderId}`)
          .send({ reason: 'Customer requested cancellation' })
          .expect(400);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/orders')
        .query({ limit: 5, page: 1 })
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/orders')
        .query({ limit: 5, page: 2 })
        .expect(200);

      expect(page1.body.meta.page).toBe(1);
      expect(page2.body.meta.page).toBe(2);
      expect(page1.body.meta.limit).toBe(5);
      expect(page2.body.meta.limit).toBe(5);
    });

    it('should validate required fields in create order DTO', async () => {
      const invalidDto = {
        customerId: 'cmgvgmqfe00021asc08qavn10',
        type: 'ON_DEMAND',
        // Missing merchantId, merchantLocationId, addresses, items
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject orders with empty items array', async () => {
      const invalidDto = {
        customerId: 'cmgvgmqfe00021asc08qavn10',
        merchantId: 'cmgvgmqg8000k1asc969fv1l2',
        merchantLocationId: 'cmgvgmqga000m1ascxahik8fo',
        type: 'ON_DEMAND',
        pickupAddressId: 'cmgvgmqfo00071asca98wxsaa',
        deliveryAddressId: 'cmgvgmqfo00071asca98wxsaa',
        items: [], // Empty items
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle non-existent customer gracefully', async () => {
      const createOrderDto = {
        customerId: 'non-existent-customer-id',
        merchantId: 'cmgvgmqg8000k1asc969fv1l2',
        merchantLocationId: 'cmgvgmqga000m1ascxahik8fo',
        type: 'ON_DEMAND',
        pickupAddressId: 'cmgvgmqfo00071asca98wxsaa',
        deliveryAddressId: 'cmgvgmqfo00071asca98wxsaa',
        items: [
          {
            serviceId: 'cmgvgmqgg000t1asc9btfwdo0',
            itemName: 'Test Shirt',
            quantity: 2,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(404);
    });
  });
});
