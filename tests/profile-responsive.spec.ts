import { test, expect, type Page } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Player profile on phone and tablet, Request video, and who can ask whom (D-27):
 * compact header, sticky tabs (a dropdown on phone, one row on tablet), Request video →
 * Video Manager, and the REQUEST_ROUTING rules in the New task panel.
 */

async function as(page: Page, role: string) {
  await page.addInitScript(r => {
    sessionStorage.setItem('loginRole', r);
    sessionStorage.setItem('userRole', r);
  }, role);
}

test.describe('Profile — phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('tabs are a dropdown near the top; details fold away; Photo Library is one tap away', async ({ page }) => {
    const errors = trackPageErrors(page);
    await as(page, 'Senior Scout');
    await page.goto('/senior-scout/player/tl-0');
    await page.evaluate(() => window.scrollTo(0, 0));
    const menu = page.getByRole('button', { name: /^Videos & Highlights/ }).locator('visible=true');
    await expect(menu).toBeVisible();
    // Was ~900px down under the tall card; now right under the compact header.
    expect((await menu.boundingBox())!.y).toBeLessThan(420);

    // Player details and list history start closed, and open on tap.
    const details = page.locator('details').filter({ hasText: 'Player details' });
    await expect(details).not.toHaveAttribute('open', /.*/);
    await expect(details.getByText('Height')).toBeHidden();
    await details.getByText('Player details').click();
    await expect(details.getByText('Height')).toBeVisible();
    await expect(page.locator('details').filter({ hasText: 'List history' })).not.toHaveAttribute('open', /.*/);

    await menu.click();
    await page.getByRole('button', { name: 'Photo Library', exact: true }).locator('visible=true').click();
    await expect(page).toHaveURL(/tab=photos/);
    await expect(page.getByRole('button', { name: /^Photo Library/ }).locator('visible=true')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    expect(errors).toHaveLength(0);
  });

  test('the tab dropdown stays pinned while you scroll', async ({ page }) => {
    await as(page, 'Senior Scout');
    await page.goto('/senior-scout/player/tl-0?tab=videos');
    await page.evaluate(() => window.scrollTo(0, 1200));
    const menu = page.getByRole('button', { name: /^Videos & Highlights/ }).locator('visible=true');
    const y = (await menu.boundingBox())!.y;
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(40);
  });
});

test.describe('Profile — tablet', () => {
  test.use({ viewport: { width: 834, height: 1112 } });

  test('all six tabs fit in one row with no sideways scroll', async ({ page }) => {
    await as(page, 'Senior Scout');
    await page.goto('/senior-scout/player/tl-0');
    const names = ['Videos & Highlights', 'Statistics', 'Career History', 'Notes', 'Reports', 'Photo Library'];
    const tops: number[] = [];
    for (const n of names) {
      const tab = page.getByRole('button', { name: n, exact: true }).locator('visible=true');
      await expect(tab).toBeInViewport({ ratio: 1 });
      tops.push(Math.round((await tab.boundingBox())!.y));
    }
    expect(new Set(tops).size).toBe(1);
    const row = page.getByRole('button', { name: 'Photo Library', exact: true }).locator('visible=true').locator('..');
    expect(await row.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
});

test.describe('Request video', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Package sends a request to the Video Manager, with a success message', async ({ page }) => {
    await as(page, 'Lead Scout');
    await page.goto('/lead-scout/player/tl-0?tab=videos');
    const name = await page.getByRole('heading', { level: 1 }).locator('visible=true').innerText();
    await page.getByRole('button', { name: 'Request video' }).click();
    const menu = page.getByRole('menu', { name: 'Request video' });
    await expect(menu.getByRole('menuitem')).toHaveText(['Package', 'Full match', 'Both']);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);

    await page.getByRole('button', { name: 'Request video' }).click();
    await page.getByRole('menuitem', { name: 'Package' }).click();
    await expect(page.getByText('Video request sent to Marcus Ofori')).toBeVisible();
    await expect(page.getByText(`Package · ${name}`)).toBeVisible();

    // On my board under "Assigned by me"…
    await page.goto('/lead-scout?tab=tasks');
    await page.getByRole('button', { name: 'Assigned by me' }).click();
    await expect(page.getByTestId('tasks-board').getByRole('listitem', { name: `Video request (package): ${name}` }).first()).toBeVisible();
    // …and on the Video Manager's board.
    await page.goto('/video-manager?tab=tasks');
    await expect(page.getByTestId('tasks-board').getByRole('listitem', { name: `Video request (package): ${name}` }).first()).toBeVisible();
  });
});

test.describe('Who can ask whom (REQUEST_ROUTING)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a weekly report from a Senior scout can only go to Country and Head scouts', async ({ page }) => {
    await as(page, 'Senior Scout');
    await page.goto('/senior-scout?tab=tasks');
    await page.getByRole('button', { name: 'New task' }).click();
    const sheet = page.getByRole('dialog', { name: 'New task' });
    await sheet.getByLabel('Type', { exact: true }).selectOption('weekly-report');
    const roles = await sheet.getByRole('group', { name: 'Assign to' }).locator('label span.ml-auto').allInnerTexts();
    expect(roles.length).toBeGreaterThan(0);
    expect(new Set(roles)).toEqual(new Set(['Country Scout', 'Head Scout']));
  });

  test('a Lead scout cannot create report or weekly report requests', async ({ page }) => {
    await as(page, 'Lead Scout');
    await page.goto('/lead-scout?tab=tasks');
    await page.getByRole('button', { name: 'New task' }).click();
    const type = page.getByRole('dialog', { name: 'New task' }).getByLabel('Type', { exact: true });
    await expect(type.locator('option')).toHaveText(['Video request', 'General']);
  });
});

test.describe('Tasks board — phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the column has no header repeating the status dropdown', async ({ page }) => {
    await as(page, 'Lead Scout');
    await page.goto('/lead-scout?tab=tasks');
    await expect(page.getByRole('button', { name: /^To-Do \(\d+\)/ })).toBeVisible();
    const col = page.getByTestId('tasks-board').getByRole('region', { name: 'To-Do', exact: true });
    await expect(col).toBeVisible();
    await expect(col.locator('header')).toBeHidden();
  });
});
