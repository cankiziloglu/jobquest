import { describe, expect, it } from 'vitest';
import {
  createJobSchema,
  updateJobSchema,
  createNoteSchema,
  updateNoteSchema,
  idSchema,
} from '@/lib/schemas';

const VALID_CUID = 'cjld2cjxh0000qzrmn831i7rn';

describe('createJobSchema', () => {
  it('accepts minimal valid input and defaults status to WISHLIST', () => {
    const result = createJobSchema.parse({ title: 'Dev', company: 'Acme' });
    expect(result).toMatchObject({ title: 'Dev', company: 'Acme', status: 'WISHLIST' });
  });

  it('accepts a fully populated job', () => {
    const input = {
      title: 'Senior Dev',
      company: 'Acme',
      description: 'Build things',
      location: 'Remote',
      salary: '$100k',
      jobUrl: 'https://acme.com/jobs/1',
      workArrangement: 'REMOTE',
      status: 'APPLIED',
    };
    expect(createJobSchema.parse(input)).toEqual(input);
  });

  it.each(['title', 'company'])('requires %s', (field) => {
    const input: Record<string, string> = { title: 'Dev', company: 'Acme' };
    input[field] = '';
    const result = createJobSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects a title longer than 200 characters', () => {
    const result = createJobSchema.safeParse({ title: 'a'.repeat(201), company: 'Acme' });
    expect(result.success).toBe(false);
  });

  it('rejects a description longer than 2000 characters', () => {
    const result = createJobSchema.safeParse({
      title: 'Dev',
      company: 'Acme',
      description: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('transforms empty optional strings to undefined', () => {
    const result = createJobSchema.parse({
      title: 'Dev',
      company: 'Acme',
      description: '',
      location: '',
      salary: '',
      jobUrl: '',
      workArrangement: '',
    });
    expect(result.description).toBeUndefined();
    expect(result.location).toBeUndefined();
    expect(result.salary).toBeUndefined();
    expect(result.jobUrl).toBeUndefined();
    expect(result.workArrangement).toBeUndefined();
  });

  it('rejects an invalid URL', () => {
    const result = createJobSchema.safeParse({ title: 'Dev', company: 'Acme', jobUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown enum values', () => {
    expect(
      createJobSchema.safeParse({ title: 'Dev', company: 'Acme', status: 'HIRED' }).success,
    ).toBe(false);
    expect(
      createJobSchema.safeParse({ title: 'Dev', company: 'Acme', workArrangement: 'MARS' }).success,
    ).toBe(false);
  });
});

describe('updateJobSchema', () => {
  it('allows partial updates', () => {
    expect(updateJobSchema.parse({ status: 'OFFER' })).toEqual({ status: 'OFFER' });
  });

  it('trims string fields', () => {
    expect(updateJobSchema.parse({ title: '  Dev  ' }).title).toBe('Dev');
  });

  it('rejects an empty title when provided', () => {
    expect(updateJobSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects an invalid status', () => {
    expect(updateJobSchema.safeParse({ status: 'HIRED' }).success).toBe(false);
  });
});

describe('note schemas', () => {
  it('accepts valid note input and trims content', () => {
    expect(createNoteSchema.parse({ content: '  hello ', jobId: VALID_CUID })).toEqual({
      content: 'hello',
      jobId: VALID_CUID,
    });
  });

  it('rejects empty or whitespace-only content', () => {
    expect(createNoteSchema.safeParse({ content: '', jobId: VALID_CUID }).success).toBe(false);
    expect(updateNoteSchema.safeParse({ content: '   ' }).success).toBe(false);
  });

  it('rejects content over 5000 characters', () => {
    expect(updateNoteSchema.safeParse({ content: 'a'.repeat(5001) }).success).toBe(false);
  });

  it('rejects an invalid job id', () => {
    expect(createNoteSchema.safeParse({ content: 'x', jobId: 'bad id!' }).success).toBe(false);
  });
});

describe('idSchema', () => {
  it('accepts a cuid', () => {
    expect(idSchema.parse(VALID_CUID)).toBe(VALID_CUID);
  });

  it.each(['', 'has spaces', 'DROP TABLE;'])('rejects %j', (value) => {
    expect(idSchema.safeParse(value).success).toBe(false);
  });
});
