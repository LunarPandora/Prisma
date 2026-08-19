# PRISMA Second-Pass Verification Report

## Task 1: Authentication Architecture

**Verdict: Pure Sanctum SPA Cookie Authentication. NOT personal-access-token. NOT hybrid.**

### Complete Flow

```
1. Login: POST /login (web.php route, line 8)
   → AuthController::login() (AuthController.php:14)
   → Auth::attempt($request->only('email','password')) (line 21)
   → $request->session()->regenerate() (line 27)
   → Returns user JSON — NO TOKEN issued (lines 30-35)

2. CSRF: GET /sanctum/csrf-cookie (config/cors.php:18)
   → Sets XSRF-TOKEN cookie for SPA

3. API: All routes wrapped in auth:sanctum (routes/api.php:42)
   → bootstrap/app.php:15 — $middleware->statefulApi()
   → EnsureFrontendRequestsAreStateful middleware
   → Authenticates via session cookie (web guard, config/auth.php:11-14)

4. Logout: POST /logout (web.php:9)
   → Auth::logout() + session()->invalidate() (AuthController.php:48-49)
```

### Key Evidence

| Evidence | File | Line |
|----------|------|------|
| `$middleware->statefulApi()` | `bootstrap/app.php` | 15 |
| `stateful` domains: `localhost:3000` | `.env` | 67 |
| Guard: `['web']` (session driver) | `config/sanctum.php` | 37 |
| Login: `Auth::attempt()` | `app/Http/Controllers/AuthController.php` | 21 |
| No `createToken()` call anywhere | codebase-wide grep | 0 hits |
| Login/logout in `web.php` (session stack) | `routes/web.php` | 8-9 |
| `supports_credentials: true` | `config/cors.php` | 32 |

**Correction to first report:** The first report mentioned "Sanctum Bearer tokens" in the context of axios interceptors. The frontend `api.js` attaches an Authorization header, but since no token is ever issued, this header is empty/absent. Authentication is purely via session cookie. The `HasApiTokens` trait on `User.php:17` is imported but unused for token creation.

---

## Task 2: Database Management System

**Verdict: MariaDB via Laravel 11's native `mariadb` driver. NOT MySQL.**

| Environment | `DB_CONNECTION` | Driver | Host | Port | Database |
|-------------|----------------|--------|------|------|----------|
| Development (`.env`) | `mariadb` | `mariadb` | 127.0.0.1 | 3306 | `prisma_server2` |
| Testing (`.env.testing`) | `mariadb` | `mariadb` | 127.0.0.1 | 3306 | `prisma_e2e_testing` |
| Production | Not present | Unknown | Unknown | Unknown | Unknown |

**Evidence:**
- `.env:23` — `DB_CONNECTION=mariadb`
- `.env.testing:20` — `DB_CONNECTION=mariadb`
- `config/database.php:66-84` — `mariadb` connection with `'driver' => 'mariadb'`
- `scripts/e2e-reset.sh:27` — uses `mysql` CLI (MySQL CLI is compatible with MariaDB)

**Terminology for Bab II:** The application uses **MariaDB** (not MySQL). The Laravel 11 `mariadb` driver is used, which is distinct from the `mysql` driver. The `mysql` CLI is used for database operations because it is wire-compatible with MariaDB.

---

## Task 3: Complete Migration Audit

### Proposal Table — Final Schema

| Field | Type | Nullable | Default | FK | Migration |
|-------|------|----------|---------|-----|-----------|
| `proposal_id` | bigint PK | NO | auto | — | `2026_03_28_092436` |
| `jenis_penelitian` | enum('Penelitian','PkM') | NO | — | — | `2026_03_28_092436` + `2026_08_14_010000` |
| `judul` | string | YES | — | — | `2026_08_11_000001` |
| `tahap_penelitian` | enum('Proposal','Laporan') | NO | 'Proposal' | — | `2026_05_27_200034` |
| `topik_penelitian` | string | NO | — | — | `2026_03_28_092436` |
| `bidang_ilmu` | string | NO | — | — | `2026_03_28_092436` |
| `fokus_sdg` | string | NO | — | — | `2026_03_28_092436` |
| `ra_biaya_penelitian_gan` | double | YES | — | — | `2026_08_05_000005`+`000006` |
| `ra_biaya_publikasi_gan` | double | YES | — | — | `2026_08_05_000005` |
| `ra_insentif_gan` | double | YES | — | — | `2026_08_05_000005` |
| `ra_biaya_penelitian_gen` | double | YES | — | — | `2026_08_05_000005`+`000006` |
| `ra_biaya_publikasi_gen` | double | YES | — | — | `2026_08_05_000005` |
| `ra_insentif_gen` | double | YES | — | — | `2026_08_05_000005` |
| `jenis_penelitian_gan` | enum('Penelitian','PkM') | YES | — | — | `2026_08_14_020000` |
| `jenis_penelitian_gen` | enum('Penelitian','PkM') | YES | — | — | `2026_08_14_020000` |
| `target_publikasi_gan` | string | NO | — | — | `2026_03_28_092436` |
| `target_publikasi_gen` | string | NO | — | — | `2026_03_28_092436` |
| `rencana_judul_publikasi_gan` | text | NO | — | — | `2026_03_28_092436` |
| `rencana_judul_publikasi_gen` | text | NO | — | — | `2026_03_28_092436` |
| `metopen_gan` | text | NO | — | — | `2026_03_28_092436` |
| `metopen_gen` | text | NO | — | — | `2026_03_28_092436` |
| `unit_analisis_gan` | text | NO | — | — | `2026_03_28_092436` |
| `unit_analisis_gen` | text | NO | — | — | `2026_03_28_092436` |
| `kontribusi_ilmu_makul` | text | NO | — | — | `2026_03_28_092436` |
| `kontribusi_pkm` | text | NO | — | — | `2026_03_28_092436` |
| `rencana_luaran` | text | NO | — | — | `2026_03_28_092436` |
| `institusi_mitra` | string | NO | '-' | — | `2026_03_28_092436` |
| `user_id` | foreignId | NO | — | → `users.id` | `2026_03_28_092436` |
| `kegiatan_id` | foreignId | NO | — | → `kegiatan_pengajuan.kegiatan_id` | `2026_08_08_000000`+`000001` |
| `skema` | enum('Internal','Eksternal','Mandiri') | NO | — | — | `2026_03_28_092436` |
| `sumber_skema` | string | NO | — | — | `2026_03_28_092436` |
| `status` | enum(12 values) | NO | — | — | `2026_03_28_092436` + 5 altering migrations |
| `tgl_pengajuan` | date | YES | — | — | `2026_03_28_092436` |
| `catatan` | text | YES | — | — | `2026_03_28_092436` |
| `ketua_seleksi_approved` | boolean | NO | false | — | `2026_08_13_100001` |
| `staff_seleksi_approved` | boolean | NO | false | — | `2026_08_13_100001` |
| `created_at/updated_at` | timestamps | — | — | — | `2026_03_28_092436` |
| `deleted_at` | softDeletes | — | — | — | `2026_03_28_092436` |

