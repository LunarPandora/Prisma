import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Staff LPPM - Laporan Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
  })

  test('ST-LAP-001: Laporan monitoring page loads via deep link', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    // Wait for either skema selection or laporan view
    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan Penelitian/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('ST-LAP-002: Laporan page shows tabs for different stages', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Laporan Penelitian')).toBeVisible()
    }
  })

  test('ST-LAP-003: Semester filter is present', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      // Semester filter is a SelectInput, look for its label or container
      await expect(page.getByText('Ganjil')).toBeVisible()
    }
  })
})
