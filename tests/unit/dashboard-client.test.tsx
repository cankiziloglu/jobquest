import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import DashboardClient from '@/app/(private)/dashboard/dashboard-client';

beforeAll(() => {
  // recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const makeJob = (status: string, i: number) => ({
  id: `job${i}`,
  userId: 'user_1',
  title: `Job ${i}`,
  company: `Co ${i}`,
  description: null,
  location: null,
  salary: null,
  jobUrl: null,
  workArrangement: null,
  status,
  createdAt: new Date(),
  updatedAt: new Date(),
});

function statValue(title: string) {
  // CardTitle -> CardHeader -> Card
  const card = screen.getAllByText(title)[0].parentElement!.parentElement as HTMLElement;
  return within(card);
}

describe('DashboardClient', () => {
  it('renders zero counts and empty state with no jobs', () => {
    render(<DashboardClient jobs={[]} />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(statValue('Total Applications').getByText('0')).toBeInTheDocument();
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('counts jobs per status', () => {
    const jobs = [
      makeJob('WISHLIST', 1),
      makeJob('APPLIED', 2),
      makeJob('APPLIED', 3),
      makeJob('INTERVIEW', 4),
      makeJob('OFFER', 5),
      makeJob('REJECTED', 6),
      makeJob('REJECTED', 7),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<DashboardClient jobs={jobs as any} />);
    expect(statValue('Total Applications').getByText('7')).toBeInTheDocument();
    expect(statValue('Wishlist').getByText('1')).toBeInTheDocument();
    expect(statValue('Applied').getByText('2')).toBeInTheDocument();
    expect(statValue('Interviews').getByText('1')).toBeInTheDocument();
    expect(statValue('Offers').getByText('1')).toBeInTheDocument();
    expect(statValue('Rejected').getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });
});
