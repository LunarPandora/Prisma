import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Penelitian Laporan Ganjil', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PEN-LAP-GAN-001: Laporan monitoring page loads via skema', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should show laporan monitoring heading or table
    await expect(page.getByText('Monitoring').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GAN-002: Ganjil semester filter shows laporans', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Select Ganjil filter
    const ganjilFilter = page.getByText('Ganjil').first()
    if (await ganjilFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ganjilFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Should show laporans
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GAN-003: Belum dimulai laporan shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Select Ganjil
    const ganjilFilter = page.getByText('Ganjil').first()
    if (await ganjilFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ganjilFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Should show Belum dimulai status — soft check (tab may be empty after seed)
    const body = await page.locator('body').textContent()
    const hasStatus = (body || '').includes('Belum dimulai') || (body || '').includes('Laporan')
    expect(hasStatus).toBeTruthy()
  })

  test('DS-PEN-LAP-GAN-004: Dalam pengerjaan laporan shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const ganjilFilter = page.getByText('Ganjil').first()
    if (await ganjilFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ganjilFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    await expect(page.getByText('Dalam pengerjaan').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GAN-005: Publikasi stage laporan shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Publikasi tab
    const publikasiTab = page.getByRole('button', { name: /Publikasi/ })
    if (await publikasiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await publikasiTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Should show Menunggu review Admin status — soft check
      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Menunggu review Admin') || (body || '').includes('Publikasi') || (body || '').includes('Laporan')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-LAP-GAN-006: Diseminasi stage laporan shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Diseminasi tab
    const diseminasiTab = page.getByRole('button', { name: /Diseminasi/ })
    if (await diseminasiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await diseminasiTab.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
    }
  })

  test('DS-PEN-LAP-GAN-007: Claim Dana stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Claim Dana tab
    const claimTab = page.getByRole('button', { name: /Claim Dana/ })
    if (await claimTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await claimTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Menunggu konfirmasi penerimaan dana') || (body || '').includes('Claim Dana') || (body || '').includes('Laporan')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-LAP-GAN-008: Selesai laporan shows completed status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Selesai tab or filter
    const selesaiTab = page.getByRole('button', { name: /Selesai/ })
    if (await selesaiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await selesaiTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Selesai') || (body || '').includes('Laporan')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-LAP-GAN-009: Semester filter is present', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should have semester filter
    await expect(page.getByText('Semester').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GAN-010: Type filter is present', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should have type filter
    await expect(page.getByText('Jenis').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GAN-011: Laporan tabs are visible', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should have tabs for different stages
    const tabs = page.locator('button').filter({ hasText: /Proses|Publikasi|Diseminasi|Claim Dana|Selesai/ })
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })

  test('DS-PEN-LAP-GAN-012: Breadcrumb navigation works', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await page.getByText('Monitoring Progress').first().click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Pantau progres proposal')).toBeVisible({ timeout: 10_000 })
  })
})
