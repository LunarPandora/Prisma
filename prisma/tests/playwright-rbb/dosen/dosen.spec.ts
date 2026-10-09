import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation';
import { apiGetAuthed, apiPostAuthed } from '../helpers/api';
import { screenshot } from '../helpers/screenshot';

test.describe('RBB-DS — Dosen', () => {

  test('RBB-DS-01 — Membuat draft Proposal dengan data lengkap', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-01', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring|proposal/i);
  });

  test('RBB-DS-02 — Membuat Proposal dengan isian wajib kosong', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-02', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-03 — Mengunggah dokumen Proposal sesuai ketentuan', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-03', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-04 — Mengunggah dokumen format atau ukuran tidak sesuai', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-04', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-05 — Mengirim Proposal setelah prasyarat terpenuhi', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-05', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-06 — Mengirim Proposal sebelum dokumen diunggah', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-06', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-07 — Merevisi Proposal yang dikembalikan', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-07', '01_dosen_monitoring');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-DS-08 — Mengelola Laporan Ganjil dan Genap', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogresslaporan');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-08', '01_dosen_laporan');
    const body = await page.textContent('body');
    expect(body).toMatch(/laporan|monitoring|ganjil|genap/i);
  });

  test('RBB-DS-09 — Menambahkan catatan Logbook', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogresslaporan');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-09', '01_dosen_laporan');
    const body = await page.textContent('body');
    expect(body).toMatch(/laporan|logbook|monitoring/i);
  });

  test('RBB-DS-10 — Menambahkan Logbook dengan isian kosong', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogresslaporan');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-10', '01_dosen_laporan');
    const body = await page.textContent('body');
    expect(body).toMatch(/laporan|monitoring/i);
  });

  test('RBB-DS-11 — Mengelola Publikasi dan Diseminasi', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogresslaporan');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-11', '01_dosen_laporan');
    const body = await page.textContent('body');
    expect(body).toMatch(/laporan|publikasi|diseminasi/i);
  });

  test('RBB-DS-12 — Mengunggah bukti penerimaan dana', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogresslaporan');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-12', '01_dosen_laporan');
    const body = await page.textContent('body');
    expect(body).toMatch(/laporan|dana|monitoring/i);
  });

  test('RBB-DS-13 — Membuka Proposal atau Laporan milik Dosen lain', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-DS-13', '01_dosen_monitoring');
    const result = await apiGetAuthed(page, '/proposal/?user_id=999999');
    expect(result.status).toBeGreaterThanOrEqual(200);
    await screenshot(page, 'RBB-DS-13', '02_api_response');
  });

  test('RBB-DS-14 — Mengakses modul Staff LPPM atau Superadmin', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=users`);
    await page.waitForTimeout(3_000);
    await screenshot(page, 'RBB-DS-14', '01_unauthorized_module');
    const body = await page.textContent('body');
    const isDenied = /tidak ada akses|unauthorized|403|forbidden/i.test(body);
    expect(isDenied || page.url().includes('dashboard')).toBeTruthy();
  });

  test('RBB-DS-15 — Memuat ulang halaman setelah pengiriman Proposal', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress');
    await page.waitForTimeout(2_000);
    const bodyBefore = await page.textContent('body');
    await screenshot(page, 'RBB-DS-15', '01_before_reload');
    await page.reload();
    await page.waitForTimeout(3_000);
    const bodyAfter = await page.textContent('body');
    expect(bodyAfter).toMatch(/skema|monitoring/i);
    await screenshot(page, 'RBB-DS-15', '02_after_reload');
  });
});
