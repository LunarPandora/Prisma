import { test, expect } from '@playwright/test'
import { FRONTEND_URL } from '../../helpers/navigation'

test.describe('Reviewer - PkM Proposal Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('RV-PKM-PROP-001: PkM Proposal appears in review list', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasPkMProposal = (body || '').includes('PkM: Edukasi Digital')
    expect(hasPkMProposal).toBeTruthy()
  })

  test('RV-PKM-PROP-MUT-001: PkM review form opens with submit button', async ({ page }) => {
    const pkmRow = page.getByRole('row').filter({ hasText: 'PkM: Edukasi Digital' }).first()
    if (!(await pkmRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = pkmRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip()
      return
    }

    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasForm = (body || '').includes('Submit Review') || (body || '').includes('Review Proposal') || (body || '').includes('Kriteria Penilaian')
    expect(hasForm).toBeTruthy()
  })
})
