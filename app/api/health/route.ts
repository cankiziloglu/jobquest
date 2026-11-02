import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Liveness + database connectivity check (no user data exposed)
export async function GET() {
  try {
    await getDb().$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: 'up' });
  } catch (error) {
    console.error('[health] database check failed', error);
    return Response.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
