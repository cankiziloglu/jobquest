import { Job, Note, JobStatus, WorkArrangement } from './generated/prisma';

// Re-export Prisma types for easy use throughout the app
export type { Job, Note, JobStatus, WorkArrangement };

// You can also create custom types based on Prisma types
export type JobWithNotes = Job & {
  notes: Note[];
};

export type CreateJobInput = Omit<
  Job,
  'id' | 'createdAt' | 'updatedAt' | 'notes'
>;

export type UpdateJobInput = Partial<
  Omit<Job, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'notes'>
>;
