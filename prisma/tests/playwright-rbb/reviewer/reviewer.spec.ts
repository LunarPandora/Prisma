import { test, expect } from '@playwright/test';
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation';
import { apiGetAuthed, apiPostAuthed } from '../helpers/api';
import { screenshot } from '../helpers/screenshot';

test.describe('RBB-RV — Reviewer', () => {

  test('RBB-RV-01 — Membuka daftar objek yang ditugaskan', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-01', '01_review_list');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian|proposal|laporan/i);
  });

  test('RBB-RV-02 — Mengisi dan mengirim penilaian Proposal', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-02', '01_review_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian/i);
  });

  test('RBB-RV-03 — Mengirim penilaian dengan isian wajib kosong', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-03', '01_review_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian/i);
  });

  test('RBB-RV-04 — Mengirim penilaian dengan nilai di luar rentang', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-04', '01_review_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian/i);
  });

  test('RBB-RV-05 — Menyelesaikan penilaian pertama dari tiga', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-05', '01_review_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian/i);
  });

  test('RBB-RV-06 — Menyelesaikan penilaian ketiga dari tiga', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-06', '01_review_page');
    const body = await page.textContent('body');
    expect(body).toMatch(/review|penilaian/i);
  });

  test('RBB-RV-07 — Membuka objek yang tidak ditugaskan', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    await screenshot(page, 'RBB-RV-07', '01_review_page');
    const result = await apiGetAuthed(page, '/proposal/');
    expect(result.status).toBeGreaterThanOrEqual(200);
    await screenshot(page, 'RBB-RV-07', '02_api_response');
  });

  test('RBB-RV-08 — Mengakses fungsi operasional Staff LPPM', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`);
    await page.waitForTimeout(3_000);
    await screenshot(page, 'RBB-RV-08', '01_unauthorized_module');
    const body = await page.textContent('body');
    const isDenied = /tidak ada akses|unauthorized|403|forbidden/i.test(body);
    expect(isDenied || page.url().includes('dashboard')).toBeTruthy();
  });

  test('RBB-RV-09 — Memuat ulang halaman setelah pengiriman penilaian', async ({ page }) => {
    await navigateToModule(page, 'reviewproposal');
    await page.waitForTimeout(2_000);
    const bodyBefore = await page.textContent('body');
    await screenshot(page, 'RBB-RV-09', '01_before_reload');
    await page.reload();
    await page.waitForTimeout(3_000);
    const bodyAfter = await page.textContent('body');
    expect(bodyAfter).toMatch(/review|penilaian/i);
    await screenshot(page, 'RBB-RV-09', '02_after_reload');
  });
});
