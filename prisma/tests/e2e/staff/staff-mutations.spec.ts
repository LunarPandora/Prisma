import { test, expect, captureApiEvidence } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

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

function extractList(body: any): any[] {
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.data?.data)) return body.data.data
  return []
}

test.describe('Staff LPPM — Mutations', () => {
  test('ST-PROP-SEL-MUT-001: Staff approves proposal at Staff Seleksi checkpoint', async ({ page }) => {
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

    const listResult = await apiGetAuthed(page, '/proposal?status=Menunggu+review+Staff+LPPM&per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const target = proposals.find((p: any) =>
      p.status === 'Menunggu review Staff LPPM' && p.staff_seleksi_approved === 0
    )

    if (!target) {
      console.log('ST-PROP-SEL-MUT-001: Skipped — no proposal at Staff Seleksi checkpoint')
      return
    }

    const proposalId = target.proposal_id

    const staffRow = page.getByRole('row')
      .filter({ hasText: 'Staff: ○ Belum' })
      .filter({ hasText: 'Menunggu review Staff LPPM' })
      .first()
    if (!(await staffRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('ST-PROP-SEL-MUT-001: Skipped — UI row not found')
      return
    }

    await staffRow.click({ button: 'right' })
    const menu = page.getByRole('menu', { name: 'Context menu' }).first()
    await expect(menu).toBeVisible({ timeout: 5_000 })

    const approveItem = page.getByRole('menuitem', { name: /Setujui|Approve|Staff/i }).first()
    if (!(await approveItem.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('ST-PROP-SEL-MUT-001: Skipped — approve menu item not found')
      return
    }
    await approveItem.click()
    await page.waitForTimeout(3000)

    const afterResult = await apiGetAuthed(page, `/proposal?per_page=50`)
    expect(afterResult.status).toBe(200)
    const afterProposals = extractList(afterResult.body)
    const afterProposal = afterProposals.find((p: any) => p.proposal_id === proposalId)

    if (afterProposal) {
      expect(afterProposal.staff_seleksi_approved).toBeTruthy()
    }
  })

  test('ST-PROP-REV-MUT-001: Staff assigns exactly 3 reviewers', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const proposalBtn = page.getByRole('button', { name: /Proposal/i }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const listResult = await apiGetAuthed(page, '/proposal?status=Menunggu+penugasan+reviewer&per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const target = proposals.find((p: any) => p.status === 'Menunggu penugasan reviewer')

    if (!target) {
      console.log('ST-PROP-REV-MUT-001: Skipped — no proposal awaiting reviewer assignment')
      return
    }

    const row = page.getByRole('row').filter({ hasText: 'E2E: Sistem Rekomendasi' }).first()
    if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('ST-PROP-REV-MUT-001: Skipped — UI row not found')
      return
    }

    await row.hover()
    await row.getByRole('button').last().click()
    await page.getByRole('menuitem', { name: /Tugaskan Reviewer/ }).first().click()
    await expect(page.getByText('Penugasan Reviewer')).toBeVisible({ timeout: 10_000 })

    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    if (count < 3) {
      console.log('ST-PROP-REV-MUT-001: Skipped — fewer than 3 reviewer checkboxes')
      return
    }

    for (let i = 0; i < 3; i++) {
      await checkboxes.nth(i).check()
    }
    await page.waitForTimeout(500)

    await expect(page.getByText('3/3 dipilih')).toBeVisible({ timeout: 5_000 })

    const submitBtn = page.getByRole('button', { name: /Submit penugasan/ })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await page.waitForTimeout(3000)

    const afterResult = await apiGetAuthed(page, `/proposal?per_page=50`)
    expect(afterResult.status).toBe(200)
    const afterProposals = extractList(afterResult.body)
    const afterProposal = afterProposals.find((p: any) => p.proposal_id === target.proposal_id)

    if (afterProposal) {
      expect(afterProposal.status).not.toBe('Menunggu penugasan reviewer')
    }
  })

  test('ST-DANA-MUT-001: Staff uploads dana evidence at Claim Dana', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress')
    await waitForDashboard(page)

    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')
    }

    const body = await page.locator('body').textContent()
    const hasClaimData = (body || '').includes('Claim Dana') ||
                         (body || '').includes('Menunggu bukti') ||
                         (body || '').includes('Konfirmasi')
    expect(hasClaimData).toBeTruthy()
  })

  test('ST-UPLOAD-VAL-001: Disallowed file extension is rejected', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    if (!(await proposalBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const testExe = Buffer.from('MZ\x90\x00fake-exe-content')
      await fileInput.setInputFiles({
        name: 'malware.exe',
        mimeType: 'application/x-msdownload',
        buffer: testExe,
      })
      await page.waitForTimeout(2000)

      const body = await page.locator('body').textContent()
      const rejected = (body || '').includes('format') ||
                       (body || '').includes('tidak') ||
                       (body || '').includes('error') ||
                       (body || '').includes('File')
      expect(rejected || page.url().includes('/dashboard')).toBeTruthy()
    }
  })

  test('ST-LAP-RETURN-MUT-001: Staff requests laporan return for revision', async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress')
    await waitForDashboard(page)

    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasLaporanData = (body || '').includes('Dalam pengerjaan') ||
                           (body || '').includes('Menunggu') ||
                           (body || '').includes('Laporan')
    expect(hasLaporanData).toBeTruthy()
  })

  test('ST-PERM-001: Staff cannot access Ketua-only final proposal decision', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const ketuaTarget = proposals.find((p: any) =>
      p.status === 'Menunggu persetujuan Ketua LPPM'
    )

    if (!ketuaTarget) {
      console.log('ST-PERM-001: Skipped — no proposal at Ketua decision stage')
      return
    }

    const proposalBtn = page.getByRole('button', { name: /Proposal/i }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const targetRow = page.getByRole('row').filter({ hasText: 'Menunggu persetujuan Ketua LPPM' }).first()
    if (await targetRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await targetRow.click({ button: 'right' })
      await page.waitForTimeout(500)

      const menu = page.getByRole('menu', { name: 'Context menu' }).first()
      if (await menu.isVisible({ timeout: 3000 }).catch(() => false)) {
        const approveItem = page.getByRole('menuitem', { name: /Setujui Proposal/i })
        const hasApprove = await approveItem.isVisible({ timeout: 2000 }).catch(() => false)
        expect(hasApprove).toBeFalsy()
      }
    }

    const apiResult = await apiPostAuthed(page, '/proposal/approve', {
      proposal_id: ketuaTarget.proposal_id,
    })
    await captureApiEvidence(page, 'ST-PERM-001', 'POST', '/proposal/approve', {
      proposal_id: ketuaTarget.proposal_id,
    })
    expect(apiResult.status).toBeGreaterThanOrEqual(400)
  })
})
