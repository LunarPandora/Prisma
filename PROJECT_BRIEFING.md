# PRISMA — Project Briefing for AI Models

---

## Part 1 — Repository Structure

```
prisma_copy/
├── prisma/                          # Frontend (Next.js / React)
│   ├── src/app/
│   │   ├── component/               # Shared UI components
│   │   │   ├── Alert/               # Alert.jsx (confirm/cancel modal)
│   │   │   ├── Context/             # Context menu system (right-click)
│   │   │   ├── Display/             # Badge, Callout, SectionField, WorkflowProgress
│   │   │   ├── Inputs/              # Button, DatePicker, TextInput, SelectInput, Toggle, etc.
│   │   │   ├── Libraries/           # API clients, hooks, configs, utilities
│   │   │   │   ├── api/             # One file per domain (proposal.js, laporan.js, dana.js, etc.)
│   │   │   │   ├── config/          # Status colors, context menus per domain
│   │   │   │   ├── hooks/           # useFormSubmission, useValidation, useContextMenu, useQueryBuilder
│   │   │   │   ├── options/         # Dropdown option lists (kriteria, selections)
│   │   │   │   └── utils/           # api.js (Axios), menu.js (module registry), date.js, query.js, pdfPreview.js
│   │   │   ├── Modal/               # Modal, ConfirmModal, FormModal
│   │   │   ├── Notification/        # NotificationBell, NotificationDropdown
│   │   │   ├── Panel/               # Navbar.jsx (sidebar)
│   │   │   ├── ProfilPeneliti/      # BookEditor, HKIEditor, PublicationEditor, ResearchHistoryEditor
│   │   │   ├── Research/            # ResearchManager (add researchers to proposals)
│   │   │   ├── Table/               # CustomTable, ActionButton
│   │   │   ├── Tags/                # TextTag, UserTag
│   │   │   └── Toast/               # Toast.jsx
│   │   ├── dashboard/
│   │   │   ├── layout.jsx           # Auth guard + hydration wait
│   │   │   ├── page.jsx             # Main dashboard router (module switcher)
│   │   │   └── pages/
│   │   │       ├── Home/            # Dashboard home (role-specific dashboard components)
│   │   │       ├── Admin/           # Admin modules (Users, Prodi, Skema, Monitoring, Dana, etc.)
│   │   │       ├── Dosen/           # Dosen modules (Proposal, Laporan, Profil, Scholar)
│   │   │       ├── Ketua/           # Ketua modules (Criteria, Disposisi, Funding, Settings)
│   │   │       └── Reviewer/        # Reviewer modules (Review)
│   │   ├── login/                   # Login page
│   │   └── stores/                  # Zustand stores (useUserStore, useNotificationStore, useLoaderStore)
│   └── package.json
│
└── prisma-server/                   # Backend (Laravel / PHP)
    ├── app/
    │   ├── Console/Commands/        # SyncScholarProfilesWeekly (scheduled job)
    │   ├── Helpers/                 # ApiResponse.php, KegiatanStage.php
    │   ├── Http/
    │   │   ├── Controllers/         # 30+ controllers
    │   │   │   ├── Proposal/        # Sub-group: ProposalController, ProposalWorkflowController,
    │   │   │   │                    #   ProposalSeleksiController, ProposalDocumentController,
    │   │   │   │                    #   ProposalDraftController, PengumumanSuratTugasController
    │   │   │   ├── DashboardController.php
    │   │   │   ├── ReviewController.php
    │   │   │   ├── PenugasanReviewerController.php
    │   │   │   ├── LaporanController.php
    │   │   │   ├── DiseminasiController.php
    │   │   │   ├── DanaController.php
    │   │   │   ├── AuthorizationRequestController.php
    │   │   │   └── ... (30+ total)
    │   │   ├── Middleware/          # CheckRole.php
    │   │   └── Resources/           # API transformers (per role: Admin/, Dosen/, Reviewer/)
    │   ├── Jobs/                    # SyncScholarProfile (queued)
    │   ├── Models/                  # 31 Eloquent models
    │   ├── Providers/               # AppServiceProvider
    │   └── Services/                # NotificationService, DocumentService, ProposalDocxService,
    │                                #   PengumumanSuratTugasService, LaporanAkhirDocxService,
    │                                #   AvatarService, Scholar/ (GoogleScholarProvider, SerpApiProvider)
    └── routes/
        ├── api.php                  # All API routes
        ├── web.php                  # Minimal web routes
        └── console.php              # Scheduled commands
```

---

## Part 2 — What the System Is

PRISMA is a **research and community service management system** (Penelitian dan Pengabdian kepada Masyarakat) for an Indonesian university's LPPM (Lembaga Penelitian dan Pengabdian kepada Masyarakat).

### Core Business Process

1. **Schema & Period Setup** — Admin creates Skema (research schemes) and KegiatanPengajuan (time-bound activity periods) with date ranges and status controls.

2. **Proposal Submission** — Dosen (lecturers) create proposals within open periods, attach team members (Dosen, Mahasiswa, Kolaborator), and upload a proposal document.

3. **Double Verification (Seleksi)** — Proposals go through two approval stages: Ketua LPPM first, then Staff LPPM. Either can reject, sending it back or permanently declining.

4. **Reviewer Assignment & Review** — Staff assigns reviewers. Multiple reviewers can be assigned per proposal. Each reviewer submits an assessment. When all complete, the system auto-advances.

5. **Acceptance & Surat Tugas** — Ketua LPPM accepts with a SK (Surat Keputusan) upload. This splits the proposal into two Laporan records (Ganjil + Genap semester).

6. **Laporan Lifecycle** — Dosen works through stages: Proses → Publikasi → Diseminasi → Claim Dana → (optional: Pengembalian Dana for PkM) → Luaran → Selesai. Each stage has its own KegiatanPengajuan with date gating.

7. **Dissemination Review** — The Diseminasi stage has its own double verification (Ketua + Staff) and reviewer workflow, separate from the proposal review.

8. **Funding/Finance** — Claim Dana and Pengembalian Dana involve document uploads (transfer proof, receipt) with multi-party confirmation.

The system supports both **Penelitian** (research) and **PkM** (community service) types, which have different laporan stage sequences.

---

## Part 3 — User Roles

Five roles exist, stored in `users.role` as a string enum:

### Superadmin
- **Responsibilities:** Full system access, user management, settings, can perform Staff LPPM and Ketua LPPM actions.
- **Modules:** All modules.
- **Notes:** Can act as Staff LPPM for approvals. Middleware checks include `'Staff LPPM', 'Superadmin'`.

### Staff LPPM
- **Responsibilities:** Proposal selection (second verification), reviewer assignment, laporan review, document generation (SK, Pengumuman Surat Tugas), dana confirmation, period management.
- **Modules:** `staffmonitoringprogress`, `staffmonitoringprogresslaporan`, `mahasiswa`, `kolaborator`, `ketuacriteria`.
- **Key actions:** Staff approve/reject proposals, assign reviewers, confirm claim dana, generate/upload SK.

### Ketua LPPM
- **Responsibilities:** First-level proposal approval, final laporan decision, dana approval, funding decisions, kegiatan edit authorization.
- **Modules:** `ketuaskema`, `ketuakegiatan`, `ketuapengaturan`.
- **Key actions:** Ketua approve/reject proposals (seleksi), final diseminasi decision, approve funding.

### Dosen
- **Responsibilities:** Create and submit proposals, work on laporans (upload documents, write logbooks, submit publications), manage researcher profile.
- **Modules:** `dosenmonitoringprogress`, `dosenmonitoringprogresslaporan`, `profildosen`, `dosenscholar`.
- **Key actions:** Create/upload proposals, update laporan, finish research, submit publikasi, upload dana proof.

### Reviewer
- **Responsibilities:** Review assigned proposals and laporans, submit assessment with criteria.
- **Modules:** `reviewproposal`.
- **Key actions:** Submit/update review with keputusan (accept/reject/revise), kriteria scores, catatan.

### Role Enforcement
- **Middleware:** `CheckRole` middleware on API routes checks `$user->role` against an allowed list.
- **Frontend:** `dashboardModules` array in `menu.js` defines which modules each role can see. `getModuleAccess(moduleKey, role)` returns `{ create, read, update, delete }` permissions.
- **No separate role model:** Roles are a string column on `users`, not a relationship.

---

## Part 4 — Frontend Architecture

### Routing

- **App Router** (Next.js 13+).
- **Single dashboard route:** `/dashboard` — a client-side module switcher, not multi-route.
- **Module switching:** `?module=<key>` query param is read by `useSearchParams()`. The active module's React component is rendered directly. No separate Next.js routes per module.
- **Auth guard:** `dashboard/layout.jsx` checks Zustand hydration + user state. Redirects to `/login` if unauthenticated.

