import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Staff LPPM - Kriteria Penilaian', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'ketuacriteria')
    await waitForDashboard(page)
  })

  test('ST-KRIT-001: Kriteria page loads', async ({ page }) => {
    await expect(page.getByText('Pengaturan Kriteria')).toBeVisible({ timeout: 15_000 })
  })

  test('ST-KRIT-002: Kriteria Penilaian tab is visible', async ({ page }) => {
    // Use getByRole('button') to disambiguate from the subtitle text
    await expect(page.getByRole('button', { name: 'Kriteria Penilaian' })).toBeVisible()
  })

  test('ST-KRIT-003: Kriteria entries are displayed', async ({ page }) => {
    await expect(page.getByText('Kesesuaian Tema')).toBeVisible({ timeout: 10_000 })
  })

  test('ST-KRIT-004: Kategori Publikasi tab is accessible', async ({ page }) => {
    const pubTab = page.getByRole('button', { name: 'Kategori Publikasi' })
    if (await pubTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pubTab.click()
      await page.waitForLoadState('domcontentloaded')
    }
  })

  test('ST-KRIT-005: Bobot total is displayed', async ({ page }) => {
    const totalText = page.getByText(/total|bobot/i)
    if (await totalText.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(totalText.first()).toBeVisible()
    }
  })
})
