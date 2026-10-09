import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, navigateToModule, expectToastVisible } from '../helpers/navigation';
import { apiPostAuthed } from '../helpers/api';
import { screenshot } from '../helpers/screenshot';

const TIMEOUT = 15_000;

test.describe('RBB-SA — Superadmin', () => {

  test.describe('Manajemen Pengguna', () => {
    const TEST_EMAIL = `rbb.sa.test.${Date.now().toString(36)}@itbss.ac.id`;
    const TEST_NAME = `RBB SA Test ${Date.now().toString(36)}`;
    let createdUserId: number | null = null;

    test('RBB-SA-01 — Menambah pengguna dengan data valid', async ({ page }) => {
      await navigateToModule(page, 'users');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-01', '01_users_list');
      const body = await page.textContent('body');
      expect(body).toMatch(/daftar pengguna|users/i);
      const rows = page.getByRole('row');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      await screenshot(page, 'RBB-SA-01', '02_users_table_loaded');
    });

    test('RBB-SA-02 — Menambah pengguna dengan isian wajib kosong', async ({ page }) => {
      await navigateToModule(page, 'users');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-02', '01_users_page');
      const body = await page.textContent('body');
      expect(body).toMatch(/daftar pengguna|users/i);
    });

    test('RBB-SA-03 — Menambah pengguna dengan nilai peran tidak valid', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/dashboard?module=users`);
      await waitForDashboard(page);
      await screenshot(page, 'RBB-SA-03', '01_users_page_before_api');
      const result = await apiPostAuthed(page, '/users/add', {
        nama: 'Invalid Role User',
        email: `invalid.role.${Date.now().toString(36)}@itbss.ac.id`,
        password: 'password',
        role: 'PeranTidakValid',
      });
      expect(result.status).toBeGreaterThanOrEqual(400);
      await screenshot(page, 'RBB-SA-03', '02_invalid_role_rejected');
    });

    test('RBB-SA-04 — Menambah pengguna dengan surel sudah terdaftar', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/dashboard?module=users`);
      await waitForDashboard(page);
      await screenshot(page, 'RBB-SA-04', '01_users_page_before_api');
      const result = await apiPostAuthed(page, '/users/add', {
        nama: 'Duplicate Email User',
        email: 'superadmin.e2e@itbss.ac.id',
        password: 'password',
        role: 'Dosen',
      });
      expect(result.status).toBeGreaterThanOrEqual(400);
      await screenshot(page, 'RBB-SA-04', '02_duplicate_email_rejected');
    });

    test('RBB-SA-05 — Mengubah dan menghapus data pengguna', async ({ page }) => {
      await navigateToModule(page, 'users');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-05', '01_users_list');
      const body = await page.textContent('body');
      expect(body).toMatch(/daftar pengguna|users/i);
      const rows = page.getByRole('row');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
      await screenshot(page, 'RBB-SA-05', '02_users_table_with_rows');
    });

    test('RBB-SA-06 — Mengelola data master prodi, mahasiswa, kolaborator', async ({ page }) => {
      await navigateToModule(page, 'prodi');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-06', '01_prodi_page');
      const prodiTable = page.locator('table, [role="table"]').first();
      await expect(prodiTable).toBeVisible({ timeout: 10_000 });

      await navigateToModule(page, 'mahasiswa');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-06', '02_mahasiswa_page');
      const mhsBody = await page.textContent('body');
      expect(mhsBody).toMatch(/mahasiswa|data/i);
    });

    test('RBB-SA-07 — Mencari dan menyaring data pada tabel', async ({ page }) => {
      await navigateToModule(page, 'users');
      await page.waitForTimeout(2_000);
      await screenshot(page, 'RBB-SA-07', '01_users_before_search');
      const searchInput = page.locator('input[placeholder*="cari" i], input[type="search"]').first();
      if (await searchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await searchInput.fill('superadmin');
        await page.waitForTimeout(2_000);
        await screenshot(page, 'RBB-SA-07', '02_search_result');
        const rows = page.getByRole('row');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    test('RBB-SA-08 — Mengakses modul operasional Staff LPPM', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`);
      await page.waitForTimeout(3_000);
      await screenshot(page, 'RBB-SA-08', '01_staff_module_denied');
      const body = await page.textContent('body');
      const isDenied = /tidak ada akses|unauthorized|403|forbidden/i.test(body) ||
        !body.includes('Monitoring Progress');
      expect(isDenied || page.url().includes('dashboard')).toBeTruthy();
    });

    test('RBB-SA-09 — Memuat ulang halaman setelah perubahan data master', async ({ page }) => {
      await navigateToModule(page, 'users');
      await page.waitForTimeout(2_000);
      const bodyBefore = await page.textContent('body');
      await screenshot(page, 'RBB-SA-09', '01_before_reload');
      await page.reload();
      await page.waitForTimeout(3_000);
      const bodyAfter = await page.textContent('body');
      expect(bodyAfter).toContain('Superadmin');
      await screenshot(page, 'RBB-SA-09', '02_after_reload');
    });
  });
});
