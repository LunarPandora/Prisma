# PRISMA — Sistem Dokumentasi Teknis untuk Tesis

**Versi Dokumentasi:** Agustus 2026
**Berdasarkan:** Implementasi aktual pada commit terkini

---

## 1. System Overview

### 1.1 Purpose

PRISMA (Penelitian dan Pengabdian kepada Masyarakat Management Application) adalah sistem informasi berbasis web untuk mengelola siklus hidup penelitian dan pengabdian kepada masyarakat di institusi pendidikan tinggi. Sistem ini mencakup pengajuan proposal, penugasan dan penilaian reviewer, pengelolaan laporan kemajuan, publikasi, diseminasi, serta alur dana (klaim dan pengembalian).

### 1.2 Technology Stack

| Layer | Technology | Evidence |
|-------|-----------|----------|
| Frontend | Next.js 15 (App Router), React, Zustand | `prisma/package.json`, `prisma/src/app/layout.jsx` |
| UI Components | Tailwind CSS, FontAwesome, react-quill-new (rich text) | `prisma/tailwind.config.js`, komponen di `prisma/src/app/component/` |
| State Management | Zustand (persist untuk user, ephemeral untuk notifikasi/loader) | `prisma/src/app/stores/useUserStore.js`, `useNotificationStore.js`, `useLoaderStore.js` |
| Backend | Laravel 11, PHP 8.2+ | `prisma-server/composer.json` |
| Authentication | Laravel Sanctum (cookie-based, XSRF-TOKEN) | `prisma-server/config/sanctum.php`, `prisma/src/app/component/Libraries/utils/api.js` |
| Database | MariaDB (localhost:3306) | `prisma-server/phpunit.xml` (testing: `prisma_e2e_testing`) |
| File Storage | Laravel public disk (avatars, documents) | `prisma-server/app/Services/DocumentService.php`, `AvatarService.php` |
| PDF Generation | PHPWord (TemplateProcessor) | `prisma-server/app/Services/ProposalDocxService.php`, `PengumumanSuratTugasService.php`, `LaporanAkhirDocxService.php` |
| Image Processing | Intervention Image (GD driver) | `prisma-server/app/Services/AvatarService.php` |
| External APIs | Google Scholar (via SerpAPI) | `prisma-server/app/Services/Scholar/SerpApiProvider.php`, `ScholarSyncService.php` |
| Testing (Backend) | Pest (PHPUnit wrapper) | `prisma-server/tests/Feature/DanaTest.php` |
| Testing (Frontend) | Playwright | `prisma/playwright.config.ts`, `prisma/tests/e2e/` |

### 1.3 High-Level Request/Data Flow

```
Browser (Next.js SSR/CSR)
  → initAuth() → GET /sanctum/csrf-cookie (Sanctum cookie bootstrap)
  → POST /login (credentials) → session cookie established
  → API calls via Axios (withCredentials: true, XSRF-TOKEN header)
    → Laravel Router (auth:sanctum + role: middleware)
      → Controller method
        → Model / Service / Helper
          → Database (MariaDB)
          → Storage (public disk)
          → NotificationService (broadcast to roles/users)
        → ApiResponse::success() / ApiResponse::failed()
  → Frontend renders response (CustomTable, modals, forms)
```

Evidence:
- Axios instance: `prisma/src/app/component/Libraries/utils/api.js:13-19`
- CSRF bootstrap: `prisma/src/app/component/Libraries/utils/api.js:80-82`
- Auth guard: `prisma/src/app/dashboard/layout.jsx`
- Route middleware: `prisma-server/routes/api.php:42`

### 1.4 Authentication Mechanism

Autentikasi menggunakan Laravel Sanctum dalam mode cookie-based:

1. Frontend memanggil `initAuth()` → `GET /sanctum/csrf-cookie` untuk memperoleh XSRF-TOKEN
2. Pengguna mengirim `POST /login` dengan `{email, password}`
3. Backend memanggil `Auth::attempt()`, membuat session, mengembalikan user data `{id, nama, role, avatar_url}`
4. Frontend menyimpan user ke Zustand store (`useUserStore.setUser()`) yang dipersist ke localStorage
5. Semua API request berikutnya menyertakan cookie session + XSRF-TOKEN header
6. Pada 401/419, interceptor Axios memicu `useLoaderStore.start()` + `useUserStore.expiredSession()` → redirect ke `/login`

Evidence:
- Login flow: `prisma/src/app/login/page.jsx`
- Axios interceptor: `prisma/src/app/component/Libraries/utils/api.js:49-68`
- Session guard: `prisma/src/app/dashboard/layout.jsx`
- AuthController: `prisma-server/app/Http/Controllers/AuthController.php`

### 1.5 Role-Based Authorization Mechanism

Otorisasi berbasis peran dilakukan pada dua level:

**Level 1 — Middleware (route-level):**
- `auth:sanctum` diterapkan ke seluruh route API (`routes/api.php:42`)
- `middleware('role:RoleName1,RoleName2')` diterapkan per-route atau per-group
- `CheckRole` middleware (`app/Http/Middleware/CheckRole.php`) memeriksa `$request->user()->role` terhadap daftar peran yang diizinkan

**Level 2 — Controller-level (ownership + stage gate):**
- Dosen: `findOwnedLaporan()` / `findOwnedProposal()` memeriksa `proposal.user_id === auth()->id()`
- Reviewer: `penugasan.user_id === auth()->id()` diperiksa sebelum upload review
- Staff LPPM: `requireStaffLppm()` diperiksa di endpoint yang memerlukan otorisasi Staff
- Stage gate: `KegiatanStage::isOpen()` memeriksa apakah kegiatan aktif dan dalam rentang tanggal

Evidence:
- Middleware: `prisma-server/app/Http/Middleware/CheckRole.php`
- Routes: `prisma-server/routes/api.php:42`
- Ownership checks: `prisma-server/app/Http/Controllers/LaporanController.php` (method `findOwnedLaporan`)
- Stage gate: `prisma-server/app/Helpers/KegiatanStage.php:214-242`

### 1.6 Major Modules

| Modul | Deskripsi |
|-------|-----------|
| Authentication & Role Management | Login, session, role-based access |
| Users & Master Data | CRUD pengguna, prodi, mahasiswa, kolaborator, kategori publikasi |
| Skema & Kegiatan | Pengelolaan skema penelitian dan kegiatan pengajuan |
| Proposal | Alur pengajuan proposal dari Dosen hingga diterima/tolak |
| Reviewer Assignment | Penugasan tepat 3 reviewer untuk proposal/laporan |
| Reviewer Assessment | Form penilaian oleh reviewer dengan kriteria |
| Laporan | Alur laporan kemajuan (Penelitian & PkM) |
| Logbook | Pencatatan kegiatan harian oleh Dosen |
| Publikasi | Pengelolaan publikasi jurnal |
| Diseminasi | Alur persetujuan diseminasi dengan verifikasi ganda |
| Claim Dana | Alur klaim dana (Staff upload, Dosen terima, auto-complete) |
| Pengembalian Dana | Alur pengembalian dana (hanya PkM) |
| Notifications | Sistem notifikasi real-time per peran |
| Monitoring | Dashboard monitoring progres per skema |
| AuthorizationRequest | Alur otorisasi tindakan destruktif (Staff → Ketua) |
| Master Data | Skema, kegiatan, kategori publikasi, prodi |

### 1.7 External/Infrastructure Dependencies

| Dependency | Purpose | Implementation |
|------------|---------|---------------|
| MariaDB | Database utama | Direct connection via Laravel |
| Laravel Sanctum | Autentikasi cookie-based | `config/sanctum.php` |
| Google Scholar | Sinkronisasi profil scholar Dosen | `ScholarSyncService.php` via SerpAPI |
| SerpAPI | Proxy akses Google Scholar | `SerpApiProvider.php` |
| PHPWord | Generasi dokumen DOCX (SK, Proposal, Laporan) | `PengumumanSuratTugasService.php`, `ProposalDocxService.php`, `LaporanAkhirDocxService.php` |
| Intervention Image | Proses avatar (crop, WebP encoding) | `AvatarService.php` |

---

## 2. Project Structure

### 2.1 Backend (Laravel) — `prisma-server/`

```
prisma-server/
├── app/
│   ├── Helpers/
│   │   ├── ApiResponse.php          — Response envelope (success/failed)
│   │   ├── KegiatanStage.php        — Stage sequence & transition engine
│   │   └── NotificationUrl.php      — Deep-link URL builder per role
│   ├── Http/
│   │   ├── Controllers/             — 28 root + 6 Proposal sub-controllers
│   │   │   ├── AuthController.php
│   │   │   ├── AuthorizationRequestController.php
│   │   │   ├── DanaController.php
│   │   │   ├── DiseminasiController.php
│   │   │   ├── LaporanController.php
│   │   │   ├── Proposal/            — 6 sub-controllers
│   │   │   │   ├── ProposalController.php
│   │   │   │   ├── ProposalDraftController.php
│   │   │   │   ├── ProposalDocumentController.php
│   │   │   │   ├── ProposalSeleksiController.php
│   │   │   │   ├── ProposalWorkflowController.php
│   │   │   │   └── PengumumanSuratTugasController.php
│   │   │   └── ... (24 lainnya)
│   │   ├── Middleware/
│   │   │   └── CheckRole.php        — Role authorization middleware
│   │   └── Resources/               — 16 API resource transformers
│   ├── Models/                      — 31 Eloquent models
│   ├── Services/
│   │   ├── DocumentService.php      — File upload/delete/replace
│   │   ├── NotificationService.php  — Notification CRUD + broadcast
│   │   ├── AvatarService.php        — Avatar upload/generate
│   │   ├── PengumumanSuratTugasService.php — SK DOCX generation
│   │   ├── ProposalDocxService.php  — Proposal DOCX generation
│   │   ├── LaporanAkhirDocxService.php — Laporan DOCX generation
│   │   └── Scholar/                 — Google Scholar integration
│   ├── Jobs/
│   │   └── SyncScholarProfile.php   — Queued job for scholar sync
│   └── Console/Commands/
│       └── SyncScholarProfilesWeekly.php
├── database/
│   ├── migrations/                  — 86 migration files
│   ├── seeders/                     — 7 seeder files (DB + E2E + Dana)
│   └── factories/                   — UserFactory
├── routes/
│   └── api.php                      — 463 lines, 25 route groups
├── tests/
│   └── Feature/DanaTest.php         — 16 Pest tests (Dana workflow)
├── scripts/
│   └── e2e-reset.sh                 — DB reset per role for E2E
└── config/sanctum.php               — Sanctum configuration
```

### 2.2 Frontend (Next.js) — `prisma/`

```
prisma/src/app/
├── layout.jsx                       — Root layout (Outfit font, AppLoader)
├── login/page.jsx                   — Login form
├── stores/
│   ├── useUserStore.js              — Auth state (persisted to localStorage)
│   ├── useNotificationStore.js      — Notification count/list
│   └── useLoaderStore.js            — Loading animation state
├── dashboard/
│   ├── layout.jsx                   — Auth guard, session redirect
│   ├── page.jsx                     — Dashboard router (module selection)
│   └── pages/
│       ├── Home/components/         — 16 role-specific dashboard widgets
│       ├── Admin/                   — Staff LPPM / Ketua LPPM pages
│       │   ├── MonitoringPengajuan/
│       │   │   ├── page.jsx         — Skema selection + Proposal/Laporan views
│       │   │   ├── Proposal/page.jsx — Staff/Ketua proposal monitoring
│       │   │   ├── Laporan/page.jsx  — Staff/Ketua laporan monitoring
│       │   │   ├── Dana/page.jsx     — Staff dana monitoring
│       │   │   └── AuthorizationQueue.jsx — Ketua authorization panel
│       │   ├── Users/               — User CRUD (Superadmin)
│       │   ├── Prodi/               — Prodi CRUD (Superadmin)
│       │   ├── Skema/Kegiatan/      — Skema & Kegiatan management
│       │   ├── Kolaborator/         — Kolaborator management
│       │   ├── Mahasiswa/           — Mahasiswa management
│       │   └── Pengaturan/          — Settings (Superadmin)
│       ├── Dosen/                   — Dosen pages
│       │   ├── MonitoringPengajuan/
│       │   │   ├── Proposal/        — Dosen proposal management
│       │   │   └── Laporan/         — Dosen laporan management
│       │   ├── Profil/              — Dosen profile
│       │   └── GoogleScholar/       — Scholar integration
│       ├── Ketua/                   — Ketua LPPM pages
│       │   ├── Criteria/            — Kriteria penilaian
│       │   ├── KegiatanEdit/        — Kegiatan edit authorization
│       │   └── Pengaturan/          — Pengaturan (ignore dates)
│       ├── Reviewer/Review/         — Reviewer assessment page
│       └── Notification/            — Notification history
└── component/
    ├── Libraries/
    │   ├── api/                     — 22 API client modules (~95 functions)
    │   ├── config/                  — 18 menu/status config files
    │   ├── hooks/                   — 5 custom hooks
    │   ├── utils/                   — api.js, menu.js, date.js, query.js
    │   └── options/                 — kriteria options, selections
    ├── Table/CustomTable            — Data table component
    ├── Modal/                       — Modal, FormModal, ConfirmModal
    ├── Inputs/                      — 10 input components
    ├── Tags/                        — TextTag, Badge components
    ├── Display/                     — Badge, StatusBadge
    └── Toast/                       — Toast notifications
```

### 2.3 Key Relationships Between Layers

| Frontend | Backend | Purpose |
|----------|---------|---------|
| `component/Libraries/api/*.js` | `routes/api.php` → Controller | API client → Route → Controller |
| `component/Libraries/config/Laporan/StaffLaporanMenu.js` | `DanaController`, `DiseminasiController`, `AuthorizationRequestController` | Row action definitions → Backend endpoints |
| `component/Libraries/config/statusColors.js` | `KegiatanStage.php` (sequences) | Status labels ↔ Stage sequences |
| `stores/useUserStore.js` | `AuthController.php` | Auth state ↔ Session management |
| `dashboard/layout.jsx` | `auth:sanctum` middleware | Client-side auth guard ↔ Server-side auth |