### Module Keys (from `menu.js`)

| Key | Component | Roles | Hidden |
|-----|-----------|-------|--------|
| `home` | Home (role-specific dashboard) | All | No |
| `users` | Users | Superadmin | No |
| `prodi` | Prodi | Superadmin | No |
| `pengaturan` | Pengaturan (Admin) | Superadmin | No |
| `staffmonitoringprogress` | AdminMonitoringPengajuan | Staff LPPM, Ketua LPPM | No |
| `staffmonitoringprogresslaporan` | AdminMonitoringPengajuan | Staff LPPM, Ketua LPPM | Yes |
| `mahasiswa` | Mahasiswa | Staff LPPM | No |
| `kolaborator` | Kolaborator | Staff LPPM | No |
| `ketuaskema` | Skema | Ketua LPPM | No |
| `ketuakegiatan` | Skema | Ketua LPPM | Yes |
| `ketuacriteria` | KetuaCriteria | Staff LPPM | No |
| `ketuapengaturan` | KetuaPengaturan | Ketua LPPM | No |
| `dosenmonitoringprogress` | DosenMonitoringPengajuan | Dosen | No |
| `dosenmonitoringprogresslaporan` | DosenMonitoringPengajuan | Dosen | Yes |
| `profildosen` | ProfilDosen | Dosen | No |
| `dosenscholar` | GoogleScholar | Dosen | No |
| `reviewproposal` | ListPengajuanReviewer | Reviewer | No |

Hidden modules are not shown in the sidebar but exist for `getModuleAccess()` checks and deep-link URLs.

### State Management

Three Zustand stores:

- **`useUserStore`** — Persisted to localStorage. Holds `user` object, `hasHydrated`, `justLoggedOut`, `sessionExpired`, `loginFailed` flags.
- **`useNotificationStore`** — Non-persisted. Holds `count`, `notifications[]`, `isOpen`, `isLoading`.
- **`useLoaderStore`** — Non-persisted. Controls global top loading bar (`isLoading`, `progress`).

### API Layer

Two Axios instances in `utils/api.js`:

- **`web`** — Base: `NEXT_PUBLIC_URL`. Used for `/sanctum/csrf-cookie`, `/logout`.
- **`api`** — Base: `NEXT_PUBLIC_URL/api`. Used for all domain endpoints.

Both use `withCredentials: true` and attach `X-XSRF-TOKEN` header from cookie. A shared 401/419 interceptor triggers session expiry handling.

Domain API files: `proposal.js`, `laporan.js`, `dana.js`, `review.js`, `penugasan.js`, `diseminasi.js`, `skema.js`, `kegiatan.js`, `logbook.js`, `scholar.js`, `profilpeneliti.js`, `dashboard.js`, `users.js`, `mahasiswa.js`, `kolaborator.js`, `prodi.js`, `settings.js`, `notifications.js`, `kategoripublikasi.js`.

### Form System

- **`useFormSubmission`** — Async submit wrapper with double-submit guard, toast notifications, 422 validation error parsing, Indonesian error translation.
- **`useValidation`** — Client-side rule-based validation with `validate(fields, values)`, field-level validation, touch tracking. Built-in validators: `required`, `email`, `minLength`, `maxLength`, `minValue`, `maxValue`, `pattern`, `file`.

### Status Display

- **`statusColors.js`** — Centralized color maps for every status string. Exports: `PROPOSAL_STATUS_COLORS`, `LAPORAN_STATUS_COLORS`, `DANA_STATUS_COLORS`, `REVIEW_STATUS_COLORS`, etc.
- **`StatusBadge`** — Component that looks up a status in a color map and renders a `Badge`.

---

## Part 5 — Backend Architecture

### Request Flow

```
Frontend (Axios)
  ↓
api.php route (with CheckRole middleware where applicable)
  ↓
Controller method
  ↓
Model queries / Service calls
  ↓
ApiResponse::success() or ApiResponse::failed()
```

### Authentication

- **Laravel Sanctum** with cookie-based SPA auth.
- `/sanctum/csrf-cookie` bootstraps CSRF token.
- `withCredentials: true` on frontend Axios instances.
- `CheckRole` middleware enforces role-based access on routes.

### Key Services

| Service | Purpose |
|---------|---------|
| `NotificationService` | Create notifications for users/roles, dedup by key, mark read, paginated fetch |
| `DocumentService` | File upload/delete/replace on `public` disk. Slugified filenames with UUID. |
| `ProposalDocxService` | Generate proposal DOCX from template (PHPWord). Includes biodata, publications, budget. |
| `PengumumanSuratTugasService` | Generate Pengumuman Surat Tugas DOCX. Lists approved proposals. |
| `LaporanAkhirDocxService` | Generate Laporan Akhir DOCX. Team members, budget realization, approval signatures. |
| `AvatarService` | Generate placeholder avatar images. |
| `ScholarSyncService` | Sync Google Scholar data via SerpApi. |

### Resources (API Transformers)

Role-specific transformers:
- `ProposalAdminResource`, `ProposalDosenResource`, `ProposalReviewerResource`
- `LaporanDosenResource`
- `DokumenResource`, `UserResource`, `ProdiResource`, etc.

**Critical:** `ProposalAdminResource` and `ProposalDosenResource` return `'judul' => $this->judul` (not `judul_penelitian`). `LaporanDosenResource` returns `'judul_penelitian' => $this->judul_penelitian`.

### Helpers

- **`ApiResponse`** — Static methods `success($data, $message)` and `failed($message, $code)`. Returns standardized JSON.
- **`KegiatanStage`** — Workflow stage engine. Defines stage sequences per `jenis_penelitian`, provides `advance()`, `move()`, `isOpen()`, `previousKode()` methods.

---

## Part 6 — Core Domain Models

### User
- **Table:** `users`, PK: `id`, Soft deletes: Yes
- **Key fields:** `nama`, `email`, `role` (string enum), `status`, `prodi_id`, `nidn`, `nuptk`, `avatar`
- **Relationships:** `prodi()` → Prodi, `penelitiDetail()` → PenelitiDetail (hasOne), `scholarProfile()` → ScholarProfile (hasOne)
- **Role constants:** `ROLE_SUPERADMIN`, `ROLE_STAFF_LPPM`, `ROLE_KETUA_LPPM`, `ROLE_DOSEN`, `ROLE_REVIEWER`

### Proposal
- **Table:** `proposal`, PK: `proposal_id`, Soft deletes: Yes
- **Key fields:** `judul`, `jenis_penelitian`, `topik_penelitian`, `bidang_ilmu`, `fokus_sdg`, `status`, `user_id`, `kegiatan_id`, `skema`, `sumber_skema`, `ketua_seleksi_approved`, `staff_seleksi_approved`, `tahap_penelitian`, `tgl_pengajuan`, `catatan`
- **Budget fields:** `ra_biaya_penelitian_gan`, `ra_biaya_publikasi_gan`, `ra_insentif_gan` (+ genap variants)
- **Publication targets:** `target_publikasi_gan`, `target_publikasi_gen`, `rencana_judul_publikasi_gan`, `rencana_judul_publikasi_gen`
- **Relationships:** `user()` → User, `kegiatan()` → KegiatanPengajuan, `dokumen()` → Dokumen (morphMany), `penugasan()` → PenugasanReviewer (hasMany), `laporan()` → Laporan (hasMany), `prodi()` → Prodi, `memberDosenProposal()`, `memberMhswaProposal()`, `memberKolabProposal()`
- **Computed:** `pending_seleksi_rejection_reason`, `pending_seleksi_rejection_id`, `rejected_by_ketua_seleksi_reason` (from AuthorizationRequest)

### Laporan
- **Table:** `laporan`, PK: `laporan_id`, Soft deletes: Yes
- **Key fields:** `proposal_id`, `kegiatan_id`, `semester` (Ganjil/Genap), `jenis_penelitian`, `judul_penelitian`, `status`, `claim_dana_status`, `pengembalian_dana_status`, `completed_at`, `ketua_diseminasi_approved`, `staff_diseminasi_approved`, `tgl_mulai`, `tgl_submit`, `tgl_selesai`
- **Budget fields:** `realisasi_biaya_penelitian`, `realisasi_biaya_publikasi`, `realisasi_insentif`, `dana_dikembalikan`
- **Publication fields:** `target_publikasi`, `nama_jurnal`, `link_jurnal`, `link_publikasi`
- **Document links:** `link_laporan_akhir`, `link_hki`, `link_buku`, `link_poster`, `link_video`
- **Scope:** `active()` → `whereNull('completed_at')`
- **Computed:** `total_realisasi_biaya`, `pending_rejection_reason`, `pending_rejection_id`, `rejected_by_ketua_reason`
- **Relationships:** `proposal()` → Proposal, `kegiatan()` → KegiatanPengajuan, `logbooks()` → LogbookPengerjaan, `dokumen()` → Dokumen (morphMany), `penugasan()` → PenugasanReviewer (morphMany), `laporanMember()` → LaporanMember, `realisasiAnggaran()` → RealisasiAnggaran

