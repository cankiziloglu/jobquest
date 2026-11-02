'use server';

import {
  PrismaClient,
  JobStatus,
  WorkArrangement,
} from '@/lib/generated/prisma';
import { requireUserIdStrict } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  createJobSchema,
  updateJobSchema,
  createNoteSchema,
  updateNoteSchema,
  idSchema,
  CreateJobInput,
  UpdateJobInput,
} from '@/lib/schemas';

const prisma = new PrismaClient();

// Job CRUD Operations

export async function getJobs() {
  const userId = await requireUserIdStrict();

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
  const userId = await requireUserIdStrict();
  const validatedId = idSchema.parse(id);

  return prisma.job.findFirst({
    where: {
      id: validatedId,
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

export async function createJob(data: CreateJobInput) {
  const userId = await requireUserIdStrict();
  const validatedData = createJobSchema.parse(data);

  const job = await prisma.job.create({
    data: {
      ...validatedData,
      userId,
    },
  });

  revalidatePath('/jobs');
  revalidatePath('/kanban');
  revalidatePath('/dashboard');
  return job;
}

export async function updateJob(id: string, data: UpdateJobInput) {
  const userId = await requireUserIdStrict();
  const validatedId = idSchema.parse(id);
  const validatedData = updateJobSchema.parse(data);

  // Verify job exists and belongs to user before updating
  const existingJob = await prisma.job.findFirst({
    where: { id: validatedId, userId },
  });

  if (!existingJob) {
    throw new Error('Job not found or access denied');
  }

  const job = await prisma.job.update({
    where: {
      id: validatedId,
      userId,
    },
    data: validatedData,
  });

  revalidatePath('/jobs');
  revalidatePath('/kanban');
  revalidatePath('/dashboard');
  return job;
}

export async function deleteJob(id: string) {
  const userId = await requireUserIdStrict();
  const validatedId = idSchema.parse(id);

  // Verify job exists and belongs to user before deleting
  const existingJob = await prisma.job.findFirst({
    where: { id: validatedId, userId },
  });

  if (!existingJob) {
    throw new Error('Job not found or access denied');
  }

  const job = await prisma.job.delete({
    where: {
      id: validatedId,
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
  const userId = await requireUserIdStrict();
  const validatedData = createNoteSchema.parse({ jobId, content });

  // Verify the job belongs to the user
  const job = await prisma.job.findFirst({
    where: { id: validatedData.jobId, userId },
  });

  if (!job) {
    throw new Error('Job not found or access denied');
  }

  const note = await prisma.note.create({
    data: {
      content: validatedData.content,
      jobId: validatedData.jobId,
    },
  });

  revalidatePath('/jobs');
  return note;
}

export async function updateNote(id: string, content: string) {
  const userId = await requireUserIdStrict();
  const validatedId = idSchema.parse(id);
  const validatedData = updateNoteSchema.parse({ content });

  // Verify the note belongs to a job owned by the user
  const note = await prisma.note.findFirst({
    where: {
      id: validatedId,
      job: {
        userId,
      },
    },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const updatedNote = await prisma.note.update({
    where: { id: validatedId },
    data: { content: validatedData.content },
  });

  revalidatePath('/jobs');
  return updatedNote;
}

export async function deleteNote(id: string) {
  const userId = await requireUserIdStrict();
  const validatedId = idSchema.parse(id);

  // Verify the note belongs to a job owned by the user
  const note = await prisma.note.findFirst({
    where: {
      id: validatedId,
      job: {
        userId,
      },
    },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const deletedNote = await prisma.note.delete({
    where: { id: validatedId },
  });

  revalidatePath('/jobs');
  return deletedNote;
}
