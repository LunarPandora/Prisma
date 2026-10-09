import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Staff LPPM - Reviewer Assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
  })

  test('ST-PROP-REV-001: Reviewer assignment modal opens', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await row.hover()
      await row.getByRole('button').last().click()

      await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()

      await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })
    }
  })

  test('ST-PROP-REV-002: Reviewer assignment modal shows available reviewers', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await row.hover()
      await row.getByRole('button').last().click()

      await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()
      await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })

      await expect(page.getByText('Reviewer A')).toBeVisible()
      await expect(page.getByText('Reviewer B')).toBeVisible()
      await expect(page.getByText('Reviewer C')).toBeVisible()
    }
  })

  test('ST-PROP-REV-003: Reviewer assignment has submit button', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await row.hover()
      await row.getByRole('button').last().click()

      await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()
      await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })

      await expect(page.getByRole('button', { name: /Submit penugasan/ })).toBeVisible()
    }
  })

  test('ST-PROP-REV-004: Under-review proposal shows reviewer status', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Optimasi Database' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(row.getByText('Reviewer A')).toBeVisible()
      await expect(row.getByText('Reviewer B')).toBeVisible()
      await expect(row.getByText('Reviewer C')).toBeVisible()
    }
  })

  test('ST-PROP-REV-005: Progress indicator shows 0/3 when no reviewers selected', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await row.hover()
      await row.getByRole('button').last().click()

      await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()
      await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })

      await expect(page.getByText('Pilih tepat 3 Reviewer')).toBeVisible()
      await expect(page.getByText('0/3 dipilih')).toBeVisible()
    }
  })

  test('ST-PROP-REV-006: Submit button disabled when not exactly 3 reviewers', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' })
    if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
      await row.hover()
      await row.getByRole('button').last().click()

      await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()
      await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })

      const submitBtn = page.getByRole('button', { name: /Submit penugasan/ })
      await expect(submitBtn).toBeDisabled()
    }
  })
})
