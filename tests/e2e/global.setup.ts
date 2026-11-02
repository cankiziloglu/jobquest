import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const authFile = path.join(__dirname, '.auth/user.json');

setup.describe.configure({ mode: 'serial' });

setup('configure Clerk testing token', async () => {
  // Fetches a Testing Token so Clerk's bot protection doesn't block the browser
  await clerkSetup();
});

setup('sign in test user', async ({ page }) => {
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;
  if (!emailAddress) throw new Error('E2E_CLERK_USER_EMAIL must be set (see .env.test.example)');

  await page.goto('/');
  // Signs in via a backend-issued sign-in token: works regardless of whether the
  // instance uses passwords or email OTP.
  await clerk.signIn({ page, emailAddress });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
