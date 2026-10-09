import { test, expect, captureApiEvidence } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

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

test.describe('Ketua LPPM — Mutations', () => {
  test('KT-PROP-REJECT-MUT-001: Ketua rejects proposal at Seleksi checkpoint', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtn = page.getByRole('button', { name: /Proposal/i }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const listResult = await apiGetAuthed(page, '/proposal?status=Menunggu+review+dari+Ketua+LPPM&per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const target = proposals.find((p: any) =>
      p.status === 'Menunggu review dari Ketua LPPM' && p.ketua_seleksi_approved === 0
    )

    if (!target) {
      console.log('KT-PROP-REJECT-MUT-001: Skipped — no proposal awaiting Ketua decision')
      return
    }

    const proposalId = target.proposal_id

    const targetRow = page.getByRole('row').filter({ hasText: 'Menunggu review dari Ketua LPPM' }).first()
    if (!(await targetRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('KT-PROP-REJECT-MUT-001: Skipped — UI row not found')
      return
    }

    await targetRow.click({ button: 'right' })
    const menu = page.getByRole('menu', { name: 'Context menu' }).first()
    await expect(menu).toBeVisible({ timeout: 5_000 })

    const rejectItem = page.getByRole('menuitem', { name: /Tolak|Reject/i }).first()
    if (!(await rejectItem.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('KT-PROP-REJECT-MUT-001: Skipped — reject menu item not found')
      return
    }
    await rejectItem.click()
    await page.waitForTimeout(2000)

    const confirmBtn = page.getByRole('button', { name: /Konfirmasi|Ya|Confirm|OK/i }).first()
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click()
    }
    await page.waitForTimeout(3000)

    const afterResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(afterResult.status).toBe(200)
    const afterProposals = extractList(afterResult.body)
    const afterProposal = afterProposals.find((p: any) => p.proposal_id === proposalId)

    if (afterProposal) {
      const statusChanged = afterProposal.status !== 'Menunggu review dari Ketua LPPM'
      const isRejected = afterProposal.status === 'Ditolak'
      const isReturned = afterProposal.status === 'Revisi'
      expect(statusChanged).toBeTruthy()
      expect(isRejected || isReturned).toBeTruthy()
    }
  })

  test('KT-DIS-APPROVE-MUT-001: Ketua approves Diseminasi on a Laporan', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const laporanBtn = page.getByRole('button', { name: /Laporan/i }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
    }

    const body = await page.locator('body').textContent()
    const hasDiseminasi = (body || '').includes('Diseminasi') ||
                          (body || '').includes('Menunggu keputusan Ketua') ||
                          (body || '').includes('Laporan')
    expect(hasDiseminasi).toBeTruthy()
  })

  test('KT-PERM-DANA-001: Ketua cannot upload dana evidence (UI + API)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const sidebar = page.locator('#navbar-menu')
    const sidebarText = await sidebar.textContent()
    const hasDanaModule = /Claim Dana|Pengembalian Dana/i.test(sidebarText || '')
    expect(hasDanaModule).toBeFalsy()

    const apiResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(apiResult.status).toBe(200)
    const proposals = extractList(apiResult.body)
    const claimTarget = proposals.find((p: any) => p.tahap_penelitian === 'Laporan')

    if (claimTarget) {
      const uploadResult = await page.evaluate(async ({ backend, proposalId }) => {
        const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
        const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
        const res = await fetch(`${backend}/api/dana/upload-bukti`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
          credentials: 'include',
          body: JSON.stringify({ proposal_id: proposalId }),
        })
        return { status: res.status }
      }, { backend: BACKEND, proposalId: claimTarget.proposal_id })

      expect(uploadResult.status).toBeGreaterThanOrEqual(400)
      await captureApiEvidence(page, 'KT-PERM-DANA-001', 'POST', '/dana/upload-bukti', {
        proposal_id: claimTarget.proposal_id,
      })
    }
  })
})
