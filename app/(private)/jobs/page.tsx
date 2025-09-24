import { getJobs } from '@/server/actions';
import { requireUserId } from '@/lib/auth';
import JobsClient from './jobs-client';

export default async function JobsPage() {
  // Ensure user is authenticated before rendering the page
  await requireUserId();

  const jobs = await getJobs();

  return <JobsClient initialJobs={jobs} />;
}
