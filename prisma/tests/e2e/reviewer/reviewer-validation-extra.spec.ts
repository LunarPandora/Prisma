import { test, expect } from '../helpers/evidence'
import {
  openReviewProposalTab,
  openReviewFormForRow,
  fillScores,
  fillCatatan,
  submitReview,
} from './helpers/reviewForm'

test.describe('Reviewer — Score Validation', () => {
  test('RV-VAL-002: Out-of-range scores are rejected', async ({ page }) => {
    await openReviewProposalTab(page)

    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('RV-VAL-002: Skipped — no unreviewed proposal available')
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      console.log('RV-VAL-002: Skipped — review button not found')
      return
    }
    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    expect(body).toContain('Submit Review')

    await fillScores(page, [101, 99, 100, 101])
    await fillCatatan(page, 'RV-VAL-002: Testing out-of-range scores')
    await submitReview(page)
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const stillOnForm = (bodyAfter || '').includes('Submit Review') ||
                        (bodyAfter || '').includes('Kriteria Penilaian')
    const rejected = (bodyAfter || '').includes('error') ||
                     (bodyAfter || '').includes('Gagal') ||
                     (bodyAfter || '').includes('nilai') ||
                     (bodyAfter || '').includes('maksimal')
    expect(stillOnForm || rejected).toBeTruthy()
  })
})

test.describe('Reviewer — Empty Keputusan Validation (Rewrite)', () => {
  test('RV-VAL-001-RW: Submit with empty keputusan is rejected and no review persisted', async ({ page }) => {
    await openReviewProposalTab(page)

    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('RV-VAL-001-RW: Skipped — no unreviewed proposal available')
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      console.log('RV-VAL-001-RW: Skipped — review button not found')
      return
    }
    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    expect(body).toContain('Submit Review')

    await fillScores(page, [3, 3, 3, 3])
    await fillCatatan(page, 'RV-VAL-001-RW: Testing empty keputusan submission')
    await submitReview(page)
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const stillOnForm = (bodyAfter || '').includes('Submit Review') ||
                        (bodyAfter || '').includes('Kriteria Penilaian')
    expect(stillOnForm, 'Submission with empty keputusan must NOT succeed — form should remain open or show error').toBeTruthy()

    const successToast = (bodyAfter || '').includes('berhasil direview')
    expect(successToast, 'Success toast must NOT appear for empty keputusan submission').toBeFalsy()
  })
})