---

## 3. Actor and Permission Matrix

### 3.1 Role Definitions

| Role | Constant | Description | Source |
|------|----------|-------------|--------|
| Superadmin | `Superadmin` | System administrator, full authority | `User::ROLE_SUPERADMIN` |
| Staff LPPM | `Staff LPPM` | Operational staff, processes proposals/reports | `User::ROLE_STAFF_LPPM` |
| Ketua LPPM | `Ketua LPPM` | Department head, decision-maker/authorizer | `User::ROLE_KETUA_LPPM` |
| Dosen | `Dosen` | Researcher/faculty member | `User::ROLE_DOSEN` |
| Reviewer | `Reviewer` | External/internal peer reviewer | `User::ROLE_REVIEWER` |

### 3.2 Permission Matrix

| Role | Modul | Actions | Prohibited | Implementation |
|------|-------|---------|------------|----------------|
| **Superadmin** | Users | CRUD (add/update/delete) | — | `role:Superadmin` middleware (`routes/api.php:68`) |
| | Prodi | CRUD | — | `role:Superadmin` middleware (`routes/api.php:132`) |
| | Publication Category | CRUD | — | `role:Superadmin,Staff LPPM` (`routes/api.php:378`) |
| | Settings | Update (kepala LPPM, rektor, nama kampus) | Update ignore_kegiatan_dates | `role:Superadmin` (`routes/api.php:365`) |
| | Monitoring | Read-only | All mutations | Module access read-only (`menu.js:109`) |
| **Staff LPPM** | Monitoring Progress | Read + Process (assign reviewer, approve/reject, upload bukti transfer) | Delete skema/kegiatan | `role:Staff LPPM` + ownership checks |
| | Kolaborator | CRUD | — | `role:Staff LPPM` (`routes/api.php:145`) |
| | Kriteria Penilaian | Update | — | `role:Staff LPPM` (`routes/api.php:408`) |
| | AuthorizationRequest | Create (initiate destructive actions) | Approve/reject | `role:Staff LPPM` (`routes/api.php:424`) |
| | Dana (Claim) | Upload bukti transfer, confirm | Dosen proof upload | `role:Staff LPPM` (`routes/api.php:257`) |
| | Diseminasi | Approve/reject (staff step) | Final decision | `role:Staff LPPM` (`routes/api.php:249`) |
| | Reviewer Assignment | Assign exactly 3 reviewers | Modify after review started | `role:Staff LPPM` (`routes/api.php:412`) |
| **Ketua LPPM** | Monitoring Progress | Read-only (most stages) | Mutations at most stages | Module access (`menu.js:165-183`) |
| | Skema | CRUD | — | `role:Ketua LPPM` (`routes/api.php:159`) |
| | Kegiatan | Create/Update/Delete | — | `role:Staff LPPM,Ketua LPPM` (`routes/api.php:390`) |
| | Proposal Seleksi | Approve (first gate) | Reject (creates AuthRequest) | `role:Ketua LPPM` (`routes/api.php:185`) |
| | Proposal Normal Decision | Accept (via SK upload) / Reject | — | `ProposalSeleksiController@ketuaDecide` |
| | Diseminasi | Approve (first gate), Final decision | — | `role:Ketua LPPM` (`routes/api.php:247`) |
| | AuthorizationRequest | Approve/reject destructive requests | Create requests | `role:Ketua LPPM` (`routes/api.php:426`) |
| | Settings | Update ignore_kegiatan_dates | Other settings | `role:Ketua LPPM` (`routes/api.php:370`) |
| | Dana | Read-only | All mutations | Module read-only (`menu.js:165`) |
| **Dosen** | Proposal | Create draft, upload, edit (ownership) | Approve/reject any proposal | Ownership: `proposal.user_id === auth()->id()` |
| | Laporan | Update, upload dokumen, finish, submit publikasi (ownership) | Approve/reject laporan | Ownership: `findOwnedLaporan()` |
| | Logbook | Full CRUD (ownership) | — | Ownership check in controller |
| | Dana (Claim) | Upload bukti penerimaan (ownership) | Confirm/skip | Ownership + Dosen role guard |
| | Dana (Pengembalian) | Upload bukti pengembalian (ownership) | Confirm/skip/request | Ownership + Dosen role guard |
| | Sitasi | CRUD (ownership) | — | Ownership check |
| | Google Scholar | Connect, sync, view publications | — | Dosen role (`routes/api.php:390`) |
| | Profil Peneliti | View, update (ownership) | — | Ownership check |
| **Reviewer** | Proposal | View assigned proposals, upload review | View unassigned, modify others | `penugasan.user_id === auth()->id()` |
| | Laporan | View assigned laporan, upload review | View unassigned, modify others | `penugasan.user_id === auth()->id()` |
| | Monitoring | Read-only | All mutations | Module read-only |

### 3.3 Staff vs. Ketua Responsibility Separation

| Responsibility | Staff LPPM | Ketua LPPM |
|----------------|-----------|------------|
| Normal decision gate (Proposal Seleksi) | Second gate (after Ketua) | First gate |
| Normal decision gate (Diseminasi) | Second gate (after Ketua) | First gate |
| Normal decision gate (Proposal acceptance via SK) | Upload SK | Accept proposal |
| Reviewer assignment | Assign exactly 3 | Read-only |
| Dana operations | Upload bukti, confirm, request, skip | Read-only |
| AuthorizationRequest | Initiate (create) | Approve/reject |
| Skema management | Read-only | CRUD |
| Kegiatan management | Create/Update | Create/Update/Delete |
| Kriteria penilaian | Update (settings-based) | Read-only |
| Settings | Read-only | Update ignore_kegiatan_dates |

### 3.4 Reviewer Data Isolation

Reviewer hanya dapat melihat proposal/laporan yang ditugaskan kepada mereka:

- Proposal: `PenugasanReviewer` WHERE `reviewable_type = Proposal` AND `user_id = auth()->id()`
- Laporan: `PenugasanReviewer` WHERE `reviewable_type = Laporan` AND `user_id = auth()->id()`

Evidence: `PenugasanReviewerController.php` — `assignReviewers()` uses `reviewable_type` + `reviewable_id`; `ReviewController@store()` checks `penugasan.user_id === auth()->id()`

### 3.5 Dosen Ownership Restrictions

Dosen hanya dapat mengakses data miliknya sendiri:

- Proposal: `proposal.user_id === auth()->id()`
- Laporan: `laporan.proposal.user_id === auth()->id()`
- Logbook: `logbook.user_id === auth()->id()`
- Sitasi: `sitasi.laporan.proposal.user_id === auth()->id()`
- Dokumen: melalui ownership laporan/proposal

Implementation: `findOwnedProposal()`, `findOwnedLaporan()` methods di controller yang menggunakan `where('user_id', auth()->id())`.

### 3.6 Ketua Read-Only Access to Funding Documents

Ketua LPPM memiliki akses read-only ke dokumen dana:

- Module `staffmonitoringprogress` → access `{create: false, read: true, update: true, delete: true}` — namun row actions dibatasi
- Dana page (`Dana/page.jsx`): Staff LPPM role-only actions (upload bukti, request pengembalian)
- Backend: `DanaController` endpoints untuk mutations menggunakan `role:Staff LPPM` middleware
- Ketua hanya dapat melihat via `GET /dana/` (index endpoint, no role restriction beyond auth)

Evidence: `prisma-server/routes/api.php:257-268`, `DanaAdminMenu.js`

---

## 4. Functional Module Inventory

### 4.1 Authentication

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Mengelola autentikasi pengguna dan manajemen session |
| **Actors** | Semua pengguna |
| **Frontend** | `src/app/login/page.jsx` |
| **API Endpoints** | `POST /login` (public), `POST /logout` (authenticated) |
| **Backend** | `AuthController.php` (login, logout) |
| **Related Models** | `User` |
| **Auth Mechanism** | Laravel Sanctum cookie-based with XSRF-TOKEN |

### 4.2 Users & Roles

| Attribute | Detail |
|-----------|--------|
| **Purpose** | CRUD pengguna dan manajemen peran |
| **Actors** | Superadmin (write), Semua LPPM (read) |
| **Frontend** | `src/app/dashboard/pages/Admin/Users/page.jsx`, `UserForm.jsx` |
| **API Endpoints** | `GET /users/`, `GET /users/fetch`, `POST /users/add`, `POST /users/update`, `DELETE /users/delete/{id}` |
| **Backend** | `UserController.php` |
| **Related Models** | `User`, `Prodi` |
| **Validations** | Email unique, password min 8, role in enum, NIDN/NUPTK unique, status enum |
| **Role Enum** | `Superadmin`, `Staff LPPM`, `Ketua LPPM`, `Dosen`, `Reviewer`, `Rektorat` |

### 4.3 Skema & Kegiatan

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Pengelolaan skema penelitian dan kegiatan pengajuan |
| **Actors** | Ketua LPPM (CRUD skema), Staff LPPM + Ketua (kegiatan) |
| **Frontend** | `Admin/Skema/page.jsx`, `Admin/Skema/Kegiatan/page.jsx` |
| **API Endpoints** | `GET/POST /skema/*`, `GET/POST /kegiatan/*`, `DELETE /kegiatan/delete/{id}` |
| **Backend** | `SkemaController.php`, `KegiatanPengajuanController.php` |
| **Related Models** | `Skema`, `KegiatanPengajuan` |
| **Status Enum (Skema)** | `Draft`, `Aktif`, `Selesai` |
| **Status Enum (Kegiatan)** | `Belum dibuka`, `Terbuka`, `Selesai` |
| **Computed Status** | `effective_status` — dihitung dari tanggal jika `manual_status_override=false` |
| **Unique Constraint** | `(skema_id, jenis_penelitian, kode_kegiatan)` |

### 4.4 Proposal

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Mengelola siklus hidup proposal penelitian/PkM |
| **Actors** | Dosen (create/upload), Ketua LPPM (decide seleksi, accept/reject), Staff LPPM (process), Reviewer (assess) |
| **Frontend** | `Dosen/MonitoringPengajuan/Proposal/page.jsx`, `Admin/MonitoringPengajuan/Proposal/page.jsx` |
| **API Endpoints** | `GET /proposal/`, `POST /proposal/draft/add`, `POST /proposal/draft/update`, `POST /proposal/upload/prepare`, `POST /proposal/upload/store`, `POST /proposal/update`, `POST /proposal/delete`, `POST /proposal/seleksi/ketua-decide`, `POST /proposal/seleksi/staff-decide`, `POST /proposal/sk/*` |
| **Backend** | `ProposalController.php`, `ProposalDraftController.php`, `ProposalDocumentController.php`, `ProposalWorkflowController.php`, `ProposalSeleksiController.php`, `PengumumanSuratTugasController.php` |
| **Related Models** | `Proposal`, `ProposalMember`, `KegiatanPengajuan`, `Dokumen`, `PenugasanReviewer`, `Review` |
| **Status Enum** | `Draft`, `Ditarik`, `Ditolak`, `Menunggu proposal untuk diupload`, `Menunggu review dari Ketua LPPM`, `Menunggu review Staff LPPM`, `Menunggu penugasan reviewer`, `Menunggu review`, `Menunggu persetujuan Ketua LPPM`, `Proposal Diterima`, `Dalam pengerjaan`, `Revisi` |
| **Seleksi Flags** | `ketua_seleksi_approved` (boolean), `staff_seleksi_approved` (boolean) |

### 4.5 Reviewer Assignment

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Menugaskan tepat 3 reviewer unik untuk proposal/laporan |
| **Actors** | Staff LPPM (assign + confirm) |
| **Frontend** | `Admin/MonitoringPengajuan/Proposal/PenugasanReviewerForm.jsx` |
| **API Endpoints** | `POST /penugasan/assign`, `POST /penugasan/confirm-assignment` |
| **Backend** | `PenugasanReviewerController.php` |
| **Related Models** | `PenugasanReviewer`, `Review` |
| **Constraint** | Exactly 3 unique reviewers required |
| **Lock** | Cannot change reviewer after `status_review === 'Telah direview'` |
| **Prerequisites** | Proposal: `isSeleksiFullyApproved()` must be true. Laporan: `isDiseminasiFullyApproved()` must be true |

### 4.6 Reviewer Assessment

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Penilaian proposal/laporan oleh reviewer |
| **Actors** | Reviewer (upload review) |
| **Frontend** | `Reviewer/Review/page.jsx`, `PenilaianForm.jsx` |
| **API Endpoints** | `POST /review/upload` |
| **Backend** | `ReviewController.php` |
| **Related Models** | `Review`, `PenugasanReviewer` |
| **Form Fields** | `keputusan` (Diterima/Diterima dengan perbaikan/Ditolak), `catatan`, `kriteria_kesesuaian_tema` (JSON), `kriteria_penilaian` (JSON) |
| **Completion** | When all 3 reviewers submit: Proposal → `Menunggu persetujuan Ketua LPPM`. Laporan → `Menunggu keputusan Ketua` |
| **Concurrency** | `DB::transaction` + `lockForUpdate()` on penugasan list |

