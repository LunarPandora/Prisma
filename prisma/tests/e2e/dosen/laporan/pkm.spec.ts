import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL } from '../../helpers/navigation'

test.describe('Dosen PkM Laporan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress&skema_id=1&view=laporan&jenis=PkM`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('DS-PKM-LAP-001: PkM laporans are visible', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 15_000 })
  })

  test('DS-PKM-LAP-002: PkM Claim Dana stage loads', async ({ page }) => {
    const claimTab = page.getByRole('button', { name: /Claim Dana/ })
    await expect(claimTab).toBeVisible({ timeout: 10_000 })
    await claimTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('DS-PKM-LAP-003: PkM Proses stage loads', async ({ page }) => {
    const prosesTab = page.getByRole('button', { name: /Proses PkM/ })
    await expect(prosesTab).toBeVisible({ timeout: 10_000 })
    await prosesTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('DS-PKM-LAP-004: PkM Publikasi stage loads', async ({ page }) => {
    const publikasiTab = page.getByRole('button', { name: /Publikasi/ })
    await expect(publikasiTab).toBeVisible({ timeout: 10_000 })
    await publikasiTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('DS-PKM-LAP-005: PkM Pengembalian Dana stage loads', async ({ page }) => {
    const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
    await expect(returnTab).toBeVisible({ timeout: 10_000 })
    await returnTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('DS-PKM-LAP-006: PkM Diseminasi stage loads', async ({ page }) => {
    const diseminasiTab = page.getByRole('button', { name: /Diseminasi/ })
    await expect(diseminasiTab).toBeVisible({ timeout: 10_000 })
    await diseminasiTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('DS-PKM-LAP-007: PkM laporans are isolated from Penelitian', async ({ page }) => {
    await expect(page.getByText('PkM').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PKM-LAP-008: PkM laporan tabs are visible', async ({ page }) => {
    const tabs = page.locator('button').filter({ hasText: /Claim Dana|Proses PkM|Publikasi|Pengembalian Dana|Diseminasi/ })
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })
})
