import { getDb } from '@/lib/db';

// Integration tests delete all rows between tests: refuse to run against anything
// but a local database unless explicitly allowed.
const url = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
  throw new Error(
    `Refusing to run destructive integration tests against non-local database host "${url.hostname}". ` +
      'Set DATABASE_URL in .env.test to a throwaway local database (or ALLOW_REMOTE_TEST_DB=1).',
  );
}

// Same client the server actions use; used by tests to arrange/inspect state
export const prisma = getDb();
