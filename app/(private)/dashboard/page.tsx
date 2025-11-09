import { requireUserId } from '@/lib/auth';
import { getJobs } from '@/server/actions';
import DashboardClient from './dashboard-client';

export default async function Dashboard() {
  // Ensure user is authenticated before rendering the page
  await requireUserId();

  // Fetch jobs for the authenticated user
  const jobs = await getJobs();

  return (
    <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8'>
      <DashboardClient jobs={jobs} />
    </div>
  );
}