### 4.7 Laporan

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Mengelola laporan kemajuan penelitian/PkM |
| **Actors** | Dosen (update, upload, finish, publikasi), Staff LPPM (process, approve/reject diseminasi), Ketua LPPM (approve/reject) |
| **Frontend** | `Dosen/MonitoringPengajuan/Laporan/page.jsx`, `Admin/MonitoringPengajuan/Laporan/page.jsx` |
| **API Endpoints** | `GET /laporan/`, `POST /laporan/update`, `POST /laporan/upload-dokumen`, `POST /laporan/finish`, `POST /laporan/generate-laporan-akhir`, `POST /laporan/publikasi`, `POST /laporan/decide` |
| **Backend** | `LaporanController.php`, `LaporanMemberController.php`, `RealisasiAnggaranController.php` |
| **Related Models** | `Laporan`, `LaporanMember`, `RealisasiAnggaran`, `Dokumen`, `LogbookPengerjaan`, `Sitasi` |
| **Status Enum** | `Belum dimulai`, `Dalam pengerjaan`, `Menunggu kelengkapan data`, `Menunggu review Admin`, `Menunggu review Staff LPPM`, `Menunggu review`, `Menunggu hasil dari Reviewers`, `Menuggu penugasan Reviewer`, `Menunggu keputusan Ketua`, `Menunggu Persetujuan Ketua LPPM`, `Menunggu konfirmasi pengiriman dana`, `Menunggu konfirmasi penerimaan dana`, `Revisi`, `Selesai` |
| **Unique Constraint** | `(proposal_id, semester)` |

### 4.8 Logbook

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Pencatatan kegiatan harian selama pengerjaan laporan |
| **Actors** | Dosen (CRUD, ownership) |
| **Frontend** | `Dosen/MonitoringPengajuan/Laporan/LogbookForm.jsx`, `LogbookView.jsx`, `LogbookViewDosen.jsx` |
| **API Endpoints** | `GET /logbook_pengerjaan/`, `POST /logbook_pengerjaan/`, `PUT /logbook_pengerjaan/{id}`, `DELETE /logbook_pengerjaan/{id}`, `POST /logbook_pengerjaan/replace-document` |
| **Backend** | `LogbookPengerjaanController.php` |
| **Related Models** | `LogbookPengerjaan`, `Laporan` |
| **Ownership** | `logbook.user_id === auth()->id()` |

### 4.9 Publikasi

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Pengelolaan publikasi jurnal dari hasil penelitian |
| **Actors** | Dosen (submit via PublikasiForm) |
| **Frontend** | `Dosen/MonitoringPengajuan/Laporan/PublikasiForm.jsx` |
| **API Endpoints** | `POST /laporan/publikasi` (submit), `POST /laporan/generate-laporan-akhir` (generate DOCX), `POST /laporan/update` (update metadata) |
| **Backend** | `LaporanController.php` (submitPublikasi, generateLaporanAkhir, update) |
| **Related Models** | `Laporan`, `Publication`, `PublicationCategory` |
| **Wizard Steps** | 6 steps: Simpan Data → Anggota → Realisasi Anggaran → Generate Template → Upload Final → Link Tambahan |

### 4.10 Diseminasi

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Alur persetujuan diseminasi dengan verifikasi ganda |
| **Actors** | Ketua LPPM (approve/reject, first gate + final decision), Staff LPPM (approve/reject, second gate + assign reviewers) |
| **Frontend** | `Admin/MonitoringPengajuan/Laporan/page.jsx` (tab Diseminasi) |
| **API Endpoints** | `POST /diseminasi/approve`, `POST /diseminasi/staff-decide`, `POST /diseminasi/final-decision` |
| **Backend** | `DiseminasiController.php` |
| **Related Models** | `Laporan`, `PenugasanReviewer`, `Review` |
| **Approval Chain** | 1. Ketua approves → 2. Staff approves → 3. 3 Reviewers assigned + complete → 4. Ketua final decision |
| **Flags** | `ketua_diseminasi_approved`, `staff_diseminasi_approved` |

### 4.11 Claim Dana

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Alur klaim dana untuk Penelitian dan PkM |
| **Actors** | Staff LPPM (upload bukti transfer, confirm), Dosen (upload bukti penerimaan) |
| **Frontend** | `Admin/MonitoringPengajuan/Dana/page.jsx` (Staff), `Dosen/MonitoringPengajuan/Laporan/TransferProofForm.jsx` (Dosen) |
| **API Endpoints** | `POST /dana/claim/upload-bukti-transfer`, `POST /dana/claim/upload-bukti-terima`, `POST /dana/claim/confirm` |
| **Backend** | `DanaController.php` |
| **Related Models** | `Laporan`, `Dokumen` (polymorphic) |
| **Flow** | 1. Staff upload bukti transfer → status: "Menunggu bukti terima" → 2. Dosen upload bukti terima → status: "Menunggu konfirmasi admin" → 3. Staff confirm → auto-complete → advance stage |
| **Document Types** | "Bukti Transfer Klaim Dana", "Bukti Penerimaan Klaim Dana" |
| **Status Field** | `claim_dana_status` on laporan |

### 4.12 Pengembalian Dana (PkM Only)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Alur pengembalian dana untuk PkM |
| **Actors** | Staff LPPM (request, confirm, skip), Dosen (upload bukti pengembalian) |
| **Frontend** | `Admin/MonitoringPengajuan/Dana/page.jsx` (Staff), `Dosen/MonitoringPengajuan/Laporan/TransferProofForm.jsx` (Dosen) |
| **API Endpoints** | `POST /dana/pengembalian/request`, `POST /dana/pengembalian/upload-proof`, `POST /dana/pengembalian/confirm`, `POST /dana/pengembalian/skip` |
| **Backend** | `DanaController.php` |
| **Related Models** | `Laporan`, `Dokumen` (polymorphic) |
| **Flow** | 1. Staff request → status: "Menunggu Pengembalian Dana" → 2. Dosen upload bukti → status: "Menunggu konfirmasi admin" → 3. Staff upload bukti penerimaan + confirm → auto-complete → advance stage |
| **Skip Branch** | Staff skip (no remaining funds) → status: "Dilewati" → advance stage |
| **Document Types** | "Bukti Transfer Pengembalian", "Bukti Penerimaan Pengembalian" |
| **Status Field** | `pengembalian_dana_status` on laporan |

### 4.13 Notifications

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Sistem notifikasi peristiwa workflow |
| **Actors** | Semua pengguna (ownership-based) |
| **Frontend** | `Notification/page.jsx`, bell icon in navbar |
| **API Endpoints** | `GET /notifications/`, `GET /notifications/unread-count`, `PUT /notifications/read-all`, `PUT /notifications/{id}/read`, `DELETE /notifications/{id}` |
| **Backend** | `NotificationController.php`, `NotificationService.php` |
| **Related Models** | `Notification` |
| **Key Dedup** | `key` column (unique) prevents duplicate notifications |
| **Role Broadcast** | `NotificationService::createForRole()` sends to all users with given role |
| **URL Builder** | `NotificationUrl::forRole()` generates deep-link URLs per role |

### 4.14 Monitoring

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Dashboard monitoring progres per skema |
| **Actors** | Semua pengguna (role-filtered) |
| **Frontend** | `Admin/MonitoringPengajuan/page.jsx` (Staff/Ketua), `Dosen/MonitoringPengajuan/page.jsx` (Dosen) |
| **API Endpoints** | `GET /dashboard/{role}` (role-specific dashboard data) |
| **Backend** | `DashboardController.php` |
| **Related Models** | Various (aggregated queries) |

### 4.15 AuthorizationRequest

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Otorisasi tindakan destruktif dengan prinsip dua orang (two-person integrity) |
| **Actors** | Staff LPPM (initiate), Ketua LPPM (authorize) |
| **Frontend** | `Admin/MonitoringPengajuan/AuthorizationQueue.jsx` |
| **API Endpoints** | `GET /authorization-request/`, `POST /authorization-request/`, `POST /authorization-request/authorize` |
| **Backend** | `AuthorizationRequestController.php` |
| **Related Models** | `AuthorizationRequest` (polymorphic: Proposal or Laporan) |
| **Status Enum** | `Menunggu Persetujuan`, `Disetujui`, `Ditolak` |
| **Action Types** | `delete`, `return`, `reject`, `return_diseminasi`, `return_seleksi`, `reject_proposal`, `return_proposal_for_revision`, `return_laporan_for_revision` |

### 4.16 Master Data

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Pengelolaan data referensi |
| **Actors** | Superadmin (users, prodi), Staff LPPM (kolaborator, kategori publikasi), Ketua LPPM (skema) |
| **Frontend** | `Admin/Users/`, `Admin/Prodi/`, `Admin/Kolaborator/`, `Admin/Mahasiswa/`, `Admin/Pengaturan/KategoriPublikasi/` |
| **API Endpoints** | Various CRUD endpoints per module |
| **Backend** | `UserController`, `ProdiController`, `KolaboratorController`, `MahasiswaController`, `PublicationCategoryController` |

---

## 5. Proposal Workflow

### 5.1 Proposal Lifecycle State Machine

```
DRAFT (created by Dosen)
  │
  ▼
Menunggu proposal untuk diupload (after draft saved)
  │
  ▼ [Dosen uploads]
Menunggu review dari Ketua LPPM (Ketua first check)
  │
  ├── [Ketua accept] → Menunggu review Staff LPPM
  │                      │
  │                      ├── [Staff accept] → Menunggu penugasan reviewer
  │                      │                      │
  │                      │                      ▼ [3 reviewers assigned + confirm]
  │                      │                    Menunggu review (reviewers work)
  │                      │                      │
  │                      │                      ▼ [all 3 reviews complete]
  │                      │                    Menunggu persetujuan Ketua LPPM
  │                      │                      │
  │                      │                      ├── [Ketua accept + SK upload] → Proposal Diterima
  │                      │                      │                                 │
  │                      │                      │                                 ▼ [PengumumanSuratTugas]
  │                      │                      │                               PENGUMUMAN_SURAT_TUGAS
  │                      │                      │                                 │
  │                      │                      │                                 ▼ [Laporan created]
  │                      │                      │                               Dalam pengerjaan
  │                      │                      │
  │                      │                      └── [Ketua reject] → Ditolak (soft delete)
  │                      │
  │                      ├── [Staff reject] → AuthorizationRequest → Ketua authorize
  │                      │                      → Ditolak (soft delete)
  │                      │
  │                      └── [Staff return] → AuthorizationRequest → Ketua authorize
  │                                            → Revisi (status)
  │
  └── [Ketua reject] → Ditolak (soft delete)
```

### 5.2 Detailed Stage Transitions

| Stage | Actor | Action | Controller Method | Transition | Validation |
|-------|-------|--------|-------------------|------------|------------|
| Draft | Dosen | Create/update draft | `ProposalDraftController@createDraft/updateDraft` | Creates/updates Proposal record | `user_id = auth()->id()` |
| Menunggu upload | Dosen | Upload proposal | `ProposalDocumentController@uploadProposal` | Status unchanged (stays at "Menunggu proposal untuk diupload") | File validation (PDF, max 10MB) |
| Menunggu review dari Ketua | Ketua LPPM | Accept | `ProposalSeleksiController@ketuaDecide` | `ketua_seleksi_approved = true`, status → "Menunggu review Staff LPPM" | `role:Ketua LPPM` |
| Menunggu review dari Ketua | Ketua LPPM | Reject | `ProposalSeleksiController@ketuaDecide` | Status → "Ditolak" (soft delete) | `role:Ketua LPPM` |
| Menunggu review Staff | Staff LPPM | Accept | `ProposalSeleksiController@staffDecide` | `staff_seleksi_approved = true`, status → "Menunggu penugasan reviewer" | Requires `ketua_seleksi_approved = true` |
| Menunggu review Staff | Staff LPPM | Reject | `ProposalSeleksiController@staffDecide` | Creates `AuthorizationRequest` (action: `return_proposal_for_revision` or `reject_proposal`) | `role:Staff LPPM` |
| Menunggu penugasan | Staff LPPM | Assign reviewers | `PenugasanReviewerController@confirmAssignment` | Status → "Menunggu review" + `kegiatan_id` updated | Exactly 3 unique reviewers, `isSeleksiFullyApproved()` |
| Menunggu review | Reviewer | Upload review | `ReviewController@store` | `status_review` → "Telah direview" | Ownership check, `DB::transaction` + `lockForUpdate` |
| All reviews complete | System | Auto-complete | `ReviewController@store` (after 3rd review) | Status → "Menunggu persetujuan Ketua LPPM" | All 3 penugasan have `status_review = "Telah direview"` |
| Menunggu persetujuan Ketua | Ketua | Accept + upload SK | `PengumumanSuratTugasController@acceptProposal` | Status → "Proposal Diterima" | File: PDF, max 10MB |
| Proposal Diterima | System | Advance | `PengumumanSuratTugasController@acceptProposal` | `kegiatan_id` → PENGUMUMAN_SURAT_TUGAS → creates Laporan | — |

### 5.3 Exactly-Three-Reviewer Enforcement

```php
// PenugasanReviewerController@assignReviewers
if (count($validated['reviewer_id']) !== 3) {
    return ApiResponse::failed('Harus ada tepat 3 reviewer.');
}

// PenugasanReviewerController@confirmAssignment
if (count($validated['reviewer_id']) !== 3) {
    return ApiResponse::failed('Harus ada tepat 3 reviewer yang ditugaskan.');
}
```

Evidence: `prisma-server/app/Http/Controllers/PenugasanReviewerController.php`

### 5.4 Proposal vs PkM Differences

| Aspect | Penelitian | PkM |
|--------|-----------|-----|
| Laporan first stage | `PROSES_PENELITIAN_*` | `CLAIM_DANA_*` |
| Dana sequence | Claim Dana at end (after Diseminasi) | Claim Dana at start, Pengembalian Dana after Publikasi |
| jenis_penelitian_gan/gen | Both set to 'Penelitian' | One or both set to 'PkM' |

---

## 6. Reviewer Workflow

### 6.1 Assignment Structure

```
Staff LPPM
  │
  ▼ POST /penugasan/assign (save draft)
  │  validates: exactly 3 unique reviewers
  │  validates: no existing review started
  │  validates: isSeleksiFullyApproved() or isDiseminasiFullyApproved()
  │
  ▼ POST /penugasan/confirm-assignment (submit)
  │  validates: same constraints
  │  creates PenugasanReviewer records (3 rows)
  │  updates Proposal/Laporan status
  │  notifies each reviewer + Dosen
  │
  ▼ 3 PenugasanReviewer records created
     each with status_review = "Belum direview"
```

