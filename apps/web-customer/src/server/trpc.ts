import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// All procedures are now public - no authentication required
export const protectedProcedure = t.procedure;
