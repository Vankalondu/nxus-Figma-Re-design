import { test, expect } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Responsive sanity: the app's tiers are Mobile (390), Tablet (834),
 * Desktop (1440). At every width the login page and a dashboard must render
 * without a horizontal scrollbar (a classic overflow/layout break).
 */

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function expectNoHorizontalScroll(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    // Allow a 1px rounding tolerance.
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, 'page should not scroll horizontally').toBeLessThanOrEqual(1);
}

for (const vp of viewports) {
  test(`login page has no horizontal overflow on ${vp.name}`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toHaveLength(0);
  });

  test(`dashboard has no horizontal overflow on ${vp.name}`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/country-scout');
    await expect(page.locator('#root')).not.toBeEmpty();
    await expectNoHorizontalScroll(page);
    expect(errors).toHaveLength(0);
  });
}