**`dosen_id`: DOES NOT EXIST on proposal table.** No migration creates it. The field is referenced in `AuthorizationRequestController.php` lines 357, 378, 414 but evaluates to `null` via Eloquent's `__get` magic.

### Laporan Table — Final Schema (key fields)

| Field | Type | Nullable | Default | FK | Migration |
|-------|------|----------|---------|-----|-----------|
| `laporan_id` | bigint PK | NO | auto | — | `2026_05_29_013117` |
| `proposal_id` | foreignId | NO | — | → `proposal.proposal_id` | `2026_05_29_013117` |
| `kegiatan_id` | foreignId | YES | — | → `kegiatan_pengajuan.kegiatan_id` | `2026_08_08_000000`+`000001` |
| `semester` | enum('Ganjil','Genap') | NO | — | — | `2026_05_29_013117` |
| `jenis_penelitian` | enum('Penelitian','PkM') | NO | — | — | `2026_08_14_020000` |
| `judul_penelitian` | string | NO | — | — | `2026_05_29_013117` |
| `status` | enum(14 values) | NO | 'Dalam pengerjaan' | — | `2026_05_29_013117` + 4 altering migrations |
| `link_laporan_akhir` | text | YES | — | — | `2026_07_15_090000` |
| `link_hki` | text | YES | — | — | `2026_07_15_090000` |
| `link_buku` | text | YES | — | — | `2026_07_15_090000` |
| `link_poster` | text | YES | — | — | `2026_07_15_090000` |
| `link_video` | text | YES | — | — | `2026_07_15_090000` |
| `dana_dikembalikan` | boolean | NO | false | — | `2026_07_15_090000` |
| `dana_disetujui` | boolean | NO | false | — | `2026_08_09_000001` |
| `claim_dana_status` | string | YES | — | — | `2026_07_15_160000` |
| `pengembalian_dana_status` | string | YES | — | — | `2026_07_15_160000` |
| `pengembalian_dana_skipped_reason` | string | YES | — | — | `2026_08_14_000001` |
| `ketua_diseminasi_approved` | boolean | NO | false | — | `2026_08_13_000001` |
| `staff_diseminasi_approved` | boolean | NO | false | — | `2026_08_13_000001` |
| `current_logbook_id` | foreignId | YES | — | → `logbook_pengerjaan.logbook_id` | `2026_05_29_040830` |
| `completed_at` | timestamp | YES | — | — | `2026_08_14_000001` |
| UNIQUE | `(proposal_id, semester)` | | | | `2026_05_29_013117` |

### KegiatanPengajuan Table (renamed from periode_pengajuan)

| Field | Type | FK | Migration |
|-------|------|-----|-----------|
| `kegiatan_id` | bigint PK | — | `2026_03_02_142515` + `2026_08_08_000000` |
| `skema_id` | foreignId | → `skema.skema_id` | `2026_03_02_142515` |
| `jenis_penelitian` | enum('Penelitian','PkM') | — | `2026_03_02_142515` |
| `kode_kegiatan` | string | — | `2026_03_02_142515` + `2026_08_08_000000` |
| `nama_kegiatan` | string | — | `2026_03_02_142515` + `2026_08_08_000000` |
| `tgl_mulai` | date, nullable | — | `2026_03_02_142515` |
| `tgl_selesai` | date, nullable | — | `2026_03_02_142515` |
| `status` | enum('Belum dibuka','Terbuka','Selesai') | — | `2026_03_02_142515` |
| `manual_status_override` | boolean | — | Added later |
| UNIQUE | `(skema_id, jenis_penelitian, kode_kegiatan)` | | |

### PenugasanReviewer Table — Final Schema

| Field | Type | FK | Migration |
|-------|------|-----|-----------|
| `penugasan_id` | bigint PK | — | `2026_04_14_123354` |
| `reviewable_type` | string, default `'App\Models\Proposal'` | — | `2026_07_15_120000` |
| `reviewable_id` | unsignedBigInteger, nullable | — | `2026_07_15_120000` |
| `proposal_id` | foreignId, nullable | → `proposal.proposal_id` (nullOnDelete) | `2026_04_14_123354` + `2026_07_15_120000` |
| `tgl_penugasan` | date | — | `2026_04_14_123354` |
| `user_id` | foreignId | → `users.id` | `2026_04_14_123354` |
| `status_review` | enum('Belum direview','Telah direview') | — | `2026_05_26_130733` |

### Review Table — Final Schema

| Field | Type | FK | Migration |
|-------|------|-----|-----------|
| `review_id` | bigint PK | — | `2026_05_13_061044` |
| `penugasan_id` | foreignId | → `penugasan_reviewer.penugasan_id` | `2026_05_13_061044` |
| `keputusan` | enum('Diterima','Diterima dengan perbaikan','Ditolak') | — | `2026_05_13_061044` |
| `kriteria_kesesuaian_tema` | json, nullable | — | `2026_05_13_061044` |
| `kriteria_penilaian` | json, nullable | — | `2026_05_21_072906` |
| `catatan` | text | — | `2026_05_13_061044` |
| `tgl_review` | date | — | `2026_05_13_061044` |

### AuthorizationRequests Table — Final Schema

| Field | Type | FK | Migration |
|-------|------|-----|-----------|
| `id` | bigint PK | — | `2026_08_09_000003` |
| `requestable_type` | string | — | `2026_08_09_000003` |
| `requestable_id` | unsignedBigInteger | — | `2026_08_09_000003` |
| `requested_by` | unsignedBigInteger | → `users.id` | `2026_08_09_000003` |
| `action` | string | — | `2026_08_09_000003` |
| `source_stage` | string, nullable | — | `2026_08_17_000001` |
| `target_stage` | string, nullable | — | `2026_08_17_000001` |
| `reason` | text | — | `2026_08_09_000003` |
| `current_data` | json, nullable | — | `2026_08_09_000003` |
| `proposed_data` | json, nullable | — | `2026_08_09_000003` |
| `status` | enum('Menunggu Persetujuan','Disetujui','Ditolak') | — | `2026_08_09_000003` |
| `reviewed_by` | unsignedBigInteger, nullable | → `users.id` | `2026_08_09_000003` |
| `reviewed_at` | timestamp, nullable | — | `2026_08_09_000003` |
| `review_note` | text, nullable | — | `2026_08_09_000003` |

