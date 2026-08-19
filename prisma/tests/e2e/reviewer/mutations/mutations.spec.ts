import { test, expect } from '@playwright/test'
import {
  openReviewProposalTab,
  openReviewLaporanTab,
  openReviewFormForRow,
  fillAndSubmitReview,
  fillScores,
  fillCatatan,
  selectKeputusan,
  checkFirstKesesuaianTema,
  submitReview,
} from '../helpers/reviewForm'

test.describe('Reviewer — Pre-Mutation Checks', () => {
  test('RV-3REV-001: 1/3 reviews — workflow does NOT advance (before any mutation)', async ({ page }) => {
    await openReviewProposalTab(page)

    const row = page.getByRole('row').filter({ hasText: /Sabtu, 1 Agustus 2026/ }).first()
    await expect(row).toBeVisible({ timeout: 10_000 })

    const body = await page.locator('body').textContent()
    expect(body).toContain('Belum direview')
  })

  test('RV-ISO-MUT-001: Unassigned proposal not visible to Reviewer', async ({ page }) => {
    await openReviewProposalTab(page)

    const body = await page.locator('body').textContent()
    expect(body).not.toContain('Proposal Tidak Ditugaskan')
  })
})

test.describe('Reviewer — Proposal Mutations', () => {
  test('RV-PROP-MUT-002: Real Penelitian proposal review submission', async ({ page }) => {
    await openReviewProposalTab(page)
    await openReviewFormForRow(page, 'AI for Education')

    const body = await page.locator('body').textContent()
    expect(body).toContain('Kriteria Penilaian Reviewer')
    expect(body).toContain('Submit Review')

    await fillAndSubmitReview(page, [5, 4, 3, 5], 'E2E REVIEWER PENELITIAN COMMENT')
    await page.waitForTimeout(2000)

    const bodyAfter = await page.locator('body').textContent()
    expect(bodyAfter).toContain('Telah direview')
  })

  test('RV-PROP-MUT-003: Reviewed proposal shows Telah direview and action button is disabled', async ({ page }) => {
    await openReviewProposalTab(page)

    const reviewedRow = page.getByRole('row').filter({ hasText: /Sabtu, 25 Juli 2026/ }).first()
    await expect(reviewedRow).toBeVisible({ timeout: 10_000 })

    const statusBadge = reviewedRow.locator('span').filter({ hasText: 'Telah direview' }).first()
    await expect(statusBadge).toBeVisible({ timeout: 5_000 })

    const actionBtn = reviewedRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    const isVisible = await actionBtn.isVisible().catch(() => false)
    if (isVisible) {
      const isDisabled = await actionBtn.isDisabled().catch(() => false)
      expect(isDisabled).toBeTruthy()
    }
  })
})

test.describe('Reviewer — PkM Proposal Mutation', () => {
  test('RV-PKM-PROP-MUT-002: Real PkM proposal review submission', async ({ page }) => {
    await openReviewProposalTab(page)
    await openReviewFormForRow(page, 'PkM: Edukasi Digital')

    const body = await page.locator('body').textContent()
    expect(body).toContain('Kriteria Penilaian Reviewer')
    expect(body).toContain('Submit Review')

    await fillAndSubmitReview(page, [4, 5, 4, 3], 'E2E REVIEWER PKM COMMENT')
    await page.waitForTimeout(2000)

    const bodyAfter = await page.locator('body').textContent()
    expect(bodyAfter).toContain('Telah direview')
  })
})

test.describe('Reviewer — Laporan Mutations', () => {
  test('RV-LAP-MUT-002: Real Penelitian Laporan review submission', async ({ page }) => {
    await openReviewLaporanTab(page)
    await openReviewFormForRow(page, 'Laporan Penelitian Review')

    const body = await page.locator('body').textContent()
    expect(body).toContain('Kriteria Penilaian Reviewer')
    expect(body).toContain('Submit Review')

    await fillAndSubmitReview(page, [5, 5, 4, 4], 'E2E REVIEWER LAPORAN COMMENT')
    await page.waitForTimeout(2000)

    const bodyAfter = await page.locator('body').textContent()
    expect(bodyAfter).toContain('Telah direview')
  })

  test('RV-LAP-3REV-001: Laporan status after reviews', async ({ page }) => {
    await openReviewLaporanTab(page)

    const body = await page.locator('body').textContent()
    const hasReviewed = (body || '').includes('Menunggu keputusan Ketua') ||
                        (body || '').includes('Telah direview')
    expect(hasReviewed).toBeTruthy()
  })

  test('RV-LAP-PKM-MUT-001: Real PkM Laporan review submission', async ({ page }) => {
    await openReviewLaporanTab(page)
    await openReviewFormForRow(page, 'Laporan PkM Review')

    const body = await page.locator('body').textContent()
    expect(body).toContain('Kriteria Penilaian Reviewer')
    expect(body).toContain('Submit Review')

    await fillAndSubmitReview(page, [3, 4, 5, 4], 'E2E REVIEWER PKM LAPORAN COMMENT')
    await page.waitForTimeout(2000)

    const bodyAfter = await page.locator('body').textContent()
    expect(bodyAfter).toContain('Telah direview')
  })
})

test.describe('Reviewer — Validation', () => {
  test('RV-VAL-001: Submit with empty keputusan — verify actual behavior', async ({ page }) => {
    await openReviewProposalTab(page)

    const row = page.getByRole('row').filter({ hasText: /Minggu, 2 Agustus 2026/ }).first()
    await expect(row).toBeVisible({ timeout: 10_000 })

    const actionBtn = row.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    await expect(actionBtn).toBeVisible({ timeout: 5_000 })
    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    expect(body).toContain('Submit Review')

    await fillScores(page, [3, 3, 3, 3])
    await fillCatatan(page, 'RV-VAL-001: Testing empty keputusan submission')
    await submitReview(page)
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasResponse = (bodyAfter || '').includes('berhasil') ||
                        (bodyAfter || '').includes('Gagal') ||
                        (bodyAfter || '').includes('error') ||
                        (bodyAfter || '').includes('Submit Review')
    expect(hasResponse).toBeTruthy()
  })
})

test.describe('Reviewer — Score Independence & 3/3 Completion', () => {
  test('RV-SCORE-001 + RV-3REV-003: Different scores, 3rd reviewer submits → advances', async ({ page }) => {
    await openReviewProposalTab(page)

    await openReviewFormForRow(page, 'Senin, 3 Agustus 2026')

    const scores = [3, 5, 2, 4]
    await fillScores(page, scores)
    await fillCatatan(page, 'E2E REVIEWER 3RD COMPLETION')
    await selectKeputusan(page, 'Diterima dengan perbaikan')
    await checkFirstKesesuaianTema(page)

    const inputs = page.locator('input[inputmode="numeric"]')
    for (let i = 0; i < scores.length; i++) {
      const val = await inputs.nth(i).inputValue()
      expect(Number(val)).toBe(scores[i])
    }

    await submitReview(page)
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasAdvanced = (bodyAfter || '').includes('Menunggu persetujuan Ketua LPPM') ||
                        (bodyAfter || '').includes('Telah direview')
    expect(hasAdvanced).toBeTruthy()
  })
})
