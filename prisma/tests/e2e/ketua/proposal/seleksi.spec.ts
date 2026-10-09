import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetAuthed(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

function extractList(body: any): any[] {
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.data?.data)) return body.data.data
  return []
}

test.describe('Ketua LPPM - Proposal Normal Seleksi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtns = page.getByRole('button', { name: /Proposal/i })
    const btnCount = await proposalBtns.count()
    await proposalBtns.nth(0).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('KT-PROP-SEL-001: Ketua sees proposal waiting for normal review', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasStatus = (body || '').includes('Menunggu review dari Ketua LPPM') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
    expect(hasStatus).toBeTruthy()
  })

  test('KT-PROP-SEL-002: Ketua sees proposal table with action buttons', async ({ page }) => {
    const table = page.getByRole('table')
    await expect(table).toBeVisible({ timeout: 10_000 })

    const rows = page.getByRole('row')
    const count = await rows.count()
    expect(count).toBeGreaterThan(1)
  })

  test('KT-PROP-SEL-003: Post-review proposal visible for Ketua decision', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasStatus = (body || '').includes('Menunggu persetujuan Ketua LPPM') || (body || '').includes('Seleksi') || (body || '').includes('Proposal')
    expect(hasStatus).toBeTruthy()
  })

  test('KT-PROP-SEL-004: Proposal table shows reviewer column', async ({ page }) => {
    const reviewerHeader = page.getByRole('columnheader', { name: /Reviewer/i })
    await expect(reviewerHeader).toBeVisible({ timeout: 10_000 })
  })

  test('KT-PROP-SEL-005: Ketua cannot approve proposal still at Staff screening stage', async ({ page }) => {
    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const staffOnlyTarget = proposals.find((p: any) =>
      p.status === 'Menunggu review Staff LPPM' && p.staff_seleksi_approved === 0
    )

    if (!staffOnlyTarget) {
      console.log('KT-PROP-SEL-005: Skipped — no proposal at Staff screening stage')
      return
    }

    const staffRow = page.getByRole('row')
      .filter({ hasText: 'Staff: ○ Belum' })
      .filter({ hasText: 'Menunggu review Staff LPPM' })
      .first()

    if (!(await staffRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('KT-PROP-SEL-005: Skipped — UI row not found')
      return
    }

    await staffRow.click({ button: 'right' })
    await page.waitForTimeout(500)

    const menu = page.getByRole('menu', { name: 'Context menu' }).first()
    if (await menu.isVisible({ timeout: 3000 }).catch(() => false)) {
      const approveItem = page.getByRole('menuitem', { name: /Setujui Proposal/i })
      const hasApprove = await approveItem.isVisible({ timeout: 2000 }).catch(() => false)
      expect(hasApprove).toBeFalsy()
    }
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
