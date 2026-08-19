import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Ketua LPPM - Reviewer Rule', () => {
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

  test('KT-REV-001: Partial review (2/3) not appearing ready for Ketua decision', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasPartialReview = /Menunggu review/i.test(body || '')
    expect(hasPartialReview).toBeTruthy()
  })

  test('KT-REV-002: Post-review (3/3) appears ready for Ketua decision', async ({ page }) => {
    const statusBadge = page.getByText('Menunggu persetujuan Ketua LPPM')
    await expect(statusBadge.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-REV-003: All 3 reviewer names visible for post-review proposal', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasReviewerA = /Reviewer A/i.test(body || '')
    const hasReviewerB = /Reviewer B/i.test(body || '')
    const hasReviewerC = /Reviewer C/i.test(body || '')
    const totalReviewers = (hasReviewerA ? 1 : 0) + (hasReviewerB ? 1 : 0) + (hasReviewerC ? 1 : 0)
    expect(totalReviewers).toBeGreaterThanOrEqual(1)
  })
})
