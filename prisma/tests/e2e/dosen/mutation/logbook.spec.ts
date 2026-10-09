import { test, expect } from '../../helpers/evidence'
import { type Page } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

const LOGBOOK_TITLE = 'E2E LOGBOOK MUTATION'

test.describe('Dosen Logbook Mutations', () => {
  test('DS-LOG-MUT-001: Create new logbook entry', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    // Navigate to laporan monitoring
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Proses tab
    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Find a row with "Dalam pengerjaan" status
    const prosesRow = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
    if (await prosesRow.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await prosesRow.hover()
      await page.waitForTimeout(300)

      // Click "Cek Logbook" button
      const logbookBtn = prosesRow.locator('button').filter({ hasText: /Logbook|Edit/ }).first()
      if (await logbookBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await logbookBtn.click()
        await page.waitForTimeout(1000)

        // LogbookView modal should appear
        await expect(page.getByText('Logbook Progress')).toBeVisible({ timeout: 5_000 })

        // Click "Tambah Logbook" button
        const addLogbookBtn = page.getByRole('button', { name: /Tambah Logbook/ }).first()
        if (await addLogbookBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await addLogbookBtn.click()
          await page.waitForTimeout(500)

          // LogbookForm modal should appear
          await expect(page.getByText('Tambah Logbook')).toBeVisible({ timeout: 5_000 })

          // Fill the logbook form
          const judulInput = page.getByPlaceholder('Judul kegiatan')
          await expect(judulInput).toBeVisible({ timeout: 3_000 })
          await judulInput.fill(LOGBOOK_TITLE)

          const deskripsiInput = page.getByPlaceholder('Deskripsi kegiatan')
          await deskripsiInput.fill('Deskripsi logbook mutation E2E')

          // Fill date - the date picker is a custom component
          const tglInput = page.getByPlaceholder('Pilih tanggal')
          if (await tglInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await tglInput.click()
            await page.waitForTimeout(300)
            // Click a date in the calendar
            const dayBtn = page.locator('button').filter({ hasText: /^15$/ }).first()
            if (await dayBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
              await dayBtn.click()
              await page.waitForTimeout(300)
            }
          }

          // Fill Google Drive URL (optional but valid)
          const urlInput = page.getByPlaceholder(/Google Drive/)
          if (await urlInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await urlInput.fill('https://drive.google.com/file/d/e2e-mutation-test/view')
          }

          // Click "Simpan"
          const saveBtn = page.getByRole('button', { name: 'Simpan' })
          await expect(saveBtn).toBeVisible()
          await saveBtn.click()

          await page.waitForTimeout(3000)

          // Verify the logbook was created
          // Either the form closed (success) or toast appeared
          const formClosed = !(await page.getByText('Tambah Logbook').isVisible({ timeout: 2_000 }).catch(() => false))
          const toastArea = page.locator('.fixed.bottom-6.right-6')
          const toastContent = await toastArea.textContent().catch(() => '')
          const success = toastContent.includes('berhasil') || toastContent.includes('disimpan')

          expect(formClosed || success).toBeTruthy()
        }
      }
    }
  })
})
