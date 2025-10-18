import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('MerchantsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MerchantsController],
      providers: [MerchantsService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /merchants', () => {
    it('should return paginated merchants list', async () => {
      const response = await request(app.getHttpServer())
        .get('/merchants')
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

    it('should filter merchants by city', async () => {
      const response = await request(app.getHttpServer())
        .get('/merchants')
        .query({ city: 'New York' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter merchants by verified status', async () => {
      const response = await request(app.getHttpServer())
        .get('/merchants')
        .query({ verified: true })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].verified).toBe(true);
      }
    });

    it('should filter merchants by businessType', async () => {
      const response = await request(app.getHttpServer())
        .get('/merchants')
        .query({ businessType: 'DRY_CLEANING' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /merchants/:id', () => {
    it('should return merchant details with relationships', async () => {
      // First get a merchant ID from the list
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('businessName');
        expect(response.body).toHaveProperty('businessType');
        expect(response.body).toHaveProperty('verified');
        expect(response.body).toHaveProperty('locations');
        expect(response.body).toHaveProperty('services');
      }
    });

    it('should return 404 for non-existent merchant', async () => {
      await request(app.getHttpServer())
        .get('/merchants/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /merchants/:id/locations', () => {
    it('should return all locations for a merchant', async () => {
      // Get a merchant ID
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/locations`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('address');
          expect(response.body[0]).toHaveProperty('city');
          expect(response.body[0]).toHaveProperty('state');
          expect(response.body[0]).toHaveProperty('zipCode');
        }
      }
    });

    it('should filter active locations only', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/locations`)
          .query({ isActive: true })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0].isActive).toBe(true);
        }
      }
    });
  });

  describe('GET /merchants/:id/services', () => {
    it('should return all services for a merchant', async () => {
      // Get a merchant ID
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/services`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('type');
          expect(response.body[0]).toHaveProperty('pricingModel');
          expect(response.body[0]).toHaveProperty('basePrice');
        }
      }
    });

    it('should filter active services only', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/services`)
          .query({ isActive: true })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0].isActive).toBe(true);
        }
      }
    });

    it('should filter services by type', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/services`)
          .query({ type: 'DRY_CLEANING' })
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('POST /merchants/:id/locations', () => {
    it('should create a new location for merchant', async () => {
      // Get a merchant ID
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const createLocationDto = {
          name: 'Test Location',
          address: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zipCode: '10001',
          phone: '555-0123',
          isMain: false,
          latitude: 40.7128,
          longitude: -74.006,
        };

        const response = await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/locations`)
          .send(createLocationDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Location');
        expect(response.body.city).toBe('Test City');
        expect(response.body.merchantId).toBe(merchantId);
      }
    });

    it('should validate required fields when creating location', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const invalidDto = {
          name: 'Test Location',
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/locations`)
          .send(invalidDto)
          .expect(400);
      }
    });
  });

  describe('POST /merchants/:id/services', () => {
    it('should create a new service for merchant', async () => {
      // Get a merchant ID
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const createServiceDto = {
          name: 'Test Service',
          type: 'DRY_CLEANING',
          pricingModel: 'PER_ITEM',
          basePrice: 15.99,
          estimatedTime: 48,
        };

        const response = await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/services`)
          .send(createServiceDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Service');
        expect(response.body.type).toBe('DRY_CLEANING');
        expect(response.body.basePrice).toBe(15.99);
        expect(response.body.merchantId).toBe(merchantId);
      }
    });

    it('should validate required fields when creating service', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const invalidDto = {
          name: 'Test Service',
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/services`)
          .send(invalidDto)
          .expect(400);
      }
    });

    it('should validate price is positive number', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const invalidDto = {
          name: 'Test Service',
          type: 'DRY_CLEANING',
          pricingModel: 'PER_ITEM',
          basePrice: -10, // Invalid negative price
          estimatedTime: 48,
        };

        await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/services`)
          .send(invalidDto)
          .expect(400);
      }
    });
  });

  describe('PATCH /merchants/:merchantId/locations/:locationId', () => {
    it('should update a location', async () => {
      // Get a merchant and their location
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const locationsResponse = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/locations`)
          .query({ limit: 1 });

        if (locationsResponse.body.length > 0) {
          const locationId = locationsResponse.body[0].id;

          const updateDto = {
            phone: '555-9999',
            isActive: true,
          };

          const response = await request(app.getHttpServer())
            .patch(`/merchants/${merchantId}/locations/${locationId}`)
            .send(updateDto)
            .expect(200);

          expect(response.body.phone).toBe('555-9999');
        }
      }
    });
  });

  describe('PATCH /merchants/:merchantId/services/:serviceId', () => {
    it('should update a service', async () => {
      // Get a merchant and their service
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        const servicesResponse = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/services`)
          .query({ limit: 1 });

        if (servicesResponse.body.length > 0) {
          const serviceId = servicesResponse.body[0].id;

          const updateDto = {
            basePrice: 19.99,
            isActive: true,
          };

          const response = await request(app.getHttpServer())
            .patch(`/merchants/${merchantId}/services/${serviceId}`)
            .send(updateDto)
            .expect(200);

          expect(response.body.basePrice).toBe(19.99);
        }
      }
    });
  });

  describe('DELETE /merchants/:merchantId/locations/:locationId', () => {
    it('should delete a location (soft delete)', async () => {
      // Get a merchant
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        // Create a new location to delete
        const createLocationDto = {
          name: 'Location to Delete',
          address: '999 Delete St',
          city: 'Delete City',
          state: 'NY',
          zipCode: '10001',
          isMain: false,
        };

        const createResponse = await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/locations`)
          .send(createLocationDto)
          .expect(201);

        const locationId = createResponse.body.id;

        await request(app.getHttpServer())
          .delete(`/merchants/${merchantId}/locations/${locationId}`)
          .expect(200);

        // Verify location is soft deleted (isActive = false)
        const getResponse = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/locations`)
          .query({ isActive: false });

        const deletedLocation = getResponse.body.find(
          (loc: any) => loc.id === locationId,
        );
        if (deletedLocation) {
          expect(deletedLocation.isActive).toBe(false);
        }
      }
    });
  });

  describe('DELETE /merchants/:merchantId/services/:serviceId', () => {
    it('should delete a service (soft delete)', async () => {
      // Get a merchant
      const listResponse = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const merchantId = listResponse.body.data[0].id;

        // Create a new service to delete
        const createServiceDto = {
          name: 'Service to Delete',
          type: 'DRY_CLEANING',
          pricingModel: 'PER_ITEM',
          basePrice: 10.0,
        };

        const createResponse = await request(app.getHttpServer())
          .post(`/merchants/${merchantId}/services`)
          .send(createServiceDto)
          .expect(201);

        const serviceId = createResponse.body.id;

        await request(app.getHttpServer())
          .delete(`/merchants/${merchantId}/services/${serviceId}`)
          .expect(200);

        // Verify service is soft deleted (isActive = false)
        const getResponse = await request(app.getHttpServer())
          .get(`/merchants/${merchantId}/services`)
          .query({ isActive: false });

        const deletedService = getResponse.body.find(
          (svc: any) => svc.id === serviceId,
        );
        if (deletedService) {
          expect(deletedService.isActive).toBe(false);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 2, page: 1 })
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/merchants')
        .query({ limit: 2, page: 2 })
        .expect(200);

      expect(page1.body.meta.page).toBe(1);
      expect(page2.body.meta.page).toBe(2);
    });

    it('should return 404 for non-existent merchant when creating location', async () => {
      const createLocationDto = {
        name: 'Test Location',
        address: '123 Test St',
        city: 'Test City',
        state: 'NY',
        zipCode: '10001',
      };

      await request(app.getHttpServer())
        .post('/merchants/non-existent-id/locations')
        .send(createLocationDto)
        .expect(404);
    });

    it('should return 404 for non-existent merchant when creating service', async () => {
      const createServiceDto = {
        name: 'Test Service',
        type: 'DRY_CLEANING',
        pricingModel: 'PER_ITEM',
        basePrice: 15.99,
      };

      await request(app.getHttpServer())
        .post('/merchants/non-existent-id/services')
        .send(createServiceDto)
        .expect(404);
    });
  });
});
