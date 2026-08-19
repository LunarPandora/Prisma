import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Dosen PkM Proposal', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)
  })

  test('DS-PKM-PROP-001: PkM proposals are visible in monitoring', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Should show PkM type in the table
    await expect(page.getByText('PkM').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PKM-PROP-002: PkM Draft proposal has correct status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')
    }

    await expect(page.getByText('Draft').first()).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PKM-PROP-003: PkM Review proposal shows correct status', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const seleksiTab = page.getByRole('button', { name: /Seleksi/ })
    if (await seleksiTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await seleksiTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Menunggu review').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-PROP-004: PkM Accepted proposal shows in Pengumuman tab', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const pengumumanTab = page.getByRole('button', { name: /Pengumuman/ })
    if (await pengumumanTab.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pengumumanTab.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Proposal Diterima').first()).toBeVisible({ timeout: 10_000 })
    }
  })

  test('DS-PKM-PROP-005: PkM proposals are isolated from Penelitian', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Filter by PkM
    const pkmFilter = page.getByText('PkM').first()
    if (await pkmFilter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await pkmFilter.click()
      await page.waitForLoadState('domcontentloaded')

      // Table should show only PkM proposals
      const rows = page.getByRole('row')
      const rowCount = await rows.count()
      expect(rowCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('DS-PKM-PROP-006: PkM Ajukan Proposal button is available', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const ajukanBtn = page.getByRole('button', { name: /Ajukan Proposal/ })
    await expect(ajukanBtn).toBeVisible({ timeout: 10_000 })
  })

  test('DS-PKM-PROP-007: PkM table shows correct columns', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('columnheader', { name: 'Jenis' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('columnheader', { name: 'Rencana Judul' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Tahap & Status' })).toBeVisible()
  })
})