### 6.2 Exactly-Three Enforcement

The system requires exactly 3 unique reviewers at two checkpoints:

1. **Assignment** (`assignReviewers`): `count($validated['reviewer_id']) !== 3` → error
2. **Confirmation** (`confirmAssignment`): Same validation before creating records

### 6.3 Reviewer Access Isolation

- Each reviewer sees only their assigned proposals/laporans
- `PenugasanReviewer` → `user_id = auth()->id()` filter
- Reviewer cannot view unassigned items
- Reviewer cannot modify others' reviews

### 6.4 Review Form and Assessment Storage

```php
// ReviewController@store
$review = Review::create([
    'penugasan_id' => $validated['penugasan_id'],
    'keputusan' => $validated['keputusan'],
    'kriteria_kesesuaian_tema' => $validated['kriteria_kesesuaian_tema'], // JSON
    'kriteria_penilaian' => $validated['kriteria_penilaian'], // JSON
    'catatan' => $validated['catatan'],
    'tgl_review' => now(),
]);

// Update penugasan status
$penugasan->update(['status_review' => 'Telah direview']);
```

### 6.5 Completion Calculation

After each review upload, the system checks if all 3 reviewers have submitted:

```php
$allDone = $penugasanList->every(fn($p) => $p->status_review === 'Telah direview');

if ($allDone) {
    // Proposal: status → "Menunggu persetujuan Ketua LPPM"
    // Laporan: status → "Menunggu keputusan Ketua"
}
```

### 6.6 Why Cannot Advance at 1/3 or 2/3

The system requires all 3 reviewers to complete before advancing. This is enforced by the completion check in `ReviewController@store`:

```php
if ($allDone) {
    // Only then update status
}
```

Partial completion does not trigger any status change.

### 6.7 Differences Between Proposal and Laporan Reviews

| Aspect | Proposal Review | Laporan Review |
|--------|----------------|----------------|
| Trigger | After reviewer assignment in SELEKSI_PROPOSAL | After reviewer assignment in DISEMINASI |
| Completion status | "Menunggu persetujuan Ketua LPPM" | "Menunggu keputusan Ketua" |
| Next action | Ketua accepts via SK upload | Ketua final decision (accept/reject) |
| reviewable_type | `App\Models\Proposal` | `App\Models\Laporan` |

---

## 7. Laporan Workflows

### 7.1 Stage Sequences

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

Evidence: `prisma-server/app/Helpers/KegiatanStage.php:55-77`

### 7.2 Penelitian Stage Details

| Stage | Actor | Actions | Documents | Status Field | Transition | Ketua Role |
|-------|-------|---------|-----------|-------------|------------|------------|
| Proses Penelitian | Dosen | Update laporan, upload dokumen, manage logbook | Various research docs | `status` (Laporan) | `finish()` → advance to Publikasi | Read-only monitor |
| Publikasi | Dosen | Generate laporan akhir (DOCX), submit publikasi (PDF), manage realisasi anggaran | "Dokumen Laporan Final" | `status` | `submitPublikasi()` → advance to Diseminasi (or Pengembalian Dana for PkM) | Read-only monitor |
| Diseminasi | Ketua (first gate), Staff (second gate), 3 Reviewers, Ketua (final) | Double-verification approval chain | Publication proof | `ketua_diseminasi_approved`, `staff_diseminasi_approved`, `status` | `finalDecision()` → advance to Claim Dana | Decision-maker (first gate + final) |
| Claim Dana | Staff (upload bukti transfer), Dosen (upload bukti terima), Staff (confirm) | File upload + auto-complete | "Bukti Transfer Klaim Dana", "Bukti Penerimaan Klaim Dana" | `claim_dana_status` | Auto-advance on both proofs | Read-only monitor |
| Luaran | System | Terminal stage | — | `completed_at` set | — | — |

### 7.3 PkM Stage Details

| Stage | Actor | Actions | Documents | Status Field | Transition | Ketua Role |
|-------|-------|---------|-----------|-------------|------------|------------|
| Claim Dana | Staff (upload bukti transfer), Dosen (upload bukti terima), Staff (confirm) | File upload + auto-complete | "Bukti Transfer Klaim Dana", "Bukti Penerimaan Klaim Dana" | `claim_dana_status` | Auto-advance on both proofs | Read-only monitor |
| Proses PkM | Dosen | Update laporan, upload dokumen, manage logbook | Various research docs | `status` | `finish()` → advance to Publikasi | Read-only monitor |
| Publikasi | Dosen | Generate laporan akhir (DOCX), submit publikasi (PDF) | "Dokumen Laporan Final" | `status` | `submitPublikasi()` → advance to Pengembalian Dana | Read-only monitor |
| Pengembalian Dana | Staff (request), Dosen (upload bukti), Staff (confirm or skip) | File upload + auto-complete OR skip | "Bukti Transfer Pengembalian", "Bukti Penerimaan Pengembalian" | `pengembalian_dana_status` | Auto-advance on both proofs OR skip | Read-only monitor |
| Diseminasi | Ketua (first gate), Staff (second gate), 3 Reviewers, Ketua (final) | Double-verification approval chain | Publication proof | `ketua_diseminasi_approved`, `staff_diseminasi_approved`, `status` | `finalDecision()` → advance to Luaran PkM | Decision-maker (first gate + final) |
| Luaran PkM | System | Terminal stage | — | `completed_at` set | — | — |

### 7.4 Ketua Authority at Each Stage

| Stage | Ketua Authority |
|-------|----------------|
| Proses Penelitian/PkM | Read-only monitor (view logbook only) |
| Publikasi | Read-only monitor (view detail only) |
| Diseminasi (pre-review) | First gate approve/reject |
| Diseminasi (post-review) | Final decision accept/reject |
| Claim Dana | Read-only monitor |
| Pengembalian Dana | Read-only monitor |
| Luaran | No action (terminal) |

### 7.5 Diseminasi Double-Verification Chain

```
1. Ketua approves (POST /diseminasi/approve)
   → ketua_diseminasi_approved = true
   → status: "Menunggu review Staff LPPM"

2. Staff approves (POST /diseminasi/staff-decide)
   → staff_diseminasi_approved = true
   → status: "Menuggu penugasan Reviewer"

3. Staff assigns 3 reviewers (POST /penugasan/confirm-assignment)
   → status: "Menunggu hasil dari Reviewers"

4. All 3 reviewers submit (POST /review/upload × 3)
   → status: "Menunggu keputusan Ketua"

5. Ketua final decision (POST /diseminasi/final-decision)
   → accept: advance to next stage
   → reject: move to previous stage, reset flags
```

---

## 8. Claim Dana and Pengembalian Dana

### 8.1 Claim Dana Workflow (Frontend → Database)

**Step 1: Staff uploads bukti transfer**
- Frontend: `Dana/page.jsx` → `handleUploadBuktiTransfer` → `uploadBuktiTransfer(formData)`
- Backend: `DanaController@uploadBuktiTransfer`
- Validation: `laporan_id` (required), `uploaded_file` (file, max:5MB, mimes:pdf,jpg,jpeg,png)
- Guard: `role:Staff LPPM` middleware
- Database: Creates Dokumen "Bukti Transfer Klaim Dana" + DokumenVersion with `local_file_url`
- Status: `claim_dana_status = "Menunggu bukti terima"`

**Step 2: Dosen uploads bukti penerimaan**
- Frontend: `TransferProofForm.jsx` (mode="claim") → `uploadBuktiTerima(formData)`
- Backend: `DanaController@uploadBuktiTerima`
- Validation: `laporan_id` (required), `uploaded_file` (file, max:5MB, mimes:pdf,jpg,jpeg,png)
- Guard: Dosen role check (`auth()->user()->role !== 'Dosen'` → 403)
- Ownership: `findOwnedLaporan()` — verifies `proposal.user_id === auth()->id()`
- Database: Creates Dokumen "Bukti Penerimaan Klaim Dana" + DokumenVersion
- Status: `claim_dana_status = "Menunggu konfirmasi admin"`

**Step 3: Staff confirms**
- Frontend: `Dana/page.jsx` → `handleConfirmClaim` → `confirmClaimDana(formData)`
- Backend: `DanaController@confirmClaim`
- Guard: `role:Staff LPPM` middleware + `requireStaffLppm()`
- Stage check: `findLaporan()` verifies current `kode_kegiatan` is `CLAIM_DANA_*`
- Status check: `claim_dana_status === "Menunggu konfirmasi admin"`
- Auto-complete: `tryAutoCompleteClaimDana()` checks both proofs exist → `claim_dana_status = "Selesai"` → `KegiatanStage::advance()`
- Database: Updates `claim_dana_status`, `claim_dana_confirmed_at`

### 8.2 Pengembalian Dana Workflow (PkM Only)

**Step 1: Staff requests pengembalian**
- Frontend: `Dana/page.jsx` → `handleRequestPengembalian` → `requestPengembalianDana(formData)`
- Backend: `DanaController@requestPengembalian`
- Guard: `role:Staff LPPM` middleware
- Database: Updates `pengembalian_dana_status = "Menunggu Pengembalian Dana"`

**Step 2: Dosen uploads bukti pengembalian**
- Frontend: `TransferProofForm.jsx` (mode="pengembalian") → `uploadPengembalianProof(formData)`
- Backend: `DanaController@uploadPengembalianProof`
- Validation: `laporan_id` (required), `uploaded_file` (file, max:5MB, mimes:pdf,jpg,jpeg,png)
- Guard: Dosen role check + ownership
- Database: Creates Dokumen "Bukti Transfer Pengembalian" + DokumenVersion
- Status: `pengembalian_dana_status = "Menunggu konfirmasi admin"`

**Step 3: Staff confirms**
- Frontend: `Dana/page.jsx` → `handleConfirmPengembalian` → `confirmPengembalianDana(formData)`
- Backend: `DanaController@confirmPengembalian`
- Guard: `role:Staff LPPM` middleware + `requireStaffLppm()`
- Stage check: `findLaporan()` verifies `kode_kegiatan` is `PENGEMBALIAN_DANA_*`
- Status check: `pengembalian_dana_status === "Menunggu konfirmasi admin"`
- Verifies Dosen proof exists with valid `local_file_url`
- Database: Creates "Bukti Penerimaan Pengembalian" + auto-complete → advance

**Step 3 (alternative): Staff skips**
- Frontend: `Dana/page.jsx` → `handleSkipPengembalian` → `skipPengembalianDana(formData)`
- Backend: `DanaController@skipPengembalian`
- Guard: `role:Staff LPPM` + `requireStaffLppm()`
- Condition: `dana_dikembalikan === false` (cannot skip if funds were returned)
- Database: `pengembalian_dana_status = "Dilewati"`, `pengembalian_dana_skipped_reason` stored

### 8.3 Auto-Completion Condition

Both proofs must exist with valid files:

```php
// tryAutoCompleteClaimDana / tryAutoCompletePengembalianDana
$hasTransferProof = $laporan->dokumen()
    ->where('jenis_dokumen', 'Bukti Transfer ...')
    ->whereHas('versions', fn($q) => $q->where('local_file_url', '!=', '')->whereNotNull('local_file_url'))
    ->exists();

$hasReceiptProof = $laporan->dokumen()
    ->where('jenis_dokumen', 'Bukti Penerimaan ...')
    ->whereHas('versions', fn($q) => $q->where('local_file_url', '!=', '')->whereNotNull('local_file_url'))
    ->exists();

if ($hasTransferProof && $hasReceiptProof) {
    // Auto-complete: set status = "Selesai"
    // Advance: KegiatanStage::advance($laporan)
}
```

### 8.4 Idempotency Protection

- Duplicate confirm after completion → `ApiResponse::failed()` (500)
- `claim_dana_status === 'Selesai'` check prevents double-advance
- Document creation uses `firstOrCreate` to prevent duplicates

### 8.5 `dana_disetujui` Is Inert

The `dana_disetujui` boolean on Laporan does not block any workflow progression. It is only used for display/reporting purposes. Confirmed by test:

```php
test('dana_disetujui=false does not block progression', function () {
    // ... creates laporan with dana_disetajui = false
    // ... confirms pengembalian → assertOk()
    expect($laporan->pengembalian_dana_status)->toBe('Selesai');
});
```

Evidence: `prisma-server/tests/Feature/DanaTest.php`

---

## 9. Destructive and Backward Workflow

### 9.1 AuthorizationRequest Mechanism

The AuthorizationRequest implements two-person integrity for destructive actions:

```
Staff LPPM (initiates) → Pending AuthorizationRequest → Ketua LPPM (approves/denies)
```

### 9.2 Request Creation

```php
// AuthorizationRequestController@store
$request = AuthorizationRequest::create([
    'requestable_type' => $validated['requestable_type'], // Proposal or Laporan
    'requestable_id' => $validated['requestable_id'],
    'requested_by' => auth()->id(),
    'action' => $validated['action'],
    'source_stage' => $currentStage,
    'target_stage' => $targetStage,
    'reason' => $validated['reason'],
    'status' => 'Menunggu Persetujuan',
]);

// Notify Ketua LPPM
NotificationService::createForRole(
    role: 'Ketua LPPM',
    type: 'authorization.created',
    ...
);
```

### 9.3 Approval Execution

```php
// AuthorizationRequestController@authorize
if ($action === 'approve') {
    $this->executeAction($request); // Performs the actual destructive operation
    $request->update(['status' => 'Disetujui', 'reviewed_by' => auth()->id()]);
} else {
    $request->update(['status' => 'Ditolak', ...]);
    // For return actions: reset status to previous stage
}
```

### 9.4 Action Types and Implementations

