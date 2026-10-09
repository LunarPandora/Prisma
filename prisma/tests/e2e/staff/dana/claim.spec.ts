import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Staff LPPM - Dana', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
  })

  test('ST-DANA-001: Staff can access Dana monitoring via deep link', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan Penelitian/ })
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
  })

  test('ST-DANA-002: Dashboard shows Konfirmasi Dana summary card', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    await expect(page.getByText('Konfirmasi Dana').first()).toBeVisible()
  })

  test('ST-DANA-003: Konfirmasi Dana action link navigates correctly', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const danaAction = page.getByText('Konfirmasi Dana')
    if (await danaAction.isVisible({ timeout: 5000 }).catch(() => false)) {
      await danaAction.click()
      await page.waitForLoadState('domcontentloaded')
      expect(page.url()).toContain('module=staffmonitoringprogresslaporan')
    }
  })
})
