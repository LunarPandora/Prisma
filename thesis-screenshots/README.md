# Thesis Screenshot Manifest

**Bab IV, Section 4.3 — Hasil Pengembangan Sistem**

Deterministic Playwright screenshot capture for thesis documentation.
Separate from the regression test suite (309 scenarios, 308 passed, 1 skipped, 0 failed).

---

## Quick Start

```bash
# 1. Reset database with thesis fixtures
cd prisma-server
bash scripts/thesis-screenshot-reset.sh

# 2. Build and start production servers (in separate terminals)
cd prisma && npm run build && npm run start
cd prisma-server && APP_ENV=testing php artisan serve --port=8000

# 3. Run screenshot suite
cd prisma
npx playwright test --config=playwright.thesis.config.ts

# 4. Screenshots saved to thesis-screenshots/
```

## Commands

| Action | Command |
|--------|---------|
| Reset database | `cd prisma-server && bash scripts/thesis-screenshot-reset.sh` |
| Run all screenshots | `cd prisma && npx playwright test --config=playwright.thesis.config.ts` |
| Run one group | `cd prisma && npx playwright test --config=playwright.thesis.config.ts --grep "Group 1"` |
| Run one screenshot | `cd prisma && npx playwright test --config=playwright.thesis.config.ts -g "01-login-prisma"` |
| Regenerate all | Reset DB + re-run all |

---

## Screenshot Inventory

### Group 1: Authentication & Dashboards

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 01 | `01-login-prisma.png` | — | `/login` | Captured |
| 02 | `02-dashboard-staff-lppm.png` | Staff LPPM | `staffmonitoringprogress` | Captured |
| 03 | `03-dashboard-dosen.png` | Dosen | `dosenmonitoringprogress` | Captured |
| 04 | `04-dashboard-ketua.png` | Ketua LPPM | `staffmonitoringprogress` | Captured |
| 05 | `05-dashboard-reviewer.png` | Reviewer | `reviewproposal` | Captured |
| 06 | `06-dashboard-superadmin.png` | Superadmin | `users` | Captured |

### Group 2: Proposal Submission

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 07 | `07-daftar-proposal-dosen.png` | Dosen | `dosenmonitoringprogress` > Proposal | Captured |
| 08 | `08-form-upload-proposal.png` | Dosen | Upload proposal modal | **Skipped** — No proposal with "Menunggu proposal untuk diupload" status |

### Group 3: Proposal Selection & Reviewer Assignment

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 09 | `09-seleksi-proposal-ketua.png` | Ketua LPPM | `staffmonitoringprogress` > Seleksi | Captured |
| 10 | `10-form-penugasan-reviewer.png` | Staff LPPM | Penugasan Reviewer modal | Captured |

### Group 4: Reviewer Assessment

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 11 | `11-reviewer-assessment-form.png` | Reviewer | Review Proposal modal | **Skipped** — No proposal with "Belum direview" status |
| 12 | `12-reviewer-progress.png` | Reviewer | `reviewproposal` | Captured |

### Group 5: Final Proposal Approval

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 13 | `13-tiga-review-selesai.png` | Staff LPPM | `staffmonitoringprogress` > Seleksi | Captured |
| 14 | `14-persetujuan-akhir-ketua.png` | Ketua LPPM | Hasil Review modal | **Skipped** — No proposal with "Menunggu persetujuan Ketua LPPM" status |

### Group 6: Accepted Proposal & Laporan

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 15 | `15-proposal-diterima.png` | Dosen | `dosenmonitoringprogress` > Pengumuman | Captured |
| 16 | `16-daftar-laporan-dosen.png` | Dosen | `dosenmonitoringprogress` > Laporan | Captured |
| 17 | `17-logbook-dosen.png` | Dosen | Logbook Progress modal | **Skipped** — Logbook modal not available |

