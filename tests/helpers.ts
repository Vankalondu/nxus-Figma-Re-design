import { expect, type Page } from '@playwright/test';

/**
 * Attach a listener that fails the test on any UNCAUGHT exception (a real crash).
 * We deliberately do NOT assert on console.error — the app emits benign noise
 * (favicon 404, React dev hints) that would cause false failures.
 * Returns the collected error array so a test can assert on it explicitly.
 */
export function trackPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on('pageerror', (err) => errors.push(err));
  return errors;
}

/**
 * Drive the real (mock) login form. The app derives the role from the email
 * prefix, then LoginSuccess redirects to the role's dashboard after ~2.5s.
 * Waits until the URL leaves the login/interstitial screens.
 */
export async function login(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // LoginSuccess shows the interstitial, then navigates on a 2500ms timer.
  await expect(page).toHaveURL(/\/(country|head|lead|senior)-scout|\/matches/, {
    timeout: 15_000,
  });
}
