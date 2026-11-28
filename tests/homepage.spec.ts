import { test, expect } from '@playwright/test';

test.describe('Homepage UI/UX', () => {
  test('page loads with correct title and hero', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await expect(page).toHaveTitle(/PDF Tools/);
    await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
  });

  test('search input is present and accessible', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const searchInput = page.locator('input[placeholder="Search for a PDF tool"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('aria-label', 'Search PDF tools');
  });

  test('search filters tools by keyword', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const searchInput = page.locator('input[placeholder="Search for a PDF tool"]');
    await searchInput.fill('merge');
    await expect(page.locator('.tool-card:has-text("Merge PDF")')).toBeVisible();
    await expect(page.locator('.tool-card:has-text("Split PDF")')).toBeHidden();
    await searchInput.clear();
    await expect(page.locator('.tool-card:has-text("Split PDF")')).toBeVisible();
  });

  test('category filter pills filter tools', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('button', { name: 'Optimize PDF' }).click();
    await expect(page.locator('.tool-card:has-text("Compress PDF")')).toBeVisible();
    await expect(page.locator('.tool-card:has-text("Merge PDF")')).toBeHidden();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.locator('.tool-card:has-text("Merge PDF")')).toBeVisible();
  });

  test('search and category filter combine', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('button', { name: 'Optimize PDF' }).click();
    const searchInput = page.locator('input[placeholder="Search for a PDF tool"]');
    await searchInput.fill('compress');
    await expect(page.locator('.tool-card:has-text("Compress PDF")')).toBeVisible();
    await searchInput.fill('nonexistent');
    await expect(page.getByRole('heading', { name: 'No matching tools' })).toBeVisible();
  });

  test('clear search restores results', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const searchInput = page.locator('input[placeholder="Search for a PDF tool"]');
    await searchInput.fill('merge');
    await page.getByLabel('Clear search').click();
    await expect(page.locator('.tool-card:has-text("Merge PDF")')).toBeVisible();
  });

  test('tool cards link to correct routes', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('.tool-card:has-text("Merge PDF")').click();
    await expect(page).toHaveURL(/.*\/merge_pdf/);
  });

  test('empty state shows when no results', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const searchInput = page.locator('input[placeholder="Search for a PDF tool"]');
    await searchInput.fill('xyzzy123nonexistent');
    await expect(page.getByRole('heading', { name: 'No matching tools' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
  });

  test('header navigation links are valid', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await page.getByLabel('More options').click();
    await page.locator('.nav-dropdown--company').getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL(/.*\/features/);
    await page.goBack();
    await page.getByLabel('More options').click();
    await page.locator('.nav-dropdown--company').getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/.*\/pricing/);
    await page.goBack();
    await page.getByLabel('More options').click();
    await page.locator('.nav-dropdown--company').getByRole('link', { name: 'About us' }).click();
    await expect(page).toHaveURL(/.*\/about/);
  });

  test('footer links are valid', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('footer').getByRole('link', { name: 'About us' }).click();
    await expect(page).toHaveURL(/.*\/about/);
    await page.goBack();
    await page.locator('footer').getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/.*\/contact/);
    await page.goBack();
    await page.locator('footer').getByRole('link', { name: 'Privacy policy' }).click();
    await expect(page).toHaveURL(/.*\/privacy/);
  });

  test('no emoji icons used', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const emojis = page.locator('span[aria-hidden="true"]').filter({ hasText: /[\u{1F300}-\u{1F9FF}]/u });
    await expect(emojis).toHaveCount(0);
  });

  test('no unsupported claims', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    await expect(page.locator('text=100% FREE')).toHaveCount(0);
    await expect(page.locator('text=encrypted and automatically deleted')).toHaveCount(0);
    await expect(page.locator('text=ISO 27001')).toHaveCount(0);
  });

  test('copyright year is current', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/');
    const year = new Date().getFullYear().toString();
    await expect(page.locator(`text=© ${year} PDF Site`)).toBeVisible();
  });

  test('no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

test.describe('Tool pages', () => {
  test('tool pages load correctly', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/merge_pdf');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('not found page works', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/nonexistent');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
