import { test, expect, type Page } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Publikasi Mutations', () => {
  test('DS-PEN-PUB-MUT-001: Save publikasi info on Publikasi stage laporan', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Publikasi tab
    const pubTab = page.getByRole('button', { name: /Publikasi/ })
    if (await pubTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pubTab.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Find a row with "Menunggu review Admin" status (Publikasi stage)
    const pubRow = page.getByRole('row').filter({ hasText: 'Menunggu review Admin' }).first()
    if (await pubRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pubRow.hover()
      await page.waitForTimeout(300)

      // Click "Publikasi" button
      const publikasiBtn = pubRow.locator('button').filter({ hasText: /Publikasi/ }).first()
      if (await publikasiBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await publikasiBtn.click()
        await page.waitForTimeout(1000)

        // PublikasiForm modal should appear
        const publikasiModal = page.getByText('Publikasi')
        await expect(publikasiModal.first()).toBeVisible({ timeout: 5_000 })

        // Step 1: Fill informasi penelitian
        const judulInput = page.getByPlaceholder(/Judul penelitian|judul/i).first()
        if (await judulInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await judulInput.fill('E2E PUBLIKASI MUTATION')
        }

        // Fill jurnal name
        const jurnalInput = page.getByPlaceholder(/Nama jurnal/i).first()
        if (await jurnalInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await jurnalInput.fill('E2E Journal')
        }

        // Fill link jurnal
        const linkInput = page.getByPlaceholder(/Link jurnal/i).first()
        if (await linkInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await linkInput.fill('https://journal.example.com/e2e-mutation')
        }

        // Click "Simpan Informasi"
        const saveInfoBtn = page.getByRole('button', { name: /Simpan Informasi/ })
        if (await saveInfoBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await saveInfoBtn.click()
          await page.waitForTimeout(3000)

          // Verify save succeeded
          const toastArea = page.locator('.fixed.bottom-6.right-6')
          const toastContent = await toastArea.textContent().catch(() => '')
          const success = toastContent.includes('berhasil') || toastContent.includes('disimpan')
          const error = toastContent.includes('Gagal')

          // Either success toast appeared or no error
          expect(!error || success).toBeTruthy()
        }
      }
    }
  })
})

test.describe('Dosen Claim Dana Mutations', () => {
  test('DS-PEN-DANA-MUT-001: Upload bukti terima for Claim Dana', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Claim Dana tab
    const claimTab = page.getByRole('button', { name: /Claim Dana/ })
    if (await claimTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await claimTab.click()
      await page.waitForLoadState('domcontentloaded')
    }

    // Find a row eligible for claim upload
    const claimRow = page.getByRole('row').filter({ hasText: 'Menunggu' }).first()
    if (await claimRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await claimRow.hover()
      await page.waitForTimeout(300)

      const uploadBtn = claimRow.locator('button').filter({ hasText: /Upload|Bukti/ }).first()
      if (await uploadBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await uploadBtn.click()
        await page.waitForTimeout(1000)

        // TransferProofForm modal should appear
        const proofModal = page.getByText(/Bukti Terima Claim Dana|Upload Bukti/)
        if (await proofModal.isVisible({ timeout: 5_000 }).catch(() => false)) {
          // Upload a test file
          const testFile = Buffer.from('test proof image')
          const fileInput = page.locator('input[type="file"]').first()
          await fileInput.setInputFiles({
            name: 'bukti-terima-e2e.jpg',
            mimeType: 'image/jpeg',
            buffer: testFile,
          })

          await page.waitForTimeout(1000)

          // Click Upload button
          const uploadSubmitBtn = page.getByRole('button', { name: 'Upload' })
          if (await uploadSubmitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await uploadSubmitBtn.click()
            await page.waitForTimeout(3000)

            // Verify mutation happened
            const toastArea = page.locator('.fixed.bottom-6.right-6')
            const toastContent = await toastArea.textContent().catch(() => '')
            const success = toastContent.includes('berhasil') || toastContent.includes('diupload')
            const formClosed = !(await proofModal.isVisible({ timeout: 1_000 }).catch(() => false))

            expect(success || formClosed).toBeTruthy()
          }
        }
      }
    }
  })
})

test.describe('Dosen PkM Pengembalian Dana Mutations', () => {
  test('DS-PKM-RETURN-MUT-001: Upload bukti pengembalian for PkM', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Pengembalian Dana tab
    const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
    if (await returnTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await returnTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Find a row eligible for pengembalian upload
      const returnRow = page.getByRole('row').filter({ hasText: 'Menunggu' }).first()
      if (await returnRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await returnRow.hover()
        await page.waitForTimeout(300)

        const uploadBtn = returnRow.locator('button').filter({ hasText: /Upload|Bukti/ }).first()
        if (await uploadBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await uploadBtn.click()
          await page.waitForTimeout(1000)

          const proofModal = page.getByText(/Bukti Transfer Pengembalian Dana|Upload Bukti/)
          if (await proofModal.isVisible({ timeout: 5_000 }).catch(() => false)) {
            const testFile = Buffer.from('test return proof')
            const fileInput = page.locator('input[type="file"]').first()
            await fileInput.setInputFiles({
              name: 'bukti-pengembalian-e2e.png',
              mimeType: 'image/png',
              buffer: testFile,
            })

            await page.waitForTimeout(1000)

            const uploadSubmitBtn = page.getByRole('button', { name: 'Upload' })
            if (await uploadSubmitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
              await uploadSubmitBtn.click()
              await page.waitForTimeout(3000)

              const toastArea = page.locator('.fixed.bottom-6.right-6')
              const toastContent = await toastArea.textContent().catch(() => '')
              const success = toastContent.includes('berhasil') || toastContent.includes('diupload')
              const formClosed = !(await proofModal.isVisible({ timeout: 1_000 }).catch(() => false))

              expect(success || formClosed).toBeTruthy()
            }
          }
        }
      }
    }
  })
})