| Action | Target | Operation | Result |
|--------|--------|-----------|--------|
| `delete` | Skema | Cascade delete kegiatan + skema | Hard delete |
| `delete` | KegiatanPengajuan | Hard delete | Record removed |
| `delete` | Proposal | Soft delete (set status=Ditolak) | Proposal hidden |
| `return` | Laporan | Move to previous stage + set status=Revisi | Laporan returned |
| `reject` | Proposal | Delete files, penugasan, soft delete | Full cleanup |
| `return_diseminasi` | Laporan | Move to previous stage + reset diseminasi flags | Laporan returned from diseminasi |
| `return_seleksi` | Proposal | Reset seleksi flags + status=Revisi | Proposal returned from seleksi |
| `reject_proposal` | Proposal | Delete files, penugasan, soft delete + notify Dosen | Full rejection |
| `return_proposal_for_revision` | Proposal | Status=Revisi + notify Dosen | Proposal returned for revision |
| `return_laporan_for_revision` | Laporan | Move to target_stage + status=Revisi + reset diseminasi if needed | Laporan returned for revision |

### 9.5 Backward-Stage Mappings

| Current Stage | Return Target | Action Type |
|---------------|---------------|-------------|
| DISEMINASI_* | Previous stage (PROSES_* or PUBLIKASI_*) | `return_laporan_for_revision` |
| SELEKSI_PROPOSAL | PENERIMAAN_PROPOSAL | `return_seleksi` or `return_proposal_for_revision` |

### 9.6 Safeguards

- **Laporan cannot return to Proposal:** `return_laporan_for_revision` only moves within the Laporan sequence, never to `PENERIMAAN_PROPOSAL`
- **Pending request guard:** Cannot create duplicate pending requests for same resource
- **Stage gate:** Return targets are computed from `KegiatanStage::previousKode()`
- **Diseminasi reset:** When returning from diseminasi, `ketua_diseminasi_approved` and `staff_diseminasi_approved` are reset to false

### 9.7 Normal vs. Destructive Decisions

| Scenario | Mechanism | Actor | Implementation |
|----------|-----------|-------|----------------|
| Normal Proposal approval | Direct action | Ketua LPPM | `ProposalSeleksiController@ketuaDecide` |
| Normal Diseminasi approval | Direct action | Ketua LPPM | `DiseminasiController@approve`, `finalDecision` |
| Proposal rejection by Staff | AuthorizationRequest | Staff → Ketua | `createAuthorizationRequest()` → `authorizeRequest()` |
| Laporan return from Diseminasi by Staff | AuthorizationRequest | Staff → Ketua | `createAuthorizationRequest()` → `authorizeRequest()` |
| Kegiatan deletion | AuthorizationRequest | Staff → Ketua | `createAuthorizationRequest()` → `authorizeRequest()` |

---

## 10. Database and Model Relationship Inventory

### 10.1 Core Entities

| Table | Model | PK | Key Foreign Keys | Relationships | Purpose | Migration |
|-------|-------|----|------------------|---------------|---------|-----------|
| `users` | `User` | `id` | `prodi_id` → prodi | belongsTo Prodi, hasOne PenelitiDetail, hasOne ScholarProfile | Pengguna sistem | `0001_01_01_000000` |
| `skema` | `Skema` | `skema_id` | — | hasMany KegiatanPengajuan | Skema penelitian | `2026_03_02_142514` |
| `kegiatan_pengajuan` | `KegiatanPengajuan` | `kegiatan_id` | `skema_id` → skema | belongsTo Skema, morphMany Dokumen | Kegiatan pengajuan per semester | `2026_03_02_142515` (renamed) |
| `proposal` | `Proposal` | `proposal_id` | `user_id` → users, `kegiatan_id` → kegiatan_pengajuan | belongsTo User, belongsTo KegiatanPengajuan, morphMany Dokumen, hasMany PenugasanReviewer, hasMany Laporan, hasMany ProposalMember | Proposal penelitian/PkM | `2026_03_28_092436` |
| `proposal_member` | `ProposalMember` | `prop_member_id` | `proposal_id` → proposal, `member_id` (polymorphic) | belongsTo User/Mahasiswa/Kolaborator | Anggota proposal | `2026_04_28_120319` |
| `laporan` | `Laporan` | `laporan_id` | `proposal_id` → proposal, `kegiatan_id` → kegiatan_pengajuan | belongsTo Proposal, belongsTo KegiatanPengajuan, morphMany Dokumen, hasMany LogbookPengerjaan, hasMany LaporanMember, hasMany RealisasiAnggaran, hasMany Sitasi | Laporan kemajuan | `2026_05_29_013117` |
| `laporan_member` | `LaporanMember` | `laporan_member_id` | `laporan_id` → laporan, `member_id` (polymorphic) | belongsTo User/Mahasiswa/Kolaborator | Anggota laporan | `2026_08_12_000003` |
| `dokumen` | `Dokumen` | `dokumen_id` | `documentable_id`, `documentable_type` (polymorphic) | morphTo (Proposal/Laporan/KegiatanPengajuan), hasMany DokumenVersion, belongsTo DokumenVersion (current) | Container dokumen | `2026_03_28_094542` |
| `dokumen_version` | `DokumenVersion` | `version_id` | `dokumen_id` → dokumen, `uploaded_by` → users | belongsTo Dokumen, belongsTo User | Versi dokumen | `2026_05_28_112542` |
| `penugasan_reviewer` | `PenugasanReviewer` | `penugasan_id` | `reviewable_id`, `reviewable_type` (polymorphic), `user_id` → users, `proposal_id` → proposal | morphTo (Proposal/Laporan), belongsTo User, hasOne Review | Penugasan reviewer | `2026_04_14_123354` |
| `review` | `Review` | `review_id` | `penugasan_id` → penugasan_reviewer | belongsTo PenugasanReviewer | Hasil penilaian | `2026_05_13_061044` |
| `authorization_requests` | `AuthorizationRequest` | `id` | `requestable_id`, `requestable_type` (polymorphic), `requested_by` → users, `reviewed_by` → users | morphTo (Proposal/Laporan), belongsTo User (requester), belongsTo User (reviewer) | Otorisasi tindakan destruktif | `2026_08_09_000003` |
| `notifications` | `Notification` | `notification_id` | `user_id` → users | belongsTo User | Notifikasi | `2026_08_14_030000` |
| `logbook_pengerjaan` | `LogbookPengerjaan` | `logbook_id` | `laporan_id` → laporan, `user_id` → users | belongsTo Laporan, belongsTo User | Logbook kegiatan | `2026_05_29_013118` |
| `settings` | `Settings` | `id` | `kepala_lppm` → users, `rektor` → users | belongsTo User (kepala LPPM), belongsTo User (rektor) | Pengaturan sistem | `2026_04_29_092553` |
| `prodi` | `Prodi` | `prodi_id` | `kaprodi_id` → users | belongsTo User | Program studi | `0000_00_00_000000` |
| `mahasiswa` | `Mahasiswa` | `mhswa_id` | `prodi_id` → prodi | belongsTo Prodi | Data mahasiswa | `2026_04_29_092644` |
| `kolaborator` | `Kolaborator` | `kolab_id` | — | hasOne PenelitiDetail | Data kolaborator eksternal | `2026_05_07_122105` |
| `publication_categories` | `PublicationCategory` | `pub_category_id` | — | hasMany Publication | Kategori publikasi | `2026_07_12_121247` |
| `publications` | `Publication` | `id` | `peneliti_detail_id` → peneliti_details, `pub_category_id` → publication_categories | belongsTo PenelitiDetail, belongsTo PublicationCategory | Publikasi jurnal | `2026_06_26_044422` |
| `peneliti_details` | `PenelitiDetail` | `id` | `user_id` → users, `kolab_id` → kolaborator | belongsTo User, belongsTo Kolaborator, hasMany Publication, hasMany Book, hasMany Hki, hasMany ResearchHistory | Detail peneliti | `2026_06_26_044410` |
| `sitasi` | `Sitasi` | `sitasi_id` | `laporan_id` → laporan | belongsTo Laporan | Sitasi luaran | `2026_07_15_170000` |
| `realisasi_anggaran` | `RealisasiAnggaran` | `id` | `laporan_id` → laporan | belongsTo Laporan | Realisasi anggaran | `2026_08_12_000004` |
| `kegiatan_edit_requests` | `KegiatanEditRequest` | `id` | `kegiatan_id` → kegiatan_pengajuan, `requested_by` → users, `reviewed_by` → users, `executed_by` → users | belongsTo KegiatanPengajuan, belongsTo User (3 roles) | Otorisasi perubahan kegiatan | `2026_08_09_000002` |
| `scholar_profiles` | `ScholarProfile` | `scholar_profile_id` | `user_id` → users | belongsTo User, hasMany ScholarCitationByYear, hasMany ScholarPublication | Profil Google Scholar | `2026_08_05_000001` |
| `scholar_publications` | `ScholarPublication` | `publication_id` | `scholar_profile_id` → scholar_profiles | belongsTo ScholarProfile, hasMany ScholarPublicationCitationByYear | Publikasi scholar | `2026_08_05_000003` |
| `scholar_citations_by_year` | `ScholarCitationByYear` | `citation_id` | `scholar_profile_id` → scholar_profiles | belongsTo ScholarProfile | Sitasi per tahun | `2026_08_05_000002` |
| `scholar_publication_citations_by_year` | `ScholarPublicationCitationByYear` | `publication_citation_id` | `scholar_publication_id` → scholar_publications | belongsTo ScholarPublication | Sitasi publikasi per tahun | `2026_08_05_000004` |
| `books` | `Book` | `id` | `peneliti_detail_id` → peneliti_details | belongsTo PenelitiDetail | Buku | `2026_06_26_044430` |
| `hkis` | `Hki` | `id` | `peneliti_detail_id` → peneliti_details | belongsTo PenelitiDetail | HKI | `2026_06_26_044436` |
| `research_histories` | `ResearchHistory` | `id` | `peneliti_detail_id` → peneliti_details | belongsTo PenelitiDetail | Riwayat penelitian | `2026_06_26_044449` |

### 10.2 Polymorphic Relationships

| Entity | Morph Name | Parent Types | Evidence |
|--------|-----------|--------------|----------|
| Dokumen | `documentable` | Proposal, Laporan, KegiatanPengajuan | `dokumen_documentable_index` migration |
| PenugasanReviewer | `reviewable` | Proposal, Laporan | `reviewable_type` column, default `App\Models\Proposal` |
| AuthorizationRequest | `requestable` | Proposal, Laporan | `requestable_type` column |
| ProposalMember | `member_id` | User (Dosen), Mahasiswa, Kolaborator | `role` column determines type |

### 10.3 Cardinalities

| Relationship | Type | Description |
|-------------|------|-------------|
| Skema → KegiatanPengajuan | One-to-Many | One skema has many kegiatan |
| KegiatanPengajuan → Proposal | One-to-Many | One kegiatan has many proposals |
| Proposal → Laporan | One-to-Many | One proposal has many laporan (Ganjil + Genap) |
| Proposal → ProposalMember | One-to-Many | One proposal has many members |
| Proposal → PenugasanReviewer | One-to-Many | One proposal has many reviewer assignments |
| PenugasanReviewer → Review | One-to-One | One assignment has one review |
| Laporan → Dokumen | One-to-Many (polymorphic) | One laporan has many documents |
| Laporan → LogbookPengerjaan | One-to-Many | One laporan has many logbook entries |
| Laporan → LaporanMember | One-to-Many | One laporan has many members |
| Laporan → RealisasiAnggaran | One-to-Many | One laporan has many budget items |
| Laporan → Sitasi | One-to-Many | One laporan has many citations |
| User → PenelitiDetail | One-to-One | One user has one research detail |
| PenelitiDetail → Publication | One-to-Many | One detail has many publications |
| ScholarProfile → ScholarPublication | One-to-Many | One profile has many publications |

### 10.4 Funding Evidence Fields on Laporan

| Field | Type | Purpose |
|-------|------|---------|
| `dana_dikembalikan` | boolean | Whether funds were returned |
| `dana_disetujui` | boolean | **Inert** — does not block progression |
| `dana_disetujui_by` | FK → users | Who approved (display only) |
| `dana_disetujui_at` | timestamp | When approved (display only) |
| `claim_dana_status` | string | Claim Dana workflow status |
| `claim_dana_approved_at` | timestamp | Claim approval timestamp |
| `claim_dana_confirmed_at` | timestamp | Claim confirmation timestamp |
| `pengembalian_dana_status` | string | Pengembalian Dana workflow status |
| `pengembalian_dana_confirmed_at` | timestamp | Return confirmation timestamp |
| `pengembalian_dana_skipped_reason` | string | Skip reason (if applicable) |
| `realisasi_biaya_penelitian` | double | Realized research cost |
| `realisasi_biaya_publikasi` | double | Realized publication cost |
| `realisasi_insentif` | double | Realized incentive |

---

## 11. Class and Service Inventory

### 11.1 Controllers

