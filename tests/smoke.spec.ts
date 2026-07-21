import { test, expect } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Smoke tests: every key screen loads and renders without crashing.
 * These are shallow by design — they catch "the whole page is blank / threw".
 */

test('login page loads with the sign-in form', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

  expect(errors, 'no uncaught exceptions on the login page').toHaveLength(0);
});

// Dashboards fall back to a default role when opened directly (empty session),
// so deep links should render the app shell, not a blank page or a 404.
const directRoutes = [
  { path: '/country-scout', label: 'Country Scout dashboard' },
  { path: '/head-scout', label: 'Head Scout dashboard' },
  { path: '/lead-scout', label: 'Lead Scout dashboard' },
  { path: '/senior-scout', label: 'Senior Scout dashboard' },
  { path: '/players', label: 'Players view' },
  { path: '/matches', label: 'Matches view' },
];

for (const { path, label } of directRoutes) {
  test(`deep link ${path} renders (${label})`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto(path);

    // App shell mounted: the root has content and the URL was preserved
    // (i.e. history fallback worked and we were not bounced to a 404).
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByText(/page not found/i)).toHaveCount(0);

    expect(errors, `no uncaught exceptions on ${path}`).toHaveLength(0);
  });
}

test('unknown route shows the 404 page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
});
