import { cache } from 'react';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const isWorkers =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Returns a Prisma client.
 * - On Cloudflare Workers, I/O objects (sockets) can't be shared across requests,
 *   so a new client is created per request (memoized for the request via React cache).
 * - On Node.js (dev, tests, `next start`), a single client is reused.
 */
export const getDb: () => PrismaClient = isWorkers
  ? cache(createClient)
  : () => (globalForPrisma.prisma ??= createClient());
