import { type Page, expect } from '@playwright/test';

export const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000';
export const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000';

export async function waitForDashboard(page: Page) {
  await page.locator('#navbar-menu').waitFor({ state: 'visible', timeout: 30_000 });
}

export async function waitForLogin(page: Page) {
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15_000 });
}

export async function navigateToModule(page: Page, moduleKey: string) {
  await page.goto(`${FRONTEND_URL}/dashboard?module=${moduleKey}`);
  await waitForDashboard(page);
}

export async function loginAs(
  page: Page,
  email: string,
  password: string
) {
  await page.goto(`${FRONTEND_URL}/login`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('**/dashboard**', { timeout: 30_000 });
  await waitForDashboard(page);
}

export async function logout(page: Page) {
  const logoutSection = page.locator('#logout-section');
  if (await logoutSection.isVisible()) {
    await logoutSection.click();
    const confirmBtn = page.getByRole('button', { name: /ya|logout|keluar/i });
    if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmBtn.click();
    }
  }
  await page.waitForURL('**/login**', { timeout: 15_000 }).catch(() => {});
}

export async function clearAuthState(page: Page) {
  await page.goto(FRONTEND_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });
}

export async function expectStatusVisible(page: Page, statusText: string) {
  const badge = page.locator(`text=${statusText}`).first();
  await expect(badge).toBeVisible({ timeout: 10_000 });
}

export async function expectToastVisible(page: Page, text?: string) {
  const toast = page.locator('.fixed.bottom-6.right-6').first();
  await expect(toast).toBeVisible({ timeout: 10_000 });
  if (text) {
    await expect(toast).toContainText(text);
  }
}

export async function expectHeading(page: Page, text: string | RegExp) {
  const heading = page.getByRole('heading', { name: text }).first();
  await expect(heading).toBeVisible({ timeout: 10_000 });
}

export async function openContextMenu(page: Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText }).first();
  await row.hover();
  const actionBtn = row.locator('button.inline-flex').last();
  await actionBtn.click();
  const menu = page.locator('[role="menu"]');
  await menu.waitFor({ state: 'visible', timeout: 5_000 });
  return menu;
}

export async function clickContextMenuItem(page: Page, text: string) {
  const item = page.getByRole('menuitem', { name: text }).first();
  await item.click();
}

export async function selectSkemaAction(page: Page, skemaName: string, action: 'Proposal' | 'Laporan') {
  const card = page.locator('[data-highlight]').filter({ hasText: skemaName }).first();
  await card.waitFor({ state: 'visible', timeout: 10_000 });
  const btn = card.getByRole('button', { name: action });
  await btn.click();
  await page.waitForTimeout(1_000);
}

export async function pickSelectOption(page: Page, placeholder: string, optionText: string) {
  const input = page.locator(`input[placeholder="${placeholder}"]`).first();
  await input.click();
  await input.fill(optionText);
  await page.waitForTimeout(500);
  const option = page.locator('div.absolute').getByText(optionText, { exact: false }).first();
  await option.click();
}
