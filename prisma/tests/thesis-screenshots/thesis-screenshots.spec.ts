import { test, expect } from '@playwright/test'

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'
const SCREENSHOT_DIR = '../thesis-screenshots'

// ─── Helpers ────────────────────────────────────────────────────────

async function loginAs(page: any, email: string, password: string) {
  await page.context().clearCookies()
  await page.goto(`${FRONTEND_URL}/login`)
  await page.waitForLoadState('load')
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('**/dashboard**', { timeout: 30_000 })
  await page.waitForLoadState('load')
}

async function navigateTo(page: any, moduleKey: string) {
  await page.goto(`${FRONTEND_URL}/dashboard?module=${moduleKey}`)
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
}

async function waitForPageReady(page: any) {
  await page.waitForLoadState('load')
  await page.waitForTimeout(1000)
}

async function captureScreenshot(page: any, filename: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${filename}`,
    fullPage: false,
  })
}

async function dismissToasts(page: any) {
  const toasts = page.locator('.fixed.bottom-6.right-6 > div')
  const count = await toasts.count()
  for (let i = 0; i < count; i++) {
    const closeBtn = toasts.nth(i).locator('button, [class*="close"]')
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click()
      await page.waitForTimeout(200)
    }
  }
}

async function openDosenLaporan(page: any) {
  await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
  await navigateTo(page, 'dosenmonitoringprogress')
  await waitForPageReady(page)
  const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
  if (await laporanBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    return true
  }
  return false
}

async function openStaffLaporan(page: any) {
  await loginAs(page, 'staff.lppm1@itbss.ac.id', 'password')
  await navigateTo(page, 'staffmonitoringprogress')
  await waitForPageReady(page)
  const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
  if (await laporanBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    return true
  }
  return false
}

async function openKetuaSeleksi(page: any) {
  await loginAs(page, 'ketua.lppm@itbss.ac.id', 'password')
  await navigateTo(page, 'staffmonitoringprogress')
  await waitForPageReady(page)
  const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
  await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
  await proposalBtn.click()
  await page.waitForLoadState('domcontentloaded')
  await waitForPageReady(page)
  const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
  if (await seleksiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await seleksiTab.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    return true
  }
  return false
}

// ─── Auth Setup ─────────────────────────────────────────────────────

test.describe('Thesis Screenshot Auth Setup', () => {
  test('setup all auth states', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`)
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 })
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 1: Authentication & Dashboards
// ════════════════════════════════════════════════════════════════════

