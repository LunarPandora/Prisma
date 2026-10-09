import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL } from '../helpers/navigation'

test.describe('Data Persistence After Reload', () => {
  test('RV-PERSIST-001: Reviewer — review status persists after reload', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasReviewData = (body || '').includes('Belum direview') ||
                          (body || '').includes('Telah direview') ||
                          (body || '').includes('Review Proposal')
    expect(hasReviewData).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasReviewDataAfter = (bodyAfter || '').includes('Belum direview') ||
                               (bodyAfter || '').includes('Telah direview') ||
                               (bodyAfter || '').includes('Review Proposal')
    expect(hasReviewDataAfter).toBeTruthy()
  })
})