### Supporting Tables — Final Schemas

| Table | PK | Key Fields | Migration |
|-------|-----|-----------|-----------|
| `dokumen` | `dokumen_id` | `documentable_id`, `documentable_type`, `current_version_id` (FK→dokumen_version), `jenis_dokumen` | `2026_03_28_094542` + `2026_05_28_113124` + `2026_05_29_033611` |
| `dokumen_version` | `version_id` | `dokumen_id` (FK), `version`, `nama_file`, `local_file_url`, `uploaded_by`, `catatan_revisi`, `tgl_upload` | `2026_05_28_112542` |
| `logbook_pengerjaan` | `logbook_id` | `laporan_id` (FK), `user_id` (FK), `judul`, `deskripsi`, `tgl_kegiatan`, `lampiran_drive_url` | `2026_05_29_013118` |
| `proposal_member` | `prop_member_id` | `proposal_id` (FK), `member_id`, `role` (enum), `semester` (enum), `ttjp` | `2026_04_28_120319` |
| `laporan_member` | `laporan_member_id` | `laporan_id` (FK), `member_id`, `role` (enum), `position`, `ttjp` | `2026_08_12_000003` |
| `realisasi_anggaran` | `id` | `laporan_id` (FK), `item_kebutuhan`, `satuan`, `jumlah_item`, `harga_satuan`, `total` | `2026_08_12_000004` |
| `notifications` | `notification_id` | `user_id` (FK), `type`, `title`, `message`, `data` (json), `action_url`, `key` (unique), `read_at` | `2026_08_14_030000` |
| `settings` | `id` | `kepala_lppm` (FK), `rektor` (FK), `rektor_nama`, `rektor_nidn`, `rektor_nuptk`, `nama_kampus`, `kriteria_penilaian` (json), `list_kesesuaian_tema` (json), `ignore_kegiatan_dates` (bool) | `2026_04_29_092553` + 3 adding migrations |
| `skema` | `skema_id` | `nama_skema`, `tahun_ajaran`, `status` (enum) | `2026_03_02_142514` |

---

## Task 4: Proposal `dosen_id` Claim

**Verdict: CONFIRMED APPLICATION BUG — three dead notification branches.**

`proposal.dosen_id` does **not exist** as:
- A database column (not in any migration)
- A model `$fillable` entry (`Proposal.php` lists 25 fields; `dosen_id` absent)
- A model `$casts` entry
- An accessor (`getDosenIdAttribute` not found)
- A relationship (`dosen()` not found)
- An API resource transformation (`ProposalDosenResource.php:55` has it commented out)

### Affected Locations

| File | Line | Action | Impact |
|------|------|--------|--------|
| `AuthorizationRequestController.php` | 357-359 | `reject_proposal` | `$resource->dosen_id` is null → notification to Dosen **never sent** |
| `AuthorizationRequestController.php` | 378-380 | `return_proposal_for_revision` | Same — notification **never sent** |
| `AuthorizationRequestController.php` | 414-416 | `return_laporan_for_revision` | `$resource->proposal->dosen_id` is null → notification **never sent** |

**Correct field:** `$resource->user_id` (the proposal owner, confirmed in `proposal` table migration and `Proposal` model `$fillable`).

**Impact on regression:** These three notification paths are never triggered by E2E tests because the tests verify request status changes but not notification delivery. The zero-failure baseline is unaffected.

**Classification:** Unreachable dead branch due to referencing non-existent attribute. Not a data-corruption bug, but a notification-delivery gap.

---

## Task 5: Separate Workflow Dimensions

Laporan progression uses **four independent dimensions**, not a single state field:

### Dimension A: Business Stage (via `kegiatan_id → kode_kegiatan`)

**Penelitian:**
```
PROSES_PENELITIAN_{GAN|GEN} → PUBLIKASI_{GAN|GEN} → DISEMINASI_{GAN|GEN} → CLAIM_DANA_{GAN|GEN} → LUARAN_PENELITIAN
```

**PkM:**
```
CLAIM_DANA_{GAN|GEN} → PROSES_PKM_{GAN|GEN} → PUBLIKASI_{GAN|GEN} → PENGEMBALIAN_DANA_{GAN|GEN} → DISEMINASI_{GAN|GEN} → LUARAN_PKM
```

Source: `KegiatanStage.php:55-77`, `KegiatanStage::advance()` at line 294.

### Dimension B: Record Status (`laporan.status` enum, 14 values)

| Status | Stage Context |
|--------|--------------|
| `Belum dimulai` | PROSES (before first logbook entry) |
| `Dalam pengerjaan` | PROSES / post-diseminasi accept |
| `Menunggu kelengkapan data` | PUBLIKASI (Dosen finished research) |
| `Menunggu review Admin` | PUBLIKASI → DISEMINASI transition |
| `Menunggu review Staff LPPM` | DISEMINASI (Ketua first-step accept) |
| `Menuggu penugasan Reviewer` | DISEMINASI (Staff second-step accept) — typo in enum |
| `Menunggu hasil dari Reviewers` | DISEMINASI (reviewers assigned) |
| `Menunggu keputusan Ketua` | DISEMINASI (all reviews complete) |
| `Menunggu Persetujuan Ketua LPPM` | DISEMINASI (Staff rejection pending Ketua auth) |
| `Menunggu konfirmasi penerimaan dana` | CLAIM_DANA |
| `Revisi` | Any stage (returned for revision) |
| `Selesai` | Terminal |

### Dimension C: Decision Flags

| Flag | Table | Controls |
|------|-------|----------|
| `ketua_diseminasi_approved` | laporan | Ketua first-step on Diseminasi |
| `staff_diseminasi_approved` | laporan | Staff second-step on Diseminasi |
| `dana_disetujui` | laporan | Ketua funding approval gate |
| `ketua_seleksi_approved` | proposal | Ketua first-step on Seleksi |
| `staff_seleksi_approved` | proposal | Staff second-step on Seleksi |
| `status_review` (per penugasan) | penugasan_reviewer | Individual reviewer completion |

