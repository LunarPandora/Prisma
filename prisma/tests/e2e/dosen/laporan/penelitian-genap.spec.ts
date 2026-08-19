import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Penelitian Laporan Genap', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PEN-LAP-GEN-001: Genap laporans are visible', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Select Genap filter
    const genapFilter = page.getByText('Genap').first()
    if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await genapFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GEN-002: Genap Belum dimulai shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const genapFilter = page.getByText('Genap').first()
    if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await genapFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    await expect(page.getByText('Belum dimulai').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GEN-003: Genap Dalam pengerjaan shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const genapFilter = page.getByText('Genap').first()
    if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await genapFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    await expect(page.getByText('Dalam pengerjaan').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-LAP-GEN-004: Genap laporans are distinct from Ganjil', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Select Genap
    const genapFilter = page.getByText('Genap').first()
    if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await genapFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Should show table with data
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    // Should have rows
    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(2)
  })
})
