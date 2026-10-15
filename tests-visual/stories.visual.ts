import { test, expect } from '@playwright/test';
import fs from 'fs';
import { stabilise, settle } from './stable';

/**
 * One screenshot per Storybook story (docs pages are skipped — they are prose).
 * The list comes from storybook-static/index.json, so a new story is picked up
 * automatically and reported as "new" until its baseline is accepted.
 */
const SB = 'http://localhost:6007';
const index = JSON.parse(fs.readFileSync('storybook-static/index.json', 'utf8'));
const stories = Object.values(index.entries as Record<string, { id: string; title: string; name: string; type: string }>)
  .filter((e) => e.type === 'story');

for (const s of stories) {
  test(`story ${s.title} / ${s.name}`, async ({ page }) => {
    await stabilise(page);
    await page.goto(`${SB}/iframe.html?id=${s.id}&viewMode=story`);
    await page.locator('#storybook-root').waitFor({ state: 'attached' });
    await settle(page);
    // Full page rather than #storybook-root: dialogs, menus and toasts render in a
    // portal outside the root, and would otherwise be invisible to the check.
    await expect(page).toHaveScreenshot(`stories/${s.id}.png`, { fullPage: true });
  });
}