### Skema
- **Table:** `skema`, PK: `skema_id`, Soft deletes: Yes
- **Key fields:** `nama_skema`, `tahun_ajaran`, `status` (Draft/Aktif/Selesai)
- **Relationships:** `kegiatan()` → KegiatanPengajuan (hasMany)

### KegiatanPengajuan
- **Table:** `kegiatan_pengajuan`, PK: `kegiatan_id`, Soft deletes: Yes
- **Key fields:** `skema_id`, `jenis_penelitian`, `kode_kegiatan`, `nama_kegiatan`, `tgl_mulai`, `tgl_selesai`, `status`, `manual_status_override`
- **Computed:** `effective_status` — If `manual_status_override` is true, returns stored `status`. Otherwise computes: `'Belum dibuka'` (now < tgl_mulai), `'Terbuka'` (now between), `'Selesai'` (now > tgl_selesai).
- **Relationships:** `skema()` → Skema, `dokumen()` → Dokumen (morphMany)

### PenugasanReviewer
- **Table:** `penugasan_reviewer`, PK: `penugasan_id`, Soft deletes: Yes
- **Key fields:** `proposal_id` (legacy FK), `reviewable_type`, `reviewable_id` (polymorphic), `user_id`, `tgl_penugasan`, `status_review` (null = pending, `'Telah direview'` = completed)
- **Relationships:** `reviewable()` → morphTo (Proposal or Laporan), `review()` → Review (hasOne), `reviewer()` → User

### Review
- **Table:** `review`, PK: `review_id`, Soft deletes: Yes
- **Key fields:** `penugasan_id`, `keputusan`, `catatan`, `tgl_review`, `kriteria_kesesuaian_tema` (JSON array), `kriteria_penilaian` (JSON array)
- **Relationships:** `penugasan()` → PenugasanReviewer

### ProposalMember
- **Table:** `proposal_member`, PK: `prop_member_id`, No soft deletes
- **Key fields:** `proposal_id`, `member_id`, `role` (Dosen/Mahasiswa/Kolaborator), `semester`, `ttjp`
- **Relationships:** `user()` → User (FK: member_id), `mahasiswa()` → Mahasiswa (FK: member_id), `kolaborator()` → Kolaborator (FK: member_id)

### LaporanMember
- **Table:** `laporan_member`, PK: `laporan_member_id`, No soft deletes
- **Key fields:** `laporan_id`, `member_id`, `role`, `position`, `ttjp`
- **Relationships:** `laporan()` → Laporan, `user()` → User, `mahasiswa()` → Mahasiswa, `kolaborator()` → Kolaborator

### Dokumen
- **Table:** `dokumen`, PK: `dokumen_id`, Soft deletes: Yes
- **Key fields:** `documentable_type`, `documentable_id` (polymorphic), `jenis_dokumen`, `current_version_id`
- **Appended:** `file_url`, `nama_file`, `tgl_upload`, `drive_file_url` — all delegate to `currentVersion`
- **Relationships:** `documentable()` → morphTo, `versions()` → DokumenVersion (hasMany), `currentVersion()` → DokumenVersion

### DokumenVersion
- **Table:** `dokumen_version`, PK: `version_id`, Soft deletes: Yes
- **Key fields:** `dokumen_id`, `version`, `nama_file`, `drive_file_id`, `drive_file_url`, `local_file_url`, `uploaded_by`, `catatan_revisi`, `tgl_upload`
- **Relationships:** `dokumen()` → Dokumen, `uploader()` → User

### Notification
- **Table:** `notifications`, PK: `notification_id`, No soft deletes
- **Key fields:** `user_id`, `type`, `title`, `message`, `data` (JSON), `action_url`, `key` (dedup), `read_at`

### AuthorizationRequest
- **Table:** `authorization_requests`, PK: `id`, No soft deletes
- **Key fields:** `requestable_type`, `requestable_id` (polymorphic), `requested_by`, `action`, `reason`, `current_data` (JSON), `proposed_data` (JSON), `status`, `reviewed_by`, `reviewed_at`, `review_note`
- **Actions:** `'delete'`, `'return'`, `'reject'`, `'return_diseminasi'`, `'return_seleksi'`

### Settings
- **Table:** `settings`, PK: `id`, Singleton row
- **Key fields:** `kepala_lppm` (FK → User), `rektor` (FK → User), `rektor_nama`, `rektor_nidn`, `rektor_nuptk`, `nama_kampus`, `kriteria_penilaian` (JSON array), `list_kesesuaian_tema` (JSON array), `ignore_kegiatan_dates` (boolean)

### Other Models

| Model | Table | Purpose |
|-------|-------|---------|
| Kolaborator | `kolaborator` | External collaborators (not system users) |
| Mahasiswa | `mahasiswa` | Students |
| Prodi | `prodi` | Study programs |
| LogbookPengerjaan | `logbook_pengerjaan` | Research activity logbook entries |
| RealisasiAnggaran | `realisasi_anggaran` | Budget realization line items |
| Sitasi | `sitasi` | Citation records for laporans |
| KegiatanEditRequest | `kegiatan_edit_requests` | Requests to edit kegiatan dates |
| PenelitiDetail | `peneliti_details` | Researcher profile details |
| ScholarProfile | `scholar_profiles` | Google Scholar integration |
| ScholarPublication | `scholar_publications` | Scholar publication data |
| Publication | `publications` | Researcher publication records |
| PublicationCategory | `publication_categories` | Publication category/ranking |
| Book | `books` | Researcher book records |
| Hki | `hkis` | Intellectual property records |
| ResearchHistory | `research_histories` | Research history records |

---

## Part 7 — Relationship Map

```
User
├── prodi() → Prodi
├── penelitiDetail() → PenelitiDetail
│   ├── publications() → Publication
│   ├── books() → Book
│   ├── hkis() → Hki
│   └── researchHistories() → ResearchHistory
└── scholarProfile() → ScholarProfile
    ├── citationsByYear() → ScholarCitationByYear
    └── publications() → ScholarPublication

Skema
└── kegiatan() → KegiatanPengajuan (hasMany)
    ├── dokumen() → Dokumen (morphMany)
    └── (via Proposal)
        └── Proposal
            ├── user() → User
            ├── kegiatan() → KegiatanPengajuan
            ├── prodi() → Prodi
            ├── dokumen() → Dokumen (morphMany)
            ├── penugasan() → PenugasanReviewer (hasMany)
            │   ├── reviewable() → morphTo (Proposal|Laporan)
            │   └── review() → Review
            ├── laporan() → Laporan (hasMany)
            │   ├── proposal() → Proposal
            │   ├── kegiatan() → KegiatanPengajuan
            │   ├── logbooks() → LogbookPengerjaan
            │   ├── dokumen() → Dokumen (morphMany)
            │   ├── penugasan() → PenugasanReviewer (morphMany)
            │   ├── laporanMember() → LaporanMember
            │   └── realisasiAnggaran() → RealisasiAnggaran
            ├── memberDosenProposal() → ProposalMember
            ├── memberMhswaProposal() → ProposalMember
            └── memberKolabProposal() → ProposalMember

AuthorizationRequest
├── requestable() → morphTo (Proposal|Laporan)
├── requester() → User
└── reviewer() → User

Settings (singleton)
├── kepalaLppmUser() → User
└── rektorUser() → User

LaporanMember
├── laporan() → Laporan
├── user() → User
├── mahasiswa() → Mahasiswa
└── kolaborator() → Kolaborator

Notification → User
```

### Unusual FK Names
- `ProposalMember.member_id` → `User.id` or `Mahasiswa.mhswa_id` or `Kolaborator.kolab_id`
- `LaporanMember.member_id` → same pattern
- `PenelitiDetail.user_id` and `PenelitiDetail.kolab_id` — dual ownership
- `Proposal.penugasan()` → `PenugasanReviewer.proposal_id` (legacy direct FK alongside polymorphic `reviewable`)

---

## Part 8 — Proposal Workflow

### All Proposal Statuses

