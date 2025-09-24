import { z } from 'zod';
import { JobStatus, WorkArrangement } from '@/lib/generated/prisma';

// URL validation helper
const urlSchema = z
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .optional()
  .transform((val) => (val === '' ? undefined : val));

// Job validation schemas
export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be under 200 characters'),
  company: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be under 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  location: z
    .string()
    .max(100, 'Location must be under 100 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  salary: z
    .string()
    .max(100, 'Salary must be under 100 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  jobUrl: urlSchema,
  workArrangement: z
    .enum(WorkArrangement)
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  status: z.enum(JobStatus).default(JobStatus.WISHLIST),
});

export const updateJobSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be under 200 characters')
    .trim()
    .optional(),
  company: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be under 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  location: z
    .string()
    .max(100, 'Location must be under 100 characters')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  salary: z
    .string()
    .max(100, 'Salary must be under 100 characters')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  jobUrl: urlSchema,
  workArrangement: z
    .enum(WorkArrangement)
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  status: z.enum(JobStatus).optional(),
});

// Note validation schemas
export const createNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty')
    .max(5000, 'Note content must be under 5000 characters')
    .trim(),
  jobId: z.cuid('Invalid job ID'),
});

export const updateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty')
    .max(5000, 'Note content must be under 5000 characters')
    .trim(),
});

// ID validation schema for operations requiring valid CUIDs (used by Prisma @default(cuid()))
export const idSchema = z.cuid('Invalid ID format');

// Type exports for use in components
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