| Class | Responsibility | Key Methods | Dependencies |
|-------|---------------|-------------|--------------|
| `AuthController` | Authentication | `login()`, `logout()` | `Auth`, `Session` |
| `UserController` | User CRUD | `index()`, `create()`, `update()`, `delete()` | `User`, `AvatarService` |
| `ProposalController` | Proposal listing | `index()`, `fetch()` | `Proposal` (scoped) |
| `ProposalDraftController` | Draft management | `createDraft()`, `updateDraft()` | `Proposal` (ownership) |
| `ProposalDocumentController` | Proposal upload | `prepareProposalUpload()`, `uploadProposal()` | `Dokumen`, `DocumentService` |
| `ProposalWorkflowController` | Stage transitions | `updateTahapProposal()`, `tolakProposal()` | `Proposal`, `KegiatanStage` |
| `ProposalSeleksiController` | Double-verification | `ketuaDecide()`, `staffDecide()` | `Proposal`, `NotificationService` |
| `PengumumanSuratTugasController` | SK generation | `generate()`, `upload()`, `acceptProposal()` | `PengumumanSuratTugasService` |
| `LaporanController` | Laporan operations | `index()`, `update()`, `uploadDokumen()`, `finish()`, `submitPublikasi()`, `adminDecide()` | `Laporan`, `KegiatanStage`, `DocumentService` |
| `LaporanMemberController` | Member management | `index()`, `store()`, `update()`, `destroy()`, `reorder()`, `seedFromProposal()` | `LaporanMember` |
| `RealisasiAnggaranController` | Budget items | `index()`, `store()`, `update()`, `destroy()` | `RealisasiAnggaran` |
| `PenugasanReviewerController` | Reviewer assignment | `assignReviewers()`, `confirmAssignment()` | `PenugasanReviewer`, `NotificationService` |
| `ReviewController` | Review upload | `store()` | `Review`, `PenugasanReviewer` |
| `DiseminasiController` | Diseminasi workflow | `index()`, `approve()`, `staffDecide()`, `finalDecision()` | `Laporan`, `KegiatanStage`, `NotificationService` |
| `DanaController` | Dana workflows | `index()`, `uploadBuktiTransfer()`, `uploadBuktiTerima()`, `confirmClaim()`, `requestPengembalian()`, `uploadPengembalianProof()`, `confirmPengembalian()`, `skipPengembalian()` | `Laporan`, `Dokumen`, `DocumentService`, `KegiatanStage` |
| `AuthorizationRequestController` | Destructive workflow | `index()`, `store()`, `authorize()` | `AuthorizationRequest`, `NotificationService` |
| `KegiatanEditRequestController` | Date change auth | `index()`, `store()`, `authorize()`, `execute()` | `KegiatanEditRequest`, `KegiatanPengajuan` |
| `SkemaController` | Skema CRUD | `index()`, `fetchAll()`, `store()`, `update()`, `destroy()` | `Skema` |
| `KegiatanPengajuanController` | Kegiatan CRUD | `index()`, `fetch()`, `create()`, `update()`, `delete()` | `KegiatanPengajuan` |
| `SettingsController` | System settings | `index()`, `update()`, `updateRektor()`, `updateIgnoreKegiatanDates()` | `Settings` |
| `NotificationController` | Notifications | `index()`, `unreadCount()`, `markAsRead()`, `markAllAsRead()`, `destroy()` | `Notification`, `NotificationService` |
| `DashboardController` | Dashboard data | `superadmin()`, `staff()`, `ketua()`, `dosen()`, `reviewer()` | Various models |
| `LogbookPengerjaanController` | Logbook CRUD | `index()`, `show()`, `store()`, `update()`, `destroy()`, `replaceDocument()` | `LogbookPengerjaan`, `DocumentService` |
| `SitasiController` | Citation CRUD | `index()`, `store()`, `destroy()` | `Sitasi` |
| `ScholarController` | Scholar integration | `dashboard()`, `connect()`, `sync()`, `publications()`, `publicationCitationHistory()` | `ScholarSyncService` |
| `PenelitiDetailController` | Researcher profile | `detail()`, `update()` | `PenelitiDetail` |
| `PublicationCategoryController` | Category CRUD | `fetch()`, `create()`, `update()`, `delete()` | `PublicationCategory` |
| `KetuaCriteriaController` | Assessment criteria | `index()`, `updateKriteriaPenilaian()`, `updateKesesuaianTema()` | `Settings` |
| `KolaboratorController` | Collaborator CRUD | `index()`, `fetch()`, `create()`, `update()`, `delete()` | `Kolaborator` |
| `MahasiswaController` | Student CRUD | `fetch()`, `create()`, `update()`, `delete()` | `Mahasiswa` |
| `ProdiController` | Program study CRUD | `index()`, `fetch()`, `create()`, `update()`, `delete()` | `Prodi` |
| `DosenController` | Dosen list | `index()` | `User` (role:Dosen) |
| `ReviewerController` | Reviewer list | `index()` | `User` (role:Reviewer) |

### 11.2 Helpers

| Class | Responsibility | Key Methods |
|-------|---------------|-------------|
| `ApiResponse` | Response envelope | `success($data, $message, $code)`, `failed($message, $code)` |
| `KegiatanStage` | Stage engine | `laporanSequence()`, `advance()`, `move()`, `isOpen()`, `findKegiatan()`, `nextKode()`, `previousKode()` |
| `NotificationUrl` | Deep-link builder | `forRole()`, `laporanTab()` |

### 11.3 Services

| Class | Responsibility | Key Methods | Dependencies |
|-------|---------------|-------------|--------------|
| `DocumentService` | File management | `upload($file, $folder)`, `delete($path)`, `replace($old, $new)` | `Storage`, `Str` |
| `NotificationService` | Notification CRUD | `create()`, `createForRole()`, `createForUsers()`, `markAsRead()`, `markAllAsRead()`, `unreadCount()`, `getForUser()`, `deleteNotification()` | `Notification`, `User` |
| `AvatarService` | Avatar processing | `processUpload()`, `generateInitials()`, `delete()`, `replace()`, `ensureDefault()`, `refreshDefaultOnRename()` | `Intervention\Image`, `Storage` |
| `PengumumanSuratTugasService` | SK generation | `generate($kegiatan, $proposals, $settings)` | `TemplateProcessor` (PHPWord) |
| `ProposalDocxService` | Proposal DOCX | `generate($proposal, $members, $prodi, $settings)` | `TemplateProcessor`, `PenelitiDetail` |
| `LaporanAkhirDocxService` | Laporan DOCX | `generate($laporan, $members, $penelitiDetails, $prodi, $realisasi, $settings)` | `TemplateProcessor` |
| `ScholarSyncService` | Scholar sync | `syncProfile($user)`, `fetchPublications($scholarId)` | `SerpApiProvider` or `GoogleScholarProvider` |

### 11.4 API Resources

| Resource | Purpose |
|----------|---------|
| `UserResource` | Transform User model |
| `DosenResource` | Transform Dosen data for dropdowns |
| `ReviewerResource` | Transform Reviewer data for dropdowns |
| `KegiatanPengajuanResource` | Transform Kegiatan data |
| `DokumenResource` | Transform Dokumen with version info |
| `KolaboratorResource` | Transform Kolaborator data |
| `MahasiswaResource` | Transform Mahasiswa data |
| `ProdiResource` | Transform Prodi data |
| `LogbookPengerjaanResource` | Transform Logbook data |
| `ScholarProfileResource` | Transform Scholar profile |
| `ScholarPublicationResource` | Transform Scholar publications |
| `Admin/ProposalAdminResource` | Transform Proposal for admin view (with penugasan, dosen, kegiatan) |
| `Dosen/LaporanDosenResource` | Transform Laporan for Dosen view |
| `Dosen/ProposalDosenResource` | Transform Proposal for Dosen view |
| `Dosen/ProposalUploadResource` | Transform Proposal for upload view |
| `Reviewer/ProposalReviewerResource` | Transform Proposal for reviewer view |

### 11.5 Middleware

| Class | Responsibility | Usage |
|-------|---------------|-------|
| `CheckRole` | Role-based authorization | `middleware('role:RoleName1,RoleName2')` — variadic, OR logic |

---

## 12. Frontend Architecture

### 12.1 Routing Structure

Next.js App Router with role-based module system:

| Route | Component | Access |
|-------|-----------|--------|
| `/login` | `login/page.jsx` | Public |
| `/dashboard` | `dashboard/page.jsx` | Authenticated (role-filtered modules) |
| `/dashboard?module=home` | `Home/page.jsx` | All roles |
| `/dashboard?module=users` | `Admin/Users/page.jsx` | Superadmin |
| `/dashboard?module=prodi` | `Admin/Prodi/page.jsx` | Superadmin |
| `/dashboard?module=pengaturan` | `Admin/Pengaturan/page.jsx` | Superadmin |
| `/dashboard?module=staffmonitoringprogress` | `Admin/MonitoringPengajuan/page.jsx` | Staff LPPM, Ketua LPPM |
| `/dashboard?module=staffmonitoringprogresslaporan` | `Admin/MonitoringPengajuan/page.jsx` | Staff LPPM, Ketua LPPM |
| `/dashboard?module=mahasiswa` | `Admin/Mahasiswa/page.jsx` | Superadmin |
| `/dashboard?module=kolaborator` | `Admin/Kolaborator/page.jsx` | Staff LPPM |
| `/dashboard?module=ketuaskema` | `Admin/Skema/page.jsx` | Ketua LPPM |
| `/dashboard?module=ketuakegiatan` | `Admin/Skema/Kegiatan/page.jsx` | Ketua LPPM |
| `/dashboard?module=ketuacriteria` | `Ketua/Criteria/page.jsx` | Staff LPPM |
| `/dashboard?module=ketuapengaturan` | `Ketua/Pengaturan/page.jsx` | Ketua LPPM |
| `/dashboard?module=dosenmonitoringprogress` | `Dosen/MonitoringPengajuan/Proposal/page.jsx` | Dosen |
| `/dashboard?module=dosenmonitoringprogresslaporan` | `Dosen/MonitoringPengajuan/Laporan/page.jsx` | Dosen |
| `/dashboard?module=profildosen` | `Dosen/Profil/page.jsx` | Dosen |
| `/dashboard?module=dosenscholar` | `Dosen/GoogleScholar/page.jsx` | Dosen |
| `/dashboard?module=reviewproposal` | `Reviewer/Review/page.jsx` | Reviewer |
| `/dashboard?module=notifications` | `Notification/page.jsx` | All (hidden, deep-linked) |

Evidence: `prisma/src/app/component/Libraries/utils/menu.js:31-422`

### 12.2 Dashboard/Module Selection

Module system implemented in `dashboard/page.jsx`:

1. `dashboardModules` array filtered by `user.role`
2. Hidden modules excluded from sidebar
3. First allowed module is default
4. `window.history.replaceState` for module switching (no re-renders)
5. Dynamic `<ActiveComponent>` rendered from `activeModule.component`

### 12.3 State Management

**Zustand stores:**

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `useUserStore` | localStorage (persist) | User auth state, session management |
| `useNotificationStore` | None (ephemeral) | Notification count, list, UI state |
| `useLoaderStore` | None (ephemeral) | Loading animation, progress |

**Component-local state:** All page-level UI state (modals, forms, filters, tabs) managed via `useState`.

### 12.4 API Client Structure

- Base instance: `api` (axios) — `NEXT_PUBLIC_URL + '/api'`
- CSRF interceptor reads `XSRF-TOKEN` cookie
- Response interceptor handles 401/419 → auto-logout
- 22 domain-specific API modules in `component/Libraries/api/`
- ~95 exported functions total

### 12.5 Protected Routes

Client-side auth guard in `dashboard/layout.jsx`:

1. Check `useUserStore.hasHydrated`
2. If no user + no sessionExpired + no justLoggedOut → instant `/login` redirect
3. If sessionExpired or justLoggedOut → animated loader redirect
4. If user present → render children

### 12.6 Role-Based Module Rendering

```javascript
// menu.js
dashboardModules.filter(module =>
    module.roles.some(r => r.name === user.role && !module.hidden)
)
```

Each module defines per-role access: `{ create, read, update, delete }`.

### 12.7 Table/Form/Modal Patterns

**Table:** `CustomTable` component with:
- `fetchMethod` (API function)
- `searchQuery` (query string)
- `refreshKey` (trigger refetch)
- `rowActions` (context menu items)
- `columns` (column definitions with render functions)

**Form:** `useFormSubmission` hook provides:
- `loading` state
- `submit(apiCall, options)` — double-submit guard, 422 validation parsing, toast integration

**Modal:** `AnimatePresence` wrapping with:
- `close('all')` closes all modals
- `close('this')` closes current
- `ConfirmModal`, `FormModal` variants

### 12.8 Notification Handling

- Bell icon in navbar with unread count badge
- `useNotificationStore` for state
- `getUnreadCount()` polled on mount
- `addNotification()` via WebSocket/polling (implementation varies)
- `markAsRead()`, `markAllAsRead()`, `deleteNotification()` API calls
- Deep-link URLs via `NotificationUrl::forRole()` navigate to relevant module

### 12.9 Document Upload/Download

- Drag-and-drop file zones (`TransferProofForm`, `TerimaProposalForm`)
- File validation: type (PDF/JPG/PNG), size (5-10MB)
- `FormData` with `uploaded_file` key
- Download via `local_file_url` or `drive_file_url` links
- `DocumentService::upload()` generates slugified filename + UUID fragment

---

## 13. Backend Architecture

### 13.1 Route Organization

All routes in `routes/api.php` wrapped in `auth:sanctum` middleware:

| Group | Prefix | Middleware | Count |
|-------|--------|-----------|-------|
| Dashboard | `/dashboard` | `role:RoleName` | 5 routes |
| Users | `/users` | Mixed | 6 routes |
| Reviewer/Dosen | `/reviewer`, `/dosen` | None (read-only) | 2 routes |
| Mahasiswa | `/mahasiswa` | Mixed | 4 routes |
| Kolaborator | `/kolaborator` | Mixed | 5 routes |
| Prodi | `/prodi` | Mixed | 5 routes |
| Proposal | `/proposal` | Mixed (nested) | 12 routes |
| Laporan | `/laporan` | Mixed | 16 routes |
| Diseminasi | `/diseminasi` | Mixed | 4 routes |
| Dana | `/dana` | Mixed | 8 routes |
| Sitasi | `/sitasi` | Dosen (ownership) | 3 routes |
| Logbook | `/logbook_pengerjaan` | Dosen (ownership) | 7 routes |
| Skema | `/skema` | Mixed | 6 routes |
| Kegiatan | `/kegiatan` | Mixed | 6 routes |
| KegiatanEditRequest | `/kegiatan-edit-request` | Mixed | 4 routes |
| AuthorizationRequest | `/authorization-request` | Mixed | 3 routes |
| Criteria | `/criteria` | Staff LPPM | 3 routes |
| Penugasan | `/penugasan` | Staff LPPM | 2 routes |
| Review | `/review` | Reviewer (ownership) | 1 route |
| Settings | `/settings` | Mixed | 7 routes |
| PenelitiDetail | `/peneliti-detail` | Dosen (ownership) | 2 routes |
| PublicationCategory | `/publication-category` | Mixed | 4 routes |
| Scholar | `/scholar` | Dosen | 5 routes |
| Notifications | `/notifications` | All (ownership) | 5 routes |