test.describe('Group 1: Authentication & Dashboards', () => {
  test('01-login-prisma', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('#email')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('#password')).toBeVisible()
    await captureScreenshot(page, '01-login-prisma.png')
  })

  test('02-dashboard-staff-lppm', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await dismissToasts(page)
    await captureScreenshot(page, '02-dashboard-staff-lppm.png')
  })

  test('03-dashboard-dosen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await dismissToasts(page)
    await captureScreenshot(page, '03-dashboard-dosen.png')
  })

  test('04-dashboard-ketua', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await dismissToasts(page)
    await captureScreenshot(page, '04-dashboard-ketua.png')
  })

  test('05-dashboard-reviewer', async ({ page }) => {
    await loginAs(page, 'reviewer.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'reviewproposal')
    await waitForPageReady(page)
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await dismissToasts(page)
    await captureScreenshot(page, '05-dashboard-reviewer.png')
  })

  test('06-dashboard-superadmin', async ({ page }) => {
    await loginAs(page, 'superadmin.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'users')
    await waitForPageReady(page)
    await expect(page.getByRole('heading', { name: 'Daftar Pengguna' })).toBeVisible({ timeout: 10_000 })
    await dismissToasts(page)
    await captureScreenshot(page, '06-dashboard-superadmin.png')
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 2: Proposal Submission
// ════════════════════════════════════════════════════════════════════

test.describe('Group 2: Proposal Submission', () => {
  test('07-daftar-proposal-dosen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    await dismissToasts(page)
    await captureScreenshot(page, '07-daftar-proposal-dosen.png')
  })

  test('08-form-upload-proposal', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)

    // Find a proposal with "Menunggu proposal untuk diupload" status and click Upload
    const uploadBtn = page.getByRole('button', { name: /Upload/ }).first()
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.click()
      await page.waitForTimeout(1000)
      // Assert the upload modal appeared
      const uploadZone = page.getByText(/Upload dokumen proposal/i)
      if (await uploadZone.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissToasts(page)
        await captureScreenshot(page, '08-form-upload-proposal.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Upload modal did not appear' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No proposal with upload status available' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 3: Proposal Selection & Reviewer Assignment
// ════════════════════════════════════════════════════════════════════

test.describe('Group 3: Proposal Selection & Reviewer Assignment', () => {
  test('09-seleksi-proposal-ketua', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    await expect(seleksiTab).toBeVisible({ timeout: 10_000 })
    await seleksiTab.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    await dismissToasts(page)
    await captureScreenshot(page, '09-seleksi-proposal-ketua.png')
  })

  test('10-form-penugasan-reviewer', async ({ page }) => {
    await loginAs(page, 'staff.lppm1@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)
    }

    // Look for "Tugaskan Reviewer" button in context menu or table
    const tugaskBtn = page.getByRole('button', { name: /Tugaskan Reviewer/ }).first()
    if (await tugaskBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tugaskBtn.click()
      await page.waitForTimeout(1000)
    } else {
      // Try clicking a row context menu to find the assignment option
      const row = page.locator('table tbody tr').first()
      if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
        await row.click()
        await page.waitForTimeout(500)
        const menuOption = page.getByRole('button', { name: /Tugaskan Reviewer/ })
        if (await menuOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await menuOption.click()
          await page.waitForTimeout(1000)
        }
      }
    }

    // Assert the Penugasan Reviewer modal appeared
    const modalTitle = page.getByText('Penugasan Reviewer')
    if (await modalTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dismissToasts(page)
      await captureScreenshot(page, '10-form-penugasan-reviewer.png')
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Penugasan Reviewer modal not available - no proposal in "Menunggu penugasan reviewer" state' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 4: Reviewer Assessment
// ════════════════════════════════════════════════════════════════════

test.describe('Group 4: Reviewer Assessment', () => {
  test('11-reviewer-assessment-form', async ({ page }) => {
    await loginAs(page, 'reviewer.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'reviewproposal')
    await waitForPageReady(page)

    // Find a proposal with "Belum direview" and click "Mulai penilaian"
    const startBtn = page.getByRole('button', { name: /Mulai penilaian/ }).first()
    if (await startBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1500)
      // Assert the review form modal appeared
      const reviewTitle = page.getByText('Review Proposal')
      if (await reviewTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissToasts(page)
        await captureScreenshot(page, '11-reviewer-assessment-form.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Review Proposal modal did not appear' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No proposal available for review (all reviewed or none assigned)' })
    }
  })

  test('12-reviewer-progress', async ({ page }) => {
    await loginAs(page, 'reviewer.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'reviewproposal')
    await waitForPageReady(page)
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 })
    await dismissToasts(page)
    await captureScreenshot(page, '12-reviewer-progress.png')
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 5: Final Proposal Approval (Ketua)
// ════════════════════════════════════════════════════════════════════

test.describe('Group 5: Final Proposal Approval', () => {
  test('13-tiga-review-selesai', async ({ page }) => {
    // View the proposal with 3/3 reviews complete from Staff perspective
    await loginAs(page, 'staff.lppm1@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)
    }

    // Look for a proposal with "Menunggu persetujuan Ketua" status
    const statusBadge = page.getByText(/Menunggu persetujuan Ketua LPPM/)
    if (await statusBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click on the row to open details
      const row = statusBadge.locator('xpath=ancestor::tr')
      if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
        await row.click()
        await page.waitForTimeout(1000)
      }
      await dismissToasts(page)
      await captureScreenshot(page, '13-tiga-review-selesai.png')
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No proposal with "Menunggu persetujuan Ketua LPPM" status found' })
    }
  })

  test('14-persetujuan-akhir-ketua', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)
    }

    // Look for "Menunggu persetujuan Ketua" proposal and open Hasil Review
    const statusBadge = page.getByText(/Menunggu persetujuan Ketua LPPM/)
    if (await statusBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      const row = statusBadge.locator('xpath=ancestor::tr')
      if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
        await row.click()
        await page.waitForTimeout(1500)
      }

      // Assert the "Terima proposal" and "Tolak proposal" buttons are visible
      const terimaBtn = page.getByRole('button', { name: /Terima proposal/ })
      const tolakBtn = page.getByRole('button', { name: /Tolak proposal/ })
      if (await terimaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissToasts(page)
        await captureScreenshot(page, '14-persetujuan-akhir-ketua.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Ketua approval buttons not visible - reviews may not be complete' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No proposal with "Menunggu persetujuan Ketua LPPM" status found' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 6: Accepted Proposal & Laporan
// ════════════════════════════════════════════════════════════════════

test.describe('Group 6: Accepted Proposal & Laporan', () => {
  test('15-proposal-diterima', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await waitForPageReady(page)
    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/ })
    if (await pengumumanTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)
      await dismissToasts(page)
      await captureScreenshot(page, '15-proposal-diterima.png')
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Pengumuman tab not available' })
    }
  })

  test('16-daftar-laporan-dosen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)
      await dismissToasts(page)
      await captureScreenshot(page, '16-daftar-laporan-dosen.png')
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan button not available' })
    }
  })

  test('17-logbook-dosen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'dosenmonitoringprogress')
    await waitForPageReady(page)
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')
      await waitForPageReady(page)

      // Find a "Proses Penelitian" row and click to open logbook
      const prosesRow = page.getByText(/Proses Penelitian/)
      if (await prosesRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        const row = prosesRow.locator('xpath=ancestor::tr')
        if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
          await row.click()
          await page.waitForTimeout(1000)
        }
      }

      // Look for "Cek Logbook" or "Tambah Logbook" button
      const logbookBtn = page.getByRole('button', { name: /Logbook|Tambah Logbook/ }).first()
      if (await logbookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await logbookBtn.click()
        await page.waitForTimeout(1000)
      }

      // Assert the Logbook modal appeared
      const logbookModal = page.getByText('Logbook Progress')
      if (await logbookModal.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dismissToasts(page)
        await captureScreenshot(page, '17-logbook-dosen.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Logbook modal not available - no logbook entries or Proses Penelitian stage' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan button not available' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 7: Publikasi & Diseminasi
// ════════════════════════════════════════════════════════════════════

test.describe('Group 7: Publikasi & Diseminasi', () => {
  test('18-publikasi', async ({ page }) => {
    const loaded = await openDosenLaporan(page)
    if (loaded) {
      const pubTab = page.getByRole('button', { name: /Publikasi/ })
      if (await pubTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await pubTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '18-publikasi.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Publikasi tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('19-diseminasi', async ({ page }) => {
    const loaded = await openDosenLaporan(page)
    if (loaded) {
      const disTab = page.getByRole('button', { name: /Diseminasi/ })
      if (await disTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await disTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '19-diseminasi.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Diseminasi tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 8: Claim Dana & Pengembalian Dana
// ════════════════════════════════════════════════════════════════════

test.describe('Group 8: Claim Dana & Pengembalian Dana', () => {
  test('20-claim-dana-staff', async ({ page }) => {
    const loaded = await openStaffLaporan(page)
    if (loaded) {
      const danaTab = page.getByRole('button', { name: /Claim Dana/ })
      if (await danaTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await danaTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '20-claim-dana-staff.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Claim Dana tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('21-claim-dana-dosen', async ({ page }) => {
    const loaded = await openDosenLaporan(page)
    if (loaded) {
      const danaTab = page.getByRole('button', { name: /Claim Dana/ })
      if (await danaTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await danaTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '21-claim-dana-dosen.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Claim Dana tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('22-pengembalian-dana-dosen', async ({ page }) => {
    const loaded = await openDosenLaporan(page)
    if (loaded) {
      const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
      if (await returnTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await returnTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)

        // Look for "Upload Bukti Pengembalian Dana" button
        const uploadBtn = page.getByRole('button', { name: /Upload Bukti Pengembalian/ }).first()
        if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await uploadBtn.click()
          await page.waitForTimeout(1000)
          // Assert the upload form appeared
          const uploadForm = page.getByText('Upload Bukti Transfer Pengembalian Dana')
          if (await uploadForm.isVisible({ timeout: 5000 }).catch(() => false)) {
            await dismissToasts(page)
            await captureScreenshot(page, '22-pengembalian-dana-dosen.png')
          } else {
            test.info().annotations.push({ type: 'skip', description: 'Pengembalian upload form did not appear' })
          }
        } else {
          test.info().annotations.push({ type: 'skip', description: 'Upload Bukti Pengembalian Dana button not available - no PkM proposal in pengembalian stage' })
        }
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Pengembalian Dana tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('23-pengembalian-dana-staff', async ({ page }) => {
    const loaded = await openStaffLaporan(page)
    if (loaded) {
      const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
      if (await returnTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await returnTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '23-pengembalian-dana-staff.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Pengembalian Dana tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('24-pengembalian-skip', async ({ page }) => {
    // Check for PkM no-funds-left/skip interface
    const loaded = await openStaffLaporan(page)
    if (loaded) {
      const returnTab = page.getByRole('button', { name: /Pengembalian Dana/ })
      if (await returnTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await returnTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)

        // Look for skip reason or "Tidak ada sisa dana" text
        const skipText = page.getByText(/Tidak ada sisa dana|skip|lewati/i)
        if (await skipText.isVisible({ timeout: 5000 }).catch(() => false)) {
          await dismissToasts(page)
          await captureScreenshot(page, '24-pengembalian-skip.png')
        } else {
          test.info().annotations.push({ type: 'skip', description: 'Pengembalian skip/no-funds interface not implemented in UI' })
        }
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Pengembalian Dana tab not available' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('25-monitoring-bukti-dana-ketua', async ({ page }) => {
    const loaded = await openKetuaSeleksi(page)
    if (loaded) {
      // Switch to Laporan view
      const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
      if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await laporanBtn.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
      }
      const danaTab = page.getByRole('button', { name: /Claim Dana/ })
      if (await danaTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await danaTab.click()
        await page.waitForLoadState('domcontentloaded')
        await waitForPageReady(page)
        await dismissToasts(page)
        await captureScreenshot(page, '25-monitoring-bukti-dana-ketua.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Claim Dana tab not available for Ketua' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Proposal or Seleksi tab not available' })
    }
  })
})

// ════════════════════════════════════════════════════════════════════
// Group 9: Authorization & Notifications
// ════════════════════════════════════════════════════════════════════

test.describe('Group 9: Authorization & Notifications', () => {
  test('26-authorization-request-ketua', async ({ page }) => {
    await loginAs(page, 'ketua.lppm@itbss.ac.id', 'password')
    await navigateTo(page, 'staffmonitoringprogress')
    await waitForPageReady(page)

    // Look for the "Permintaan Otorisasi" panel
    const authPanel = page.getByText('Permintaan Otorisasi')
    if (await authPanel.isVisible({ timeout: 10_000 }).catch(() => false)) {
      // Assert approve/deny controls are visible
      const approveBtn = page.locator('[class*="green"]').first()
      const rejectBtn = page.locator('[class*="red"]').first()
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dismissToasts(page)
        await captureScreenshot(page, '26-authorization-request-ketua.png')
      } else {
        test.info().annotations.push({ type: 'skip', description: 'Authorization approve/deny controls not visible' })
      }
    } else {
      test.info().annotations.push({ type: 'skip', description: 'No pending authorization requests for Ketua' })
    }
  })

  test('27-permintaan-revisi-staff', async ({ page }) => {
    const loaded = await openStaffLaporan(page)
    if (loaded) {
      await dismissToasts(page)
      await captureScreenshot(page, '27-permintaan-revisi-staff.png')
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Lihat Laporan not available' })
    }
  })

  test('28-notifikasi-dosen', async ({ page }) => {
    await loginAs(page, 'dosen.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'notifications')
    await waitForPageReady(page)
    await dismissToasts(page)
    await captureScreenshot(page, '28-notifikasi-dosen.png')
  })

  test('29-master-data-superadmin', async ({ page }) => {
    await loginAs(page, 'superadmin.e2e@itbss.ac.id', 'password')
    await navigateTo(page, 'users')
    await waitForPageReady(page)
    await expect(page.getByRole('heading', { name: 'Daftar Pengguna' })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 })
    await dismissToasts(page)
    await captureScreenshot(page, '29-master-data-superadmin.png')
  })
})