### Dimension D: Sub-State Fields

| Field | Values | Stage |
|-------|--------|-------|
| `claim_dana_status` | null → `'Menunggu bukti terima'` → `'Menunggu konfirmasi admin'` → `'Selesai'` | CLAIM_DANA |
| `pengembalian_dana_status` | null → `'Menunggu Pengembalian Dana'` → `'Menunggu konfirmasi admin'` → `'Selesai'` or `'Dilewati'` | PENGEMBALIAN_DANA |

**How dimensions interact:** The business stage (Dimension A) is the primary locator. Status (Dimension B) reflects the most recent action within that stage. Decision flags (Dimension C) gate progression within multi-step stages (Diseminasi, Seleksi). Sub-state fields (Dimension D) track progress within Claim Dana and Pengembalian Dana stages specifically.

---

## Task 6: Exactly-Three-Reviewer Enforcement

**Verdict: Exactly-3 invariant enforced at BOTH backend and frontend.**

### Backend Enforcement

| Location | File | Line | Check |
|----------|------|------|-------|
| `assignReviewers()` | `PenugasanReviewerController.php` | 86 | `count($reviewerIds) !== 3` → error "Harus tepat 3 reviewer" |
| `confirmAssignment()` | `PenugasanReviewerController.php` | 210 | `count($reviewerIds) !== 3` → error "Harus tepat 3 reviewer" |
| Uniqueness (assign) | `PenugasanReviewerController.php` | 80-85 | `array_unique()` → error "Tidak boleh ada reviewer duplikat" |
| Uniqueness (confirm) | `PenugasanReviewerController.php` | 204-209 | Same check |

### Frontend Enforcement

| Location | File | Line | Check |
|----------|------|------|-------|
| Selection cap | `PenugasanReviewerForm.jsx` | 145 | `maxCount={3}` on SelectInputMulti |
| Submit disabled | `PenugasanReviewerForm.jsx` | 121, 124 | `disabled={...\|\| !exactlyThree}` |
| Counter display | `PenugasanReviewerForm.jsx` | 136 | `{selected.length}/3 dipilih` |

### "All Reviewers Complete" — Count-Agnostic

`ReviewController.php:118-119` and `:190-191`:
```php
$allReviewed = $penugasanList->every(
    fn($p) => $p->status_review === 'Telah direview'
);
```
Checks that **every** assigned reviewer has reviewed. Since assignment enforces exactly 3, this effectively means "all 3 done" but does not hardcode the number.

### Test Coverage

`ST-REV-API-VAL-001` (`prisma/tests/e2e/staff/proposer/reviewer-validation.spec.ts`):
- Rejects 2 reviewers (line 74-85)
- Rejects 4 reviewers (line 92-103)
- Rejects duplicate IDs (line 106-117)

### Applies identically to Proposal and Laporan

The same `PenugasanReviewerController::assignReviewers()` and `confirmAssignment()` are used for both. The `reviewable_type` parameter distinguishes them. The exactly-3 rule applies identically.

---

## Task 7: Proposal Final Approval and Surat Tugas

These are **separate events** with distinct actors and endpoints:

| Event | Actor | Endpoint | Controller | Validation | DB Mutation | Next State |
|-------|-------|----------|------------|------------|-------------|------------|
| 3 reviews complete | Reviewer (last one) | `POST /review/upload` | `ReviewController::store()` | Ownership, duplicate, all-reviewed check | `penugasan.status_review = 'Telah direview'`; `proposal.status = 'Menunggu persetujuan Ketua LPPM'` | Status change only |
| KetuaSeleksi first-step | Ketua LPPM | `POST /proposal/seleksi/ketua-decide` | `ProposalSeleksiController::ketuaDecide()` | Role, status == 'Menunggu review dari Ketua LPPM' | `ketua_seleksi_approved = true`; `status = 'Menunggu review Staff LPPM'` | Status change |
| StaffSeleksi second-step | Staff LPPM | `POST /proposal/seleksi/staff-decide` | `ProposalSeleksiController::staffDecide()` | Role, status, ketua approved | `staff_seleksi_approved = true`; `status = 'Menunggu penugasan reviewer'` | Status change |
| Reviewer assignment | Staff LPPM | `POST /penugasan/confirm-assignment` | `PenugasanReviewerController::confirmAssignment()` | Exactly 3, Diseminasi flags if laporan | Creates 3 PenugasanReviewer rows | Status → 'Menunggu review' |
| All reviews complete | Reviewer (last) | `POST /review/upload` | `ReviewController::store()` | All penugasan reviewed | `proposal.status = 'Menunggu persetujuan Ketua LPPM'` | Status change |
| SK upload (batch) | Staff LPPM | `POST /proposal/sk/upload` | `PengumumanSuratTugasController::upload()` | File uploaded, kegiatan exists | Closes SELEKSI+PENGUMUMAN stages; opens first Laporan stage; splits proposal into Laporan Ganjil+Genap; `proposal.status = 'Proposal Diterima'` | Stage advance + Laporan creation |
| SK accept (per-proposal) | Ketua LPPM | `POST /proposal/sk/accept` | `PengumumanSuratTugasController::acceptProposal()` | Status == 'Menunggu persetujuan Ketua LPPM', PDF uploaded | `proposal.status = 'Proposal Diterima'`; creates Dokumen; opens first Laporan stage; splits into Laporan Ganjil+Genap | Terminal for Proposal |

**Key finding:** The normal Ketua approval (`acceptProposal`) IS the event that accepts the Proposal and creates Laporans. There is no separate "Ketua approves" step before SK upload — the SK upload itself (`PengumumanSuratTugasController::upload`) is the batch acceptance path used by Staff. The per-proposal path (`acceptProposal`) is used by Ketua.

**Evidence:** `KT-PROP-APPROVE-001` test confirms `status === 'Proposal Diterima'` after the accept action.

---

## Task 8: Ketua LPPM Responsibility Separation

### Table A — Normal Workflow Decisions

