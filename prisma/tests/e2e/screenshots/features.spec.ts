import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

const SCREENSHOT_DIR = path.resolve(__dirname, '../../../screenshots')

async function screenshot(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true })
}

async function waitForDashboard(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
}

async function loginAs(page: Page, email: string) {
  await page.goto(`${FRONTEND_URL}/login`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
  if (page.url().includes('/dashboard')) {
    await waitForDashboard(page)
    return
  }
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('password')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 30_000 })
  await waitForDashboard(page)
}

async function clickSkemaProposal(page: Page, skemaIndex = 0) {
  const buttons = page.getByRole('button', { name: /Proposal/ })
  const count = await buttons.count()
  if (count === 0) return
  const idx = Math.min(skemaIndex, count - 1)
  await buttons.nth(idx).click()
  await page.waitForTimeout(1500)
}

async function clickSkemaLaporan(page: Page, skemaIndex = 0) {
  const buttons = page.getByRole('button', { name: /Laporan/ })
  const count = await buttons.count()
  if (count === 0) return
  const idx = Math.min(skemaIndex, count - 1)
  await buttons.nth(idx).click()
  await page.waitForTimeout(1500)
}

async function openRowActionMenu(page: Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText }).first()
  await expect(row).toBeVisible({ timeout: 10_000 })
  const actionBtn = row.locator('button.inline-flex').first()
  await actionBtn.click()
  await page.waitForTimeout(500)
}

// ===== B.1 PROFIL PENELITI =====

test.describe('F-PROFIL: Profil Peneliti', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
  })

  test('F-PROFIL-01: Detail Profil Peneliti', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=profildosen`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    await screenshot(page, 'F-PROFIL-01-detail')
  })

  test('F-PROFIL-02: Integrasi Google Scholar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenscholar`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
    await screenshot(page, 'F-PROFIL-02-scholar-sync')
  })

  test('F-PROFIL-03: Sitasi per Tahun', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenscholar`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
    const chart = page.getByText('Riwayat Sitasi').first()
    await chart.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await screenshot(page, 'F-PROFIL-03-sitasi-tahun')
  })

  test('F-PROFIL-04: Publikasi dari Google Scholar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenscholar`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
    const table = page.getByText('Daftar Publikasi').first()
    await table.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await screenshot(page, 'F-PROFIL-04-publikasi-scholar')
  })

  test('F-PROFIL-05: Detail Publikasi dengan Sitasi', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenscholar`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
    const table = page.getByText('Daftar Publikasi').first()
    await table.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const firstRow = page.getByRole('row').nth(1)
    if (await firstRow.isVisible()) {
      await firstRow.hover()
      const menuBtn = firstRow.locator('button.inline-flex').first()
      if (await menuBtn.isVisible()) {
        await menuBtn.click()
        await page.waitForTimeout(500)
        const citOption = page.getByRole('menuitem', { name: /Riwayat Sitasi/i })
        if (await citOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await citOption.click()
          await page.waitForTimeout(2000)
        }
      }
    }
    await screenshot(page, 'F-PROFIL-05-publikasi-detail')
  })

  test('F-PROFIL-06: Luaran Peneliti', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=profildosen`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await screenshot(page, 'F-PROFIL-06-luaran')
  })
})

// ===== B.2 PEMBUATAN DOKUMEN OTOMATIS =====

test.describe('F-TEMPLATE: Pembuatan Dokumen Otomatis', () => {
  test('F-TEMPLATE-01: Tombol Generate Dokumen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    // Click into Proposal table for first skema
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Find a row with status "Menunggu proposal untuk diupload" which has Upload button
    const uploadRow = page.getByRole('row').filter({ hasText: /Upload|Menunggu proposal/i })
    if (await uploadRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const uploadBtn = uploadRow.locator('button').filter({ hasText: /Upload/i }).first()
      if (await uploadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await uploadBtn.click()
        await page.waitForTimeout(1500)
        await screenshot(page, 'F-TEMPLATE-01-tombol')
        return
      }
    }
    // Fallback: just show the proposal table
    await screenshot(page, 'F-TEMPLATE-01-tombol')
  })

  test('F-TEMPLATE-02: Form yang Sudah Terisi', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Click Edit on a Draft row to show pre-filled form
    const draftRow = page.getByRole('row').filter({ hasText: /Draft/i }).first()
    if (await draftRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Inline buttons for Draft: [0] Edit
      const editBtn = draftRow.locator('button.inline-flex').first()
      await editBtn.click()
      await page.waitForTimeout(2000)
    }
    await screenshot(page, 'F-TEMPLATE-02-form-terisi')
  })

  test('F-TEMPLATE-03: Hasil Dokumen Proposal', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Click Upload on a proposal that has generated_file_url
    const uploadRow = page.getByRole('row').filter({ hasText: /Menunggu proposal|Upload/i })
    if (await uploadRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const uploadBtn = uploadRow.locator('button').filter({ hasText: /Upload/i }).first()
      if (await uploadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await uploadBtn.click()
        await page.waitForTimeout(2000)
      }
    }
    await screenshot(page, 'F-TEMPLATE-03-hasil-proposal')
  })

  test('F-TEMPLATE-04: Hasil Dokumen Laporan', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    // Click on "Publikasi" tab to find a publikasi action
    const pubTab = page.getByRole('button', { name: /Publikasi/i }).first()
    if (await pubTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pubTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a data row with an action button
    const dataRows = page.getByRole('row').filter({ has: page.locator('button.inline-flex') })
    if (await dataRows.count() > 0) {
      const actionBtn = dataRows.first().locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1500)
    }
    await screenshot(page, 'F-TEMPLATE-04-hasil-laporan')
  })

  test('F-TEMPLATE-05: Surat Tugas Pengumuman', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    // Click into Proposal table
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Click "Pengumuman" tab
    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/i })
    if (await pengumumanTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForTimeout(1500)
    }
    await screenshot(page, 'F-TEMPLATE-05-surat-tugas')
  })
})

