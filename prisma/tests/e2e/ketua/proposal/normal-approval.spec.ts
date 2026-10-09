import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL } from '../../helpers/navigation'

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

/**
 * KT-PROP-APPROVE-001
 *
 * Proves that Ketua's normal "Setujui Proposal" action at the
 * "Menunggu review dari Ketua LPPM" checkpoint actually executes
 * the forward transition.
 *
 * This is NOT an AuthorizationRequest test.
 * This represents Ketua acting as the normal workflow decision-maker.
 *
 * Flow:
 *   1. Ketua opens Proposal monitoring Seleksi tab
 *   2. Finds a proposal at "Menunggu review dari Ketua LPPM" with Staff approval
 *   3. Right-clicks → clicks "Setujui Proposal"
 *   4. Verifies the proposal moves to "Menunggu review Staff LPPM"
 *   5. Verifies ketua_seleksi_approved is set to true
 *   6. No AuthorizationRequest is created for this normal decision
 */
test.describe('Ketua Normal Proposal Approval', () => {
  const ORIGINAL_STATUS = 'Menunggu review dari Ketua LPPM'
  const EXPECTED_STATUS = 'Menunggu review Staff LPPM'

  test('KT-PROP-APPROVE-001: Ketua approval transitions proposal to Staff review', async ({ page }) => {
    // ── Step 1: Navigate to dashboard to establish session ──
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // ── Step 2: Capture the proposal state BEFORE approval via API ──
    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const allProposals = extractList(listResult.body)
    const targetProposal = allProposals.find((p: any) =>
      p.status === ORIGINAL_STATUS && p.staff_seleksi_approved === 1 && p.ketua_seleksi_approved === 0
    )
    if (!targetProposal) {
      console.log('KT-PROP-APPROVE-001: Skipped — no proposal at Ketua review stage')
      return
    }
    const proposalId = targetProposal.proposal_id

    // ── Step 3: Verify no AuthorizationRequest exists for this proposal ──
    const authResult = await apiGetAuthed(page, '/authorization-request?per_page=20')
    expect(authResult.status).toBe(200)
    const authRequests = extractList(authResult.body)
    const existingAuth = authRequests.find(
      (r: any) => r.requestable_id === proposalId
    )
    expect(existingAuth, 'No authorization request should exist for this proposal').toBeFalsy()

    // ── Step 4: Navigate to Proposal monitoring ──
    const proposalBtns = page.getByRole('button', { name: /Proposal/i })
    const btnCount = await proposalBtns.count()
    await proposalBtns.nth(0).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // ── Step 5: Click Seleksi tab ──
    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // ── Step 6: Find the target proposal row by status text ──
    // Table shows rencana_judul_publikasi_gan (not judul), so filter by status
    const targetRow = page.getByRole('row').filter({ hasText: 'Ketua: ○ Belum' }).filter({ hasText: 'Staff: ✓ Setuju' }).first()
    await expect(targetRow).toBeVisible({ timeout: 10_000 })

    // ── Step 7: Open context menu and click "Setujui Proposal" ──
    await targetRow.click({ button: 'right' })
    const menu = page.getByRole('menu', { name: 'Context menu' }).first()
    await expect(menu).toBeVisible({ timeout: 5_000 })

    const approveMenuItem = page.getByRole('menuitem', { name: 'Setujui Proposal' })
    await expect(approveMenuItem).toBeVisible({ timeout: 5_000 })

    // ── Step 8: Click the approve menu item ──
    await approveMenuItem.click()

    // Wait for the API call and table refresh
    await page.waitForTimeout(3000)

    // ── Step 9: Verify the proposal status changed via API ──
    const proposalAfter = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(proposalAfter.status).toBe(200)
    const proposalsAfter = extractList(proposalAfter.body)
    const proposalData = proposalsAfter.find((p: any) => p.proposal_id === proposalId)
    expect(proposalData, 'Proposal must still exist after approval').toBeTruthy()
    expect(proposalData.status).toBe(EXPECTED_STATUS)

    // ── Step 10: Verify ketua_seleksi_approved is true ──
    expect(proposalData.ketua_seleksi_approved).toBeTruthy()

    // ── Step 11: Verify no AuthorizationRequest was created ──
    const authAfter = await apiGetAuthed(page, '/authorization-request?per_page=20')
    expect(authAfter.status).toBe(200)
    const authAfterRequests = extractList(authAfter.body)
    const newAuthForProposal = authAfterRequests.find(
      (r: any) => r.requestable_id === proposalId
    )
    expect(newAuthForProposal, 'Normal approval must NOT create an AuthorizationRequest').toBeFalsy()

    // ── Step 12: Verify historical data preserved ──
    expect(proposalData.judul).toBe(targetProposal.judul)
    expect(proposalData.user_id).toBe(targetProposal.user_id)
    expect(proposalData.kegiatan_id).toBe(targetProposal.kegiatan_id)
  })
})
