import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test, type Page } from '@playwright/test';
import { uniqueTitle } from './helpers';

test.describe.configure({ mode: 'serial' });

const title = uniqueTitle('Staff Engineer');
const editedTitle = `${title} (edited)`;
const company = 'E2E Corp';

test.beforeEach(async ({ page }) => {
  await setupClerkTestingToken({ page });
});

function row(page: Page, text: string) {
  return page.getByRole('row').filter({ hasText: text });
}

async function openRowMenu(page: Page, text: string) {
  await row(page, text).getByRole('button', { name: 'Open menu' }).click();
}

async function totalApplications(page: Page) {
  await page.goto('/dashboard');
  const card = page.getByText('Total Applications', { exact: true }).locator('../..');
  return Number(await card.locator('.font-bold').innerText());
}

test('signed-in users are redirected from / to the dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('header navigation works', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Jobs' }).click();
  await expect(page.getByRole('heading', { name: 'Job Applications' })).toBeVisible();
  await page.getByRole('link', { name: 'Kanban' }).click();
  await expect(page.getByRole('heading', { name: 'Kanban Board' })).toBeVisible();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('create a job from the jobs table', async ({ page }) => {
  const before = await totalApplications(page);

  await page.goto('/jobs');
  await page.getByRole('button', { name: 'Add Job' }).filter({ visible: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Add New Job')).toBeVisible();

  // Validation
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog.getByText('Job title is required')).toBeVisible();

  await dialog.getByLabel(/Job Title/).fill(title);
  await dialog.getByLabel(/Company/).fill(company);
  await dialog.getByPlaceholder('e.g., San Francisco, CA').fill('Remote, EU');
  await dialog.getByPlaceholder('https://...').fill('https://example.com/job');
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog).toBeHidden();

  await expect(row(page, title)).toBeVisible();
  await page.reload();
  await expect(row(page, title)).toBeVisible();

  expect(await totalApplications(page)).toBe(before + 1);
});

test('search filters the table', async ({ page }) => {
  await page.goto('/jobs');
  await page.getByPlaceholder('Search jobs...').fill(title);
  await expect(row(page, title)).toBeVisible();
  await page.getByPlaceholder('Search jobs...').fill('zzz-no-such-job-zzz');
  await expect(row(page, title)).toHaveCount(0);
});

test('add a note from the job details dialog', async ({ page }) => {
  await page.goto('/jobs');
  await openRowMenu(page, title);
  await page.getByRole('menuitem', { name: 'View details' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: title })).toBeVisible();
  await expect(dialog.getByText('Notes (0)')).toBeVisible();

  await dialog.getByRole('button', { name: 'Add Note' }).click();
  await dialog.getByPlaceholder('Enter your note...').fill('Recruiter call on Monday');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog.getByText('Recruiter call on Monday')).toBeVisible();
  await expect(dialog.getByText('Notes (1)')).toBeVisible();

  // Persisted
  await page.reload();
  await openRowMenu(page, title);
  await page.getByRole('menuitem', { name: 'View details' }).click();
  await expect(page.getByRole('dialog').getByText('Recruiter call on Monday')).toBeVisible();
});

test('edit a job', async ({ page }) => {
  await page.goto('/jobs');
  await openRowMenu(page, title);
  await page.getByRole('menuitem', { name: 'Edit job' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Edit Job')).toBeVisible();
  await expect(dialog.getByLabel(/Job Title/)).toHaveValue(title);
  await dialog.getByLabel(/Job Title/).fill(editedTitle);
  await dialog.getByRole('button', { name: 'Update' }).click();
  await expect(dialog).toBeHidden();

  await page.reload();
  await expect(row(page, editedTitle)).toBeVisible();
});

test('drag a job between kanban columns', async ({ page }) => {
  await page.goto('/kanban');
  const wishlist = page.getByTestId('kanban-column-WISHLIST');
  const applied = page.getByTestId('kanban-column-APPLIED');
  const card = wishlist.getByText(editedTitle);
  await expect(card).toBeVisible();

  // dnd-kit uses pointer events with an 8px activation distance, so move in steps
  const from = await card.boundingBox();
  const to = await applied.boundingBox();
  if (!from || !to) throw new Error('missing bounding boxes');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 20, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + 60, { steps: 20 });
  await page.mouse.up();

  await expect(applied.getByText(editedTitle)).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('kanban-column-APPLIED').getByText(editedTitle)).toBeVisible();
});

test('open job details from a kanban card', async ({ page }) => {
  await page.goto('/kanban');
  await page.getByTestId('kanban-column-APPLIED').getByText(editedTitle).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: editedTitle })).toBeVisible();
  await expect(dialog.getByText('APPLIED')).toBeVisible();
});

test('delete a job', async ({ page }) => {
  await page.goto('/jobs');
  page.once('dialog', (d) => d.accept());
  await openRowMenu(page, editedTitle);
  await page.getByRole('menuitem', { name: 'Delete job' }).click();
  await expect(row(page, editedTitle)).toHaveCount(0);
  await page.reload();
  await expect(row(page, editedTitle)).toHaveCount(0);
});
