import { test, expect } from '@playwright/test';

/**
 * Token downloads. The page lives in Storybook (Guides/Design Tokens); the files are
 * generated into public/downloads/tokens and served by the app at /downloads/tokens.
 * Guards every file, so a broken build step shows up in CI instead of as a 404 for
 * the devs, and keeps the old /tokens address pointing at the Storybook page.
 */
const FILES = ['tokens.css', 'tailwind.preset.cjs', '_tokens.scss', 'tokens.json', 'manifest.json'];

test('/tokens redirects to the Storybook Design Tokens page', async ({ page }) => {
  await page.goto('/tokens');
  await expect(page).toHaveURL(/\/storybook\/\?path=\/docs\/guides-design-tokens--docs$/);
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
