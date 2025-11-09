import { requireUserId } from '@/lib/auth';
import { getJobs } from '@/server/actions';
import KanbanClient from './kanban-client';

export default async function Kanban() {
  // Ensure user is authenticated before rendering the page
  await requireUserId();

  // Fetch jobs for the authenticated user
  const jobs = await getJobs();

  return (
    <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8'>
      <KanbanClient initialJobs={jobs} />
    </div>
  );
}
