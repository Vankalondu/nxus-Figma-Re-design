import { test, expect, type Page } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Player profile: Photo library and Reports tabs (P-CO20–22, D-19, D-20).
 * db-0 has 30 seeded photos, db-1 has 2.
 */

async function openProfile(page: Page, id: string, tab: string) {
  await page.addInitScript(() => {
    sessionStorage.setItem('loginRole', 'Lead Scout');
    sessionStorage.setItem('userRole', 'Lead Scout');
    localStorage.removeItem('nxus:report-grades:v1');
  });
  await page.goto(`/lead-scout/player/${id}`);
  await page.getByRole('button', { name: tab, exact: true }).click();
}

test.describe('Photo library', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('one tile size, about ten in view, no pagination, viewer works', async ({ page }) => {
    const errors = trackPageErrors(page);
    await openProfile(page, 'db-0', 'Photo Library');

    const grid = page.getByRole('list', { name: 'Photos' });
    const tiles = grid.getByRole('listitem');
    await expect(tiles).toHaveCount(30);
    await expect(page.getByRole('navigation', { name: 'Pages' })).toHaveCount(0);

    // 5 across and at least two full rows inside a 1440 × 900 screen.
    const boxes = await Promise.all([0, 4, 5, 9].map(i => tiles.nth(i).boundingBox()));
    expect(Math.round(boxes[0]!.y)).toBe(Math.round(boxes[1]!.y));
    expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y);
    expect(boxes[3]!.y + boxes[3]!.height).toBeLessThanOrEqual(900);

    await grid.getByRole('button', { name: /^Open/ }).first().click();
    await expect(page.getByRole('dialog', { name: /Photo 1 of 30/ })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('dialog', { name: /Photo 2 of 30/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    expect(errors).toHaveLength(0);
  });

  test('two photos keep the standard tile size', async ({ page }) => {
    await openProfile(page, 'db-1', 'Photo Library');
    const tiles = page.getByRole('list', { name: 'Photos' }).getByRole('listitem');
    await expect(tiles).toHaveCount(2);
    const b = await tiles.first().boundingBox();
    expect(b!.width).toBeGreaterThan(140);
    expect(b!.width).toBeLessThan(240);
  });

  test('rejects a file that is too large or the wrong format', async ({ page }) => {
    await openProfile(page, 'db-1', 'Photo Library');
    await page.getByTestId('photo-input').setInputFiles([
      { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') },
    ]);
    await expect(page.getByText(/notes.pdf: Format not supported/)).toBeVisible();
    await page.getByTestId('photo-input').setInputFiles([
      { name: 'match.png', mimeType: 'image/png', buffer: Buffer.alloc(16) },
    ]);
    await expect(page.getByRole('list', { name: 'Photos' }).getByRole('listitem')).toHaveCount(3);
  });
});

test.describe('Reports tab', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('grades picker hides a grade', async ({ page }) => {
    const errors = trackPageErrors(page);
    await openProfile(page, 'db-1', 'Reports');
    const short = page.getByRole('region', { name: 'Short report' });
    await expect(short.getByRole('heading', { name: 'Short report (2)' })).toBeVisible();
    await expect(short.getByText('POG', { exact: true }).first()).toBeVisible();

    await short.getByRole('button', { name: /5 of 5 grades/ }).click();
    const picker = page.getByRole('dialog', { name: 'Grades to show' });
    await expect(picker.getByText('Saved in this browser.')).toBeVisible();
    await picker.getByRole('checkbox', { name: /Potential grade/ }).click();
    await page.keyboard.press('Escape');

    await expect(short.getByText('POG', { exact: true })).toHaveCount(0);
    await expect(short.getByRole('button', { name: /4 of 5 grades/ })).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('hiding a report says where to get it back, and Grades brings it back', async ({ page }) => {
    await openProfile(page, 'db-1', 'Reports');
    const short = page.getByRole('region', { name: 'Short report' });
    await short.getByRole('button', { name: 'Hide report' }).click();
    await expect(page.getByText('Short report hidden. Show it again from Grades.')).toBeVisible();
    await expect(short).toHaveCount(0);

    await page.getByRole('button', { name: /^Grades/ }).click();
    const picker = page.getByRole('dialog', { name: 'Grades to show' });
    await expect(picker.getByText(/Hidden reports stay here/)).toBeVisible();
    await picker.getByRole('button', { name: 'Show Short report', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Short report' })).toBeVisible();
  });

  test('top-nav Add Report files a new report for this player', async ({ page }) => {
    await openProfile(page, 'db-1', 'Reports');
    await expect(page.getByRole('button', { name: 'New report' })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Scout weekly report' }).getByRole('listitem')).toHaveCount(1);

    await page.getByRole('button', { name: 'Add Report' }).click();
    const panel = page.getByRole('dialog', { name: 'New report' });
    await panel.getByRole('button', { name: /Scout weekly report/ }).click();

    const sheet = page.getByRole('dialog', { name: 'Scout weekly report' });
    const save = sheet.getByRole('button', { name: 'Save report' });
    await expect(save).toBeDisabled();
    await sheet.getByRole('radio', { name: 'A+' }).click();
    await expect(save).toBeEnabled();
    await save.click();

    await expect(sheet.getByText('Submitted', { exact: false })).toBeVisible();
    await sheet.getByRole('button', { name: 'Close report' }).click();
    await expect(page.getByRole('region', { name: 'Scout weekly report' }).getByRole('listitem')).toHaveCount(2);
  });
});

test.describe('Player names', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a player name on the Lead Scout dashboard opens the profile in the Lead account', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('loginRole', 'Lead Scout');
      sessionStorage.setItem('userRole', 'Lead Scout');
    });
    await page.goto('/lead-scout');
    await page.getByRole('button', { name: 'Reports', exact: true }).first().click();
    await page.getByRole('link', { name: 'Kofi Mensah' }).first().click();
    await expect(page).toHaveURL(/\/lead-scout\/player\//);
    await expect(page.getByRole('heading', { level: 1, name: 'Kofi Mensah' })).toBeVisible();
  });
});