// ===== B.3 ALUR PROPOSAL =====

test.describe('F-PROP: Alur Proposal', () => {
  test('F-PROP-01: Form Pengajuan Proposal', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    const ajukanBtn = page.getByRole('button', { name: /Ajukan Proposal/i })
    await expect(ajukanBtn).toBeVisible({ timeout: 5000 })
    await ajukanBtn.click()
    await page.waitForTimeout(2000)
    await screenshot(page, 'F-PROP-01-form-pengajuan')
  })

  test('F-PROP-02: Upload Dokumen Proposal', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Find a row with "Menunggu proposal untuk diupload" status
    const uploadRow = page.getByRole('row').filter({ hasText: /Menunggu proposal/i }).first()
    if (await uploadRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Inline buttons: [0] Upload, [1] Hapus
      const uploadBtn = uploadRow.locator('button.inline-flex').first()
      await uploadBtn.click()
      await page.waitForTimeout(2000)
    }
    await screenshot(page, 'F-PROP-02-upload-dokumen')
  })

  test('F-PROP-03: Halaman Revisi Proposal', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Find a row with "Revisi" status
    const revisiRow = page.getByRole('row').filter({ hasText: /Revisi/i }).first()
    if (await revisiRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Inline buttons for Revisi: [0] Perbaiki
      const editBtn = revisiRow.locator('button.inline-flex').first()
      await editBtn.click()
      await page.waitForTimeout(2000)
    }
    await screenshot(page, 'F-PROP-03-revisi')
  })
})

// ===== B.3 REVIEWER =====

test.describe('F-REV: Formulir Reviewer', () => {
  test('F-REV-01: Form Penilaian Reviewer', async ({ page }) => {
    await loginAs(page, 'reviewer.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    // Find a row with "Belum direview" status and click the action button
    const reviewRow = page.getByRole('row').filter({ hasText: /Belum direview/i }).first()
    if (await reviewRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionBtn = reviewRow.locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(2000)
    }
    // Scroll the modal to show the Kriteria Penilaian table
    const criteriaHeading = page.getByText('Kriteria Penilaian Reviewer')
    if (await criteriaHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      await criteriaHeading.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }
    await screenshot(page, 'F-REV-01-form-penilaian')
  })

  test('F-REV-02: Hasil 3 Reviewer', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Click "Seleksi" tab
    const seleksiTab = page.getByRole('button', { name: /Seleksi/i })
    if (await seleksiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a row with "Menunggu persetujuan Ketua" status
    const reviewRow = page.getByRole('row').filter({ hasText: /Menunggu persetujuan|Post-Review/i }).first()
    if (await reviewRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionBtn = reviewRow.locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(2000)
    }
    await screenshot(page, 'F-REV-02-hasil-3reviewer')
  })
})

// ===== B.3 LOGBOOK =====

test.describe('F-LOG: Logbook', () => {
  test('F-LOG-01: Form Tambah Logbook', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    // Click into Laporan table
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    // Click "Proses" tab (should be default)
    const prosesTab = page.getByRole('button', { name: /^Proses$/i })
    if (await prosesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a row and click "Cek Logbook" action
    const logRow = page.getByRole('row').filter({ hasText: /Dalam pengerjaan|E2E/i }).first()
    if (await logRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionBtn = logRow.locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1500)
    }
    // Click "Tambah Logbook" button in the modal footer
    const tambahBtn = page.getByRole('button', { name: /Tambah Logbook/i })
    if (await tambahBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tambahBtn.click()
      await page.waitForTimeout(1000)
    }
    await screenshot(page, 'F-LOG-01-form-logbook')
  })

  test('F-LOG-02: Daftar Logbook', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    const prosesTab = page.getByRole('button', { name: /^Proses$/i })
    if (await prosesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a row with logbook data (E2E-PEN-GAN-PROSES has logbooks)
    const logRow = page.getByRole('row').filter({ hasText: /Wind Energy|E2E-PEN-GAN-PROSES/i }).first()
    if (await logRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionBtn = logRow.locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1500)
    }
    await screenshot(page, 'F-LOG-02-daftar-logbook')
  })
})