```
Draft
Menunggu proposal untuk diupload
Menunggu review dari Ketua LPPM
Menunggu review Staff LPPM
Menunggu penugasan reviewer
Menunggu review
Menunggu persetujuan Ketua LPPM
Proposal Diterima
Dalam pengerjaan
Ditolak (soft-deleted)
```

### Lifecycle

```
Draft
  │  Dosen creates draft
  ▼
Menunggu proposal untuk diupload
  │  (Draft state after kegiatan assignment)
  ▼
Menunggu review dari Ketua LPPM
  │  Trigger: Dosen uploads proposal document (ProposalDocumentController::uploadProposal)
  │  Side effects: Creates Dokumen + DokumenVersion, notifies Staff LPPM
  ▼
SELEKSI — Double Verification
  │
  ├─ Ketua accepts (ProposalSeleksiController::ketuaDecide)
  │   → Menunggu review Staff LPPM
  │   → Side effects: Sets ketua_seleksi_approved=true, notifies Staff + Dosen
  │
  ├─ Ketua rejects
  │   → Ditolak (soft-deleted)
  │   → Side effects: Notifies Dosen, soft-deletes Proposal
  │
  ├─ Staff accepts (ProposalSeleksiController::staffDecide)
  │   → Menunggu penugasan reviewer
  │   → Pre-condition: ketua_seleksi_approved must be true
  │   → Side effects: Sets staff_seleksi_approved=true, notifies Ketua + Dosen
  │
  └─ Staff rejects
      → Menunggu review dari Ketua LPPM (returns to Ketua)
      → Side effects: Creates AuthorizationRequest (return_seleksi)
  │
  ▼
Menunggu penugasan reviewer
  │  Trigger: Staff confirms reviewer assignment (PenugasanReviewerController::confirmAssignment)
  │  Side effects: Creates PenugasanReviewer records, notifies reviewers + Dosen
  ▼
Menunggu review
  │  (Reviewer works on review)
  ▼
Menunggu persetujuan Ketua LPPM
  │  Trigger: ReviewController::store — when ALL reviewers have status_review='Telah direview'
  │  Side effects: Notifies Ketua, Staff, Dosen (proposal.reviews.complete)
  ▼
PENGUMUMAN SURAT TUGAS
  │
  ├─ Staff repoints kegiatan_id (ProposalWorkflowController::updateTahapProposal)
  │   → Status stays: Menunggu persetujuan Ketua LPPM
  │   → Side effects: Repoints kegiatan_id to PENGUMUMAN_SURAT_TUGAS
  │
  ├─ Ketua accepts with SK upload (PengumumanSuratTugasController::acceptProposal)
  │   → Proposal Diterima
  │   → Side effects: Creates Dokumen (SK), notifies Dosen + team members,
  │     opens first laporan stage kegiatan, splits into Laporan Ganjil + Genap
  │
  ├─ Staff batch SK upload (PengumumanSuratTugasController::upload)
  │   → Proposal Diterima (for all proposals in batch)
  │   → Side effects: Same as above but batch operation
  │
  └─ Ketua rejects (ProposalWorkflowController::tolakProposal)
      → Ditolak (soft-deleted)
      → Side effects: Deletes documents, versions, penugasan, soft-deletes Proposal
```

---

## Part 9 — Reviewer Workflow

### Assignment

1. **Staff assigns reviewers** — `PenugasanReviewerController::assignReviewers` creates/updates `PenugasanReviewer` records. Supports both Proposal and Laporan (polymorphic).
2. **Staff confirms** — `PenugasanReviewerController::confirmAssignment` sets Proposal status to `'Menunggu review'` and notifies each reviewer.

### Multiple Reviewers

- Yes, multiple reviewers per proposal/laporan supported.
- Each gets their own `PenugasanReviewer` record.
- Reviews are tracked independently.

### Review Submission

- `ReviewController::store` — Reviewer submits `keputusan`, `catatan`, `kriteria_kesesuaian_tema`, `kriteria_penilaian`.
- Sets `PenugasanReviewer.status_review = 'Telah direview'`.
- Creates `Review` record.

### Completion Detection

```php
$allReviewed = $penugasanList->every(fn($p) => $p->status_review === 'Telah direview');
```

When all reviewers complete:
- **Proposal:** Status → `'Menunggu persetujuan Ketua LPPM'`
- **Laporan (Diseminasi):** Status → `'Menunggu keputusan Ketua'`

Race condition protection: `DB::transaction` + `lockForUpdate()`.

### Review Statuses

```
null (unreviewed)
Telah direview
```

### Review Keputusan

(From review form — not a model status, stored in `Review.keputusan`)

---

## Part 10 — Admin / LPPM Review Workflow

### Staff LPPM Actions

1. **Proposal Selection** (second verification) — Accept/reject after Ketua approves.
2. **Reviewer Assignment** — Assign and confirm reviewers for proposals and laporans.
3. **Laporan Review** — Review submitted publications and final reports.
4. **Diseminasi Staff Decision** — Second-level diseminasi approval.
5. **Dana Confirmation** — Confirm claim dana and pengembalian dana.
6. **Document Generation** — Generate/upload SK, Pengumuman Surat Tugas.
7. **Period Management** — Create/update KegiatanPengajuan.

### Ketua LPPM Actions

1. **Proposal Selection** (first verification) — Accept/reject proposals.
2. **Final Diseminasi Decision** — Accept/reject after staff + reviewers complete.
3. **Dana Approval** — Approve funding requests.
4. **Proposal Acceptance with SK** — Upload SK to accept proposal (splits into Laporan).
5. **Kegiatan Edit Authorization** — Approve/reject date change requests.

---

## Part 11 — Laporan Workflow

### Creation

Laporan records are **automatically created** when a proposal is accepted (SK uploaded). Each proposal splits into **two Laporan records**: one for Ganjil semester, one for Genap semester.

### All Laporan Statuses

```
Belum dimulai
Dalam pengerjaan
Menunggu kelengkapan data
Menunggu review Admin
Menunggu review Staff LPPM
Menunggu review
Menunggu hasil dari Reviewers
Menunggu keputusan Ketua
Menunggu penugasan Reviewer
Menunggu Persetujuan Ketua LPPM
Menunggu konfirmasi pengiriman dana
Menunggu konfirmasi penerimaan dana
Revisi
Selesai
```

### Stage Sequence (determined by KegiatanStage helper)

**Penelitian:**
```
PROSES_PENELITIAN_{GANJIL|GENAP}
→ PUBLIKASI_{GANJIL|GENAP}
→ DISEMINASI_{GANJIL|GENAP}
→ CLAIM_DANA_{GANJIL|GENAP}
→ LUARAN_PENELITIAN
```

**PkM:**
```
CLAIM_DANA_{GANJIL|GENAP}
→ PROSES_PKM_{GANJIL|GENAP}
→ PUBLIKASI_{GANJIL|GENAP}
→ PENGEMBALIAN_DANA_{GANJIL|GENAP}
→ DISEMINASI_{GANJIL|GENAP}
→ LUARAN_PKM
```

### Dosen Workflow

1. **Start working** — Creating a logbook entry auto-changes status from `'Belum dimulai'` to `'Dalam pengerjaan'`.
2. **Finish research** — `LaporanController::finish` → `'Menunggu kelengkapan data'`, advances stage.
3. **Submit publication** — `LaporanController::submitPublikasi` → `'Menunggu review Admin'`, advances stage.
4. **Upload proof** — Dana-related document uploads.

### Diseminasi Double Verification

Same pattern as Proposal:
- Ketua approves → `'Menunggu review Staff LPPM'`
- Staff approves → `'Menuggu penugasan Reviewer'` (note: typo in codebase)
- Reviewers review → `'Menunggu keputusan Ketua'`
- Ketua final decision → `'Dalam pengerjaan'` (advance) or `'Revisi'` (rollback)

### Claim Dana Workflow

1. Staff uploads transfer proof → `claim_dana_status = 'Menunggu bukti terima'`
2. Dosen uploads receipt → `claim_dana_status = 'Menunggu konfirmasi admin'`
3. Staff confirms → `claim_dana_status = 'Selesai'`, advances stage
4. Auto-complete if both proofs exist

### Pengembalian Dana (PkM only)

1. Staff requests → `pengembalian_dana_status = 'Menunggu Pengembalian Dana'`
2. Dosen uploads proof → `pengembalian_dana_status = 'Menunggu konfirmasi admin'`
3. Staff confirms → `pengembalian_dana_status = 'Selesai'`, advances stage
4. Or staff skips if `dana_dikembalikan = false`

### Completion

