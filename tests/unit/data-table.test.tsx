import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createColumns, type JobWithNotes } from '@/app/(private)/jobs/columns';
import { DataTable } from '@/app/(private)/jobs/data-table';

const job = (overrides: Partial<JobWithNotes>): JobWithNotes => ({
  id: 'id',
  userId: 'user_1',
  title: 'Title',
  company: 'Company',
  description: null,
  location: null,
  salary: null,
  jobUrl: null,
  workArrangement: null,
  status: 'WISHLIST',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  notes: [],
  ...overrides,
});

const jobs = [
  job({ id: 'a', title: 'Backend Engineer', company: 'Zeta', status: 'APPLIED', workArrangement: 'REMOTE' }),
  job({ id: 'b', title: 'Android Developer', company: 'Alpha', status: 'OFFER', workArrangement: 'ON_SITE' }),
  job({ id: 'c', title: 'Cloud Architect', company: 'Mid', status: 'APPLIED', workArrangement: 'HYBRID' }),
];

function setup() {
  const handlers = { onView: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), onAdd: vi.fn() };
  const columns = createColumns(handlers.onView, handlers.onEdit, handlers.onDelete);
  render(<DataTable columns={columns} data={jobs} onAddJob={handlers.onAdd} />);
  return handlers;
}

const bodyTitles = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => within(r).queryAllByRole('cell')[0]?.textContent ?? '');

describe('DataTable (jobs)', () => {
  it('renders a row per job', () => {
    setup();
    expect(screen.getAllByRole('row')).toHaveLength(jobs.length + 1);
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('filters rows by the search box', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText('Search jobs...'), 'cloud');
    expect(bodyTitles()).toEqual([expect.stringContaining('Cloud Architect')]);
  });

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText('Search jobs...'), 'nope');
    expect(screen.getByText('No jobs found.')).toBeInTheDocument();
  });

  it('sorts by title when the header is clicked', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByText('Job Title'));
    const titles = bodyTitles();
    expect(titles[0]).toContain('Android Developer');
    expect(titles[2]).toContain('Cloud Architect');
    await user.click(screen.getByText('Job Title'));
    expect(bodyTitles()[0]).toContain('Cloud Architect');
  });

  it('wires the add, view, edit and delete actions', async () => {
    const user = userEvent.setup();
    const handlers = setup();
    await user.click(screen.getAllByRole('button', { name: 'Add Job' })[0]);
    expect(handlers.onAdd).toHaveBeenCalled();

    const row = screen.getAllByRole('row').find((r) => r.textContent?.includes('Backend Engineer'))!;
    await user.click(within(row).getByRole('button', { name: 'Open menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete job' }));
    expect(handlers.onDelete).toHaveBeenCalledWith('a');

    await user.click(within(row).getByRole('button', { name: 'Open menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Edit job' }));
    expect(handlers.onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });
});
