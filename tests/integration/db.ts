import { PrismaClient } from '@/lib/generated/prisma';

// Separate client used by tests to arrange/inspect database state directly
export const prisma = new PrismaClient();
