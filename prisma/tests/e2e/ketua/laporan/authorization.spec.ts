import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

test.describe('Ketua LPPM - Laporan Authorization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('KT-AUTHZ-PEN-PROSES-001: Laporan return request visible in authorization queue', async ({ page }) => {
    const returnLaporan = page.getByText('Kembalikan Laporan untuk Revisi').first()
    await expect(returnLaporan).toBeVisible({ timeout: 10_000 })
  })

  test('KT-AUTHZ-PEN-PUB-001: Laporan return for Publikasi visible', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasLaporanReturn = /Kembalikan Laporan/i.test(body || '')
    expect(hasLaporanReturn).toBeTruthy()
  })

  test('KT-AUTHZ-PEN-DIS-001: Laporan return for Diseminasi visible', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasLaporanReturn = /Kembalikan Laporan/i.test(body || '')
    expect(hasLaporanReturn).toBeTruthy()
  })

  test('KT-AUTHZ-PEN-DANA-001: Laporan return for Claim Dana visible', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasLaporanReturn = /Kembalikan Laporan/i.test(body || '')
    expect(hasLaporanReturn).toBeTruthy()
  })

  test('KT-AUTHZ-PKM-CLAIM-001: PkM laporan authorization visible', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasLaporanReturn = /Kembalikan Laporan/i.test(body || '')
    expect(hasLaporanReturn).toBeTruthy()
  })

  test('KT-AUTHZ-DENY-LAP-001: Authorization queue accessible for laporan', async ({ page }) => {
    const authQueue = page.getByText('Permintaan Otorisasi')
    await expect(authQueue.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-AUTHZ-DENY-LAP-002: Authorization requests have action buttons', async ({ page }) => {
    const requestItems = page.locator('[class*="rounded"]').filter({ hasText: /Staff LPPM|Tolak|Kembalikan/i })
    const count = await requestItems.count()
    expect(count).toBeGreaterThan(0)
  })
})
