# Full-Suite Evidence Run — Spec

**Goal:** one full regression run that produces (a) per-test evidence artefacts and
(b) the report needed for Lampiran B and Lampiran C.

**Do not change any test logic or assertion.** This run must reproduce the same
result as the current suite: 358 tests, 356 passed, 1 skipped, 1 failed.

---

## 1. Config changes only

In `playwright.config.ts`:

```ts
use: {
  screenshot: 'on',            // capture for pass AND fail, not just failure
  video: 'off',                // videos are large and unused for the appendix
  trace: 'retain-on-failure',
},
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],
],
```

The JSON reporter matters — it gives per-test status, duration, and project name
in machine-readable form, which is what the thesis tables are built from.

## 2. Name evidence by test ID

Playwright's default artefact names are mangled (`reviewer-dashboard-Reviewe-fa40d-...`).
Add a global `afterEach` so files are named by the test ID that appears in the thesis.

Create `tests/e2e/helpers/evidence.ts`:

```ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const DIR = 'evidence';

test.afterEach(async ({ page }, testInfo) => {
  // test titles start with the ID, e.g. "ST-DANA-MUT-001: Staff uploads..."
  const id = (testInfo.title.match(/^([A-Z]{2,}-[A-Z0-9-]+)/) || [])[1]
             || testInfo.title.slice(0, 40).replace(/\W+/g, '-');
  fs.mkdirSync(DIR, { recursive: true });
  const file = path.join(DIR, `${id}__${testInfo.status}.png`);
  try {
    await page.screenshot({ path: file, fullPage: true });
  } catch { /* API-only tests have no page — skip */ }
});
```

Import it once in each spec file, or register it globally if your setup allows.

## 3. API-only tests need a different artefact

These assert an HTTP status, not a rendered page. A screenshot proves nothing:

`ST-REV-API-VAL-001`, `SA-USER-VAL-002`, `SA-USER-VAL-003`, `SA-USER-VAL-004`,
`SA-USER-ID-001..005`, `SA-KOLAB-PERM-002/003/004`, `SA-PERM-API-001`,
`SA-NOTIF-001/002`, `KT-PERM-DANA-001` (API half), `ST-PERM-001` (API half),
`DS-ISO-001` (API half).

For each, write the exchange to `evidence/<ID>.txt`:

```
POST /api/users
payload: {"nama":"","email":"","password":"","role":"dosen"}
status : 422
body   : {"message":"...","errors":{"nama":["..."],"email":["..."]}}
```

Plain text, no styling — it prints in greyscale.

## 4. Run

```bash
E2E_FRONTEND_URL=http://localhost:3000 \
E2E_BACKEND_URL=http://localhost:8000 \
npx playwright test 2>&1 | tee test-results/run.log
```

Run the **whole suite in one command** — not per project. The thesis reports one
regression run, so per-project runs stitched together would not be that.

## 5. Send back

1. `test-results/run.log` — the final summary line especially.
2. `test-results/results.json`.
3. The `evidence/` folder (PNG + TXT), named by test ID.
4. `playwright-report/` — or a PDF print of its summary page for Lampiran C.
5. Per-project durations, so the Durasi column can be restored in Tabel 4.5.

---

## Which evidence goes in the thesis

| Appendix | Content | Count |
|---|---|---|
| Lampiran B | One artefact per RBB group from Tabel 4.8 | 64 |
| Lampiran C | Playwright HTML report summary + per-project totals | 2–4 pages |

Do **not** paste all 331 screenshots. 64 covers every planned test group, which is
exactly what Tabel 4.8 claims, and keeps the document printable.

If one RBB group maps to several test IDs, pick the one that best demonstrates the
outcome — usually the Mutation or Validation test rather than a Visibility one.

## Note on the failing test

`RV-DASH-002` will produce a screenshot showing the Reviewer dashboard without its
summary cards. **Keep it.** The thesis now reports this as a defect, and the
screenshot is the evidence for that claim.

---

## 6. RBB group → test ID mapping (Tabel 4.8 in the thesis)

The thesis lists 64 planned test groups. Lampiran B needs **one artefact per group**.
Capture the artefact for the test ID in the third column.

`Jenis` = UI means a full-page screenshot. `Jenis` = API means a `.txt` capture of
the request/response as described in section 3 — a page screenshot proves nothing there.