When the last non-Luaran stage completes:
- `completed_at = now()`
- `status = 'Selesai'`
- Laporan marked as inactive via `scopeActive` (`whereNull('completed_at')`)

---

## Part 12 — Periode / Kegiatan Pengajuan System

### How It Works

- **Skema** defines a research scheme (e.g., "Penelitian Dosen Tetap 2026").
- **KegiatanPengajuan** defines a time-bound activity period within a Skema, identified by `kode_kegiatan`.
- Each Skema can have multiple KegiatanPengajuan records (one per stage).
- A KegiatanPengajuan has `tgl_mulai` and `tgl_selesai` defining its date window.

### Status Logic

```php
// KegiatanPengajuan::getEffectiveStatusAttribute()
if ($this->manual_status_override) {
    return $this->status; // Use stored status directly
}

$now = now();
if ($now < $this->tgl_mulai) return 'Belum dibuka';
if ($now >= $this->tgl_mulai && $now <= $this->tgl_selesai) return 'Terbuka';
return 'Selesai';
```

When an admin manually sets status, `manual_status_override = true`, bypassing date logic.

`Settings.ignore_kegiatan_dates` — When true, `KegiatanStage::isOpen()` always returns true regardless of dates.

### Kode Kegiatan Values

| Kode | Purpose |
|------|---------|
| `PENERIMAAN_PROPOSAL` | Proposal submission window |
| `SELEKSI_PROPOSAL` | Proposal selection/review period |
| `PENGUMUMAN_SURAT_TUGAS` | SK announcement period |
| `PROSES_PENELITIAN_GANJIL` | Research process — odd semester |
| `PROSES_PENELITIAN_GENAP` | Research process — even semester |
| `PROSES_PKM_GANJIL` | PkM process — odd semester |
| `PROSES_PKM_GENAP` | PkM process — even semester |
| `PUBLIKASI_GANJIL` | Publication stage — odd semester |
| `PUBLIKASI_GENAP` | Publication stage — even semester |
| `DISEMINASI_GANJIL` | Dissemination — odd semester |
| `DISEMINASI_GENAP` | Dissemination — even semester |
| `CLAIM_DANA_GANJIL` | Fund claim — odd semester |
| `CLAIM_DANA_GENAP` | Fund claim — even semester |
| `PENGEMBALIAN_DANA_GANJIL` | Fund return — odd semester |
| `PENGEMBALIAN_DANA_GENAP` | Fund return — even semester |
| `LUARAN_PENELITIAN` | Research output (terminal) |
| `LUARAN_PKM` | PkM output (terminal) |

### Stage Advancement

`KegiatanStage::advance($record)` moves `kegiatan_id` to the next kegiatan in the sequence. `KegiatanStage::move($record, $targetKode)` moves to an arbitrary stage (used for rejection rollback).

---

## Part 13 — Skema System

- **Skema** represents a research funding scheme (e.g., "Penelitian Dosen Tetap", "PkM Berdampak").
- Fields: `nama_skema`, `tahun_ajaran`, `status` (Draft/Aktif/Selesai).
- Each Skema has multiple `KegiatanPengajuan` records (one per workflow stage).
- Dosen selects a Skema when creating a proposal. The Skema determines which `kode_kegiatan` sequence applies.
- `jenis_penelitian` is stored on the KegiatanPengajuan, not the Skema itself.

---

## Part 14 — Document System

### Architecture

- **Dokumen** — Container record. Polymorphic owner (Proposal, Laporan, KegiatanPengajuan). Has `jenis_dokumen` and `current_version_id`.
- **DokumenVersion** — Individual file versions. Each has `version` number, file metadata, `uploaded_by`.
- **Current version:** `Dokumen.current_version_id` points to the active `DokumenVersion`. Appended accessors (`file_url`, `nama_file`, etc.) delegate to currentVersion.

### Upload Pattern

1. `DocumentService::upload($file, $folder)` → stores file on `public` disk.
2. Create `Dokumen` record (or find existing by `jenis_dokumen` + documentable).
3. Create `DokumenVersion` with incremented `version` number.
4. Update `Dokumen.current_version_id`.

### Document Types (jenis_dokumen)

- `Dokumen Proposal`
- `Dokumen Laporan`
- `Dokumen Laporan Final`
- `Laporan Akhir`
- `Pengumuman Surat Tugas`
- `SK Resmi`
- `Bukti Transfer Claim`
- `Bukti Terima Claim`
- `Bukti Transfer Pengembalian`
- `Halaman Pengesahan`

### Generated Documents

- **ProposalDocxService** — Generates proposal DOCX from template. Used in logbook document aggregation.
- **PengumumanSuratTugasService** — Generates Pengumuman Surat Tugas DOCX.
- **LaporanAkhirDocxService** — Generates Laporan Akhir DOCX.

All write to `storage/app/public/generated/`.

### File Storage

- Uploaded files: `storage/app/public/documents/{folder}/`
- Generated files: `storage/app/public/generated/`
- Templates: `storage/app/templates/`

---

## Part 15 — Proposal Members / Researchers

### Model: ProposalMember

- `proposal_id` — FK to Proposal
- `member_id` — Polymorphic FK (User.id for Dosen, Mahasiswa.mhswa_id, Kolaborator.kolab_id)
- `role` — `'Dosen'`, `'Mahasiswa'`, or `'Kolaborator'`
- `semester` — Semester assignment
- `ttjp` — Tanda Tugas Jabatan Peneliti

### Ketua

The proposal owner (`Proposal.user_id`) is the Ketua. Not a ProposalMember record.

### Frontend

Managed via `ResearchManager` component and `AddResearcherModal`, `createKolaboratorModal`. Three separate member lists: `memberDosenProposal`, `memberMhswaProposal`, `memberKolabProposal`.

---

## Part 16 — Settings / Global Configuration

### Singleton Settings Row

| Setting | Purpose | Effect |
|---------|---------|--------|
| `kepala_lppm` | FK → User.id | Displayed on generated documents (SK, Laporan Akhir) |
| `rektor` | FK → User.id | Displayed on Laporan Akhir approval signature |
| `rektor_nama`, `rektor_nidn`, `rektor_nuptk` | Rektor identity | Used in generated documents |
| `nama_kampus` | Campus name | Header on generated documents |
| `kriteria_penilaian` | JSON array | Assessment criteria shown in reviewer form |
| `list_kesesuaian_tema` | JSON array | Theme conformity options shown in reviewer form |
| `ignore_kegiatan_dates` | Boolean | When true, KegiatanStage::isOpen() always returns true |

---

## Part 17 — Dashboard and Monitoring Modules

### Dashboard Home

- **Superadmin:** User counts, proposal counts, laporan counts, kegiatan by status.
- **Staff LPPM:** Proposal pending, reviewer pending, laporan pending, dana pending, action queue, tahapan summary, recent activity, active periodes.
- **Dosen:** Total proposals, active laporans, pending actions, completed laporans, workflow progress, action queue, recent activity.
- **Ketua LPPM:** Proposal pending, laporan pending, auth requests, kegiatan edits, funding pending, action queue, recent activity.
- **Reviewer:** Menunggu review, sedang dikerjakan, review selesai, review queue.

### Monitoring Modules

| Module | Role | Purpose | Component |
|--------|------|---------|-----------|
| `staffmonitoringprogress` | Staff LPPM | View/manage proposals + laporans | AdminMonitoringPengajuan |
| `staffmonitoringprogresslaporan` | Staff LPPM | Same component, laporan-focused view | AdminMonitoringPengajuan |
| `dosenmonitoringprogress` | Dosen | View own proposals + laporans | DosenMonitoringPengajuan |
| `dosenmonitoringprogresslaporan` | Dosen | Same, laporan-focused | DosenMonitoringPengajuan |
| `reviewproposal` | Reviewer | View assigned reviews | ListPengajuanReviewer |

### Navigation

`?module=<key>` param is read on dashboard mount. The module's React component is rendered directly. Sidebar calls `setActive(module.key)`.

---

## Part 18 — Notifications

### Storage

`notifications` table. Fields: `user_id`, `type`, `title`, `message`, `data` (JSON), `action_url`, `key` (dedup), `read_at`.

### Creation

`NotificationService` provides:
- `create(userId, type, title, message, data, actionUrl, key)` — single user, deduped by key.
- `createForRole(role, type, title, message, data, actionUrl, key)` — all users of a role.
- `createForUsers(userIds, type, title, message, data, actionUrl, key)` — specific users.

### Notification Types (from codebase)

