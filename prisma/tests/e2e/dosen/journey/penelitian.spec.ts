import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Full Journey - Penelitian', () => {
  test('DS-JOURNEY-PEN-001: Full Penelitian journey - Dashboard to Laporan', async ({ page }) => {
    // Step 1: Dashboard loads
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()

    // Step 2: Check summary cards
    await expect(page.getByText('Proposal Aktif')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Laporan Berjalan')).toBeVisible()

    // Step 3: Navigate to Monitoring Progress
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
    await expect(page.getByText('Monitoring Progress')).toBeVisible({ timeout: 10_000 })

    // Step 4: Click on skema to see proposals
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Step 5: Verify proposal monitoring page
    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })

    // Step 6: Check that proposals are shown in the table
    const table = page.getByRole('table')
    await expect(table.first()).toBeVisible({ timeout: 10_000 })

    // Step 7: Navigate to Pengumuman tab to see accepted proposals
    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/ })
    if (await pengumumanTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
    }

    // Step 9: Navigate back to skema selection
    await page.getByText('Monitoring Progress').first().click()
    await page.waitForLoadState('domcontentloaded')

    // Step 10: Click on Laporan to see laporan monitoring
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      // Step 11: Verify laporan monitoring page
      await expect(page.getByText('Laporan Penelitian').first()).toBeVisible({ timeout: 10_000 })

      // Step 12: Check that laporans exist
      const table = page.locator('table')
      await expect(table).toBeVisible({ timeout: 10_000 })
    }
  })
})
