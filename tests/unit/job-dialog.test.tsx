import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const createJob = vi.fn();
const updateJob = vi.fn();
const refresh = vi.fn();

vi.mock('@/server/actions', () => ({
  createJob: (...args: unknown[]) => createJob(...args),
  updateJob: (...args: unknown[]) => updateJob(...args),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

import { JobDialog } from '@/app/(private)/jobs/job-dialog';

const existingJob = {
  id: 'cjld2cjxh0000qzrmn831i7rn',
  userId: 'user_1',
  title: 'Backend Dev',
  company: 'Globex',
  description: null,
  location: 'Berlin',
  salary: null,
  jobUrl: null,
  workArrangement: null,
  status: 'APPLIED' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: [],
};

describe('JobDialog', () => {
  beforeEach(() => {
    createJob.mockReset();
    updateJob.mockReset();
    refresh.mockReset();
  });

  it('shows validation errors and does not submit an empty form', async () => {
    const user = userEvent.setup();
    render(<JobDialog open onOpenChange={() => {}} />);

    expect(screen.getByText('Add New Job')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Job title is required')).toBeInTheDocument();
    expect(screen.getByText('Company name is required')).toBeInTheDocument();
    expect(createJob).not.toHaveBeenCalled();
  });

  it('creates a job with the entered values', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onJobSaved = vi.fn();
    const saved = { ...existingJob, title: 'Frontend Dev', company: 'Initech' };
    createJob.mockResolvedValue(saved);

    render(<JobDialog open onOpenChange={onOpenChange} onJobSaved={onJobSaved} />);
    await user.type(screen.getByLabelText(/Job Title/), 'Frontend Dev');
    await user.type(screen.getByLabelText(/Company/), 'Initech');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(createJob).toHaveBeenCalledTimes(1));
    expect(createJob.mock.calls[0][0]).toMatchObject({
      title: 'Frontend Dev',
      company: 'Initech',
      status: 'WISHLIST',
    });
    expect(onJobSaved).toHaveBeenCalledWith(saved);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(refresh).toHaveBeenCalled();
  });

  it('rejects an invalid job URL', async () => {
    const user = userEvent.setup();
    render(<JobDialog open onOpenChange={() => {}} />);
    await user.type(screen.getByLabelText(/Job Title/), 'Dev');
    await user.type(screen.getByLabelText(/Company/), 'Acme');
    await user.type(screen.getByPlaceholderText('https://...'), 'not a url');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Please enter a valid URL')).toBeInTheDocument();
    expect(createJob).not.toHaveBeenCalled();
  });

  it('pre-fills the form and calls updateJob when editing', async () => {
    const user = userEvent.setup();
    updateJob.mockResolvedValue({ ...existingJob, title: 'Backend Dev II' });

    render(<JobDialog open onOpenChange={() => {}} job={existingJob} />);
    expect(screen.getByText('Edit Job')).toBeInTheDocument();
    const title = screen.getByLabelText(/Job Title/);
    expect(title).toHaveValue('Backend Dev');
    expect(screen.getByLabelText(/Company/)).toHaveValue('Globex');

    await user.clear(title);
    await user.type(title, 'Backend Dev II');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => expect(updateJob).toHaveBeenCalledTimes(1));
    expect(updateJob.mock.calls[0][0]).toBe(existingJob.id);
    expect(updateJob.mock.calls[0][1]).toMatchObject({ title: 'Backend Dev II', company: 'Globex' });
  });
});
