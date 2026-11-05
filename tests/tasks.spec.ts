import { test, expect, type Page } from '@playwright/test';
import { trackPageErrors } from './helpers';

/**
 * Tasks board (P-CO26, D-26): one Kanban board on every dashboard, the top-nav Tasks icon,
 * Request report on the profile, and the list-history pills (P-CO27).
 * Signed in as Lead Scout Tom Legg.
 */

async function asLead(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('loginRole', 'Lead Scout');
    sessionStorage.setItem('userRole', 'Lead Scout');
  });
}
async function asSenior(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('loginRole', 'Senior Scout');
    sessionStorage.setItem('userRole', 'Senior Scout');
  });
}
const board = (page: Page) => page.getByTestId('tasks-board');
const column = (page: Page, name: string) => board(page).getByRole('region', { name, exact: true });
const countOf = async (page: Page, name: string) => Number(await column(page, name).locator('header span').innerText());

test.describe('Tasks board — desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('four columns in one row, no chart and no list toggle', async ({ page }) => {
    const errors = trackPageErrors(page);
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    const cols = board(page).locator('section[data-column]');
    await expect(cols).toHaveCount(4);
    await expect(cols.locator('h3')).toHaveText(['Overdue', 'To-Do', 'In Progress', 'Completed']);
    const tops = await cols.evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    await expect(page.getByText('Task distribution')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /open the task list/i })).toHaveCount(0);
    expect(errors).toHaveLength(0);
  });

  test('the assigner or assignee can drag a card; others cannot', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    const before = await countOf(page, 'In Progress');
    const mine = column(page, 'To-Do').locator('li[data-movable]').first();
    const title = await mine.getAttribute('aria-label');
    // Hold it: the card lifts and follows the pointer, its spot stays as a placeholder.
    const from = (await mine.boundingBox())!;
    const to = (await column(page, 'In Progress').boundingBox())!;
    await page.mouse.move(from.x + 40, from.y + 20);
    await page.mouse.down();
    await page.mouse.move(from.x + 60, from.y + 40, { steps: 5 });
    await page.mouse.move(to.x + to.width / 2, to.y + 200, { steps: 15 });
    const lifted = page.locator('li.rotate-2');
    await expect(lifted).toHaveCount(1);
    const held = (await lifted.boundingBox())!;
    expect(Math.abs(held.x + held.width / 2 - (to.x + to.width / 2))).toBeLessThan(to.width);
    await expect(column(page, 'To-Do').getByRole('listitem', { name: title!, exact: true })).toHaveClass(/opacity-40/);
    await page.mouse.up();
    await expect(page.getByText('Moved to In Progress')).toBeVisible();
    await expect(column(page, 'In Progress').getByRole('listitem', { name: title!, exact: true })).toBeVisible();
    expect(await countOf(page, 'In Progress')).toBe(before + 1);

    // Someone else's task: not draggable and no Move to…
    const theirs = board(page).locator('li[aria-label]:not([data-movable])').first();
    await expect(theirs).not.toHaveAttribute('aria-roledescription', /.+/);
    await expect(theirs).toHaveAttribute('title', /^Only .+ can move this task$/);
    await expect(theirs.getByRole('button', { name: /to…$/ })).toHaveCount(0);
  });

  test('archive a task, then Undo brings it back', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    const card = column(page, 'To-Do').getByRole('listitem').first();
    const title = (await card.getAttribute('aria-label'))!;
    await card.getByRole('button', { name: `Archive ${title}` }).click();
    await expect(page.getByText('Task archived')).toBeVisible();
    await expect(board(page).getByRole('listitem', { name: title, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(board(page).getByRole('listitem', { name: title, exact: true })).toBeVisible();
  });

  test('a report task opens that player\'s Reports tab', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    const card = column(page, 'To-Do').getByRole('listitem', { name: /^Report: / }).first();
    const name = (await card.getAttribute('aria-label'))!.replace(/^Report: /, '').replace(/ \(.*\)$/, '');
    await card.click();
    await expect(page).toHaveURL(/\/lead-scout\/player\/[^?]+\?tab=reports/);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  });

  test('the top-nav Tasks icon opens the dashboard Tasks tab', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout');
    const icon = page.getByRole('button', { name: 'Tasks', exact: true });
    await expect(icon).toBeVisible();
    await icon.click();
    await expect(page).toHaveURL(/\/lead-scout\?tab=tasks$/);
    await expect(board(page)).toBeVisible();

    // From a player profile it goes back to the dashboard Tasks tab too.
    await page.goto('/lead-scout/player/db-0');
    await page.getByRole('button', { name: 'Tasks', exact: true }).click();
    await expect(board(page)).toBeVisible();
  });

  test('Country and Head dashboards have the same board', async ({ page }) => {
    await page.goto('/country-scout?tab=tasks');
    await expect(board(page).locator('section[data-column]')).toHaveCount(4);
    await page.goto('/head-scout?tab=tasks');
    await expect(board(page).locator('section[data-column]')).toHaveCount(4);
  });

  test('Filters shows and hides one row of filters', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    await expect(page.getByTestId('task-filters')).toHaveCount(0);
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByRole('textbox', { name: 'Search tasks' }).fill('Video request');
    const titles = await board(page).locator('li[aria-label]').evaluateAll(els => els.map(e => e.getAttribute('aria-label')));
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every(t => t!.startsWith('Video request'))).toBe(true);
  });
});

