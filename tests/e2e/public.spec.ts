import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await setupClerkTestingToken({ page });
});

test('landing page renders for signed-out visitors', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('JobQuest');
  await expect(
    page.getByRole('heading', { name: 'Track Your Job Applications Like a Pro' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible();
  // Private nav is hidden when signed out
  await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0);
});

for (const route of ['/dashboard', '/jobs', '/kanban']) {
  test(`${route} redirects signed-out visitors to sign in`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/sign-in/);
  });
}

// Available sign-in methods (email OTP, OAuth) are Clerk dashboard settings,
// so only assert that Clerk's form renders.
test('sign-in page renders the Clerk sign-in form', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: /sign in to jobquest/i })).toBeVisible();
});

test('sign-up page renders the Clerk sign-up form', async ({ page }) => {
  await page.goto('/sign-up');
  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
});