| Type | Trigger |
|------|---------|
| `proposal.submitted` | Dosen uploads proposal |
| `proposal.rejected` | Ketua rejects proposal |
| `proposal.accepted` | SK uploaded (proposal accepted) |
| `proposal.reviews.complete` | All reviewers finish |
| `proposal.reviewer.assigned` | Reviewers assigned |
| `proposal.seleksi.ketua_approved` | Ketua approves seleksi |
| `proposal.seleksi.ketua_rejected` | Ketua rejects seleksi |
| `proposal.seleksi.staff_approved` | Staff approves seleksi |
| `proposal.seleksi.rejection_requested` | Staff requests rejection |
| `laporan.research.finished` | Dosen finishes research |
| `laporan.diseminasi.submitted` | Dosen submits diseminasi |
| `laporan.diseminasi.ketua_approved` | Ketua approves diseminasi |
| `laporan.diseminasi.ketua_rejected` | Ketua rejects diseminasi |
| `laporan.diseminasi.staff_approved` | Staff approves diseminasi |
| `laporan.diseminasi.rejection_requested` | Staff requests diseminasi rejection |
| `laporan.diseminasi.final_accepted` | Ketua final accept |
| `laporan.diseminasi.final_rejected` | Ketua final reject |
| `laporan.reviews.complete` | All laporan reviewers finish |
| `dana.approved` | Ketua approves funding |
| `dana.claim.transfer_uploaded` | Staff uploads transfer proof |
| `dana.claim.receipt_uploaded` | Dosen uploads receipt |
| `dana.claim.confirmed` | Staff confirms claim |
| `dana.pengembalian.requested` | Staff requests return |
| `dana.pengembalian.proof_uploaded` | Dosen uploads return proof |
| `dana.pengembalian.confirmed` | Staff confirms return |

### Frontend

`NotificationBell` + `NotificationDropdown` components. `useNotificationStore` manages count and list. `NotificationController` provides API endpoints.

---

## Part 19 — Publication / Citation Features

### Publication Management

- **Publication** model — per-researcher publication records with `jenis_jurnal`, `pub_category_id`, `judul`, `peran`, `nama_jurnal`, `tahun`, etc.
- **PublicationCategory** — configurable categories with ranking.
- **Frontend:** `PublicationEditor` component in `ProfilPeneliti/`.
- **Admin management:** `PublicationCategoryController` + `KategoriPublikasiAdminMenu`.

### Google Scholar Integration

- **ScholarProfile** — stores `scholar_author_id`, `profile_url`, `total_citations`, `h_index`, etc.
- **ScholarPublication** — individual publications synced from Scholar.
- **ScholarCitationByYear** / **ScholarPublicationCitationByYear** — year-by-year citation data.
- **Sync:** Background job `SyncScholarProfile` dispatched via `ScholarController`. Uses `SerpApiProvider` (SerpApi Google Scholar API).
- **Frontend:** `GoogleScholar` page for Dosen, `ScholarController` API.
- **Weekly scheduled job:** `SyncScholarProfilesWeekly`.

### Citation (Sitasi) per Laporan

- **Sitasi** model — `laporan_id`, `judul_sitasi`, `sumber`, `tahun`, `url`.
- Managed via `SitasiController` and `SitasiForm` in the Dosen laporan workflow.

---

## Part 20 — Important Status Dictionaries

### Proposal Status

| Status | Meaning |
|--------|---------|
| `Draft` | Initial draft state |
| `Menunggu proposal untuk diupload` | Draft assigned to kegiatan, waiting for upload |
| `Menunggu review dari Ketua LPPM` | Uploaded, awaiting Ketua first verification |
| `Menunggu review Staff LPPM` | Ketua approved, awaiting Staff second verification |
| `Menunggu penugasan reviewer` | Staff approved, awaiting reviewer assignment |
| `Menunggu review` | Reviewers assigned, awaiting review |
| `Menunggu persetujuan Ketua LPPM` | All reviews complete, awaiting Ketua final approval |
| `Proposal Diterima` | Accepted, SK uploaded |
| `Dalam pengerjaan` | Active (post-acceptance) |
| `Ditolak` | Rejected (soft-deleted) |

### PenugasanReviewer Status

| Status_review | Meaning |
|---------------|---------|
| `null` | Assigned but not yet reviewed |
| `Telah direview` | Review completed |

### Laporan Status

| Status | Meaning |
|--------|---------|
| `Belum dimulai` | Created by split, not started |
| `Dalam pengerjaan` | Actively being worked on |
| `Menunggu kelengkapan data` | Research finished, waiting for data completion |
| `Menunggu review Admin` | Publication submitted, awaiting admin review |
| `Menunggu review Staff LPPM` | Ketua diseminasi approved |
| `Menunggu review` | Under review |
| `Menunggu hasil dari Reviewers` | Reviewers assigned, awaiting results |
| `Menunggu keputusan Ketua` | All reviews complete |
| `Menunggu penugasan Reviewer` | Staff diseminasi approved |
| `Menunggu Persetujuan Ketua LPPM` | Staff requested rejection |
| `Menunggu konfirmasi pengiriman dana` | Awaiting transfer confirmation |
| `Menunggu konfirmasi penerimaan dana` | Awaiting receipt confirmation |
| `Revisi` | Rejected, sent back for revision |
| `Selesai` | Completed |

### KegiatanPengajuan Effective Status

| Status | Meaning |
|--------|---------|
| `Belum dibuka` | Date range not yet started (computed) |
| `Terbuka` | Currently within date range (computed) |
| `Selesai` | Date range has passed (computed) |
| Manual values | When `manual_status_override = true`, stored status is used directly |

### Skema Status

| Status | Meaning |
|--------|---------|
| `Draft` | Not yet active |
| `Aktif` | Active |
| `Selesai` | Completed |

### Dana Status Fields

**`claim_dana_status`:**
| Status | Meaning |
|--------|---------|
| `null` | No claim in progress |
| `Menunggu bukti terima` | Transfer uploaded, waiting for receipt |
| `Menunggu konfirmasi admin` | Receipt uploaded, waiting for admin confirmation |
| `Selesai` | Claim completed |

**`pengembalian_dana_status`:**
| Status | Meaning |
|--------|---------|
| `null` | No return in progress |
| `Menunggu Pengembalian Dana` | Return requested |
| `Menunggu konfirmasi admin` | Proof uploaded, waiting for confirmation |
| `Dilewati` | Skipped (no remaining funds) |
| `Selesai` | Return completed |

### AuthorizationRequest Status

| Status | Meaning |
|--------|---------|
| `Menunggu Persetujuan` | Pending Ketua approval |
| `Disetujui` | Approved (action executed) |
| `Ditolak` | Rejected |

---

## Part 21 — Important API Endpoints

### Authentication
- `GET /sanctum/csrf-cookie` — Bootstrap CSRF token
- `POST /login` — Login
- `POST /logout` — Logout

### Dashboard
- `GET /dashboard/superadmin` — Superadmin dashboard data
- `GET /dashboard/staff` — Staff LPPM dashboard data (includes `active_periodes`, `action_queue`, `recent_activity`)
- `GET /dashboard/ketua` — Ketua dashboard data
- `GET /dashboard/dosen` — Dosen dashboard data (includes `workflow_progress`)
- `GET /dashboard/reviewer` — Reviewer dashboard data

### Proposal
- `POST /proposal/draft/add` — Create draft
- `POST /proposal/draft/update` — Update draft
- `POST /proposal/upload/prepare` — Prepare upload
- `POST /proposal/upload/store` — Upload proposal document
- `GET /proposal` — List proposals (with filters)
- `POST /proposal/update` — Update proposal (Staff LPPM)
- `POST /proposal/delete` — Reject proposal (Ketua LPPM, soft-deletes)
- `POST /proposal/seleksi/ketua-decide` — Ketua approve/reject
- `POST /proposal/seleksi/staff-decide` — Staff approve/reject
- `POST /proposal/sk/generate` — Generate Pengumuman Surat Tugas
- `POST /proposal/sk/upload` — Batch SK upload
- `POST /proposal/sk/accept` — Per-proposal SK accept (Ketua)

### Reviewer
- `POST /penugasan/assign` — Assign/update reviewers
- `POST /penugasan/confirm-assignment` — Confirm assignment (sets status)
- `GET /penugasan` — List assignments
- `POST /review/upload` — Submit review
- `PUT /review/{id}` — Update review

### Laporan
- `GET /laporan` — List laporans
- `POST /laporan/update` — Update research info
- `POST /laporan/upload-dokumen` — Upload laporan document
- `POST /laporan/finish` — Finish research stage
- `POST /laporan/generate-laporan-akhir` — Generate Laporan Akhir DOCX
- `POST /laporan/publikasi` — Submit publication (multipart)
- `POST /laporan/decide` — Ketua diseminasi decision
- `GET /laporan/{id}/members` — List members
- `POST /laporan/{id}/members` — Add member
- `GET /laporan/{id}/realisasi-anggaran` — Budget realization

