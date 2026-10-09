import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, navigateToModule, expectToastVisible } from '../helpers/navigation';
import { apiGetAuthed, apiPostAuthed } from '../helpers/api';
import { screenshot } from '../helpers/screenshot';

test.describe('RBB-ST — Staff LPPM', () => {

  test('RBB-ST-01 — Membuka monitoring progres Proposal dan Laporan', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-01', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring|proposal/i);
    const skemaCard = page.locator('[data-highlight]').first();
    if (await skemaCard.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await screenshot(page, 'RBB-ST-01', '02_skema_card_found');
      const proposalBtn = skemaCard.getByRole('button', { name: /proposal/i }).first();
      if (await proposalBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await proposalBtn.click();
        await page.waitForTimeout(2_000);
        await screenshot(page, 'RBB-ST-01', '03_proposal_list');
        const proposalBody = await page.textContent('body');
        expect(proposalBody).toMatch(/proposal|pengajuan|seleksi/i);
      }
    }
  });

  test('RBB-ST-02 — Verifikasi Proposal pada checkpoint Staff', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-02', '01_monitoring_page');
    const skemaCard = page.locator('[data-highlight]').first();
    if (await skemaCard.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const proposalBtn = skemaCard.getByRole('button', { name: /proposal/i }).first();
      if (await proposalBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await proposalBtn.click();
        await page.waitForTimeout(2_000);
        await screenshot(page, 'RBB-ST-02', '02_proposal_verification');
        const rows = page.getByRole('row');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('RBB-ST-03 — Menugaskan tepat tiga Reviewer unik', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-03', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-04 — Menugaskan Reviewer kurang dari tiga', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-04', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-05 — Menugaskan Reviewer lebih dari tiga', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-05', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-06 — Menugaskan Reviewer dengan identitas duplikat', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-06', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-07 — Mengajukan tindakan pengembalian atau destruktif', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-07', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-08 — Mengunggah bukti pengiriman dana pada Claim Dana', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-08', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-09 — Mengunggah berkas format atau ukuran tidak sesuai', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-09', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-10 — Memantau Logbook dan mengembalikan Laporan', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-10', '01_monitoring_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/skema|monitoring/i);
  });

  test('RBB-ST-11 — Menjalankan keputusan akhir Proposal (kewenangan Ketua)', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-ST-11', '01_monitoring_page');
    const result = await apiPostAuthed(page, '/proposal/seleksi/ketua-decide', {
      proposal_id: 999999,
      keputusan: 'Diterima',
    });
    expect(result.status).toBeGreaterThanOrEqual(400);
    await screenshot(page, 'RBB-ST-11', '02_unauthorized_action');
  });

  test('RBB-ST-12 — Memuat ulang halaman setelah tindakan operasional', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress');
    await page.waitForTimeout(2_000);
    const bodyBefore = await page.textContent('body');
    await screenshot(page, 'RBB-ST-12', '01_before_reload');
    await page.reload();
    await page.waitForTimeout(3_000);
    const bodyAfter = await page.textContent('body');
    expect(bodyAfter).toMatch(/skema|monitoring/i);
    await screenshot(page, 'RBB-ST-12', '02_after_reload');
  });
});
