'use server';

import {
  PrismaClient,
  JobStatus,
  WorkArrangement,
} from '@/lib/generated/prisma';
import { requireUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Job CRUD Operations

export async function getJobs() {
  const userId = await requireUserId();

  return prisma.job.findMany({
    where: { userId },
    include: {
      notes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getJob(id: string) {
  const userId = await requireUserId();

  return prisma.job.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

export async function createJob(data: {
  title: string;
  company: string;
  description?: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  workArrangement?: WorkArrangement;
  status?: JobStatus;
}) {
  const userId = await requireUserId();

  const job = await prisma.job.create({
    data: {
      ...data,
      userId,
      status: data.status || JobStatus.WISHLIST,
    },
  });

  revalidatePath('/jobs');
  revalidatePath('/kanban');
  revalidatePath('/dashboard');
  return job;
}

export async function updateJob(
  id: string,
  data: {
    title?: string;
    company?: string;
    description?: string;
    location?: string;
    salary?: string;
    jobUrl?: string;
    workArrangement?: WorkArrangement;
    status?: JobStatus;
  }
) {
  const userId = await requireUserId();

  const job = await prisma.job.update({
    where: {
      id,
      userId,
    },
    data,
  });

  revalidatePath('/jobs');
  revalidatePath('/kanban');
  revalidatePath('/dashboard');
  return job;
}

export async function deleteJob(id: string) {
  const userId = await requireUserId();

  const job = await prisma.job.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath('/jobs');
  revalidatePath('/kanban');
  revalidatePath('/dashboard');
  return job;
}

// Note CRUD Operations

export async function createNote(jobId: string, content: string) {
  const userId = await requireUserId();

  // Verify the job belongs to the user
  const job = await prisma.job.findFirst({
    where: { id: jobId, userId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  const note = await prisma.note.create({
    data: {
      content,
      jobId,
    },
  });

  revalidatePath('/jobs');
  return note;
}

export async function updateNote(id: string, content: string) {
  const userId = await requireUserId();

  // Verify the note belongs to a job owned by the user
  const note = await prisma.note.findFirst({
    where: {
      id,
      job: {
        userId,
      },
    },
  });

  if (!note) {
    throw new Error('Note not found');
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: { content },
  });

  revalidatePath('/jobs');
  return updatedNote;
}

export async function deleteNote(id: string) {
  const userId = await requireUserId();

  // Verify the note belongs to a job owned by the user
  const note = await prisma.note.findFirst({
    where: {
      id,
      job: {
        userId,
      },
    },
  });

  if (!note) {
    throw new Error('Note not found');
  }

  const deletedNote = await prisma.note.delete({
    where: { id },
  });

  revalidatePath('/jobs');
  return deletedNote;
}