test.describe('Tasks board — phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('one column at a time from the status dropdown, Move to… instead of drag', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout?tab=tasks');
    await expect(board(page).locator('section[data-column]')).toHaveCount(1);
    await expect(column(page, 'To-Do')).toBeVisible();

    await page.getByRole('button', { name: /^To-Do \(\d+\)$/ }).click();
    await page.getByRole('button', { name: /^Completed\s*\d+$/ }).click();
    await expect(column(page, 'Completed')).toBeVisible();
    await expect(column(page, 'To-Do')).toHaveCount(0);

    await page.getByRole('button', { name: /^Completed \(\d+\)$/ }).click();
    await page.getByRole('button', { name: /^To-Do\s*\d+$/ }).click();
    const card = column(page, 'To-Do').locator('li[data-movable]').first();
    const title = (await card.getAttribute('aria-label'))!;
    await card.getByRole('button', { name: `Move ${title} to…` }).click();
    await page.getByRole('menuitem', { name: 'In Progress' }).click();
    await expect(page.getByText('Moved to In Progress')).toBeVisible();
    await expect(column(page, 'To-Do').getByRole('listitem', { name: title, exact: true })).toHaveCount(0);
  });
});

test.describe('Player profile — Request report and list history', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Request report opens the task panel filled in for this player', async ({ page }) => {
    // Senior scouts request reports from Lead scouts (D-27).
    await asSenior(page);
    await page.goto('/senior-scout/player/tl-0?tab=reports');
    const name = await page.getByRole('heading', { level: 1 }).innerText();
    await page.getByRole('button', { name: 'Request report' }).click();
    const sheet = page.getByRole('dialog', { name: 'Request report' });
    await expect(sheet.getByLabel('Type', { exact: true })).toHaveValue('report-request');
    await expect(sheet.getByRole('button', { name: `Remove ${name}` })).toBeVisible();
    // From a Senior scout, a report request goes to Lead scouts only.
    const people = sheet.getByRole('group', { name: 'Assign to' });
    await expect(people.getByText('Kwame Asante')).toBeVisible();
    await expect(people.getByText('Sanoussy Sinare')).toHaveCount(0);
    await expect(people.getByText('Amara Diallo')).toHaveCount(0);
    await expect(sheet.getByRole('button', { name: 'Send request' })).toBeDisabled();
    await people.getByText('Kwame Asante').click();
    await sheet.getByRole('radio', { name: 'Short report' }).click();
    await sheet.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByText('Report requested from Kwame Asante')).toBeVisible();

    await page.goto('/senior-scout?tab=tasks');
    await expect(board(page).getByRole('listitem', { name: `Report: ${name} (Short report)` }).first()).toBeVisible();
  });

  test('Lead scouts file reports, so they get no Request report button', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout/player/tl-0?tab=reports');
    await expect(page.getByRole('button', { name: 'Show archived' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Request report' })).toHaveCount(0);
  });

  test('list history pills run oldest to newest, the current list filled', async ({ page }) => {
    await asLead(page);
    await page.goto('/lead-scout/player/tl-0');
    const pills = page.getByRole('list', { name: 'List history' }).getByRole('listitem');
    const texts = (await pills.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
    expect(texts.length).toBeGreaterThanOrEqual(3);
    expect(texts[0]).toMatch(/^Long · .+ · \d{1,2} [A-Z][a-z]{2}$/);
    expect(texts[texts.length - 1]).toMatch(/^Target · /);
    await expect(pills.last()).toHaveAttribute('aria-current', 'step');

    // A database-only player has no history yet.
    await page.goto('/lead-scout/player/db-0');
    await expect(page.getByText('Not on a list yet').locator('visible=true')).toBeVisible();
  });
});