### Group 7: Publikasi & Diseminasi

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 18 | `18-publikasi.png` | Dosen | `dosenmonitoringprogress` > Laporan > Publikasi | Captured |
| 19 | `19-diseminasi.png` | Dosen | `dosenmonitoringprogress` > Laporan > Diseminasi | Captured |

### Group 8: Claim Dana & Pengembalian Dana

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 20 | `20-claim-dana-staff.png` | Staff LPPM | `staffmonitoringprogress` > Laporan > Claim Dana | Captured |
| 21 | `21-claim-dana-dosen.png` | Dosen | `dosenmonitoringprogress` > Laporan > Claim Dana | Captured |
| 22 | `22-pengembalian-dana-dosen.png` | Dosen | Pengembalian Dana upload modal | **Skipped** — No PkM proposal in pengembalian stage |
| 23 | `23-pengembalian-dana-staff.png` | Staff LPPM | `staffmonitoringprogress` > Laporan > Pengembalian Dana | **Skipped** — Pengembalian Dana tab not available |
| 24 | `24-pengembalian-skip.png` | Staff LPPM | Pengembalian skip interface | **Skipped** — No-funds-left UI not implemented |
| 25 | `25-monitoring-bukti-dana-ketua.png` | Ketua LPPM | Monitoring bukti dana | **Skipped** — Claim Dana tab not available for Ketua |

### Group 9: Authorization & Notifications

| # | Filename | Role | Route | Status |
|---|----------|------|-------|--------|
| 26 | `26-authorization-request-ketua.png` | Ketua LPPM | `staffmonitoringprogress` > Permintaan Otorisasi | Captured |
| 27 | `27-permintaan-revisi-staff.png` | Staff LPPM | `staffmonitoringprogress` > Laporan | Captured |
| 28 | `28-notifikasi-dosen.png` | Dosen | `notifications` | Captured |
| 29 | `29-master-data-superadmin.png` | Superadmin | `users` | Captured |

---

## Summary

| Status | Count |
|--------|-------|
| Captured | 21 |
| Skipped | 8 |
| **Total planned** | **29** |

### Skipped Screenshots

| # | Reason |
|---|--------|
| 08 | No proposal with "Menunggu proposal untuk diupload" status in current seeder data |
| 11 | No proposal with "Belum direview" status assigned to reviewer |
| 14 | No proposal with "Menunggu persetujuan Ketua LPPM" status (3/3 reviews complete) |
| 17 | Logbook modal not accessible — no "Proses Penelitian" stage laporan |
| 22 | No PkM proposal in "Pengembalian Dana" stage with "Menunggu Pengembalian Dana" status |
| 23 | "Pengembalian Dana" tab not visible for staff in current laporan data |
| 24 | No-funds-left/skip reason UI not implemented in frontend |
| 25 | "Claim Dana" tab not visible for Ketua role in current laporan data |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Staff LPPM | staff.lppm1@itbss.ac.id | password |
| Dosen | dosen.e2e@itbss.ac.id | password |
| Ketua LPPM | ketua.lppm@itbss.ac.id | password |
| Reviewer | reviewer.e2e@itbss.ac.id | password |
| Superadmin | superadmin.e2e@itbss.ac.id | password |

---

## Files

| File | Purpose |
|------|---------|
| `prisma-server/database/seeders/ThesisScreenshotSeeder.php` | Deterministic seeder |
| `prisma/playwright.thesis.config.ts` | Separate Playwright config |
| `prisma/tests/thesis-screenshots/thesis-screenshots.spec.ts` | Screenshot test spec |
| `prisma/tests/thesis-screenshots/auth-*.setup.ts` | Auth setup files |
| `prisma-server/scripts/thesis-screenshot-reset.sh` | Database reset script |
| `thesis-screenshots/README.md` | This file |

## Regression Test Baseline — UNCHANGED

- 309 scenarios, 308 passed, 1 skipped, 0 failed
- No existing test files modified
- Screenshot suite is completely separate
