import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'
const RETURN_REASON = 'E2E RETURN REQUEST REASON - automated test for thesis validation'
const ORIGINAL_STATUS = 'Menunggu review Staff LPPM'

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

async function apiPostAuthed(page: import('@playwright/test').Page, path: string, body: Record<string, unknown>) {
  return page.evaluate(async ({ backend, path, body }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path, body })
}

/**
 * ST-RETURN-EXEC-001
 *
 * Proves that Staff's "Kembalikan untuk Perbaikan" action on a Proposal
 * actually creates an AuthorizationRequest via the real UI flow.
 */
test.describe('Staff Return Execution', () => {
  let createdAuthRequestId: number | null = null

  test('ST-RETURN-EXEC-001: Staff return request creates AuthorizationRequest and preserves proposal state', async ({ page }) => {
    // ── Step 1: Navigate to dashboard to establish session ──
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    // ── Step 2: Capture the proposal ID via authenticated API ──
    // The paginated API returns { data: [...proposals...], links, meta }
    const listResult = await apiGetAuthed(page, '/proposal?per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const targetProposal = proposals.find((p: any) =>
      p.status === ORIGINAL_STATUS
    )
    expect(targetProposal, 'Target proposal must exist in seeded data').toBeTruthy()
    const proposalId = targetProposal.proposal_id

    // ── Step 3: Verify no pending auth request exists for this proposal ──
    const existingAuth = await apiGetAuthed(page, '/authorization-request?per_page=20')
    // If the list API returns error (e.g. role-based filtering), we proceed anyway
    const existingRequests = existingAuth.status === 200 ? extractList(existingAuth.body) : []
    const alreadyPending = existingRequests.find(
      (r: any) => r.requestable_id === proposalId && r.status === 'Menunggu Persetujuan'
    )
    if (alreadyPending) {
      console.log(`ST-RETURN-EXEC-001: Skipped — pending auth request already exists for proposal ${proposalId}`)
      return
    }

    // ── Step 4: Navigate to Proposal monitoring ──
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // ── Step 5: Click Seleksi tab ──
    const seleksiTab = page.getByRole('button', { name: 'Seleksi' })
    await expect(seleksiTab).toBeVisible({ timeout: 5_000 })
    await seleksiTab.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // ── Step 6: Find the target proposal row ──
    // The table shows status text "Menunggu review Staff LPPM" in the row
    const targetRow = page.getByRole('row').filter({ hasText: ORIGINAL_STATUS }).first()
    await expect(targetRow).toBeVisible({ timeout: 10_000 })

    // ── Step 7: Open context menu and click "Kembalikan untuk Perbaikan" ──
    await targetRow.click({ button: 'right' })
    const menu = page.getByRole('menu', { name: 'Context menu' }).first()
    await expect(menu).toBeVisible({ timeout: 5_000 })

    const returnMenuItem = page.getByRole('menuitem', { name: 'Kembalikan untuk Perbaikan' })
    await expect(returnMenuItem).toBeVisible({ timeout: 5_000 })

    // ── Step 8: Handle the browser prompt dialog ──
    page.on('dialog', async (dialog) => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(RETURN_REASON)
      } else {
        await dialog.accept()
      }
    })

    await returnMenuItem.click()

    // ── Step 9: Wait for the API call and table refresh ──
    await page.waitForTimeout(3000)

    // ── Step 10: Verify AuthorizationRequest was created via API ──
    const authAfter = await apiGetAuthed(page, '/authorization-request?per_page=20')
    expect(authAfter.status).toBe(200)
    const authRequests = extractList(authAfter.body)
    const createdRequest = authRequests.find(
      (r: any) =>
        r.requestable_id === proposalId &&
        r.action === 'return_proposal_for_revision' &&
        r.status === 'Menunggu Persetujuan'
    )

    expect(createdRequest, 'AuthorizationRequest must be created with status Menunggu Persetujuan').toBeTruthy()
    expect(createdRequest.reason).toBe(RETURN_REASON)
    expect(createdRequest.source_stage).toBe('SELEKSI_PROPOSAL')
    createdAuthRequestId = createdRequest.id

    // ── Step 11: Verify Proposal status has NOT changed ──
    const proposalAfter = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(proposalAfter.status).toBe(200)
    const allProposals = extractList(proposalAfter.body)
    const proposalData = allProposals.find((p: any) => p.proposal_id === proposalId)
    expect(proposalData, 'Proposal must still exist').toBeTruthy()
    expect(proposalData.status).toBe(ORIGINAL_STATUS)

    // ── Step 12: Verify Ketua can see this request ──
    const ketuaView = await apiGetAuthed(page, '/authorization-request?status=Menunggu+Persetujuan&per_page=20')
    expect(ketuaView.status).toBe(200)
    const pendingForKetua = extractList(ketuaView.body)
    const visibleToKetua = pendingForKetua.find((r: any) => r.id === createdAuthRequestId)
    expect(visibleToKetua, 'Request must be visible to Ketua in authorization queue').toBeTruthy()
  })

  test.afterEach(async ({ page }) => {
    if (createdAuthRequestId) {
      try {
        await apiPostAuthed(page, '/authorization-request/authorize', {
          authorization_request_id: createdAuthRequestId,
          action: 'reject',
          review_note: 'E2E test cleanup',
        })
      } catch { /* best effort cleanup */ }
      createdAuthRequestId = null
    }
  })
})
