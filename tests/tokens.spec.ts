import { test, expect } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * The public Tokens page: developers download the design tokens here without
 * logging in. Guards the page and every file it links to, so a broken build step
 * shows up in CI instead of as a 404 for the devs.
 */
const FILES = ['tokens.css', 'tailwind.preset.cjs', '_tokens.scss', 'tokens.json', 'manifest.json'];

test('tokens page loads without login and lists the downloads', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto('/tokens');

  await expect(page.getByRole('heading', { name: 'NXUS design tokens' })).toBeVisible();
  await expect(page.getByRole('link', { name: /download/i })).toHaveCount(4);
  await expect(page.getByText(/^Version [0-9a-f]{8}/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Colour roles' })).toBeVisible();

  expect(errors, 'no uncaught exceptions on the tokens page').toHaveLength(0);
});

for (const file of FILES) {
  test(`token file ${file} is served`, async ({ request }) => {
    const res = await request.get(`/downloads/tokens/${file}`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
    expect(body).not.toContain('<!doctype html>'); // not the SPA fallback
  });
}
