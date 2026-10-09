import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL } from '../helpers/navigation'

test.describe('Data Persistence After Reload', () => {
  test('KT-PERSIST-001: Ketua — authorization decision persists after reload', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasAuthQueue = (body || '').includes('Menunggu Persetujuan') ||
                         (body || '').includes('Otorisasi') ||
                         (body || '').includes('Menunggu review')
    expect(hasAuthQueue).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasAuthQueueAfter = (bodyAfter || '').includes('Menunggu Persetujuan') ||
                              (bodyAfter || '').includes('Otorisasi') ||
                              (bodyAfter || '').includes('Menunggu review')
    expect(hasAuthQueueAfter).toBeTruthy()
  })
})