### Diseminasi
- `GET /diseminasi` — List diseminasi items
- `POST /diseminasi/approve` — Ketua approve
- `POST /diseminasi/staff-decide` — Staff approve/reject
- `POST /diseminasi/final-decision` — Ketua final decision

### Dana
- `GET /dana` — List dana items
- `POST /dana/approve-funding` — Ketua approve funding
- `POST /dana/claim/upload-bukti-transfer` — Staff upload transfer
- `POST /dana/claim/upload-bukti-terima` — Dosen upload receipt
- `POST /dana/claim/confirm` — Staff confirm claim
- `POST /dana/pengembalian/request` — Staff request return
- `POST /dana/pengembalian/upload-proof` — Dosen upload return proof
- `POST /dana/pengembalian/confirm` — Staff confirm return
- `POST /dana/pengembalian/skip` — Staff skip return

### Authorization
- `POST /authorization-request` — Create request
- `POST /authorization-request/authorize` — Approve/reject

### Settings
- `GET /settings` — Get settings
- `POST /settings/update` — Update settings
- `POST /settings/update-rektor` — Update rektor info
- `POST /settings/update-ignore-kegiatan-dates` — Toggle date bypass

### Other
- `GET /skema`, `POST /skema/add`, `POST /skema/update`, `POST /skema/delete`
- `GET /kegiatan`, `POST /kegiatan/update`, `GET /kegiatan/fetch-penerimaan-proposal`
- `GET /logbook_pengerjaan`, `POST /logbook_pengerjaan`, `PUT /logbook_pengerjaan/{id}`, `DELETE /logbook_pengerjaan/{id}`
- `GET /scholar/dashboard`, `POST /scholar/connect`, `POST /scholar/sync`
- `GET /peneliti-detail`, `POST /peneliti-detail/update`
- `GET /sitasi`, `POST /sitasi`, `DELETE /sitasi/{id}`

---

## Part 22 — Critical Automatic Side Effects

| Trigger | Side Effects | Implemented In |
|---------|-------------|----------------|
| Dosen uploads proposal | Creates Dokumen + DokumenVersion, repoints kegiatan_id to SELEKSI_PROPOSAL, notifies Staff | ProposalDocumentController::uploadProposal |
| Ketua accepts proposal (seleksi) | Sets ketua_seleksi_approved=true, notifies Staff + Dosen | ProposalSeleksiController::ketuaDecide |
| Staff accepts proposal (seleksi) | Sets staff_seleksi_approved=true, notifies Ketua + Dosen | ProposalSeleksiController::staffDecide |
| Staff confirms reviewer assignment | Creates PenugasanReviewer records, sets status='Menunggu review', notifies reviewers + Dosen | PenugasanReviewerController::confirmAssignment |
| All reviewers complete (proposal) | Sets status='Menunggu persetujuan Ketua LPPM', notifies Ketua + Staff + Dosen | ReviewController::store |
| Ketua accepts with SK | Creates Dokumen (SK), opens first laporan stage, splits into Laporan Ganjil + Genap | PengumumanSuratTugasController::acceptProposal |
| Ketua rejects proposal | Soft-deletes documents, versions, penugasan, proposal | ProposalWorkflowController::tolakProposal |
| Dosen creates logbook | Auto-changes laporan status from 'Belum dimulai' to 'Dalam pengerjaan' | LogbookPengerjaanController::store |
| Dosen finishes research | Advances kegiatan stage, sets tgl_submit, notifies Staff + Ketua | LaporanController::finish |
| Dosen submits publication | Creates Dokumen, advances stage, auto-skips Pengembalian Dana for PkM if applicable | LaporanController::submitPublikasi |
| Ketua rejects diseminasi | Rolls back to previous stage, sets status='Revisi', resets diseminasi flags | LaporanController::adminDecide / DiseminasiController::finalDecision |
| Staff confirms claim dana | Sets claim_dana_status='Selesai', advances stage | DanaController::confirmClaim |
| Dosen uploads receipt (auto-complete) | If both proofs exist, auto-completes claim, advances stage | DanaController::uploadBuktiTerima |
| Staff confirms pengembalian | Sets status='Selesai', advances stage, may set completed_at | DanaController::confirmPengembalian |

---

## Part 23 — Known Architectural Quirks

1. **`judul` vs `judul_penelitian`:** Proposal uses `judul` field. Laporan uses `judul_penelitian`. Many controllers historically used `$proposal->judul_penelitian` which returns null. All such references should use `$proposal->judul`.

2. **Dashboard module switching:** Single `/dashboard` route with `?module=` query param. Not standard Next.js routing. `useSearchParams()` in page.jsx reads the param.

3. **Status strings are case-sensitive and inconsistent:** `'Menuggu penugasan Reviewer'` (with typo) vs `'Menunggu penugasan reviewer'`. Must use exact strings.

4. **Multiple active periods possible:** Multiple KegiatanPengajuan can have `effective_status = 'Terbuka'` simultaneously.

5. **`effective_status` is a computed accessor:** Cannot be used in SQL WHERE clauses. Must filter in memory after querying.

6. **Dual review systems:** Proposal has its own review flow (seleksi + reviewer). Laporan diseminasi has a separate but similar review flow. They share the same `PenugasanReviewer` and `Review` models via polymorphism.

7. **AuthorizationRequest for destructive actions:** Staff cannot directly delete or reject. Must create an AuthorizationRequest that Ketua approves.

8. **POST for everything:** Most mutations use POST, not PUT/DELETE. Only logbook uses RESTful methods.

9. **Soft deletes cascade differently:** Proposal soft-delete cascades manually (controller deletes related records). Laporan soft-deletes do not cascade.

10. **`ProposalMember.member_id` polymorphism:** Same FK points to User, Mahasiswa, or Kolaborator depending on `role`. No foreign key constraint.

11. **Dokumen versioning:** Always creates new DokumenVersion. Never overwrites. `current_version_id` tracks the active version.

12. **Stage advancement is sequential:** KegiatanStage defines fixed sequences. Rejection rolls back to previous stage. No skip-ahead except auto-skip for Pengembalian Dana.

13. **Notification dedup:** Notifications use a `key` field for dedup. If a notification with the same key exists, creation is silently skipped.

14. **`ignore_kegiatan_dates` bypass:** Settings flag that makes all kegiatan stages appear "open" regardless of dates.

15. **PenugasanReviewer has dual ownership:** Both `proposal_id` (direct FK) and `reviewable_type/reviewable_id` (polymorphic). The polymorphic path is the active one.

---

## Part 24 — Areas of Technical Debt / Inconsistency

| Issue | Risk Level | Notes |
|-------|-----------|-------|
| Status string typos (`Menuggu`) | Risky | Used in comparisons; typo must be preserved for compatibility |
| POST for updates/deletes | Harmless | Consistent within codebase, just non-RESTful |
| Controller-heavy business logic | Risky | Most workflow logic is in controllers, not services |
| Duplicate notification construction | Harmless | Each controller builds its own notification inline |
| Inconsistent FK naming | Risky | `proposal_id` vs polymorphic `reviewable` on same model |
| `DokumenController` is empty | Harmless | Document ops handled elsewhere |
| `MonitoringProgressAdminMenu` is empty stub | Harmless | No admin row menus for monitoring |
| Dual `proposal_id` + polymorphic on PenugasanReviewer | Risky | Legacy `proposal_id` alongside `reviewable` morph |

---

## Part 25 — High-Risk Files

| File | Why High-Risk | Workflows Affected |
|------|--------------|-------------------|
| `ProposalDocumentController.php` | Proposal submission triggers kegiatan reassignment, Dokumen creation, notifications | Proposal |
| `PengumumanSuratTugasController.php` | SK upload splits proposals into Laporans, opens stages, batch operations | Proposal → Laporan |
| `PenugasanReviewerController.php` | Reviewer assignment changes proposal/laporan status, creates PenugasanReviewer | Proposal, Laporan |
| `ReviewController.php` | Review submission auto-detects completion, changes status, race condition protection | Proposal, Laporan |
| `DiseminasiController.php` | Double verification, final decision, rollback logic | Laporan |
| `DanaController.php` | Multi-step claim/return flow, auto-completion, stage advancement | Laporan |
| `KegiatanStage.php` | Stage sequence definitions, advance/move/isOpen logic | All workflows |
| `DashboardController.php` | Aggregates data from multiple models for dashboards | All dashboards |
| `AuthorizationRequestController.php` | Executes destructive actions on approval (delete, reject, rollback) | All |
| `LaporanController.php` | Multiple status transitions, stage advancement, auto-skip logic | Laporan |
| `menu.js` | Module registry controls all frontend access | All frontend |
| `statusColors.js` | Status display mapping, stage sequences | All status display |

