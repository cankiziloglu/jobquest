import { getJobs } from '@/server/actions';
import JobsClient from './jobs-client';

export default async function JobsPage() {
  const jobs = await getJobs();

  return <JobsClient initialJobs={jobs} />;
}
