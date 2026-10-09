import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, clearAuthState } from './helpers/navigation';
import { screenshot } from './helpers/screenshot';

test.describe('RBB-UM — Autentikasi & Umum', () => {

  test('RBB-UM-01 — Login dengan surel dan kata sandi yang sah', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await screenshot(page, 'RBB-UM-01', '01_login_page');
    await page.locator('#email').fill('superadmin.e2e@itbss.ac.id');
    await page.locator('#password').fill('password');
    await screenshot(page, 'RBB-UM-01', '02_credentials_filled');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });
    await waitForDashboard(page);
    await expect(page.locator('#navbar-menu')).toBeVisible();
    await screenshot(page, 'RBB-UM-01', '03_dashboard_loaded');
  });

  test('RBB-UM-02 — Login dengan isian surel kosong', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('');
    await page.locator('#password').fill('password');
    await screenshot(page, 'RBB-UM-02', '01_empty_email');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('#email')).toBeVisible();
    await screenshot(page, 'RBB-UM-02', '02_still_on_login');
  });

  test('RBB-UM-03 — Login dengan isian kata sandi kosong', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('superadmin.e2e@itbss.ac.id');
    await page.locator('#password').fill('');
    await screenshot(page, 'RBB-UM-03', '01_empty_password');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await screenshot(page, 'RBB-UM-03', '02_still_on_login');
  });

  test('RBB-UM-04 — Login dengan kedua isian kosong', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('');
    await page.locator('#password').fill('');
    await screenshot(page, 'RBB-UM-04', '01_both_empty');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await screenshot(page, 'RBB-UM-04', '02_still_on_login');
  });

  test('RBB-UM-05 — Login dengan format surel tidak valid', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('bukan-email-valid');
    await page.locator('#password').fill('password');
    await screenshot(page, 'RBB-UM-05', '01_invalid_email');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await screenshot(page, 'RBB-UM-05', '02_still_on_login');
  });

  test('RBB-UM-06 — Login dengan kredensial salah', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('superadmin.e2e@itbss.ac.id');
    await page.locator('#password').fill('sandisalah123');
    await screenshot(page, 'RBB-UM-06', '01_wrong_password');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('#email')).toBeVisible();
    await screenshot(page, 'RBB-UM-06', '02_rejected_still_on_login');
  });

  test('RBB-UM-07 — Membuka halaman terlindungi tanpa sesi', async ({ page }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await screenshot(page, 'RBB-UM-07', '01_redirect_to_login');
  });

  test('RBB-UM-08 — Keluar dari sesi dan coba kembali ke halaman sebelumnya', async ({ page, context }) => {
    await clearAuthState(page);
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('superadmin.e2e@itbss.ac.id');
    await page.locator('#password').fill('password');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });
    await waitForDashboard(page);
    const dashboardUrl = page.url();
    await screenshot(page, 'RBB-UM-08', '01_dashboard_before_logout');

    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto(dashboardUrl);
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/login/);
    await screenshot(page, 'RBB-UM-08', '02_redirect_after_logout');
  });

  test('RBB-UM-09 — Membuka halaman notifikasi dan menandai terbaca', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
    await page.locator('#email').fill('superadmin.e2e@itbss.ac.id');
    await page.locator('#password').fill('password');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 30_000 });
    await waitForDashboard(page);

    await page.goto(`${FRONTEND_URL}/dashboard?module=notifications`);
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-UM-09', '01_notifications_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/notif|belum terbaca|tidak ada/i);
    const markAllBtn = page.getByRole('button', { name: /tandai semua|mark all/i });
    if (await markAllBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await markAllBtn.click();
      await page.waitForTimeout(2_000);
    }
    await screenshot(page, 'RBB-UM-09', '02_after_mark_all');
  });
});
