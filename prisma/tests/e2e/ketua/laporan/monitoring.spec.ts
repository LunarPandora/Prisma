import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

test.describe('Ketua LPPM - Laporan Monitoring', () => {
  test('KT-LAP-MON-001: Ketua can access Monitoring Progress page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const heading = page.getByText('Monitoring Progress')
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-002: Authorization queue visible on Monitoring Progress', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const authQueue = page.getByText('Permintaan Otorisasi')
    await expect(authQueue.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-003: Authorization queue shows pending requests count', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const countText = page.getByText(/permintaan menunggu/i)
    await expect(countText.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-004: Staff LPPM authorization requests visible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const staffRequest = page.getByText('Staff LPPM 1').first()
    await expect(staffRequest).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-005: Tolak Proposal request visible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const rejectRequest = page.getByText('Tolak Proposal')
    await expect(rejectRequest.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-006: Kembalikan Proposal request visible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const returnRequest = page.getByText('Kembalikan Proposal untuk Revisi')
    await expect(returnRequest.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-007: Kembalikan Laporan request visible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const returnLaporan = page.getByText('Kembalikan Laporan untuk Revisi')
    await expect(returnLaporan.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-008: Authorization requests have action elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const requestItems = page.locator('[class*="rounded"]').filter({ hasText: /Staff LPPM|Tolak|Kembalikan/i })
    const count = await requestItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('KT-LAP-MON-009: Skema cards visible below authorization queue', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const skemaCards = page.getByText('Penelitian Dosen Tetap 2026')
    await expect(skemaCards.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-LAP-MON-010: Laporan button available on skema cards', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const laporanBtn = page.getByRole('button', { name: /Laporan/i }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 10_000 })
  })
})
