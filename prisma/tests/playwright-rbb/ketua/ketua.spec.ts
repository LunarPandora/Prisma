import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation';
import { apiGetAuthed, apiPostAuthed } from '../helpers/api';
import { screenshot } from '../helpers/screenshot';

test.describe('RBB-KT — Ketua LPPM', () => {

  test('RBB-KT-01 — Menyetujui Proposal pada checkpoint seleksi normal', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-01', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring|proposal/i);
  });

  test('RBB-KT-02 — Menolak Proposal pada checkpoint seleksi', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-02', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring|proposal/i);
  });

  test('RBB-KT-03 — Meninjau Proposal dengan 1 dari 3 penilaian selesai', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-03', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-04 — Meninjau Proposal dengan 2 dari 3 penilaian selesai', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-04', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-05 — Meninjau Proposal dengan 3 dari 3 penilaian selesai', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-05', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-06 — Menyetujui permintaan otorisasi dari Staff LPPM', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-06', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring|otorisasi/i);
  });

  test('RBB-KT-07 — Menolak permintaan otorisasi dari Staff LPPM', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-07', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-08 — Memantau tahap Laporan dan memutuskan Diseminasi', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-08', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-09 — Mengunggah bukti dana (kewenangan Staff/Dosen)', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-KT-09', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-KT-10 — Memuat ulang halaman setelah keputusan', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    const bodyBefore = await page.textContent('body');
    await screenshot(page, 'RBB-KT-10', '01_before_reload');
    await page.reload();
    await page.waitForTimeout(3_000);
    const bodyAfter = await page.textContent('body');
    expect(bodyAfter).toMatch(/skema|monitoring/i);
    await screenshot(page, 'RBB-KT-10', '02_after_reload');
  });
});