### 13.2 Controller Organization

Root controllers (28) handle most modules. Proposal sub-controllers (6) in `Controllers/Proposal/` namespace handle proposal-specific operations.

### 13.3 Service/Helper Layer

| Layer | Pattern |
|-------|---------|
| Helpers | Stateless utility classes (ApiResponse, KegiatanStage, NotificationUrl) |
| Services | Stateful classes with injected dependencies (DocumentService, NotificationService) |
| Controllers | Orchestrate models + services, handle HTTP |

### 13.4 API Resources

16 resource classes transform Eloquent models for JSON responses. Sub-namespaced by role: `Admin/`, `Dosen/`, `Reviewer/`.

### 13.5 Validation

- Request validation via `$request->validate()` in controllers
- File validation: `file`, `max:N`, `mimes:type1,type2`
- Enum validation: `in:val1,val2`
- Unique validation: `unique:table,column`
- Existence validation: `exists:table,column`

### 13.6 Transactions

Critical operations use `DB::transaction()`:
- `DanaController@uploadPengembalianProof` — file upload + status update
- `DanaController@confirmPengembalian` — receipt upload + auto-complete + advance
- `ReviewController@store` — review creation + penugasan update + completion check
- `AuthorizationRequestController@authorize` — action execution + status update

### 13.7 Authorization Guards

| Pattern | Implementation |
|---------|---------------|
| Route middleware | `role:RoleName` via `CheckRole` |
| Ownership | `findOwnedLaporan()`, `findOwnedProposal()` — `where('user_id', auth()->id())` |
| Stage gate | `KegiatanStage::isOpen()` — checks kegiatan dates + skema status |
| Pending guard | `AuthorizationRequest::where('status', 'Menunggu...')->exists()` |
| Reviewer lock | `status_review === 'Telah direview'` blocks changes |

### 13.8 Document Storage and Versioning

- Storage: Laravel `public` disk
- Path: `documents/{folder}/{slugified_name}_{timestamp}_{uuid8}.{ext}`
- Versioning: `Dokumen` → `DokumenVersion` (one-to-many)
- Current version: `Dokumen.current_version_id` → `DokumenVersion.version_id`
- Polymorphic: `Dokumen.documentable` → Proposal, Laporan, or KegiatanPengajuan

### 13.9 Stage Transition Implementation

Stage transitions are implemented by repointing `kegiatan_id`:

```php
// KegiatanStage::advance($record)
$current = self::currentKode($record);    // Read current kode via kegiatan relation
$next = self::nextKode($current, $record); // Find next in sequence
self::move($record, $next);               // Update kegiatan_id to target
```

No parallel state is maintained — the stage is derived entirely from `kegiatan_id → kode_kegiatan`.

---

## 14. Diagram Specifications

### 14.1 System Architecture Diagram

**Title:** Arsitektur Sistem PRISMA
**Purpose:** Menunjukkan komponen sistem dan interaksi antar layer
**Type:** Component Diagram

**Nodes:**
- Browser (Next.js Frontend)
- Laravel Backend (API Server)
- MariaDB (Database)
- Public Disk (File Storage)
- External APIs (Google Scholar/SerpAPI)

**Relationships:**
```
Browser → HTTP/HTTPS → Laravel Backend
Laravel Backend → SQL → MariaDB
Laravel Backend → File I/O → Public Disk
Laravel Backend → HTTP → External APIs
```

**Source Files:** `next.config.mjs`, `routes/api.php`, `config/database.php`, `config/sanctum.php`

### 14.2 Use Case Diagram

**Title:** Use Case Diagram PRISMA
**Purpose:** Menunjukkan aktor dan use case utama

**Actors & Use Cases:**

| Actor | Use Cases |
|-------|-----------|
| Superadmin | Kelola Pengguna, Kelola Prodi, Kelola Pengaturan, Kelola Kategori Publikasi |
| Staff LPPM | Monitoring Progress, Proses Proposal, Penugasan Reviewer, Proses Diseminasi, Proses Dana, Kelola Kolaborator, Kelola Kriteria |
| Ketua LPPM | Keputusan Seleksi Proposal, Keputusan Diseminasi, Otorisasi Tindakan Destruktif, Kelola Skema, Kelola Kegiatan |
| Dosen | Buat Proposal, Upload Proposal, Update Laporan, Upload Dokumen, Kelola Logbook, Submit Publikasi, Upload Bukti Dana |
| Reviewer | Tinjau Proposal, Tinjau Laporan, Upload Penilaian |

### 14.3 Entity Relationship Diagram (ERD)

**Title:** ERD PRISMA
**Purpose:** Menunjukkan entitas database dan hubungannya

**Core Entities:** Skema, KegiatanPengajuan, Proposal, ProposalMember, Laporan, LaporanMember, Dokumen, DokumenVersion, PenugasanReviewer, Review, AuthorizationRequest, Notification, User, Prodi, Mahasiswa, Kolaborator, Settings, LogbookPengerjaan, RealisasiAnggaran, Sitasi, PenelitiDetail, Publication, PublicationCategory, ScholarProfile, ScholarPublication

**Key Relationships (see Section 10.3 for complete list):**
- Skema 1:N KegiatanPengajuan
- KegiatanPengajuan 1:N Proposal
- Proposal 1:N Laporan
- Proposal 1:N ProposalMember
- Proposal 1:N PenugasanReviewer
- PenugasanReviewer 1:1 Review
- Laporan 1:N Dokumen (polymorphic)
- Laporan 1:N LogbookPengerjaan
- Laporan 1:N RealisasiAnggaran
- Laporan 1:N Sitasi
- User 1:1 PenelitiDetail
- PenelitiDetail 1:N Publication
- User 1:1 ScholarProfile

### 14.4 Logical Record Structure

ERD sudah mencakup struktur logis. Tidak ada perbedaan material.

### 14.5 Class Diagram

**Title:** Class Diagram PRISMA
**Purpose:** Menunjukkan struktur kelas backend

**Key Classes (see Section 11 for complete list):**
- Controllers (34)
- Models (31)
- Services (7)
- Helpers (3)
- API Resources (16)
- Middleware (1)

**Key Relationships:**
- Controller → uses → Service
- Controller → uses → Helper
- Service → uses → Model
- Model → hasMany/belongsTo/morphMany → Model
- Controller → returns → ApiResponse

### 14.6 Proposal Activity Diagram

**Title:** Activity Diagram Alur Proposal
**Purpose:** Menunjukkan alur aktivitas proposal dari awal hingga diterima

**Key Decisions:**
- Ketua accept vs reject (Seleksi)
- Staff accept vs reject vs return (Seleksi)
- All 3 reviewers complete?
- Ketua accept vs reject (Final)

**Source:** Section 5.1, `ProposalSeleksiController`, `ProposalWorkflowController`, `PengumumanSuratTugasController`

### 14.7 Reviewer Assessment Activity Diagram

**Title:** Activity Diagram Penilaian Reviewer
**Purpose:** Menunjukkan proses penilaian oleh reviewer

**Steps:**
1. Staff assigns 3 reviewers
2. Each reviewer views assigned item
3. Each reviewer opens PenilaianForm
4. Each reviewer fills kriteria, keputusan, catatan
5. Each reviewer submits
6. System checks: all 3 complete?
7. If yes: advance status

**Source:** `ReviewController@store`, `PenugasanReviewerController@confirmAssignment`

### 14.8 Penelitian Laporan Activity Diagram

**Title:** Activity Diagram Laporan Penelitian
**Purpose:** Menunjukkan alur laporan penelitian

**Sequence:**
Proses Penelitian → Publikasi → Diseminasi → Claim Dana → Luaran

**Source:** `KegiatanStage::laporanSequence('Penelitian', $sem)`

### 14.9 PkM Laporan Activity Diagram

**Title:** Activity Diagram Laporan PkM
**Purpose:** Menunjukkan alur laporan PkM

**Sequence:**
Claim Dana → Proses PkM → Publikasi → Pengembalian Dana → Diseminasi → Luaran PkM

**Source:** `KegiatanStage::laporanSequence('PkM', $sem)`

### 14.10 AuthorizationRequest Activity Diagram

**Title:** Activity Diagram Alur Otorisasi Destruktif
**Purpose:** Menunjukkan alur permintaan otorisasi

**Steps:**
1. Staff identifies destructive action needed
2. Staff creates AuthorizationRequest
3. System creates pending request
4. System notifies Ketua LPPM
5. Ketua reviews request
6. Ketua approves → executeAction() → notify Staff
7. Ketua denies → update status → notify Staff

**Source:** `AuthorizationRequestController@store`, `AuthorizationRequestController@authorize`

### 14.11 Claim Dana Sequence Diagram

**Title:** Sequence Diagram Claim Dana
**Purpose:** Menunjukkan interaksi sequence untuk klaim dana

**Participants:** Staff LPPM, Dosen, Frontend, Backend, Database, Storage

**Sequence:**
```
Staff → Frontend: Upload bukti transfer
Frontend → Backend: POST /dana/claim/upload-bukti-transfer
Backend → Storage: Store file
Backend → Database: Create Dokumen + DokumenVersion
Backend → Database: Update claim_dana_status = "Menunggu bukti terima"
Backend → Frontend: Success response
Frontend → Staff: Status updated

Dosen → Frontend: Upload bukti terima
Frontend → Backend: POST /dana/claim/upload-bukti-terima
Backend → Storage: Store file
Backend → Database: Create Dokumen + DokumenVersion
Backend → Database: Update claim_dana_status = "Menunggu konfirmasi admin"
Backend → Frontend: Success response

Staff → Frontend: Confirm claim
Frontend → Backend: POST /dana/claim/confirm
Backend → Database: Verify both proofs exist
Backend → Database: Update claim_dana_status = "Selesai"
Backend → Backend: KegiatanStage::advance()
Backend → Database: Update kegiatan_id
Backend → Frontend: Success response
```

### 14.12 Pengembalian Dana Sequence Diagram

**Title:** Sequence Diagram Pengembalian Dana
**Purpose:** Menunjukkan interaksi sequence untuk pengembalian dana (PkM)

**Sequence:**
```
Staff → Frontend: Request pengembalian
Frontend → Backend: POST /dana/pengembalian/request
Backend → Database: Update pengembalian_dana_status = "Menunggu Pengembalian Dana"

Dosen → Frontend: Upload bukti pengembalian
Frontend → Backend: POST /dana/pengembalian/upload-proof
Backend → Storage: Store file
Backend → Database: Create Dokumen + DokumenVersion
Backend → Database: Update pengembalian_dana_status = "Menunggu konfirmasi admin"

Staff → Frontend: Confirm + upload bukti penerimaan
Frontend → Backend: POST /dana/pengembalian/confirm
Backend → Storage: Store receipt file
Backend → Database: Create receipt Dokumen + DokumenVersion
Backend → Database: Verify Dosen proof exists
Backend → Database: Update pengembalian_dana_status = "Selesai"
Backend → Backend: KegiatanStage::advance()
Backend → Database: Update kegiatan_id
```

### 14.13 Deployment Diagram

**Title:** Deployment Diagram PRISMA
**Purpose:** Menunjukkan infrastruktur deployment

**Nodes:**
- Client (Browser)
- Application Server (Node.js/Next.js + PHP/Laravel)
- Database Server (MariaDB)
- File Storage (Local/public disk)
- External APIs (Google Scholar)

**Note:** Untuk deployment production, perlu dipertimbangkan:
- Reverse proxy (Nginx/Apache)
- Queue worker (Laravel Queue for SyncScholarProfile)
- Session storage (database/cache)
- File storage (S3-compatible for scalability)

---

## 15. Interface Screenshot Checklist

### 15.1 Superadmin

| # | Module | Page/State | Action | Caption | Related Requirement |
|---|--------|-----------|--------|---------|---------------------|
| 1 | Users | User list with pagination | View list | "Daftar Pengguna dengan Paginasi" | FR-001 |
| 2 | Users | Add user form | Create user | "Form Tambah Pengguna" | FR-002 |
| 3 | Users | Edit user form | Update user | "Form Edit Pengguna" | FR-003 |
| 4 | Prodi | Prodi list | View list | "Daftar Program Studi" | FR-004 |
| 5 | Settings | Settings page | Update settings | "Pengaturan Umum Sistem" | FR-005 |
| 6 | Kategori Publikasi | Category list | View list | "Daftar Kategori Publikasi" | FR-006 |

### 15.2 Staff LPPM

| # | Module | Page/State | Action | Caption | Related Requirement |
|---|--------|-----------|--------|---------|---------------------|
| 7 | Monitoring | Skema selection | Select skema | "Pemilihan Skema Penelitian" | FR-007 |
| 8 | Proposal | Proposal list (Seleksi tab) | View with reviewer status | "Monitoring Seleksi Proposal" | FR-008 |
| 9 | Proposal | Penugasan reviewer form | Assign 3 reviewers | "Form Penugasan Reviewer" | FR-009 |
| 10 | Laporan | Laporan list (Diseminasi tab) | View with approval badges | "Monitoring Diseminasi Laporan" | FR-010 |
| 11 | Dana | Dana list (Claim tab) | Upload bukti transfer | "Upload Bukti Transfer Klaim Dana" | FR-011 |
| 12 | Authorization | Authorization queue | Approve/deny request | "Antrian Otorisasi Destruktif" | FR-012 |
| 13 | Kolaborator | Kolaborator list | CRUD | "Manajemen Kolaborator" | FR-013 |
| 14 | Kriteria | Kriteria penilaian | Update kriteria | "Pengaturan Kriteria Penilaian" | FR-014 |

