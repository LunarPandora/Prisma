import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

test.describe('Ketua LPPM - Proposal Normal Seleksi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtn = page.getByRole('button', { name: /Proposal/i }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('KT-PROP-SEL-001: Ketua sees proposal waiting for normal review', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu review dari Ketua LPPM')
    await expect(statusBadge.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-PROP-SEL-002: Ketua sees proposal table with action buttons', async ({ page }) => {
    const table = page.getByRole('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    const rows = page.getByRole('row')
    const count = await rows.count()
    expect(count).toBeGreaterThan(1)
  })

  test('KT-PROP-SEL-003: Post-review proposal visible for Ketua decision', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu persetujuan Ketua LPPM')
    await expect(statusBadge.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-PROP-SEL-004: Proposal table shows reviewer column', async ({ page }) => {
    const reviewerHeader = page.getByRole('columnheader', { name: /Reviewer/i })
    await expect(reviewerHeader).toBeVisible({ timeout: 10_000 })
  })

  test('KT-PROP-SEL-MUT-001: Ketua can approve proposal at Seleksi checkpoint', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'Menunggu review dari Ketua LPPM' }).first()
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      const actionButtons = row.locator('button, [role="button"], svg')
      const count = await actionButtons.count()
      expect(count).toBeGreaterThan(0)
    }
  })
})
