import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { api } from '@/lib/api';

// Hardcoded demo user ID for public access
const DEMO_USER_ID = 'demo-user-001';

export const userRouter = router({
  getProfile: publicProcedure.query(async () => {
    const response = await api.get(`/users/${DEMO_USER_ID}`);

    return response.data;
  }),

  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        preferences: z.object({
          emailNotifications: z.boolean().optional(),
          smsNotifications: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await api.put(
        `/users/${DEMO_USER_ID}`,
        input
      );

      return response.data;
    }),

  getAddresses: publicProcedure.query(async () => {
    const response = await api.get(`/users/${DEMO_USER_ID}/addresses`);

    return response.data;
  }),

  createAddress: publicProcedure
    .input(
      z.object({
        label: z.string(),
        street: z.string(),
        apartment: z.string().optional(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        phone: z.string(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await api.post(
        `/users/${DEMO_USER_ID}/addresses`,
        input
      );

      return response.data;
    }),

  updateAddress: publicProcedure
    .input(
      z.object({
        addressId: z.string(),
        label: z.string().optional(),
        street: z.string().optional(),
        apartment: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { addressId, ...data } = input;
      const response = await api.put(
        `/users/${DEMO_USER_ID}/addresses/${addressId}`,
        data
      );

      return response.data;
    }),

  deleteAddress: publicProcedure
    .input(z.object({ addressId: z.string() }))
    .mutation(async ({ input }) => {
      const response = await api.delete(
        `/users/${DEMO_USER_ID}/addresses/${input.addressId}`
      );

      return response.data;
    }),
});