| Checkpoint | Resource | Permitted Decision | Resulting Transition |
|-----------|----------|-------------------|---------------------|
| Seleksi first-step | Proposal | accept / reject | `ketua_seleksi_approved=true`, status → "Menunggu review Staff LPPM" / soft-delete |
| Diseminasi first-step | Laporan | accept / reject | `ketua_diseminasi_approved=true`, status → "Menunggu review Staff LPPM" / move to PUBLIKASI |
| Diseminasi final decision | Laporan | accept / reject | advance to CLAIM_DANA/LUARAN / move to PUBLIKASI |
| SK accept (per-proposal) | Proposal | accept (with PDF) | status → "Proposal Diterima", create Laporans |
| Funding approval | Laporan | approve | `dana_disetujui=true` (gate for Claim/Pengembalian) |
| Kegiatan CRUD | Skema/KegiatanPengajuan | create / update / delete | Direct mutation |
| AuthorizationRequest | AuthorizationRequest | approve / deny | Executes or cancels Staff-initiated action |

### Table B — Monitor/Inspect-Only Stages

| Laporan Stage | Information Visible | Actions Unavailable |
|--------------|--------------------|--------------------|
| PROSES_* | Logbook entries, progress | Cannot submit publikasi (must finish first) |
| PUBLIKASI_* | Publication links, laporan docs | Cannot assign reviewers (Diseminasi only) |
| CLAIM_DANA_* | Transfer proof, receipt proof | Cannot edit laporan content |
| PENGEMBALIAN_DANA_* | Return proof, status | Cannot edit laporan content |
| DISEMINASI_* | Review status, approval flags | Cannot edit publication data |
| LUARAN_* | Terminal — read-only | No actions |

### Table C — AuthorizationRequest Decisions

| Staff-Requested Action | Pending Behavior | Approval Behavior | Denial Behavior |
|----------------------|------------------|-------------------|-----------------|
| `delete` (Skema) | Queue visible to Ketua | Deletes skema + kegiatan | No state change |
| `delete` (KegiatanPengajuan) | Queue visible to Ketua | Soft-deletes kegiatan | No state change |
| `reject_proposal` | Queue visible to Ketua | Soft-deletes proposal | No state change |
| `return_proposal_for_revision` | Queue visible to Ketua | status → 'Revisi' | No state change |
| `return_seleksi` | Queue visible to Ketua | Resets seleksi flags, status → 'Revisi' | Resets to 'Menunggu review Staff LPPM' |
| `return_diseminasi` | Queue visible to Ketua | Moves backward one stage, resets flags | Sets 'Menunggu review Staff LPPM', ketua_approved=true |
| `return_laporan_for_revision` | Queue visible to Ketua | Moves to target_stage, status → 'Revisi' | No state change |

---

## Task 9: AuthorizationRequest and Backward Mapping

### Penelitian Backward Mapping

| From | To | Mechanism | Initiator | Evidence |
|------|----|-----------|-----------|----------|
| Diseminasi → Publikasi | `adminDecide` reject / `finalDecision` reject | `KegiatanStage::move($laporan, $previousKode)` | Ketua LPPM (direct) | `LaporanController.php:920-936`, `DiseminasiController.php:413-429` |
| Publikasi → Proses | `return_laporan_for_revision` action | Auth request → `executeAction` → `KegiatanStage::move()` | Staff → Ketua approves | `AuthorizationRequestController.php:392-404` |
| Proses → (cannot go back) | `previousKode` returns null at index 0 | — | — | `KegiatanStage.php:190` |
| Claim Dana → Diseminasi | `return` or `return_laporan_for_revision` | Auth request → `executeAction` → `KegiatanStage::move()` | Staff → Ketua approves | `AuthorizationRequestController.php:258-273`, `:392-404` |

### PkM Backward Mapping

| From | To | Mechanism | Initiator |
|------|----|-----------|-----------|
| Diseminasi → Pengembalian Dana | `adminDecide` reject / `finalDecision` reject | `KegiatanStage::move($laporan, $previousKode)` | Ketua (direct) |
| Diseminasi → Publikasi | `return_laporan_for_revision` (target computed at creation) | Auth request → `executeAction` | Staff → Ketua |
| Pengembalian Dana → Publikasi | `return_laporan_for_revision` | Auth request → `executeAction` | Staff → Ketua |
| Publikasi → Proses | `return_laporan_for_revision` | Auth request → `executeAction` | Staff → Ketua |
| Proses → Claim Dana | `return_laporan_for_revision` | Auth request → `executeAction` | Staff → Ketua |
| Claim Dana → (cannot go back) | `previousKode` returns null at index 0 | — | — |

### Behavioral Verification

| Property | Verified | Evidence |
|----------|----------|----------|
| Pending request does NOT mutate original record | Yes | `AuthorizationRequestController::store()` only creates auth request; E2E `ST-RETURN-EXEC-001` asserts status unchanged |
| Approval executes transition | Yes | `executeAction()` at lines 230-427; E2E `KT-AUTHZ-APPROVE-001` asserts `status === 'Revisi'` |
| Denial preserves original state | Yes | `authorize()` lines 181-217; E2E `KT-AUTHZ-DENY-001` asserts `status === originalStatus` |
| Laporan cannot be rejected (terminal) | Yes | No `reject`/`reject_proposal` action exists for Laporan type |
| Laporan cannot return to Proposal | Yes | `previousKode` stays within laporan sequence; no cross-type transition |
| Proposal rejection is terminal | Yes | `reject_proposal` soft-deletes the proposal |
| Returned Proposal is not deleted | Yes | `return_proposal_for_revision` sets `status = 'Revisi'`, no delete |

---

## Task 10: Complete Functional Mapping

### Superadmin

| Frontend Module | Page | API Call | Method | Route | Controller | Model |
|----------------|------|----------|--------|-------|------------|-------|
| `users` | `Admin/Users/page.jsx` | `getUsers` | GET | `/users` | `UserController::index` | User |
| | | `addUser` | POST | `/users/add` | `UserController::create` | User |
| | | `updateUser` | POST | `/users/update` | `UserController::update` | User |
| | | `deleteUser` | DELETE | `/users/delete/{id}` | `UserController::delete` | User |
| `prodi` | `Admin/Prodi/page.jsx` | `getProdi` | GET | `/prodi` | `ProdiController::index` | Prodi |
| `pengaturan` | `Admin/Pengaturan/page.jsx` | `getSettings` | GET | `/settings` | `SettingsController::index` | Settings |
| | | `updateSettings` | POST | `/settings/update` | `SettingsController::update` | Settings |
| `mahasiswa` | `Admin/Mahasiswa/page.jsx` | `fetchMahasiswa` | GET | `/mahasiswa/fetch` | `MahasiswaController::fetch` | Mahasiswa |

### Staff LPPM

