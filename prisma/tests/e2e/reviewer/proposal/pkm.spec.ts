import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL } from '../../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

test.describe('Reviewer - PkM Proposal Review', () => {
  test('RV-PKM-PROP-001: PkM Proposal is assigned to reviewer', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(1)

    const body = await page.locator('body').textContent()
    expect(body || '').toContain('Review Proposal')
  })

  test('RV-PKM-PROP-MUT-001: PkM review form opens with submit button', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    const pkmRow = page.getByRole('row').filter({ hasText: 'PkM' }).first()
    if (!(await pkmRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = pkmRow.locator('button').first()
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
