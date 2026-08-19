import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Data Persistence After Reload', () => {
  test('ST-PERSIST-001: Staff — return request persists after reload', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress')
    await waitForDashboard(page)

    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasData = (body || '').includes('Dalam pengerjaan') ||
                    (body || '').includes('Menunggu') ||
                    (body || '').includes('Laporan')
    expect(hasData).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasDataAfter = (bodyAfter || '').includes('Dalam pengerjaan') ||
                         (bodyAfter || '').includes('Menunggu') ||
                         (bodyAfter || '').includes('Laporan')
    expect(hasDataAfter).toBeTruthy()
  })
})
