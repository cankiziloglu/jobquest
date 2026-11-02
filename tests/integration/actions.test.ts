/**
 * Integration tests for server actions against a real Postgres database.
 * Requires DATABASE_URL (see .env.test.example) and `pnpm test:db:push`.
 * Auth and Next.js cache revalidation are mocked; everything else is real.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ userId: null as string | null }));

vi.mock('@/lib/auth', () => ({
  requireUserIdStrict: async () => {
    if (!auth.userId) throw new Error('Unauthorized: User must be authenticated');
    return auth.userId;
  },
  requireUserId: async () => auth.userId,
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from 'next/cache';
import * as actions from '@/server/actions';
import { prisma } from './db';

const ALICE = 'user_alice';
const BOB = 'user_bob';

async function as<T>(userId: string | null, fn: () => Promise<T>) {
  const prev = auth.userId;
  auth.userId = userId;
  try {
    return await fn();
  } finally {
    auth.userId = prev;
  }
}

beforeEach(async () => {
  await prisma.note.deleteMany();
  await prisma.job.deleteMany();
  vi.mocked(revalidatePath).mockClear();
  auth.userId = ALICE;
});

afterAll(async () => {
  await prisma.note.deleteMany();
  await prisma.job.deleteMany();
  await prisma.$disconnect();
});

describe('authentication', () => {
  it.each<[string, () => Promise<unknown>]>([
    ['getJobs', () => actions.getJobs()],
    ['getJob', () => actions.getJob('cjld2cjxh0000qzrmn831i7rn')],
    ['createJob', () => actions.createJob({ title: 'a', company: 'b' } as never)],
    ['updateJob', () => actions.updateJob('cjld2cjxh0000qzrmn831i7rn', { title: 'x' })],
    ['deleteJob', () => actions.deleteJob('cjld2cjxh0000qzrmn831i7rn')],
    ['createNote', () => actions.createNote('cjld2cjxh0000qzrmn831i7rn', 'hi')],
    ['updateNote', () => actions.updateNote('cjld2cjxh0000qzrmn831i7rn', 'hi')],
    ['deleteNote', () => actions.deleteNote('cjld2cjxh0000qzrmn831i7rn')],
  ])('%s rejects unauthenticated calls', async (_name, call) => {
    await expect(as(null, call)).rejects.toThrow(/Unauthorized/);
  });
});

describe('jobs', () => {
  it('creates a job owned by the current user and revalidates pages', async () => {
    const job = await actions.createJob({
      title: 'Frontend Dev',
      company: 'Acme',
      jobUrl: '',
      workArrangement: 'REMOTE',
    } as never);

    expect(job).toMatchObject({
      userId: ALICE,
      title: 'Frontend Dev',
      company: 'Acme',
      status: 'WISHLIST',
      jobUrl: null,
      workArrangement: 'REMOTE',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/jobs');
    expect(revalidatePath).toHaveBeenCalledWith('/kanban');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('ignores a client-supplied userId', async () => {
    const job = await actions.createJob({ title: 'a', company: 'b', userId: BOB } as never);
    expect(job.userId).toBe(ALICE);
  });

  it('rejects invalid input', async () => {
    await expect(actions.createJob({ title: '', company: 'b' } as never)).rejects.toThrow();
    expect(await prisma.job.count()).toBe(0);
  });

  it('lists only the current user\'s jobs, newest first, with notes', async () => {
    const first = await actions.createJob({ title: 'First', company: 'A' } as never);
    await new Promise((r) => setTimeout(r, 10));
    await actions.createJob({ title: 'Second', company: 'B' } as never);
    await as(BOB, () => actions.createJob({ title: 'Bobs', company: 'C' } as never));
    await actions.createNote(first.id, 'A note');

    const jobs = await actions.getJobs();
    expect(jobs.map((j) => j.title)).toEqual(['Second', 'First']);
    expect(jobs[1].notes).toHaveLength(1);
  });

  it('getJob returns null for another user\'s job', async () => {
    const bobsJob = await as(BOB, () =>
      actions.createJob({ title: 'Bobs', company: 'C' } as never),
    );
    await expect(actions.getJob(bobsJob.id)).resolves.toBeNull();
    await expect(as(BOB, () => actions.getJob(bobsJob.id))).resolves.toMatchObject({
      title: 'Bobs',
    });
  });

  it('getJob rejects an invalid id', async () => {
    await expect(actions.getJob('not a cuid')).rejects.toThrow();
  });

  it('updates a job', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    const updated = await actions.updateJob(job.id, {
      title: 'Senior Dev',
      location: 'Berlin',
      status: 'APPLIED',
    });
    expect(updated).toMatchObject({ title: 'Senior Dev', location: 'Berlin', status: 'APPLIED' });
  });

  it('supports status-only updates (kanban drag & drop)', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    const updated = await actions.updateJob(job.id, { status: 'INTERVIEW' });
    expect(updated.status).toBe('INTERVIEW');
  });

  it('rejects an invalid status on status-only updates', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    await expect(actions.updateJob(job.id, { status: 'HIRED' as never })).rejects.toThrow();
    expect((await prisma.job.findUnique({ where: { id: job.id } }))?.status).toBe('WISHLIST');
  });

  it('does not let a user update another user\'s job', async () => {
    const bobsJob = await as(BOB, () =>
      actions.createJob({ title: 'Bobs', company: 'C' } as never),
    );
    await expect(actions.updateJob(bobsJob.id, { title: 'Hacked' })).rejects.toThrow(
      /not found or access denied/,
    );
    expect((await prisma.job.findUnique({ where: { id: bobsJob.id } }))?.title).toBe('Bobs');
  });

  it('does not allow changing ownership via update', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    await actions.updateJob(job.id, { title: 'Dev 2', userId: BOB } as never);
    expect((await prisma.job.findUnique({ where: { id: job.id } }))?.userId).toBe(ALICE);
  });

  it('deletes a job and cascades its notes', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    await actions.createNote(job.id, 'note');
    await actions.deleteJob(job.id);
    expect(await prisma.job.count()).toBe(0);
    expect(await prisma.note.count()).toBe(0);
  });

  it('does not let a user delete another user\'s job', async () => {
    const bobsJob = await as(BOB, () =>
      actions.createJob({ title: 'Bobs', company: 'C' } as never),
    );
    await expect(actions.deleteJob(bobsJob.id)).rejects.toThrow(/not found or access denied/);
    expect(await prisma.job.count()).toBe(1);
  });
});

describe('notes', () => {
  it('creates, updates and deletes a note', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    const note = await actions.createNote(job.id, '  Phone screen went well  ');
    expect(note).toMatchObject({ jobId: job.id, content: 'Phone screen went well' });

    const updated = await actions.updateNote(note.id, 'Onsite next week');
    expect(updated.content).toBe('Onsite next week');

    await actions.deleteNote(note.id);
    expect(await prisma.note.count()).toBe(0);
  });

  it('getJob returns notes newest first', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    await actions.createNote(job.id, 'older');
    await new Promise((r) => setTimeout(r, 10));
    await actions.createNote(job.id, 'newer');
    const fetched = await actions.getJob(job.id);
    expect(fetched?.notes.map((n) => n.content)).toEqual(['newer', 'older']);
  });

  it('rejects empty note content', async () => {
    const job = await actions.createJob({ title: 'Dev', company: 'A' } as never);
    await expect(actions.createNote(job.id, '   ')).rejects.toThrow();
    expect(await prisma.note.count()).toBe(0);
  });

  it('does not let a user add, edit or delete notes on another user\'s job', async () => {
    const bobsJob = await as(BOB, () =>
      actions.createJob({ title: 'Bobs', company: 'C' } as never),
    );
    const bobsNote = await as(BOB, () => actions.createNote(bobsJob.id, 'secret'));

    await expect(actions.createNote(bobsJob.id, 'spam')).rejects.toThrow(/access denied/);
    await expect(actions.updateNote(bobsNote.id, 'hacked')).rejects.toThrow(/access denied/);
    await expect(actions.deleteNote(bobsNote.id)).rejects.toThrow(/access denied/);

    const notes = await prisma.note.findMany();
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe('secret');
  });
});
