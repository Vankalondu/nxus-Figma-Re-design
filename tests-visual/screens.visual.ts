import { test, expect } from '@playwright/test';
import { stabilise, settle } from './stable';

/**
 * Whole screens, not just components: developers change screens. Rendered from the
 * production build at the three NXUS breakpoints. Deep links render without logging
 * in (the app falls back to a default role), so no login step is needed.
 */
const APP = 'http://localhost:4174';
const SCREENS = [
  ['login', '/'],
  ['lead-overview', '/lead-scout'],
  ['lead-players-database', '/lead-scout/players?section=database'],
  ['lead-players-target', '/lead-scout/players?section=target-list'],
];
const WIDTHS = [390, 834, 1440];

for (const [name, path] of SCREENS) {
  for (const width of WIDTHS) {
    test(`screen ${name} @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await stabilise(page);
      await page.goto(`${APP}${path}`);
      await settle(page);
      await expect(page).toHaveScreenshot(`screens/${name}-${width}.png`);
    });
  }
}
