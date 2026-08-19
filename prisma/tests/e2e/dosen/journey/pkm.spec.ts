import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Full Journey - PkM', () => {
  test('DS-JOURNEY-PKM-001: Full PkM journey - Dashboard to Laporan', async ({ page }) => {
    // Step 1: Dashboard loads
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()

    // Step 2: Navigate to Monitoring Progress
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
    await expect(page.getByText('Monitoring Progress')).toBeVisible({ timeout: 10_000 })

    // Step 3: Click on skema to see proposals
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Step 4: Verify proposal monitoring page
    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })

    // Step 5: Check that PkM type is visible
    await expect(page.getByText('PkM').first()).toBeVisible({ timeout: 10_000 })

    // Step 6: Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')

      // Step 7: Verify PkM proposals are shown
      await expect(page.getByText('Draft').first()).toBeVisible({ timeout: 10_000 })
    }

    // Step 8: Navigate to Pengumuman tab
    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/ })
    if (await pengumumanTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Step 9: Verify accepted PkM proposal
      await expect(page.getByText('Proposal Diterima').first()).toBeVisible({ timeout: 10_000 })
    }

    // Step 10: Navigate back and go to Laporan
    await page.getByText('Monitoring Progress').first().click()
    await page.waitForLoadState('domcontentloaded')

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      // Step 11: Filter by PkM
      const pkmLaporanFilter = page.getByText('PkM').first()
      if (await pkmLaporanFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await pkmLaporanFilter.click()
        await page.waitForLoadState('domcontentloaded')
      }

      // Step 12: Verify laporan monitoring page
      await expect(page.getByText('Laporan').first()).toBeVisible({ timeout: 10_000 })

      // Step 13: Check that PkM laporans exist
      const table = page.locator('table')
      await expect(table).toBeVisible({ timeout: 10_000 })
    }
  })
})