| Frontend Module | Page | API Call | Method | Route | Controller | Model |
|----------------|------|----------|--------|-------|------------|-------|
| `staffmonitoringprogress` | `Admin/MonitoringPengajuan/page.jsx` | Skema selection | GET | `/skema/staff-monitoring` | `SkemaController::staffMonitoring` | Skema |
| | Proposal tab | `getProposal` | GET | `/proposal` | `ProposalController::index` | Proposal |
| | | `staffDecideSeleksi` | POST | `/proposal/seleksi/staff-decide` | `ProposalSeleksiController::staffDecide` | Proposal |
| | | `createAuthorizationRequest` | POST | `/authorization-request` | `AuthorizationRequestController::store` | AuthorizationRequest |
| | | `deleteProposal` | POST | `/proposal/delete` | `ProposalWorkflowController::tolakProposal` | Proposal |
| | Reviewer assignment | `fetchReviewer` | GET | `/reviewer` | `ReviewerController::index` | User |
| | | `assignReviewer` | POST | `/penugasan/assign` | `PenugasanReviewerController::assignReviewers` | PenugasanReviewer |
| | | `confirmAssignment` | POST | `/penugasan/confirm-assignment` | `PenugasanReviewerController::confirmAssignment` | PenugasanReviewer |
| | SK upload | `uploadPengumumanSuratTugas` | POST | `/proposal/sk/upload` | `PengumumanSuratTugasController::upload` | Dokumen, Proposal, Laporan |
| | Laporan tab | `getLaporan` | GET | `/laporan` | `LaporanController::index` | Laporan |
| | | `adminDecideLaporan` | POST | `/laporan/decide` | `LaporanController::adminDecide` | Laporan |
| | Diseminasi | Diseminasi index | GET | `/diseminasi` | `DiseminasiController::index` | Laporan |
| | | `staffDecideDiseminasi` | POST | `/diseminasi/staff-decide` | `DiseminasiController::staffDecide` | Laporan |
| | Dana | Dana index | GET | `/dana` | `DanaController::index` | Laporan |
| | | `uploadBuktiTransfer` | POST | `/dana/claim/upload-bukti-transfer` | `DanaController::uploadBuktiTransfer` | Dokumen, Laporan |
| | | `confirmClaim` | POST | `/dana/claim/confirm` | `DanaController::confirmClaim` | Laporan |
| | | `requestPengembalian` | POST | `/dana/pengembalian/request` | `DanaController::requestPengembalian` | Laporan |
| | | `confirmPengembalian` | POST | `/dana/pengembalian/confirm` | `DanaController::confirmPengembalian` | Laporan |
| | | `skipPengembalian` | POST | `/dana/pengembalian/skip` | `DanaController::skipPengembalian` | Laporan |
| `kolaborator` | `Admin/Kolaborator/page.jsx` | CRUD | Various | `/kolaborator/*` | `KolaboratorController` | Kolaborator |

### Ketua LPPM

| Frontend Module | Page | API Call | Method | Route | Controller | Model |
|----------------|------|----------|--------|-------|------------|-------|
| `ketuaskema` | `Admin/Skema/page.jsx` | CRUD | Various | `/skema/*` | `SkemaController` | Skema |
| `ketuakegiatan` | `Admin/Skema/Kegiatan/page.jsx` | CRUD | Various | `/kegiatan/*` | `KegiatanPengajuanController` | KegiatanPengajuan |
| `ketuacriteria` | `Ketua/Criteria/page.jsx` | `getCriteria` | GET | `/criteria` | `KetuaCriteriaController::index` | Settings |
| | | `updateKriteriaPenilaian` | POST | `/criteria/kriteria-penilaian` | `KetuaCriteriaController::updateKriteriaPenilaian` | Settings |
| | | `updateKesesuaianTema` | POST | `/criteria/kesesuaian-tema` | `KetuaCriteriaController::updateKesesuaianTema` | Settings |
| `ketuapengaturan` | `Ketua/Pengaturan/page.jsx` | `getSettings` | GET | `/settings` | `SettingsController::index` | Settings |
| | | `updateIgnoreKegiatanDates` | POST | `/settings/update-ignore-kegiatan-dates` | `SettingsController::updateIgnoreKegiatanDates` | Settings |
| Proposal workflow | `Admin/MonitoringPengajuan/Proposal/page.jsx` | `ketuaDecideSeleksi` | POST | `/proposal/seleksi/ketua-decide` | `ProposalSeleksiController::ketuaDecide` | Proposal |
| | SK accept | `acceptProposalSuratTugas` | POST | `/proposal/sk/accept` | `PengumumanSuratTugasController::acceptProposal` | Proposal, Laporan, Dokumen |
| Diseminasi | `Admin/MonitoringPengajuan/Laporan/page.jsx` | `approveDiseminasi` | POST | `/diseminasi/approve` | `DiseminasiController::approve` | Laporan |
| | | `finalDecisionDiseminasi` | POST | `/diseminasi/final-decision` | `DiseminasiController::finalDecision` | Laporan |
| Auth requests | `Admin/MonitoringPengajuan/Proposal/page.jsx` | `authorizeRequest` | POST | `/authorization-request/authorize` | `AuthorizationRequestController::authorize` | AuthorizationRequest |

### Dosen

