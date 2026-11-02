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

test('sign-in page shows the email sign-in form', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});

test('sign-up page renders', async ({ page }) => {
  await page.goto('/sign-up');
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});
