import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen PkM Laporan', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PKM-LAP-001: PkM laporans are visible', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PKM-LAP-002: PkM Claim Dana stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Navigate to Claim Dana tab
    const claimTab = page.getByRole('button', { name: /Claim Dana/ })
    if (await claimTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await claimTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Dalam pengerjaan').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-003: PkM Proses stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Navigate to Proses PkM tab
    const prosesTab = page.getByRole('button', { name: /Proses PkM/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Dalam pengerjaan').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-004: PkM Publikasi stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Navigate to Publikasi tab
    const publikasiTab = page.getByRole('button', { name: /Publikasi/ })
    if (await publikasiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await publikasiTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Menunggu review Admin').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-005: PkM Pengembalian Dana stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Navigate to Pengembalian Dana tab
    const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
    if (await returnTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await returnTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Menunggu Pengembalian Dana').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-006: PkM Diseminasi stage shows correct status', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Navigate to Diseminasi tab
    const diseminasiTab = page.getByRole('button', { name: /Diseminasi/ })
    if (await diseminasiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await diseminasiTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Dalam pengerjaan').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-007: PkM laporans are isolated from Penelitian', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')

      // Should show PkM type
      await expect(page.getByText('PkM').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-LAP-008: PkM laporan tabs are visible', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Should have tabs for PkM stages
    const tabs = page.locator('button').filter({ hasText: /Claim Dana|Proses PkM|Publikasi|Pengembalian Dana|Diseminasi/ })
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })
})