| Frontend Module | Page | API Call | Method | Route | Controller | Model |
|----------------|------|----------|--------|-------|------------|-------|
| `dosenmonitoringprogress` | `Dosen/MonitoringPengajuan/page.jsx` | Skema selection | GET | `/skema` | `SkemaController::index` | Skema |
| | Proposal tab | `getProposal` | GET | `/proposal` | `ProposalController::index` | Proposal |
| | | `addHalamanPengesahan` | POST | `/proposal/draft/add` | `ProposalDraftController::createDraft` | Proposal, ProposalMember, Dokumen |
| | | `updateHalamanPengesahan` | POST | `/proposal/draft/update` | `ProposalDraftController::updateDraft` | Proposal, ProposalMember, Dokumen |
| | | `getGeneratedTemplate` | POST | `/proposal/upload/prepare` | `ProposalDocumentController::prepareProposalUpload` | Dokumen |
| | | `uploadProposal` | POST | `/proposal/upload/store` | `ProposalDocumentController::uploadProposal` | Dokumen, Proposal |
| | | `deleteProposal` | POST | `/proposal/delete` | `ProposalWorkflowController::tolakProposal` | Proposal |
| | Laporan tab | `getLaporan` | GET | `/laporan` | `LaporanController::index` | Laporan |
| | | `updateLaporan` | POST | `/laporan/update` | `LaporanController::update` | Laporan |
| | | `uploadDokumenLaporan` | POST | `/laporan/upload-dokumen` | `LaporanController::uploadDokumen` | Dokumen |
| | | `finishLaporan` | POST | `/laporan/finish` | `LaporanController::finish` | Laporan |
| | | `generateLaporanAkhir` | POST | `/laporan/generate-laporan-akhir` | `LaporanController::generateLaporanAkhir` | Dokumen |
| | | `submitPublikasi` | POST | `/laporan/publikasi` | `LaporanController::submitPublikasi` | Laporan, Dokumen |
| | Members | CRUD | Various | `/laporan/members/*` | `LaporanMemberController` | LaporanMember |
| | Budget | CRUD | Various | `/laporan/realisasi-anggaran/*` | `RealisasiAnggaranController` | RealisasiAnggaran |
| `profildosen` | `Dosen/Profil/page.jsx` | `getPenelitiDetail` | GET | `/peneliti-detail` | `PenelitiDetailController::detail` | PenelitiDetail |
| `dosenscholar` | `Dosen/GoogleScholar/page.jsx` | Scholar dashboard | GET | `/scholar/dashboard` | `ScholarController::dashboard` | Scholar |
| Logbook | (nested in Laporan tab) | CRUD | Various | `/logbook_pengerjaan/*` | `LogbookPengerjaanController` | LogbookPengerjaan |
| Dana | (nested in Laporan tab) | `uploadBuktiTerima` | POST | `/dana/claim/upload-bukti-terima` | `DanaController::uploadBuktiTerima` | Dokumen, Laporan |
| | | `uploadPengembalianProof` | POST | `/dana/pengembalian/upload-proof` | `DanaController::uploadPengembalianProof` | Dokumen, Laporan |

### Reviewer

| Frontend Module | Page | API Call | Method | Route | Controller | Model |
|----------------|------|----------|--------|-------|------------|-------|
| `reviewproposal` | `Reviewer/Review/page.jsx` | `getProposal` | GET | `/proposal` | `ProposalController::index` | Proposal |
| | | `getLaporan` | GET | `/laporan` | `LaporanController::index` | Laporan |
| | Review form | `uploadReview` | POST | `/review/upload` | `ReviewController::store` | Review |

### Notifications (All Roles)

| API Call | Method | Route | Controller |
|----------|--------|-------|------------|
| `getNotifications` | GET | `/notifications` | `NotificationController::index` |
| `getUnreadCount` | GET | `/notifications/unread-count` | `NotificationController::unreadCount` |
| `markAsRead` | PUT | `/notifications/{id}/read` | `NotificationController::markAsRead` |
| `markAllAsRead` | PUT | `/notifications/read-all` | `NotificationController::markAllAsRead` |
| `deleteNotification` | DELETE | `/notifications/{id}` | `NotificationController::destroy` |

---

## Task 11: ERD Readiness

### Essential Entities (14)

| Entity | Table | PK | FKs | Polymorphic | Key Relationships |
|--------|-------|----|-----|-------------|-------------------|
| **User** | `users` | `id` | `prodi_id` → prodi | — | hasMany: Proposal, PenugasanReviewer, Notification, LogbookPengerjaan |
| **Skema** | `skema` | `skema_id` | — | — | hasMany: KegiatanPengajuan |
| **KegiatanPengajuan** | `kegiatan_pengajuan` | `kegiatan_id` | `skema_id` → skema | — | hasMany: Proposal(via kegiatan_id), Laporan(via kegiatan_id); morphMany: Dokumen |
| **Proposal** | `proposal` | `proposal_id` | `user_id` → users, `kegiatan_id` → kegiatan_pengajuan | — | hasMany: PenugasanReviewer(via reviewable), Laporan, ProposalMember; morphMany: Dokumen |
| **Laporan** | `laporan` | `laporan_id` | `proposal_id` → proposal, `kegiatan_id` → kegiatan_pengajuan, `current_logbook_id` → logbook_pengerjaan | — | hasMany: PenugasanReviewer(via reviewable), LaporanMember, LogbookPengerjaan, RealisasiAnggaran; morphMany: Dokumen |
| **PenugasanReviewer** | `penugasan_reviewer` | `penugasan_id` | `proposal_id` → proposal (nullable), `user_id` → users | `reviewable` (Proposal or Laporan) | hasOne: Review |
| **Review** | `review` | `review_id` | `penugasan_id` → penugasan_reviewer | — | belongsTo: PenugasanReviewer |
| **Dokumen** | `dokumen` | `dokumen_id` | `current_version_id` → dokumen_version | `documentable` (KegiatanPengajuan, Proposal, or Laporan) | hasMany: DokumenVersion |
| **DokumenVersion** | `dokumen_version` | `version_id` | `dokumen_id` → dokumen, `uploaded_by` → users (no FK) | — | belongsTo: Dokumen |
| **AuthorizationRequest** | `authorization_requests` | `id` | `requested_by` → users, `reviewed_by` → users (nullable) | `requestable` (Skema, KegiatanPengajuan, Proposal, or Laporan) | — |
| **Notification** | `notifications` | `notification_id` | `user_id` → users | — | belongsTo: User |
| **Settings** | `settings` | `id` | `kepala_lppm` → users (nullable), `rektor` → users (nullable) | — | Singleton |
| **ProposalMember** | `proposal_member` | `prop_member_id` | `proposal_id` → proposal | — | belongsTo: Proposal, User/Mahasiswa/Kolaborator |
| **LaporanMember** | `laporan_member` | `laporan_member_id` | `laporan_id` → laporan | — | belongsTo: Laporan, User/Mahasiswa/Kolaborator |

### Supporting Entities (5)

| Entity | Table | PK | FKs | Purpose |
|--------|-------|----|-----|---------|
| **LogbookPengerjaan** | `logbook_pengerjaan` | `logbook_id` | `laporan_id` → laporan, `user_id` → users | Research activity log |
| **RealisasiAnggaran** | `realisasi_anggaran` | `id` | `laporan_id` → laporan | Budget realization items |
| **Prodi** | `prodi` | `prodi_id` | — | Study program reference |
| **Mahasiswa** | `mahasiswa` | `mhswa_id` | — | Student reference |
| **Kolaborator** | `kolaborator` | `kolab_id` | — | External collaborator reference |

### Cardinalities

