import { getDb } from '@/lib/db';

// Same client the server actions use; used by tests to arrange/inspect state
export const prisma = getDb();
