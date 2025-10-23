import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { api } from '@/lib/api';

// Hardcoded demo customer ID for public access
const DEMO_CUSTOMER_ID = 'demo-customer-001';

export const ordersRouter = router({
  getMyOrders: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const response = await api.get('/orders', {
        params: {
          ...input,
          customerId: DEMO_CUSTOMER_ID,
        },
      });

      return response.data;
    }),

  getOrderById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const response = await api.get(`/orders/${input.id}`);

      return response.data;
    }),

  getOrderStats: publicProcedure.query(async () => {
    const response = await api.get('/orders/stats');

    return response.data;
  }),

  createOrder: publicProcedure
    .input(
      z.object({
        serviceType: z.string(),
        items: z.array(
          z.object({
            type: z.string(),
            quantity: z.number(),
            specialInstructions: z.string().optional(),
          })
        ),
        pickupAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          apartment: z.string().optional(),
        }),
        deliveryAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          apartment: z.string().optional(),
        }),
        pickupDate: z.string(),
        pickupTimeSlot: z.string(),
        deliveryDate: z.string(),
        specialInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await api.post(
        '/orders',
        {
          ...input,
          customerId: DEMO_CUSTOMER_ID,
          status: 'PENDING',
        }
      );

      return response.data;
    }),

  cancelOrder: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await api.patch(
        `/orders/${input.orderId}/status`,
        {
          status: 'CANCELLED',
          notes: input.reason,
        }
      );

      return response.data;
    }),
});
