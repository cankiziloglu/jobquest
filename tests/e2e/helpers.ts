import { PrismaClient } from '../../lib/generated/prisma';

export const E2E_PREFIX = '[e2e]';

export function uniqueTitle(label: string) {
  return `${E2E_PREFIX} ${label} ${Date.now().toString(36)}`;
}

/** Deletes every job created by e2e runs (identified by title prefix). */
export async function cleanupE2EJobs() {
  const prisma = new PrismaClient();
  try {
    await prisma.job.deleteMany({ where: { title: { startsWith: E2E_PREFIX } } });
  } finally {
    await prisma.$disconnect();
  }
}
