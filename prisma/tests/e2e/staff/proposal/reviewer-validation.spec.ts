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
 * Reviewer Assignment Validation E2E Tests
 *
 * Tests the exactly-3-reviewer invariant at the backend API level.
 */

test.describe('Reviewer Assignment Validation', () => {
  /**
   * ST-REV-API-VAL-001
   *
   * Verifies the backend rejects reviewer assignments with fewer than 3 reviewers,
   * more than 3 reviewers, and duplicate reviewer IDs.
   */
  test('ST-REV-API-VAL-001: Backend rejects fewer than 3 reviewers', async ({ page }) => {
    // ── Step 1: Navigate to dashboard to establish session ──
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // ── Step 2: Find a proposal in "Menunggu penugasan reviewer" status ──
    const listResult = await apiGetAuthed(page, '/proposal?status=Menunggu+penugasan+reviewer&per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const targetProposal = proposals.find((p: any) =>
      p.status === 'Menunggu penugasan reviewer'
    )

    if (!targetProposal) {
      console.log('ST-REV-API-VAL-001: Skipped — no proposal in "Menunggu penugasan reviewer" status')
      return
    }

    const proposalId = targetProposal.proposal_id

    // ── Step 3: Attempt assignment with only 2 reviewers ──
    const assign2Result = await apiPostAuthed(page, '/penugasan/assign', {
      reviewable_type: 'App\\Models\\Proposal',
      reviewable_id: proposalId,
      reviewer_id: [100, 200],
    })

    const is2Rejected =
      assign2Result.status >= 400 ||
      assign2Result.body?.status === false ||
      assign2Result.body?.success === false

    expect(is2Rejected, 'Backend must reject assignment with only 2 reviewers').toBeTruthy()

    const errorMsg2 = assign2Result.body?.message || ''
    const mentionsCount = /tepat 3|3 reviewer/i.test(errorMsg2)
    expect(mentionsCount, 'Error message should mention the 3-reviewer requirement').toBeTruthy()

    // ── Step 4: Attempt assignment with 4 reviewers ──
    const assign4Result = await apiPostAuthed(page, '/penugasan/assign', {
      reviewable_type: 'App\\Models\\Proposal',
      reviewable_id: proposalId,
      reviewer_id: [100, 200, 300, 400],
    })

    const is4Rejected =
      assign4Result.status >= 400 ||
      assign4Result.body?.status === false ||
      assign4Result.body?.success === false

    expect(is4Rejected, 'Backend must reject assignment with 4 reviewers').toBeTruthy()

    // ── Step 5: Attempt assignment with duplicate reviewer IDs ──
    const assignDupResult = await apiPostAuthed(page, '/penugasan/assign', {
      reviewable_type: 'App\\Models\\Proposal',
      reviewable_id: proposalId,
      reviewer_id: [100, 100, 200],
    })

    const isDupRejected =
      assignDupResult.status >= 400 ||
      assignDupResult.body?.status === false ||
      assignDupResult.body?.success === false

    expect(isDupRejected, 'Backend must reject duplicate reviewer IDs').toBeTruthy()

    // ── Step 6: Verify proposal status unchanged ──
    const checkResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(checkResult.status).toBe(200)
    const allProposals = extractList(checkResult.body)
    const proposalCheck = allProposals.find((p: any) => p.proposal_id === proposalId)
    if (proposalCheck) {
      expect(proposalCheck.status).toBe('Menunggu penugasan reviewer')
    }
  })
})