---

## Part 26 — Feature-to-Code Map

| Feature | Frontend | API | Backend Controller | Models |
|---------|----------|-----|-------------------|--------|
| Login | `login/page.jsx` | `POST /login` | `AuthController` | User |
| Users | `Admin/Users/` | `GET/POST /users` | `UserController` | User |
| Prodi | `Admin/Prodi/` | `GET/POST /prodi` | `ProdiController` | Prodi |
| Skema | `Admin/Skema/`, `Ketua/Skema/` | `GET/POST /skema` | `SkemaController` | Skema |
| Kegiatan | `Admin/Skema/Kegiatan/` | `GET/POST /kegiatan` | `KegiatanPengajuanController` | KegiatanPengajuan |
| Proposal Draft | `Dosen/Proposal/ProposalForm` | `POST /proposal/draft/add` | `ProposalDraftController` | Proposal |
| Proposal Upload | `Dosen/Proposal/ProposalUploadForm` | `POST /proposal/upload/store` | `ProposalDocumentController` | Proposal, Dokumen |
| Proposal Seleksi | `Admin/Proposal/` | `POST /proposal/seleksi/*` | `ProposalSeleksiController` | Proposal |
| Reviewer Assignment | `Admin/Proposal/PenugasanReviewerForm` | `POST /penugasan/*` | `PenugasanReviewerController` | PenugasanReviewer |
| Review | `Reviewer/Review/` | `POST /review/upload` | `ReviewController` | Review, PenugasanReviewer |
| SK Generation | `Admin/Proposal/PengumumanSuratTugasPanel` | `POST /proposal/sk/*` | `PengumumanSuratTugasController` | Dokumen, KegiatanPengajuan |
| Laporan Update | `Dosen/Laporan/` | `POST /laporan/update` | `LaporanController` | Laporan |
| Logbook | `Dosen/Laporan/LogbookForm` | `GET/POST/PUT/DELETE /logbook_pengerjaan` | `LogbookPengerjaanController` | LogbookPengerjaan |
| Diseminasi | `Ketua/Disposisi/` | `POST /diseminasi/*` | `DiseminasiController` | Laporan |
| Dana | `Admin/Dana/` | `POST /dana/*` | `DanaController` | Laporan, Dokumen |
| Settings | `Admin/Pengaturan/` | `GET/POST /settings` | `SettingsController` | Settings |
| Notifications | `NotificationBell/Dropdown` | `GET /notifications` | `NotificationController` | Notification |
| Scholar | `Dosen/GoogleScholar/` | `GET/POST /scholar/*` | `ScholarController` | ScholarProfile |
| Publication Categories | `Admin/Pengaturan/KategoriPublikasi/` | `GET/POST /kategori-publikasi` | `PublicationCategoryController` | PublicationCategory |
| Mahasiswa | `Admin/Mahasiswa/` | `GET/POST /mahasiswa` | `MahasiswaController` | Mahasiswa |
| Kolaborator | `Admin/Kolaborator/` | `GET/POST /kolaborator` | `KolaboratorController` | Kolaborator |
| Dashboard | `Home/components/` | `GET /dashboard/*` | `DashboardController` | Multiple |

---

## Part 27 — Recommended Reading Order

1. **`routes/api.php`** — See all endpoints and middleware at a glance.
2. **`app/Models/Proposal.php`** — Core domain entity, understand fields and relationships.
3. **`app/Models/Laporan.php`** — Second core entity, understand the dual-semester model.
4. **`app/Helpers/KegiatanStage.php`** — Understand stage sequences and advancement logic.
5. **`app/Models/KegiatanPengajuan.php`** — Understand `effective_status` computation.
6. **`app/Http/Controllers/Proposal/ProposalSeleksiController.php`** — Double verification pattern.
7. **`app/Http/Controllers/ReviewController.php`** — Review submission and auto-completion detection.
8. **`app/Http/Controllers/PengumumanSuratTugasController.php`** — Proposal → Laporan split.
9. **`app/Http/Controllers/LaporanController.php`** — Laporan status transitions.
10. **`app/Http/Controllers/DiseminasiController.php`** — Diseminasi double verification.
11. **`app/Http/Controllers/DanaController.php`** — Multi-step finance flow.
12. **`app/Services/NotificationService.php`** — How notifications are created.
13. **`prisma/src/app/dashboard/page.jsx`** — Frontend module switcher.
14. **`prisma/src/app/component/Libraries/utils/menu.js`** — Module registry and access control.
15. **`prisma/src/app/component/Libraries/utils/api.js`** — Axios setup and auth.
16. **`prisma/src/app/component/Libraries/config/statusColors.js`** — All status mappings and stage sequences.
17. **`app/Http/Controllers/AuthorizationRequestController.php`** — Destructive action workflow.

---

## Part 28 — Executive Summary

**PRISMA in one paragraph:**
PRISMA is an internal research management system for Indonesian university LPPM. It manages the full lifecycle from proposal submission through reviewer assessment, acceptance with official decree (SK), research execution via logbooks, publication, dissemination review, and fund claim/return — for both Penelitian (research) and PkM (community service). Five roles (Superadmin, Staff LPPM, Ketua LPPM, Dosen, Reviewer) each have distinct responsibilities in a multi-stage, multi-party approval workflow with double verification at key gates.

**Frontend:** Next.js App Router with a single `/dashboard` route using client-side module switching via `?module=` query param. Zustand stores for state. Axios with Sanctum cookie auth. Centralized status color mapping. Reusable form hooks (`useFormSubmission`, `useValidation`). Role-based module filtering via `menu.js`.

**Backend:** Laravel with Sanctum SPA auth. 30+ controllers, 31 models, 6 services. Polymorphic relationships for documents, reviewer assignments, and authorization requests. `KegiatanStage` helper manages workflow stage sequences. `NotificationService` for all notification creation with dedup. Three DOCX generation services for proposals, announcements, and final reports.

**Main roles:** Superadmin (full access), Staff LPPM (operational management), Ketua LPPM (approval authority), Dosen (researcher), Reviewer (assessment).

**Core workflow:** Proposal → Double Verification (Ketua + Staff) → Reviewer Assignment → Review → SK Acceptance → Split into Laporan (Ganjil + Genap) → Multi-stage execution (Proses → Publikasi → Diseminasi → Claim Dana → Luaran) → Completion.

**Key models:** Proposal, Laporan, KegiatanPengajuan, PenugasanReviewer, Review, Dokumen, Notification, AuthorizationRequest, Settings.

**Periode logic:** `KegiatanPengajuan` has `effective_status` computed from dates or manual override. `ignore_kegiatan_dates` Settings flag bypasses all date checks. Multiple active periods can coexist.

**Important status rules:** Status strings are exact-match, case-sensitive. `effective_status` is a PHP accessor, not queryable. `completed_at IS NULL` defines active laporans. Proposal `judul` ≠ Laporan `judul_penelitian`.

**Navigation architecture:** Single-route dashboard with `useSearchParams()`. Module keys in `menu.js`. Hidden modules exist for access control. Sidebar uses `setActive()`, deep links use `router.push()`.

**Document architecture:** Polymorphic `Dokumen` container with versioned `DokumenVersion` records. `current_version_id` tracks active version. `DocumentService` handles filesystem. Three DOCX generators use PHPWord templates.

**Most important quirks:** (1) `judul` on Proposal, `judul_penelitian` on Laporan — never mix. (2) POST for all mutations. (3) Dual ownership on PenugasanReviewer (`proposal_id` + polymorphic). (4) Status typos must be preserved. (5) `effective_status` is computed, not stored. (6) AuthorizationRequest required for destructive actions.

**Things another AI must never assume:**
- Never use `$proposal->judul_penelitian` — it's `$proposal->judul`.
- Never use `$laporan->judul` — it's `$laporan->judul_penelitian`.
- Never assume a single KegiatanPengajuan per Skema — there are many.
- Never use SQL WHERE on `effective_status` — filter in PHP.
- Never change status strings without checking all comparison points.
- Never skip the AuthorizationRequest pattern for destructive actions.
- Never use PUT/DELETE for mutations — the API expects POST.
- Never assume `DokumenController` does anything — it's empty.
- Never assume frontend routes exist per module — it's all on `/dashboard`.
- Never assume `ProposalMember.member_id` has a single FK target — it's polymorphic.
