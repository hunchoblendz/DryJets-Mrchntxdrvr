import { router } from '../trpc';
import { ordersRouter } from './orders';
import { userRouter } from './user';

export const appRouter = router({
  orders: ordersRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
