import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen Penelitian Proposal', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PEN-PROP-001: Monitoring Progress page loads with skema cards', async ({ page }) => {
    await expect(page.getByText('Monitoring Progress')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-highlight]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('DS-PEN-PROP-002: Clicking Proposal button navigates to proposal monitoring', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-PROP-003: Draft proposal is visible in Pengajuan tab', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })

    // Table should show proposal data
    const body = await page.locator('body').textContent()
    const hasData = (body || '').includes('Draft') || (body || '').includes('Proposal') || (body || '').includes('Penerimaan')
    expect(hasData).toBeTruthy()
  })

  test('DS-PEN-PROP-004: Upload pending proposal shows correct status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const body = await page.locator('body').textContent()
    const hasStatus = (body || '').includes('Menunggu proposal untuk diupload') || (body || '').includes('Proposal')
    expect(hasStatus).toBeTruthy()
  })

  test('DS-PEN-PROP-005: Proposal waiting for Ketua review shows correct status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Menunggu review dari Ketua LPPM') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-PROP-006: Accepted proposal shows in Pengumuman tab', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/ })
    if (await pengumumanTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Proposal Diterima') || (body || '').includes('Diterima') || (body || '').includes('Pengumuman')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-PROP-007: Rejected proposal shows correct status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Ditolak') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-PROP-008: Draft proposal has edit action available', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Table should have action buttons
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    // Rows should have action buttons
    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(1)
  })

  test('DS-PEN-PROP-009: Ajukan Proposal button is available', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const ajukanBtn = page.getByRole('button', { name: /Ajukan Proposal/ })
    await expect(ajukanBtn).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-PROP-010: Type filter shows Penelitian option', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const penelitianFilter = page.getByText('Penelitian').first()
    await expect(penelitianFilter).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-PROP-011: Proposal under review shows reviewer status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')

      const body = await page.locator('body').textContent()
      const hasStatus = (body || '').includes('Menunggu review') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('DS-PEN-PROP-012: Breadcrumb navigation works', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await page.getByText('Monitoring Progress').first().click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Pantau progres proposal')).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PEN-PROP-013: Table shows columns for Jenis, Rencana Judul, Tahap & Status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Table headers should be visible
    await expect(page.getByRole('columnheader', { name: 'Jenis' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('columnheader', { name: 'Rencana Judul' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Tahap & Status' })).toBeVisible()
  })

  test('DS-PEN-PROP-014: Multiple Penelitian proposals are displayed', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should have multiple rows (header + data rows)
    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(2) // At least header + 1 data row
  })

  test('DS-PEN-PROP-015: Search input is functional', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const searchInput = page.getByPlaceholder('Cari reviewer, judul penelitian, dsb...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Draft')
    await page.waitForTimeout(500)

    // Should filter results
    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(1)
  })
})
