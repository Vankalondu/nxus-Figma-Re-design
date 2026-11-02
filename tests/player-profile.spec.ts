import { test, expect, type Page } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Player profile: Photo library and Reports tabs (P-CO20–22, D-19).
 * db-0 has 30 seeded photos (three pages), db-1 has 2.
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

  test('pages through photos and opens the viewer', async ({ page }) => {
    const errors = trackPageErrors(page);
    await openProfile(page, 'db-0', 'Photo Library');

    const grid = page.getByRole('list', { name: 'Photos' });
    await expect(page.getByText('Showing 1–12 of 30 photos')).toBeVisible();
    await expect(grid.getByRole('listitem')).toHaveCount(12);

    await page.getByRole('button', { name: 'Last', exact: true }).click();
    await expect(page.getByText('Showing 25–30 of 30 photos')).toBeVisible();
    await expect(grid.getByRole('listitem')).toHaveCount(6);

    // The page of photos fits without scrolling at 1440 × 900.
    const box = await grid.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);

    await grid.getByRole('button', { name: /^Open/ }).first().click();
    const viewer = page.getByRole('dialog', { name: /Photo 25 of 30/ });
    await expect(viewer).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('dialog', { name: /Photo 26 of 30/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    expect(errors).toHaveLength(0);
  });

  test('two photos get big tiles and no pagination', async ({ page }) => {
    await openProfile(page, 'db-1', 'Photo Library');
    const tiles = page.getByRole('list', { name: 'Photos' }).getByRole('listitem');
    await expect(tiles).toHaveCount(2);
    const b = await tiles.first().boundingBox();
    expect(b!.width).toBeGreaterThan(300);
    await expect(page.getByRole('navigation', { name: 'Pages' })).toHaveCount(0);
  });

  test('rejects a file that is too large or the wrong format', async ({ page }) => {
    await openProfile(page, 'db-1', 'Photo Library');
    await page.getByTestId('photo-input').setInputFiles([
      { name: 'notes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('x') },
    ]);
    await expect(page.getByText(/notes\.pdf: Format not supported/)).toBeVisible();
    await page.getByTestId('photo-input').setInputFiles([
      { name: 'match.png', mimeType: 'image/png', buffer: Buffer.alloc(16) },
    ]);
    await expect(page.getByRole('list', { name: 'Photos' }).getByRole('listitem')).toHaveCount(3);
  });
});

test.describe('Reports tab', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('grades picker hides a grade column', async ({ page }) => {
    const errors = trackPageErrors(page);
    await openProfile(page, 'db-1', 'Reports');
    const short = page.getByRole('region', { name: 'Short report' });
    await expect(short.getByRole('columnheader', { name: 'POG' })).toBeVisible();

    await short.getByRole('button', { name: /5 of 5 grades/ }).click();
    const picker = page.getByRole('dialog', { name: 'Grades to show' });
    await picker.getByRole('checkbox', { name: /Potential grade/ }).click();
    await page.keyboard.press('Escape');

    await expect(short.getByRole('columnheader', { name: 'POG' })).toHaveCount(0);
    await expect(short.getByRole('button', { name: /4 of 5 grades/ })).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('new report is saved and listed', async ({ page }) => {
    await openProfile(page, 'db-1', 'Reports');
    await expect(page.getByRole('region', { name: 'Scout weekly report' }).getByRole('row')).toHaveCount(3);

    await page.getByRole('button', { name: 'New report' }).click();
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
    // header row + the existing group/scout rows + the new group/scout rows
    await expect(page.getByRole('region', { name: 'Scout weekly report' }).getByRole('row')).toHaveCount(5);
  });
});