// ===== B.3 DANA =====

test.describe('F-DANA: Realisasi Anggaran dan Bukti Transfer', () => {
  test('F-DANA-01: Form Realisasi Anggaran', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    // Click "Publikasi" tab
    const pubTab = page.getByRole('button', { name: /Publikasi/i }).first()
    if (await pubTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pubTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a data row with an action button
    const dataRows = page.getByRole('row').filter({ has: page.locator('button.inline-flex') })
    if (await dataRows.count() > 0) {
      const actionBtn = dataRows.first().locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1500)
      // Inside PublikasiForm, click "Kelola Realisasi Anggaran" button
      const realisasiBtn = page.getByRole('button', { name: /Realisasi Anggaran/i })
      if (await realisasiBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await realisasiBtn.click()
        await page.waitForTimeout(1500)
      }
    }
    await screenshot(page, 'F-DANA-01-realisasi')
  })

  test('F-DANA-02: Bukti Transfer', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    // Click "Laporan" on skema card
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    // Click "Claim Dana" tab
    const claimTab = page.getByRole('button', { name: /Claim Dana/i })
    if (await claimTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await claimTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a row and click the "Upload Bukti Transfer" action (3rd button on Claim Dana tab)
    const dataRows = page.getByRole('row').filter({ has: page.locator('button.inline-flex') })
    if (await dataRows.count() > 0) {
      const row = dataRows.first()
      const buttons = row.locator('button.inline-flex')
      const btnCount = await buttons.count()
      // Button order: Logbook(0), Detail(1), Upload Bukti Transfer(2), Kembalikan(3)
      const uploadIdx = Math.min(2, btnCount - 1)
      const uploadBtn = buttons.nth(uploadIdx)
      if (await uploadBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await uploadBtn.click()
        await page.waitForTimeout(1500)
      }
    }
    await screenshot(page, 'F-DANA-02-bukti-transfer')
  })
})

// ===== B.3 OTORISASI =====

test.describe('F-OTOR: Otorisasi', () => {
  test('F-OTOR-01: Form Permintaan Otorisasi', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaProposal(page)
    await page.waitForTimeout(1000)
    // Find a row with "Menunggu review Staff" and click "Kembalikan" or "Tolak"
    const staffRow = page.getByRole('row').filter({ hasText: /Menunggu review Staff/i }).first()
    if (await staffRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionBtn = staffRow.locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1000)
      // Look for return/reject option in context menu
      const returnOption = page.getByRole('menuitem', { name: /Kembalikan|Tolak/i }).first()
      if (await returnOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await returnOption.click()
        await page.waitForTimeout(1500)
      }
    }
    await screenshot(page, 'F-OTOR-01-form-permintaan')
  })

  test('F-OTOR-02: Detail Permintaan (Ketua)', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    // The AuthorizationQueue panel is shown at the top of the page
    await screenshot(page, 'F-OTOR-02-detail-permintaan')
  })
})

// ===== B.3 MASTER DATA =====

test.describe('F-MASTER: Master Data', () => {
  test('F-MASTER-01: Pengelolaan Skema', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=ketuaskema`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    await screenshot(page, 'F-MASTER-01-skema')
  })

  test('F-MASTER-02: Pengelolaan Kegiatan', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=ketuaskema`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    // Click "Edit" on the first skema card to see kegiatan
    const editBtn = page.getByRole('button', { name: /Edit/i }).first()
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(2000)
    }
    await screenshot(page, 'F-MASTER-02-kegiatan')
  })

  test('F-MASTER-03: Kriteria Penilaian', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=ketuacriteria`)
    await waitForDashboard(page)
    await page.waitForTimeout(2000)
    await screenshot(page, 'F-MASTER-03-kriteria')
  })
})

// ===== B.3 DISEMINASI =====

test.describe('F-DISEM: Diseminasi', () => {
  test('F-DISEM-01: Form Diseminasi', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id')
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
    await page.waitForTimeout(1500)
    await clickSkemaLaporan(page)
    await page.waitForTimeout(1000)
    // Click "Diseminasi" tab
    const disTab = page.getByRole('button', { name: /Diseminasi/i })
    if (await disTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await disTab.click()
      await page.waitForTimeout(1000)
    }
    // Find a row and click action
    const rows = page.getByRole('row')
    const count = await rows.count()
    if (count > 1) {
      const actionBtn = rows.nth(1).locator('button.inline-flex').first()
      await actionBtn.click()
      await page.waitForTimeout(1500)
    }
    await screenshot(page, 'F-DISEM-01-diseminasi')
  })
})
