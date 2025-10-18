import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('DriversController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DriversController],
      providers: [DriversService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /drivers', () => {
    it('should return paginated drivers list', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
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

    it('should filter drivers by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .query({ status: 'AVAILABLE' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].status).toBe('AVAILABLE');
      }
    });

    it('should filter drivers by vehicle type', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .query({ vehicleType: 'CAR' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter drivers by background check status', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .query({ backgroundCheckStatus: 'APPROVED' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].backgroundCheckStatus).toBe('APPROVED');
      }
    });
  });

  describe('GET /drivers/:id', () => {
    it('should return driver details with relationships', async () => {
      // First get a driver ID from the list
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/drivers/${driverId}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('firstName');
        expect(response.body).toHaveProperty('lastName');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('vehicleType');
        expect(response.body).toHaveProperty('backgroundCheckStatus');
        expect(response.body).toHaveProperty('rating');
      }
    });

    it('should return 404 for non-existent driver', async () => {
      await request(app.getHttpServer())
        .get('/drivers/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /drivers/nearby', () => {
    it('should return nearby drivers within radius', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 10000,
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('distance');
        expect(response.body[0]).toHaveProperty('status');
        expect(response.body[0].status).toBe('AVAILABLE');
      }
    });

    it('should filter nearby drivers by vehicle type', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 10000,
          vehicleType: 'CAR',
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should limit number of nearby drivers returned', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 10000,
          limit: 3,
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(3);
    });

    it('should validate required coordinates', async () => {
      await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({ radiusMeters: 10000 })
        .expect(400);
    });

    it('should sort drivers by distance', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 50000,
        })
        .expect(200);

      if (response.body.length > 1) {
        for (let i = 1; i < response.body.length; i++) {
          expect(response.body[i].distance).toBeGreaterThanOrEqual(
            response.body[i - 1].distance,
          );
        }
      }
    });
  });

  describe('GET /drivers/:id/stats', () => {
    it('should return driver statistics', async () => {
      // Get a driver ID
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/drivers/${driverId}/stats`)
          .expect(200);

        expect(response.body).toHaveProperty('totalPickups');
        expect(response.body).toHaveProperty('totalDeliveries');
        expect(response.body).toHaveProperty('totalEarnings');
        expect(response.body).toHaveProperty('averageRating');
        expect(response.body).toHaveProperty('completionRate');
        expect(response.body).toHaveProperty('totalReviews');
      }
    });

    it('should return 404 for non-existent driver', async () => {
      await request(app.getHttpServer())
        .get('/drivers/non-existent-id/stats')
        .expect(404);
    });
  });

  describe('PATCH /drivers/:id/status', () => {
    it('should update driver status to AVAILABLE', async () => {
      // Get a driver
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/status`)
          .send({ status: 'AVAILABLE' })
          .expect(200);

        expect(response.body.status).toBe('AVAILABLE');
      }
    });

    it('should update driver status to BUSY', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/status`)
          .send({ status: 'BUSY' })
          .expect(200);

        expect(response.body.status).toBe('BUSY');
      }
    });

    it('should update driver status to OFFLINE', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/status`)
          .send({ status: 'OFFLINE' })
          .expect(200);

        expect(response.body.status).toBe('OFFLINE');
      }
    });

    it('should validate status enum values', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/status`)
          .send({ status: 'INVALID_STATUS' })
          .expect(400);
      }
    });
  });

  describe('PATCH /drivers/:id/location', () => {
    it('should update driver current location', async () => {
      // Get a driver
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const updateLocationDto = {
          latitude: 40.7589,
          longitude: -73.9851,
        };

        const response = await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/location`)
          .send(updateLocationDto)
          .expect(200);

        expect(response.body.currentLatitude).toBe(40.7589);
        expect(response.body.currentLongitude).toBe(-73.9851);
      }
    });

    it('should validate latitude and longitude values', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const invalidDto = {
          latitude: 200, // Invalid latitude
          longitude: -73.9851,
        };

        await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/location`)
          .send(invalidDto)
          .expect(400);
      }
    });

    it('should validate required fields', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const invalidDto = {
          latitude: 40.7589,
          // Missing longitude
        };

        await request(app.getHttpServer())
          .patch(`/drivers/${driverId}/location`)
          .send(invalidDto)
          .expect(400);
      }
    });
  });

  describe('PATCH /drivers/:id', () => {
    it('should update driver profile information', async () => {
      // Get a driver
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const updateDto = {
          vehicleModel: 'Honda Civic 2024',
          vehiclePlate: 'ABC-1234',
        };

        const response = await request(app.getHttpServer())
          .patch(`/drivers/${driverId}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.vehicleModel).toBe('Honda Civic 2024');
        expect(response.body.vehiclePlate).toBe('ABC-1234');
      }
    });
  });

  describe('GET /drivers/:id/earnings', () => {
    it('should return driver earnings summary', async () => {
      // Get a driver
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/drivers/${driverId}/earnings`)
          .expect(200);

        expect(response.body).toHaveProperty('totalEarnings');
        expect(response.body).toHaveProperty('thisWeek');
        expect(response.body).toHaveProperty('thisMonth');
        expect(response.body).toHaveProperty('lastMonth');
        expect(typeof response.body.totalEarnings).toBe('number');
      }
    });

    it('should filter earnings by date range', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 });

      if (listResponse.body.data.length > 0) {
        const driverId = listResponse.body.data[0].id;

        const startDate = new Date('2024-01-01').toISOString();
        const endDate = new Date('2024-12-31').toISOString();

        const response = await request(app.getHttpServer())
          .get(`/drivers/${driverId}/earnings`)
          .query({ startDate, endDate })
          .expect(200);

        expect(response.body).toHaveProperty('totalEarnings');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 2, page: 1 })
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 2, page: 2 })
        .expect(200);

      expect(page1.body.meta.page).toBe(1);
      expect(page2.body.meta.page).toBe(2);
    });

    it('should return empty array when no drivers match filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .query({ status: 'AVAILABLE', vehicleType: 'BICYCLE' })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 when updating non-existent driver', async () => {
      await request(app.getHttpServer())
        .patch('/drivers/non-existent-id/status')
        .send({ status: 'AVAILABLE' })
        .expect(404);
    });

    it('should validate numeric values for coordinates', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 'invalid',
          longitude: -74.006,
          radiusMeters: 10000,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should handle large radius searches', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 100000, // 100km
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return drivers with all required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers')
        .query({ limit: 1 })
        .expect(200);

      if (response.body.data.length > 0) {
        const driver = response.body.data[0];
        expect(driver).toHaveProperty('id');
        expect(driver).toHaveProperty('firstName');
        expect(driver).toHaveProperty('lastName');
        expect(driver).toHaveProperty('status');
        expect(driver).toHaveProperty('vehicleType');
        expect(driver).toHaveProperty('backgroundCheckStatus');
      }
    });
  });
});
