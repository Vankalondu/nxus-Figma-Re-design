import type { Page } from '@playwright/test';

/**
 * Make a page render identically on every run, so a screenshot difference always
 * means the design changed — never the clock, the dice or a slow font.
 *   - Math.random is replaced by a seeded generator (generated players, stats).
 *   - The clock is frozen ("today", "3 days ago", calendars).
 *   - Screenshots wait for web fonts (Figtree / Plus Jakarta Sans come from Google), and the
 *     page is loaded twice: some components measure their text once, at first render, so a
 *     font that arrives a moment late shifts the layout. The second load has the fonts cached.
 */
export async function stabilise(page: Page) {
  await page.addInitScript(() => {
    let s = 20261015;
    Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  });
  await page.clock.setFixedTime(new Date('2026-10-15T09:00:00Z'));
}

export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}
