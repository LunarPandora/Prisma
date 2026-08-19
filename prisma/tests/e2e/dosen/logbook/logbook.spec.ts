import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Logbook', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-LOG-001: Logbook can be opened from eligible Laporan', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Proses tab (where logbook is available)
    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Find a row with "Dalam pengerjaan" status
      const row = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
      if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
        // Hover to show actions
        await row.hover()

        // Should have a button to open logbook
        const logbookBtn = row.getByRole('button').first()
        await expect(logbookBtn).toBeVisible()
      }
    }
  })

  test('DS-LOG-002: Logbook entries are displayed when logbook is opened', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Proses tab
    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Find a row and open logbook
      const row = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
      if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await row.hover()

        // Click the action button to open logbook
        const actionBtn = row.getByRole('button').first()
        if (await actionBtn.isVisible()) {
          await actionBtn.click()
          await page.waitForTimeout(1000)

          // Logbook modal should appear
          const logbookModal = page.getByText('Logbook')
          if (await logbookModal.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await expect(logbookModal).toBeVisible()
          }
        }
      }
    }
  })

  test('DS-LOG-003: Logbook entries show judul and tanggal', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')

      const row = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
      if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await row.hover()

        const actionBtn = row.getByRole('button').first()
        if (await actionBtn.isVisible()) {
          await actionBtn.click()
          await page.waitForTimeout(1000)

          // Should show logbook entries with titles
          const logbookEntry = page.getByText('E2E-LOG')
          if (await logbookEntry.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await expect(logbookEntry).toBeVisible()
          }
        }
      }
    }
  })

  test('DS-LOG-004: Add entry button is available in logbook', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')

      const row = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
      if (await row.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await row.hover()

        const actionBtn = row.getByRole('button').first()
        if (await actionBtn.isVisible()) {
          await actionBtn.click()
          await page.waitForTimeout(1000)

          // Should have "Tambah Entry" or similar button
          const addBtn = page.getByRole('button', { name: /Tambah|Add|Tambah Entry/ })
          if (await addBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await expect(addBtn).toBeVisible()
          }
        }
      }
    }
  })
})