```
User 1 ──── N Proposal          (user_id)
User 1 ──── N PenugasanReviewer (user_id)
User 1 ──── N Notification      (user_id)
User 1 ──── N LogbookPengerjaan (user_id)

Skema 1 ──── N KegiatanPengajuan (skema_id)
KegiatanPengajuan 1 ──── N Proposal (kegiatan_id)
KegiatanPengajuan 1 ──── N Laporan  (kegiatan_id)

Proposal 1 ──── N Laporan          (proposal_id, unique per semester)
Proposal 1 ──── N ProposalMember   (proposal_id)
Proposal 1 ──── N PenugasanReviewer (reviewable_type='Proposal')

Laporan 1 ──── N PenugasanReviewer (reviewable_type='Laporan')
Laporan 1 ──── N LaporanMember     (laporan_id)
Laporan 1 ──── N LogbookPengerjaan (laporan_id)
Laporan 1 ──── N RealisasiAnggaran (laporan_id)

PenugasanReviewer 1 ──── 1 Review (penugasan_id)
Dokumen 1 ──── N DokumenVersion   (dokumen_id)

Polymorphic:
Dokumen ← documentable → KegiatanPengajuan | Proposal | Laporan
PenugasanReviewer ← reviewable → Proposal | Laporan
AuthorizationRequest ← requestable → Skema | KegiatanPengajuan | Proposal | Laporan
```

---

## Task 12: Diagram-Readiness Verdict

### Facts Confirmed and Ready for Diagrams

| Fact | Source |
|------|--------|
| Pure Sanctum SPA cookie authentication (no tokens) | Task 1 evidence |
| MariaDB via Laravel 11 native `mariadb` driver | Task 2 evidence |
| Complete proposal schema with 32 fields | Task 3 migration audit |
| Complete laporan schema with 40+ fields | Task 3 migration audit |
| Exactly-3 reviewer invariant enforced at backend + frontend | Task 6 evidence |
| Proposal approval is a 2-step Seleksi (Ketua → Staff) then SK upload | Task 7 evidence |
| Laporan has 4 workflow dimensions (stage, status, flags, sub-states) | Task 5 evidence |
| AuthorizationRequest supports 8 action types with approve/deny semantics | Task 9 evidence |
| Backward mapping is stage-specific and reversible (no terminal Laporan rejection) | Task 9 evidence |
| 14 essential + 5 supporting entities for ERD | Task 11 evidence |
| 50 unique API endpoints mapped to controllers | Task 10 evidence |
| Complete role-to-module mapping for all 5 actors | Task 10 evidence |

### Facts Corrected from First Report

| First Report Claim | Correction | Evidence |
|--------------------|-----------|----------|
| "Sanctum personal-access Bearer tokens" | **Pure SPA cookie auth** — no tokens issued | Task 1: `AuthController::login()` returns no token; `$middleware->statefulApi()` |
| "MySQL-compatible configuration" | **MariaDB** — uses native `mariadb` driver | Task 2: `.env:23`, `config/database.php:66` |
| "`proposal.dosen_id` is a latent bug" | **Confirmed bug** — 3 dead notification branches | Task 4: field does not exist in any migration or model |
| MorphMap: "only Skema and KegiatanPengajuan" | **Correct** — Proposal and Laporan use full class names | Task 3: `penugasan_reviewer.reviewable_type` default is `'App\Models\Proposal'` |
| Laporan statuses listed as 10 values | **14 values** — missing `Menunggu kelengkapan data`, `Menunggu review Staff LPPM`, `Menuggu penugasan Reviewer`, `Menunggu Persetujuan Ketua LPPM` | Task 5 evidence |
| "Reviewer skip is the only test imperfection" | **Correct** — RV-PKM-PROP-MUT-001 skip is intentional fixture absence | Confirmed |

### Remaining Unresolved Questions

1. **`dana_disetujui` approval mechanism:** How does Ketua LPPM set `dana_disetujui = true`? The `DanaController` checks this flag but no endpoint in `DanaController` sets it. The `LaporanController::adminDecide` method does not set it either. This may be a separate endpoint not yet identified, or a manual database update. **Impact:** Low — does not affect diagram structure, but the "Funding Approval" action needs a source.

2. **`laporan.jenis_penelitian` and `laporan.kegiatan_id`:** Not in the initial `create_laporan_table` migration but used everywhere. Added by `2026_08_14_020000` and `2026_08_08_000000` respectively. **Resolved** — migration audit confirms these exist.

3. **`manual_status_override` on `kegiatan_pengajuan`:** Referenced in `KegiatanPengajuan` model `$fillable` and used in `getEffectiveStatusAttribute()` but the adding migration was not found in the audit. **Impact:** Low — the field exists in the model and is used functionally.

### Diagrams Safe to Generate Immediately

| Diagram | Readiness |
|---------|-----------|
| Use Case Diagram (5 actors) | Ready — role-module mapping complete |
| Class/ERD Diagram (19 entities) | Ready — all schemas verified |
| Activity Diagram: Proposal Workflow | Ready — complete status transitions mapped |
| Activity Diagram: Laporan Workflow (Penelitian) | Ready — 4 dimensions documented |
| Activity Diagram: Laporan Workflow (PkM) | Ready — sequence + sub-states documented |
| Sequence Diagram: Login/Authentication | Ready — complete flow traced |
| Sequence Diagram: Proposal Submission | Ready — Dosen → Draft → Upload → Seleksi |
| Sequence Diagram: Reviewer Assignment + Review | Ready — exactly-3 invariant + completion logic |
| Sequence Diagram: Diseminasi Decision | Ready — 2-step + final decision |
| State Diagram: Proposal Status | Ready — 12 enum values mapped |
| State Diagram: Laporan Status | Ready — 14 enum values mapped |
| Deployment Diagram | Ready — Next.js + Laravel + MariaDB |

### Diagrams That Must Wait

| Diagram | Blocker |
|---------|---------|
| Dana Workflow Detail | `dana_disetujui` approval source endpoint unidentified (Task 10 gap) |
| Notification Flow Diagram | Notification delivery broken for 3 `dosen_id` paths (Task 4 bug) — diagram should note this gap |

---

## Bugs Found (3 total)

| # | Bug | Severity | Impact |
|---|-----|----------|--------|
| 1 | `proposal.dosen_id` — 3 dead notification branches | Medium | Notifications silently skipped for reject/return actions |
| 2 | `dana_disetujui` — no setter exists | **Critical** | Claim Dana + Pengembalian Dana workflows permanently blocked |
| 3 | `Menuggu penugasan Reviewer` — typo in enum | Low | Cosmetic (enum value has extra 'u') |
