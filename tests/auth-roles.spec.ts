import { test, expect } from '@playwright/test';
import { login, trackPageErrors } from './helpers';

/**
 * Auth + role derivation: logging in with a given email prefix must land the
 * user on the matching role dashboard. This exercises the real login form AND
 * the email->role logic in LoginCredentials + the routing in LoginSuccess.
 */

const roleCases = [
  { email: 'senior@nxus.test', expectUrl: /\/senior-scout$/, role: 'Senior Scout' },
  { email: 'lead@nxus.test', expectUrl: /\/lead-scout$/, role: 'Lead Scout' },
  { email: 'head@nxus.test', expectUrl: /\/head-scout$/, role: 'Head Scout' },
  { email: 'country@nxus.test', expectUrl: /\/country-scout$/, role: 'Country Scout' },
  { email: 'someone@nxus.test', expectUrl: /\/country-scout$/, role: 'Country Scout (default)' },
];

for (const { email, expectUrl, role } of roleCases) {
  test(`login as ${email} -> ${role}`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await login(page, email);

    await expect(page).toHaveURL(expectUrl);
    await expect(page.locator('#root')).not.toBeEmpty();

    expect(errors, `no uncaught exceptions during ${role} login`).toHaveLength(0);
  });
}

test('cannot submit login with empty fields', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /sign in/i }).click();
  // Required inputs block submission — we stay on the login screen.
  await expect(page).toHaveURL(/\/(login)?$/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});
