import { test as teardown } from '@playwright/test';
import { cleanupE2EJobs } from './helpers';

teardown('remove e2e jobs', async () => {
  await cleanupE2EJobs();
});
