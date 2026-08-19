import { test, expect } from '@playwright/test'
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

function getAuthRowByLabel(page: import('@playwright/test').Page, labelText: string) {
  const textEl = page.getByText(labelText, { exact: false }).first()
  return textEl.locator('..').locator('..')
}

/**
 * KT-AUTHZ-APPROVE-001
 *
 * Proves that Ketua clicking "Setujui" on a pending return authorization request:
 * 1. Executes the return_proposal_for_revision action (proposal → "Revisi")
 * 2. The proposal does NOT disappear (not deleted)
 * 3. Historical data remains preserved
 * 4. The request disappears from the pending queue
 */
test.describe('Ketua Authorization Approval', () => {
  test('KT-AUTHZ-APPROVE-001: Ketua approval executes return transition', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // ── Step 1: Capture proposal state BEFORE approval ──
    const authResult = await apiGetAuthed(page, '/authorization-request?status=Menunggu+Persetujuan&per_page=20')
    expect(authResult.status).toBe(200)
    const authRequests = extractList(authResult.body)
    const returnRequest = authRequests.find(
      (r: any) => r.action === 'return_proposal_for_revision' && r.status === 'Menunggu Persetujuan'
    )
    expect(returnRequest, 'Pending return request must exist').toBeTruthy()
    const requestId = returnRequest.id
    const proposalId = returnRequest.requestable_id

    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const allProposals = extractList(listResult.body)
    const returnProposal = allProposals.find((p: any) => p.proposal_id === proposalId)
    expect(returnProposal, 'Return proposal must exist').toBeTruthy()

    // ── Step 2: Verify the authorization queue is visible ──
    const authQueueHeading = page.getByText('Permintaan Otorisasi')
    await expect(authQueueHeading).toBeVisible({ timeout: 15_000 })

    const returnRow = getAuthRowByLabel(page, 'Kembalikan Proposal untuk Revisi')
    await expect(returnRow).toBeVisible({ timeout: 5_000 })

    // ── Step 3: Click the Approve button ──
    const approveBtn = returnRow.locator('button[title="Setujui"]')
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()
    await page.waitForTimeout(4000)

    // ── Step 4: Verify proposal status changed to "Revisi" ──
    const proposalAfter = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(proposalAfter.status).toBe(200)
    const proposalsAfter = extractList(proposalAfter.body)
    const proposalData = proposalsAfter.find((p: any) => p.proposal_id === proposalId)
    expect(proposalData, 'Proposal must still exist (not deleted)').toBeTruthy()
    expect(proposalData.status).toBe('Revisi')

    // ── Step 5: Verify historical data preserved ──
    expect(proposalData.judul).toBe(returnProposal.judul)
    expect(proposalData.user_id).toBe(returnProposal.user_id)
    expect(proposalData.kegiatan_id).toBe(returnProposal.kegiatan_id)

    // ── Step 6: Verify request is no longer in the pending queue ──
    const pendingAfter = await apiGetAuthed(page, '/authorization-request?status=Menunggu+Persetujuan&per_page=20')
    expect(pendingAfter.status).toBe(200)
    const pendingRequests = extractList(pendingAfter.body)
    const stillPending = pendingRequests.find((r: any) => r.id === requestId)
    expect(stillPending, 'Approved request must no longer be in pending queue').toBeFalsy()

    // ── Step 7: Queue no longer shows this request ──
    const queueStillHasReturn = page.getByText('Kembalikan Proposal untuk Revisi')
    await expect(queueStillHasReturn).toHaveCount(0, { timeout: 5_000 })
  })
})

/**
 * KT-AUTHZ-DENY-001
 *
 * Proves that Ketua clicking "Tolak" on a pending reject authorization request:
 * 1. Changes the request status to "Ditolak"
 * 2. Does NOT execute the destructive action (proposal stays in original status)
 * 3. Historical data remains intact
 */
test.describe('Ketua Authorization Denial', () => {
  test('KT-AUTHZ-DENY-001: Ketua denial preserves original proposal state', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // ── Step 1: Capture proposal state BEFORE denial ──
    const authResult = await apiGetAuthed(page, '/authorization-request?status=Menunggu+Persetujuan&per_page=20')
    expect(authResult.status).toBe(200)
    const authRequests = extractList(authResult.body)
    const rejectRequest = authRequests.find(
      (r: any) => r.action === 'reject_proposal' && r.status === 'Menunggu Persetujuan'
    )
    expect(rejectRequest, 'Pending reject request must exist').toBeTruthy()
    const requestId = rejectRequest.id
    const proposalId = rejectRequest.requestable_id

    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const allProposals = extractList(listResult.body)
    const rejectProposal = allProposals.find((p: any) => p.proposal_id === proposalId)
    expect(rejectProposal, 'Reject proposal must exist').toBeTruthy()
    const originalStatus = rejectProposal.status

    // ── Step 2: Verify the authorization queue is visible ──
    const authQueueHeading = page.getByText('Permintaan Otorisasi')
    await expect(authQueueHeading).toBeVisible({ timeout: 15_000 })

    const rejectRow = getAuthRowByLabel(page, 'Tolak Proposal')
    await expect(rejectRow).toBeVisible({ timeout: 5_000 })

    // ── Step 3: Click the Deny button ──
    const denyBtn = rejectRow.locator('button[title="Tolak"]')
    await expect(denyBtn).toBeVisible({ timeout: 5_000 })
    await denyBtn.click()
    await page.waitForTimeout(4000)

    // ── Step 4: Verify proposal status has NOT changed ──
    const proposalAfter = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(proposalAfter.status).toBe(200)
    const proposalsAfter = extractList(proposalAfter.body)
    const proposalData = proposalsAfter.find((p: any) => p.proposal_id === proposalId)
    expect(proposalData, 'Proposal must still exist').toBeTruthy()
    expect(proposalData.status).toBe(originalStatus)

    // ── Step 5: Verify historical data intact ──
    expect(proposalData.judul).toBe(rejectProposal.judul)
    expect(proposalData.user_id).toBe(rejectProposal.user_id)
    expect(proposalData.kegiatan_id).toBe(rejectProposal.kegiatan_id)

    // ── Step 6: Verify request is no longer in the pending queue ──
    const pendingAfter = await apiGetAuthed(page, '/authorization-request?status=Menunggu+Persetujuan&per_page=20')
    expect(pendingAfter.status).toBe(200)
    const pendingRequests = extractList(pendingAfter.body)
    const stillPending = pendingRequests.find((r: any) => r.id === requestId)
    expect(stillPending, 'Denied request must no longer be in pending queue').toBeFalsy()

    // ── Step 7: Queue no longer shows this request ──
    const queueStillHasReject = page.getByText('Tolak Proposal')
    await expect(queueStillHasReject).toHaveCount(0, { timeout: 5_000 })
  })
})
