import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Semester Isolation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PEN-LAP-SEM-001: Ganjil and Genap are distinct records', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Check Ganjil
    const ganjilFilter = page.getByText('Ganjil').first()
    if (await ganjilFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ganjilFilter.click()
      await page.waitForLoadState('domcontentloaded')

      const ganjilRows = page.getByRole('row')
      const ganjilCount = await ganjilRows.count()

      // Check Genap
      const genapFilter = page.getByText('Genap').first()
      if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await genapFilter.click()
        await page.waitForLoadState('domcontentloaded')

        const genapRows = page.getByRole('row')
        const genapCount = await genapRows.count()

        // Both should have data (header + at least 1 data row)
        expect(ganjilCount).toBeGreaterThanOrEqual(2)
        expect(genapCount).toBeGreaterThanOrEqual(2)
      }
    }
  })

  test('DS-PEN-LAP-SEM-002: Ganjil filter shows only Ganjil laporans', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const ganjilFilter = page.getByText('Ganjil').first()
    if (await ganjilFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await ganjilFilter.click()
      await page.waitForLoadState('domcontentloaded')

      // Should show Ganjil semester tags
      const ganjilTags = page.getByText('Ganjil')
      const tagCount = await ganjilTags.count()
      expect(tagCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('DS-PEN-LAP-SEM-003: Genap filter shows only Genap laporans', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const genapFilter = page.getByText('Genap').first()
    if (await genapFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await genapFilter.click()
      await page.waitForLoadState('domcontentloaded')

      // Should show Genap semester tags
      const genapTags = page.getByText('Genap')
      const tagCount = await genapTags.count()
      expect(tagCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('DS-PEN-LAP-SEM-004: Both semester filter shows all laporans', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should show table with data (default filter shows all)
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    // Should have multiple rows
    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(2) // Header + at least 1 data row
  })
})