| Kode Uji | Peran | Test ID to capture | Jenis | Skenario |
|---|---|---|---|---|
| RBB-UM-01 | Semua peran | `DS-AUTH-001` | UI | Login dengan surel dan kata sandi yang sah |
| RBB-UM-02 | Semua peran | `AUTH-LOGIN-VAL-001` | UI | Login dengan isian surel kosong |
| RBB-UM-03 | Semua peran | `AUTH-LOGIN-VAL-002` | UI | Login dengan isian kata sandi kosong |
| RBB-UM-04 | Semua peran | `AUTH-LOGIN-VAL-003` | UI | Login dengan kedua isian kosong |
| RBB-UM-05 | Semua peran | `AUTH-LOGIN-VAL-004` | UI | Login dengan format surel tidak valid |
| RBB-UM-06 | Semua peran | `DS-AUTH-003` | UI | Login dengan kredensial salah |
| RBB-UM-07 | Semua peran | `ST-AUTH-002` | UI | Membuka halaman terlindungi tanpa sesi |
| RBB-UM-08 | Semua peran | `AUTH-LOGOUT-001` | UI | Keluar dari sesi lalu kembali ke halaman sebelumnya |
| RBB-UM-09 | Semua peran | `DS-NOTIF-MUT-002` | UI | Membuka notifikasi dan menandai terbaca |
| RBB-SA-01 | Superadmin | `SA-USER-MUT-001` | API | Menambah pengguna dengan data dan peran valid |
| RBB-SA-02 | Superadmin | `SA-USER-VAL-004` | API | Menambah pengguna dengan isian wajib kosong |
| RBB-SA-03 | Superadmin | `SA-USER-VAL-002` | API | Menambah pengguna dengan nilai peran tidak valid |
| RBB-SA-04 | Superadmin | `SA-USER-VAL-001` | UI | Menambah pengguna dengan surel sudah terdaftar |
| RBB-SA-05 | Superadmin | `SA-USER-MUT-002` | UI | Mengubah dan menghapus data pengguna |
| RBB-SA-06 | Superadmin | `SA-PRODI-MUT-001` | UI | Mengelola data master (prodi, mahasiswa) |
| RBB-SA-07 | Superadmin | `SA-USER-SEARCH-001` | UI | Mencari dan menyaring data pada tabel |
| RBB-SA-08 | Superadmin | `SA-PERM-001` | UI | Mengakses modul operasional Staff LPPM |
| RBB-SA-09 | Superadmin | `SA-PERSIST-001` | UI | Persistensi setelah muat ulang |
| RBB-ST-01 | Staff LPPM | `ST-PROP-SEL-001` | UI | Membuka monitoring progres Proposal dan Laporan |
| RBB-ST-02 | Staff LPPM | `ST-PROP-SEL-MUT-001` | UI | Verifikasi Proposal pada checkpoint Staff |
| RBB-ST-03 | Staff LPPM | `ST-PROP-REV-MUT-001` | UI | Menugaskan tepat tiga Reviewer unik |
| RBB-ST-04 | Staff LPPM | `ST-REV-API-VAL-001` | API | Menugaskan Reviewer kurang dari tiga |
| RBB-ST-05 | Staff LPPM | `ST-PROP-REV-006` | UI | Menugaskan Reviewer lebih dari tiga |
| RBB-ST-06 | Staff LPPM | `ST-REV-API-VAL-001` | API | Menugaskan Reviewer duplikat |
| RBB-ST-07 | Staff LPPM | `ST-RETURN-EXEC-001` | UI | Mengajukan tindakan pengembalian/destruktif |
| RBB-ST-08 | Staff LPPM | `ST-DANA-MUT-001` | UI | Mengunggah bukti pengiriman dana |
| RBB-ST-09 | Staff LPPM | `ST-UPLOAD-VAL-001` | UI | Mengunggah berkas format/ukuran tidak sesuai |
| RBB-ST-10 | Staff LPPM | `ST-LAP-RETURN-MUT-001` | UI | Memantau Logbook dan mengembalikan Laporan |
| RBB-ST-11 | Staff LPPM | `ST-PERM-001` | API | Menjalankan keputusan akhir kewenangan Ketua |
| RBB-ST-12 | Staff LPPM | `ST-PERSIST-001` | UI | Persistensi setelah muat ulang |
| RBB-KT-01 | Ketua LPPM | `KT-PROP-APPROVE-001` | UI | Menyetujui Proposal pada checkpoint seleksi |
| RBB-KT-02 | Ketua LPPM | `KT-PROP-REJECT-MUT-001` | UI | Menolak Proposal pada checkpoint seleksi |
| RBB-KT-03 | Ketua LPPM | `KT-PROP-REV-003` | UI | Meninjau Proposal 1 dari 3 penilaian |
| RBB-KT-04 | Ketua LPPM | `KT-REV-001` | UI | Meninjau Proposal 2 dari 3 penilaian |
| RBB-KT-05 | Ketua LPPM | `KT-REV-002` | UI | Meninjau Proposal 3 dari 3 penilaian |
| RBB-KT-06 | Ketua LPPM | `KT-AUTHZ-APPROVE-001` | UI | Menyetujui permintaan otorisasi |
| RBB-KT-07 | Ketua LPPM | `KT-AUTHZ-DENY-001` | UI | Menolak permintaan otorisasi |
| RBB-KT-08 | Ketua LPPM | `KT-DIS-APPROVE-MUT-001` | UI | Memutuskan Diseminasi |
| RBB-KT-09 | Ketua LPPM | `KT-PERM-DANA-001` | API | Mengunggah bukti dana (harus ditolak) |
| RBB-KT-10 | Ketua LPPM | `KT-PERSIST-001` | UI | Persistensi setelah muat ulang |
| RBB-DS-01 | Dosen | `DS-PEN-PROP-MUT-001` | UI | Membuat draft Proposal dengan data lengkap |
| RBB-DS-02 | Dosen | `DS-PROP-VAL-001` | UI | Membuat Proposal dengan isian wajib kosong |
| RBB-DS-03 | Dosen | `DS-PEN-PROP-MUT-003` | UI | Mengunggah dokumen Proposal sesuai ketentuan |
| RBB-DS-04 | Dosen | `DS-UPLOAD-VAL-001` | UI | Mengunggah dokumen format/ukuran tidak sesuai |
| RBB-DS-05 | Dosen | `DS-PEN-PROP-MUT-002` | UI | Mengirim Proposal setelah prasyarat terpenuhi |
| RBB-DS-06 | Dosen | `DS-PROP-VAL-002` | UI | Mengirim Proposal sebelum dokumen diunggah |
| RBB-DS-07 | Dosen | `DS-REV-MUT-002` | UI | Merevisi Proposal yang dikembalikan |
| RBB-DS-08 | Dosen | `DS-PEN-LAP-SEM-001` | UI | Mengelola Laporan Ganjil dan Genap |
| RBB-DS-09 | Dosen | `DS-LOG-MUT-001` | UI | Menambahkan catatan Logbook |
| RBB-DS-10 | Dosen | `DS-LOG-VAL-001` | UI | Logbook dengan isian kosong / tanggal tidak valid |
| RBB-DS-11 | Dosen | `DS-PEN-PUB-MUT-001` | UI | Mengelola Publikasi dan Diseminasi |
| RBB-DS-12 | Dosen | `DS-PEN-DANA-MUT-001` | UI | Mengunggah bukti penerimaan dana |
| RBB-DS-13 | Dosen | `DS-ISO-001` | API | Membuka Proposal/Laporan milik Dosen lain |
| RBB-DS-14 | Dosen | `DS-NAV-005` | UI | Mengakses modul Staff LPPM / Superadmin |
| RBB-DS-15 | Dosen | `DS-PERSIST-001` | UI | Persistensi setelah muat ulang |
| RBB-RV-01 | Reviewer | `RV-PROP-003` | UI | Membuka daftar objek yang ditugaskan |
| RBB-RV-02 | Reviewer | `RV-PROP-MUT-002` | UI | Mengisi dan mengirim penilaian Proposal |
| RBB-RV-03 | Reviewer | `RV-VAL-001-RW` | UI | Mengirim penilaian dengan isian wajib kosong |
| RBB-RV-04 | Reviewer | `RV-VAL-002` | UI | Nilai di luar rentang yang diizinkan |
| RBB-RV-05 | Reviewer | `RV-3REV-001` | UI | Menyelesaikan penilaian pertama dari tiga |
| RBB-RV-06 | Reviewer | `RV-SCORE-001` | UI | Menyelesaikan penilaian ketiga dari tiga |
| RBB-RV-07 | Reviewer | `RV-ISO-MUT-001` | UI | Membuka objek yang tidak ditugaskan |
| RBB-RV-08 | Reviewer | `RV-AUTH-003` | UI | Mengakses fungsi operasional Staff LPPM |
| RBB-RV-09 | Reviewer | `RV-PERSIST-001` | UI | Persistensi setelah muat ulang |

### Notes

- `ST-REV-API-VAL-001` covers both RBB-ST-04 and RBB-ST-06 (fewer than three, and
  duplicate reviewer). Capture it once and reference it twice.
- `RV-SCORE-001` appears in the suite as the combined test
  `RV-SCORE-001 + RV-3REV-003`. Capture that one for RBB-RV-06.
- Tests marked API in the Jenis column still run in a browser context for the UI half
  where applicable (`ST-PERM-001`, `KT-PERM-DANA-001`, `DS-ISO-001`). Capture **both**
  the screenshot and the txt for those three.
- File naming: `<RBB-CODE>__<TEST-ID>.png` or `.txt`, e.g.
  `RBB-ST-09__ST-UPLOAD-VAL-001.png`. This lets the appendix be assembled in order
  without cross-referencing.