### 15.3 Ketua LPPM

| # | Module | Page/State | Action | Caption | Related Requirement |
|---|--------|-----------|--------|---------|---------------------|
| 15 | Monitoring | Proposal list (Pengajuan tab) | First-gate approve | "Keputusan Seleksi Proposal oleh Ketua" | FR-015 |
| 16 | Monitoring | Laporan list (Diseminasi tab) | First-gate approve | "Keputusan Diseminasi oleh Ketua" | FR-016 |
| 17 | Monitoring | Laporan list (Diseminasi tab, post-review) | Final decision | "Keputusan Akhir Laporan oleh Ketua" | FR-017 |
| 18 | Skema | Skema list | CRUD skema | "Manajemen Skema Penelitian" | FR-018 |
| 19 | Kegiatan | Kegiatan list | CRUD kegiatan | "Manajemen Kegiatan Pengajuan" | FR-019 |
| 20 | Authorization | Authorization queue | Approve request | "Otorisasi Tindakan Destruktif" | FR-020 |

### 15.4 Dosen

| # | Module | Page/State | Action | Caption | Related Requirement |
|---|--------|-----------|--------|---------|---------------------|
| 21 | Proposal | Proposal list (Draft) | Create proposal | "Pembuatan Proposal Baru" | FR-021 |
| 22 | Proposal | Proposal list (Menunggu upload) | Upload proposal | "Upload Dokumen Proposal" | FR-022 |
| 23 | Laporan | Laporan list (Proses tab) | Finish report | "Penyelesaian Laporan Kemajuan" | FR-023 |
| 24 | Laporan | Laporan list (Publikasi tab) | Submit publikasi | "Submit Publikasi Jurnal" | FR-024 |
| 25 | Laporan | Laporan list (Claim Dana tab) | Upload bukti terima | "Upload Bukti Penerimaan Klaim Dana" | FR-025 |
| 26 | Laporan | Laporan list (Pengembalian Dana tab) | Upload bukti pengembalian | "Upload Bukti Pengembalian Dana" | FR-026 |
| 27 | Logbook | Logbook list | CRUD logbook | "Manajemen Logbook Kegiatan" | FR-027 |
| 28 | Scholar | Scholar dashboard | Connect/sync | "Integrasi Google Scholar" | FR-028 |

### 15.5 Reviewer

| # | Module | Page/State | Action | Caption | Related Requirement |
|---|--------|-----------|--------|---------|---------------------|
| 29 | Review | Proposal list | Start assessment | "Daftar Proposal untuk Ditinjau" | FR-029 |
| 30 | Review | Penilaian form | Fill kriteria + submit | "Form Penilaian Reviewer" | FR-030 |
| 31 | Review | Laporan list | Start assessment | "Daftar Laporan untuk Ditinjau" | FR-031 |
| 32 | Isolation | Cannot view unassigned | Data isolation | "Isolasi Data Reviewer" | FR-032 |

---

## 16. Black Box Testing Traceability

### 16.1 Playwright E2E Tests

| Role | Specs | Tests | Status |
|------|-------|-------|--------|
| Staff LPPM | 12 spec files | 60 | All passed |
| Dosen | 20 spec files | 93 | All passed |
| Ketua LPPM | 10 spec files | 59 | All passed |
| Reviewer | 6 spec files | 37 | 36 passed, 1 skipped |
| Superadmin | 11 spec files | 60 | All passed |
| **Total** | **59 spec files** | **309** | **308 passed, 1 skipped** |

**Skipped scenario:** `RV-PKM-PROP-MUT-001`
- Reason: Required PkM Proposal fixture is intentionally absent
- Fixture/data-state limitation, not an application bug

### 16.2 Backend Pest Tests (DanaTest)

| # | Test | Assertions |
|---|------|-----------|
| 1 | Dosen cannot upload return proof before status initialized | 1 |
| 2 | Dosen can upload return proof when status initialized | 3 |
| 3 | Dosen upload alone does not advance stage | 1 |
| 4 | confirmPengembalian rejects without file | 1 |
| 5 | confirmPengembalian stores actual file | 3 |
| 6 | confirmPengembalian rejects without dosen proof | 1 |
| 7 | Non-staff cannot confirm pengembalian | 1 |
| 8 | Both proofs cause automatic completion | 4 |
| 9 | Duplicate upload does not advance twice | 1 |
| 10 | Empty placeholder never created for skip | 1 |
| 11 | Claim dana auto-completes normally | 5 |
| 12 | Ketua can view but cannot mutate | 4 |
| 13 | dana_disetajui=false does not block | 1 |
| 14 | skipPengembalian works for zero-fund | 3 |
| 15 | skipPengembalian rejects when dana_dikembalikan=true | 1 |
| 16 | requestPengembalian works for backward compatibility | 1 |
| **Total** | **16 tests** | **42 assertions, all passed** |

### 16.3 Combined Test Summary

| Layer | Tool | Count | Status |
|-------|------|-------|--------|
| Frontend E2E | Playwright | 309 | 308 passed, 1 skipped |
| Backend API | Pest | 16 | All passed |
| **Grand Total** | | **325** | **324 passed, 1 skipped, 0 failed** |

---

## 17. Verified Iteration Evidence

### 17.1 Polymorphic MorphMap Conflict

| Attribute | Detail |
|-----------|--------|
| **Problem** | MorphMap conflict between Proposal and Laporan polymorphic relationships |
| **Affected Component** | `Dokumen`, `PenugasanReviewer`, `AuthorizationRequest` models |
| **Correction** | Explicit morphMap registration in `AppServiceProvider` or model boot |
| **Test** | DanaTest: document creation with polymorphic types |
| **Result** | All polymorphic relationships function correctly |
| **Supporting Files** | `app/Models/Dokumen.php`, `app/Models/PenugasanReviewer.php` |

### 17.2 Reviewer Laporan Eager Loading

| Attribute | Detail |
|-----------|--------|
| **Problem** | Reviewer Laporan data not eagerly loaded, causing N+1 queries |
| **Affected Component** | `LaporanController@index`, `ReviewController@store` |
| **Correction** | Added eager loading for `penugasan.reviewer` relationship |
| **Test** | Playwright: reviewer sees assigned laporans with reviewer info |
| **Result** | Proper eager loading, no N+1 issues |
| **Supporting Files** | `app/Http/Controllers/LaporanController.php`, `app/Http/Resources/Dosen/LaporanDosenResource.php` |

### 17.3 AuthorizationRequest Model-Type Inconsistencies

| Attribute | Detail |
|-----------|--------|
| **Problem** | AuthorizationRequest `requestable_type` inconsistent between controller and model |
| **Affected Component** | `AuthorizationRequestController@store` |
| **Correction** | Standardized type strings to match morphMap convention |
| **Test** | Playwright: Staff creates auth request, Ketua sees it in queue |
| **Result** | Correct type resolution for both Proposal and Laporan |
| **Supporting Files** | `app/Http/Controllers/AuthorizationRequestController.php`, `app/Models/AuthorizationRequest.php` |

### 17.4 AuthorizationRequest Controller Defects

| Attribute | Detail |
|-----------|--------|
| **Problem** | Controller defects in approve/deny logic, missing notification, incomplete action execution |
| **Affected Component** | `AuthorizationRequestController@authorize` |
| **Correction** | Fixed executeAction(), added notification to Staff, fixed deny behavior for return actions |
| **Test** | Playwright: Ketua approves/rejects authorization requests |
| **Result** | Complete approve/deny cycle with notifications |
| **Supporting Files** | `app/Http/Controllers/AuthorizationRequestController.php` |

### 17.5 Pending/Approve/Deny Destructive Workflow

| Attribute | Detail |
|-----------|--------|
| **Problem** | Pending state not properly blocking duplicate requests |
| **Affected Component** | `AuthorizationRequestController@store` |
| **Correction** | Added check for existing pending request before creation |
| **Test** | Playwright: duplicate request prevention |
| **Result** | Only one pending request per resource at a time |
| **Supporting Files** | `app/Http/Controllers/AuthorizationRequestController.php` |

### 17.6 Normal Ketua Proposal Approval

| Attribute | Detail |
|-----------|--------|
| **Problem** | Ketua approval at Seleksi not properly advancing status |
| **Affected Component** | `ProposalSeleksiController@ketuaDecide` |
| **Correction** | Fixed status transition and notification |
| **Test** | Playwright: Ketua approves proposal in Seleksi tab |
| **Result** | Status correctly advances to "Menunggu review Staff LPPM" |
| **Supporting Files** | `app/Http/Controllers/Proposal/ProposalSeleksiController.php` |

### 17.7 Exactly-Three-Reviewer Validation

| Attribute | Detail |
|-----------|--------|
| **Problem** | Reviewer count validation not enforced |
| **Affected Component** | `PenugasanReviewerController@assignReviewers`, `confirmAssignment` |
| **Correction** | Added `count($validated['reviewer_id']) !== 3` check |
| **Test** | Playwright: Staff assigns exactly 3 reviewers |
| **Result** | Exactly 3 reviewers required, error on wrong count |
| **Supporting Files** | `app/Http/Controllers/PenugasanReviewerController.php` |

### 17.8 Claim Dana and Pengembalian Dana Correction

| Attribute | Detail |
|-----------|--------|
| **Problem** | Multiple defects: missing file storage, wrong status updates, auto-complete not triggering, missing role guards |
| **Affected Component** | `DanaController` (all methods) |
| **Correction** | Added DocumentService injection, fixed file upload, added Dosen role guard, fixed auto-complete check, added idempotency protection |
| **Test** | DanaTest: 16 tests, 42 assertions, all passing |
| **Result** | Complete Claim Dana and Pengembalian Dana workflows function correctly |
| **Supporting Files** | `app/Http/Controllers/DanaController.php`, `tests/Feature/DanaTest.php` |

### 17.9 Strict Ketua Read-Only Authorization

| Attribute | Detail |
|-----------|--------|
| **Problem** | Ketua could accidentally perform Staff-only mutations on Dana |
| **Affected Component** | `DanaController` methods |
| **Correction** | Added explicit `403` responses for Ketua on `confirmClaim`, `skipPengembalian`, `requestPengembalian`, `uploadPengembalianProof`, `confirmPengembalian` |
| **Test** | DanaTest #12: "ketua can view dana status but cannot mutate" — 4 assertions |
| **Result** | Ketua receives 403 on all Dana mutation endpoints |
| **Supporting Files** | `app/Http/Controllers/DanaController.php` (multiple methods) |

---

## 18. Uncertainties and Conflicts

### 18.1 Unclear Implementation

1. **`DokumenController.php` is empty** — placeholder only, no methods. Document operations handled by `LaporanController`, `DanaController`, `LogbookPengerjaanController`.

2. **`Rektorat` role in database** — Present in `role` enum (`0001_01_01_000000` migration) but not in User model constants (`ROLE_*`) or frontend role list. No dedicated routes or pages.

3. **`Ditarik` status** — Present in Proposal status enum but no controller method sets it. Possibly legacy or manual-only.

### 18.2 Unused Fields

1. **`proposal.tahap_penelitian`** — Default 'Proposal', enum 'Proposal'|'Laporan'. Not clearly used in any controller transition logic.

2. **`laporan.dana_disetajui`** — Inert boolean, does not block progression (verified by test #13).

3. **`proposal.sumber_skema`** — String field, not used in any controller validation or workflow logic.

4. **`settings.rektor`** — FK to users, but `rektor_nama`, `rektor_nidn`, `rektor_nuptk` are used instead (possibly legacy).

### 18.3 Contradictory Statuses

1. **`Menuggu penugasan Reviewer`** — Typo in laporan status enum (`Menuggu` instead of `Menunggu`). Same typo in frontend status color map. Functional but inconsistent spelling.

2. **Diseminasi approval chain complexity** — The chain involves Ketua approve → Staff approve → 3 Reviewers → Ketua final decision. This creates 4 gates for Diseminasi but only 2 for Seleksi Proposal.

### 18.4 Obsolete Routes

1. **`POST /proposal/update`** — Named `updateTahapProposal` but its primary function is `confirmAssignment` logic for proposal reviewer assignment. Name misleading.

2. **`POST /proposal/delete`** — Named `tolakProposal` (reject), not delete. Function is soft-delete with file cleanup.

### 18.5 Frontend/Backend Mismatches

1. **`TransferProofForm.jsx`** — Was calling `uploadBuktiTerima()` for both claim and pengembalian modes. Fixed to call `uploadPengembalianProof()` for pengembalian mode.

2. **`uploadPengembalianProof` backend** — Originally expected `drive_file_url` (Google Drive link), but frontend sends `uploaded_file` (file). Fixed to accept file uploads.

3. **`tryAutoCompletePengembalianDana`** — Was checking `drive_file_url` for Dosen proof. Fixed to check `local_file_url` after backend change.

### 18.6 Potential Thesis Statements Not Supported by Code

1. **"Ketua LPPM sebagai approval gate untuk Claim Dana"** — Code shows Ketua has read-only access to Dana. Staff LPPM performs all Dana mutations.

2. **"Pengembalian Dana tersedia untuk Penelitian dan PkM"** — Code shows Pengembalian Dana only in PkM sequence, not in Penelitian.

3. **"dana_disetajui sebagai mekanisme approval Ketua"** — Code shows this field is inert and does not block progression.

### 18.7 Items Requiring Confirmation

1. **Semua 16 DanaTest assertions** — Passed but only cover Dana workflow. No backend tests for Proposal, Laporan, Auth, Notifications.

2. **Playwright test skip `RV-PKM-PROP-MUT-001`** — Requires PkM Proposal fixture. Confirm if this is intentional data limitation.

3. **`Rektorat` role** — Confirm if this role should have dedicated UI/routes or is deprecated.

4. **Semester system** — Ganjil/Genap dual-semester. Confirm if both semesters can run simultaneously for same skema.

---

*Document generated from PRISMA codebase analysis — Agustus 2026*
